'use client'

import { useRef, useEffect } from 'react'
import { gsap, ScrollTrigger } from '@/lib/gsap'

interface SectionAnimatedProps {
  children: React.ReactNode
  className?: string
  stagger?: number
}

export function SectionAnimated({ children, className, stagger = 0.1 }: SectionAnimatedProps) {
  const ref = useRef<HTMLDivElement>(null)
  const hasRun = useRef(false)

  useEffect(() => {
    if (hasRun.current || !ref.current) return
    hasRun.current = true

    const items = ref.current.querySelectorAll(':scope > *')
    if (!items.length) return

    gsap.from(items, {
      opacity: 0,
      y: 40,
      duration: 0.6,
      ease: 'power2.out',
      stagger,
      clearProps: 'opacity,transform',
      scrollTrigger: {
        trigger: ref.current,
        start: 'top 85%',
        once: true,
      },
    })
  }, [stagger])

  return <div ref={ref} className={className}>{children}</div>
}
