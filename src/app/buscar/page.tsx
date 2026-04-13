import { Suspense } from "react"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { Navbar } from "@/components/layout/navbar"
import { ResultsAnimated } from "@/components/marketplace/results-animated"
import { sortInstallersByPlan } from "@/lib/plans"
import { Search } from "lucide-react"
import { MarketplaceFilters } from "./filters"
import { InstallerCardSkeleton } from "@/components/skeletons/installer-card-skeleton"

interface SearchParams {
  ciudad?: string
  provincia?: string
  trade?: string
}

interface Props {
  searchParams: Promise<SearchParams>
}

async function Results({ searchParams }: { searchParams: SearchParams }) {
  const supabase = await createServerSupabaseClient()
  const { ciudad, provincia, trade } = searchParams

  if (!ciudad && !provincia) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Search className="w-12 h-12 mx-auto mb-3 opacity-20" />
        <p className="font-medium">Seleccioná una provincia o ciudad para buscar</p>
      </div>
    )
  }

  let query = supabase
    .from('installers')
    .select(`*, installer_trades!inner(trade:trades(*))`)
    .eq('is_active', true)

  if (ciudad) query = query.ilike('ciudad', `%${ciudad}%`)
  if (provincia && provincia !== 'todas') query = query.ilike('provincia', `%${provincia}%`)
  if (trade && trade !== 'todos') query = query.eq('installer_trades.trade.slug', trade)

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

  return (
    <div>
      <p className="text-sm text-muted-foreground mb-4">
        {sorted.length} resultado(s) en <strong>{location}</strong>
      </p>
      <ResultsAnimated installers={sorted as any} />
    </div>
  )
}

export default async function BuscarPage({ searchParams }: Props) {
  const params = await searchParams
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: trades } = await supabase.from('trades').select('*').order('nombre')

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={user} />

      <div className="container mx-auto px-4 py-6 md:py-10">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-extrabold mb-2">Buscá un instalador</h1>
          <p className="text-muted-foreground mb-6">
            Encontrá al profesional ideal por ciudad y oficio
          </p>

          <MarketplaceFilters trades={trades ?? []} initialParams={params as any} />

          <div className="mt-8">
            <Suspense fallback={
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <InstallerCardSkeleton key={i} />
                ))}
              </div>
            }>
              <Results searchParams={params} />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  )
}
