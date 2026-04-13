'use client'

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard, User, Wrench, Image, Star, MessageSquare,
  FileText, CreditCard, BarChart2, ChevronRight, Crown, Zap, Home, ShieldCheck,
  Menu, X,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { PlanType } from "@/types"
import { Badge } from "@/components/ui/badge"

interface SidebarProps {
  plan: PlanType
  trialEndsAt?: string | null
  urlSlug?: string
  isAdmin?: boolean
}

interface NavItem {
  href: string
  label: string
  icon: React.ElementType
  planRequired?: PlanType[]
  badge?: string
  exact?: boolean
}

const NAV_ITEMS: NavItem[] = [
  { href: '/dashboard', label: 'Resumen', icon: LayoutDashboard, exact: true },
  { href: '/dashboard/profile', label: 'Mi perfil', icon: User },
  { href: '/dashboard/services', label: 'Oficios y servicios', icon: Wrench },
  { href: '/dashboard/gallery', label: 'Galería', icon: Image },
  { href: '/dashboard/reviews', label: 'Reseñas', icon: Star, exact: true },
  { href: '/dashboard/reviews/invites', label: 'Links de reseña', icon: MessageSquare },
  {
    href: '/dashboard/quotes',
    label: 'Presupuestos',
    icon: FileText,
    planRequired: ['PRO', 'PREMIUM'],
  },
  {
    href: '/dashboard/stats',
    label: 'Estadísticas',
    icon: BarChart2,
    planRequired: ['PREMIUM'],
  },
  { href: '/dashboard/plan', label: 'Mi plan', icon: CreditCard },
]

export function DashboardSidebar({ plan, trialEndsAt, urlSlug, isAdmin }: SidebarProps) {
  const pathname = usePathname()
  const isTrialActive = trialEndsAt && new Date(trialEndsAt) > new Date()

  return (
    <aside className="w-64 shrink-0 hidden lg:flex flex-col border-r border-border bg-card sticky top-0 h-screen overflow-y-auto">
      {/* Plan badge */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Plan actual</span>
          {plan === 'PREMIUM' ? (
            <Badge variant="premium"><Crown className="w-3 h-3 mr-1" />Premium</Badge>
          ) : plan === 'PRO' ? (
            <Badge variant="pro"><Zap className="w-3 h-3 mr-1" />Pro</Badge>
          ) : (
            <Badge variant="free">Gratis</Badge>
          )}
        </div>
        {isTrialActive && (
          <p className="text-xs text-amber-600 mt-1">
            Trial activo hasta {new Date(trialEndsAt!).toLocaleDateString('es-AR')}
          </p>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 flex flex-col gap-1">
        {NAV_ITEMS.map(item => {
          const Icon = item.icon
          const isActive = item.exact
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(item.href + '/')
          const isLocked = item.planRequired && !item.planRequired.includes(plan) && !isTrialActive

          return (
            <Link
              key={item.href}
              href={isLocked ? '/dashboard/plan' : item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent",
                isLocked && "opacity-50 cursor-not-allowed"
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="flex-1">{item.label}</span>
              {isLocked && (
                <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-semibold">
                  {item.planRequired?.includes('PREMIUM') ? 'Premium' : 'Pro'}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Bottom */}
      <div className="p-4 border-t border-border space-y-2">
        <Link
          href="/"
          className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <Home className="w-3.5 h-3.5" />
          Ir al inicio
        </Link>
        <Link
          href={urlSlug ? `/i/${urlSlug}` : '#'}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
        >
          Ver mi perfil público <ChevronRight className="w-3 h-3" />
        </Link>
        {isAdmin && (
          <Link
            href="/admin"
            className="flex items-center gap-1.5 text-xs font-semibold text-orange-500 hover:text-orange-400 transition-colors"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Panel de administración
          </Link>
        )}
      </div>
    </aside>
  )
}

// Mobile bottom navigation + drawer
export function MobileBottomNav({
  plan,
  urlSlug,
  isAdmin,
  trialEndsAt,
}: {
  plan: PlanType
  urlSlug?: string | null
  isAdmin?: boolean
  trialEndsAt?: string | null
}) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const isTrialActive = trialEndsAt && new Date(trialEndsAt) > new Date()

  const bottomItems = [
    { href: '/dashboard',         label: 'Panel',    icon: LayoutDashboard, exact: true },
    { href: '/dashboard/profile', label: 'Perfil',   icon: User },
    { href: '/dashboard/gallery', label: 'Galería',  icon: Image },
    { href: '/dashboard/reviews', label: 'Reseñas',  icon: Star, exact: true },
  ]

  function isActive(item: { href: string; exact?: boolean }) {
    return item.exact
      ? pathname === item.href
      : pathname === item.href || pathname.startsWith(item.href + '/')
  }

  return (
    <>
      {/* ── BOTTOM BAR ── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-sm border-t border-border flex items-stretch">
        {bottomItems.map(item => {
          const Icon = item.icon
          const active = isActive(item)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex-1 flex flex-col items-center justify-center gap-1 py-3 text-[11px] font-medium transition-colors",
                active ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          )
        })}

        {/* Hamburger */}
        <button
          onClick={() => setOpen(true)}
          className="flex-1 flex flex-col items-center justify-center gap-1 py-3 text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <Menu className="w-5 h-5" />
          <span>Más</span>
        </button>
      </nav>

      {/* ── DRAWER ── */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          {/* Panel */}
          <div className="relative w-72 max-w-[85vw] bg-background flex flex-col h-full shadow-2xl border-l border-border animate-in slide-in-from-right duration-200">

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <span className="font-bold text-base">Menú</span>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* All nav items */}
            <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
              {NAV_ITEMS.map(item => {
                const Icon = item.icon
                const active = isActive(item)
                const locked = item.planRequired && !item.planRequired.includes(plan) && !isTrialActive

                return (
                  <Link
                    key={item.href}
                    href={locked ? '/dashboard/plan' : item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                      active
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent",
                      locked && "opacity-50"
                    )}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="flex-1">{item.label}</span>
                    {locked && (
                      <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-semibold">
                        {item.planRequired?.includes('PREMIUM') ? 'Premium' : 'Pro'}
                      </span>
                    )}
                  </Link>
                )
              })}
            </nav>

            {/* Bottom links */}
            <div className="p-4 border-t border-border space-y-1">
              <Link
                href="/"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              >
                <Home className="w-4 h-4" />
                Ir al inicio
              </Link>
              {urlSlug && (
                <Link
                  href={`/i/${urlSlug}`}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-primary hover:bg-accent transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                  Ver mi perfil público
                </Link>
              )}
              {isAdmin && (
                <Link
                  href="/admin"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-semibold text-orange-500 hover:text-orange-400 hover:bg-accent transition-colors"
                >
                  <ShieldCheck className="w-4 h-4" />
                  Panel de administración
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
