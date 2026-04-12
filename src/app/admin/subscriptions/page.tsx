import { createClient } from '@supabase/supabase-js'

async function getSubscriptions() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data } = await supabase
    .from('subscriptions')
    .select(`*, installer:installers(nombre, apellido, nombre_comercial, ciudad)`)
    .order('created_at', { ascending: false })

  return data ?? []
}

function formatARS(n: number) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n)
}

export default async function AdminSubscriptionsPage() {
  const subs = await getSubscriptions()

  const priceMap: Record<string, number> = {
    'PRO_monthly': Number(process.env.MP_PRICE_PRO_MONTHLY ?? 0),
    'PRO_annual': Math.round(Number(process.env.MP_PRICE_PRO_ANNUAL ?? 0) / 12),
    'PREMIUM_monthly': Number(process.env.MP_PRICE_PREMIUM_MONTHLY ?? 0),
    'PREMIUM_annual': Math.round(Number(process.env.MP_PRICE_PREMIUM_ANNUAL ?? 0) / 12),
  }

  const activeSubs = subs.filter(s => s.status === 'authorized')
  const mrr = activeSubs.reduce((sum, s) => sum + (priceMap[`${s.plan}_${s.billing_period}`] ?? 0), 0)

  const statusColor: Record<string, string> = {
    authorized: 'text-green-400',
    pending: 'text-yellow-400',
    paused: 'text-slate-400',
    cancelled: 'text-red-400',
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-100">Suscripciones</h1>
        <div className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-right">
          <p className="text-xs text-slate-400">MRR estimado</p>
          <p className="text-xl font-bold text-green-400">{formatARS(mrr)}</p>
        </div>
      </div>

      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700">
              <th className="text-left p-3 text-slate-400 font-medium">Instalador</th>
              <th className="text-left p-3 text-slate-400 font-medium">Plan</th>
              <th className="text-left p-3 text-slate-400 font-medium hidden md:table-cell">Período</th>
              <th className="text-left p-3 text-slate-400 font-medium">Estado</th>
              <th className="text-right p-3 text-slate-400 font-medium hidden md:table-cell">Próximo pago</th>
            </tr>
          </thead>
          <tbody>
            {subs.map(s => {
              const inst = s.installer as any
              const name = inst?.nombre_comercial ?? `${inst?.nombre ?? ''} ${inst?.apellido ?? ''}`.trim()
              return (
                <tr key={s.id} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                  <td className="p-3 text-slate-200">{name}</td>
                  <td className={`p-3 font-semibold ${s.plan === 'PREMIUM' ? 'text-yellow-400' : 'text-blue-400'}`}>
                    {s.plan}
                  </td>
                  <td className="p-3 text-slate-400 hidden md:table-cell capitalize">{s.billing_period}</td>
                  <td className={`p-3 font-medium ${statusColor[s.status] ?? 'text-slate-400'}`}>
                    {s.status}
                  </td>
                  <td className="p-3 text-slate-400 text-right hidden md:table-cell">
                    {s.next_payment_date
                      ? new Date(s.next_payment_date).toLocaleDateString('es-AR')
                      : '—'}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
