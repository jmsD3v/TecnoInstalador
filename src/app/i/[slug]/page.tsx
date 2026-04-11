import { notFound } from "next/navigation"
import { Metadata } from "next"
import { MapPin, Star, CheckCircle2, MessageCircle, Share2 } from "lucide-react"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { PlanBadge } from "@/components/ui/plan-badge"
import { StarRating, InstallerAvatar } from "@/components/ui/avatar"
import { ReviewCard } from "@/components/reviews/review-card"
import { WhatsAppCTA } from "@/components/installer/whatsapp-cta"
import { COLOR_PALETTES } from "@/types"
import { buildContactMessage } from "@/lib/utils"
import { Navbar } from "@/components/layout/navbar"

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase
    .from('installers')
    .select('nombre, apellido, nombre_comercial, ciudad, descripcion')
    .eq('url_slug', slug)
    .single()

  if (!data) return { title: 'Instalador no encontrado' }
  const name = data.nombre_comercial ?? `${data.nombre} ${data.apellido}`
  return {
    title: `${name} – ${data.ciudad}`,
    description: data.descripcion ?? `Perfil profesional de ${name}`,
  }
}

export default async function InstallerProfilePage({ params }: Props) {
  const { slug } = await params
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

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

  const waUrl = `https://wa.me/${installer.whatsapp}?text=${encodeURIComponent(
    buildContactMessage(displayName)
  )}`

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={user} />

      {/* ── COVER ─────────────────────────────────── */}
      <div
        className={installer.banner_url ? "h-48 md:h-56 relative overflow-hidden" : "h-32 md:h-44 relative overflow-hidden"}
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
      <div className="container max-w-2xl mx-auto px-4 pb-32 relative z-10">
        <div className="relative">

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
            <div className="px-5 pb-5 border-t border-border">
              <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mt-4 mb-3">
                Galería
              </h2>
              <div className="grid grid-cols-3 gap-2">
                {gallery.slice(0, 6).map((item: any) => (
                  <div key={item.id} className="aspect-square rounded-xl overflow-hidden bg-muted">
                    <img
                      src={item.image_url}
                      alt={item.titulo ?? 'Trabajo'}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── TRADES ───────────────────────────────── */}
          {trades.length > 0 && (
            <div className="px-5 pb-5 border-t border-border">
              <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mt-4 mb-3">
                Oficios
              </h2>
              <div className="flex flex-wrap gap-2">
                {trades.map((trade: any) => (
                  <span
                    key={trade.id}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border"
                    style={{ borderColor: palette.border, background: palette.bg, color: palette.primary }}
                  >
                    {trade.nombre}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* ── SERVICES ─────────────────────────────── */}
          {services.length > 0 && (
            <div className="px-5 pb-5 border-t border-border">
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
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-4 rounded-xl text-white font-bold text-base transition-opacity hover:opacity-90 active:scale-[0.98]"
              style={{ background: '#25d366' }}
            >
              <MessageCircle className="w-5 h-5" />
              Pedir presupuesto por WhatsApp
            </a>
          </div>

        </div>{/* end card */}
        </div>{/* end relative wrapper */}

        {/* ── REVIEWS ──────────────────────────────── */}
        {reviews.length > 0 && (
          <div className="mt-6">
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
            <div className="space-y-3">
              {reviews.map((review: any) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>
          </div>
        )}
      </div>{/* end container */}
    </div>
  )
}
