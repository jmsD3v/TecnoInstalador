import { createServiceRoleClient } from '@/lib/supabase/service'
import AdminBICharts from './admin-bi-charts'

export const dynamic = 'force-dynamic'

export default async function AdminAnalyticsPage() {
  const supabase = createServiceRoleClient()

  const since30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

  const [
    { data: signups },
    { data: subs },
    { count: totalUsers },
    { count: proUsers },
    { count: premiumUsers },
    { data: mrrData },
  ] = await Promise.all([
    supabase.from('installers').select('created_at, plan').gte('created_at', since30).order('created_at', { ascending: true }),
    supabase.from('subscriptions').select('created_at, status, plan').gte('created_at', since30).order('created_at', { ascending: true }),
    supabase.from('installers').select('id', { count: 'exact', head: true }),
    supabase.from('installers').select('id', { count: 'exact', head: true }).eq('plan', 'PRO'),
    supabase.from('installers').select('id', { count: 'exact', head: true }).eq('plan', 'PREMIUM'),
    supabase.from('subscriptions').select('plan').eq('status', 'authorized'),
  ])

  const PRO_PRICE = Number(process.env.MP_PRICE_PRO_MONTHLY ?? 7999) / 100
  const PREMIUM_PRICE = Number(process.env.MP_PRICE_PREMIUM_MONTHLY ?? 15999) / 100
  const mrr = (mrrData ?? []).reduce((acc, s) => {
    if (s.plan === 'PRO') return acc + PRO_PRICE
    if (s.plan === 'PREMIUM') return acc + PREMIUM_PRICE
    return acc
  }, 0)

  return (
    <div className="p-6 max-w-5xl space-y-8">
      <h1 className="text-2xl font-bold">Analytics del negocio</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Usuarios totales', value: totalUsers ?? 0 },
          { label: 'Plan PRO', value: proUsers ?? 0 },
          { label: 'Plan PREMIUM', value: premiumUsers ?? 0 },
          { label: 'MRR estimado', value: `$${mrr.toFixed(0)}` },
        ].map(k => (
          <div key={k.label} className="rounded-xl border p-4">
            <div className="text-2xl font-bold">{k.value}</div>
            <div className="text-xs text-muted-foreground mt-1">{k.label}</div>
          </div>
        ))}
      </div>

      <AdminBICharts signups={signups ?? []} subs={subs ?? []} />
    </div>
  )
}
