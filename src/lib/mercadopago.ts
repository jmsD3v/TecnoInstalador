import MercadoPago from 'mercadopago'

// Singleton MP client
export function getMPClient() {
  return new MercadoPago({
    accessToken: process.env.MP_ACCESS_TOKEN!,
  })
}

export type PlanKey = 'PRO_MONTHLY' | 'PRO_ANNUAL' | 'PREMIUM_MONTHLY' | 'PREMIUM_ANNUAL'

export const MP_PLAN_IDS: Record<PlanKey, string> = {
  PRO_MONTHLY:     process.env.MP_PLAN_PRO_MONTHLY ?? '',
  PRO_ANNUAL:      process.env.MP_PLAN_PRO_ANNUAL ?? '',
  PREMIUM_MONTHLY: process.env.MP_PLAN_PREMIUM_MONTHLY ?? '',
  PREMIUM_ANNUAL:  process.env.MP_PLAN_PREMIUM_ANNUAL ?? '',
}

export function getPlanKey(plan: 'PRO' | 'PREMIUM', period: 'monthly' | 'annual'): PlanKey {
  return `${plan}_${period.toUpperCase()}` as PlanKey
}
