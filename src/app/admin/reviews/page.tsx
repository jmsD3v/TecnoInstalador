import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { ReviewsAccordion, type InstallerGroup } from '@/components/admin/reviews-accordion'

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
    .limit(500)

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

function groupByInstaller(reviews: Awaited<ReturnType<typeof getReviews>>): InstallerGroup[] {
  const map = new Map<string, InstallerGroup>()

  for (const r of reviews) {
    const inst = (r as any).installers
    const installerId: string = inst?.id ?? r.installer_id
    const fullName = `${inst?.nombre ?? ''} ${inst?.apellido ?? ''}`.trim()
    const installerName: string = inst?.nombre_comercial ?? fullName ?? '—'

    if (!map.has(installerId)) {
      map.set(installerId, { installerId, installerName, reviews: [] })
    }
    map.get(installerId)!.reviews.push({
      id: r.id,
      rating: r.rating,
      comentario: r.comentario ?? null,
      is_public: r.is_public,
      created_at: r.created_at,
    })
  }

  // Sort groups by most reviews first
  return Array.from(map.values()).sort((a, b) => b.reviews.length - a.reviews.length)
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
  const groups = groupByInstaller(reviews)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-100">Reseñas</h1>
        <span className="text-slate-400 text-sm">
          {reviews.length} reseña{reviews.length !== 1 ? 's' : ''} · {groups.length} instalador{groups.length !== 1 ? 'es' : ''}
        </span>
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

      <ReviewsAccordion groups={groups} />
    </div>
  )
}
