'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard, User, Wrench, Image, Star, MessageSquare,
  FileText, CreditCard, BarChart2, ChevronRight, Crown, Zap, Home, ShieldCheck,
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

// Mobile bottom navigation
export function MobileBottomNav({ plan }: { plan: PlanType }) {
  const pathname = usePathname()

  const mobileItems = [
    { href: '/dashboard', label: 'Inicio', icon: LayoutDashboard },
    { href: '/dashboard/profile', label: 'Perfil', icon: User },
    { href: '/dashboard/reviews', label: 'Reseñas', icon: Star },
    { href: '/dashboard/quotes', label: 'Presupto.', icon: FileText },
    { href: '/dashboard/plan', label: 'Plan', icon: CreditCard },
  ]

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-background border-t border-border flex items-center">
      {mobileItems.map(item => {
        const Icon = item.icon
        const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
        const isLocked = item.href === '/dashboard/quotes' && plan === 'FREE'

        return (
          <Link
            key={item.href}
            href={isLocked ? '/dashboard/plan' : item.href}
            className={cn(
              "flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors",
              isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon className="w-5 h-5" />
            <span>{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
