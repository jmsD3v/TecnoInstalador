import { notFound } from "next/navigation"
import { Metadata } from "next"
import { MapPin, Star, CheckCircle2, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { createServiceRoleClient } from "@/lib/supabase/service"
import { PlanBadge } from "@/components/ui/plan-badge"
import { StarRating, InstallerAvatar } from "@/components/ui/avatar"
import { CollapsibleReviews } from "@/components/installer/collapsible-reviews"
import { QuoteModal } from "@/components/installer/quote-modal"
import { COLOR_PALETTES } from "@/types"
import { getTradeIcon } from "@/lib/trade-icons"
import { Navbar } from "@/components/layout/navbar"
import { SiteFooter } from "@/components/layout/site-footer"
import { ProfileAnimated } from "@/components/installer/profile-animated"

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = createServiceRoleClient()
  const { data } = await supabase
    .from('installers')
    .select('nombre, apellido, nombre_comercial, ciudad, descripcion')
    .eq('url_slug', slug)
    .eq('is_active', true)
    .single()

  if (!data) return { title: 'Instalador no encontrado' }
  const name = data.nombre_comercial ?? `${data.nombre} ${data.apellido}`
  const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://tecnoinstalador.com'
  const url = `${APP_URL}/i/${slug}`
  const title = `${name} – ${data.ciudad} | TecnoInstalador`
  const description = data.descripcion
    ?? `Contratá a ${name} en ${data.ciudad}. Profesional con reseñas reales. Contacto directo por WhatsApp.`
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: 'profile',
    },
  }
}

