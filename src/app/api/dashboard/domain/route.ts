import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { z } from 'zod'

async function getSupabase() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (list) => list.forEach(({ name, value, options }) => cookieStore.set(name, value, options)),
      },
    }
  )
}

async function getInstaller(supabase: ReturnType<typeof createServerClient>) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data } = await supabase
    .from('installers')
    .select('id, plan')
    .eq('user_id', user.id)
    .single()
  return data
}

export async function GET() {
  const supabase = await getSupabase()
  const installer = await getInstaller(supabase)
  if (!installer) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: domain } = await supabase
    .from('custom_domains')
    .select('id, domain, verified, dns_verified_at, created_at')
    .eq('installer_id', installer.id)
    .single()

  return NextResponse.json({ plan: installer.plan, domain: domain ?? null })
}

const bodySchema = z.object({
  domain: z.string().min(3).max(253).regex(/^[a-z0-9][a-z0-9.-]+\.[a-z]{2,}$/, 'Formato de dominio inválido'),
})

export async function POST(req: Request) {
  const supabase = await getSupabase()
  const installer = await getInstaller(supabase)
  if (!installer) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (installer.plan !== 'PREMIUM') return NextResponse.json({ error: 'Plan Premium requerido' }, { status: 403 })

  const parsed = bodySchema.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })

  const { domain } = parsed.data

  // Check if domain already taken by another installer
  const { data: existing } = await supabase
    .from('custom_domains')
    .select('installer_id')
    .eq('domain', domain)
    .single()

  if (existing && existing.installer_id !== installer.id) {
    return NextResponse.json({ error: 'Este dominio ya está registrado' }, { status: 409 })
  }

  // Upsert (one domain per installer)
  const { data, error } = await supabase
    .from('custom_domains')
    .upsert({ installer_id: installer.id, domain, verified: false }, { onConflict: 'installer_id' })
    .select('id, domain, verified, dns_verified_at, created_at')
    .single()

  if (error) return NextResponse.json({ error: 'Error al guardar' }, { status: 500 })

  return NextResponse.json({ domain: data })
}

export async function DELETE() {
  const supabase = await getSupabase()
  const installer = await getInstaller(supabase)
  if (!installer) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await supabase.from('custom_domains').delete().eq('installer_id', installer.id)

  return NextResponse.json({ ok: true })
}
