import { describe, it, expect } from 'vitest'
import { subscribeSchema, cancelSchema, adminToggleActiveSchema, adminTogglePublicSchema } from '@/lib/validations'

describe('subscribeSchema', () => {
  it('accepts valid payload', () => {
    const result = subscribeSchema.safeParse({ planId: 'abc123', billingPeriod: 'monthly' })
    expect(result.success).toBe(true)
  })
  it('rejects missing planId', () => {
    const result = subscribeSchema.safeParse({ billingPeriod: 'monthly' })
    expect(result.success).toBe(false)
  })
  it('rejects invalid billingPeriod', () => {
    const result = subscribeSchema.safeParse({ planId: 'abc', billingPeriod: 'weekly' })
    expect(result.success).toBe(false)
  })
})

describe('cancelSchema', () => {
  it('accepts valid payload', () => {
    const result = cancelSchema.safeParse({ subscriptionId: 'sub_123' })
    expect(result.success).toBe(true)
  })
  it('rejects empty subscriptionId', () => {
    const result = cancelSchema.safeParse({ subscriptionId: '' })
    expect(result.success).toBe(false)
  })
})

describe('adminToggleActiveSchema', () => {
  it('accepts boolean is_active', () => {
    const result = adminToggleActiveSchema.safeParse({ is_active: false })
    expect(result.success).toBe(true)
  })
})

describe('adminTogglePublicSchema', () => {
  it('accepts boolean is_public', () => {
    const result = adminTogglePublicSchema.safeParse({ is_public: true })
    expect(result.success).toBe(true)
  })
})
