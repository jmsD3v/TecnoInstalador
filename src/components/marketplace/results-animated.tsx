'use client'

import { useRef, useEffect } from 'react'
import { gsap } from '@/lib/gsap'
import { InstallerCard } from '@/components/marketplace/installer-card'
import type { Installer } from '@/types'

export function ResultsAnimated({ installers }: { installers: Installer[] }) {
  const gridRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!gridRef.current || installers.length === 0) return
    const cards = gridRef.current.querySelectorAll(':scope > *')
    gsap.from(cards, {
      opacity: 0,
      scale: 0.95,
      y: 20,
      duration: 0.4,
      ease: 'power2.out',
      stagger: 0.06,
      clearProps: 'opacity,transform',
      overwrite: 'auto',
    })
  }, [installers])

  return (
    <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {installers.map(installer => (
        <InstallerCard key={installer.id} installer={installer} />
      ))}
    </div>
  )
}
