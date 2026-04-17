import { Suspense } from "react"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { createServiceRoleClient } from "@/lib/supabase/service"
import { Navbar } from "@/components/layout/navbar"
import { SiteFooter } from "@/components/layout/site-footer"
import { LoadMore } from "@/components/marketplace/load-more"
import { sortInstallersByPlan } from "@/lib/plans"
import { Search } from "lucide-react"
import { MarketplaceFilters } from "./filters"
import { InstallerCardSkeleton } from "@/components/skeletons/installer-card-skeleton"

const PAGE_SIZE = 12

interface SearchParams {
  ciudad?: string
  provincia?: string
  trade?: string
  q?: string
}

interface Props {
  searchParams: Promise<SearchParams>
}

async function Results({ searchParams }: { searchParams: SearchParams }) {
  const supabase = createServiceRoleClient()
  const { ciudad, provincia, trade, q } = searchParams

  if (!ciudad && !provincia && !q) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Search className="w-12 h-12 mx-auto mb-3 opacity-20" />
        <p className="font-medium">Seleccioná una provincia, ciudad o buscá por nombre</p>
      </div>
    )
  }

  const filteringByTrade = trade && trade !== 'todos'
  const tradeSelect = filteringByTrade
    ? `*, installer_trades!inner(trade:trades(*))`
    : `*, installer_trades(trade:trades(*))`

  let query = supabase
    .from('installers')
    .select(tradeSelect)
    .eq('is_active', true)

  if (ciudad) query = query.ilike('ciudad', `%${ciudad}%`)
  if (provincia && provincia !== 'todas') query = query.ilike('provincia', `%${provincia}%`)
  if (filteringByTrade) query = query.eq('installer_trades.trade.slug', trade)
  if (q && q.trim()) {
    const kw = q.trim()
    query = query.or(
      `nombre.ilike.%${kw}%,apellido.ilike.%${kw}%,nombre_comercial.ilike.%${kw}%,titulo_profesional.ilike.%${kw}%,descripcion.ilike.%${kw}%`
    )
  }

  const { data: installers } = await query
  const location = [ciudad, provincia && provincia !== 'todas' ? provincia : ''].filter(Boolean).join(', ')

  if (!installers || installers.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Search className="w-12 h-12 mx-auto mb-3 opacity-20" />
        <p className="font-medium">No encontramos instaladores en {location}</p>
        <p className="text-sm mt-1">Probá con otra ciudad u oficio</p>
      </div>
    )
  }

  const sorted = sortInstallersByPlan(installers as any)
  const firstPage = sorted.slice(0, PAGE_SIZE)
  const hasMore = sorted.length > PAGE_SIZE

  return (
    <LoadMore
      initialInstallers={firstPage}
      hasMore={hasMore}
      total={sorted.length}
      searchParams={searchParams}
    />
  )
}

export async function generateMetadata({ searchParams }: Props) {
  const { ciudad, provincia, trade } = await searchParams
  const parts = [
    trade && trade !== 'todos' ? trade.charAt(0).toUpperCase() + trade.slice(1).replace(/-/g, ' ') : null,
    ciudad ?? null,
    provincia && provincia !== 'todas' ? provincia : null,
  ].filter(Boolean)

  const title = parts.length > 0
    ? `${parts.join(' en ')} – Profesionales verificados`
    : 'Buscá instaladores y técnicos en Argentina'
  const description = parts.length > 0
    ? `Encontrá ${parts[0] ?? 'profesionales'} en ${parts.slice(1).join(', ') || 'Argentina'} con reseñas reales. Contacto directo por WhatsApp.`
    : 'Buscá electricistas, plomeros, gasistas y más de 30 oficios en toda Argentina. Perfiles verificados con reseñas reales.'

  return { title, description, openGraph: { title, description } }
}

export default async function BuscarPage({ searchParams }: Props) {
  const params = await searchParams
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: trades } = await supabase.from('trades').select('*').order('nombre')

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar user={user} />

      <div className="flex-1 container mx-auto px-4 py-6 md:py-10">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-extrabold mb-2">Buscá un instalador</h1>
          <p className="text-muted-foreground mb-6">
            Encontrá al profesional ideal por ciudad y oficio
          </p>

          <MarketplaceFilters trades={trades ?? []} initialParams={params as any} />

          <div className="mt-8">
            <Suspense fallback={
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => <InstallerCardSkeleton key={i} />)}
              </div>
            }>
              <Results searchParams={params} />
            </Suspense>
          </div>
        </div>
      </div>
      <SiteFooter />
    </div>
  )
}
