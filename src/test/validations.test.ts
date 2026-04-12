import { describe, it, expect } from 'vitest'
import { subscribeSchema, cancelSchema, adminToggleActiveSchema, adminTogglePublicSchema, reviewInviteSchema, resetPasswordSchema, updatePasswordSchema } from '@/lib/validations'

describe('subscribeSchema', () => {
  it('accepts valid payload', () => {
    const result = subscribeSchema.safeParse({ plan: 'PRO', period: 'monthly' })
    expect(result.success).toBe(true)
  })
  it('rejects invalid plan', () => {
    const result = subscribeSchema.safeParse({ plan: 'FREE', period: 'monthly' })
    expect(result.success).toBe(false)
  })
  it('rejects invalid period', () => {
    const result = subscribeSchema.safeParse({ plan: 'PRO', period: 'weekly' })
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

describe('reviewInviteSchema', () => {
  it('accepts email without phone', () => {
    const result = reviewInviteSchema.safeParse({ client_email: 'a@b.com' })
    expect(result.success).toBe(true)
  })
  it('accepts phone without email', () => {
    const result = reviewInviteSchema.safeParse({ client_phone: '1234567890' })
    expect(result.success).toBe(true)
  })
  it('rejects when both email and phone are missing', () => {
    const result = reviewInviteSchema.safeParse({ client_name: 'Juan' })
    expect(result.success).toBe(false)
  })
})

describe('resetPasswordSchema', () => {
  it('accepts valid email', () => {
    const result = resetPasswordSchema.safeParse({ email: 'user@example.com' })
    expect(result.success).toBe(true)
  })
  it('rejects invalid email', () => {
    const result = resetPasswordSchema.safeParse({ email: 'notanemail' })
    expect(result.success).toBe(false)
  })
})

describe('updatePasswordSchema', () => {
  it('accepts password >= 8 chars', () => {
    const result = updatePasswordSchema.safeParse({ password: 'securepassword' })
    expect(result.success).toBe(true)
  })
  it('rejects password < 8 chars', () => {
    const result = updatePasswordSchema.safeParse({ password: 'short' })
    expect(result.success).toBe(false)
  })
})
