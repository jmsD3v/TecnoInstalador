# TecnoInstalador — Full Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete TecnoInstalador with GSAP animations, skeleton loading states, admin dashboard, and connected flows — following security-first, sequential foundation approach.

**Architecture:** Sprint 1 (Foundation) is blocking — installs GSAP, skeletons, InstallerContext, security headers, and Zod validation. Sprint 2 (Admin) and Sprint 3 (Flows) can be executed in parallel after Sprint 1. Sprint 4 (Animations) runs last.

**Tech Stack:** Next.js 16.2.3, React 19, Tailwind v4, Supabase, MercadoPago, gsap + @gsap/react, recharts, zod, vitest

**Spec:** `docs/superpowers/specs/2026-04-12-tecnoinstalador-full-plan-design.md`

---

## Sprint 1 — Foundation

### Task 1: Vitest setup

**Files:**
- Create: `vitest.config.ts`
- Create: `src/test/setup.ts`

- [ ] Install vitest

```bash
pnpm add -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom
```

- [ ] Create `vitest.config.ts`

```ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
  },
  resolve: {
    alias: { '@': resolve(__dirname, './src') },
  },
})
```

- [ ] Create `src/test/setup.ts`

```ts
import '@testing-library/jest-dom'
```

- [ ] Add test script to `package.json` — add `"test": "vitest run"` and `"test:watch": "vitest"` to `scripts`

- [ ] Run tests (expect 0 tests, no failures)

```bash
pnpm test
```

Expected: `No test files found`

- [ ] Commit

```bash
git add vitest.config.ts src/test/setup.ts package.json
git commit -m "chore: add vitest test infrastructure"
```

---

### Task 2: Security headers in next.config.ts

**Files:**
- Modify: `next.config.ts`

- [ ] Write failing test `src/test/security-headers.test.ts`

```ts
import { describe, it, expect } from 'vitest'

// Validate that the CSP string we'll use is non-empty and contains required directives
function validateCSP(csp: string) {
  return (
    csp.includes("default-src") &&
    csp.includes("'self'") &&
    csp.includes("img-src")
  )
}

describe('security headers config', () => {
  it('CSP string contains required directives', () => {
    const csp = `default-src 'self'; img-src 'self' data: blob: https://*.supabase.co; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; font-src 'self'; connect-src 'self' https://*.supabase.co https://api.mercadopago.com; frame-ancestors 'none'`
    expect(validateCSP(csp)).toBe(true)
  })
})
```

- [ ] Run test to confirm it passes

```bash
pnpm test src/test/security-headers.test.ts
```

Expected: PASS

- [ ] Replace `next.config.ts` with the following

```ts
import type { NextConfig } from "next"

const CSP = [
  "default-src 'self'",
  "img-src 'self' data: blob: https://*.supabase.co",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self'",
  "connect-src 'self' https://*.supabase.co https://api.mercadopago.com wss://*.supabase.co",
  "frame-ancestors 'none'",
].join('; ')

const securityHeaders = [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'Content-Security-Policy', value: CSP },
]

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/sw.js',
        headers: [
          { key: 'Cache-Control', value: 'no-cache' },
          { key: 'Content-Type', value: 'application/javascript' },
        ],
      },
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ]
  },
}

export default nextConfig
```

- [ ] Start dev server and verify headers in browser DevTools → Network tab → any request → Response Headers

```bash
pnpm dev
```

Expected: `X-Frame-Options: DENY`, `Content-Security-Policy` present

- [ ] Commit

```bash
git add next.config.ts src/test/security-headers.test.ts
git commit -m "feat: add security headers (CSP, X-Frame-Options, HSTS, etc.)"
```

---

### Task 3: Zod validation schemas

**Files:**
- Create: `src/lib/validations.ts`
- Modify: `src/app/api/payments/subscribe/route.ts`
- Modify: `src/app/api/payments/cancel/route.ts`

- [ ] Install zod

```bash
pnpm add zod
```

- [ ] Write failing test `src/test/validations.test.ts`

```ts
import { describe, it, expect } from 'vitest'
import { subscribeSchema, cancelSchema, adminToggleActiveSchema, adminTogglePublicSchema } from '@/lib/validations'

describe('subscribeSchema', () => {
  it('accepts valid payload', () => {
    const result = subscribeSchema.safeParse({ planId: 'abc123', billingPeriod: 'monthly' })
    expect(result.success).toBe(true)
  })
  it('rejects missing planId', () => {
    const result = subscribeSchema.safeParse({ billingPeriod: 'monthly' })
    expect(result.success).toBe(false)
  })
  it('rejects invalid billingPeriod', () => {
    const result = subscribeSchema.safeParse({ planId: 'abc', billingPeriod: 'weekly' })
    expect(result.success).toBe(false)
  })
})

describe('cancelSchema', () => {
  it('accepts valid payload', () => {
    const result = cancelSchema.safeParse({ subscriptionId: 'sub_123' })
    expect(result.success).toBe(true)
  })
  it('rejects empty subscriptionId', () => {
    const result = cancelSchema.safeParse({ subscriptionId: '' })
    expect(result.success).toBe(false)
  })
})

describe('adminToggleActiveSchema', () => {
  it('accepts boolean is_active', () => {
    const result = adminToggleActiveSchema.safeParse({ is_active: false })
    expect(result.success).toBe(true)
  })
})

describe('adminTogglePublicSchema', () => {
  it('accepts boolean is_public', () => {
    const result = adminTogglePublicSchema.safeParse({ is_public: true })
    expect(result.success).toBe(true)
  })
})
```

- [ ] Run test to confirm it fails (validations not defined yet)

```bash
pnpm test src/test/validations.test.ts
```

Expected: FAIL — `Cannot find module '@/lib/validations'`

- [ ] Create `src/lib/validations.ts`

```ts
import { z } from 'zod'

export const subscribeSchema = z.object({
  planId: z.string().min(1),
  billingPeriod: z.enum(['monthly', 'annual']),
})

export const cancelSchema = z.object({
  subscriptionId: z.string().min(1),
})

export const adminToggleActiveSchema = z.object({
  is_active: z.boolean(),
})

export const adminTogglePublicSchema = z.object({
  is_public: z.boolean(),
})

export const reviewInviteSchema = z.object({
  client_name: z.string().min(1).max(100).optional(),
  client_email: z.string().email().optional(),
  client_phone: z.string().max(20).optional(),
}).refine(data => data.client_email || data.client_phone, {
  message: 'Email o teléfono requerido',
})

export const resetPasswordSchema = z.object({
  email: z.string().email(),
})

export const updatePasswordSchema = z.object({
  password: z.string().min(8).max(128),
})
```

- [ ] Run test to confirm it passes

```bash
pnpm test src/test/validations.test.ts
```

Expected: PASS (8 tests)

- [ ] Apply Zod to `src/app/api/payments/subscribe/route.ts` — add at the top of the POST handler, after `await req.json()`:

```ts
import { subscribeSchema } from '@/lib/validations'

// Inside POST handler, replace the raw body usage:
const body = await req.json()
const parsed = subscribeSchema.safeParse(body)
if (!parsed.success) {
  return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
}
const { planId, billingPeriod } = parsed.data
```

- [ ] Apply Zod to `src/app/api/payments/cancel/route.ts` similarly with `cancelSchema`

- [ ] Commit

```bash
git add src/lib/validations.ts src/test/validations.test.ts src/app/api/payments/
git commit -m "feat: add zod validation schemas + apply to payment API routes"
```

---

### Task 4: GSAP setup

**Files:**
- Create: `src/lib/gsap.ts`
- Create: `src/hooks/use-scroll-animation.ts`

- [ ] Install GSAP

```bash
pnpm add gsap @gsap/react
```

- [ ] Create `src/lib/gsap.ts`

```ts
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Flip } from 'gsap/Flip'

// Register plugins once — safe to call multiple times
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, Flip)
}

export { gsap, ScrollTrigger, Flip }
export type { GSAPTweenVars } from 'gsap'
```

- [ ] Create `src/hooks/use-scroll-animation.ts`

```ts
'use client'

import { useEffect, useRef } from 'react'
import { gsap, ScrollTrigger } from '@/lib/gsap'

interface ScrollAnimationOptions {
  from?: gsap.TweenVars
  to?: gsap.TweenVars
  trigger?: string
  stagger?: number
}

/**
 * Attach a ScrollTrigger fade-in animation to a container ref.
 * Elements matching `selector` (default: ':scope > *') animate in on scroll.
 */
export function useScrollAnimation(
  selector = ':scope > *',
  options: ScrollAnimationOptions = {}
) {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!ref.current) return

    const elements = ref.current.querySelectorAll(selector)
    if (elements.length === 0) return

    const ctx = gsap.context(() => {
      gsap.from(elements, {
        opacity: 0,
        y: options.from?.y ?? 40,
        duration: 0.6,
        ease: 'power2.out',
        stagger: options.stagger ?? 0.1,
        scrollTrigger: {
          trigger: ref.current,
          start: 'top 85%',
          once: true,
        },
        ...options.from,
      })
    }, ref)

    return () => ctx.revert()
  }, [selector, options.stagger])

  return ref
}
```

- [ ] Write test `src/test/gsap.test.ts`

```ts
import { describe, it, expect } from 'vitest'

