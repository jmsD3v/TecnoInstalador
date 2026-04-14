import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/service'

export async function POST(req: NextRequest) {
  const { installer_id } = await req.json()

  if (!installer_id) {
    return NextResponse.json({ error: 'installer_id requerido' }, { status: 400 })
  }

  const supabase = createServiceRoleClient()

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
