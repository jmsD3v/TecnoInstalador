import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { slugify } from '@/lib/utils'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (!code) {
    return NextResponse.redirect(`${origin}/auth/login?error=missing_code`)
  }

  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase.auth.exchangeCodeForSession(code)

  if (error || !data.user) {
    return NextResponse.redirect(`${origin}/auth/login?error=auth_failed`)
  }

  // Si el usuario no tiene perfil de instalador todavía, lo creamos con datos básicos
  const { data: existing } = await supabase
    .from('installers')
    .select('id')
    .eq('user_id', data.user.id)
    .single()

  if (!existing) {
    // Extraemos nombre del perfil de Google si está disponible
    const fullName = data.user.user_metadata?.full_name ?? ''
    const [nombre = 'Usuario', apellido = ''] = fullName.split(' ')
    const baseSlug = slugify(`${nombre} ${apellido}`) || 'usuario'
    const url_slug = `${baseSlug}-${Math.floor(Math.random() * 9000 + 1000)}`

    await supabase.from('installers').insert({
      user_id: data.user.id,
      nombre,
      apellido,
      ciudad: '',
      provincia: '',
      pais: 'Argentina',
      whatsapp: '',
      url_slug,
      plan: 'FREE',
      is_active: true,
      color_palette: 'azul',
      dominio_personalizado_activo: false,
      total_reviews: 0,
      avg_rating: 0,
    })

    // Redirigir al perfil para completar datos
    return NextResponse.redirect(`${origin}/dashboard/profile?onboarding=1`)
  }

  return NextResponse.redirect(`${origin}${next}`)
}