// Verify the gsap module exports what we expect (without DOM)
describe('gsap module', () => {
  it('exports gsap object', async () => {
    // Dynamic import to avoid SSR issues in test env
    const mod = await import('@/lib/gsap')
    expect(mod.gsap).toBeDefined()
    expect(typeof mod.gsap.to).toBe('function')
    expect(typeof mod.gsap.from).toBe('function')
    expect(typeof mod.gsap.timeline).toBe('function')
  })
})
```

- [ ] Run test

```bash
pnpm test src/test/gsap.test.ts
```

Expected: PASS

- [ ] Commit

```bash
git add src/lib/gsap.ts src/hooks/use-scroll-animation.ts src/test/gsap.test.ts
git commit -m "feat: add gsap singleton + useScrollAnimation hook"
```

---

### Task 5: Skeleton components

**Files:**
- Create: `src/components/ui/skeleton.tsx`
- Create: `src/components/skeletons/installer-card-skeleton.tsx`
- Create: `src/components/skeletons/dashboard-stats-skeleton.tsx`
- Create: `src/components/skeletons/review-card-skeleton.tsx`
- Create: `src/components/skeletons/profile-page-skeleton.tsx`
- Create: `src/components/skeletons/admin-table-skeleton.tsx`

- [ ] Attempt boneyard install; if it fails, proceed with custom skeletons

```bash
pnpm add https://github.com/0xGF/boneyard 2>/dev/null && echo "boneyard_ok" || echo "boneyard_failed"
```

If `boneyard_ok`: check its exports and adapt the components below to use boneyard primitives.  
If `boneyard_failed`: proceed with the custom implementation below (pure Tailwind + `animate-pulse`).

- [ ] Create `src/components/ui/skeleton.tsx` (base primitive)

```tsx
import { cn } from '@/lib/utils'

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-muted', className)}
      {...props}
    />
  )
}
```

- [ ] Create `src/components/skeletons/installer-card-skeleton.tsx`

```tsx
import { Skeleton } from '@/components/ui/skeleton'

export function InstallerCardSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
      <div className="flex items-center gap-3">
        <Skeleton className="w-12 h-12 rounded-full shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-3/4" />
      <div className="flex gap-2 pt-1">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
    </div>
  )
}
```

- [ ] Create `src/components/skeletons/dashboard-stats-skeleton.tsx`

```tsx
import { Skeleton } from '@/components/ui/skeleton'

export function DashboardStatsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-4 space-y-2">
            <Skeleton className="h-5 w-5 rounded" />
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-3 w-20" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-border bg-card p-4 space-y-3">
          <Skeleton className="h-5 w-32" />
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-full rounded-lg" />
          ))}
        </div>
        <div className="rounded-xl border border-border bg-card p-4 space-y-3">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-9 w-full rounded-lg" />
        </div>
      </div>
    </div>
  )
}
```

- [ ] Create `src/components/skeletons/review-card-skeleton.tsx`

```tsx
import { Skeleton } from '@/components/ui/skeleton'

export function ReviewCardSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-20 ml-auto" />
      </div>
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-5/6" />
    </div>
  )
}
```

- [ ] Create `src/components/skeletons/profile-page-skeleton.tsx`

```tsx
import { Skeleton } from '@/components/ui/skeleton'

export function ProfilePageSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      {/* Cover */}
      <Skeleton className="h-48 w-full rounded-none" />
      <div className="container max-w-2xl mx-auto px-4">
        <div className="relative bg-card rounded-2xl border border-border shadow-xl mt-0 p-5 pt-14">
          <Skeleton className="absolute -top-12 left-5 w-24 h-24 rounded-full" />
          <Skeleton className="h-7 w-48 mb-2" />
          <Skeleton className="h-4 w-32 mb-4" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4 mb-6" />
          <Skeleton className="h-14 w-full rounded-xl" />
        </div>
      </div>
    </div>
  )
}
```

- [ ] Create `src/components/skeletons/admin-table-skeleton.tsx`

```tsx
import { Skeleton } from '@/components/ui/skeleton'

interface AdminTableSkeletonProps {
  rows?: number
  cols?: number
}

