import Link from 'next/link'
import { Lock } from 'lucide-react'

const PLAN_ORDER = { FREE: 0, PRO: 1, PREMIUM: 2 } as const

interface PlanGateProps {
  requiredPlan: 'PRO' | 'PREMIUM'
  currentPlan: string
  featureName: string
  children: React.ReactNode
}

export default function PlanGate({ requiredPlan, currentPlan, featureName, children }: PlanGateProps) {
  const hasAccess =
    (PLAN_ORDER[currentPlan as keyof typeof PLAN_ORDER] ?? 0) >=
    PLAN_ORDER[requiredPlan]

  if (hasAccess) return <>{children}</>

  return (
    <div className="relative rounded-xl overflow-hidden">
      <div className="pointer-events-none select-none opacity-40 blur-[2px]">{children}</div>
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/70 backdrop-blur-sm rounded-xl p-4">
        <Lock className="size-6 text-primary mb-2" />
        <p className="text-sm font-semibold text-center">{featureName}</p>
        <p className="text-xs text-muted-foreground mb-3 text-center">
          Disponible en plan {requiredPlan}
        </p>
        <Link
          href="/dashboard/plan"
          className="rounded-lg bg-primary text-primary-foreground px-4 py-1.5 text-xs font-semibold hover:opacity-90 transition-opacity"
        >
          Mejorar plan
        </Link>
      </div>
    </div>
  )
}
