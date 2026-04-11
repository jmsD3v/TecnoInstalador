import { PlanType, PLAN_LIMITS, Installer } from '@/types'

// ─────────────────────────────────────────────
// Plan limit helpers
// ─────────────────────────────────────────────

/**
 * Retorna los límites del plan actual del instalador,
 * considerando si tiene trial activo.
 */
export function getEffectivePlan(installer: Pick<Installer, 'plan' | 'trial_ends_at'>): PlanType {
  if (installer.trial_ends_at) {
    const trialEnd = new Date(installer.trial_ends_at)
    if (trialEnd > new Date()) {
      // Trial activo → acceso PRO
      return 'PRO'
    }
  }
  return installer.plan
}

export function getPlanLimits(plan: PlanType) {
  return PLAN_LIMITS[plan]
}

export function canAddTrade(
  installer: Pick<Installer, 'plan' | 'trial_ends_at'>,
  currentTradeCount: number
): { allowed: boolean; reason?: string } {
  const plan = getEffectivePlan(installer)
  const limits = getPlanLimits(plan)

  if (currentTradeCount >= limits.max_trades) {
    return {
      allowed: false,
      reason: `Tu plan ${plan} permite máximo ${limits.max_trades} oficio(s). Actualizá tu plan para agregar más.`,
    }
  }
  return { allowed: true }
}

export function canAddService(
  installer: Pick<Installer, 'plan' | 'trial_ends_at'>,
  currentServiceCount: number
): { allowed: boolean; reason?: string } {
  const plan = getEffectivePlan(installer)
  const limits = getPlanLimits(plan)

  if (currentServiceCount >= limits.max_services) {
    return {
      allowed: false,
      reason: `Tu plan ${plan} permite máximo ${limits.max_services} servicio(s). Actualizá tu plan para agregar más.`,
    }
  }
  return { allowed: true }
}

export function canAddGalleryItem(
  installer: Pick<Installer, 'plan' | 'trial_ends_at'>,
  currentGalleryCount: number
): { allowed: boolean; reason?: string } {
  const plan = getEffectivePlan(installer)
  const limits = getPlanLimits(plan)

  if (currentGalleryCount >= limits.max_gallery) {
    return {
      allowed: false,
      reason: `Tu plan ${plan} permite máximo ${limits.max_gallery} foto(s) en la galería. Actualizá tu plan.`,
    }
  }
  return { allowed: true }
}

export function canUseQuotes(
  installer: Pick<Installer, 'plan' | 'trial_ends_at'>
): { allowed: boolean; reason?: string } {
  const plan = getEffectivePlan(installer)
  const limits = getPlanLimits(plan)

  if (!limits.quotes) {
    return {
      allowed: false,
      reason: 'Los presupuestos están disponibles desde el plan PRO. ¡Actualizá ahora!',
    }
  }
  return { allowed: true }
}

export function canUseCustomDomain(
  installer: Pick<Installer, 'plan' | 'trial_ends_at'>
): boolean {
  const plan = getEffectivePlan(installer)
  return getPlanLimits(plan).custom_domain
}

export function canUseStats(
  installer: Pick<Installer, 'plan' | 'trial_ends_at'>
): boolean {
  const plan = getEffectivePlan(installer)
  return getPlanLimits(plan).stats
}

export function isFeatured(
  installer: Pick<Installer, 'plan' | 'trial_ends_at'>
): boolean {
  const plan = getEffectivePlan(installer)
  return getPlanLimits(plan).featured
}

// ─────────────────────────────────────────────
// Marketplace ordering
// ─────────────────────────────────────────────

const PLAN_WEIGHT: Record<PlanType, number> = {
  PREMIUM: 3,
  PRO: 2,
  FREE: 1,
}

export function sortInstallersByPlan(installers: Installer[]): Installer[] {
  return [...installers].sort((a, b) => {
    const planA = PLAN_WEIGHT[a.plan] ?? 0
    const planB = PLAN_WEIGHT[b.plan] ?? 0
    if (planB !== planA) return planB - planA
    if (b.avg_rating !== a.avg_rating) return b.avg_rating - a.avg_rating
    return b.total_reviews - a.total_reviews
  })
}

// ─────────────────────────────────────────────
// Plan labels helpers
// ─────────────────────────────────────────────

export const PLAN_LABELS: Record<PlanType, string> = {
  FREE: 'Gratuito',
  PRO: 'Pro',
  PREMIUM: 'Premium',
}

export const PLAN_PRICES: Record<PlanType, string> = {
  FREE: '$0',
  PRO: '$4.999/mes',     // Ajustar a precio real
  PREMIUM: '$9.999/mes', // Ajustar a precio real
}

// Re-export for convenience
export { PLAN_LIMITS } from '@/types'
