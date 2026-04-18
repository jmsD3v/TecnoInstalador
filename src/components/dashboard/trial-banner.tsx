'use client'

import Link from 'next/link'
import { Zap } from 'lucide-react'

export default function TrialBanner({
  plan,
  trialEndsAt,
}: {
  plan: string
  trialEndsAt: string | null
}) {
  if (plan !== 'PRO' && plan !== 'PREMIUM') return null
  if (!trialEndsAt) return null

  const msLeft = new Date(trialEndsAt).getTime() - Date.now()
  const daysLeft = Math.ceil(msLeft / (1000 * 60 * 60 * 24))

  if (daysLeft < 0 || daysLeft > 7) return null

  return (
    <div className="bg-yellow-500/10 border-b border-yellow-500/30 px-4 py-2 text-sm flex items-center justify-between gap-2">
      <span className="flex items-center gap-1.5 text-yellow-700 dark:text-yellow-300">
        <Zap className="size-3.5 shrink-0" />
        {daysLeft === 0
          ? 'Tu período de prueba vence hoy.'
          : `Tu período de prueba vence en ${daysLeft} día${daysLeft === 1 ? '' : 's'}.`}
      </span>
      <Link
        href="/dashboard/plan"
        className="text-xs font-semibold text-yellow-700 dark:text-yellow-300 underline whitespace-nowrap"
      >
        Activar plan →
      </Link>
    </div>
  )
}
