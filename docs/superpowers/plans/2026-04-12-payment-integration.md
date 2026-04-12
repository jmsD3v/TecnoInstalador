# Payment Integration (MercadoPago Subscriptions) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Integrate MercadoPago Subscriptions (Preapproval) so installers can subscribe to PRO or PREMIUM plans with automatic monthly or annual billing, with immediate downgrade to FREE on failure or cancellation.

**Architecture:** Four pre-created plans in MercadoPago dashboard (PRO monthly/annual, PREMIUM monthly/annual). On subscribe, create a preapproval via MP API → redirect user to MP checkout → MP sends webhooks → webhook handler updates `installers.plan` in Supabase. Cancellation via API call to MP + immediate DB update.

**Tech Stack:** Next.js 16 App Router, Supabase, `mercadopago` npm SDK v2, TypeScript

---

## File Map

| File | Action | Purpose |
|------|--------|---------|
| `supabase/migrations/003_subscriptions.sql` | Create | DB table + new columns on installers |
| `src/lib/mercadopago.ts` | Create | MP client singleton + helper functions |
| `src/types/index.ts` | Modify | Add Subscription type + installer fields |
| `src/lib/plans.ts` | Modify | Update PLAN_PRICES |
| `src/app/api/payments/subscribe/route.ts` | Create | Create preapproval → return init_point |
| `src/app/api/payments/webhook/route.ts` | Create | Handle MP events → update DB |
| `src/app/api/payments/cancel/route.ts` | Create | Cancel subscription → downgrade to FREE |
| `src/app/dashboard/plan/page.tsx` | Rewrite | Full UI: toggle, cards, status, cancel |
| `src/app/dashboard/page.tsx` | Modify | Add FREE upsell banner |

---

## Task 1: Install MercadoPago SDK

**Files:**
- Modify: `package.json` (via pnpm)

- [ ] **Step 1: Install the package**

```bash
cd E:/Dev/tecnoinstalador && pnpm add mercadopago
```

Expected output: `+ mercadopago X.X.X` added to dependencies.

- [ ] **Step 2: Verify types are available**

```bash
pnpm tsc --noEmit 2>&1 | head -5
```

Expected: no errors about missing `mercadopago` types (the SDK ships its own types).

---

## Task 2: Database migration

**Files:**
- Create: `supabase/migrations/003_subscriptions.sql`

- [ ] **Step 1: Write the migration file**

Create `supabase/migrations/003_subscriptions.sql`:

```sql
-- ─────────────────────────────────────────────
-- Subscriptions table
-- ─────────────────────────────────────────────

CREATE TABLE subscriptions (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  installer_id        uuid NOT NULL REFERENCES installers(id) ON DELETE CASCADE,
  mp_preapproval_id   text NOT NULL UNIQUE,
  mp_plan_id          text NOT NULL,
  plan                text NOT NULL CHECK (plan IN ('PRO', 'PREMIUM')),
  billing_period      text NOT NULL CHECK (billing_period IN ('monthly', 'annual')),
  status              text NOT NULL DEFAULT 'pending'
                        CHECK (status IN ('pending', 'authorized', 'paused', 'cancelled')),
  next_payment_date   timestamptz,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

-- Add columns to installers
ALTER TABLE installers
  ADD COLUMN IF NOT EXISTS subscription_id uuid REFERENCES subscriptions(id),
  ADD COLUMN IF NOT EXISTS plan_expires_at timestamptz;

-- RLS for subscriptions
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "subscriptions_owner_read" ON subscriptions
  FOR SELECT USING (
    installer_id IN (SELECT id FROM installers WHERE user_id = auth.uid())
  );

CREATE POLICY "subscriptions_service_role_all" ON subscriptions
  FOR ALL USING (auth.role() = 'service_role');

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_subscriptions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_subscriptions_updated_at();
```

- [ ] **Step 2: Apply migration via Supabase MCP**

Use the `mcp__claude_ai_Supabase__apply_migration` tool with the SQL above, or run:

```bash
# If using Supabase CLI:
supabase db push
```

