'use client'

import { useEffect, useRef } from 'react'
import { gsap, ScrollTrigger } from '@/lib/gsap'

interface ScrollAnimationOptions {
  from?: gsap.TweenVars
  to?: gsap.TweenVars
  trigger?: string
  stagger?: number
}

/**
 * Attach a ScrollTrigger fade-in animation to a container ref.
 * Elements matching `selector` (default: ':scope > *') animate in on scroll.
 */
export function useScrollAnimation(
  selector = ':scope > *',
  options: ScrollAnimationOptions = {}
) {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    // One-shot animation — options changes after mount are intentionally ignored.
    // Callers should treat this hook as fire-and-forget on mount.
    if (!ref.current) return

    const elements = ref.current.querySelectorAll(selector)
    if (elements.length === 0) return

    const ctx = gsap.context(() => {
      gsap.from(elements, {
        opacity: 0,
        duration: 0.6,
        ease: 'power2.out',
        stagger: options.stagger ?? 0.1,
        scrollTrigger: {
          trigger: ref.current,
          start: 'top 85%',
          once: true,
        },
        ...options.from,
      })
    }, ref)

    return () => ctx.revert()
  }, [selector, options.stagger]) // eslint-disable-line react-hooks/exhaustive-deps

  return ref
}
