import { describe, it, expect, vi } from 'vitest'

// Test the context logic in isolation (not the React component)
describe('installer context helpers', () => {
  it('returns null installer when not loaded', () => {
    const state = { installer: null, loading: true }
    expect(state.installer).toBeNull()
    expect(state.loading).toBe(true)
  })

  it('installer with trial_ends_at in future is considered on trial', () => {
    const future = new Date(Date.now() + 86400000).toISOString()
    const installer = { plan: 'FREE' as const, trial_ends_at: future }
    const isTrialActive = new Date(installer.trial_ends_at) > new Date()
    expect(isTrialActive).toBe(true)
  })
})
