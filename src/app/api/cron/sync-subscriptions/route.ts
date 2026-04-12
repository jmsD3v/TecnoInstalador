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
