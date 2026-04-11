import Link from "next/link"
import {
  Wrench, Zap, Droplets, Flame, Wind, Star, Shield, Smartphone,
  CheckCircle2, HardHat, PaintBucket, KeyRound,
  ArrowRight, Users, FileText, TrendingUp, MessageCircle,
  Monitor, Wifi, Camera, Package, Sun, Truck, Leaf, Hammer
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Navbar } from "@/components/layout/navbar"
import { createServerSupabaseClient } from "@/lib/supabase/server"

const TRADES = [
  { icon: Zap,         label: "Electricidad",    gradient: "from-yellow-400 to-amber-500",   shadow: "shadow-yellow-500/20" },
  { icon: Droplets,    label: "Plomería",         gradient: "from-sky-400 to-blue-500",        shadow: "shadow-sky-500/20" },
  { icon: Flame,       label: "Gas",              gradient: "from-orange-500 to-red-500",      shadow: "shadow-orange-500/20" },
  { icon: Wind,        label: "Aire Acond.",      gradient: "from-cyan-400 to-teal-500",       shadow: "shadow-cyan-500/20" },
  { icon: Monitor,     label: "Técnico PC",       gradient: "from-blue-400 to-indigo-500",     shadow: "shadow-blue-500/20" },
  { icon: Wifi,        label: "Redes/Internet",   gradient: "from-violet-400 to-purple-500",   shadow: "shadow-violet-500/20" },
  { icon: Camera,      label: "Cámaras CCTV",     gradient: "from-slate-400 to-slate-600",     shadow: "shadow-slate-500/20" },
  { icon: Smartphone,  label: "Tec. Celulares",   gradient: "from-pink-400 to-rose-500",       shadow: "shadow-pink-500/20" },
  { icon: Package,     label: "Muebles MDF",      gradient: "from-amber-400 to-yellow-600",    shadow: "shadow-amber-500/20" },
  { icon: Sun,         label: "Energía Solar",    gradient: "from-yellow-300 to-orange-400",   shadow: "shadow-yellow-400/20" },
  { icon: HardHat,     label: "Albañilería",      gradient: "from-stone-400 to-stone-600",     shadow: "shadow-stone-500/20" },
  { icon: Leaf,        label: "Jardinería",       gradient: "from-emerald-400 to-green-500",   shadow: "shadow-emerald-500/20" },
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

const PLANS = [
  {
    name: "Gratis",
    price: "$0",
    desc: "Para empezar a ganar visibilidad",
    features: ["1 oficio", "3 servicios", "5 fotos en galería", "Reseñas verificadas", "Botón WhatsApp"],
    cta: "Empezar gratis",
    variant: "outline" as const,
    accent: "border-border",
  },
  {
    name: "Pro",
    price: "$4.999",
    period: "/mes",
    desc: "Para profesionales activos",
    features: ["3 oficios", "10 servicios", "30 fotos", "Presupuestos en la app", "Mejor posición en búsqueda"],
    cta: "Probar 14 días gratis",
    variant: "default" as const,
    highlighted: true,
    accent: "border-primary",
  },
  {
    name: "Premium",
    price: "$9.999",
    period: "/mes",
    desc: "Para negocios en crecimiento",
    features: ["Oficios ilimitados", "Servicios ilimitados", "200 fotos", "Destacado en búsqueda", "Estadísticas", "Dominio propio"],
    cta: "Probar 14 días gratis",
    variant: "default" as const,
    accent: "border-yellow-500/50",
  },
]

const STATS = [
  { value: "+500",   label: "Profesionales activos",   icon: Users,       color: "text-sky-400" },
  { value: "4.8★",  label: "Rating promedio",          icon: Star,        color: "text-yellow-400" },
  { value: "+2.400", label: "Contactos generados",     icon: MessageCircle, color: "text-emerald-400" },
  { value: "+30",   label: "Oficios disponibles",      icon: TrendingUp,  color: "text-violet-400" },
]

export default async function HomePage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

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

        <div className="relative container mx-auto px-4 py-20 md:py-36">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 border border-primary/30 bg-primary/10 text-primary text-xs font-bold px-4 py-2 rounded-full mb-8 tracking-wider uppercase">
              <Zap className="w-3.5 h-3.5" />
              Plataforma para profesionales del oficio
            </div>

            <h1 className="text-5xl md:text-7xl font-extrabold leading-[1.05] tracking-tight mb-6">
              Tu perfil<br />
              <span className="bg-gradient-to-r from-orange-500 via-orange-400 to-yellow-400 bg-clip-text text-transparent">
                profesional
              </span><br />
              en minutos
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-xl mb-10 leading-relaxed">
              Mostrá tus servicios,{" "}
              <span className="text-emerald-400 font-semibold">recibí reseñas verificadas</span>{" "}
              y conectá con nuevos clientes desde cualquier dispositivo.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="xl" asChild className="font-bold shadow-lg shadow-primary/25">
                <Link href="/auth/register">
                  Crear mi perfil gratis
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
              <Button size="xl" variant="outline" asChild>
                <Link href="/buscar">Ver instaladores</Link>
              </Button>
            </div>

            {/* Social proof */}
            <div className="flex items-center gap-6 mt-10 flex-wrap">
              <div className="flex -space-x-2">
                {[
                  { bg: '#f97316', init: 'JM' },
                  { bg: '#fb923c', init: 'CR' },
                  { bg: '#3b82f6', init: 'MP' },
                  { bg: '#8b5cf6', init: 'AL' },
                ].map((a, i) => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-background flex items-center justify-center text-xs font-bold text-white" style={{ background: a.bg }}>
                    {a.init}
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <div className="flex">
                  {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />)}
                </div>
                <span><span className="text-foreground font-semibold">+500</span> profesionales activos</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ────────────────────────────────────────── */}
      <section className="border-y border-border bg-card/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-border">
            {STATS.map(({ value, label, icon: Icon, color }) => (
              <div key={label} className="px-6 py-8 text-center">
                <Icon className={`w-5 h-5 ${color} mx-auto mb-2`} />
                <p className={`text-3xl font-extrabold ${color}`}>{value}</p>
                <p className="text-xs text-muted-foreground mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRADES ───────────────────────────────────────── */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <p className="text-center text-xs font-bold text-muted-foreground uppercase tracking-[0.2em] mb-10">
            Para todos los oficios
          </p>
          <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-4 max-w-5xl mx-auto">
            {TRADES.map(({ icon: Icon, label, gradient, shadow }) => (
              <div key={label} className="flex flex-col items-center gap-2.5 group cursor-default">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg ${shadow} transition-transform group-hover:scale-110 group-hover:-translate-y-0.5`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <span className="text-[10px] font-medium text-center text-muted-foreground">{label}</span>
              </div>
            ))}
          </div>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {FEATURES.map(({ icon: Icon, title, desc, color, bg }) => (
              <div key={title} className="p-6 rounded-2xl border border-border bg-card hover:border-primary/40 transition-all hover:-translate-y-1">
                <div className={`w-11 h-11 ${bg} rounded-xl flex items-center justify-center mb-4`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <h3 className="font-bold mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
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
            {PLANS.map(plan => (
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
                    <span className="text-4xl font-extrabold">{plan.price}</span>
                    {plan.period && <span className="text-muted-foreground text-sm">{plan.period}</span>}
                  </div>
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
            ))}
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
          <p>© {new Date().getFullYear()} TecnoInstalador. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  )
}