export function AdminTableSkeleton({ rows = 5, cols = 5 }: AdminTableSkeletonProps) {
  return (
    <div className="space-y-2">
      <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-full" />
        ))}
      </div>
      <div className="border-t border-border pt-2 space-y-3">
        {Array.from({ length: rows }).map((_, row) => (
          <div key={row} className="grid gap-3" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
            {Array.from({ length: cols }).map((_, col) => (
              <Skeleton key={col} className="h-5 w-full" />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] Apply skeletons: replace spinner in `src/app/buscar/page.tsx` Suspense fallback

In `src/app/buscar/page.tsx`, replace:
```tsx
fallback={
  <div className="flex items-center justify-center py-12">
    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
}
```
with:
```tsx
fallback={
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {Array.from({ length: 6 }).map((_, i) => (
      <InstallerCardSkeleton key={i} />
    ))}
  </div>
}
```
And add import: `import { InstallerCardSkeleton } from '@/components/skeletons/installer-card-skeleton'`

- [ ] Replace spinner in `src/app/dashboard/reviews/page.tsx` loading state

In `reviews/page.tsx`, replace the `if (loading) return (...)` spinner block with:
```tsx
import { ReviewCardSkeleton } from '@/components/skeletons/review-card-skeleton'

if (loading) return (
  <div className="max-w-2xl mx-auto space-y-3">
    {Array.from({ length: 3 }).map((_, i) => <ReviewCardSkeleton key={i} />)}
  </div>
)
```

- [ ] Commit

```bash
git add src/components/ui/skeleton.tsx src/components/skeletons/
git commit -m "feat: add skeleton loading components, replace spinners in buscar + reviews"
```

---

### Task 6: InstallerContext

**Files:**
- Create: `src/contexts/installer-context.tsx`
- Modify: `src/app/dashboard/layout.tsx`

- [ ] Write test `src/test/installer-context.test.ts`

```ts
import { describe, it, expect, vi } from 'vitest'

// Test the context logic in isolation (not the React component)
describe('installer context helpers', () => {
  it('returns null installer when not loaded', () => {
    const state = { installer: null, loading: true }
    expect(state.installer).toBeNull()
    expect(state.loading).toBe(true)
  })

  it('installer with trial_ends_at in future is considered on trial', () => {
    const future = new Date(Date.now() + 86400000).toISOString()
    const installer = { plan: 'FREE' as const, trial_ends_at: future }
    const isTrialActive = new Date(installer.trial_ends_at) > new Date()
    expect(isTrialActive).toBe(true)
  })
})
```

- [ ] Run test

```bash
pnpm test src/test/installer-context.test.ts
```

Expected: PASS

- [ ] Create `src/contexts/installer-context.tsx`

```tsx
'use client'

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Installer } from '@/types'

interface InstallerContextValue {
  installer: Installer | null
  loading: boolean
  refreshInstaller: () => Promise<void>
}

const InstallerContext = createContext<InstallerContextValue | null>(null)

export function InstallerProvider({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const [installer, setInstaller] = useState<Installer | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchInstaller = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }

    const { data } = await supabase
      .from('installers')
      .select('*')
      .eq('user_id', user.id)
      .single()

    setInstaller(data ?? null)
    setLoading(false)
  }, [supabase])

  useEffect(() => { fetchInstaller() }, [fetchInstaller])

  return (
    <InstallerContext.Provider value={{ installer, loading, refreshInstaller: fetchInstaller }}>
      {children}
    </InstallerContext.Provider>
  )
}

export function useInstaller() {
  const ctx = useContext(InstallerContext)
  if (!ctx) throw new Error('useInstaller must be used inside InstallerProvider')
  return ctx
}
```

- [ ] Modify `src/app/dashboard/layout.tsx` — wrap children with InstallerProvider and add onboarding redirect

Replace the return statement:
```tsx
import { InstallerProvider } from '@/contexts/installer-context'

// Add below the existing installer check and above the return:
if (installer && !installer.onboarding_completed) {
  // Only redirect if not already on onboarding page
  const { headers } = await import('next/headers')
  const headersList = await headers()
  const pathname = headersList.get('x-pathname') ?? ''
  if (!pathname.includes('/dashboard/onboarding')) {
    redirect('/dashboard/onboarding')
  }
}

// Modify the return:
return (
  <div className="flex min-h-screen bg-muted/20">
    <DashboardSidebar plan={installer.plan} trialEndsAt={installer.trial_ends_at} />
    <main className="flex-1 flex flex-col">
      <div className="flex-1 p-4 md:p-6 pb-24 lg:pb-6">
        <InstallerProvider>
          {children}
        </InstallerProvider>
      </div>
    </main>
    <MobileBottomNav plan={installer.plan} />
  </div>
)
```

**Note:** The `installer.onboarding_completed` field doesn't exist in DB yet — this will throw until Task 15 migration runs. Add a guard: `if (installer && installer.onboarding_completed === false)` to handle the null case safely once migration is applied.

- [ ] Commit

```bash
git add src/contexts/installer-context.tsx src/app/dashboard/layout.tsx src/test/installer-context.test.ts
git commit -m "feat: add InstallerContext for shared dashboard state"
```

---

## Sprint 2 — Admin Dashboard

### Task 7: Admin middleware

**Files:**
- Modify: `src/middleware.ts`
- Modify: `.env.local` (add `ADMIN_EMAILS`)

- [ ] Write test `src/test/admin-auth.test.ts`

```ts
import { describe, it, expect } from 'vitest'

function isAdminEmail(email: string, adminEmails: string): boolean {
  return adminEmails.split(',').map(e => e.trim()).includes(email)
}

describe('isAdminEmail', () => {
  it('returns true for listed email', () => {
    expect(isAdminEmail('admin@example.com', 'admin@example.com,other@example.com')).toBe(true)
  })
  it('returns false for unlisted email', () => {
    expect(isAdminEmail('hacker@evil.com', 'admin@example.com')).toBe(false)
  })
  it('handles whitespace in env var', () => {
    expect(isAdminEmail('admin@example.com', ' admin@example.com ')).toBe(true)
  })
  it('returns false when env var is empty', () => {
    expect(isAdminEmail('admin@example.com', '')).toBe(false)
  })
})
```

- [ ] Run test

```bash
pnpm test src/test/admin-auth.test.ts
```

Expected: PASS

- [ ] Add to `.env.local`

```
ADMIN_EMAILS=tu@email.com
```

Replace `tu@email.com` with the actual admin email.

- [ ] Replace `src/middleware.ts` with the extended version

```ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

function isAdminEmail(email: string): boolean {
  const allowed = (process.env.ADMIN_EMAILS ?? '').split(',').map(e => e.trim()).filter(Boolean)
  return allowed.includes(email)
}

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Admin routes — fail closed, no error message
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

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|icons|images|manifest.json|sw.js).*)',
  ],
}
```

- [ ] Commit

```bash
git add src/middleware.ts src/test/admin-auth.test.ts
git commit -m "feat: extend middleware with admin email guard"
```

---

### Task 8: Admin layout + sidebar

**Files:**
- Create: `src/app/admin/layout.tsx`
- Create: `src/components/admin/admin-sidebar.tsx`

- [ ] Create `src/components/admin/admin-sidebar.tsx`

```tsx
'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, Users, Star, CreditCard, LogOut, Wrench } from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

const NAV = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard, exact: true },
  { href: '/admin/users', label: 'Usuarios', icon: Users },
  { href: '/admin/reviews', label: 'Reseñas', icon: Star },
  { href: '/admin/subscriptions', label: 'Suscripciones', icon: CreditCard },
]

export function AdminSidebar({ adminEmail }: { adminEmail: string }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <aside className="w-56 shrink-0 hidden lg:flex flex-col bg-slate-900 text-slate-100 min-h-screen">
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-orange-500 rounded-md flex items-center justify-center">
            <Wrench className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-sm">TecnoAdmin</span>
        </div>
      </div>

      <nav className="flex-1 p-3 flex flex-col gap-1">
        {NAV.map(item => {
          const Icon = item.icon
          const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-orange-500 text-white'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-slate-700">
        <p className="text-xs text-slate-500 mb-2 truncate">{adminEmail}</p>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 text-xs text-slate-400 hover:text-slate-100 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          Salir
        </button>
      </div>
    </aside>
  )
}
```

- [ ] Create `src/app/admin/layout.tsx`

```tsx
import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { AdminSidebar } from '@/components/admin/admin-sidebar'

function isAdminEmail(email: string): boolean {
  const allowed = (process.env.ADMIN_EMAILS ?? '').split(',').map(e => e.trim()).filter(Boolean)
  return allowed.includes(email)
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Double-check (middleware already guards, this is defense in depth)
  if (!user || !isAdminEmail(user.email ?? '')) {
    redirect('/')
  }

  return (
    <div className="flex min-h-screen bg-slate-950">
      <AdminSidebar adminEmail={user.email!} />
      <main className="flex-1 p-6 text-slate-100">
        {children}
      </main>
    </div>
  )
}
```

- [ ] Start dev server, navigate to `/admin` while logged in as admin email — should see dark sidebar layout

```bash
pnpm dev
```

- [ ] Commit

```bash
git add src/app/admin/layout.tsx src/components/admin/admin-sidebar.tsx
git commit -m "feat: add admin layout with dark sidebar"
```

---

### Task 9: Admin API routes

**Files:**
- Create: `src/app/api/admin/stats/route.ts`
- Create: `src/app/api/admin/users/[id]/toggle-active/route.ts`
- Create: `src/app/api/admin/users/[id]/reset-password/route.ts`
- Create: `src/app/api/admin/reviews/[id]/toggle-public/route.ts`

- [ ] Create helper `src/lib/admin-auth.ts` for server-side admin check

```ts
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function requireAdmin(): Promise<{ error: NextResponse } | { supabase: Awaited<ReturnType<typeof createServerSupabaseClient>> }> {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  const allowed = (process.env.ADMIN_EMAILS ?? '').split(',').map(e => e.trim())

  if (!user || !allowed.includes(user.email ?? '')) {
    return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }
  }
  return { supabase }
}
```

- [ ] Create `src/app/api/admin/stats/route.ts`

```ts
import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  const auth = await requireAdmin()
  if ('error' in auth) return auth.error

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const [
    { count: totalUsers },
    { count: proUsers },
    { count: premiumUsers },
    { count: pendingReviews },
    { data: subs },
  ] = await Promise.all([
    supabase.from('installers').select('*', { count: 'exact', head: true }),
    supabase.from('installers').select('*', { count: 'exact', head: true }).eq('plan', 'PRO'),
    supabase.from('installers').select('*', { count: 'exact', head: true }).eq('plan', 'PREMIUM'),
    supabase.from('reviews').select('*', { count: 'exact', head: true }).eq('is_public', false).is('deleted_at', null),
    supabase.from('subscriptions').select('plan, billing_period').eq('status', 'authorized'),
  ])

  const priceMap: Record<string, number> = {
    'PRO_monthly': Number(process.env.MP_PRICE_PRO_MONTHLY ?? 0),
    'PRO_annual': Math.round(Number(process.env.MP_PRICE_PRO_ANNUAL ?? 0) / 12),
    'PREMIUM_monthly': Number(process.env.MP_PRICE_PREMIUM_MONTHLY ?? 0),
    'PREMIUM_annual': Math.round(Number(process.env.MP_PRICE_PREMIUM_ANNUAL ?? 0) / 12),
  }

  const mrr = (subs ?? []).reduce((sum, s) => {
    return sum + (priceMap[`${s.plan}_${s.billing_period}`] ?? 0)
  }, 0)

  return NextResponse.json({
    totalUsers: totalUsers ?? 0,
    proUsers: proUsers ?? 0,
    premiumUsers: premiumUsers ?? 0,
    freeUsers: (totalUsers ?? 0) - (proUsers ?? 0) - (premiumUsers ?? 0),
    pendingReviews: pendingReviews ?? 0,
    mrr,
  })
}
```

- [ ] Create `src/app/api/admin/users/[id]/toggle-active/route.ts`

```ts
import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { adminToggleActiveSchema } from '@/lib/validations'
import { createClient } from '@supabase/supabase-js'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin()
  if ('error' in auth) return auth.error

  const { id } = await params
  const body = await req.json()
  const parsed = adminToggleActiveSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid request' }, { status: 400 })

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { error } = await supabase
    .from('installers')
    .update({ is_active: parsed.data.is_active, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
```

- [ ] Create `src/app/api/admin/users/[id]/reset-password/route.ts`

```ts
import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin()
  if ('error' in auth) return auth.error

  const { id } = await params

  // id here is installer.id — get the user_id first
  const supabaseService = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: installer } = await supabaseService
    .from('installers')
    .select('user_id')
    .eq('id', id)
    .single()

  if (!installer) return NextResponse.json({ error: 'Installer not found' }, { status: 404 })

  // Get user email
  const { data: { user } } = await supabaseService.auth.admin.getUserById(installer.user_id)
  if (!user?.email) return NextResponse.json({ error: 'User email not found' }, { status: 404 })

  const { error } = await supabaseService.auth.admin.generateLink({
    type: 'recovery',
    email: user.email,
    options: { redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/update-password` },
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true, message: 'Recovery email sent' })
}
```

- [ ] Create `src/app/api/admin/reviews/[id]/toggle-public/route.ts`

```ts
import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { adminTogglePublicSchema } from '@/lib/validations'
import { createClient } from '@supabase/supabase-js'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin()
  if ('error' in auth) return auth.error

  const { id } = await params
  const body = await req.json()
  const parsed = adminTogglePublicSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid request' }, { status: 400 })

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const update: Record<string, unknown> = { is_public: parsed.data.is_public }
  if (!parsed.data.is_public) update.deleted_at = new Date().toISOString()

  const { error } = await supabase.from('reviews').update(update).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
```

- [ ] Commit

```bash
git add src/lib/admin-auth.ts src/app/api/admin/
git commit -m "feat: add admin API routes (stats, toggle-active, reset-password, toggle-public)"
```

---

### Task 10: Admin overview page

**Files:**
- Create: `src/app/admin/page.tsx`

- [ ] Create `src/app/admin/page.tsx`

```tsx
import { createClient } from '@supabase/supabase-js'
import { Users, Star, CreditCard, TrendingUp } from 'lucide-react'
import { AdminStatsCards } from '@/components/admin/admin-stats-cards'

async function getStats() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const [
    { count: totalUsers },
    { count: proUsers },
    { count: premiumUsers },
    { count: pendingReviews },
    { data: subs },
  ] = await Promise.all([
    supabase.from('installers').select('*', { count: 'exact', head: true }),
    supabase.from('installers').select('*', { count: 'exact', head: true }).eq('plan', 'PRO'),
    supabase.from('installers').select('*', { count: 'exact', head: true }).eq('plan', 'PREMIUM'),
    supabase.from('reviews').select('*', { count: 'exact', head: true }).eq('is_public', false).is('deleted_at', null),
    supabase.from('subscriptions').select('plan, billing_period').eq('status', 'authorized'),
  ])

  const priceMap: Record<string, number> = {
    'PRO_monthly': Number(process.env.MP_PRICE_PRO_MONTHLY ?? 0),
    'PRO_annual': Math.round(Number(process.env.MP_PRICE_PRO_ANNUAL ?? 0) / 12),
    'PREMIUM_monthly': Number(process.env.MP_PRICE_PREMIUM_MONTHLY ?? 0),
    'PREMIUM_annual': Math.round(Number(process.env.MP_PRICE_PREMIUM_ANNUAL ?? 0) / 12),
  }

  const mrr = (subs ?? []).reduce((sum, s) => sum + (priceMap[`${s.plan}_${s.billing_period}`] ?? 0), 0)

  return {
    totalUsers: totalUsers ?? 0,
    proUsers: proUsers ?? 0,
    premiumUsers: premiumUsers ?? 0,
    freeUsers: (totalUsers ?? 0) - (proUsers ?? 0) - (premiumUsers ?? 0),
    pendingReviews: pendingReviews ?? 0,
    mrr,
  }
}

