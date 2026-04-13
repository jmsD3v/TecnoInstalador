'use client'

import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap, ScrollTrigger } from '@/lib/gsap'

interface SectionAnimatedProps {
  children: React.ReactNode
  className?: string
  stagger?: number
}

export function SectionAnimated({ children, className, stagger = 0.1 }: SectionAnimatedProps) {
  const ref = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    if (!ref.current) return
    const items = ref.current.querySelectorAll(':scope > *')
    gsap.from(items, {
      opacity: 0,
      y: 40,
      duration: 0.6,
      ease: 'power2.out',
      stagger,
      scrollTrigger: {
        trigger: ref.current,
        start: 'top 85%',
        once: true,
      },
    })
  }, { scope: ref })

  return <div ref={ref} className={className}>{children}</div>
}
