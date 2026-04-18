import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/service'

export const runtime = 'nodejs'
export const maxDuration = 60

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization') ?? ''
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServiceRoleClient()

  // Leads 48h+ old, status contacted/won, not yet auto-notified
  const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()

  const { data: leads, error } = await supabase
    .from('quote_requests')
    .select('id, installer_id, client_name, created_at')
    .in('status', ['contacted', 'won'])
    .lt('created_at', cutoff)
    .eq('auto_review_sent', false)

  if (error) {
    console.error('[cron/auto-review-invites] DB error:', error)
    return NextResponse.json({ error: 'DB error' }, { status: 500 })
  }

  if (!leads || leads.length === 0) {
    return NextResponse.json({ sent: 0 })
  }

  let sent = 0

  for (const lead of leads) {
    try {
      await supabase.from('notifications').insert({
        installer_id: lead.installer_id,
        type: 'system',
        title: '⭐ Pedí una reseña',
        body: lead.client_name
          ? `Pasaron 48h desde tu consulta con ${lead.client_name}. ¡Pedile una reseña!`
          : 'Pasaron 48h desde una consulta reciente. ¡Pedile una reseña al cliente!',
        link: '/dashboard/reviews/invites',
      })

      await supabase
        .from('quote_requests')
        .update({ auto_review_sent: true })
        .eq('id', lead.id)

      sent++
    } catch (err) {
      console.error('[cron/auto-review-invites] error for lead', lead.id, err)
    }
  }

  console.log(`[cron/auto-review-invites] sent ${sent}/${leads.length} notifications`)
  return NextResponse.json({ sent, total: leads.length })
}
