import { createClient } from '@supabase/supabase-js'
import { AnimatedCounters } from '@/components/admin/animated-counters'

async function getStats() {
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

  const mrr = (subs ?? []).reduce((sum, s) => sum + (priceMap[`${s.plan}_${s.billing_period}`] ?? 0), 0)

  return {
    totalUsers: totalUsers ?? 0,
    proUsers: proUsers ?? 0,
    premiumUsers: premiumUsers ?? 0,
    freeUsers: (totalUsers ?? 0) - (proUsers ?? 0) - (premiumUsers ?? 0),
    pendingReviews: pendingReviews ?? 0,
    mrr,
  }
}

export default async function AdminOverviewPage() {
  const stats = await getStats()

  const cards = [
    { label: 'Total usuarios', value: stats.totalUsers, icon: 'users' as const, color: 'text-sky-400' },
    { label: 'Plan PRO', value: stats.proUsers, icon: 'trending' as const, color: 'text-blue-400' },
    { label: 'Plan PREMIUM', value: stats.premiumUsers, icon: 'star' as const, color: 'text-yellow-400' },
    { label: 'MRR estimado', value: stats.mrr, prefix: '$', icon: 'credit' as const, color: 'text-green-400' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Overview</h1>
        <p className="text-slate-400 text-sm mt-1">Estado general de la plataforma</p>
      </div>

      <AnimatedCounters cards={cards} />

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <p className="text-sm text-slate-400 mb-1">Plan FREE</p>
          <p className="text-2xl font-bold text-slate-300">{stats.freeUsers}</p>
        </div>
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <p className="text-sm text-slate-400 mb-1">Reseñas pendientes</p>
          <p className={`text-2xl font-bold ${stats.pendingReviews > 0 ? 'text-orange-400' : 'text-slate-300'}`}>
            {stats.pendingReviews}
          </p>
        </div>
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <p className="text-sm text-slate-400 mb-1">Pagos activos</p>
          <p className="text-2xl font-bold text-slate-300">{stats.proUsers + stats.premiumUsers}</p>
        </div>
      </div>
    </div>
  )
}
