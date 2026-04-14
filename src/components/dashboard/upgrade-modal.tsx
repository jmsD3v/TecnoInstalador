'use client'

import { X, Zap, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface UpgradeModalProps {
  open: boolean
  onClose: () => void
  trigger?: 'trade' | 'service' | 'gallery' | 'generic'
}

const BENEFITS = [
  'Hasta 3 oficios y servicios ilimitados',
  'Aparecés antes en los resultados de búsqueda',
  'Galería de fotos de tus trabajos (hasta 20)',
  'Presupuestos digitales para tus clientes',
  'Estadísticas de visitas y clicks de WhatsApp',
]

const TRIGGER_TEXTS: Record<NonNullable<UpgradeModalProps['trigger']>, string> = {
  trade: 'Con el plan Gratis solo podés tener 1 oficio. Subí a PRO y sumá hasta 3 oficios para llegar a más clientes.',
  service: 'Llegaste al límite de servicios del plan Gratis. Con PRO tenés servicios ilimitados.',
  gallery: 'El plan Gratis permite 3 fotos. Con PRO subís hasta 20 fotos de tus trabajos.',
  generic: 'Desbloqueá todas las funciones de TecnoInstalador y conseguí más clientes.',
}

export function UpgradeModal({ open, onClose, trigger = 'generic' }: UpgradeModalProps) {
  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative w-full max-w-md bg-background rounded-2xl shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header gradient */}
        <div className="bg-gradient-to-br from-primary to-blue-700 px-6 pt-6 pb-8 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <Zap className="w-4 h-4 text-yellow-300" />
            </div>
            <span className="text-sm font-semibold text-blue-100 uppercase tracking-wide">Plan PRO</span>
          </div>
          <h2 className="text-2xl font-extrabold leading-tight mb-2">Conseguí más clientes con PRO</h2>
          <p className="text-blue-100 text-sm leading-relaxed">{TRIGGER_TEXTS[trigger]}</p>
        </div>

        {/* Benefits */}
        <div className="px-6 py-5">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Lo que incluye PRO</p>
          <ul className="space-y-2.5 mb-6">
            {BENEFITS.map(b => (
              <li key={b} className="flex items-start gap-2.5">
                <div className="w-5 h-5 bg-primary/10 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3 h-3 text-primary" />
                </div>
                <span className="text-sm text-foreground">{b}</span>
              </li>
            ))}
          </ul>

          {/* Price */}
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 mb-5 text-center">
            <p className="text-xs text-muted-foreground mb-0.5">Desde</p>
            <p className="text-lg font-extrabold text-primary">$7.999 / mes</p>
            <p className="text-xs text-muted-foreground">Cancelás cuando quieras</p>
          </div>

          {/* CTAs */}
          <div className="flex flex-col gap-2">
            <Button asChild className="w-full font-bold" size="lg">
              <Link href="/dashboard/plan" onClick={onClose}>Ver planes y precios →</Link>
            </Button>
            <button
              onClick={onClose}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors py-1"
            >
              Ahora no
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
