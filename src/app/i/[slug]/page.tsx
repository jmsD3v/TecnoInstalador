import { notFound } from "next/navigation"
import { Metadata } from "next"
import { MapPin, Star, Briefcase } from "lucide-react"
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

  // Track profile view (fire and forget)
  supabase.rpc('increment_stat', { p_installer_id: installer.id, p_field: 'profile_views' }).then(() => {})

  const palette = COLOR_PALETTES[installer.color_palette as keyof typeof COLOR_PALETTES] ?? COLOR_PALETTES.azul
  const displayName = installer.nombre_comercial ?? `${installer.nombre} ${installer.apellido}`
  const trades = installer.installer_trades?.map((it: any) => it.trade).filter(Boolean) ?? []
  const services = installer.installer_services?.map((is_: any) => is_.service).filter(Boolean) ?? []
  const gallery = installer.gallery_items ?? []
  const reviews = (installer.reviews ?? []).filter((r: any) => r.is_public)

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={user} />

      {/* Hero */}
      <div
        className="relative"
        style={{ background: `linear-gradient(135deg, ${palette.primary}, ${palette.primary}cc)` }}
      >
        {installer.banner_url && (
          <div className="absolute inset-0 overflow-hidden">
            <img src={installer.banner_url} className="w-full h-full object-cover opacity-20" alt="" />
          </div>
        )}
        <div className="relative container mx-auto px-4 py-10 md:py-16">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-5">
            <InstallerAvatar
              nombre={installer.nombre}
              apellido={installer.apellido}
              fotoUrl={installer.foto_perfil_url}
              size="xl"
              className="ring-4 ring-white/30 shadow-xl"
            />
            <div className="text-white text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 flex-wrap">
                <h1 className="text-3xl md:text-4xl font-extrabold">{displayName}</h1>
                <PlanBadge plan={installer.plan} />
              </div>
              <div className="flex items-center justify-center md:justify-start gap-4 mt-2 flex-wrap">
                <span className="flex items-center gap-1 text-white/80 text-sm">
                  <MapPin className="w-4 h-4" />
                  {installer.ciudad}, {installer.provincia}
                </span>
                <span className="flex items-center gap-1 text-white/80 text-sm">
                  <Briefcase className="w-4 h-4" />
                  {trades.map((t: any) => t.nombre).join(' · ') || 'Profesional'}
                </span>
              </div>
              {installer.total_reviews > 0 && (
                <div className="flex items-center justify-center md:justify-start gap-2 mt-2">
                  <StarRating rating={installer.avg_rating} size="sm" />
                  <span className="text-white/90 text-sm font-medium">
                    {installer.avg_rating.toFixed(1)} ({installer.total_reviews} reseñas)
                  </span>
                </div>
              )}
              {installer.descripcion && (
                <p className="mt-3 text-white/80 max-w-lg text-sm leading-relaxed">
                  {installer.descripcion}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-10 max-w-3xl">

        {/* Services */}
        {services.length > 0 && (
          <section>
            <h2 className="text-xl font-bold mb-4">Servicios</h2>
            <div className="flex flex-wrap gap-2">
              {services.map((service: any) => (
                <span
                  key={service.id}
                  className="px-3 py-1.5 rounded-full text-sm font-medium border"
                  style={{ borderColor: palette.border, background: palette.bg, color: palette.primary }}
                >
                  {service.nombre}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Gallery */}
        {gallery.length > 0 && (
          <section>
            <h2 className="text-xl font-bold mb-4">Galería de trabajos</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {gallery.map((item: any) => (
                <div key={item.id} className="aspect-square rounded-xl overflow-hidden bg-muted">
                  <img
                    src={item.image_url}
                    alt={item.titulo ?? 'Trabajo'}
                    className="w-full h-full object-cover hover:scale-105 transition-transform"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Reviews */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Reseñas ({reviews.length})</h2>
            {installer.total_reviews > 0 && (
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                <span className="font-bold">{installer.avg_rating.toFixed(1)}</span>
              </div>
            )}
          </div>
          {reviews.length === 0 ? (
            <p className="text-muted-foreground text-sm">Este profesional todavía no tiene reseñas.</p>
          ) : (
            <div className="space-y-3">
              {reviews.map((review: any) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Fixed WhatsApp CTA */}
      <WhatsAppCTA
        whatsapp={installer.whatsapp}
        installerName={displayName}
        fixed
        label="Contactar por WhatsApp"
      />

      {/* Bottom padding for the fixed button */}
      <div className="h-24" />
    </div>
  )
}
