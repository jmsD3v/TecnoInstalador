'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from './theme-provider'
import { cn } from '@/lib/utils'

interface ThemeToggleProps {
  className?: string
  size?: 'sm' | 'default'
}

export function ThemeToggle({ className, size = 'default' }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      aria-label={theme === 'dark' ? 'Activar modo claro' : 'Activar modo oscuro'}
      className={cn(
        "relative inline-flex items-center justify-center rounded-lg border border-border",
        "bg-background text-muted-foreground",
        "hover:bg-accent hover:text-accent-foreground",
        "transition-colors duration-150 cursor-pointer",
        size === 'sm' ? "w-8 h-8" : "w-9 h-9",
        className
      )}
    >
      <Sun className={cn(
        "absolute transition-all duration-300",
        size === 'sm' ? "w-3.5 h-3.5" : "w-4 h-4",
        theme === 'dark' ? "opacity-0 rotate-90 scale-0" : "opacity-100 rotate-0 scale-100"
      )} />
      <Moon className={cn(
        "absolute transition-all duration-300",
        size === 'sm' ? "w-3.5 h-3.5" : "w-4 h-4",
        theme === 'dark' ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-0"
      )} />
    </button>
  )
}
