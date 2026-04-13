'use client'

import { useRef, useLayoutEffect } from 'react'
import { gsap } from '@/lib/gsap'

export function ProfileAnimated({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const items = ref.current?.querySelectorAll('.animate-in')
      if (!items || items.length === 0) return
      gsap.from(items, {
        opacity: 0,
        y: 25,
        duration: 0.5,
        ease: 'power2.out',
        stagger: 0.08,
      })
    }, ref)
    return () => ctx.revert()
  }, [])

  return <div ref={ref}>{children}</div>
}
