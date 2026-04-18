import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createServiceRoleClient } from '@/lib/supabase/service'
import { cookies } from 'next/headers'

export async function GET() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  )
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: installer } = await supabase
    .from('installers').select('id').eq('user_id', user.id).single()
  if (!installer) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const since = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()
  const sb = createServiceRoleClient()

  const { data: events } = await sb
    .from('profile_events')
    .select('event_type, created_at')
    .eq('installer_id', installer.id)
    .gte('created_at', since)
    .order('created_at', { ascending: true })

  const header = 'Fecha,Tipo de evento'
  const rows = (events ?? []).map(e => [
    new Date(e.created_at).toLocaleDateString('es-AR'),
    e.event_type,
  ].join(','))

  const csv = [header, ...rows].join('\n')
  const filename = `estadisticas-${new Date().toISOString().slice(0, 10)}.csv`

  return new NextResponse('\uFEFF' + csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
