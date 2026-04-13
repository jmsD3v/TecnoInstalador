'use client'

import { useState } from "react"
import Link from "next/link"
import { CheckCircle2, Crown, Zap, Sparkles, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { PlanPrices } from "@/lib/mp-plans"
import type { PlanType } from "@/types"

function formatARS(n: number) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency', currency: 'ARS', maximumFractionDigits: 0,
  }).format(n)
}

const FEATURES: Record<PlanType, string[]> = {
  FREE: [
    '1 oficio registrado',
    '3 servicios publicados',
    '5 fotos en galería',
    'Perfil público visible',
    'Reseñas verificadas',
    'Botón WhatsApp directo',
    'Aparecés en búsquedas',
  ],
  PRO: [
    '3 oficios registrados',
    '10 servicios publicados',
    '30 fotos en galería',
    'Perfil público verificado',
    'Reseñas verificadas',
    'Botón WhatsApp directo',
    'Presupuestos desde la app',
    'Mejor posición en búsqueda',
  ],
  PREMIUM: [
    'Oficios ilimitados',
    'Servicios ilimitados',
    '200 fotos en galería',
    'Perfil público verificado',
    'Reseñas verificadas',
    'Botón WhatsApp directo',
    'Presupuestos desde la app',
    'Posición destacada en búsqueda',
    'Badge Premium exclusivo',
    'Estadísticas de visitas',
    'Dominio personalizado',
  ],
}

type Plan = 'FREE' | 'PRO' | 'PREMIUM'

interface PricingCardsProps {
  prices: PlanPrices | null
  mode?: 'public' | 'dashboard'
  // Public mode
  isLoggedIn?: boolean
  // Dashboard mode
  currentPlan?: PlanType
  hasActiveSub?: boolean
  subscribingTo?: PlanType | null
  onSubscribe?: (plan: 'PRO' | 'PREMIUM', period: 'monthly' | 'annual') => void
}

