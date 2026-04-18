'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, Users, Star, CreditCard, LogOut, Wrench, Home, ChevronLeft, BadgeCheck, Globe, BarChart2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

const NAV = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard, exact: true },
  { href: '/admin/users', label: 'Usuarios', icon: Users },
  { href: '/admin/reviews', label: 'Reseñas', icon: Star },
  { href: '/admin/subscriptions', label: 'Suscripciones', icon: CreditCard },
  { href: '/admin/verifications', label: 'Verificaciones', icon: BadgeCheck },
  { href: '/admin/domains', label: 'Dominios', icon: Globe },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart2 },
]

export function AdminSidebar({ adminEmail }: { adminEmail: string }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <aside className="w-56 shrink-0 hidden lg:flex flex-col bg-slate-900 text-slate-100 min-h-screen">
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-orange-500 rounded-md flex items-center justify-center">
            <Wrench className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-sm">TecnoAdmin</span>
        </div>
      </div>

      <nav className="flex-1 p-3 flex flex-col gap-1">
        {NAV.map(item => {
          const Icon = item.icon
          const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-orange-500 text-white'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-slate-700 space-y-2">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-xs text-slate-400 hover:text-slate-100 transition-colors"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          Mi dashboard
        </Link>
        <Link
          href="/"
          className="flex items-center gap-2 text-xs text-slate-400 hover:text-slate-100 transition-colors"
        >
          <Home className="w-3.5 h-3.5" />
          Ir al inicio
        </Link>
        <p className="text-xs text-slate-500 truncate pt-1">{adminEmail}</p>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 text-xs text-slate-400 hover:text-slate-100 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          Salir
        </button>
      </div>
    </aside>
  )
}
