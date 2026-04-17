import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createServiceRoleClient } from '@/lib/supabase/service'

function isAdminEmail(email: string): boolean {
  const allowed = (process.env.ADMIN_EMAILS ?? '').split(',').map(e => e.trim()).filter(Boolean)
  return allowed.includes(email)
}

export async function GET(req: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !isAdminEmail(user.email ?? '')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const path = req.nextUrl.searchParams.get('path')
  if (!path) return NextResponse.json({ error: 'Missing path' }, { status: 400 })

  const service = createServiceRoleClient()
  const { data, error } = await service.storage
    .from('verification-docs')
    .createSignedUrl(path, 60) // 60 second signed URL

  if (error || !data?.signedUrl) {
    return NextResponse.json({ error: 'Could not generate URL' }, { status: 500 })
  }

  return NextResponse.redirect(data.signedUrl)
}
