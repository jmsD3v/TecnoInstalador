'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  LayoutDashboard, Users, Star, CreditCard, Wrench,
  Home, ChevronLeft, BadgeCheck, Globe, BarChart2, LogOut,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { AppSidebarShell, ShellNavItem } from '@/components/layout/app-sidebar-shell'

const NAV: ShellNavItem[] = [
  { href: '/admin',               label: 'Overview',        icon: LayoutDashboard, exact: true },
  { href: '/admin/users',         label: 'Usuarios',        icon: Users },
  { href: '/admin/reviews',       label: 'Reseñas',         icon: Star },
  { href: '/admin/subscriptions', label: 'Suscripciones',   icon: CreditCard },
  { href: '/admin/verifications', label: 'Verificaciones',  icon: BadgeCheck },
  { href: '/admin/domains',       label: 'Dominios',        icon: Globe },
  { href: '/admin/analytics',     label: 'Analytics',       icon: BarChart2 },
]

const BOTTOM_NAV: ShellNavItem[] = [
  { href: '/admin',               label: 'Overview',    icon: LayoutDashboard, exact: true },
  { href: '/admin/users',         label: 'Usuarios',    icon: Users },
  { href: '/admin/verifications', label: 'Verificar',   icon: BadgeCheck },
  { href: '/admin/subscriptions', label: 'Suscripc.',   icon: CreditCard },
]

export function AdminSidebar({ adminEmail }: { adminEmail: string }) {
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const header = (
    <div className="p-4 flex items-center gap-2">
      <div className="w-7 h-7 bg-orange-500 rounded-md flex items-center justify-center shrink-0">
        <Wrench className="w-4 h-4 text-white" />
      </div>
      <span className="font-bold text-sm text-slate-100">TecnoAdmin</span>
    </div>
  )

  const footer = (
    <div className="space-y-1">
      <Link
        href="/dashboard"
        className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        Mi dashboard
      </Link>
      <Link
        href="/"
        className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
      >
        <Home className="w-4 h-4" />
        Ir al inicio
      </Link>
      <p className="text-xs text-slate-500 truncate px-3 pt-1">{adminEmail}</p>
      <button
        onClick={handleSignOut}
        className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
      >
        <LogOut className="w-4 h-4" />
        Salir
      </button>
    </div>
  )

  return (
    <AppSidebarShell
      header={header}
      navItems={NAV}
      bottomNavItems={BOTTOM_NAV}
      footer={footer}
      desktopClass="bg-slate-900 border-r border-slate-700 text-slate-100"
      drawerClass="bg-slate-900 border-l border-slate-700 text-slate-100"
      bottomBarClass="bg-slate-900 border-t border-slate-700"
      activeClass="bg-orange-500 text-white"
      inactiveClass="text-slate-400 hover:text-slate-100 hover:bg-slate-800"
    />
  )
}
