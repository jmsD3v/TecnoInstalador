import { createServiceRoleClient } from '@/lib/supabase/service'
import { VerificationActions } from './verification-actions'
import { BadgeCheck, Clock, CheckCircle2, XCircle } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AdminVerificationsPage() {
  const service = createServiceRoleClient()

  const { data: requests, error } = await service
    .from('verification_requests')
    .select(`
      id, status, doc_urls, admin_note, created_at, reviewed_at,
      installers!installer_id(id, nombre, apellido, nombre_comercial, ciudad, provincia, is_verified, user_id)
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[admin/verifications]', error)
    return <div className="text-red-400">Error al cargar solicitudes</div>
  }

  const pending = requests?.filter(r => r.status === 'pending') ?? []
  const reviewed = requests?.filter(r => r.status !== 'pending') ?? []

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <BadgeCheck className="w-6 h-6 text-orange-400" />
        <h1 className="text-2xl font-bold">Verificaciones</h1>
        {pending.length > 0 && (
          <span className="bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
            {pending.length} pendiente{pending.length > 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Pending */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Pendientes</h2>
        {pending.length === 0 ? (
          <p className="text-slate-500 text-sm">No hay solicitudes pendientes.</p>
        ) : (
          pending.map(r => (
            <VerificationCard key={r.id} request={r} />
          ))
        )}
      </section>

      {/* Reviewed */}
      {reviewed.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Revisadas</h2>
          {reviewed.map(r => (
            <VerificationCard key={r.id} request={r} readOnly />
          ))}
        </section>
      )}
    </div>
  )
}

function VerificationCard({ request, readOnly = false }: { request: any; readOnly?: boolean }) {
  const installer = Array.isArray(request.installers) ? request.installers[0] : request.installers
  const displayName = installer?.nombre_comercial ?? `${installer?.nombre} ${installer?.apellido}`

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 space-y-4">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2">
            <p className="font-semibold text-slate-100">{displayName}</p>
            {request.status === 'pending' && <Clock className="w-4 h-4 text-amber-400" />}
            {request.status === 'approved' && <CheckCircle2 className="w-4 h-4 text-green-400" />}
            {request.status === 'rejected' && <XCircle className="w-4 h-4 text-red-400" />}
          </div>
          <p className="text-sm text-slate-400">{[installer?.ciudad, installer?.provincia].filter(Boolean).join(', ')}</p>
          <p className="text-xs text-slate-500 mt-1">
            Enviada: {new Date(request.created_at).toLocaleString('es-AR')}
            {request.reviewed_at && ` · Revisada: ${new Date(request.reviewed_at).toLocaleString('es-AR')}`}
          </p>
        </div>
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
          request.status === 'pending' ? 'bg-amber-500/20 text-amber-300' :
          request.status === 'approved' ? 'bg-green-500/20 text-green-300' :
          'bg-red-500/20 text-red-300'
        }`}>
          {request.status === 'pending' ? 'Pendiente' : request.status === 'approved' ? 'Aprobada' : 'Rechazada'}
        </span>
      </div>

      {/* Docs */}
      <div>
        <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">Documentos adjuntos ({request.doc_urls?.length ?? 0})</p>
        <div className="flex flex-wrap gap-2">
          {(request.doc_urls ?? []).map((path: string, i: number) => (
            <DocLink key={i} path={path} index={i} requestId={request.id} />
          ))}
        </div>
      </div>

      {request.admin_note && (
        <div className="bg-slate-700/50 rounded-lg px-3 py-2 text-sm text-slate-300">
          <strong className="text-slate-400">Nota:</strong> {request.admin_note}
        </div>
      )}

      {!readOnly && (
        <VerificationActions
          requestId={request.id}
          installerId={installer?.id}
          installerName={displayName}
        />
      )}
    </div>
  )
}

function DocLink({ path, index, requestId }: { path: string; index: number; requestId: string }) {
  const ext = path.split('.').pop()?.toUpperCase() ?? 'FILE'
  return (
    <a
      href={`/api/admin/verifications/doc?path=${encodeURIComponent(path)}`}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 text-xs bg-slate-700 hover:bg-slate-600 text-slate-200 px-3 py-1.5 rounded-lg transition-colors border border-slate-600"
    >
      📄 Doc {index + 1} ({ext})
    </a>
  )
}
