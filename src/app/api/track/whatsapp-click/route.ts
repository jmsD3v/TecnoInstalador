import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { LRUCache } from 'lru-cache'
import { createServiceRoleClient } from '@/lib/supabase/service'
import { sendWhatsAppClickEmail } from '@/lib/email'

// Rate limit: 5 clicks per IP per 60-second window (best-effort on serverless)
const rateLimit = new LRUCache<string, number>({ max: 500, ttl: 60_000 })

const bodySchema = z.object({ installer_id: z.string().uuid() })

export async function POST(req: NextRequest) {
  // IP-based rate limiting
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  const count = (rateLimit.get(ip) ?? 0) + 1
  rateLimit.set(ip, count)
  if (count > 5) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  // Validate input
  const parsed = bodySchema.safeParse(await req.json())
  if (!parsed.success) {
    return NextResponse.json({ error: 'installer_id inválido' }, { status: 400 })
  }

  const { installer_id } = parsed.data
  const supabase = createServiceRoleClient()

  // Verify installer is active before incrementing — prevents stat inflation on deactivated accounts
  const { data: installer } = await supabase
    .from('installers')
    .select('id, wa_email_last_sent_at')
    .eq('id', installer_id)
    .eq('is_active', true)
    .single()

  if (!installer) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const { error } = await supabase.rpc('increment_stat', {
    p_installer_id: installer_id,
    p_field: 'whatsapp_clicks',
  })

  if (error) {
    console.error('[track] whatsapp_clicks increment failed:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Send email notification — throttled to 1 per 2h per installer (fire-and-forget)
  const TWO_HOURS_MS = 2 * 60 * 60 * 1000
  const lastSent = installer.wa_email_last_sent_at
    ? new Date(installer.wa_email_last_sent_at).getTime()
    : 0

  if (Date.now() - lastSent > TWO_HOURS_MS) {
    // Update throttle timestamp first to prevent race conditions
    supabase
      .from('installers')
      .update({ wa_email_last_sent_at: new Date().toISOString() })
      .eq('id', installer_id)
      .then(() => {})

    // Get installer email and name for notification
    supabase
      .from('installers')
      .select('nombre, apellido, nombre_comercial, user_id')
      .eq('id', installer_id)
      .single()
      .then(async ({ data: inst }) => {
        if (!inst) return
        const { data: authUser } = await supabase.auth.admin.getUserById(inst.user_id)
        const email = authUser?.user?.email
        if (!email) return
        const name = inst.nombre_comercial ?? `${inst.nombre} ${inst.apellido}`
        const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://tecnoinstalador.net'
        sendWhatsAppClickEmail({
          installerName: name,
          installerEmail: email,
          dashboardUrl: `${APP_URL}/dashboard/stats`,
        }).catch(err => console.error('[wa-email]', err))
      })
  }

  return NextResponse.json({ ok: true })
}
