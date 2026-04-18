import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/service'
import { sendOnboardingNudgeEmail, sendUpgradeNudgeEmail } from '@/lib/email'
import { computeProfileScore } from '@/lib/profile-score'

export const runtime = 'nodejs'
export const maxDuration = 60

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization') ?? ''
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServiceRoleClient()
  const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://tecnoinstalador.net'
  let nudgeSent = 0
  let upgradeSent = 0

  // ── Onboarding nudge: D+3, incomplete profile, not yet sent ──
  const nudgeCutoff = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  const { data: nudgeCandidates } = await supabase
    .from('installers')
    .select('id, nombre, apellido, user_id, foto_perfil_url, descripcion, ciudad, whatsapp, titulo_profesional, nombre_comercial, installer_trades(id), installer_services(id)')
    .eq('onboarding_completed', false)
    .lt('created_at', nudgeCutoff)
    .is('onboarding_nudge_sent_at', null)
    .limit(50)

  for (const inst of nudgeCandidates ?? []) {
    try {
      const { items } = computeProfileScore({
        ...inst,
        installer_trades: inst.installer_trades ?? [],
        installer_services: inst.installer_services ?? [],
        gallery_items: [],
        review_count: 0,
      })
      const missing = items.filter(i => !i.done).map(i => i.label)
      if (missing.length === 0) continue

      const { data: authData } = await supabase.auth.admin.getUserById(inst.user_id)
      const email = authData?.user?.email
      if (!email) continue

      const name = inst.nombre_comercial ?? `${inst.nombre} ${inst.apellido}`
      await sendOnboardingNudgeEmail({
        installerName: name,
        installerEmail: email,
        dashboardUrl: `${APP_URL}/dashboard/profile`,
        missingItems: missing.slice(0, 4),
      })

      await supabase
        .from('installers')
        .update({ onboarding_nudge_sent_at: new Date().toISOString() })
        .eq('id', inst.id)

      nudgeSent++
    } catch (err) {
      console.error('[email-seq] onboarding nudge error:', err)
    }
  }

  // ── Upgrade nudge: D+14, FREE plan, not yet sent ──
  const upgradeCutoff = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
  const { data: upgradeCandidates } = await supabase
    .from('installers')
    .select('id, nombre, apellido, nombre_comercial, user_id')
    .eq('plan', 'FREE')
    .lt('created_at', upgradeCutoff)
    .is('upgrade_nudge_sent_at', null)
    .limit(50)

  for (const inst of upgradeCandidates ?? []) {
    try {
      const { data: authData } = await supabase.auth.admin.getUserById(inst.user_id)
      const email = authData?.user?.email
      if (!email) continue

      const name = inst.nombre_comercial ?? `${inst.nombre} ${inst.apellido}`
      await sendUpgradeNudgeEmail({
        installerName: name,
        installerEmail: email,
        planesUrl: `${APP_URL}/planes`,
      })

      await supabase
        .from('installers')
        .update({ upgrade_nudge_sent_at: new Date().toISOString() })
        .eq('id', inst.id)

      upgradeSent++
    } catch (err) {
      console.error('[email-seq] upgrade nudge error:', err)
    }
  }

  console.log('[cron/email-sequences] nudgeSent:', nudgeSent, 'upgradeSent:', upgradeSent)
  return NextResponse.json({ nudgeSent, upgradeSent })
}
