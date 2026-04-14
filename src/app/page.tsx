import Link from "next/link"
import {
  Wrench, Star, Shield, Smartphone,
  CheckCircle2,
  ArrowRight, Users, FileText, TrendingUp, MessageCircle,
} from "lucide-react"
import {
  IconPlug, IconDroplet, IconFlame, IconAirConditioning, IconWall,
  IconCamera, IconHammer, IconSolarPanel, IconDeviceDesktop,
  IconRouter, IconDeviceMobile, IconPlant,
  IconPaint, IconKey, IconBug, IconSmartHome, IconBuilding, IconEngine,
  IconRotate, IconTool, IconArmchair, IconMotorbike, IconSnowflake,
  IconWashMachine, IconPaw, IconBuildingSkyscraper,
} from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Navbar } from "@/components/layout/navbar"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { fetchPlanPrices } from "@/lib/mp-plans"
import { HeroCarousel } from '@/components/home/hero-carousel'
import { SectionAnimated } from '@/components/home/sections-animated'
import { CountUp } from '@/components/home/count-up-stat'

const TRADES = [
  { icon: IconPlug,            label: "Electricista",     gradient: "from-yellow-400 to-amber-500",   shadow: "shadow-yellow-500/20" },
  { icon: IconDroplet,         label: "Plomero",          gradient: "from-sky-400 to-blue-500",        shadow: "shadow-sky-500/20" },
  { icon: IconFlame,           label: "Gasista",          gradient: "from-orange-500 to-red-500",      shadow: "shadow-orange-500/20" },
  { icon: IconAirConditioning, label: "Aire Acond.",      gradient: "from-cyan-400 to-teal-500",       shadow: "shadow-cyan-500/20" },
  { icon: IconEngine,          label: "Mecánico",         gradient: "from-zinc-500 to-slate-700",      shadow: "shadow-slate-500/20" },
  { icon: IconWall,            label: "Albañil",          gradient: "from-stone-400 to-stone-600",     shadow: "shadow-stone-500/20" },
  { icon: IconHammer,          label: "Carpintero",       gradient: "from-amber-400 to-yellow-600",    shadow: "shadow-amber-500/20" },
  { icon: IconPaint,           label: "Pintor",           gradient: "from-lime-400 to-green-500",      shadow: "shadow-lime-500/20" },
  { icon: IconKey,             label: "Cerrajero",        gradient: "from-rose-400 to-pink-600",       shadow: "shadow-rose-500/20" },
  { icon: IconCamera,          label: "Cámaras CCTV",     gradient: "from-slate-400 to-slate-600",     shadow: "shadow-slate-500/20" },
  { icon: IconDeviceDesktop,   label: "Técnico PC",       gradient: "from-blue-400 to-indigo-500",     shadow: "shadow-blue-500/20" },
  { icon: IconRouter,          label: "Redes/Internet",   gradient: "from-violet-400 to-purple-500",   shadow: "shadow-violet-500/20" },
  { icon: IconDeviceMobile,    label: "Tec. Celulares",   gradient: "from-pink-400 to-rose-500",       shadow: "shadow-pink-500/20" },
  { icon: IconSolarPanel,      label: "Energía Solar",    gradient: "from-yellow-300 to-orange-400",   shadow: "shadow-yellow-400/20" },
  { icon: IconPlant,           label: "Jardinero",        gradient: "from-emerald-400 to-green-500",   shadow: "shadow-emerald-500/20" },
  { icon: IconBuilding,           label: "Techista",              gradient: "from-stone-500 to-stone-700",     shadow: "shadow-stone-500/20" },
  { icon: IconSmartHome,          label: "Domótica",              gradient: "from-indigo-400 to-violet-600",   shadow: "shadow-indigo-500/20" },
  { icon: IconBug,                label: "Fumigador",             gradient: "from-green-600 to-emerald-700",   shadow: "shadow-green-500/20" },
  { icon: IconRotate,             label: "Bobinador",             gradient: "from-yellow-500 to-orange-600",   shadow: "shadow-yellow-500/20" },
  { icon: IconTool,               label: "Tornero",               gradient: "from-slate-400 to-gray-600",      shadow: "shadow-slate-500/20" },
  { icon: IconArmchair,           label: "Tapicero",              gradient: "from-rose-300 to-pink-500",       shadow: "shadow-rose-500/20" },
  { icon: IconMotorbike,          label: "Mec. de Motos",         gradient: "from-zinc-500 to-slate-700",      shadow: "shadow-zinc-500/20" },
  { icon: IconSnowflake,          label: "Tec. Heladeras",        gradient: "from-sky-300 to-blue-500",        shadow: "shadow-sky-500/20" },
  { icon: IconWashMachine,        label: "Tec. Lavarropas",       gradient: "from-blue-400 to-indigo-600",     shadow: "shadow-blue-500/20" },
  { icon: IconPaw,                label: "Vet. a Domicilio",      gradient: "from-amber-400 to-orange-500",    shadow: "shadow-amber-500/20" },
  { icon: IconBuildingSkyscraper, label: "Maestro Mayor",         gradient: "from-stone-500 to-neutral-700",   shadow: "shadow-stone-500/20" },
]

