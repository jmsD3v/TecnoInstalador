import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import Link from 'next/link'
import { createServiceRoleClient } from '@/lib/supabase/service'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/layout/navbar'
import { SiteFooter } from '@/components/layout/site-footer'
import { ResultsAnimated } from '@/components/marketplace/results-animated'
import { InstallerCardSkeleton } from '@/components/skeletons/installer-card-skeleton'
import { sortInstallersByPlan } from '@/lib/plans'
import { slugify } from '@/lib/utils'
import { ChevronRight, Search } from 'lucide-react'

interface Props {
  params: Promise<{ trade: string; ciudad: string }>
}

// Resolve slug → actual city name by matching slugified DB values
async function resolveCiudad(ciudadSlug: string): Promise<string | null> {
  const supabase = createServiceRoleClient()
  const { data } = await supabase
    .from('installers')
    .select('ciudad')
    .eq('is_active', true)
    .not('ciudad', 'is', null)
  if (!data) return null
  const match = data.find(r => slugify((r.ciudad ?? '').trim()) === ciudadSlug)
  return match?.ciudad?.trim() ?? null
}

async function resolveTrade(tradeSlug: string) {
  const supabase = createServiceRoleClient()
  const { data } = await supabase
    .from('trades')
    .select('id, nombre, slug')
    .eq('slug', tradeSlug)
    .single()
  return data
}

async function getResults(tradeSlug: string, ciudadNombre: string) {
  const supabase = createServiceRoleClient()
  const { data } = await supabase
    .from('installers')
    .select('*, installer_trades!inner(trade:trades(*))')
    .eq('is_active', true)
    .ilike('ciudad', `%${ciudadNombre}%`)
    .eq('installer_trades.trade.slug', tradeSlug)
  return data ?? []
}

export async function generateStaticParams() {
  const supabase = createServiceRoleClient()

  // Only generate pages for combinations with ≥1 active installer
  const { data } = await supabase
    .from('installers')
    .select('ciudad, installer_trades!inner(trade:trades(slug))')
    .eq('is_active', true)
    .not('ciudad', 'is', null)

  if (!data) return []

  const seen = new Set<string>()
  const params: { trade: string; ciudad: string }[] = []

  for (const installer of data) {
    const city = (installer.ciudad ?? '').trim()
    if (!city) continue
    const ciudadSlug = slugify(city)
    for (const it of (installer.installer_trades as any[]) ?? []) {
      const tradeSlug = it.trade?.slug
      if (!tradeSlug) continue
      const key = `${tradeSlug}/${ciudadSlug}`
      if (seen.has(key)) continue
      seen.add(key)
      params.push({ trade: tradeSlug, ciudad: ciudadSlug })
    }
  }

  return params
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { trade: tradeSlug, ciudad: ciudadSlug } = await params
  const [trade, ciudadNombre] = await Promise.all([
    resolveTrade(tradeSlug),
    resolveCiudad(ciudadSlug),
  ])

  if (!trade || !ciudadNombre) return { title: 'Profesionales | TecnoInstalador' }

  const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://tecnoinstalador.com'
  const url = `${APP_URL}/buscar/${tradeSlug}/${ciudadSlug}`
  const title = `${trade.nombre} en ${ciudadNombre} | TecnoInstalador`
  const description = `Encontrá ${trade.nombre.toLowerCase()} en ${ciudadNombre}. Perfiles verificados con reseñas reales. Contacto directo por WhatsApp, sin intermediarios.`

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url },
  }
}

export default async function SEOLandingPage({ params }: Props) {
  const { trade: tradeSlug, ciudad: ciudadSlug } = await params

  const [trade, ciudadNombre] = await Promise.all([
    resolveTrade(tradeSlug),
    resolveCiudad(ciudadSlug),
  ])

  if (!trade || !ciudadNombre) notFound()

  const [installers, authSupabase] = await Promise.all([
    getResults(tradeSlug, ciudadNombre),
    createServerSupabaseClient(),
  ])
  const { data: { user } } = await authSupabase.auth.getUser()
  const sorted = sortInstallersByPlan(installers as any)

  const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://tecnoinstalador.com'

  // JSON-LD: ItemList of professionals
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${trade.nombre} en ${ciudadNombre}`,
    description: `Lista de ${trade.nombre.toLowerCase()} verificados en ${ciudadNombre}, Argentina`,
    url: `${APP_URL}/buscar/${tradeSlug}/${ciudadSlug}`,
    numberOfItems: sorted.length,
    itemListElement: sorted.slice(0, 10).map((inst: any, i: number) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `${APP_URL}/i/${inst.url_slug}`,
      name: inst.nombre_comercial ?? `${inst.nombre} ${inst.apellido}`,
    })),
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/<\/script>/gi, '<\\/script>') }}
      />
      <Navbar user={user} />

      <div className="flex-1 container mx-auto px-4 py-6 md:py-10">
        <div className="max-w-5xl mx-auto">

          {/* Breadcrumb */}
          <nav className="flex items-center gap-1 text-xs text-muted-foreground mb-4">
            <Link href="/" className="hover:text-foreground transition-colors">Inicio</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/buscar" className="hover:text-foreground transition-colors">Buscar</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-foreground">{trade.nombre} en {ciudadNombre}</span>
          </nav>

          <h1 className="text-3xl font-extrabold mb-2">
            {trade.nombre} en {ciudadNombre}
          </h1>
          <p className="text-muted-foreground mb-6">
            {sorted.length > 0
              ? `${sorted.length} profesional${sorted.length !== 1 ? 'es' : ''} verificado${sorted.length !== 1 ? 's' : ''} disponible${sorted.length !== 1 ? 's' : ''}`
              : 'Profesionales verificados con reseñas reales'}
            {' '}— contacto directo por WhatsApp
          </p>

          <Suspense fallback={
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => <InstallerCardSkeleton key={i} />)}
            </div>
          }>
            {sorted.length > 0 ? (
              <ResultsAnimated installers={sorted as any} />
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Search className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p className="font-medium">No hay {trade.nombre.toLowerCase()} en {ciudadNombre} aún</p>
                <p className="text-sm mt-1">
                  <Link href="/auth/register" className="text-primary hover:underline">
                    ¿Sos {trade.nombre.toLowerCase()}? Registrate gratis
                  </Link>
                </p>
              </div>
            )}
          </Suspense>

          {/* CTA para instaladores */}
          {sorted.length > 0 && (
            <div className="mt-10 p-5 rounded-xl border border-primary/20 bg-primary/5 text-center">
              <p className="font-semibold mb-1">¿Sos {trade.nombre.toLowerCase()} en {ciudadNombre}?</p>
              <p className="text-sm text-muted-foreground mb-3">
                Aparecé en esta página y recibí contactos directos por WhatsApp.
              </p>
              <Link
                href="/auth/register"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors"
              >
                Registrate gratis
              </Link>
            </div>
          )}
        </div>
      </div>
      <SiteFooter />
    </div>
  )
}
