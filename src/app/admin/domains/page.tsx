import { createServiceRoleClient } from '@/lib/supabase/service'
import DomainVerifyActions from './domain-verify-actions'

export const dynamic = 'force-dynamic'

export default async function AdminDomainsPage() {
  const supabase = createServiceRoleClient()

  const { data: domains } = await supabase
    .from('custom_domains')
    .select('id, domain, verified, dns_verified_at, created_at, installer_id, installers(nombre, apellido, email:user_id(email))')
    .order('created_at', { ascending: false })

  const pending = domains?.filter(d => !d.verified) ?? []
  const verified = domains?.filter(d => d.verified) ?? []

  return (
    <div className="p-6 max-w-4xl space-y-8">
      <h1 className="text-2xl font-bold">Dominios personalizados</h1>

      <section>
        <h2 className="text-lg font-semibold mb-3">Pendientes de verificación ({pending.length})</h2>
        {pending.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sin dominios pendientes.</p>
        ) : (
          <div className="space-y-3">
            {pending.map(d => (
              <div key={d.id} className="rounded-xl border p-4 flex items-center justify-between gap-4">
                <div>
                  <p className="font-medium">{d.domain}</p>
                  <p className="text-xs text-muted-foreground">
                    {(d.installers as any)?.nombre} {(d.installers as any)?.apellido} — solicitado {new Date(d.created_at).toLocaleDateString('es-AR')}
                  </p>
                </div>
                <DomainVerifyActions id={d.id} domain={d.domain} />
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-3">Verificados ({verified.length})</h2>
        {verified.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sin dominios verificados aún.</p>
        ) : (
          <div className="space-y-2">
            {verified.map(d => (
              <div key={d.id} className="rounded-xl border p-3 flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">{d.domain}</p>
                  <p className="text-xs text-muted-foreground">
                    {(d.installers as any)?.nombre} — verificado {d.dns_verified_at ? new Date(d.dns_verified_at).toLocaleDateString('es-AR') : '—'}
                  </p>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/15 text-green-700 dark:text-green-400 font-medium">Activo</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
