'use client'

import Link from 'next/link'
import { computeProfileScore, ProfileForScore } from '@/lib/profile-score'

export function ProfileProgress({ installer }: { installer: ProfileForScore & { review_count?: number } }) {
  const { score, items } = computeProfileScore(installer)

  const incomplete = items.filter(i => !i.done)
  const color = score >= 80 ? 'text-green-500' : score >= 50 ? 'text-yellow-500' : 'text-red-500'
  const ring = score >= 80 ? 'stroke-green-500' : score >= 50 ? 'stroke-yellow-500' : 'stroke-red-500'
  const circumference = 2 * Math.PI * 20
  const offset = circumference - (score / 100) * circumference

  return (
    <div className="px-4 py-3 border-b border-border">
      <div className="flex items-center gap-3">
        {/* Score ring */}
        <div className="relative shrink-0 w-12 h-12">
          <svg className="w-12 h-12 -rotate-90" viewBox="0 0 48 48">
            <circle cx="24" cy="24" r="20" fill="none" stroke="currentColor" strokeWidth="4" className="text-muted/30" />
            <circle
              cx="24" cy="24" r="20" fill="none" strokeWidth="4"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              className={ring}
            />
          </svg>
          <span className={`absolute inset-0 flex items-center justify-center text-xs font-bold ${color}`}>
            {score}%
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold">Perfil {score}% completo</p>
          {incomplete.length > 0 ? (
            <p className="text-[10px] text-muted-foreground truncate">
              Falta: {incomplete[0].label}{incomplete.length > 1 ? ` y ${incomplete.length - 1} más` : ''}
            </p>
          ) : (
            <p className="text-[10px] text-green-600">¡Perfil completo!</p>
          )}
        </div>

        {incomplete.length > 0 && (
          <Link
            href="/dashboard/profile"
            className="text-[10px] text-primary hover:underline shrink-0"
          >
            Mejorar →
          </Link>
        )}
      </div>
    </div>
  )
}
