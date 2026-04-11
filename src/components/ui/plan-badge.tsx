import { PlanType } from "@/types"
import { Badge } from "./badge"
import { Crown, Zap } from "lucide-react"

interface PlanBadgeProps {
  plan: PlanType
  className?: string
}

export function PlanBadge({ plan, className }: PlanBadgeProps) {
  if (plan === 'PREMIUM') {
    return (
      <Badge variant="premium" className={className}>
        <Crown className="w-3 h-3 mr-1" />
        Premium
      </Badge>
    )
  }
  if (plan === 'PRO') {
    return (
      <Badge variant="pro" className={className}>
        <Zap className="w-3 h-3 mr-1" />
        Pro
      </Badge>
    )
  }
  return (
    <Badge variant="free" className={className}>
      Gratis
    </Badge>
  )
}
