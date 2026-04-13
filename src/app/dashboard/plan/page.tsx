'use client'

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/components/ui/toast"
import { Installer, PlanType, Subscription } from "@/types"
import { PLAN_LABELS } from "@/lib/plans"
import type { PlanPrices } from "@/lib/mp-plans"
import { Crown, Zap } from "lucide-react"
import { PricingCards } from "@/components/pricing/pricing-cards"


export default function PlanPage() {
  const supabase = createClient()
  const toast = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [installer, setInstaller] = useState<Installer | null>(null)
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [prices, setPrices] = useState<PlanPrices | null>(null)
  const [loading, setLoading] = useState(true)
  const [subscribingTo, setSubscribingTo] = useState<PlanType | null>(null)
  const [cancelling, setCancelling] = useState(false)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)

  useEffect(() => {
    const status = searchParams.get('status')
    if (status === 'success') {
      toast({ title: '¡Suscripción iniciada!', description: 'Tu plan se activará en minutos.', variant: 'success' })
      router.replace('/dashboard/plan')
    } else if (status === 'failure') {
      toast({ title: 'Pago no completado', description: 'Podés intentarlo de nuevo cuando quieras.', variant: 'error' })
      router.replace('/dashboard/plan')
    }
  }, [searchParams])

  useEffect(() => {
    const load = async () => {
      const [{ data: { user } }, pricesRes] = await Promise.all([
        supabase.auth.getUser(),
        fetch('/api/plans/prices'),
      ])
      if (!user) return
      if (pricesRes.ok) setPrices(await pricesRes.json())
      const { data } = await supabase
        .from('installers')
        .select('*, subscriptions(*)')
        .eq('user_id', user.id)
        .single()
      setInstaller(data)
      const subs = (data as any)?.subscriptions
      setSubscription(Array.isArray(subs) ? subs[0] ?? null : subs ?? null)
      setLoading(false)
    }
    load()
  }, [])

  const handleSubscribe = async (plan: 'PRO' | 'PREMIUM', period: 'monthly' | 'annual') => {
    setSubscribingTo(plan)
    try {
      const res = await fetch('/api/payments/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, period }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast({ title: data.error ?? 'Error', variant: 'error' })
        return
      }
      window.location.href = data.init_point
    } catch {
      toast({ title: 'Error de conexión. Intentá de nuevo.', variant: 'error' })
    } finally {
      setSubscribingTo(null)
    }
  }

  const handleCancel = async () => {
    setCancelling(true)
    try {
      const res = await fetch('/api/payments/cancel', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) {
        toast({ title: data.error ?? 'Error al cancelar', variant: 'error' })
        return
      }
      toast({ title: 'Suscripción cancelada', description: 'Tu plan bajó a Gratuito.', variant: 'success' })
      setInstaller(prev => prev ? { ...prev, plan: 'FREE', subscription_id: undefined } : prev)
      setSubscription(null)
      setShowCancelConfirm(false)
    } catch {
      toast({ title: 'Error de conexión. Intentá de nuevo.', variant: 'error' })
    } finally {
      setCancelling(false)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  )
  if (!installer) return null

  const isTrialActive = installer.trial_ends_at && new Date(installer.trial_ends_at) > new Date()
  const hasActiveSub = !!subscription && ['authorized', 'pending'].includes(subscription.status)

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Mi plan</h1>
        <p className="text-muted-foreground text-sm mt-1">Gestioná tu suscripción</p>
      </div>

      {/* Current plan status */}
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="p-4 flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="text-sm text-muted-foreground">Plan actual</p>
            <p className="text-2xl font-extrabold">{PLAN_LABELS[installer.plan]}</p>
            {isTrialActive && (
              <p className="text-sm text-amber-600 font-medium">
                Trial activo — vence el {new Date(installer.trial_ends_at!).toLocaleDateString('es-AR')}
              </p>
            )}
            {hasActiveSub && subscription?.next_payment_date && (
              <p className="text-xs text-muted-foreground mt-1">
                Próximo cobro: {new Date(subscription.next_payment_date).toLocaleDateString('es-AR')}
              </p>
            )}
          </div>
          <div className="flex flex-col items-end gap-2">
            {installer.plan === 'PREMIUM'
              ? <Badge variant="premium"><Crown className="w-3 h-3 mr-1" />Premium</Badge>
              : installer.plan === 'PRO'
              ? <Badge variant="pro"><Zap className="w-3 h-3 mr-1" />Pro</Badge>
              : <Badge variant="free">Gratis</Badge>
            }
            {hasActiveSub && !showCancelConfirm && (
              <button
                className="text-xs text-destructive hover:underline"
                onClick={() => setShowCancelConfirm(true)}
              >
                Cancelar suscripción
              </button>
            )}
            {showCancelConfirm && (
              <div className="flex items-center gap-2 text-xs">
                <span className="text-muted-foreground">¿Confirmar cancelación?</span>
                <Button size="sm" variant="outline" onClick={() => setShowCancelConfirm(false)}>No</Button>
                <Button
                  size="sm"
                  className="bg-destructive text-white hover:bg-destructive/90"
                  loading={cancelling}
                  onClick={handleCancel}
                >
                  Cancelar
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* FREE upsell banner */}
      {installer.plan === 'FREE' && (
        <div className="flex items-start gap-3 p-4 rounded-xl border border-primary/30 bg-primary/5">
          <Zap className="w-5 h-5 text-primary mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold">Desbloqueá presupuestos, más fotos y mejor posición en búsqueda</p>
            <p className="text-xs text-muted-foreground mt-0.5">Con PRO aparecés más arriba y mandás presupuestos desde la app.</p>
          </div>
        </div>
      )}

      <PricingCards
        prices={prices}
        mode="dashboard"
        currentPlan={installer.plan}
        hasActiveSub={hasActiveSub}
        subscribingTo={subscribingTo}
        onSubscribe={handleSubscribe}
      />
    </div>
  )
}
