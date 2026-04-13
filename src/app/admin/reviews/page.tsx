import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { ReviewToggle } from '@/components/admin/review-toggle'

type Filter = 'all' | 'public' | 'hidden'

async function getReviews(filter: Filter, search?: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  let query = supabase
    .from('reviews')
    .select('id, rating, comentario, is_public, created_at, installer_id, installers!inner(id, nombre, apellido, nombre_comercial)')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(200)

  if (filter === 'public') query = query.eq('is_public', true)
  if (filter === 'hidden') query = query.eq('is_public', false)
  if (search) {
    query = query.or(
      `nombre.ilike.%${search}%,apellido.ilike.%${search}%,nombre_comercial.ilike.%${search}%`,
      { referencedTable: 'installers' }
    )
  }

  const { data } = await query
  return data ?? []
}

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'Todas' },
  { key: 'public', label: 'Aprobadas' },
  { key: 'hidden', label: 'Ocultas' },
]

interface Props { searchParams: Promise<{ filter?: string; q?: string }> }

export default async function AdminReviewsPage({ searchParams }: Props) {
  const { filter: rawFilter, q } = await searchParams
  const filter: Filter = (['all', 'public', 'hidden'].includes(rawFilter ?? '') ? rawFilter as Filter : 'all')
  const reviews = await getReviews(filter, q)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-100">Reseñas</h1>
        <span className="text-slate-400 text-sm">{reviews.length} resultados</span>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex gap-2">
          {FILTERS.map(f => (
            <Link
              key={f.key}
              href={`/admin/reviews?filter=${f.key}${q ? `&q=${encodeURIComponent(q)}` : ''}`}
              className={cn(
                'px-4 py-1.5 rounded-lg text-sm font-medium transition-colors',
                filter === f.key
                  ? 'bg-orange-500 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-100 border border-slate-700'
              )}
            >
              {f.label}
            </Link>
          ))}
        </div>
        <form method="GET" className="flex-1">
          <input type="hidden" name="filter" value={filter} />
          <input
            name="q"
            defaultValue={q}
            placeholder="Filtrar por instalador..."
            className="w-full bg-slate-800 border border-slate-700 text-slate-100 rounded-lg px-3 py-1.5 text-sm placeholder:text-slate-500 focus:outline-none focus:border-orange-500"
          />
        </form>
      </div>

      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700">
              <th className="text-left p-3 text-slate-400 font-medium">Instalador</th>
              <th className="text-left p-3 text-slate-400 font-medium">Rating</th>
              <th className="text-left p-3 text-slate-400 font-medium hidden md:table-cell">Comentario</th>
              <th className="text-left p-3 text-slate-400 font-medium">Estado</th>
              <th className="p-3 text-slate-400 font-medium">Acción</th>
            </tr>
          </thead>
          <tbody>
            {reviews.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-500">Sin resultados</td>
              </tr>
            )}
            {reviews.map(r => {
              const inst = (r as any).installers
              const name = inst?.nombre_comercial ?? `${inst?.nombre ?? ''} ${inst?.apellido ?? ''}`.trim()
              return (
                <tr key={r.id} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                  <td className="p-3 text-slate-200 font-medium">{name || '—'}</td>
                  <td className="p-3 text-yellow-400 font-bold">{'★'.repeat(r.rating)}</td>
                  <td className="p-3 text-slate-400 hidden md:table-cell max-w-xs truncate">
                    {r.comentario ?? '—'}
                  </td>
                  <td className="p-3">
                    <span className={cn(
                      'text-xs font-semibold px-2 py-0.5 rounded-full',
                      r.is_public
                        ? 'bg-green-900/50 text-green-400'
                        : 'bg-red-900/50 text-red-400'
                    )}>
                      {r.is_public ? 'Aprobada' : 'Oculta'}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <ReviewToggle reviewId={r.id} isPublic={r.is_public} />
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
