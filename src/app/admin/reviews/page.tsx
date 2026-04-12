import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { ReviewToggle } from '@/components/admin/review-toggle'

type Filter = 'all' | 'public' | 'hidden'

async function getReviews(filter: Filter) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  let query = supabase
    .from('reviews')
    .select(`*, installer:installers(nombre, apellido, nombre_comercial)`)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(100)

  if (filter === 'public') query = query.eq('is_public', true)
  if (filter === 'hidden') query = query.eq('is_public', false)

  const { data } = await query
  return data ?? []
}

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'Todas' },
  { key: 'public', label: 'Públicas' },
  { key: 'hidden', label: 'Ocultas' },
]

interface Props { searchParams: Promise<{ filter?: string }> }

export default async function AdminReviewsPage({ searchParams }: Props) {
  const { filter: rawFilter } = await searchParams
  const filter: Filter = (['all', 'public', 'hidden'].includes(rawFilter ?? '') ? rawFilter as Filter : 'all')
  const reviews = await getReviews(filter)

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-slate-100">Reseñas</h1>

      <div className="flex gap-2">
        {FILTERS.map(f => (
          <Link
            key={f.key}
            href={`/admin/reviews?filter=${f.key}`}
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

      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700">
              <th className="text-left p-3 text-slate-400 font-medium">Instalador</th>
              <th className="text-left p-3 text-slate-400 font-medium">Rating</th>
              <th className="text-left p-3 text-slate-400 font-medium hidden md:table-cell">Comentario</th>
              <th className="p-3 text-slate-400 font-medium">Visible</th>
            </tr>
          </thead>
          <tbody>
            {reviews.map(r => {
              const inst = r.installer as any
              const name = inst?.nombre_comercial ?? `${inst?.nombre ?? ''} ${inst?.apellido ?? ''}`.trim()
              return (
                <tr key={r.id} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                  <td className="p-3 text-slate-200">{name}</td>
                  <td className="p-3 text-yellow-400 font-bold">{'★'.repeat(r.rating)}</td>
                  <td className="p-3 text-slate-400 hidden md:table-cell max-w-xs truncate">
                    {r.comentario ?? '—'}
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
