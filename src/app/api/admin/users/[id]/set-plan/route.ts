import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createServiceRoleClient } from '@/lib/supabase/service'
import { z } from 'zod'

function isAdminEmail(email: string): boolean {
  const allowed = (process.env.ADMIN_EMAILS ?? '').split(',').map(e => e.trim()).filter(Boolean)
  return allowed.includes(email)
}

const bodySchema = z.object({
  plan: z.enum(['FREE', 'PRO', 'PREMIUM']),
  trial_ends_at: z.string().datetime().nullable().optional(),
  plan_expires_at: z.string().datetime().nullable().optional(),
})

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !isAdminEmail(user.email ?? '')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const parsed = bodySchema.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ error: 'Invalid body' }, { status: 400 })

  const { plan, trial_ends_at, plan_expires_at } = parsed.data
  const service = createServiceRoleClient()

  const updatePayload: Record<string, unknown> = { plan }
  if (trial_ends_at !== undefined) updatePayload.trial_ends_at = trial_ends_at
  if (plan_expires_at !== undefined) updatePayload.plan_expires_at = plan_expires_at

  const { error } = await service
    .from('installers')
    .update(updatePayload)
    .eq('id', id)

  if (error) {
    console.error('[admin/set-plan]', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Create in-app notification for the installer
  service.from('notifications').insert({
    installer_id: id,
    type: 'system',
    title: `Plan actualizado a ${plan}`,
    body: plan === 'FREE'
      ? 'Tu plan fue cambiado a Gratis por el equipo de TecnoInstalador.'
      : `Tu plan fue cambiado a ${plan} por el equipo de TecnoInstalador.`,
    link: '/dashboard/plan',
  }).then(() => {})

  return NextResponse.json({ ok: true })
}