Verify: check that `subscriptions` table exists and `installers` has `subscription_id` and `plan_expires_at` columns.

---

## Task 3: Environment variables

**Files:**
- Modify: `.env.local`

- [ ] **Step 1: Add MP env vars to `.env.local`**

Add these lines (fill values after creating MP account and plans):

```env
# MercadoPago
MP_ACCESS_TOKEN=TEST-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
MP_PUBLIC_KEY=TEST-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
MP_PLAN_PRO_MONTHLY=2c93808497d5xxxxxxxxxxxx
MP_PLAN_PRO_ANNUAL=2c93808497d5xxxxxxxxxxxx
MP_PLAN_PREMIUM_MONTHLY=2c93808497d5xxxxxxxxxxxx
MP_PLAN_PREMIUM_ANNUAL=2c93808497d5xxxxxxxxxxxx
MP_WEBHOOK_SECRET=your_webhook_secret_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> Note: Plan IDs are obtained after creating the 4 plans in MercadoPago dashboard (Suscripciones → Planes). For development, use TEST credentials. `MP_WEBHOOK_SECRET` is found in MP dashboard under Webhooks configuration.

- [ ] **Step 2: Add `.env.local` entries to `.env.example` (if it exists) or document in README**

If there's no `.env.example`, skip this step.

---

## Task 4: Types

**Files:**
- Modify: `src/types/index.ts`

- [ ] **Step 1: Add `Subscription` type and update `Installer`**

Add after the `Stats` interface (around line 141):

```typescript
export type SubscriptionStatus = 'pending' | 'authorized' | 'paused' | 'cancelled'
export type BillingPeriod = 'monthly' | 'annual'

export interface Subscription {
  id: string
  installer_id: string
  mp_preapproval_id: string
  mp_plan_id: string
  plan: 'PRO' | 'PREMIUM'
  billing_period: BillingPeriod
  status: SubscriptionStatus
  next_payment_date?: string
  created_at: string
  updated_at: string
}
```

Update the `Installer` interface — add after `updated_at`:

```typescript
  subscription_id?: string
  plan_expires_at?: string
  // existing relations below...
```

---

## Task 5: MercadoPago client helper

**Files:**
- Create: `src/lib/mercadopago.ts`

- [ ] **Step 1: Create the MP client module**

```typescript
import MercadoPago from 'mercadopago'

// Singleton MP client
export function getMPClient() {
  return new MercadoPago({
    accessToken: process.env.MP_ACCESS_TOKEN!,
  })
}

export type PlanKey = 'PRO_MONTHLY' | 'PRO_ANNUAL' | 'PREMIUM_MONTHLY' | 'PREMIUM_ANNUAL'

export const MP_PLAN_IDS: Record<PlanKey, string> = {
  PRO_MONTHLY:     process.env.MP_PLAN_PRO_MONTHLY ?? '',
  PRO_ANNUAL:      process.env.MP_PLAN_PRO_ANNUAL ?? '',
  PREMIUM_MONTHLY: process.env.MP_PLAN_PREMIUM_MONTHLY ?? '',
  PREMIUM_ANNUAL:  process.env.MP_PLAN_PREMIUM_ANNUAL ?? '',
}

export function getPlanKey(plan: 'PRO' | 'PREMIUM', period: 'monthly' | 'annual'): PlanKey {
  return `${plan}_${period.toUpperCase()}` as PlanKey
}

/**
 * Validate MercadoPago webhook signature.
 * Header format: "ts=1704908010,v1=abc123..."
 * Signed string: "id:{data.id};request-id:{x-request-id};ts:{ts};"
 */
