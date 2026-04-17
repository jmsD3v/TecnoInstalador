'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { InstallerCard } from './installer-card'
import { InstallerCardSkeleton } from '@/components/skeletons/installer-card-skeleton'

const PAGE_SIZE = 12

interface Props {
  initialInstallers: any[]
  hasMore: boolean
  total: number
  searchParams: { ciudad?: string; provincia?: string; trade?: string }
}

export function LoadMore({ initialInstallers, hasMore: initialHasMore, total, searchParams }: Props) {
  const [installers, setInstallers] = useState(initialInstallers)
  const [hasMore, setHasMore] = useState(initialHasMore)
  const [loading, setLoading] = useState(false)
  const sentinelRef = useRef<HTMLDivElement>(null)

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return
    setLoading(true)

    const params = new URLSearchParams()
    if (searchParams.ciudad) params.set('ciudad', searchParams.ciudad)
    if (searchParams.provincia) params.set('provincia', searchParams.provincia)
    if (searchParams.trade) params.set('trade', searchParams.trade)
    params.set('offset', String(installers.length))

    const res = await fetch(`/api/buscar?${params}`)
    const data = await res.json()

    setInstallers(prev => [...prev, ...data.installers])
    setHasMore(data.hasMore)
    setLoading(false)
  }, [loading, hasMore, installers.length, searchParams])

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) loadMore()
    }, { rootMargin: '200px' })
    obs.observe(el)
    return () => obs.disconnect()
  }, [loadMore])

  return (
    <>
      <p className="text-sm text-muted-foreground mb-4">
        {total} resultado{total !== 1 ? 's' : ''}
        {searchParams.ciudad && <> en <strong>{searchParams.ciudad}</strong></>}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {installers.map((inst: any) => (
          <InstallerCard key={inst.id} installer={inst} />
        ))}
        {loading && Array.from({ length: 3 }).map((_, i) => (
          <InstallerCardSkeleton key={`sk-${i}`} />
        ))}
      </div>

      {/* Sentinel — triggers loadMore when visible */}
      {hasMore && <div ref={sentinelRef} className="h-8 mt-4" />}

      {!hasMore && installers.length > PAGE_SIZE && (
        <p className="text-center text-xs text-muted-foreground mt-6">
          Mostrando todos los resultados
        </p>
      )}
    </>
  )
}
