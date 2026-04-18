'use client'

/**
 * Generic sidebar shell used by both /dashboard and /admin.
 * Renders:
 *  - Desktop: sticky left sidebar
 *  - Mobile: bottom nav bar (4 items + "Más") + slide-in drawer
 */

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface ShellNavItem {
  href: string
  label: string
  icon: React.ElementType
  exact?: boolean
  badge?: React.ReactNode
  disabled?: boolean
}

interface AppSidebarShellProps {
  /** Branding / plan badge area at the top */
  header: React.ReactNode
  /** All navigation items (desktop + drawer) */
  navItems: ShellNavItem[]
  /** Up to 4 items shown in mobile bottom bar (rest accessible via drawer) */
  bottomNavItems: ShellNavItem[]
  /** Footer links shown below nav (desktop sidebar + drawer) */
  footer?: React.ReactNode
  /** Extra content between header and nav (e.g. profile progress) */
  headerExtra?: React.ReactNode
  /** Tailwind classes for the desktop sidebar bg/border */
  desktopClass?: string
  /** Tailwind classes for the mobile drawer panel bg/border */
  drawerClass?: string
  /** Tailwind classes for the mobile bottom bar bg/border */
  bottomBarClass?: string
  /** Active link highlight classes */
  activeClass?: string
  /** Inactive link classes */
  inactiveClass?: string
}

export function AppSidebarShell({
  header,
  navItems,
  bottomNavItems,
  footer,
  headerExtra,
  desktopClass = 'bg-card border-r border-border',
  drawerClass = 'bg-background border-l border-border',
  bottomBarClass = 'bg-background/95 backdrop-blur-sm border-t border-border',
  activeClass = 'bg-primary text-primary-foreground shadow-sm',
  inactiveClass = 'text-muted-foreground hover:text-foreground hover:bg-accent',
}: AppSidebarShellProps) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  function isActive(item: Pick<ShellNavItem, 'href' | 'exact'>) {
    return item.exact
      ? pathname === item.href
      : pathname === item.href || pathname.startsWith(item.href + '/')
  }

  const navLink = (item: ShellNavItem, onClick?: () => void) => {
    const Icon = item.icon
    const active = isActive(item)
    return (
      <Link
        key={item.href}
        href={item.disabled ? '#' : item.href}
        onClick={item.disabled ? undefined : onClick}
        className={cn(
          'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
          active ? activeClass : inactiveClass,
          item.disabled && 'opacity-50 pointer-events-none',
        )}
      >
        <Icon className="w-4 h-4 shrink-0" />
        <span className="flex-1">{item.label}</span>
        {item.badge}
      </Link>
    )
  }

  return (
    <>
      {/* ── DESKTOP SIDEBAR ── */}
      <aside className={cn('w-64 shrink-0 hidden lg:flex flex-col sticky top-0 h-screen overflow-y-auto', desktopClass)}>
        <div className="border-b border-inherit">
          {header}
        </div>
        {headerExtra}
        <nav className="flex-1 p-3 flex flex-col gap-1">
          {navItems.map(item => navLink(item))}
        </nav>
        {footer && (
          <div className="p-4 border-t border-inherit">
            {footer}
          </div>
        )}
      </aside>

      {/* ── MOBILE BOTTOM BAR ── */}
      <nav className={cn('lg:hidden fixed bottom-0 left-0 right-0 z-40 flex items-stretch', bottomBarClass)}>
        {bottomNavItems.slice(0, 4).map(item => {
          const Icon = item.icon
          const active = isActive(item)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex-1 flex flex-col items-center justify-center gap-1 py-3 text-[11px] font-medium transition-colors',
                active ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          )
        })}
        <button
          onClick={() => setOpen(true)}
          className="flex-1 flex flex-col items-center justify-center gap-1 py-3 text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <Menu className="w-5 h-5" />
          <span>Más</span>
        </button>
      </nav>

      {/* ── MOBILE DRAWER ── */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className={cn('relative w-72 max-w-[85vw] flex flex-col h-full shadow-2xl animate-in slide-in-from-right duration-200', drawerClass)}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-inherit">
              <span className="font-bold text-base">Menú</span>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
              {navItems.map(item => navLink(item, () => setOpen(false)))}
            </nav>
            {footer && (
              <div className="p-4 border-t border-inherit">
                {footer}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
