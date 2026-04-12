import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getMPClient } from '@/lib/mercadopago'
import { PreApproval } from 'mercadopago'

export async function POST(_req: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: installer } = await supabase
    .from('installers')
    .select('id, subscription_id')
    .eq('user_id', user.id)
    .single()

  if (!installer?.subscription_id) {
    return NextResponse.json({ error: 'No active subscription' }, { status: 404 })
  }

  const { data: sub } = await supabase
    .from('subscriptions')
    .select('mp_preapproval_id')
    .eq('id', installer.subscription_id)
    .single()

  if (!sub) return NextResponse.json({ error: 'Subscription not found' }, { status: 404 })

  try {
    const client = getMPClient()
    const preapprovalClient = new PreApproval(client)

    await preapprovalClient.update({
      id: sub.mp_preapproval_id,
      body: { status: 'cancelled' },
    })

    await supabase
      .from('subscriptions')
      .update({ status: 'cancelled', updated_at: new Date().toISOString() })
      .eq('id', installer.subscription_id)

    await supabase
      .from('installers')
      .update({ plan: 'FREE', subscription_id: null })
      .eq('id', installer.id)

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[cancel] MP error:', err)
    return NextResponse.json(
      { error: 'Error al cancelar. Intentá de nuevo.' },
      { status: 503 },
    )
  }
}
