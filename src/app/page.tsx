import Link from "next/link"
import {
  Wrench, Zap, Droplets, Flame, Wind, Star, Shield, Smartphone,
  ChevronRight, CheckCircle2, HardHat, PaintBucket, KeyRound,
  ArrowRight, Users, FileText
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Navbar } from "@/components/layout/navbar"
import { createServerSupabaseClient } from "@/lib/supabase/server"

const TRADES = [
  { icon: Zap,         label: "Electricistas",  color: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20" },
  { icon: Droplets,    label: "Plomeros",        color: "text-sky-400 bg-sky-400/10 border-sky-400/20" },
  { icon: Flame,       label: "Gasistas",        color: "text-orange-400 bg-orange-400/10 border-orange-400/20" },
  { icon: Wind,        label: "Técnicos A/A",    color: "text-cyan-400 bg-cyan-400/10 border-cyan-400/20" },
  { icon: PaintBucket, label: "Pintores",        color: "text-violet-400 bg-violet-400/10 border-violet-400/20" },
  { icon: HardHat,     label: "Albañiles",       color: "text-amber-400 bg-amber-400/10 border-amber-400/20" },
  { icon: Wrench,      label: "Herreros",        color: "text-slate-400 bg-slate-400/10 border-slate-400/20" },
  { icon: KeyRound,    label: "Cerrajeros",      color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" },
]

const FEATURES = [
  { icon: Shield,    title: "Reseñas verificadas",  desc: "Links únicos para que tus clientes dejen opiniones reales" },
  { icon: Users,     title: "Marketplace propio",   desc: "Aparecé en búsquedas por ciudad y oficio, ordenado por plan" },
  { icon: FileText,  title: "Presupuestos rápidos",  desc: "Creá y enviá presupuestos por WhatsApp en segundos" },
  { icon: Smartphone,title: "100% Mobile-first",    desc: "Tu perfil funciona como app instalable en el celular" },
]

const PLANS = [
  {
    name: "Gratis",
    price: "$0",
    desc: "Para empezar a ganar visibilidad",
    features: ["1 oficio", "3 servicios", "5 fotos en galería", "Reseñas verificadas", "Botón WhatsApp"],
    cta: "Empezar gratis",
    variant: "outline" as const,
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
  },
  {
    name: "Premium",
    price: "$9.999",
    period: "/mes",
    desc: "Para negocios en crecimiento",
    features: ["Oficios ilimitados", "Servicios ilimitados", "200 fotos", "Destacado en búsqueda", "Estadísticas", "Dominio propio"],
    cta: "Probar 14 días gratis",
    variant: "default" as const,
  },
]

const STEPS = [
  { n: "01", title: "Creá tu perfil", desc: "Registrate gratis en menos de 2 minutos" },
  { n: "02", title: "Elegí tus servicios", desc: "Seleccioná tus oficios y servicios específicos" },
  { n: "03", title: "Conseguí clientes", desc: "Aparecé en el buscador y recibí contactos" },
]

export default async function HomePage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Navbar user={user} />

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        {/* Fondo con patrón de cuadrícula industrial */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(hsl(215 22% 18% / 0.4) 1px, transparent 1px),
              linear-gradient(90deg, hsl(215 22% 18% / 0.4) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
          }}
        />
        {/* Glow naranja desde abajo-izquierda */}
        <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] bg-primary/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -top-32 right-0 w-[400px] h-[400px] bg-primary/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative container mx-auto px-4 py-20 md:py-32">
          <div className="max-w-3xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 border border-primary/30 bg-primary/10 text-primary text-xs font-bold px-4 py-2 rounded-full mb-8 tracking-wider uppercase">
              <Zap className="w-3.5 h-3.5" />
              Plataforma para profesionales del oficio
            </div>

            <h1 className="text-5xl md:text-7xl font-extrabold leading-[1.05] tracking-tight mb-6">
              Tu perfil<br />
              <span className="text-primary">profesional</span><br />
              en minutos
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-xl mb-10 leading-relaxed">
              Mostrá tus servicios, recibí reseñas verificadas y conectá con
              nuevos clientes — desde cualquier dispositivo.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="xl" asChild className="font-bold">
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
            <div className="flex items-center gap-6 mt-10">
              <div className="flex -space-x-2">
                {['#f97316','#fb923c','#fdba74','#fde68a'].map((c, i) => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-background flex items-center justify-center text-xs font-bold text-background" style={{ background: c }}>
                    {['JM','CR','MP','AL'][i]}
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <div className="flex">
                  {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />)}
                </div>
                <span>+500 profesionales activos</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TRADES ───────────────────────────────────────────── */}
      <section className="py-14 border-y border-border">
        <div className="container mx-auto px-4">
          <p className="text-center text-xs font-bold text-muted-foreground uppercase tracking-[0.2em] mb-8">
            Para todos los oficios
          </p>
          <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
            {TRADES.map(({ icon: Icon, label, color }) => (
              <div key={label} className="flex flex-col items-center gap-2.5 group cursor-default">
                <div className={`w-12 h-12 rounded-xl border flex items-center justify-center transition-transform group-hover:scale-110 ${color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-medium text-center text-muted-foreground">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CÓMO FUNCIONA ────────────────────────────────────── */}
      <section className="py-20 container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-3">Tres pasos para empezar</h2>
          <p className="text-muted-foreground">Simple, rápido, sin complicaciones</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
          {STEPS.map(step => (
            <div key={step.n} className="relative p-6 rounded-2xl border border-border bg-card">
              <span className="text-5xl font-extrabold text-primary/20 leading-none block mb-4">{step.n}</span>
              <h3 className="text-lg font-bold mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────────── */}
      <section className="py-20 bg-card border-y border-border">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-3">Todo lo que necesitás para crecer</h2>
            <p className="text-muted-foreground">Herramientas pensadas para el trabajador independiente</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="p-6 rounded-2xl border border-border bg-background hover:border-primary/40 transition-colors">
                <div className="w-11 h-11 bg-primary/15 rounded-xl flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-bold mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ──────────────────────────────────────────── */}
      <section className="py-20 container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-3">Planes simples y transparentes</h2>
          <p className="text-muted-foreground">Comenzá gratis, escalá cuando lo necesités</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {PLANS.map(plan => (
            <Card
              key={plan.name}
              className={plan.highlighted
                ? "ring-2 ring-primary shadow-xl shadow-primary/10 scale-105 bg-card"
                : "bg-card"
              }
            >
              <CardContent className="pt-6">
                {plan.highlighted && (
                  <div className="text-xs font-bold text-primary bg-primary/15 rounded-full px-3 py-1 mb-4 inline-block tracking-wide">
                    ★ MÁS POPULAR
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
      </section>

      {/* ── CTA FINAL ────────────────────────────────────────── */}
      <section className="py-20 bg-card border-t border-border">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <div className="w-16 h-16 bg-primary/15 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Wrench className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4">
            ¿Listo para conseguir más clientes?
          </h2>
          <p className="text-muted-foreground mb-8">
            Creá tu perfil gratis en menos de 2 minutos. Sin tarjeta de crédito.
          </p>
          <Button size="xl" asChild className="font-bold">
            <Link href="/auth/register">
              Empezar gratis ahora
              <ArrowRight className="w-5 h-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────── */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-6 h-6 bg-primary rounded-md flex items-center justify-center">
              <Wrench className="w-3 h-3 text-background" />
            </div>
            <span className="font-semibold text-foreground">TecnoInstalador</span>
          </div>
          <p>© {new Date().getFullYear()} TecnoInstalador. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  )
}
