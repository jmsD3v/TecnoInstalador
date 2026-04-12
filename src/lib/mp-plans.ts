export type PlanPrices = {
  PRO: { monthly: number; annual: number }
  PREMIUM: { monthly: number; annual: number }
}

export function fetchPlanPrices(): PlanPrices | null {
  const proMonthly     = Number(process.env.MP_PRICE_PRO_MONTHLY)
  const proAnnual      = Number(process.env.MP_PRICE_PRO_ANNUAL)
  const premiumMonthly = Number(process.env.MP_PRICE_PREMIUM_MONTHLY)
  const premiumAnnual  = Number(process.env.MP_PRICE_PREMIUM_ANNUAL)

  if (!proMonthly || !proAnnual || !premiumMonthly || !premiumAnnual) {
    console.warn('[mp-plans] Faltan variables de entorno MP_PRICE_*')
    return null
  }

  return {
    PRO:     { monthly: proMonthly,     annual: proAnnual     },
    PREMIUM: { monthly: premiumMonthly, annual: premiumAnnual },
  }
}