export function PricingCards({
  prices,
  mode = 'public',
  isLoggedIn,
  currentPlan,
  hasActiveSub,
  subscribingTo,
  onSubscribe,
}: PricingCardsProps) {
  const [period, setPeriod] = useState<'monthly' | 'annual'>('monthly')

  const plans: Plan[] = ['FREE', 'PRO', 'PREMIUM']

  return (
    <div className="space-y-8">
      {/* Billing toggle */}
      <div className="flex flex-col items-center gap-2">
        <div className="flex items-center gap-1 bg-muted p-1 rounded-xl">
          <button
            className={cn(
              "px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200",
              period === 'monthly'
                ? 'bg-card shadow text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            )}
            onClick={() => setPeriod('monthly')}
          >
            Mensual
          </button>
          <button
            className={cn(
              "px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2",
              period === 'annual'
                ? 'bg-card shadow text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            )}
            onClick={() => setPeriod('annual')}
          >
            Anual
            <span className="text-xs bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 font-semibold px-2 py-0.5 rounded-full">
              −17%
            </span>
          </button>
        </div>
        {period === 'annual' && (
          <p className="text-xs text-muted-foreground animate-in fade-in duration-200">
            Equivale a pagar 10 meses y recibir 2 de regalo
          </p>
        )}
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start mt-5">
        {plans.map(plan => {
          const isFeatured  = plan === 'PRO'
          const isPremium   = plan === 'PREMIUM'
          const isFree      = plan === 'FREE'
          const isCurrent   = currentPlan === plan

          const priceData   = !isFree ? prices?.[plan as 'PRO' | 'PREMIUM'] : null
          const priceNow    = priceData
            ? (period === 'monthly' ? priceData.monthly : priceData.annual)
            : null
          const priceSaved  = priceData
            ? priceData.monthly * 12 - priceData.annual
            : null

          return (
            <div
              key={plan}
              className={cn(
                "relative rounded-2xl border flex flex-col transition-all duration-300",
                isFeatured && "shadow-2xl shadow-primary/20 border-primary/60 bg-gradient-to-b from-primary/5 to-transparent dark:from-primary/10",
                isPremium  && "border-yellow-400/40 shadow-lg shadow-yellow-500/10",
                isFree     && "border-border bg-card",
                !isFeatured && !isPremium && "bg-card",
              )}
            >
              {/* Featured badge */}
              {isFeatured && (
                <div className="absolute -top-3.5 inset-x-0 flex justify-center">
                  <span className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground text-xs font-bold px-4 py-1.5 rounded-full shadow-lg shadow-primary/30 tracking-wide">
                    <Sparkles className="w-3 h-3" />
                    EL MÁS ELEGIDO
                  </span>
                </div>
              )}

              {/* Premium badge */}
              {isPremium && (
                <div className="absolute -top-3.5 inset-x-0 flex justify-center">
                  <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-yellow-500 to-amber-400 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg shadow-yellow-500/30 tracking-wide">
                    <Crown className="w-3 h-3" />
                    MÁXIMO ALCANCE
                  </span>
                </div>
              )}

              <div className="p-6 pt-8 flex flex-col flex-1">
                {/* Plan header */}
                <div className="flex items-center gap-2 mb-1">
                  {isFeatured && <Zap  className="w-5 h-5 text-primary shrink-0" />}
                  {isPremium  && <Crown className="w-5 h-5 text-yellow-500 shrink-0" />}
                  <h3 className={cn(
                    "font-bold text-xl",
                    isFeatured && "text-primary",
                    isPremium  && "text-yellow-600 dark:text-yellow-400",
                  )}>
                    {plan === 'FREE' ? 'Gratuito' : plan === 'PRO' ? 'Pro' : 'Premium'}
                  </h3>
                  {isCurrent && (
                    <span className="ml-auto text-xs font-medium bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                      Tu plan
                    </span>
                  )}
                </div>

                {/* Value prop */}
                <p className="text-xs text-muted-foreground mb-5">
                  {isFree    && "Empezá sin costo, sin límite de tiempo"}
                  {isFeatured && "Más clientes, más presupuestos, más posición"}
                  {isPremium  && "Visibilidad máxima y herramientas completas"}
                </p>

                {/* Price */}
                <div className="mb-5">
                  {isFree ? (
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-extrabold">$0</span>
                      <span className="text-muted-foreground text-sm">/ siempre</span>
                    </div>
                  ) : priceNow !== null ? (
                    <>
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-extrabold tabular-nums">
                          {formatARS(period === 'monthly' ? priceNow : Math.round(priceNow / 12))}
                        </span>
                        <span className="text-muted-foreground text-sm">/ mes</span>
                      </div>
                      {period === 'annual' && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Facturado como{' '}
                          <span className="font-semibold text-foreground">{formatARS(priceNow)}/año</span>
                        </p>
                      )}
                      {period === 'annual' && priceSaved !== null && priceSaved > 0 && (
                        <div className="inline-flex items-center gap-1 mt-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2.5 py-1 rounded-full">
                          Ahorrás {formatARS(priceSaved)} al año
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-4xl font-extrabold text-muted-foreground">—</div>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-2.5 mb-6 flex-1">
                  {FEATURES[plan].map(f => (
                    <li key={f} className="flex items-start gap-2.5 text-sm">
                      <CheckCircle2 className={cn(
                        "w-4 h-4 mt-0.5 shrink-0",
                        isFeatured ? "text-primary"     :
                        isPremium  ? "text-yellow-500"  :
                                     "text-emerald-500"
                      )} />
                      <span className="text-muted-foreground">{f}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                {mode === 'dashboard' ? (
                  <DashboardCta
                    plan={plan}
                    period={period}
                    isCurrent={!!isCurrent}
                    hasActiveSub={!!hasActiveSub}
                    isLoading={subscribingTo === plan}
                    onSubscribe={onSubscribe}
                    isFeatured={isFeatured}
                  />
                ) : (
                  <PublicCta plan={plan} isLoggedIn={!!isLoggedIn} />
                )}
              </div>
            </div>
          )
        })}
      </div>

      <p className="text-xs text-center text-muted-foreground pt-2">
        Pagos procesados por MercadoPago · Cancelá cuando quieras · Sin permanencia
      </p>
    </div>
  )
}

function DashboardCta({
  plan, period, isCurrent, hasActiveSub, isLoading, onSubscribe, isFeatured,
}: {
  plan: Plan
  period: 'monthly' | 'annual'
  isCurrent: boolean
  hasActiveSub: boolean
  isLoading: boolean
  onSubscribe?: (plan: 'PRO' | 'PREMIUM', period: 'monthly' | 'annual') => void
  isFeatured: boolean
}) {
  if (plan === 'FREE') {
    return (
      <div className="text-xs text-center text-muted-foreground py-2.5 bg-muted/50 rounded-xl">
        {isCurrent ? 'Plan actual' : 'Disponible siempre'}
      </div>
    )
  }

  if (isCurrent) {
    return (
      <Button variant="outline" className="w-full" disabled>
        Plan actual
      </Button>
    )
  }

  if (hasActiveSub) {
    return (
      <Button variant="outline" className="w-full opacity-60" disabled>
        Cambio no disponible
      </Button>
    )
  }

  return (
    <Button
      className={cn(
        "w-full gap-2",
        isFeatured && "shadow-lg shadow-primary/30"
      )}
      loading={isLoading}
      onClick={() => onSubscribe?.(plan as 'PRO' | 'PREMIUM', period)}
    >
      Suscribirme
      <ArrowRight className="w-4 h-4" />
    </Button>
  )
}

function PublicCta({ plan, isLoggedIn }: { plan: Plan; isLoggedIn: boolean }) {
  if (plan === 'FREE') {
    return (
      <Button variant="outline" className="w-full" asChild>
        <Link href={isLoggedIn ? '/dashboard' : '/auth/register'}>
          {isLoggedIn ? 'Ir al panel' : 'Empezar gratis'}
        </Link>
      </Button>
    )
  }
  return (
    <Button className="w-full gap-2" asChild>
      <Link href={isLoggedIn ? '/dashboard/plan' : '/auth/register'}>
        {isLoggedIn ? 'Suscribirme' : 'Crear cuenta gratis'}
        <ArrowRight className="w-4 h-4" />
      </Link>
    </Button>
  )
}
