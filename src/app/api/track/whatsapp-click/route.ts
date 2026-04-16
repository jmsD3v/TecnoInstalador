import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { LRUCache } from 'lru-cache'
import { createServiceRoleClient } from '@/lib/supabase/service'

// Rate limit: 5 clicks per IP per 60-second window (best-effort on serverless)
const rateLimit = new LRUCache<string, number>({ max: 500, ttl: 60_000 })

const bodySchema = z.object({ installer_id: z.string().uuid() })

export async function POST(req: NextRequest) {
  // IP-based rate limiting
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  const count = (rateLimit.get(ip) ?? 0) + 1
  rateLimit.set(ip, count)
  if (count > 5) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  // Validate input
  const parsed = bodySchema.safeParse(await req.json())
  if (!parsed.success) {
    return NextResponse.json({ error: 'installer_id inválido' }, { status: 400 })
  }

  const { installer_id } = parsed.data
  const supabase = createServiceRoleClient()

  // Verify installer is active before incrementing — prevents stat inflation on deactivated accounts
  const { data: installer } = await supabase
    .from('installers')
    .select('id')
    .eq('id', installer_id)
    .eq('is_active', true)
    .single()

  if (!installer) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const { error } = await supabase.rpc('increment_stat', {
    p_installer_id: installer_id,
    p_field: 'whatsapp_clicks',
  })

  if (error) {
    console.error('[track] whatsapp_clicks increment failed:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
