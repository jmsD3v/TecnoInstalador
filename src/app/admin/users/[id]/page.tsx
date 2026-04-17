import { notFound } from 'next/navigation'
import { createServiceRoleClient } from '@/lib/supabase/service'
import Link from 'next/link'
import { ArrowLeft, History } from 'lucide-react'
import { UserActions } from '@/components/admin/user-actions'
import { AdminPlanActions } from '@/components/admin/admin-plan-actions'

async function getInstaller(id: string) {
  const supabase = createServiceRoleClient()
  const { data, error } = await supabase
    .from('installers')
    .select(`*, subscriptions!installer_id(id, status, plan, billing_period, next_payment_date, mp_preapproval_id, created_at, updated_at)`)
    .eq('id', id)
    .single()
  if (error) console.error('[admin/users/[id]] query error:', error.message, '| id:', id)
  return data
}

interface Props { params: Promise<{ id: string }> }

export default async function AdminUserDetailPage({ params }: Props) {
  const { id } = await params
  const installer = await getInstaller(id)
  if (!installer) notFound()

  const subs: any[] = installer.subscriptions ?? []
  const latestSub = subs[0]
  const displayName = installer.nombre_comercial ?? `${installer.nombre} ${installer.apellido}`

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Link href="/admin/users" className="text-slate-400 hover:text-slate-100">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-slate-100">{displayName}</h1>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
          installer.is_active ? 'bg-green-900 text-green-400' : 'bg-red-900 text-red-400'
        }`}>
          {installer.is_active ? 'Activo' : 'Inactivo'}
        </span>
        {installer.is_verified && (
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-sky-900 text-sky-400">✅ Verificado</span>
        )}
      </div>

      {/* Info */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-4 text-sm">
        <div className="grid grid-cols-2 gap-y-2">
          <span className="text-slate-400">Plan actual</span>
          <span className="text-slate-200 font-semibold">{installer.plan}</span>
          <span className="text-slate-400">Trial hasta</span>
          <span className="text-slate-200">
            {installer.trial_ends_at
              ? new Date(installer.trial_ends_at).toLocaleString('es-AR')
              : '—'}
          </span>
          <span className="text-slate-400">Plan vence</span>
          <span className="text-slate-200">
            {installer.plan_expires_at
              ? new Date(installer.plan_expires_at).toLocaleString('es-AR')
              : '—'}
          </span>
          <span className="text-slate-400">Ciudad</span>
          <span className="text-slate-200">{installer.ciudad}, {installer.provincia}</span>
          <span className="text-slate-400">WhatsApp</span>
          <span className="text-slate-200">{installer.whatsapp || '—'}</span>
          <span className="text-slate-400">Slug</span>
          <span className="text-slate-200 font-mono text-xs">{installer.url_slug}</span>
          {latestSub && (
            <>
              <span className="text-slate-400">Suscripción MP</span>
              <span className="text-slate-200">{latestSub.plan} {latestSub.billing_period} — {latestSub.status}</span>
              {latestSub.next_payment_date && (
                <>
                  <span className="text-slate-400">Próximo pago</span>
                  <span className="text-slate-200">{new Date(latestSub.next_payment_date).toLocaleDateString('es-AR')}</span>
                </>
              )}
            </>
          )}
        </div>
      </div>

      {/* Manual plan change */}
      <AdminPlanActions
        installerId={id}
        currentPlan={installer.plan}
        currentTrialEndsAt={installer.trial_ends_at}
        currentPlanExpiresAt={installer.plan_expires_at}
      />

      {/* Subscription history */}
      {subs.length > 0 && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 space-y-3">
          <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <History className="w-4 h-4" /> Historial de suscripciones
          </h2>
          <div className="space-y-2">
            {subs.map((s: any) => (
              <div key={s.id} className="flex items-start justify-between text-sm border border-slate-700 rounded-lg px-3 py-2">
                <div>
                  <span className="font-semibold text-slate-200">{s.plan}</span>
                  <span className="text-slate-400 ml-2">{s.billing_period}</span>
                  {s.mp_preapproval_id && (
                    <span className="text-xs text-slate-500 ml-2 font-mono">{s.mp_preapproval_id.slice(0, 12)}…</span>
                  )}
                  <p className="text-xs text-slate-500 mt-0.5">
                    Creada: {new Date(s.created_at).toLocaleString('es-AR')}
                    {s.next_payment_date && ` · Próximo: ${new Date(s.next_payment_date).toLocaleDateString('es-AR')}`}
                  </p>
                </div>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  s.status === 'authorized' ? 'bg-green-900 text-green-400' :
                  s.status === 'paused' ? 'bg-yellow-900 text-yellow-400' :
                  'bg-slate-700 text-slate-400'
                }`}>
                  {s.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Account actions */}
      <UserActions installerId={id} isActive={installer.is_active} />
    </div>
  )
}
