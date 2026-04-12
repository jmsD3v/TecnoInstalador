import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { adminTogglePublicSchema } from '@/lib/validations'
import { createClient } from '@supabase/supabase-js'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin()
  if ('error' in auth) return auth.error

  const { id } = await params
  const body = await req.json()
  const parsed = adminTogglePublicSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid request' }, { status: 400 })

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const update: Record<string, unknown> = { is_public: parsed.data.is_public }
  if (!parsed.data.is_public) update.deleted_at = new Date().toISOString()

  const { error } = await supabase.from('reviews').update(update).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
