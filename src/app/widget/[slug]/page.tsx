import { createServiceRoleClient } from '@/lib/supabase/service'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function WidgetPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = createServiceRoleClient()

  const { data: installer } = await supabase
    .from('installers')
    .select('id, nombre, apellido, nombre_comercial, reviews_count, avg_rating, is_verified')
    .eq('url_slug', slug)
    .eq('is_active', true)
    .single()

  if (!installer) notFound()

  const { data: reviews } = await supabase
    .from('reviews')
    .select('rating, comment, client_name, created_at')
    .eq('installer_id', installer.id)
    .order('created_at', { ascending: false })
    .limit(5)

  const name = installer.nombre_comercial ?? `${installer.nombre} ${installer.apellido}`
  const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://tecnoinstalador.net'
  const avgRating = Number(installer.avg_rating ?? 0)
  const reviewsCount = installer.reviews_count ?? 0

  return (
    <div style={{
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      background: '#fff',
      color: '#111',
      padding: '16px',
      fontSize: '14px',
      minHeight: '100vh',
      margin: 0,
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid #f0f0f0' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 700, fontSize: '15px' }}>{name}</span>
            {installer.is_verified && (
              <span style={{ fontSize: '11px', background: '#ede9fe', color: '#7c3aed', padding: '2px 8px', borderRadius: '20px', fontWeight: 600 }}>
                ✓ Verificado
              </span>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', marginTop: '4px' }}>
            <span style={{ color: '#fbbf24', fontSize: '15px', letterSpacing: '1px' }}>
              {'★'.repeat(Math.round(avgRating))}
              <span style={{ color: '#d1d5db' }}>{'★'.repeat(5 - Math.round(avgRating))}</span>
            </span>
            <span style={{ fontSize: '12px', color: '#6b7280', marginLeft: '6px' }}>
              {avgRating.toFixed(1)} ({reviewsCount} reseña{reviewsCount !== 1 ? 's' : ''})
            </span>
          </div>
        </div>
      </div>

      {/* Reviews */}
      {(reviews ?? []).length === 0 ? (
        <p style={{ fontSize: '13px', color: '#9ca3af', textAlign: 'center', padding: '16px 0' }}>
          Todavía no hay reseñas.
        </p>
      ) : (
        (reviews ?? []).map((r, i) => (
          <div key={i} style={{ paddingBottom: '10px', marginBottom: '10px', borderBottom: i < (reviews ?? []).length - 1 ? '1px solid #f3f4f6' : 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontWeight: 600, fontSize: '13px' }}>{r.client_name ?? 'Cliente'}</span>
              <span style={{ fontSize: '11px', color: '#9ca3af' }}>
                {new Date(r.created_at).toLocaleDateString('es-AR')}
              </span>
            </div>
            <div style={{ marginBottom: '4px' }}>
              <span style={{ color: '#fbbf24', fontSize: '13px' }}>
                {'★'.repeat(r.rating)}
                <span style={{ color: '#d1d5db' }}>{'★'.repeat(5 - r.rating)}</span>
              </span>
            </div>
            {r.comment && (
              <p style={{ margin: 0, fontSize: '13px', color: '#374151', lineHeight: 1.5 }}>{r.comment}</p>
            )}
          </div>
        ))
      )}

      {/* Footer */}
      <div style={{ marginTop: '14px', paddingTop: '10px', borderTop: '1px solid #f0f0f0', textAlign: 'center', fontSize: '11px', color: '#9ca3af' }}>
        <a
          href={`${APP_URL}/i/${slug}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: '#7c3aed', textDecoration: 'none' }}
        >
          Ver perfil completo en TecnoInstalador
        </a>
      </div>
    </div>
  )
}
