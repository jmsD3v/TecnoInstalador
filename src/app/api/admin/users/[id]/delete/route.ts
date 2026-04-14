import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { createClient } from '@supabase/supabase-js'

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin()
  if ('error' in auth) return auth.error

  const { id } = await params

  // id is the installer ID — get the auth user_id first
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: installer, error: fetchError } = await admin
    .from('installers')
    .select('user_id')
    .eq('id', id)
    .single()

  if (fetchError || !installer) {
    return NextResponse.json({ error: 'Instalador no encontrado' }, { status: 404 })
  }

  const { error } = await admin.auth.admin.deleteUser(installer.user_id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
