# Payment Integration Design — TecnoInstalador
Date: 2026-04-12

## Overview
Integrate MercadoPago Subscriptions (Preapproval API) to allow installers to upgrade from FREE to PRO or PREMIUM with automatic monthly or annual billing. Plan downgrades to FREE happen immediately on payment failure or cancellation.

---

## Pricing

| Plan    | Monthly      | Annual          | Savings          |
|---------|-------------|-----------------|------------------|
| FREE    | $0          | —               | —                |
| PRO     | $7.999/mes  | $79.990/año     | ~$16.000 (2 meses gratis) |
| PREMIUM | $15.999/mes | $159.990/año    | ~$32.000 (2 meses gratis) |

Annual = 10 months price, 12 months access.

---

## Architecture

### MercadoPago Setup (manual, one-time)
Four subscription plans created in the MP dashboard:
- `PRO_MONTHLY` — $7.999/mes, auto-recurring
- `PRO_ANNUAL` — $79.990/año, auto-recurring
- `PREMIUM_MONTHLY` — $15.999/mes, auto-recurring
- `PREMIUM_ANNUAL` — $159.990/año, auto-recurring

Plan IDs stored in `.env.local`:
```
MP_ACCESS_TOKEN=
MP_PUBLIC_KEY=
MP_PLAN_PRO_MONTHLY=
MP_PLAN_PRO_ANNUAL=
MP_PLAN_PREMIUM_MONTHLY=
MP_PLAN_PREMIUM_ANNUAL=
MP_WEBHOOK_SECRET=
```

### Database Changes

**New table: `subscriptions`**
```sql
CREATE TABLE subscriptions (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  installer_id        uuid NOT NULL REFERENCES installers(id) ON DELETE CASCADE,
  mp_preapproval_id   text NOT NULL UNIQUE,
  mp_plan_id          text NOT NULL,
  plan                text NOT NULL CHECK (plan IN ('PRO', 'PREMIUM')),
  billing_period      text NOT NULL CHECK (billing_period IN ('monthly', 'annual')),
  status              text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'authorized', 'paused', 'cancelled')),
  next_payment_date   timestamptz,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE installers ADD COLUMN subscription_id uuid REFERENCES subscriptions(id);
ALTER TABLE installers ADD COLUMN plan_expires_at timestamptz;
```

RLS: `subscriptions` readable only by the owner installer.

---

## API Routes

### `POST /api/payments/subscribe`
**Auth required.** Called when user clicks "Suscribirme".

Request body:
```json
{ "plan": "PRO" | "PREMIUM", "period": "monthly" | "annual" }
```

Flow:
1. Get authenticated user → get installer
2. If installer already has an active subscription, return error
3. Look up MP plan ID from env based on plan+period
4. Call MP `POST /preapproval` with:
   - `preapproval_plan_id`: plan ID
   - `payer_email`: user's email
   - `back_url`: `https://app.com/dashboard/plan?status=success`
5. Save subscription record with `status=pending`
6. Return `{ init_point: url }` → frontend redirects

### `POST /api/payments/webhook`
**No auth** (called by MercadoPago). Validates signature via `x-signature` header.

Handled events:
- `subscription_preapproval` with status `authorized` → set `installers.plan = PRO|PREMIUM`, update subscription status
- `subscription_preapproval` with status `cancelled` or `paused` → set `installers.plan = FREE`, clear `subscription_id`
- `subscription_authorized_payment` with status `processed` → update `next_payment_date`
- `subscription_authorized_payment` with status `recycled` or `cancelled` → set `installers.plan = FREE`

Signature validation: compare `x-signature` header using HMAC-SHA256 with `MP_WEBHOOK_SECRET`.

### `POST /api/payments/cancel`
**Auth required.** Called when user clicks "Cancelar suscripción".

Flow:
1. Get installer's `mp_preapproval_id`
2. Call MP `PATCH /preapproval/{id}` with `status: cancelled`
3. Update DB: `installers.plan = FREE`, `subscription.status = cancelled`
4. Return success

---

## Frontend Changes

### `/dashboard/plan` page

**Toggle mensual/anual**: pill selector at the top. When annual is selected, show "Ahorrás $X" badge on PRO and PREMIUM cards.

**Plan cards**:
- FREE card: no subscribe button. Shows "Plan actual" if current. Includes upsell banner: "Desbloqueá presupuestos, más fotos y mejor posición en búsqueda →" linking to PRO.
- PRO/PREMIUM cards: "Suscribirme" button → calls `/api/payments/subscribe` → redirects to MP checkout.
- Current plan card: shows "Plan actual" + active subscription info (next billing date, "Cancelar suscripción" button with confirmation dialog).

**Return from MP**:
- `?status=success`: show success toast + reload installer data
- `?status=failure`: show error toast

### Persistent upsell for FREE users

1. **`/dashboard` (overview page)**: banner below the header if plan is FREE:
   > "Estás en el plan Gratuito — subí a PRO para presupuestos, más fotos y mejor posición" + CTA button

2. **Feature gates** (existing `canAdd*` helpers): when limit is reached, the toast/error includes a "Subir a PRO →" button linking to `/dashboard/plan`.

---

## Error Handling

- MP API unreachable during subscribe: return 503, show "No pudimos conectar con MercadoPago. Intentá de nuevo."
- Webhook signature mismatch: return 400, log warning, do nothing
- Duplicate webhook event (MP may retry): idempotency via `mp_preapproval_id` unique constraint
- User already has active subscription: return 409, show "Ya tenés una suscripción activa"

---

## Migration File
`supabase/migrations/003_subscriptions.sql`

---

## Out of Scope
- Custom domain routing (separate feature)
- Invoice/receipt generation
- Admin plan override UI (handled directly in Supabase dashboard for now)
- Proration when switching plans mid-period
