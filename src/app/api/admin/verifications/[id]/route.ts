import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createServiceRoleClient } from '@/lib/supabase/service'
import { sendVerificationStatusEmail } from '@/lib/email'
import { z } from 'zod'

function isAdminEmail(email: string): boolean {
  const allowed = (process.env.ADMIN_EMAILS ?? '').split(',').map(e => e.trim()).filter(Boolean)
  return allowed.includes(email)
}

const bodySchema = z.object({
  action: z.enum(['approve', 'reject']),
  adminNote: z.string().max(500).nullable().optional(),
  installerId: z.string().uuid(),
  installerEmail: z.string().email(),
  installerName: z.string().min(1),
})

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  // Auth check
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !isAdminEmail(user.email ?? '')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Validate body
  const parsed = bodySchema.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ error: 'Invalid body' }, { status: 400 })

  const { action, adminNote, installerId, installerEmail, installerName } = parsed.data
  const service = createServiceRoleClient()

  // Update verification request
  const { error: updateErr } = await service
    .from('verification_requests')
    .update({
      status: action === 'approve' ? 'approved' : 'rejected',
      admin_note: adminNote ?? null,
      reviewed_at: new Date().toISOString(),
      reviewed_by: user.id,
    })
    .eq('id', id)
    .eq('status', 'pending')

  if (updateErr) {
    console.error('[admin/verifications] update error:', updateErr)
    return NextResponse.json({ error: 'Error al actualizar solicitud' }, { status: 500 })
  }

  // If approved, set is_verified = true on installer
  if (action === 'approve') {
    const { error: verifyErr } = await service
      .from('installers')
      .update({ is_verified: true })
      .eq('id', installerId)

    if (verifyErr) {
      console.error('[admin/verifications] verify update error:', verifyErr)
      return NextResponse.json({ error: 'Error al verificar instalador' }, { status: 500 })
    }
  }

  // In-app notification
  service.from('notifications').insert({
    installer_id: installerId,
    type: 'verification',
    title: action === 'approve' ? '✅ ¡Tu cuenta fue verificada!' : '❌ Verificación no aprobada',
    body: action === 'approve'
      ? 'Tu perfil ahora muestra la insignia de profesional verificado.'
      : (adminNote ?? 'Revisá los motivos y volvé a enviar la documentación.'),
    link: '/dashboard/verify',
  }).then(() => {})

  // Send email notification
  const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://tecnoinstalador.net'
  try {
    await sendVerificationStatusEmail({
      installerName,
      installerEmail,
      status: action === 'approve' ? 'approved' : 'rejected',
      adminNote: adminNote ?? null,
      dashboardUrl: `${APP_URL}/dashboard/verify`,
    })
  } catch (emailErr) {
    console.error('[admin/verifications] email error:', emailErr)
    // Don't fail the request for email errors
  }

  return NextResponse.json({ ok: true })
}