export default async function AdminOverviewPage() {
  const stats = await getStats()

  const cards = [
    { label: 'Total usuarios', value: stats.totalUsers, icon: Users, color: 'text-sky-400' },
    { label: 'Plan PRO', value: stats.proUsers, icon: TrendingUp, color: 'text-blue-400' },
    { label: 'Plan PREMIUM', value: stats.premiumUsers, icon: Star, color: 'text-yellow-400' },
    { label: 'MRR estimado', value: `$${stats.mrr.toLocaleString('es-AR')}`, icon: CreditCard, color: 'text-green-400' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Overview</h1>
        <p className="text-slate-400 text-sm mt-1">Estado general de la plataforma</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(card => {
          const Icon = card.icon
          return (
            <div key={card.label} className="bg-slate-800 rounded-xl p-4 border border-slate-700">
              <Icon className={`w-5 h-5 ${card.color} mb-2`} />
              <p className={`text-3xl font-bold ${card.color}`}>{card.value}</p>
              <p className="text-xs text-slate-400 mt-1">{card.label}</p>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <p className="text-sm text-slate-400 mb-1">Plan FREE</p>
          <p className="text-2xl font-bold text-slate-300">{stats.freeUsers}</p>
        </div>
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <p className="text-sm text-slate-400 mb-1">Reseñas pendientes</p>
          <p className={`text-2xl font-bold ${stats.pendingReviews > 0 ? 'text-orange-400' : 'text-slate-300'}`}>
            {stats.pendingReviews}
          </p>
        </div>
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <p className="text-sm text-slate-400 mb-1">Pagos activos</p>
          <p className="text-2xl font-bold text-slate-300">{stats.proUsers + stats.premiumUsers}</p>
        </div>
      </div>
    </div>
  )
}
```

- [ ] Navigate to `/admin` in browser — should see overview with stat cards

- [ ] Commit

```bash
git add src/app/admin/page.tsx
git commit -m "feat: admin overview page with platform stats"
```

---

### Task 11: Admin users list + detail

**Files:**
- Create: `src/app/admin/users/page.tsx`
- Create: `src/app/admin/users/[id]/page.tsx`

- [ ] Create `src/app/admin/users/page.tsx`

```tsx
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

async function getUsers(search?: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  let query = supabase
    .from('installers')
    .select('id, nombre, apellido, nombre_comercial, ciudad, provincia, plan, is_active, created_at')
    .order('created_at', { ascending: false })
    .limit(100)

  if (search) {
    query = query.or(`nombre.ilike.%${search}%,apellido.ilike.%${search}%,nombre_comercial.ilike.%${search}%`)
  }

  const { data } = await query
  return data ?? []
}

interface Props { searchParams: Promise<{ q?: string }> }

export default async function AdminUsersPage({ searchParams }: Props) {
  const { q } = await searchParams
  const users = await getUsers(q)

  const planColor: Record<string, string> = {
    FREE: 'text-slate-400',
    PRO: 'text-blue-400',
    PREMIUM: 'text-yellow-400',
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-100">Usuarios</h1>
        <span className="text-slate-400 text-sm">{users.length} resultados</span>
      </div>

      <form method="GET">
        <input
          name="q"
          defaultValue={q}
          placeholder="Buscar por nombre..."
          className="w-full bg-slate-800 border border-slate-700 text-slate-100 rounded-lg px-4 py-2 text-sm placeholder:text-slate-500 focus:outline-none focus:border-orange-500"
        />
      </form>

      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700">
              <th className="text-left p-3 text-slate-400 font-medium">Nombre</th>
              <th className="text-left p-3 text-slate-400 font-medium hidden md:table-cell">Ciudad</th>
              <th className="text-left p-3 text-slate-400 font-medium">Plan</th>
              <th className="text-left p-3 text-slate-400 font-medium hidden md:table-cell">Estado</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                <td className="p-3 text-slate-200 font-medium">
                  {u.nombre_comercial ?? `${u.nombre} ${u.apellido}`}
                </td>
                <td className="p-3 text-slate-400 hidden md:table-cell">{u.ciudad}</td>
                <td className={`p-3 font-semibold ${planColor[u.plan] ?? 'text-slate-400'}`}>{u.plan}</td>
                <td className="p-3 hidden md:table-cell">
                  <span className={`text-xs font-medium ${u.is_active ? 'text-green-400' : 'text-red-400'}`}>
                    {u.is_active ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="p-3">
                  <Link href={`/admin/users/${u.id}`} className="text-slate-400 hover:text-orange-400 transition-colors">
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
```

**Security note:** This page uses service role on the server to bypass RLS — admin must read any installer's data. Action buttons are a separate Client Component.

- [ ] Create `src/components/admin/user-actions.tsx` (Client Component for buttons)

```tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Mail, Shield } from 'lucide-react'

interface UserActionsProps {
  installerId: string
  isActive: boolean
}

export function UserActions({ installerId, isActive: initialActive }: UserActionsProps) {
  const [isActive, setIsActive] = useState(initialActive)
  const [resetting, setResetting] = useState(false)
  const [toggling, setToggling] = useState(false)
  const [message, setMessage] = useState('')

  const handleResetPassword = async () => {
    setResetting(true)
    const res = await fetch(`/api/admin/users/${installerId}/reset-password`, { method: 'POST' })
    const json = await res.json()
    setMessage(res.ok ? '✓ Email de recuperación enviado' : `Error: ${json.error}`)
    setResetting(false)
  }

  const handleToggleActive = async () => {
    setToggling(true)
    const res = await fetch(`/api/admin/users/${installerId}/toggle-active`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !isActive }),
    })
    if (res.ok) setIsActive(prev => !prev)
    setToggling(false)
  }

  return (
    <div className="space-y-3">
      {message && (
        <p className="text-sm text-green-400 bg-green-900/30 border border-green-800 rounded-lg px-4 py-2">
          {message}
        </p>
      )}
      <div className="flex gap-3 flex-wrap">
        <Button onClick={handleResetPassword} disabled={resetting} variant="outline"
          className="border-slate-600 text-slate-200 hover:bg-slate-700">
          <Mail className="w-4 h-4 mr-2" />
          {resetting ? 'Enviando...' : 'Enviar reset de contraseña'}
        </Button>
        <Button onClick={handleToggleActive} disabled={toggling} variant="outline"
          className={isActive ? 'border-red-700 text-red-400 hover:bg-red-900/30' : 'border-green-700 text-green-400 hover:bg-green-900/30'}>
          <Shield className="w-4 h-4 mr-2" />
          {toggling ? 'Actualizando...' : isActive ? 'Desactivar cuenta' : 'Activar cuenta'}
        </Button>
      </div>
    </div>
  )
}
```

- [ ] Create `src/app/admin/users/[id]/page.tsx` (Server Component — uses service role)

```tsx
import { notFound } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { UserActions } from '@/components/admin/user-actions'

async function getInstaller(id: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  const { data } = await supabase
    .from('installers')
    .select(`*, subscriptions(status, plan, billing_period, next_payment_date)`)
    .eq('id', id)
    .single()
  return data
}

interface Props { params: Promise<{ id: string }> }

export default async function AdminUserDetailPage({ params }: Props) {
  const { id } = await params
  const installer = await getInstaller(id)
  if (!installer) notFound()

  const sub = installer.subscriptions?.[0]
  const displayName = installer.nombre_comercial ?? `${installer.nombre} ${installer.apellido}`

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Link href="/admin/users" className="text-slate-400 hover:text-slate-100">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-slate-100">{displayName}</h1>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
          installer.is_active ? 'bg-green-900 text-green-400' : 'bg-red-900 text-red-400'
        }`}>
          {installer.is_active ? 'Activo' : 'Inactivo'}
        </span>
      </div>

      <div className="bg-slate-800 rounded-xl border border-slate-700 p-4 text-sm">
        <div className="grid grid-cols-2 gap-y-2">
          <span className="text-slate-400">Plan</span>
          <span className="text-slate-200 font-semibold">{installer.plan}</span>
          <span className="text-slate-400">Ciudad</span>
          <span className="text-slate-200">{installer.ciudad}, {installer.provincia}</span>
          <span className="text-slate-400">WhatsApp</span>
          <span className="text-slate-200">{installer.whatsapp}</span>
          {sub && <>
            <span className="text-slate-400">Suscripción</span>
            <span className="text-slate-200">{sub.plan} {sub.billing_period} — {sub.status}</span>
          </>}
        </div>
      </div>

      <UserActions installerId={id} isActive={installer.is_active} />
    </div>
  )
}
```
```

- [ ] Test: navigate to `/admin/users` — see table; click a user — see detail with action buttons

- [ ] Commit

```bash
git add src/app/admin/users/
git commit -m "feat: admin users list and detail page with reset-password + toggle-active"
```

---

### Task 12: Admin reviews moderation

**Files:**
- Create: `src/app/admin/reviews/page.tsx`

**Security note:** Server Component with service role for data fetch. Filter via URL searchParams (same pattern as `/buscar`). Toggle is a Client Component island.

- [ ] Create `src/components/admin/review-toggle.tsx` (Client Component)

```tsx
'use client'

import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

export function ReviewToggle({ reviewId, isPublic: initial }: { reviewId: string; isPublic: boolean }) {
  const [isPublic, setIsPublic] = useState(initial)
  const [loading, setLoading] = useState(false)

  const toggle = async () => {
    setLoading(true)
    const res = await fetch(`/api/admin/reviews/${reviewId}/toggle-public`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_public: !isPublic }),
    })
    if (res.ok) setIsPublic(prev => !prev)
    setLoading(false)
  }

  return (
    <button onClick={toggle} disabled={loading} className="text-slate-400 hover:text-orange-400 transition-colors">
      {isPublic ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
    </button>
  )
}
```

- [ ] Create `src/app/admin/reviews/page.tsx` (Server Component)

```tsx
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { ReviewToggle } from '@/components/admin/review-toggle'

type Filter = 'all' | 'public' | 'hidden'

async function getReviews(filter: Filter) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  let query = supabase
    .from('reviews')
    .select(`*, installer:installers(nombre, apellido, nombre_comercial)`)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(100)

  if (filter === 'public') query = query.eq('is_public', true)
  if (filter === 'hidden') query = query.eq('is_public', false)

  const { data } = await query
  return data ?? []
}

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'Todas' },
  { key: 'public', label: 'Públicas' },
  { key: 'hidden', label: 'Ocultas' },
]

