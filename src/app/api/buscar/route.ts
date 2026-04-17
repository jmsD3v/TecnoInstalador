import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createServiceRoleClient } from '@/lib/supabase/service'
import { sortInstallersByPlan } from '@/lib/plans'

const PAGE_SIZE = 12

const querySchema = z.object({
  ciudad: z.string().optional(),
  provincia: z.string().optional(),
  trade: z.string().optional(),
  offset: z.coerce.number().int().min(0).default(0),
})

export async function GET(req: NextRequest) {
  const parsed = querySchema.safeParse(Object.fromEntries(req.nextUrl.searchParams))
  if (!parsed.success) return NextResponse.json({ error: 'Invalid params' }, { status: 400 })

  const { ciudad, provincia, trade, offset } = parsed.data
  const filteringByTrade = trade && trade !== 'todos'

  const supabase = createServiceRoleClient()
  const tradeSelect = filteringByTrade
    ? `*, installer_trades!inner(trade:trades(*))`
    : `*, installer_trades(trade:trades(*))`

  let query = supabase
    .from('installers')
    .select(tradeSelect)
    .eq('is_active', true)

  if (ciudad) query = query.ilike('ciudad', `%${ciudad}%`)
  if (provincia && provincia !== 'todas') query = query.ilike('provincia', `%${provincia}%`)
  if (filteringByTrade) query = query.eq('installer_trades.trade.slug', trade)

  const { data } = await query

  if (!data) return NextResponse.json({ installers: [], hasMore: false })

  const sorted = sortInstallersByPlan(data as any)
  const page = sorted.slice(offset, offset + PAGE_SIZE)

  return NextResponse.json({
    installers: page,
    hasMore: offset + PAGE_SIZE < sorted.length,
    total: sorted.length,
  })
}