export async function validateMPSignature(
  xSignature: string,
  xRequestId: string,
  dataId: string,
): Promise<boolean> {
  const secret = process.env.MP_WEBHOOK_SECRET
  if (!secret) return false

  const parts = Object.fromEntries(
    xSignature.split(',').map(part => part.split('=') as [string, string])
  )
  const ts = parts['ts']
  const v1 = parts['v1']
  if (!ts || !v1) return false

  const signedString = `id:${dataId};request-id:${xRequestId};ts:${ts};`

  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(signedString))
  const computed = Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')

  return computed === v1
}
```

---

## Task 6: Subscribe API route

**Files:**
- Create: `src/app/api/payments/subscribe/route.ts`

- [ ] **Step 1: Create the route**

```typescript
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

  // Get installer
  const { data: installer } = await supabase
    .from('installers')
    .select('id, plan, subscription_id')
    .eq('user_id', user.id)
    .single()

  if (!installer) return NextResponse.json({ error: 'Installer not found' }, { status: 404 })

  // Check for existing active subscription
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

    // Save subscription record
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

    // Link subscription to installer
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
```

---

## Task 7: Webhook API route

**Files:**
- Create: `src/app/api/payments/webhook/route.ts`

- [ ] **Step 1: Create the webhook handler**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/service'
import { validateMPSignature } from '@/lib/mercadopago'
import { getMPClient } from '@/lib/mercadopago'
import { PreApproval, PreApprovalPlan } from 'mercadopago'

export async function POST(req: NextRequest) {
  const xSignature = req.headers.get('x-signature') ?? ''
  const xRequestId = req.headers.get('x-request-id') ?? ''

  const body = await req.json()
  const dataId: string = body?.data?.id ?? ''

  // Validate signature
  const valid = await validateMPSignature(xSignature, xRequestId, dataId)
  if (!valid) {
    console.warn('[webhook] Invalid MP signature')
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const type: string = body?.type ?? ''
  const supabase = createServiceRoleClient()

  try {
    if (type === 'subscription_preapproval') {
      await handlePreapprovalEvent(supabase, dataId)
    } else if (type === 'subscription_authorized_payment') {
      await handlePaymentEvent(supabase, dataId)
    }
  } catch (err) {
    console.error('[webhook] Handler error:', err)
    // Return 200 anyway so MP doesn't retry infinitely on our app errors
  }

  return NextResponse.json({ received: true })
}

async function handlePreapprovalEvent(supabase: any, preapprovalId: string) {
  const client = getMPClient()
  const preapprovalClient = new PreApproval(client)
  const data = await preapprovalClient.get({ id: preapprovalId })

  const status = data.status as string
  const mpPlanId = data.preapproval_plan_id as string

  // Find subscription
  const { data: sub } = await supabase
    .from('subscriptions')
    .select('id, installer_id, plan')
    .eq('mp_preapproval_id', preapprovalId)
    .single()

  if (!sub) {
    console.warn('[webhook] Subscription not found for preapproval:', preapprovalId)
    return
  }

  if (status === 'authorized') {
    // Activate plan
    await supabase
      .from('subscriptions')
      .update({ status: 'authorized', updated_at: new Date().toISOString() })
      .eq('id', sub.id)

    await supabase
      .from('installers')
      .update({ plan: sub.plan })
      .eq('id', sub.installer_id)

  } else if (status === 'cancelled' || status === 'paused') {
    // Downgrade to FREE
    await supabase
      .from('subscriptions')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', sub.id)

    await supabase
      .from('installers')
      .update({ plan: 'FREE', subscription_id: null })
      .eq('id', sub.installer_id)
  }
}

async function handlePaymentEvent(supabase: any, paymentId: string) {
  // Fetch payment details from MP
  const client = getMPClient()
  const res = await fetch(
    `https://api.mercadopago.com/authorized_payments/${paymentId}`,
    { headers: { Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}` } },
  )
  const payment = await res.json()

  const preapprovalId: string = payment?.preapproval_id ?? ''
  const status: string = payment?.status ?? ''

  if (!preapprovalId) return

  const { data: sub } = await supabase
    .from('subscriptions')
    .select('id, installer_id')
    .eq('mp_preapproval_id', preapprovalId)
    .single()

  if (!sub) return

  if (status === 'processed') {
    // Update next payment date if available
    const nextDate: string | null = payment?.next_payment_date ?? null
    await supabase
      .from('subscriptions')
      .update({
        next_payment_date: nextDate,
        updated_at: new Date().toISOString(),
      })
      .eq('id', sub.id)

  } else if (status === 'recycled' || status === 'cancelled') {
    // Payment failed — downgrade to FREE
    await supabase
      .from('subscriptions')
      .update({ status: 'cancelled', updated_at: new Date().toISOString() })
      .eq('id', sub.id)

    await supabase
      .from('installers')
      .update({ plan: 'FREE', subscription_id: null })
      .eq('id', sub.installer_id)
  }
}
```

- [ ] **Step 2: Create Supabase service role client**

This webhook must bypass RLS since it's called server-side with no user session. Create `src/lib/supabase/service.ts`:

```typescript
import { createClient } from '@supabase/supabase-js'

export function createServiceRoleClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}
```

Add to `.env.local`:
```env
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

(Found in Supabase dashboard → Project Settings → API → service_role key)

---

## Task 8: Cancel API route

**Files:**
- Create: `src/app/api/payments/cancel/route.ts`

- [ ] **Step 1: Create the cancel route**

```typescript
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

    // Update DB immediately
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
```

---

## Task 9: Update plans.ts prices

**Files:**
- Modify: `src/lib/plans.ts`

- [ ] **Step 1: Update PLAN_PRICES and add annual prices**

Replace the `PLAN_PRICES` export:

```typescript
export const PLAN_PRICES: Record<PlanType, { monthly: string; annual: string; annualMonthly: string }> = {
  FREE:    { monthly: '$0',          annual: '$0',           annualMonthly: '$0' },
  PRO:     { monthly: '$7.999/mes',  annual: '$79.990/año',  annualMonthly: '$6.665/mes' },
  PREMIUM: { monthly: '$15.999/mes', annual: '$159.990/año', annualMonthly: '$13.332/mes' },
}

export const PLAN_SAVINGS: Record<'PRO' | 'PREMIUM', string> = {
  PRO:     '$16.000',
  PREMIUM: '$32.000',
}
```

---

## Task 10: Rewrite `/dashboard/plan` page

**Files:**
- Rewrite: `src/app/dashboard/plan/page.tsx`

- [ ] **Step 1: Rewrite the plan page**

```typescript
'use client'

import { useState, useEffect, useTransition } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/components/ui/toast"
import { Installer, PlanType, PLAN_LIMITS, Subscription } from "@/types"
import { getEffectivePlan, PLAN_LABELS, PLAN_PRICES, PLAN_SAVINGS } from "@/lib/plans"
import { CheckCircle2, Crown, Zap, X, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

const PLAN_FEATURES: Record<PlanType, string[]> = {
  FREE: [
    '1 oficio',
    '3 servicios',
    '5 fotos en galería',
    'Perfil público',
    'Reseñas verificadas',
    'Botón WhatsApp',
    'Aparece en búsqueda',
  ],
  PRO: [
    '3 oficios',
    '10 servicios',
    '30 fotos en galería',
    'Perfil público',
    'Reseñas verificadas',
    'Botón WhatsApp',
    'Presupuestos en la app',
    'Mejor posición en búsqueda',
  ],
  PREMIUM: [
    'Oficios ilimitados',
    'Servicios ilimitados',
    '200 fotos en galería',
    'Perfil público',
    'Reseñas verificadas',
    'Botón WhatsApp',
    'Presupuestos en la app',
    'Posición destacada en búsqueda',
    'Badge Premium',
    'Estadísticas de visitas',
    'Dominio personalizado',
  ],
}

export default function PlanPage() {
  const supabase = createClient()
  const toast = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const [installer, setInstaller] = useState<Installer | null>(null)
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly')
  const [subscribingTo, setSubscribingTo] = useState<PlanType | null>(null)
  const [cancelling, setCancelling] = useState(false)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)

  useEffect(() => {
    const status = searchParams.get('status')
    if (status === 'success') {
      toast({ title: '¡Suscripción iniciada!', description: 'Tu plan se activará en minutos.', variant: 'success' })
      router.replace('/dashboard/plan')
    } else if (status === 'failure') {
      toast({ title: 'Pago no completado', description: 'Podés intentarlo de nuevo cuando quieras.', variant: 'error' })
      router.replace('/dashboard/plan')
    }
  }, [searchParams])

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from('installers')
        .select('*, subscriptions(*)')
        .eq('user_id', user.id)
        .single()
      setInstaller(data)
      setSubscription((data as any)?.subscriptions ?? null)
      setLoading(false)
    }
    load()
  }, [])

  const handleSubscribe = async (plan: 'PRO' | 'PREMIUM') => {
    setSubscribingTo(plan)
    try {
      const res = await fetch('/api/payments/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, period: billingPeriod }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast({ title: data.error ?? 'Error', variant: 'error' })
        return
      }
      // Redirect to MercadoPago checkout
      window.location.href = data.init_point
    } catch {
      toast({ title: 'Error de conexión. Intentá de nuevo.', variant: 'error' })
    } finally {
      setSubscribingTo(null)
    }
  }

  const handleCancel = async () => {
    setCancelling(true)
    try {
      const res = await fetch('/api/payments/cancel', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) {
        toast({ title: data.error ?? 'Error al cancelar', variant: 'error' })
        return
      }
      toast({ title: 'Suscripción cancelada', description: 'Tu plan bajó a Gratuito.', variant: 'success' })
      setInstaller(prev => prev ? { ...prev, plan: 'FREE', subscription_id: undefined } : prev)
      setSubscription(null)
      setShowCancelConfirm(false)
    } catch {
      toast({ title: 'Error de conexión. Intentá de nuevo.', variant: 'error' })
    } finally {
      setCancelling(false)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  )
  if (!installer) return null

  const effectivePlan = getEffectivePlan(installer)
  const isTrialActive = installer.trial_ends_at && new Date(installer.trial_ends_at) > new Date()
  const hasActiveSub = subscription && ['authorized', 'pending'].includes(subscription.status)

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Mi plan</h1>
        <p className="text-muted-foreground text-sm mt-1">Gestioná tu suscripción</p>
      </div>

      {/* Current plan status */}
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="p-4 flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="text-sm text-muted-foreground">Plan actual</p>
            <p className="text-2xl font-extrabold">{PLAN_LABELS[installer.plan]}</p>
            {isTrialActive && (
              <p className="text-sm text-amber-600 font-medium">
                Trial activo — vence el {new Date(installer.trial_ends_at!).toLocaleDateString('es-AR')}
              </p>
            )}
            {hasActiveSub && subscription?.next_payment_date && (
              <p className="text-xs text-muted-foreground mt-1">
                Próximo cobro: {new Date(subscription.next_payment_date).toLocaleDateString('es-AR')}
              </p>
            )}
          </div>
          <div className="flex flex-col items-end gap-2">
            {installer.plan === 'PREMIUM'
              ? <Badge variant="premium"><Crown className="w-3 h-3 mr-1" />Premium</Badge>
              : installer.plan === 'PRO'
              ? <Badge variant="pro"><Zap className="w-3 h-3 mr-1" />Pro</Badge>
              : <Badge variant="free">Gratis</Badge>
            }
            {hasActiveSub && !showCancelConfirm && (
              <button
                className="text-xs text-destructive hover:underline"
                onClick={() => setShowCancelConfirm(true)}
              >
                Cancelar suscripción
              </button>
            )}
            {showCancelConfirm && (
              <div className="flex items-center gap-2 text-xs">
                <span className="text-muted-foreground">¿Confirmar cancelación?</span>
                <Button size="sm" variant="outline" onClick={() => setShowCancelConfirm(false)}>No</Button>
                <Button
                  size="sm"
                  className="bg-destructive text-white hover:bg-destructive/90"
                  loading={cancelling}
                  onClick={handleCancel}
                >
                  Cancelar
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* FREE upsell banner */}
      {installer.plan === 'FREE' && (
        <div className="flex items-start gap-3 p-4 rounded-xl border border-primary/30 bg-primary/5">
          <Zap className="w-5 h-5 text-primary mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold">Desbloqueá presupuestos, más fotos y mejor posición en búsqueda</p>
            <p className="text-xs text-muted-foreground mt-0.5">Con PRO aparecés más arriba y mandás presupuestos desde la app.</p>
          </div>
        </div>
      )}

      {/* Billing toggle */}
      <div className="flex items-center justify-center gap-1 bg-muted p-1 rounded-xl w-fit mx-auto">
        <button
          className={cn("px-4 py-1.5 rounded-lg text-sm font-medium transition-all", billingPeriod === 'monthly' ? 'bg-card shadow text-foreground' : 'text-muted-foreground')}
          onClick={() => setBillingPeriod('monthly')}
        >
          Mensual
        </button>
        <button
          className={cn("px-4 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2", billingPeriod === 'annual' ? 'bg-card shadow text-foreground' : 'text-muted-foreground')}
          onClick={() => setBillingPeriod('annual')}
        >
          Anual
          <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">2 meses gratis</span>
        </button>
      </div>

      {/* Plan cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {(['FREE', 'PRO', 'PREMIUM'] as PlanType[]).map(plan => {
          const isCurrent = installer.plan === plan
          const prices = PLAN_PRICES[plan]
          const isUpgrade = plan !== 'FREE' && installer.plan === 'FREE'
          const isLoading = subscribingTo === plan

          return (
            <Card
              key={plan}
              className={cn(
                isCurrent && 'ring-2 ring-primary',
                plan === 'PRO' && installer.plan === 'FREE' && 'ring-2 ring-primary/40'
              )}
            >
              <CardContent className="pt-6 pb-4">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-bold text-lg">{PLAN_LABELS[plan]}</h3>
                  {plan === 'PRO' && <Zap className="w-4 h-4 text-blue-500" />}
                  {plan === 'PREMIUM' && <Crown className="w-4 h-4 text-yellow-500" />}
                </div>

                <div className="mb-4">
                  <p className="text-2xl font-extrabold">
                    {billingPeriod === 'monthly' ? prices.monthly : prices.annual}
                  </p>
                  {billingPeriod === 'annual' && plan !== 'FREE' && (
                    <p className="text-xs text-green-600 font-medium mt-0.5">
                      Ahorrás {PLAN_SAVINGS[plan as 'PRO' | 'PREMIUM']}
                    </p>
                  )}
                </div>

                <ul className="space-y-1.5 mb-5">
                  {PLAN_FEATURES[plan].map(f => (
                    <li key={f} className="flex items-start gap-2 text-xs">
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-500 mt-0.5 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>

                {plan === 'FREE' && (
                  <div className="text-xs text-center text-muted-foreground p-2 bg-muted rounded-lg">
                    {isCurrent ? 'Plan actual' : 'Disponible sin costo'}
                  </div>
                )}

                {plan !== 'FREE' && isCurrent && (
                  <Button variant="outline" className="w-full" disabled>Plan actual</Button>
                )}

                {plan !== 'FREE' && !isCurrent && !hasActiveSub && (
                  <Button
                    className="w-full"
                    loading={isLoading}
                    onClick={() => handleSubscribe(plan as 'PRO' | 'PREMIUM')}
                  >
                    Suscribirme
                  </Button>
                )}

                {plan !== 'FREE' && !isCurrent && hasActiveSub && (
                  <Button variant="outline" className="w-full" disabled>
                    Cambio no disponible
                  </Button>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      <p className="text-xs text-center text-muted-foreground">
        Pagos procesados de forma segura por MercadoPago · Podés cancelar en cualquier momento
      </p>
    </div>
  )
}
```

---

## Task 11: Add FREE upsell banner to dashboard overview

**Files:**
- Modify: `src/app/dashboard/page.tsx`

- [ ] **Step 1: Add upsell banner after `profileIncomplete` warning**

After the closing `</div>` of the `profileIncomplete` block (around line 72), add:

```tsx
      {/* FREE plan upsell banner */}
      {installer.plan === 'FREE' && !profileIncomplete && (
        <div className="flex items-center gap-3 p-4 rounded-xl border border-primary/20 bg-primary/5">
          <Zap className="w-5 h-5 text-primary shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold">Subí a PRO y conseguí más clientes</p>
            <p className="text-xs text-muted-foreground">Presupuestos, más fotos, mejor posición en búsqueda.</p>
          </div>
          <Button size="sm" asChild className="shrink-0">
            <Link href="/dashboard/plan">Ver planes</Link>
          </Button>
        </div>
      )}
```

Also add `Zap` to the existing import from `lucide-react` at the top of that file.

---

## Task 12: Manual MercadoPago setup guide

This task documents what the developer must do manually in the MP dashboard before testing.

- [ ] **Step 1: Create MP test account**

1. Go to https://www.mercadopago.com.ar
2. Create an account or log in
3. Go to https://developers.mercadopago.com
4. Create a new application
5. Copy **Test Access Token** and **Test Public Key** to `.env.local`

- [ ] **Step 2: Create 4 subscription plans in MP dashboard**

In MP Developers portal → Suscripciones → Planes:

| Reason | Amount | Frequency | Period |
|--------|--------|-----------|--------|
| TecnoInstalador PRO Mensual | 7999 | 1 | months |
| TecnoInstalador PRO Anual | 79990 | 1 | years |
| TecnoInstalador PREMIUM Mensual | 15999 | 1 | months |
| TecnoInstalador PREMIUM Anual | 159990 | 1 | years |

Copy each plan ID to `.env.local` as `MP_PLAN_PRO_MONTHLY`, etc.

- [ ] **Step 3: Configure webhook URL**

In MP Developers portal → Notificaciones → Webhooks:
- URL: `https://your-domain.com/api/payments/webhook`
- For local dev use ngrok: `ngrok http 3000` → use the HTTPS URL
- Events to subscribe: `subscription_preapproval`, `subscription_authorized_payment`
- Copy the **Webhook Secret** to `.env.local` as `MP_WEBHOOK_SECRET`

- [ ] **Step 4: Add `SUPABASE_SERVICE_ROLE_KEY` to `.env.local`**

Found in: Supabase Dashboard → Project Settings → API → service_role secret key.

---

## Task 13: End-to-end smoke test

- [ ] **Step 1: Start dev server**

```bash
pnpm dev
```

- [ ] **Step 2: Test subscribe flow**

1. Log in as a FREE installer
2. Go to `/dashboard/plan`
3. Click "Suscribirme" on PRO Mensual
4. Verify redirect to MercadoPago checkout page
5. Complete payment with MP test card: `5031 7557 3453 0604`, CVV: `123`, expiry: `11/25`
6. Verify redirect back to `/dashboard/plan?status=success`
7. Verify toast "¡Suscripción iniciada!"

- [ ] **Step 3: Test webhook (with ngrok)**

```bash
ngrok http 3000
```

After MP payment, check the ngrok inspector at http://localhost:4040 to see incoming webhook calls. Verify the webhook handler logs no errors and the installer's plan updates to PRO in Supabase.

- [ ] **Step 4: Test cancel flow**

1. As active PRO subscriber, click "Cancelar suscripción"
2. Confirm in the dialog
3. Verify plan reverts to FREE in the UI and in Supabase

- [ ] **Step 5: Test upsell banner**

As FREE user on `/dashboard`, verify the "Subí a PRO" banner is visible and links to `/dashboard/plan`.

---

## Self-Review Notes

- Spec requirement "signature validation" → Task 5 (`validateMPSignature`)
- Spec requirement "duplicate webhook idempotency" → handled by unique constraint on `mp_preapproval_id`; webhook fetches fresh data from MP so duplicate calls are safe
- Spec requirement "FREE upsell persistent" → Task 11 (dashboard banner) + plan page card copy
- Spec requirement "toggle monthly/annual" → Task 10
- Spec requirement "immediate downgrade on cancel" → Task 8 + Task 7 webhook handler
- `PLAN_SAVINGS` referenced in Task 10 is defined in Task 9
- `Subscription` type referenced in Task 10 is defined in Task 4
- `createServiceRoleClient` referenced in Task 7 is defined in Task 7 Step 2