interface Props { searchParams: Promise<{ filter?: string }> }

export default async function AdminReviewsPage({ searchParams }: Props) {
  const { filter: rawFilter } = await searchParams
  const filter: Filter = (['all', 'public', 'hidden'].includes(rawFilter ?? '') ? rawFilter as Filter : 'all')
  const reviews = await getReviews(filter)

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-slate-100">Reseñas</h1>

      <div className="flex gap-2">
        {FILTERS.map(f => (
          <Link
            key={f.key}
            href={`/admin/reviews?filter=${f.key}`}
            className={cn(
              'px-4 py-1.5 rounded-lg text-sm font-medium transition-colors',
              filter === f.key
                ? 'bg-orange-500 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-slate-100 border border-slate-700'
            )}
          >
            {f.label}
          </Link>
        ))}
      </div>

      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700">
              <th className="text-left p-3 text-slate-400 font-medium">Instalador</th>
              <th className="text-left p-3 text-slate-400 font-medium">Rating</th>
              <th className="text-left p-3 text-slate-400 font-medium hidden md:table-cell">Comentario</th>
              <th className="p-3 text-slate-400 font-medium">Visible</th>
            </tr>
          </thead>
          <tbody>
            {reviews.map(r => {
              const inst = r.installer as any
              const name = inst?.nombre_comercial ?? `${inst?.nombre ?? ''} ${inst?.apellido ?? ''}`.trim()
              return (
                <tr key={r.id} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                  <td className="p-3 text-slate-200">{name}</td>
                  <td className="p-3 text-yellow-400 font-bold">{'★'.repeat(r.rating)}</td>
                  <td className="p-3 text-slate-400 hidden md:table-cell max-w-xs truncate">
                    {r.comentario ?? '—'}
                  </td>
                  <td className="p-3 text-center">
                    <ReviewToggle reviewId={r.id} isPublic={r.is_public} />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
```

- [ ] Test: navigate to `/admin/reviews` — filter tabs work, Eye/EyeOff toggle works

- [ ] Commit

```bash
git add src/app/admin/reviews/page.tsx
git commit -m "feat: admin reviews moderation page"
```

---

### Task 13: Admin subscriptions page

**Files:**
- Create: `src/app/admin/subscriptions/page.tsx`

- [ ] Create `src/app/admin/subscriptions/page.tsx`

```tsx
import { createClient } from '@supabase/supabase-js'

async function getSubscriptions() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data } = await supabase
    .from('subscriptions')
    .select(`*, installer:installers(nombre, apellido, nombre_comercial, ciudad)`)
    .order('created_at', { ascending: false })

  return data ?? []
}

function formatARS(n: number) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n)
}

export default async function AdminSubscriptionsPage() {
  const subs = await getSubscriptions()

  const priceMap: Record<string, number> = {
    'PRO_monthly': Number(process.env.MP_PRICE_PRO_MONTHLY ?? 0),
    'PRO_annual': Math.round(Number(process.env.MP_PRICE_PRO_ANNUAL ?? 0) / 12),
    'PREMIUM_monthly': Number(process.env.MP_PRICE_PREMIUM_MONTHLY ?? 0),
    'PREMIUM_annual': Math.round(Number(process.env.MP_PRICE_PREMIUM_ANNUAL ?? 0) / 12),
  }

  const activeSubs = subs.filter(s => s.status === 'authorized')
  const mrr = activeSubs.reduce((sum, s) => sum + (priceMap[`${s.plan}_${s.billing_period}`] ?? 0), 0)

  const statusColor: Record<string, string> = {
    authorized: 'text-green-400',
    pending: 'text-yellow-400',
    paused: 'text-slate-400',
    cancelled: 'text-red-400',
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-100">Suscripciones</h1>
        <div className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-right">
          <p className="text-xs text-slate-400">MRR estimado</p>
          <p className="text-xl font-bold text-green-400">{formatARS(mrr)}</p>
        </div>
      </div>

      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700">
              <th className="text-left p-3 text-slate-400 font-medium">Instalador</th>
              <th className="text-left p-3 text-slate-400 font-medium">Plan</th>
              <th className="text-left p-3 text-slate-400 font-medium hidden md:table-cell">Período</th>
              <th className="text-left p-3 text-slate-400 font-medium">Estado</th>
              <th className="text-right p-3 text-slate-400 font-medium hidden md:table-cell">Próximo pago</th>
            </tr>
          </thead>
          <tbody>
            {subs.map(s => {
              const inst = s.installer as any
              const name = inst?.nombre_comercial ?? `${inst?.nombre ?? ''} ${inst?.apellido ?? ''}`.trim()
              return (
                <tr key={s.id} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                  <td className="p-3 text-slate-200">{name}</td>
                  <td className={`p-3 font-semibold ${s.plan === 'PREMIUM' ? 'text-yellow-400' : 'text-blue-400'}`}>
                    {s.plan}
                  </td>
                  <td className="p-3 text-slate-400 hidden md:table-cell capitalize">{s.billing_period}</td>
                  <td className={`p-3 font-medium ${statusColor[s.status] ?? 'text-slate-400'}`}>
                    {s.status}
                  </td>
                  <td className="p-3 text-slate-400 text-right hidden md:table-cell">
                    {s.next_payment_date
                      ? new Date(s.next_payment_date).toLocaleDateString('es-AR')
                      : '—'}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
```

- [ ] Commit

```bash
git add src/app/admin/subscriptions/page.tsx
git commit -m "feat: admin subscriptions page with MRR"
```

---

## Sprint 3 — Flujos & Conectividad

### Task 14: DB migration

**Files:**
- Create: `supabase/migrations/20260412000000_onboarding_and_soft_delete.sql`

- [ ] Create migration file

```sql
-- Add onboarding_completed flag
ALTER TABLE installers ADD COLUMN IF NOT EXISTS onboarding_completed boolean NOT NULL DEFAULT false;

-- Mark existing installers as already onboarded (they registered before this feature)
UPDATE installers SET onboarding_completed = true;

-- Soft delete for reviews
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS deleted_at timestamptz;

-- Performance indexes for admin queries
CREATE INDEX IF NOT EXISTS idx_installers_plan ON installers(plan);
CREATE INDEX IF NOT EXISTS idx_installers_is_active ON installers(is_active);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_reviews_is_public ON reviews(is_public) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_reviews_deleted_at ON reviews(deleted_at);
```

- [ ] Apply migration via Supabase MCP or dashboard SQL editor

```
In Supabase dashboard → SQL Editor → paste and run the migration above.
```

Or via CLI:
```bash
supabase db push
```

- [ ] Commit

```bash
git add supabase/migrations/
git commit -m "feat: migration - onboarding_completed flag, soft delete reviews, indexes"
```

---

### Task 15: Password recovery pages

**Files:**
- Create: `src/app/auth/forgot-password/page.tsx`
- Create: `src/app/auth/update-password/page.tsx`
- Modify: `src/app/auth/login/page.tsx`

- [ ] Create `src/app/auth/forgot-password/page.tsx`

```tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'
import { Wrench, ArrowLeft } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/update-password`,
    })

    if (error) setError(error.message)
    else setSent(true)
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="w-12 h-12 bg-gradient-to-br from-primary to-orange-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Wrench className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Recuperar contraseña</h1>
          <p className="text-muted-foreground text-sm mt-2">
            Te enviamos un link para restablecer tu contraseña
          </p>
        </div>

        {sent ? (
          <div className="text-center space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-green-800 text-sm">
              Revisá tu email. Si la cuenta existe, recibirás el link en los próximos minutos.
            </div>
            <Link href="/auth/login" className="text-sm text-primary hover:underline flex items-center justify-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Volver al login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Enviando...' : 'Enviar link de recuperación'}
            </Button>
            <Link href="/auth/login" className="text-sm text-muted-foreground hover:text-primary flex items-center justify-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Volver al login
            </Link>
          </form>
        )}
      </div>
    </div>
  )
}
```

- [ ] Create `src/app/auth/update-password/page.tsx`

```tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'
import { Wrench } from 'lucide-react'

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  // Supabase handles token from URL hash automatically via onAuthStateChange
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        // User is now in password recovery state — allow form submission
      }
    })
    return () => subscription.unsubscribe()
  }, [supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirm) { setError('Las contraseñas no coinciden'); return }
    if (password.length < 8) { setError('Mínimo 8 caracteres'); return }

    setLoading(true)
    setError('')

    const { error } = await supabase.auth.updateUser({ password })
    if (error) { setError(error.message); setLoading(false); return }

    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="w-12 h-12 bg-gradient-to-br from-primary to-orange-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Wrench className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Nueva contraseña</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="password"
            placeholder="Nueva contraseña (mín. 8 caracteres)"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            minLength={8}
          />
          <Input
            type="password"
            placeholder="Repetir contraseña"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            required
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Guardando...' : 'Guardar nueva contraseña'}
          </Button>
        </form>
      </div>
    </div>
  )
}
```

- [ ] Add "¿Olvidaste tu contraseña?" link to the login page. In `src/app/auth/login/page.tsx`, after the password input, add:

```tsx
<div className="text-right">
  <Link href="/auth/forgot-password" className="text-xs text-muted-foreground hover:text-primary">
    ¿Olvidaste tu contraseña?
  </Link>
</div>
```

Import `Link` from `'next/link'` if not already imported.

- [ ] Test: go to `/auth/forgot-password`, enter an email → "Revisá tu email" message appears

- [ ] Commit

```bash
git add src/app/auth/forgot-password/ src/app/auth/update-password/ src/app/auth/login/page.tsx
git commit -m "feat: password recovery flow (forgot-password + update-password pages)"
```

---

### Task 16: Onboarding stepper

**Files:**
- Create: `src/app/dashboard/onboarding/page.tsx`

- [ ] Create `src/app/dashboard/onboarding/page.tsx`

```tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'
import { Zap, Droplets, Flame, Wind, Monitor, Wifi, Camera, Smartphone, Package, Sun, HardHat, Hammer } from 'lucide-react'
import { cn } from '@/lib/utils'

const TRADE_OPTIONS = [
  { slug: 'electricidad', label: 'Electricidad', icon: Zap },
  { slug: 'plomeria', label: 'Plomería', icon: Droplets },
  { slug: 'gas', label: 'Gas', icon: Flame },
  { slug: 'aire-acondicionado', label: 'Aire Acond.', icon: Wind },
  { slug: 'tecnico-pc', label: 'Técnico PC', icon: Monitor },
  { slug: 'redes', label: 'Redes/Internet', icon: Wifi },
  { slug: 'camaras-cctv', label: 'Cámaras CCTV', icon: Camera },
  { slug: 'celulares', label: 'Celulares', icon: Smartphone },
  { slug: 'muebles-mdf', label: 'Muebles MDF', icon: Package },
  { slug: 'energia-solar', label: 'Energía Solar', icon: Sun },
  { slug: 'albanileria', label: 'Albañilería', icon: HardHat },
  { slug: 'otros', label: 'Otros', icon: Hammer },
]

export default function OnboardingPage() {
  const router = useRouter()
  const supabase = createClient()

  const [step, setStep] = useState(1)
  const [installerId, setInstallerId] = useState<string | null>(null)
  const [selectedTrade, setSelectedTrade] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    supabase.from('installers').select('id, onboarding_completed').then(({ data }) => {
      if (data?.[0]?.onboarding_completed) router.replace('/dashboard')
      else setInstallerId(data?.[0]?.id ?? null)
    })
  }, [])

  const handleSelectTrade = async () => {
    if (!selectedTrade || !installerId) return
    setSaving(true)

    // Get trade id from slug
    const { data: trade } = await supabase
      .from('trades')
      .select('id')
      .eq('slug', selectedTrade)
      .single()

    if (trade) {
      await supabase.from('installer_trades').upsert({
        installer_id: installerId,
        trade_id: trade.id,
      })
    }
    setSaving(false)
    setStep(3)
  }

  const handleFinish = async () => {
    if (!installerId) return
    setSaving(true)
    await supabase
      .from('installers')
      .update({ onboarding_completed: true })
      .eq('id', installerId)
    setSaving(false)
    router.push('/dashboard')
  }

  const STEPS = ['Bienvenida', 'Tu oficio', '¡Listo!']

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-lg">
        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {STEPS.map((label, i) => (
            <div key={label} className="flex items-center gap-2 flex-1">
              <div className={cn(
                'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0',
                i + 1 <= step ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
              )}>{i + 1}</div>
              <span className={cn('text-xs hidden sm:block', i + 1 <= step ? 'text-foreground' : 'text-muted-foreground')}>
                {label}
              </span>
              {i < STEPS.length - 1 && <div className={cn('flex-1 h-0.5 rounded', i + 1 < step ? 'bg-primary' : 'bg-muted')} />}
            </div>
          ))}
        </div>

        {/* Step 1 */}
        {step === 1 && (
          <div className="text-center space-y-4">
            <div className="text-6xl">👋</div>
            <h1 className="text-3xl font-extrabold">¡Bienvenido a TecnoInstalador!</h1>
            <p className="text-muted-foreground">En 2 pasos vas a tener tu perfil listo para conseguir clientes.</p>
            <Button size="lg" className="w-full mt-6 font-bold" onClick={() => setStep(2)}>
              Empezar →
            </Button>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">¿Cuál es tu oficio principal?</h2>
            <p className="text-muted-foreground text-sm">Podés agregar más oficios después desde tu perfil.</p>
            <div className="grid grid-cols-3 gap-3">
              {TRADE_OPTIONS.map(({ slug, label, icon: Icon }) => (
                <button
                  key={slug}
                  onClick={() => setSelectedTrade(slug)}
                  className={cn(
                    'flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all text-sm font-medium',
                    selectedTrade === slug
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border text-muted-foreground hover:border-primary/40 hover:text-foreground'
                  )}
                >
                  <Icon className="w-6 h-6" />
                  {label}
                </button>
              ))}
            </div>
            <Button
              className="w-full font-bold"
              disabled={!selectedTrade || saving}
              onClick={handleSelectTrade}
            >
              {saving ? 'Guardando...' : 'Continuar →'}
            </Button>
          </div>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <div className="text-center space-y-4">
            <div className="text-6xl">🎉</div>
            <h2 className="text-3xl font-extrabold">¡Tu perfil está listo!</h2>
            <p className="text-muted-foreground">
              Ya aparecés en el buscador. Completá tu perfil para conseguir más clientes.
            </p>
            <Button
              size="lg"
              className="w-full font-bold"
              disabled={saving}
              onClick={handleFinish}
            >
              {saving ? 'Guardando...' : 'Ir a mi dashboard →'}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
```

- [ ] Test: register a new user (or temporarily set `onboarding_completed = false` for an existing one) → should land on onboarding → complete 3 steps → redirect to `/dashboard`

- [ ] Commit

```bash
git add src/app/dashboard/onboarding/
git commit -m "feat: 3-step onboarding wizard for new installers"
```

---

### Task 17: Fix broken links + legal pages

**Files:**
- Modify: `src/components/layout/dashboard-sidebar.tsx`
- Create: `src/app/legal/terminos/page.tsx`
- Create: `src/app/legal/privacidad/page.tsx`
- Modify: `src/app/layout.tsx` or footer in `src/app/page.tsx`
- Modify: `src/app/i/[slug]/page.tsx`

- [ ] Fix sidebar "Ver mi perfil público" link — it currently uses `href="#"`. The dashboard has the installer from context but this is a Server Component sidebar. Pass `urlSlug` as prop.

In `src/app/dashboard/layout.tsx`, extend the select query to include `url_slug`:
```ts
const { data: installer } = await supabase
  .from('installers')
  .select('plan, trial_ends_at, url_slug, onboarding_completed')
  .eq('user_id', user.id)
  .single()
```

Pass to sidebar:
```tsx
<DashboardSidebar plan={installer.plan} trialEndsAt={installer.trial_ends_at} urlSlug={installer.url_slug} />
```

In `src/components/layout/dashboard-sidebar.tsx`, add `urlSlug?: string` to `SidebarProps` and update the bottom link:
```tsx
<a href={urlSlug ? `/i/${urlSlug}` : '#'} target="_blank" className="hover:text-primary flex items-center justify-center gap-1">
  Ver mi perfil público <ChevronRight className="w-3 h-3" />
</a>
```

- [ ] Add "← Buscar instaladores" back link in `/i/[slug]/page.tsx` — add after `<Navbar>`:

```tsx
<div className="container max-w-2xl mx-auto px-4 pt-4">
  <Link href="/buscar" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
    <ArrowLeft className="w-3.5 h-3.5" />
    Buscar instaladores
  </Link>
</div>
```

Add `import { ArrowLeft } from 'lucide-react'` and `import Link from 'next/link'` if not present.

- [ ] Create `src/app/legal/terminos/page.tsx`

```tsx
import { Navbar } from '@/components/layout/navbar'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export default async function TerminosPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={user} />
      <div className="container mx-auto px-4 py-12 max-w-3xl prose dark:prose-invert">
        <h1>Términos y Condiciones</h1>
        <p className="text-muted-foreground">Última actualización: {new Date().toLocaleDateString('es-AR')}</p>
        <p>Al usar TecnoInstalador aceptás estos términos. Este documento se actualizará próximamente con el contenido legal completo.</p>
        <h2>Uso de la plataforma</h2>
        <p>TecnoInstalador conecta profesionales del oficio con clientes. Los instaladores son responsables de la veracidad de su información.</p>
        <h2>Suscripciones</h2>
        <p>Los pagos son procesados por MercadoPago. Las suscripciones se renuevan automáticamente y pueden cancelarse en cualquier momento.</p>
        <h2>Contacto</h2>
        <p>Para consultas: <a href="mailto:hola@tecnoinstalador.com">hola@tecnoinstalador.com</a></p>
      </div>
    </div>
  )
}
```

- [ ] Create `src/app/legal/privacidad/page.tsx`

```tsx
import { Navbar } from '@/components/layout/navbar'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export default async function PrivacidadPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={user} />
      <div className="container mx-auto px-4 py-12 max-w-3xl prose dark:prose-invert">
        <h1>Política de Privacidad</h1>
        <p className="text-muted-foreground">Última actualización: {new Date().toLocaleDateString('es-AR')}</p>
        <p>TecnoInstalador respeta tu privacidad. Este documento se actualizará con el contenido completo.</p>
        <h2>Datos que recopilamos</h2>
        <p>Nombre, email, ciudad, teléfono de contacto. Nunca vendemos tus datos a terceros.</p>
        <h2>Almacenamiento</h2>
        <p>Datos almacenados en Supabase (infraestructura en AWS). Las imágenes en Supabase Storage.</p>
        <h2>Contacto</h2>
        <p>Para ejercer derechos ARCO: <a href="mailto:privacidad@tecnoinstalador.com">privacidad@tecnoinstalador.com</a></p>
      </div>
    </div>
  )
}
```

- [ ] Update footer in `src/app/page.tsx` — add legal links:

```tsx
<footer className="border-t border-border py-8 bg-card">
  <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
    <div className="flex items-center justify-center gap-2 mb-2">
      <div className="w-6 h-6 bg-gradient-to-br from-primary to-orange-400 rounded-md flex items-center justify-center">
        <Wrench className="w-3 h-3 text-white" />
      </div>
      <span className="font-semibold text-foreground">TecnoInstalador</span>
    </div>
    <p>© {new Date().getFullYear()} TecnoInstalador. Todos los derechos reservados.</p>
    <div className="flex items-center justify-center gap-4 mt-2">
      <Link href="/legal/terminos" className="hover:text-foreground transition-colors">Términos</Link>
      <Link href="/legal/privacidad" className="hover:text-foreground transition-colors">Privacidad</Link>
    </div>
  </div>
</footer>
```

- [ ] Commit

```bash
git add src/components/layout/dashboard-sidebar.tsx src/app/legal/ src/app/page.tsx src/app/i/[slug]/page.tsx src/app/dashboard/layout.tsx
git commit -m "fix: sidebar profile link, back link in profile page, legal pages, footer links"
```

---

### Task 18: Dashboard stats page

**Files:**
- Create: `src/app/dashboard/stats/page.tsx`

- [ ] Install recharts

```bash
pnpm add recharts
```

- [ ] Create `src/app/dashboard/stats/page.tsx`

```tsx
'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Eye, MessageCircle, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DashboardStatsSkeleton } from '@/components/skeletons/dashboard-stats-skeleton'

export default function StatsPage() {
  const [data, setData] = useState<{ date: string; views: number; clicks: number }[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: inst } = await supabase
        .from('installers')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (!inst) return

      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const { data: stats } = await supabase
        .from('stats')
        .select('date, profile_views, whatsapp_clicks')
        .eq('installer_id', inst.id)
        .gte('date', thirtyDaysAgo.toISOString().split('T')[0])
        .order('date', { ascending: true })

      setData((stats ?? []).map(s => ({
        date: new Date(s.date).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' }),
        views: s.profile_views ?? 0,
        clicks: s.whatsapp_clicks ?? 0,
      })))
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <DashboardStatsSkeleton />

  const totalViews = data.reduce((s, d) => s + d.views, 0)
  const totalClicks = data.reduce((s, d) => s + d.clicks, 0)
  const convRate = totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(1) : '0'

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Estadísticas</h1>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Visitas (30d)', value: totalViews, icon: Eye, color: 'text-blue-500' },
          { label: 'Clicks WA (30d)', value: totalClicks, icon: MessageCircle, color: 'text-green-500' },
          { label: 'Conversión', value: `${convRate}%`, icon: TrendingUp, color: 'text-purple-500' },
        ].map(stat => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <stat.icon className={`w-5 h-5 ${stat.color} mb-2`} />
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {data.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Visitas y clicks — últimos 30 días</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} className="text-muted-foreground" />
                <YAxis tick={{ fontSize: 11 }} className="text-muted-foreground" />
                <Tooltip
                  contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Line type="monotone" dataKey="views" stroke="#3b82f6" strokeWidth={2} dot={false} name="Visitas" />
                <Line type="monotone" dataKey="clicks" stroke="#22c55e" strokeWidth={2} dot={false} name="Clicks WA" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p>Todavía no hay datos. Compartí tu perfil para empezar a recibir visitas.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
```

- [ ] Navigate to `/dashboard/stats` as PREMIUM user — see chart or empty state

- [ ] Commit

```bash
git add src/app/dashboard/stats/ 
git commit -m "feat: /dashboard/stats page with recharts line chart"
```

---

## Sprint 4 — Animaciones

### Task 19: GSAP homepage animations

**Files:**
- Create: `src/components/home/hero-animated.tsx`
- Modify: `src/app/page.tsx`

**Note:** `src/app/page.tsx` is a Server Component. GSAP requires `'use client'`. Extract the animated hero into a client component.

- [ ] Create `src/components/home/hero-animated.tsx`

```tsx
'use client'

import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap } from '@/lib/gsap'
import Link from 'next/link'
import { Zap, ArrowRight, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface HeroAnimatedProps {
  isLoggedIn: boolean
}

export function HeroAnimated({ isLoggedIn }: HeroAnimatedProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power2.out' } })
    tl
      .from('.hero-badge', { opacity: 0, y: -20, duration: 0.5 })
      .from('.hero-title', { opacity: 0, y: 30, duration: 0.6 }, '-=0.2')
      .from('.hero-subtitle', { opacity: 0, y: 20, duration: 0.5 }, '-=0.3')
      .from('.hero-cta', { opacity: 0, y: 20, duration: 0.4, stagger: 0.1 }, '-=0.2')
      .from('.hero-social', { opacity: 0, duration: 0.4 }, '-=0.1')
  }, { scope: containerRef })

  return (
    <div ref={containerRef} className="relative container mx-auto px-4 py-20 md:py-36">
      <div className="max-w-3xl">
        <div className="hero-badge inline-flex items-center gap-2 border border-primary/30 bg-primary/10 text-primary text-xs font-bold px-4 py-2 rounded-full mb-8 tracking-wider uppercase">
          <Zap className="w-3.5 h-3.5" />
          Plataforma para profesionales del oficio
        </div>

        <h1 className="hero-title text-5xl md:text-7xl font-extrabold leading-[1.05] tracking-tight mb-6">
          Tu perfil<br />
          <span className="bg-gradient-to-r from-orange-500 via-orange-400 to-yellow-400 bg-clip-text text-transparent">
            profesional
          </span><br />
          en minutos
        </h1>

        <p className="hero-subtitle text-lg md:text-xl text-muted-foreground max-w-xl mb-10 leading-relaxed">
          Mostrá tus servicios,{' '}
          <span className="text-emerald-400 font-semibold">recibí reseñas verificadas</span>{' '}
          y conectá con nuevos clientes desde cualquier dispositivo.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <Button size="xl" asChild className="hero-cta font-bold shadow-lg shadow-primary/25">
            <Link href={isLoggedIn ? '/dashboard' : '/auth/register'}>
              {isLoggedIn ? 'Ir a mi dashboard' : 'Crear mi perfil gratis'}
              <ArrowRight className="w-5 h-5" />
            </Link>
          </Button>
          <Button size="xl" variant="outline" asChild className="hero-cta">
            <Link href="/buscar">Ver instaladores</Link>
          </Button>
        </div>

        <div className="hero-social flex items-center gap-6 mt-10 flex-wrap">
          <div className="flex -space-x-2">
            {[
              { bg: '#f97316', init: 'JM' },
              { bg: '#fb923c', init: 'CR' },
              { bg: '#3b82f6', init: 'MP' },
              { bg: '#8b5cf6', init: 'AL' },
            ].map((a, i) => (
              <div key={i} className="w-8 h-8 rounded-full border-2 border-background flex items-center justify-center text-xs font-bold text-white" style={{ background: a.bg }}>
                {a.init}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <div className="flex">
              {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />)}
            </div>
            <span><span className="text-foreground font-semibold">+500</span> profesionales activos</span>
          </div>
        </div>
      </div>
    </div>
  )
}
```

- [ ] In `src/app/page.tsx`, replace the hero section's inner content with `<HeroAnimated isLoggedIn={!!user} />`. Keep the outer section wrapper (with grid background + glows) as a server component. Import `HeroAnimated` at the top.

```tsx
import { HeroAnimated } from '@/components/home/hero-animated'

// Replace the div.relative.container block inside the hero section:
<section className="relative overflow-hidden">
  {/* Grid industrial */}
  <div className="absolute inset-0 pointer-events-none" style={{ ... }} />
  {/* Glows */}
  <div className="absolute -bottom-40 ..." />
  <div className="absolute top-0 ..." />
  <div className="absolute top-1/2 ..." />
  <HeroAnimated isLoggedIn={!!user} />
</section>
```

- [ ] Create `src/components/home/sections-animated.tsx` for scroll-triggered sections

```tsx
'use client'

import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap, ScrollTrigger } from '@/lib/gsap'

interface SectionAnimatedProps {
  children: React.ReactNode
  className?: string
  stagger?: number
}

export function SectionAnimated({ children, className, stagger = 0.1 }: SectionAnimatedProps) {
  const ref = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    if (!ref.current) return
    const children = ref.current.querySelectorAll(':scope > *')
    gsap.from(children, {
      opacity: 0,
      y: 40,
      duration: 0.6,
      ease: 'power2.out',
      stagger,
      scrollTrigger: {
        trigger: ref.current,
        start: 'top 85%',
        once: true,
      },
    })
  }, { scope: ref })

  return <div ref={ref} className={className}>{children}</div>
}
```

- [ ] Wrap the stats grid, features grid, and trades grid in `src/app/page.tsx` with `<SectionAnimated>`. Since `page.tsx` is a server component, import `SectionAnimated` (client) and use it as a wrapper around the grid divs.

For stats section, wrap:
```tsx
<SectionAnimated className="grid grid-cols-2 md:grid-cols-4 divide-x divide-border">
  {STATS.map(...)}
</SectionAnimated>
```

For trades section:
```tsx
<SectionAnimated className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-4 max-w-5xl mx-auto" stagger={0.04}>
  {TRADES.map(...)}
</SectionAnimated>
```

For features section:
```tsx
<SectionAnimated className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
  {FEATURES.map(...)}
</SectionAnimated>
```

- [ ] Test: open homepage → hero elements animate in on load → sections animate as you scroll

- [ ] Commit

```bash
git add src/components/home/ src/app/page.tsx
git commit -m "feat: GSAP hero timeline + scroll-triggered section animations on homepage"
```

---

### Task 20: GSAP on buscar + profile page

**Files:**
- Modify: `src/app/buscar/page.tsx`
- Modify: `src/app/i/[slug]/page.tsx`

- [ ] Create `src/components/marketplace/results-animated.tsx`

```tsx
'use client'

import { useRef, useEffect } from 'react'
import { gsap } from '@/lib/gsap'
import { InstallerCard } from '@/components/marketplace/installer-card'
import type { Installer } from '@/types'

export function ResultsAnimated({ installers }: { installers: Installer[] }) {
  const gridRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!gridRef.current || installers.length === 0) return
    const cards = gridRef.current.querySelectorAll(':scope > *')
    gsap.from(cards, {
      opacity: 0,
      scale: 0.95,
      y: 20,
      duration: 0.4,
      ease: 'power2.out',
      stagger: 0.06,
    })
  }, [installers])

  return (
    <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {installers.map(installer => (
        <InstallerCard key={installer.id} installer={installer} />
      ))}
    </div>
  )
}
```

- [ ] In `src/app/buscar/page.tsx` `Results` component, replace the results grid:

```tsx
// Replace the <div className="grid..."> with:
import { ResultsAnimated } from '@/components/marketplace/results-animated'

// Inside Results component:
return (
  <div>
    <p className="text-sm text-muted-foreground mb-4">
      {sorted.length} resultado(s) en <strong>{location}</strong>
    </p>
    <ResultsAnimated installers={sorted as any} />
  </div>
)
```

- [ ] In `src/app/i/[slug]/page.tsx`, add a profile entrance animation. Create `src/components/installer/profile-animated.tsx`:

```tsx
'use client'

import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap } from '@/lib/gsap'

export function ProfileAnimated({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    const items = ref.current?.querySelectorAll('.animate-in')
    if (!items) return
    gsap.from(items, {
      opacity: 0,
      y: 25,
      duration: 0.5,
      ease: 'power2.out',
      stagger: 0.08,
    })
  }, { scope: ref })

  return <div ref={ref}>{children}</div>
}
```

Add `className="animate-in"` to the profile card, gallery section, trades section, services section, and reviews section in `src/app/i/[slug]/page.tsx`. Wrap the container in `<ProfileAnimated>`.

- [ ] Commit

```bash
git add src/components/marketplace/results-animated.tsx src/components/installer/profile-animated.tsx src/app/buscar/ src/app/i/
git commit -m "feat: GSAP stagger animations on search results and installer profile"
```

---

### Task 21: Realtime reviews in dashboard

**Files:**
- Modify: `src/app/dashboard/reviews/page.tsx`

- [ ] Add Supabase Realtime subscription to `src/app/dashboard/reviews/page.tsx`

After the initial `load()` call in `useEffect`, add a realtime subscription. Replace the entire `useEffect` block:

```tsx
useEffect(() => {
  const load = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: inst } = await supabase
      .from('installers')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!inst) return
    setInstallerId(inst.id)

    const { data } = await supabase
      .from('reviews')
      .select('*')
      .eq('installer_id', inst.id)
      .order('created_at', { ascending: false })

    setReviews(data ?? [])
    setLoading(false)

    // Realtime: new reviews appear automatically
    const channel = supabase
      .channel(`reviews:${inst.id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'reviews', filter: `installer_id=eq.${inst.id}` },
        (payload) => {
          setReviews(prev => [payload.new as Review, ...prev])
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }

  load()
}, [])
```

- [ ] In Supabase Dashboard: enable Realtime for the `reviews` table.

```
Supabase Dashboard → Database → Replication → reviews table → toggle on INSERT
```

- [ ] Test: open `/dashboard/reviews` in one tab. In another tab/window, submit a review using the review link → the new review should appear in the dashboard without refresh.

- [ ] Commit

```bash
git add src/app/dashboard/reviews/page.tsx
git commit -m "feat: realtime review updates in dashboard via Supabase Realtime"
```

---

### Task 22: Final cleanup

**Files:**
- Modify: `.gitignore`

- [ ] Confirm `.superpowers/` is in `.gitignore`

```bash
grep ".superpowers" .gitignore
```

Expected: `.superpowers/`

- [ ] Run full test suite

```bash
pnpm test
```

Expected: all tests pass

- [ ] Build check

```bash
pnpm build
```

Expected: successful build, no TypeScript errors

- [ ] Commit any remaining changes

```bash
git add -A
git status  # review before committing
git commit -m "chore: final cleanup and build verification"
```

---

## Post-implementation checklist

After all sprints are complete:

- [ ] Verify Supabase Realtime is enabled for `reviews` table
- [ ] Confirm `ADMIN_EMAILS` env var is set in Vercel dashboard
- [ ] Confirm `NEXT_PUBLIC_APP_URL` points to production URL in Vercel
- [ ] Test password recovery flow end-to-end in production
- [ ] Test admin login with admin email, then with a non-admin email (should redirect to `/`)
- [ ] Verify all RLS policies are active in Supabase → Database → Policies
- [ ] Check Vercel logs for any CSP violations after deploy

---

## File map summary

| File | Action | Sprint |
|---|---|---|
| `vitest.config.ts` | Create | 1 |
| `src/test/setup.ts` | Create | 1 |
| `next.config.ts` | Modify | 1 |
| `src/lib/validations.ts` | Create | 1 |
| `src/lib/gsap.ts` | Create | 1 |
| `src/hooks/use-scroll-animation.ts` | Create | 1 |
| `src/components/ui/skeleton.tsx` | Create | 1 |
| `src/components/skeletons/*.tsx` (6 files) | Create | 1 |
| `src/contexts/installer-context.tsx` | Create | 1 |
| `src/app/dashboard/layout.tsx` | Modify | 1 |
| `src/middleware.ts` | Modify | 2 |
| `src/lib/admin-auth.ts` | Create | 2 |
| `src/app/admin/layout.tsx` | Create | 2 |
| `src/components/admin/admin-sidebar.tsx` | Create | 2 |
| `src/app/admin/page.tsx` | Create | 2 |
| `src/app/admin/users/page.tsx` | Create | 2 |
| `src/app/admin/users/[id]/page.tsx` | Create | 2 |
| `src/app/admin/reviews/page.tsx` | Create | 2 |
| `src/app/admin/subscriptions/page.tsx` | Create | 2 |
| `src/app/api/admin/**` (4 routes) | Create | 2 |
| `src/components/admin/user-actions.tsx` | Create | 2 |
| `src/components/admin/review-toggle.tsx` | Create | 2 |
| `supabase/migrations/20260412*.sql` | Create | 3 |
| `src/app/auth/forgot-password/page.tsx` | Create | 3 |
| `src/app/auth/update-password/page.tsx` | Create | 3 |
| `src/app/auth/login/page.tsx` | Modify | 3 |
| `src/app/dashboard/onboarding/page.tsx` | Create | 3 |
| `src/app/legal/terminos/page.tsx` | Create | 3 |
| `src/app/legal/privacidad/page.tsx` | Create | 3 |
| `src/app/dashboard/stats/page.tsx` | Create | 3 |
| `src/components/layout/dashboard-sidebar.tsx` | Modify | 3 |
| `src/app/i/[slug]/page.tsx` | Modify | 3+4 |
| `src/components/home/hero-animated.tsx` | Create | 4 |
| `src/components/home/sections-animated.tsx` | Create | 4 |
| `src/components/marketplace/results-animated.tsx` | Create | 4 |
| `src/components/installer/profile-animated.tsx` | Create | 4 |
| `src/app/page.tsx` | Modify | 4 |
| `src/app/buscar/page.tsx` | Modify | 4 |
| `src/app/dashboard/reviews/page.tsx` | Modify | 4 |
