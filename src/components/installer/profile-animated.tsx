'use client'

import { useRef, useEffect } from 'react'
import { gsap } from '@/lib/gsap'

export function ProfileAnimated({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const hasRun = useRef(false)

  useEffect(() => {
    if (hasRun.current || !ref.current) return
    hasRun.current = true

    const items = ref.current.querySelectorAll('.animate-in')
    if (!items.length) return

    gsap.from(items, {
      opacity: 0,
      y: 25,
      duration: 0.5,
      ease: 'power2.out',
      stagger: 0.08,
      clearProps: 'opacity,transform',
    })
  }, [])

  return <div ref={ref}>{children}</div>
}
