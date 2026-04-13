import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  const auth = await requireAdmin()
  if ('error' in auth) return auth.error

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const [
    { count: totalUsers },
    { count: proUsers },
    { count: premiumUsers },
    { count: pendingReviews },
    { data: subs },
  ] = await Promise.all([
    supabase.from('installers').select('*', { count: 'exact', head: true }),
    supabase.from('installers').select('*', { count: 'exact', head: true }).eq('plan', 'PRO'),
    supabase.from('installers').select('*', { count: 'exact', head: true }).eq('plan', 'PREMIUM'),
    supabase.from('reviews').select('*', { count: 'exact', head: true }).eq('is_public', false).is('deleted_at', null),
    supabase.from('subscriptions').select('plan, billing_period').eq('status', 'authorized'),
  ])

  const priceMap: Record<string, number> = {
    'PRO_monthly': Number(process.env.MP_PRICE_PRO_MONTHLY ?? 0),
    'PRO_annual': Math.round(Number(process.env.MP_PRICE_PRO_ANNUAL ?? 0) / 12),
    'PREMIUM_monthly': Number(process.env.MP_PRICE_PREMIUM_MONTHLY ?? 0),
    'PREMIUM_annual': Math.round(Number(process.env.MP_PRICE_PREMIUM_ANNUAL ?? 0) / 12),
  }

  const mrr = (subs ?? []).reduce((sum, s) => {
    return sum + (priceMap[`${s.plan}_${s.billing_period}`] ?? 0)
  }, 0)

  return NextResponse.json({
    totalUsers: totalUsers ?? 0,
    proUsers: proUsers ?? 0,
    premiumUsers: premiumUsers ?? 0,
    freeUsers: (totalUsers ?? 0) - (proUsers ?? 0) - (premiumUsers ?? 0),
    pendingReviews: pendingReviews ?? 0,
    mrr,
  })
}
