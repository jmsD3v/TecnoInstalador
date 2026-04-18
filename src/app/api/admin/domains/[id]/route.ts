import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createServiceRoleClient } from '@/lib/supabase/service'
import { cookies } from 'next/headers'
import { z } from 'zod'

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? '').split(',').map(e => e.trim()).filter(Boolean)

async function isAdmin(): Promise<boolean> {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  )
  const { data: { user } } = await supabase.auth.getUser()
  return ADMIN_EMAILS.includes(user?.email ?? '')
}

const bodySchema = z.object({ action: z.enum(['approve', 'reject']) })

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const parsed = bodySchema.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ error: 'Invalid' }, { status: 400 })

  const { id } = await params
  const { action } = parsed.data
  const supabase = createServiceRoleClient()

  if (action === 'approve') {
    const { data: domain } = await supabase
      .from('custom_domains')
      .update({ verified: true, dns_verified_at: new Date().toISOString() })
      .eq('id', id)
      .select('installer_id, domain')
      .single()

    if (domain) {
      await supabase.from('notifications').insert({
        installer_id: domain.installer_id,
        type: 'system',
        title: '✅ Dominio verificado',
        body: `Tu dominio ${domain.domain} está activo y apuntando a tu perfil.`,
        link: '/dashboard/domain',
      })
    }
  } else {
    const { data: domain } = await supabase
      .from('custom_domains')
      .delete()
      .eq('id', id)
      .select('installer_id, domain')
      .single()

    if (domain) {
      await supabase.from('notifications').insert({
        installer_id: domain.installer_id,
        type: 'system',
        title: '❌ Dominio rechazado',
        body: `No pudimos verificar ${domain.domain}. Revisá la configuración DNS e intentá de nuevo.`,
        link: '/dashboard/domain',
      })
    }
  }

  return NextResponse.json({ ok: true })
}
