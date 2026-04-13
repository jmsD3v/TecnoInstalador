import { notFound } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { UserActions } from '@/components/admin/user-actions'

async function getInstaller(id: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  const { data } = await supabase
    .from('installers')
    .select(`*, subscriptions(status, plan, billing_period, next_payment_date)`)
    .eq('id', id)
    .single()
  return data
}

interface Props { params: Promise<{ id: string }> }

export default async function AdminUserDetailPage({ params }: Props) {
  const { id } = await params
  const installer = await getInstaller(id)
  if (!installer) notFound()

  const sub = installer.subscriptions?.[0]
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
      </div>

      <div className="bg-slate-800 rounded-xl border border-slate-700 p-4 text-sm">
        <div className="grid grid-cols-2 gap-y-2">
          <span className="text-slate-400">Plan</span>
          <span className="text-slate-200 font-semibold">{installer.plan}</span>
          <span className="text-slate-400">Ciudad</span>
          <span className="text-slate-200">{installer.ciudad}, {installer.provincia}</span>
          <span className="text-slate-400">WhatsApp</span>
          <span className="text-slate-200">{installer.whatsapp}</span>
          {sub && <>
            <span className="text-slate-400">Suscripción</span>
            <span className="text-slate-200">{sub.plan} {sub.billing_period} — {sub.status}</span>
          </>}
        </div>
      </div>

      <UserActions installerId={id} isActive={installer.is_active} />
    </div>
  )
}
