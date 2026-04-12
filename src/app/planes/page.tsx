import { Navbar } from "@/components/layout/navbar"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { fetchPlanPrices } from "@/lib/mp-plans"
import { PricingCards } from "@/components/pricing/pricing-cards"

export default async function PlanesPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  const prices = fetchPlanPrices()

  return (
    <>
      <Navbar user={user} />
      <main className="container mx-auto px-4 py-16 max-w-5xl">
        <div className="text-center mb-12">
          <p className="text-xs font-bold text-primary uppercase tracking-[0.2em] mb-3">Planes</p>
          <h1 className="text-4xl font-extrabold tracking-tight mb-3">
            Invertí en tu presencia digital
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Más visibilidad, más clientes, más trabajo. Empezá gratis y escalá cuando quieras.
          </p>
        </div>

        <PricingCards
          prices={prices}
          mode="public"
          isLoggedIn={!!user}
        />
      </main>
    </>
  )
}
