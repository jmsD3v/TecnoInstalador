import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin()
  if ('error' in auth) return auth.error

  const { id } = await params

  const supabaseService = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: installer } = await supabaseService
    .from('installers')
    .select('user_id')
    .eq('id', id)
    .single()

  if (!installer) return NextResponse.json({ error: 'Installer not found' }, { status: 404 })

  const { data: { user } } = await supabaseService.auth.admin.getUserById(installer.user_id)
  if (!user?.email) return NextResponse.json({ error: 'User email not found' }, { status: 404 })

  const { error } = await supabaseService.auth.admin.generateLink({
    type: 'recovery',
    email: user.email,
    options: { redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/update-password` },
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true, message: 'Recovery email sent' })
}
