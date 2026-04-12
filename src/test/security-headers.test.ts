import { describe, it, expect } from 'vitest'
import { CSP } from '../../next.config'

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
})
