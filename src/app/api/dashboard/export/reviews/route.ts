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

  const sb = createServiceRoleClient()
  const { data: reviews } = await sb
    .from('reviews')
    .select('rating, comment, client_name, created_at, response_text')
    .eq('installer_id', installer.id)
    .order('created_at', { ascending: false })

  const esc = (s: string | null) => `"${(s ?? '').replace(/"/g, '""')}"`
  const header = 'Fecha,Calificación,Cliente,Comentario,Respuesta'
  const rows = (reviews ?? []).map(r => [
    new Date(r.created_at).toLocaleDateString('es-AR'),
    r.rating,
    esc(r.client_name),
    esc(r.comment),
    esc(r.response_text),
  ].join(','))

  const csv = [header, ...rows].join('\n')
  const filename = `resenas-${new Date().toISOString().slice(0, 10)}.csv`

  return new NextResponse('\uFEFF' + csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
