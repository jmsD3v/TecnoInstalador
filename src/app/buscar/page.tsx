import { Suspense } from "react"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { Navbar } from "@/components/layout/navbar"
import { InstallerCard } from "@/components/marketplace/installer-card"
import { sortInstallersByPlan } from "@/lib/plans"
import { Search } from "lucide-react"
import { MarketplaceFilters } from "./filters"

interface SearchParams {
  ciudad?: string
  trade?: string
  service?: string
}

interface Props {
  searchParams: Promise<SearchParams>
}

async function Results({ searchParams }: { searchParams: SearchParams }) {
  const supabase = await createServerSupabaseClient()
  const { ciudad, trade, service } = searchParams

  if (!ciudad) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Search className="w-12 h-12 mx-auto mb-3 opacity-20" />
        <p className="font-medium">Ingresá una ciudad para buscar instaladores</p>
      </div>
    )
  }

  // Build query
  let query = supabase
    .from('installers')
    .select(`
      *,
      installer_trades!inner(
        trade:trades(*)
      )
    `)
    .eq('is_active', true)
    .ilike('ciudad', `%${ciudad}%`)

  if (trade) {
    // Filter by trade slug via join
    query = supabase
      .from('installers')
      .select(`
        *,
        installer_trades!inner(
          trade:trades!inner(*)
        )
      `)
      .eq('is_active', true)
      .ilike('ciudad', `%${ciudad}%`)
      .eq('installer_trades.trade.slug', trade)
  }

  const { data: installers } = await query

  if (!installers || installers.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Search className="w-12 h-12 mx-auto mb-3 opacity-20" />
        <p className="font-medium">No encontramos instaladores en {ciudad}</p>
        <p className="text-sm mt-1">Probá con otra ciudad u oficio</p>
      </div>
    )
  }

  const sorted = sortInstallersByPlan(installers as any)

  return (
    <div>
      <p className="text-sm text-muted-foreground mb-4">
        {sorted.length} resultado(s) en <strong>{ciudad}</strong>
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sorted.map(installer => (
          <InstallerCard key={installer.id} installer={installer as any} />
        ))}
      </div>
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

          <MarketplaceFilters trades={trades ?? []} initialParams={params} />

          <div className="mt-8">
            <Suspense fallback={
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
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
