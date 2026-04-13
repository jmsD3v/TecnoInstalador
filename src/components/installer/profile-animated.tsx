'use client'

import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap } from '@/lib/gsap'

export function ProfileAnimated({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    const items = ref.current?.querySelectorAll('.animate-in')
    if (!items || items.length === 0) return
    gsap.from(items, {
      opacity: 0,
      y: 25,
      duration: 0.5,
      ease: 'power2.out',
      stagger: 0.08,
    })
  }, { scope: ref })

  return <div ref={ref}>{children}</div>
}
