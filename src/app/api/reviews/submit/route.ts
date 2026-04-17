import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/service'
import { sendNewReviewEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
  const { token, rating, comentario, clientName } = await req.json()

  if (!token || !rating || rating < 1 || rating > 5) {
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })
  }

  const supabase = createServiceRoleClient()

  // Verificar token
  const { data: invite, error: inviteError } = await supabase
    .from('review_invites')
    .select('*, installer:installers(*)')
    .eq('token_unico', token)
    .single()

  if (inviteError || !invite) {
    return NextResponse.json({ error: 'Link inválido' }, { status: 404 })
  }

  if (invite.used_at) {
    return NextResponse.json({ error: 'Link ya utilizado' }, { status: 409 })
  }

  // Insertar reseña
  const { error: reviewError } = await supabase.from('reviews').insert({
    installer_id: invite.installer_id,
    rating,
    comentario: comentario || null,
    client_name: clientName || null,
    is_public: true,
    source: 'link_unico',
  })

  if (reviewError) {
    return NextResponse.json({ error: reviewError.message }, { status: 500 })
  }

  // Marcar invite como usado
  await supabase
    .from('review_invites')
    .update({ used_at: new Date().toISOString() })
    .eq('token_unico', token)

  // Enviar email al instalador (fire-and-forget)
  const installer = invite.installer as any
  if (installer) {
    const { data: authUser } = await supabase.auth.admin.getUserById(installer.user_id)
    const installerEmail = authUser?.user?.email

    if (installerEmail) {
      const installerName = installer.nombre_comercial ?? installer.nombre ?? 'Instalador'
      const profileUrl = `${process.env.NEXT_PUBLIC_APP_URL}/i/${installer.url_slug}`

      sendNewReviewEmail({
        installerName,
        installerEmail,
        reviewerName: clientName || null,
        rating,
        comment: comentario || null,
        profileUrl,
      }).catch(err => console.error('[email] sendNewReviewEmail failed:', err))
    }
  }

  // In-app notification (fire-and-forget)
  const ratingStars = '⭐'.repeat(rating)
  supabase.from('notifications').insert({
    installer_id: invite.installer_id,
    type: 'review',
    title: `Nueva reseña ${ratingStars}`,
    body: clientName
      ? `${clientName} te dejó ${rating} estrella${rating === 1 ? '' : 's'}${comentario ? `: "${comentario.slice(0, 80)}"` : '.'}`
      : `Recibiste una reseña de ${rating} estrella${rating === 1 ? '' : 's'}.`,
    link: '/dashboard/reviews',
  }).then(() => {})

  return NextResponse.json({ ok: true })
}
