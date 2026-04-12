import { NextResponse } from 'next/server'
import { fetchPlanPrices } from '@/lib/mp-plans'

export type { PlanPrices } from '@/lib/mp-plans'

export function GET() {
  const prices = fetchPlanPrices()
  if (!prices) {
    return NextResponse.json({ error: 'Precios no configurados' }, { status: 503 })
  }
  return NextResponse.json(prices)
}