export default async function InstallerProfilePage({ params }: Props) {
  const { slug } = await params
  // Use auth client only for session (navbar), service role for public profile data
  const authSupabase = await createServerSupabaseClient()
  const { data: { user } } = await authSupabase.auth.getUser()
  const supabase = createServiceRoleClient()

  const { data: installer } = await supabase
    .from('installers')
    .select(`
      *,
      installer_trades(trade:trades(*)),
      installer_services(service:services(*)),
      gallery_items(*),
      reviews(*)
    `)
    .eq('url_slug', slug)
    .eq('is_active', true)
    .single()

  if (!installer) notFound()

  supabase.rpc('increment_stat', { p_installer_id: installer.id, p_field: 'profile_views' }).then(() => {})

  const palette = COLOR_PALETTES[installer.color_palette as keyof typeof COLOR_PALETTES] ?? COLOR_PALETTES.azul
  const displayName = installer.nombre_comercial ?? `${installer.nombre} ${installer.apellido}`
  const trades  = installer.installer_trades?.map((it: any) => it.trade).filter(Boolean) ?? []
  const services = installer.installer_services?.map((is_: any) => is_.service).filter(Boolean) ?? []
  const gallery  = installer.gallery_items ?? []
  const reviews  = (installer.reviews ?? []).filter((r: any) => r.is_public)
  const mainTrade = trades[0]?.nombre ?? 'Profesional'


  const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://tecnoinstalador.com'
  const profileUrl = `${APP_URL}/i/${installer.url_slug}`

  // JSON-LD: LocalBusiness + BreadcrumbList
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'LocalBusiness',
        '@id': profileUrl,
        name: displayName,
        description: installer.descripcion ?? `Profesional de ${mainTrade} en ${installer.ciudad}`,
        url: profileUrl,
        telephone: installer.whatsapp ? `+54${installer.whatsapp}` : undefined,
        address: {
          '@type': 'PostalAddress',
          addressLocality: installer.ciudad,
          addressRegion: installer.provincia,
          addressCountry: 'AR',
        },
        ...(installer.foto_perfil_url && { image: installer.foto_perfil_url }),
        ...(installer.total_reviews > 0 && {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: installer.avg_rating.toFixed(1),
            reviewCount: installer.total_reviews,
            bestRating: '5',
            worstRating: '1',
          },
        }),
        ...(reviews.length > 0 && {
          review: reviews.slice(0, 5).map((r: any) => ({
            '@type': 'Review',
            author: { '@type': 'Person', name: r.nombre_cliente },
            reviewRating: { '@type': 'Rating', ratingValue: r.rating, bestRating: '5' },
            reviewBody: r.comentario,
          })),
        }),
        hasOfferCatalog: trades.length > 0 ? {
          '@type': 'OfferCatalog',
          name: 'Servicios',
          itemListElement: trades.map((t: any) => ({
            '@type': 'Offer',
            itemOffered: { '@type': 'Service', name: t.nombre },
          })),
        } : undefined,
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Inicio', item: APP_URL },
          { '@type': 'ListItem', position: 2, name: 'Buscar instaladores', item: `${APP_URL}/buscar` },
          { '@type': 'ListItem', position: 3, name: displayName, item: profileUrl },
        ],
      },
    ],
  }

  return (
    <div className="min-h-screen bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/<\/script>/gi, '<\\/script>') }}
      />
      <Navbar user={user} />

      {/* ── BACK LINK ─────────────────────────────── */}
      <div className="container max-w-2xl mx-auto px-4 pt-4">
        <Link href="/buscar" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />
          Buscar instaladores
        </Link>
      </div>

      {/* ── COVER ─────────────────────────────────── */}
      <div
        className={installer.banner_url ? "h-56 md:h-72 relative overflow-hidden" : "h-36 md:h-48 relative overflow-hidden"}
        style={installer.banner_url ? undefined : { background: `linear-gradient(135deg, ${palette.primary}ee, ${palette.primary}99)` }}
      >
        {installer.banner_url ? (
          <img
            src={installer.banner_url}
            className="absolute inset-0 w-full h-full object-cover"
            alt=""
            style={{ objectPosition: `center ${installer.banner_position_y ?? 50}%` }}
          />
        ) : (
          /* subtle grid overlay */
          <div className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)`,
              backgroundSize: '32px 32px',
            }}
          />
        )}
      </div>

      {/* ── PROFILE CARD ───────────────────────────── */}
      {/*
        Math: avatar xl = h-24 = 96px, half = 48px = 12 * 4px
        Container starts exactly at cover bottom (no -mt).
        Avatar is absolute -top-12 (48px above card top) → center at cover/card boundary.
        Card pt-14 (56px) = space for the bottom half of the avatar + breathing room.
      */}
      <ProfileAnimated>
      <div className="container max-w-2xl mx-auto px-4 pb-32 relative z-10">
        <div className="relative animate-in">

          {/* Avatar — positioned straddling cover and card */}
          <div className="absolute -top-12 left-5 z-20">
            <InstallerAvatar
              nombre={installer.nombre}
              apellido={installer.apellido}
              fotoUrl={installer.foto_perfil_url}
              size="xl"
              className="ring-4 ring-background shadow-xl"
            />
          </div>
          {/* Plan badge — top-right of card */}
          <div className="absolute top-3 right-4 z-20">
            <PlanBadge plan={installer.plan} />
          </div>

        <div className="bg-card rounded-2xl border border-border shadow-xl">

          {/* Name + info — pt-14 leaves room for avatar bottom half */}
          <div className="px-5 pt-14 pb-5">
            <h1 className="text-2xl font-extrabold leading-tight">{displayName}</h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              {installer.titulo_profesional || mainTrade}
            </p>

            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="w-3.5 h-3.5" />
                {installer.ciudad}, {installer.provincia}
              </span>
              {installer.is_verified && (
                <span className="flex items-center gap-1 text-xs font-semibold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="w-3 h-3 fill-sky-500/20" />
                  Verificado
                </span>
              )}
              {installer.availability_status === 'available' && (
                <span className="text-xs font-semibold text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800 px-2 py-0.5 rounded-full">
                  ✅ Disponible
                </span>
              )}
              {installer.availability_status === 'busy' && (
                <span className="text-xs font-semibold text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 px-2 py-0.5 rounded-full">
                  🔴 Ocupado
                </span>
              )}
              {installer.availability_status === 'on_demand' && (
                <span className="text-xs font-semibold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 px-2 py-0.5 rounded-full">
                  🟡 Bajo demanda
                </span>
              )}
            </div>

            {/* Rating */}
            {installer.total_reviews > 0 && (
              <div className="flex items-center gap-2 mt-3">
                <StarRating rating={installer.avg_rating} size="sm" />
                <span className="text-sm font-bold">{installer.avg_rating.toFixed(1)}</span>
                <span className="text-xs text-muted-foreground">({installer.total_reviews} reseñas)</span>
                <CheckCircle2 className="w-4 h-4 text-sky-500 fill-sky-500/20" />
              </div>
            )}

            {/* Bio */}
            {installer.descripcion && (
              <p className="mt-4 text-sm text-muted-foreground leading-relaxed border-t border-border pt-4">
                {installer.descripcion}
              </p>
            )}
          </div>

          {/* ── GALLERY ──────────────────────────────── */}
          {gallery.length > 0 && (
            <div className="px-5 pb-5 border-t border-border animate-in">
              <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mt-4 mb-3">
                Galería
              </h2>
              <div className="grid grid-cols-3 gap-2">
                {gallery.slice(0, 6).map((item: any) => (
                  <div key={item.id} className="aspect-square rounded-xl overflow-hidden bg-muted relative group">
                    <img
                      src={item.image_url}
                      alt={item.titulo ?? 'Trabajo'}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                    {(item.titulo || item.descripcion) && (
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2">
                        {item.titulo && <p className="text-white text-xs font-semibold leading-tight line-clamp-1">{item.titulo}</p>}
                        {item.descripcion && <p className="text-white/80 text-[10px] leading-tight line-clamp-2 mt-0.5">{item.descripcion}</p>}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── TRADES ───────────────────────────────── */}
          {trades.length > 0 && (
            <div className="px-5 pb-5 border-t border-border animate-in">
              <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mt-4 mb-3">
                Oficios
              </h2>
              <div className="grid grid-cols-4 gap-x-2 gap-y-4">
                {trades.map((trade: any) => {
                  const { Icon, gradient } = getTradeIcon(trade.nombre)
                  return (
                    <div key={trade.id} className="flex flex-col items-center gap-1.5">
                      <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-md shrink-0`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-xs font-medium text-muted-foreground text-center leading-tight w-full">
                        {trade.nombre}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* ── SERVICES ─────────────────────────────── */}
          {services.length > 0 && (
            <div className="px-5 pb-5 border-t border-border animate-in">
              <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mt-4 mb-3">
                Servicios destacados
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {services.slice(0, 10).map((service: any) => (
                  <div key={service.id} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: palette.primary }} />
                    <span>{service.nombre}</span>
                  </div>
                ))}
              </div>
              {services.length > 10 && (
                <p className="text-xs text-muted-foreground mt-2">+{services.length - 10} servicios más</p>
              )}
            </div>
          )}

          {/* ── CTA INLINE ───────────────────────────── */}
          <div className="px-5 pb-5 pt-2 border-t border-border">
            <QuoteModal
              whatsapp={installer.whatsapp}
              installerName={displayName}
              installerId={installer.id}
              label="Pedir presupuesto por WhatsApp"
              fullWidth
            />
          </div>

        </div>{/* end card */}
        </div>{/* end relative wrapper */}

        {/* ── REVIEWS ──────────────────────────────── */}
        {reviews.length > 0 && (
          <div className="mt-6 animate-in">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-lg font-bold">Reseñas</h2>
              <span className="text-sm text-muted-foreground">({reviews.length})</span>
              {installer.total_reviews > 0 && (
                <div className="flex items-center gap-1 ml-auto">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  <span className="font-bold text-sm">{installer.avg_rating.toFixed(1)}</span>
                </div>
              )}
            </div>
            <CollapsibleReviews reviews={reviews} />
          </div>
        )}
      </div>{/* end container */}
      </ProfileAnimated>
      <SiteFooter />
    </div>
  )
}
