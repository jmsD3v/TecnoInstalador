import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createServiceRoleClient } from '@/lib/supabase/service'
import { sendQuoteRequestEmail } from '@/lib/email'

const bodySchema = z.object({
  installer_id: z.string().uuid(),
  client_name: z.string().max(100).nullable().optional(),
  job_description: z.string().max(500).nullable().optional(),
  service: z.string().max(100).nullable().optional(),
})

export async function POST(req: NextRequest) {
  const parsed = bodySchema.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ error: 'Invalid body' }, { status: 400 })

  const { installer_id, client_name, job_description, service } = parsed.data
  const supabase = createServiceRoleClient()

  const { data: installer } = await supabase
    .from('installers')
    .select('id, nombre, apellido, nombre_comercial, user_id, url_slug')
    .eq('id', installer_id)
    .eq('is_active', true)
    .single()

  if (!installer) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { data: authUser } = await supabase.auth.admin.getUserById(installer.user_id)
  const email = authUser?.user?.email
  if (!email) return NextResponse.json({ ok: true })

  const installerName = installer.nombre_comercial ?? `${installer.nombre} ${installer.apellido}`
  const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://tecnoinstalador.net'

  sendQuoteRequestEmail({
    installerName,
    installerEmail: email,
    clientName: client_name ?? null,
    jobDescription: job_description ?? null,
    service: service ?? null,
    profileUrl: `${APP_URL}/i/${installer.url_slug}`,
  }).catch(err => console.error('[quote-request] email error:', err))

  // Persist lead + notify installer (best-effort)
  supabase.from('quote_requests').insert({
    installer_id,
    client_name: client_name ?? null,
    job_description: job_description ?? null,
    service: service ?? null,
  }).then(() => {})

  supabase.from('notifications').insert({
    installer_id,
    type: 'system',
    title: '📋 Nueva consulta recibida',
    body: client_name
      ? `${client_name} te envió una consulta por WhatsApp.`
      : 'Recibiste una nueva consulta por WhatsApp.',
    link: '/dashboard/leads',
  }).then(() => {})

  return NextResponse.json({ ok: true })
}
