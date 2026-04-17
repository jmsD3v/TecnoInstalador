/**
 * Plausible Analytics — privacy-first, no cookies, GDPR compliant.
 * Set NEXT_PUBLIC_PLAUSIBLE_DOMAIN env var to activate (e.g. "tecnoinstalador.com").
 * nonce required for CSP compliance (nonce-based script-src).
 */
export function PlausibleAnalytics({ nonce }: { nonce?: string }) {
  const domain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN
  if (!domain) return null

  return (
    <script
      defer
      nonce={nonce}
      data-domain={domain}
      src="https://plausible.io/js/script.js"
    />
  )
}