const FEATURES = [
  {
    icon: Shield,
    title: "Reseñas verificadas",
    desc: "Links únicos para que tus clientes dejen opiniones reales",
    color: "text-emerald-400",
    bg: "bg-emerald-400/10",
  },
  {
    icon: Users,
    title: "Marketplace propio",
    desc: "Aparecé en búsquedas por ciudad y oficio, ordenado por plan",
    color: "text-sky-400",
    bg: "bg-sky-400/10",
  },
  {
    icon: FileText,
    title: "Presupuestos rápidos",
    desc: "Creá y enviá presupuestos por WhatsApp en segundos",
    color: "text-violet-400",
    bg: "bg-violet-400/10",
  },
  {
    icon: Smartphone,
    title: "100% Mobile-first",
    desc: "Tu perfil funciona como app instalable en el celular",
    color: "text-primary",
    bg: "bg-primary/10",
  },
]

const PLAN_META = [
  {
    key: "FREE",
    name: "Gratis",
    desc: "Para empezar a ganar visibilidad",
    features: ["1 oficio", "3 servicios", "5 fotos en galería", "Reseñas verificadas", "Botón WhatsApp"],
    cta: "Empezar gratis",
    variant: "outline" as const,
  },
  {
    key: "PRO",
    name: "Pro",
    desc: "Para profesionales activos",
    features: ["3 oficios", "10 servicios", "30 fotos", "Presupuestos en la app", "Mejor posición en búsqueda"],
    cta: "Probar 14 días gratis",
    variant: "default" as const,
    highlighted: true,
  },
  {
    key: "PREMIUM",
    name: "Premium",
    desc: "Para negocios en crecimiento",
    features: ["Oficios ilimitados", "Servicios ilimitados", "200 fotos", "Destacado en búsqueda", "Estadísticas", "Dominio propio"],
    cta: "Probar 14 días gratis",
    variant: "default" as const,
  },
]

const STATS = [
  { value: "+500",   label: "Profesionales activos",   icon: Users,       color: "text-sky-400" },
  { value: "4.8★",  label: "Rating promedio",          icon: Star,        color: "text-yellow-400" },
  { value: "+2.400", label: "Contactos generados",     icon: MessageCircle, color: "text-emerald-400" },
  { value: "+30",   label: "Oficios disponibles",      icon: TrendingUp,  color: "text-violet-400" },
]

function formatARS(amount: number) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(amount)
}

