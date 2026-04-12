import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getMPClient, MP_PLAN_IDS, getPlanKey } from '@/lib/mercadopago'
import { PreApproval } from 'mercadopago'

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const plan: 'PRO' | 'PREMIUM' = body.plan
  const period: 'monthly' | 'annual' = body.period

  if (!['PRO', 'PREMIUM'].includes(plan) || !['monthly', 'annual'].includes(period)) {
    return NextResponse.json({ error: 'Invalid plan or period' }, { status: 400 })
  }

  const { data: installer } = await supabase
    .from('installers')
    .select('id, plan, subscription_id')
    .eq('user_id', user.id)
    .single()

  if (!installer) return NextResponse.json({ error: 'Installer not found' }, { status: 404 })

  if (installer.subscription_id) {
    const { data: existingSub } = await supabase
      .from('subscriptions')
      .select('status')
      .eq('id', installer.subscription_id)
      .single()

    if (existingSub && ['pending', 'authorized'].includes(existingSub.status)) {
      return NextResponse.json({ error: 'Ya tenés una suscripción activa' }, { status: 409 })
    }
  }

  const planKey = getPlanKey(plan, period)
  const planId = MP_PLAN_IDS[planKey]

  if (!planId) {
    return NextResponse.json({ error: 'Plan configuration missing' }, { status: 503 })
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  try {
    const client = getMPClient()
    const preapprovalClient = new PreApproval(client)

    const result = await preapprovalClient.create({
      body: {
        preapproval_plan_id: planId,
        payer_email: user.email!,
        back_url: `${appUrl}/dashboard/plan?status=success`,
      },
    })

    const mpId = result.id!
    const initPoint = result.init_point!

    const { data: sub, error: subError } = await supabase
      .from('subscriptions')
      .insert({
        installer_id: installer.id,
        mp_preapproval_id: mpId,
        mp_plan_id: planId,
        plan,
        billing_period: period,
        status: 'pending',
      })
      .select('id')
      .single()

    if (subError) throw subError

    await supabase
      .from('installers')
      .update({ subscription_id: sub.id })
      .eq('id', installer.id)

    return NextResponse.json({ init_point: initPoint })
  } catch (err) {
    console.error('[subscribe] MP error:', err)
    return NextResponse.json(
      { error: 'No pudimos conectar con MercadoPago. Intentá de nuevo.' },
      { status: 503 },
    )
  }
}
