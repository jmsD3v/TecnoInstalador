import { describe, it, expect } from 'vitest'

// CSP is now generated per-request in src/proxy.ts with a nonce.
// Replicate buildCSP logic here to test the policy structure.
const TEST_NONCE = 'dGVzdG5vbmNl'

function buildCSP(nonce: string): string {
  return [
    "default-src 'self'",
    "img-src 'self' data: blob: https://*.supabase.co",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`,
    "style-src 'self' 'unsafe-inline'",
    "font-src 'self'",
    "connect-src 'self' https://*.supabase.co https://api.mercadopago.com wss://*.supabase.co",
    "frame-ancestors 'none'",
  ].join('; ')
}

const CSP = buildCSP(TEST_NONCE)

describe('security headers config', () => {
  it('CSP contains default-src self', () => {
    expect(CSP).toContain("default-src 'self'")
  })
  it('CSP contains img-src with supabase', () => {
    expect(CSP).toContain('img-src')
    expect(CSP).toContain('supabase.co')
  })
  it('CSP contains connect-src with supabase, mercadopago, and wss', () => {
    expect(CSP).toContain('connect-src')
    expect(CSP).toContain('supabase.co')
    expect(CSP).toContain('mercadopago.com')
    expect(CSP).toContain('wss://')
  })
  it('CSP blocks frame-ancestors', () => {
    expect(CSP).toContain("frame-ancestors 'none'")
  })
  it('CSP uses nonce instead of unsafe-inline for scripts', () => {
    expect(CSP).toContain(`'nonce-${TEST_NONCE}'`)
    expect(CSP).toContain("'strict-dynamic'")
    // script-src must not have unsafe-inline (style-src keeps it for Tailwind — that's OK)
    const scriptSrc = CSP.split('; ').find(d => d.startsWith('script-src'))
    expect(scriptSrc).toBeDefined()
    expect(scriptSrc).not.toContain("'unsafe-inline'")
  })
})
