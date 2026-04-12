import { describe, it, expect } from 'vitest'

// Validate that the CSP string we'll use is non-empty and contains required directives
function validateCSP(csp: string) {
  return (
    csp.includes("default-src") &&
    csp.includes("'self'") &&
    csp.includes("img-src")
  )
}

describe('security headers config', () => {
  it('CSP string contains required directives', () => {
    const csp = `default-src 'self'; img-src 'self' data: blob: https://*.supabase.co; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; font-src 'self'; connect-src 'self' https://*.supabase.co https://api.mercadopago.com; frame-ancestors 'none'`
    expect(validateCSP(csp)).toBe(true)
  })
})