export default async function HomePage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  const planPrices = fetchPlanPrices()

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Navbar user={user} />

      {/* ── HERO ──────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        {/* Grid industrial */}
        <div className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(hsl(215 22% 18% / 0.3) 1px, transparent 1px),
                              linear-gradient(90deg, hsl(215 22% 18% / 0.3) 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        />
        {/* Glows */}
        <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] bg-primary/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />

        <HeroCarousel isLoggedIn={!!user} />
      </section>

      {/* ── STATS ────────────────────────────────────────── */}
      <section className="border-y border-border bg-card/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-border">
            {STATS.map(({ value, label, icon: Icon, color }) => (
              <div key={label} className="px-6 py-8 text-center">
                <Icon className={`w-5 h-5 ${color} mx-auto mb-2`} />
                <CountUp value={value} color={color} />
                <p className="text-xs text-muted-foreground mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRADES ───────────────────────────────────────── */}
      <section className="py-24 relative overflow-hidden">
        {/* subtle bg texture */}
        <div className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, hsl(var(--primary) / 0.04) 0%, transparent 60%),
                              radial-gradient(circle at 80% 50%, hsl(215 22% 18% / 0.4) 0%, transparent 60%)`,
          }}
        />
        <div className="container mx-auto px-4 relative">
          {/* Header */}
          <SectionAnimated className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary text-xs font-bold px-4 py-2 rounded-full mb-6 tracking-wider uppercase">
              <Wrench className="w-3.5 h-3.5" />
              +30 oficios disponibles
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">
              Cualquier trabajo,{" "}
              <span className="bg-gradient-to-r from-orange-500 to-yellow-400 bg-clip-text text-transparent">
                el experto ideal
              </span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Desde reparaciones urgentes hasta reformas completas — con reseñas reales y contacto directo.
            </p>
          </SectionAnimated>

          {/* Grid */}
          <SectionAnimated className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 max-w-4xl mx-auto" stagger={0.04}>
            {TRADES.map(({ icon: Icon, label, gradient, shadow }) => (
              <div key={label} className={`group flex flex-col items-center gap-3 p-4 rounded-2xl border border-border/40 bg-card/60 hover:bg-card hover:border-border hover:shadow-xl transition-all duration-300 cursor-default`}>
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg ${shadow} transition-transform duration-300 group-hover:scale-110 group-hover:-translate-y-1`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <span className="text-xs font-semibold text-center text-foreground/70 group-hover:text-foreground leading-tight transition-colors">{label}</span>
              </div>
            ))}
          </SectionAnimated>

          {/* CTA */}
          <SectionAnimated className="flex justify-center mt-12">
            <Button size="lg" asChild className="gap-2 shadow-lg shadow-primary/20">
              <Link href="/buscar">
                Buscar profesionales
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </SectionAnimated>
        </div>
      </section>

      {/* ── CÓMO FUNCIONA ────────────────────────────────── */}
      <section className="py-20 bg-card border-y border-border">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-14">
            <p className="text-xs font-bold text-primary uppercase tracking-[0.2em] mb-3">Cómo funciona</p>
            <h2 className="text-3xl md:text-4xl font-extrabold mb-3">
              Tres pasos para{" "}
              <span className="text-primary">empezar</span>
            </h2>
            <p className="text-muted-foreground">Simple, rápido, sin complicaciones</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { n: "01", title: "Creá tu perfil", desc: "Registrate gratis en menos de 2 minutos", color: "text-primary" },
              { n: "02", title: "Elegí tus servicios", desc: "Seleccioná tus oficios y servicios específicos", color: "text-sky-400" },
              { n: "03", title: "Conseguí clientes", desc: "Aparecé en el buscador y recibí contactos directos", color: "text-emerald-400" },
            ].map(step => (
              <div key={step.n} className="relative p-6 rounded-2xl border border-border bg-background hover:border-primary/30 transition-colors">
                <span className={`text-6xl font-extrabold ${step.color} opacity-20 leading-none block mb-4`}>{step.n}</span>
                <h3 className={`text-lg font-bold mb-2 ${step.color}`}>{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ──────────────────────────────────────── */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <p className="text-xs font-bold text-primary uppercase tracking-[0.2em] mb-3">Herramientas</p>
            <h2 className="text-3xl md:text-4xl font-extrabold mb-3">
              Todo lo que necesitás{" "}
              <span className="bg-gradient-to-r from-sky-400 to-violet-400 bg-clip-text text-transparent">
                para crecer
              </span>
            </h2>
            <p className="text-muted-foreground">Pensadas para el trabajador independiente</p>
          </div>
          <SectionAnimated className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {FEATURES.map(({ icon: Icon, title, desc, color, bg }) => (
              <div key={title} className="p-6 rounded-2xl border border-border bg-card hover:border-primary/40 transition-all hover:-translate-y-1">
                <div className={`w-11 h-11 ${bg} rounded-xl flex items-center justify-center mb-4`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <h3 className="font-bold mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </SectionAnimated>
        </div>
      </section>

      {/* ── PRICING ──────────────────────────────────────── */}
      <section className="py-20 bg-card border-y border-border">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <p className="text-xs font-bold text-primary uppercase tracking-[0.2em] mb-3">Planes</p>
            <h2 className="text-3xl md:text-4xl font-extrabold mb-3">Simples y transparentes</h2>
            <p className="text-muted-foreground">Comenzá gratis, escalá cuando lo necesités</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {PLAN_META.map(plan => {
              const priceData = plan.key !== 'FREE' ? planPrices?.[plan.key as 'PRO' | 'PREMIUM'] : null
              const monthlyLabel = plan.key === 'FREE'
                ? '$0'
                : priceData ? formatARS(priceData.monthly) : '—'
              const annualLabel = priceData ? formatARS(priceData.annual) + '/año' : null

              return (
                <Card
                  key={plan.name}
                  className={`bg-background transition-transform ${
                    plan.highlighted
                      ? `ring-2 ring-primary shadow-xl shadow-primary/15 scale-105`
                      : "hover:-translate-y-1"
                  }`}
                >
                  <CardContent className="pt-6">
                    {plan.highlighted && (
                      <div className="text-xs font-bold text-primary bg-primary/15 rounded-full px-3 py-1 mb-4 inline-block tracking-wide">
                        ★ MÁS POPULAR
                      </div>
                    )}
                    {plan.name === "Premium" && (
                      <div className="text-xs font-bold text-yellow-400 bg-yellow-400/10 rounded-full px-3 py-1 mb-4 inline-block tracking-wide border border-yellow-400/20">
                        👑 PREMIUM
                      </div>
                    )}
                    <h3 className="text-xl font-bold">{plan.name}</h3>
                    <div className="flex items-baseline gap-1 my-3">
                      <span className="text-4xl font-extrabold">{monthlyLabel}</span>
                      {plan.key !== 'FREE' && <span className="text-muted-foreground text-sm">/mes</span>}
                    </div>
                    {annualLabel && (
                      <p className="text-xs text-green-600 font-medium -mt-2 mb-3">
                        o {annualLabel} <span className="text-muted-foreground font-normal">(2 meses gratis)</span>
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground mb-5">{plan.desc}</p>
                    <ul className="space-y-2.5 mb-6">
                      {plan.features.map(f => (
                        <li key={f} className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <Button variant={plan.variant} className="w-full" asChild>
                      <Link href="/auth/register">{plan.cta}</Link>
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ─────────────────────────────────────── */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl" />
        </div>
        <div className="relative container mx-auto px-4 text-center max-w-2xl">
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-orange-400 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary/30">
            <Wrench className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4">
            ¿Listo para conseguir{" "}
            <span className="bg-gradient-to-r from-orange-500 to-yellow-400 bg-clip-text text-transparent">
              más clientes?
            </span>
          </h2>
          <p className="text-muted-foreground mb-8 text-lg">
            Creá tu perfil gratis en menos de 2 minutos.{" "}
            <span className="text-foreground font-medium">Sin tarjeta de crédito.</span>
          </p>
          <Button size="xl" asChild className="font-bold shadow-lg shadow-primary/25">
            <Link href="/auth/register">
              Empezar gratis ahora
              <ArrowRight className="w-5 h-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────── */}
      <footer className="border-t border-border py-8 bg-card">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-6 h-6 bg-gradient-to-br from-primary to-orange-400 rounded-md flex items-center justify-center">
              <Wrench className="w-3 h-3 text-white" />
            </div>
            <span className="font-semibold text-foreground">TecnoInstalador</span>
          </div>
          <div className="flex items-center justify-center gap-4 mt-2 mb-3">
            <Link href="/legal/terminos" className="hover:text-foreground transition-colors">Términos y Condiciones</Link>
            <Link href="/legal/privacidad" className="hover:text-foreground transition-colors">Privacidad</Link>
          </div>
          <p className="text-xs text-muted-foreground/60">
            Copyright © {new Date().getFullYear()} · Desarrollado desde Las Breñas con 💜 por{' '}
            <a
              href="https://www.linkedin.com/in/jmsilva83"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors font-medium"
            >
              @jmsDev
            </a>{' '}
            — All rights reserved
          </p>
        </div>
      </footer>
    </div>
  )
}
