import Link from 'next/link'
import { Circle, ChevronRight } from 'lucide-react'

interface InstallerSnippet {
  foto_perfil_url?: string | null
  descripcion?: string | null
  ciudad?: string | null
  whatsapp?: string | null
  installer_trades?: { id: string }[]
  installer_services?: { id: string }[]
}

interface Step {
  label: string
  done: boolean
  href: string
}

export function ProfileProgress({ installer }: { installer: InstallerSnippet }) {
  const steps: Step[] = [
    {
      label: 'Foto de perfil',
      done: !!installer.foto_perfil_url,
      href: '/dashboard/profile',
    },
    {
      label: 'Descripción',
      done: !!installer.descripcion && installer.descripcion.length > 20,
      href: '/dashboard/profile',
    },
    {
      label: 'Ciudad',
      done: !!installer.ciudad,
      href: '/dashboard/profile',
    },
    {
      label: 'WhatsApp de contacto',
      done: !!installer.whatsapp,
      href: '/dashboard/profile',
    },
    {
      label: 'Al menos 1 oficio',
      done: (installer.installer_trades?.length ?? 0) > 0,
      href: '/dashboard/services',
    },
    {
      label: 'Al menos 1 servicio',
      done: (installer.installer_services?.length ?? 0) > 0,
      href: '/dashboard/services',
    },
  ]

  const completedCount = steps.filter(s => s.done).length
  const pct = Math.round((completedCount / steps.length) * 100)
  const pending = steps.filter(s => !s.done)

  if (pct === 100) return null

  return (
    <div className="mx-3 mb-3 p-3 bg-primary/5 border border-primary/20 rounded-xl">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-semibold text-foreground">Completá tu perfil</span>
        <span className="text-xs font-bold text-primary">{pct}%</span>
      </div>
      <div className="w-full h-1.5 bg-muted rounded-full mb-2.5">
        <div
          className="h-1.5 bg-primary rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <ul className="space-y-1">
        {pending.slice(0, 3).map(step => (
          <li key={step.label}>
            <Link
              href={step.href}
              className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors group"
            >
              <Circle className="w-3 h-3 shrink-0 text-muted-foreground/40" />
              <span className="flex-1">{step.label}</span>
              <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-60 transition-opacity" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
