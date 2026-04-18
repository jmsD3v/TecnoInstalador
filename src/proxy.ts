import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { NextResponse, type NextRequest } from 'next/server'

const isDev = process.env.NODE_ENV === 'development'

// In-memory cache for custom domain → installer slug lookups
// Edge workers persist between requests on the same instance; 5-min TTL avoids stale data
const domainSlugCache = new Map<string, { slug: string | null; ts: number }>()
const DOMAIN_CACHE_TTL = 5 * 60 * 1000

async function resolveCustomDomain(host: string): Promise<string | null> {
  const cached = domainSlugCache.get(host)
  if (cached && Date.now() - cached.ts < DOMAIN_CACHE_TTL) return cached.slug

  try {
    const sb = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    )
    const { data } = await sb
      .from('custom_domains')
      .select('installer_id, verified, installers(slug)')
      .eq('domain', host)
      .eq('verified', true)
      .single()

    const inst = data?.installers as unknown as { slug: string } | null
    const slug = inst?.slug ?? null
    domainSlugCache.set(host, { slug, ts: Date.now() })
    return slug
  } catch {
    return null
  }
}

function buildCSP(nonce: string): string {
  return [
    "default-src 'self'",
    "img-src 'self' data: blob: https://*.supabase.co",
    // Nonce-based CSP: no unsafe-inline. strict-dynamic propagates trust to dynamically loaded scripts.
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ''}`,
    "style-src 'self' 'unsafe-inline'",
    "font-src 'self'",
    "connect-src 'self' https://*.supabase.co https://api.mercadopago.com wss://*.supabase.co https://*.sentry.io https://plausible.io",
    "frame-ancestors 'none'",
  ].join('; ')
}

function isAdminEmail(email: string): boolean {
  const allowed = (process.env.ADMIN_EMAILS ?? '').split(',').map(e => e.trim()).filter(Boolean)
  return allowed.includes(email)
}

export async function proxy(request: NextRequest) {
  // Custom domain routing: if host is not the main app domain, rewrite to installer profile
  const appHost = new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000').hostname
  const reqHost = request.headers.get('host')?.split(':')[0] ?? ''
  const isMainDomain = !reqHost || reqHost === appHost || reqHost === `www.${appHost}` || reqHost === 'localhost' || reqHost.endsWith('.vercel.app')
  if (!isMainDomain) {
    const slug = await resolveCustomDomain(reqHost)
    if (slug) {
      const url = request.nextUrl.clone()
      url.pathname = `/i/${slug}`
      return NextResponse.rewrite(url)
    }
    // Unknown custom domain → redirect to main site
    return NextResponse.redirect(new URL('/', process.env.NEXT_PUBLIC_APP_URL ?? '/'))
  }

  // Generate a per-request nonce for Content-Security-Policy
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64')

  // Forward nonce to Server Components via request headers (readable via headers() from next/headers)
  const headersWithNonce = new Headers(request.headers)
  headersWithNonce.set('x-nonce', nonce)

  let supabaseResponse = NextResponse.next({ request: { headers: headersWithNonce } })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // Apply cookies to a new copy of the request; preserve x-nonce in forwarded headers
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request: { headers: headersWithNonce } })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session (required by Supabase SSR to keep session alive)
  const { data: { user } } = await supabase.auth.getUser()

  // Admin routes — fail closed
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!user || !isAdminEmail(user.email ?? '')) {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  // Protect dashboard routes
  if (request.nextUrl.pathname.startsWith('/dashboard') && !user) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  // Redirect logged-in users away from auth pages
  if (
    (request.nextUrl.pathname.startsWith('/auth/login') ||
     request.nextUrl.pathname.startsWith('/auth/register')) &&
    user
  ) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Set nonce and CSP on the final response
  supabaseResponse.headers.set('x-nonce', nonce)
  supabaseResponse.headers.set('x-pathname', request.nextUrl.pathname)
  supabaseResponse.headers.set('Content-Security-Policy', buildCSP(nonce))

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|icons|images|manifest.json|sw.js).*)',
  ],
}
