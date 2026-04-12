import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Flip } from 'gsap/Flip'

// Register plugins once — safe to call multiple times.
// Guard against jsdom environments that lack matchMedia (e.g. vitest).
if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
  gsap.registerPlugin(ScrollTrigger, Flip)
}

export { gsap, ScrollTrigger, Flip }
