import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createServiceRoleClient } from '@/lib/supabase/service'
import { cookies } from 'next/headers'

async function getInstallerId(): Promise<string | null> {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  )
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data } = await supabase
    .from('installers').select('id').eq('user_id', user.id).single()
  return data?.id ?? null
}

export async function GET() {
  const installerId = await getInstallerId()
  if (!installerId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createServiceRoleClient()
  const { data } = await supabase
    .from('quote_requests')
    .select('*')
    .eq('installer_id', installerId)
    .order('created_at', { ascending: false })
    .limit(100)

  return NextResponse.json({ leads: data ?? [] })
}
