import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function requireAdmin(): Promise<{ error: NextResponse } | { supabase: Awaited<ReturnType<typeof createServerSupabaseClient>> }> {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  const allowed = (process.env.ADMIN_EMAILS ?? '').split(',').map(e => e.trim()).filter(Boolean)

  if (!user || !allowed.includes(user.email ?? '')) {
    return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }
  }
  return { supabase }
}
