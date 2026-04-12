import { describe, it, expect } from 'vitest'

function isAdminEmail(email: string, adminEmails: string): boolean {
  return adminEmails.split(',').map(e => e.trim()).includes(email)
}

describe('isAdminEmail', () => {
  it('returns true for listed email', () => {
    expect(isAdminEmail('admin@example.com', 'admin@example.com,other@example.com')).toBe(true)
  })
  it('returns false for unlisted email', () => {
    expect(isAdminEmail('hacker@evil.com', 'admin@example.com')).toBe(false)
  })
  it('handles whitespace in env var', () => {
    expect(isAdminEmail('admin@example.com', ' admin@example.com ')).toBe(true)
  })
  it('returns false when env var is empty', () => {
    expect(isAdminEmail('admin@example.com', '')).toBe(false)
  })
})
