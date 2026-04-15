'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Zap, Droplets, Flame, Wind, Monitor, Wifi, Camera, Smartphone, Package, Sun, HardHat, Hammer } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

const TRADE_OPTIONS = [
  { slug: 'electricidad', label: 'Electricidad', icon: Zap },
  { slug: 'plomeria', label: 'Plomería', icon: Droplets },
  { slug: 'gas', label: 'Gas', icon: Flame },
  { slug: 'aire-acondicionado', label: 'Aire Acond.', icon: Wind },
  { slug: 'tecnico-pc', label: 'Técnico PC', icon: Monitor },
  { slug: 'redes', label: 'Redes/Internet', icon: Wifi },
  { slug: 'camaras-cctv', label: 'Cámaras CCTV', icon: Camera },
  { slug: 'celulares', label: 'Celulares', icon: Smartphone },
  { slug: 'muebles-mdf', label: 'Muebles MDF', icon: Package },
  { slug: 'energia-solar', label: 'Energía Solar', icon: Sun },
  { slug: 'albanileria', label: 'Albañilería', icon: HardHat },
  { slug: 'otros', label: 'Otros', icon: Hammer },
]

const supabase = createClient()

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [installerId, setInstallerId] = useState<string | null>(null)
  const [selectedTrade, setSelectedTrade] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    supabase.from('installers').select('id, onboarding_completed').then(({ data }) => {
      if (data?.[0]?.onboarding_completed) router.replace('/dashboard')
      else setInstallerId(data?.[0]?.id ?? null)
    })
  }, [router])

  const handleSelectTrade = async () => {
    if (!selectedTrade || !installerId) return
    setSaving(true)
    const { data: trade } = await supabase.from('trades').select('id').eq('slug', selectedTrade).single()
    if (trade) {
      await supabase.from('installer_trades').upsert({ installer_id: installerId, trade_id: trade.id })
    }
    setSaving(false)
    setStep(3)
  }

  const handleFinish = async () => {
    if (!installerId) return
    setSaving(true)
    await supabase.from('installers').update({ onboarding_completed: true }).eq('id', installerId)
    setSaving(false)
    router.push('/dashboard')
  }

  const STEPS = ['Bienvenida', 'Tu oficio', '¡Listo!']

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-lg">
        <div className="flex items-center gap-2 mb-8">
          {STEPS.map((label, i) => (
            <div key={label} className="flex items-center gap-2 flex-1">
              <div className={cn('w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0',
                i + 1 <= step ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
              )}>{i + 1}</div>
              <span className={cn('text-xs hidden sm:block', i + 1 <= step ? 'text-foreground' : 'text-muted-foreground')}>
                {label}
              </span>
              {i < STEPS.length - 1 && <div className={cn('flex-1 h-0.5 rounded', i + 1 < step ? 'bg-primary' : 'bg-muted')} />}
            </div>
          ))}
        </div>

        {step === 1 && (
          <div className="text-center space-y-4">
            <div className="text-6xl">👋</div>
            <h1 className="text-3xl font-extrabold">¡Bienvenido a TecnoInstalador!</h1>
            <p className="text-muted-foreground">En 2 pasos vas a tener tu perfil listo para conseguir clientes.</p>
            <button className="w-full mt-6 font-bold bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3 rounded-lg text-base"
              onClick={() => setStep(2)}>Empezar →</button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">¿Cuál es tu oficio principal?</h2>
            <p className="text-muted-foreground text-sm">Podés agregar más oficios después desde tu perfil.</p>
            <div className="grid grid-cols-3 gap-3">
              {TRADE_OPTIONS.map(({ slug, label, icon: Icon }) => (
                <button key={slug} onClick={() => setSelectedTrade(slug)}
                  className={cn('flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all text-sm font-medium',
                    selectedTrade === slug
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border text-muted-foreground hover:border-primary/40 hover:text-foreground')}>
                  <Icon className="w-6 h-6" />
                  {label}
                </button>
              ))}
            </div>
            <button className="w-full font-bold bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3 rounded-lg text-base disabled:opacity-50"
              disabled={!selectedTrade || saving} onClick={handleSelectTrade}>
              {saving ? 'Guardando...' : 'Continuar →'}
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="text-center space-y-4">
            <div className="text-6xl">🎉</div>
            <h2 className="text-3xl font-extrabold">¡Tu perfil está listo!</h2>
            <p className="text-muted-foreground">Ya aparecés en el buscador. Completá tu perfil para conseguir más clientes.</p>
            <button className="w-full font-bold bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3 rounded-lg text-base disabled:opacity-50"
              disabled={saving} onClick={handleFinish}>
              {saving ? 'Guardando...' : 'Ir a mi dashboard →'}
            </button>

            {/* PRO upsell */}
            <Link
              href="/dashboard/plan"
              className="flex items-center gap-3 p-4 rounded-xl border-2 border-primary/30 bg-primary/5 hover:bg-primary/10 hover:border-primary/50 transition-all text-left group"
            >
              <div className="w-9 h-9 bg-primary/15 rounded-lg flex items-center justify-center shrink-0">
                <Zap className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-foreground">Con PRO aparecés primero en búsquedas</p>
                <p className="text-xs text-muted-foreground">Hasta 3 oficios, galería de fotos, presupuestos digitales →</p>
              </div>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
