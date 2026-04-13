import { describe, it, expect } from 'vitest'

// Verify the gsap module exports what we expect (without DOM)
describe('gsap module', () => {
  it('exports gsap object', async () => {
    // Dynamic import to avoid SSR issues in test env
    const mod = await import('@/lib/gsap')
    expect(mod.gsap).toBeDefined()
    expect(typeof mod.gsap.to).toBe('function')
    expect(typeof mod.gsap.from).toBe('function')
    expect(typeof mod.gsap.timeline).toBe('function')
  })
})
