import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { sendWelcomeEmail } from '@/lib/email'

export async function POST(_req: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Fetch installer and check if welcome already sent
  const { data: installer } = await supabase
    .from('installers')
    .select('id, nombre, nombre_comercial, welcome_email_sent_at')
    .eq('user_id', user.id)
    .single()

  if (!installer) {
    return NextResponse.json({ error: 'Installer not found' }, { status: 404 })
  }

  if (installer.welcome_email_sent_at) {
    return NextResponse.json({ skipped: true })
  }

  const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://tecnoinstalador.net'
  const installerName = installer.nombre_comercial ?? installer.nombre

  await sendWelcomeEmail({
    installerName,
    installerEmail: user.email,
    dashboardUrl: `${APP_URL}/dashboard`,
  })

  await supabase
    .from('installers')
    .update({ welcome_email_sent_at: new Date().toISOString() })
    .eq('id', installer.id)

  return NextResponse.json({ sent: true })
}
