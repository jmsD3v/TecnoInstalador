'use client'

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/components/ui/toast"
import { Installer, PlanType, PLAN_LIMITS } from "@/types"
import { getEffectivePlan, PLAN_LABELS, PLAN_PRICES } from "@/lib/plans"
import { CheckCircle2, Crown, Zap, Lock } from "lucide-react"

const PLAN_FEATURES: Record<PlanType, string[]> = {
  FREE: [
    '1 oficio',
    '3 servicios',
    '5 fotos en galería',
    'Perfil público',
    'Reseñas verificadas',
    'Botón WhatsApp',
    'Aparece en búsqueda',
  ],
  PRO: [
    '3 oficios',
    '10 servicios',
    '30 fotos en galería',
    'Perfil público',
    'Reseñas verificadas',
    'Botón WhatsApp',
    'Presupuestos en la app',
    'Mejor posición en búsqueda',
  ],
  PREMIUM: [
    'Oficios ilimitados',
    'Servicios ilimitados',
    '200 fotos en galería',
    'Perfil público',
    'Reseñas verificadas',
    'Botón WhatsApp',
    'Presupuestos en la app',
    'Posición destacada en búsqueda',
    'Badge Premium',
    'Estadísticas de visitas',
    'Dominio personalizado',
  ],
}

export default function PlanPage() {
  const supabase = createClient()
  const toast = useToast()

  const [installer, setInstaller] = useState<Installer | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('installers').select('*').eq('user_id', user.id).single()
      setInstaller(data)
      setLoading(false)
    }
    load()
  }, [])

  // STUB: Aquí iría la integración real con MercadoPago / Stripe
  const handleUpgrade = (plan: PlanType) => {
    toast({
      title: 'Próximamente',
      description: 'La integración de pagos estará disponible pronto. Contactanos por WhatsApp para activar tu plan.',
      variant: 'warning',
    })
    // TODO: Redirigir a checkout de MercadoPago o Stripe
    // const checkoutUrl = await createCheckoutSession(plan)
    // router.push(checkoutUrl)
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
  if (!installer) return null

  const effectivePlan = getEffectivePlan(installer)
  const isTrialActive = installer.trial_ends_at && new Date(installer.trial_ends_at) > new Date()

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Mi plan</h1>
        <p className="text-muted-foreground text-sm mt-1">Gestioná tu suscripción</p>
      </div>

      {/* Current plan */}
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
          </div>
          {installer.plan === 'PREMIUM'
            ? <Badge variant="premium"><Crown className="w-3 h-3 mr-1" />Premium</Badge>
            : installer.plan === 'PRO'
            ? <Badge variant="pro"><Zap className="w-3 h-3 mr-1" />Pro</Badge>
            : <Badge variant="free">Gratis</Badge>
          }
        </CardContent>
      </Card>

      {/* Usage */}
      <Card>
        <CardHeader><CardTitle className="text-base">Uso actual</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {[
            { label: 'Oficios', max: PLAN_LIMITS[effectivePlan].max_trades },
            { label: 'Servicios', max: PLAN_LIMITS[effectivePlan].max_services },
            { label: 'Fotos', max: PLAN_LIMITS[effectivePlan].max_gallery },
          ].map(item => (
            <div key={item.label} className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{item.label}</span>
              <span className="font-medium">
                {item.max >= 999 ? 'Ilimitado' : `Hasta ${item.max}`}
              </span>
            </div>
          ))}
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Presupuestos</span>
            <span className="font-medium">
              {PLAN_LIMITS[effectivePlan].quotes ? '✓ Incluido' : <span className="text-red-500">No incluido</span>}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Destaque en búsqueda</span>
            <span className="font-medium">
              {PLAN_LIMITS[effectivePlan].featured ? '✓ Destacado' : 'Sin destacar'}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Plans comparison */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {(['FREE', 'PRO', 'PREMIUM'] as PlanType[]).map(plan => {
          const isCurrent = installer.plan === plan
          const isDowngrade = plan === 'FREE' && installer.plan !== 'FREE'

          return (
            <Card
              key={plan}
              className={isCurrent ? 'ring-2 ring-primary' : ''}
            >
              <CardContent className="pt-6 pb-4">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-bold text-lg">{PLAN_LABELS[plan]}</h3>
                  {plan === 'PRO' && <Zap className="w-4 h-4 text-blue-500" />}
                  {plan === 'PREMIUM' && <Crown className="w-4 h-4 text-yellow-500" />}
                </div>
                <p className="text-2xl font-extrabold mb-4">
                  {PLAN_PRICES[plan]}
                  {plan !== 'FREE' && <span className="text-sm font-normal text-muted-foreground"></span>}
                </p>

                <ul className="space-y-1.5 mb-5">
                  {PLAN_FEATURES[plan].map(f => (
                    <li key={f} className="flex items-start gap-2 text-xs">
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-500 mt-0.5 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>

                {isCurrent ? (
                  <Button variant="outline" className="w-full" disabled>Plan actual</Button>
                ) : (
                  <Button
                    className="w-full"
                    variant={plan === 'FREE' ? 'outline' : 'default'}
                    onClick={() => handleUpgrade(plan)}
                  >
                    {plan === 'FREE' ? 'Bajar a Gratis' : `Subir a ${PLAN_LABELS[plan]}`}
                  </Button>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Payment note */}
      <p className="text-xs text-center text-muted-foreground">
        Los pagos se procesarán vía MercadoPago. Próximamente disponible.
        {/* TODO: integrar MercadoPago / Stripe */}
      </p>
    </div>
  )
}
