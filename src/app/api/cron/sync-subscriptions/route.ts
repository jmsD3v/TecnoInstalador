import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/service'
import { getMPClient } from '@/lib/mercadopago'
import { PreApproval } from 'mercadopago'

export const runtime = 'nodejs'
export const maxDuration = 60

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization') ?? ''
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServiceRoleClient()

  const { data: subs, error } = await supabase
    .from('subscriptions')
    .select('id, installer_id, mp_preapproval_id, plan, status')
    .in('status', ['pending', 'authorized'])

  if (error) {
    console.error('[cron] Failed to fetch subscriptions:', error)
    return NextResponse.json({ error: 'DB error' }, { status: 500 })
  }

  if (!subs || subs.length === 0) {
    return NextResponse.json({ synced: 0 })
  }

  const client = getMPClient()
  const preapprovalClient = new PreApproval(client)

  let synced = 0
  let errors = 0

  for (const sub of subs) {
    try {
      const data = await preapprovalClient.get({ id: sub.mp_preapproval_id })
      const mpStatus = data.status as string

      if (mpStatus === sub.status) continue

      if (mpStatus === 'authorized') {
        await supabase
          .from('subscriptions')
          .update({ status: 'authorized', updated_at: new Date().toISOString() })
          .eq('id', sub.id)

        await supabase
          .from('installers')
          .update({ plan: sub.plan })
          .eq('id', sub.installer_id)

        // Referral tracking: mark this installer's referral as paid (if not yet marked)
        // Reward referrer every 5 paid referrals with 30 days PRO
        const { data: inst } = await supabase
          .from('installers')
          .select('referred_by, referral_rewarded_at')
          .eq('id', sub.installer_id)
          .single()

        if (inst?.referred_by && !inst.referral_rewarded_at) {
          // Mark this referral as paid
          await supabase
            .from('installers')
            .update({ referral_rewarded_at: new Date().toISOString() })
            .eq('id', sub.installer_id)

          // Count total paid referrals for referrer (including this one just marked)
          const { count: paidReferrals } = await supabase
            .from('installers')
            .select('id', { count: 'exact', head: true })
            .eq('referred_by', inst.referred_by)
            .not('referral_rewarded_at', 'is', null)

          const REFERRALS_NEEDED = 5

          // Reward every multiple of 5 paid referrals
          if (paidReferrals && paidReferrals % REFERRALS_NEEDED === 0) {
            const { data: referrer } = await supabase
              .from('installers')
              .select('id, plan, trial_ends_at, plan_expires_at')
              .eq('id', inst.referred_by)
              .single()

            if (referrer) {
              const base = referrer.trial_ends_at
                ? new Date(referrer.trial_ends_at)
                : referrer.plan_expires_at
                  ? new Date(referrer.plan_expires_at)
                  : new Date()
              if (base < new Date()) base.setTime(new Date().getTime())
              base.setDate(base.getDate() + 30)

              await supabase
                .from('installers')
                .update({
                  plan: referrer.plan === 'FREE' ? 'PRO' : referrer.plan,
                  trial_ends_at: referrer.trial_ends_at ? base.toISOString() : null,
                  plan_expires_at: !referrer.trial_ends_at ? base.toISOString() : referrer.plan_expires_at,
                })
                .eq('id', referrer.id)

              await supabase.from('notifications').insert({
                installer_id: referrer.id,
                type: 'system',
                title: '🎁 ¡Recompensa por referidos!',
                body: `Llegaste a ${paidReferrals} referidos activos. ¡Ganaste 30 días PRO!`,
                link: '/dashboard/referral',
              })
            }
          }
        }

      } else if (mpStatus === 'cancelled' || mpStatus === 'paused') {
        await supabase
          .from('subscriptions')
          .update({ status: mpStatus, updated_at: new Date().toISOString() })
          .eq('id', sub.id)

        await supabase
          .from('installers')
          .update({ plan: 'FREE', subscription_id: null })
          .eq('id', sub.installer_id)
      }

      synced++
    } catch (err) {
      console.error(`[cron] Error syncing preapproval ${sub.mp_preapproval_id}:`, err)
      errors++
    }
  }

  console.log(`[cron] sync-subscriptions: ${synced} updated, ${errors} errors`)
  return NextResponse.json({ synced, errors, total: subs.length })
}
