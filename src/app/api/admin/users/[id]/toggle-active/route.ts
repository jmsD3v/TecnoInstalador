import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { adminToggleActiveSchema } from '@/lib/validations'
import { createClient } from '@supabase/supabase-js'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin()
  if ('error' in auth) return auth.error

  const { id } = await params
  const body = await req.json()
  const parsed = adminToggleActiveSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid request' }, { status: 400 })

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Fetch the auth user_id before updating
  const { data: installerData, error: fetchError } = await supabase
    .from('installers')
    .select('user_id')
    .eq('id', id)
    .single()

  if (fetchError || !installerData) {
    return NextResponse.json({ error: 'Installer not found' }, { status: 404 })
  }

  const { error } = await supabase
    .from('installers')
    .update({ is_active: parsed.data.is_active, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Sync the ban state in Supabase Auth so the user can't log in when deactivated
  const banDuration = parsed.data.is_active ? 'none' : '876000h'
  const { error: authError } = await supabase.auth.admin.updateUserById(
    installerData.user_id,
    { ban_duration: banDuration }
  )
  if (authError) {
    console.error('[toggle-active] auth ban sync failed:', authError.message)
    // Non-fatal: table is updated, profile is hidden — log but don't fail the request
  }

  return NextResponse.json({ ok: true })
}
