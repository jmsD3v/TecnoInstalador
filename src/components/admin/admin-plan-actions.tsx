'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CreditCard, Clock } from 'lucide-react'

type PlanType = 'FREE' | 'PRO' | 'PREMIUM'

interface Props {
  installerId: string
  currentPlan: PlanType
  currentTrialEndsAt?: string | null
  currentPlanExpiresAt?: string | null
}

const PLANS: PlanType[] = ['FREE', 'PRO', 'PREMIUM']

function toDatetimeLocal(iso?: string | null): string {
  if (!iso) return ''
  return iso.slice(0, 16) // "2026-04-17T12:00"
}

function toIso(local: string): string | null {
  if (!local) return null
  return new Date(local).toISOString()
}

export function AdminPlanActions({ installerId, currentPlan, currentTrialEndsAt, currentPlanExpiresAt }: Props) {
  const router = useRouter()
  const [plan, setPlan] = useState<PlanType>(currentPlan)
  const [trialEndsAt, setTrialEndsAt] = useState(toDatetimeLocal(currentTrialEndsAt))
  const [planExpiresAt, setPlanExpiresAt] = useState(toDatetimeLocal(currentPlanExpiresAt))
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  const handleSave = async () => {
    setSaving(true)
    setMsg('')
    const res = await fetch(`/api/admin/users/${installerId}/set-plan`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        plan,
        trial_ends_at: toIso(trialEndsAt),
        plan_expires_at: toIso(planExpiresAt),
      }),
    })
    if (res.ok) {
      setMsg('✓ Guardado')
      router.refresh()
    } else {
      const data = await res.json().catch(() => ({}))
      setMsg(`Error: ${data.error ?? 'desconocido'}`)
    }
    setSaving(false)
  }

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 space-y-4">
      <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
        <CreditCard className="w-4 h-4" /> Plan manual
      </h2>

      {/* Plan selector */}
      <div>
        <label className="text-xs text-slate-400 block mb-1.5">Plan</label>
        <div className="flex gap-2">
          {PLANS.map(p => (
            <button
              key={p}
              onClick={() => setPlan(p)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-colors ${
                plan === p
                  ? p === 'PREMIUM'
                    ? 'bg-purple-600 border-purple-500 text-white'
                    : p === 'PRO'
                    ? 'bg-orange-500 border-orange-400 text-white'
                    : 'bg-slate-600 border-slate-500 text-slate-100'
                  : 'border-slate-600 text-slate-400 hover:text-slate-200 hover:border-slate-500'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Trial override */}
      <div>
        <label className="text-xs text-slate-400 block mb-1.5 flex items-center gap-1">
          <Clock className="w-3 h-3" /> Trial hasta
        </label>
        <input
          type="datetime-local"
          value={trialEndsAt}
          onChange={e => setTrialEndsAt(e.target.value)}
          className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-orange-500 w-full max-w-xs"
        />
        <p className="text-xs text-slate-500 mt-1">Dejá vacío para quitar el trial.</p>
      </div>

      {/* Plan expires at */}
      <div>
        <label className="text-xs text-slate-400 block mb-1.5 flex items-center gap-1">
          <Clock className="w-3 h-3" /> Plan vence el
        </label>
        <input
          type="datetime-local"
          value={planExpiresAt}
          onChange={e => setPlanExpiresAt(e.target.value)}
          className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-orange-500 w-full max-w-xs"
        />
        <p className="text-xs text-slate-500 mt-1">Opcional. Dejá vacío para sin vencimiento.</p>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-400 text-white text-sm font-semibold disabled:opacity-50 transition-colors"
        >
          {saving ? 'Guardando…' : 'Guardar cambios'}
        </button>
        {msg && (
          <p className={`text-sm ${msg.startsWith('Error') ? 'text-red-400' : 'text-green-400'}`}>
            {msg}
          </p>
        )}
      </div>
    </div>
  )
}
