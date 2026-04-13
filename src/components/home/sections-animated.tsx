'use client'

import { useRef, useLayoutEffect } from 'react'
import { gsap, ScrollTrigger } from '@/lib/gsap'

interface SectionAnimatedProps {
  children: React.ReactNode
  className?: string
  stagger?: number
}

export function SectionAnimated({ children, className, stagger = 0.1 }: SectionAnimatedProps) {
  const ref = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
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
    }, ref)
    return () => ctx.revert()
  }, [stagger])

  return <div ref={ref} className={className}>{children}</div>
}
