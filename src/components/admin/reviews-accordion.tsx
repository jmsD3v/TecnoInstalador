'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ReviewToggle } from './review-toggle'

export interface ReviewRow {
  id: string
  rating: number
  comentario: string | null
  is_public: boolean
  created_at: string
}

export interface InstallerGroup {
  installerId: string
  installerName: string
  reviews: ReviewRow[]
}

interface Props {
  groups: InstallerGroup[]
}

export function ReviewsAccordion({ groups }: Props) {
  const [open, setOpen] = useState<Set<string>>(new Set())

  const toggle = (id: string) =>
    setOpen(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  if (groups.length === 0) {
    return (
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-8 text-center text-slate-500">
        Sin resultados
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {groups.map(group => {
        const isOpen = open.has(group.installerId)
        const approvedCount = group.reviews.filter(r => r.is_public).length
        const hiddenCount = group.reviews.length - approvedCount

        return (
          <div key={group.installerId} className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
            {/* Header */}
            <button
              onClick={() => toggle(group.installerId)}
              className="w-full flex items-center gap-3 p-4 hover:bg-slate-700/40 transition-colors text-left"
            >
              {isOpen
                ? <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                : <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
              }
              <span className="font-semibold text-slate-100 flex-1">{group.installerName}</span>
              <div className="flex items-center gap-2 text-xs">
                <span className="bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full">
                  {group.reviews.length} reseña{group.reviews.length !== 1 ? 's' : ''}
                </span>
                {approvedCount > 0 && (
                  <span className="bg-green-900/50 text-green-400 px-2 py-0.5 rounded-full font-semibold">
                    {approvedCount} aprobada{approvedCount !== 1 ? 's' : ''}
                  </span>
                )}
                {hiddenCount > 0 && (
                  <span className="bg-red-900/50 text-red-400 px-2 py-0.5 rounded-full font-semibold">
                    {hiddenCount} oculta{hiddenCount !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
            </button>

            {/* Reviews table */}
            {isOpen && (
              <div className="border-t border-slate-700">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-700/60 bg-slate-900/30">
                      <th className="text-left px-4 py-2 text-slate-400 font-medium">Rating</th>
                      <th className="text-left px-4 py-2 text-slate-400 font-medium hidden md:table-cell">Comentario</th>
                      <th className="text-left px-4 py-2 text-slate-400 font-medium">Estado</th>
                      <th className="text-left px-4 py-2 text-slate-400 font-medium hidden md:table-cell">Fecha</th>
                      <th className="px-4 py-2 text-slate-400 font-medium">Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.reviews.map(r => (
                      <tr key={r.id} className="border-b border-slate-700/30 hover:bg-slate-700/20 transition-colors">
                        <td className="px-4 py-3 text-yellow-400 font-bold text-base">
                          {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
                        </td>
                        <td className="px-4 py-3 text-slate-400 hidden md:table-cell max-w-xs">
                          <span className="line-clamp-2">{r.comentario ?? '—'}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={cn(
                            'text-xs font-semibold px-2 py-0.5 rounded-full',
                            r.is_public
                              ? 'bg-green-900/50 text-green-400'
                              : 'bg-red-900/50 text-red-400'
                          )}>
                            {r.is_public ? 'Aprobada' : 'Oculta'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-500 text-xs hidden md:table-cell">
                          {new Date(r.created_at).toLocaleDateString('es-AR')}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <ReviewToggle reviewId={r.id} isPublic={r.is_public} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
