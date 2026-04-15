# Sprint 6 — Conversión, Tracking y Emails — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implementar WhatsApp click tracking, email de nueva reseña vía Resend, y 4 hooks de conversión FREE→PRO en momentos clave del journey del instalador.

**Architecture:** WhatsApp tracking es fire-and-forget: onClick en `WhatsAppCTA` llama a `/api/track/whatsapp-click` sin bloquear la apertura del link. El email de reseña requiere mover el submit de la review page a una API route server-side para poder llamar a Resend. Los 4 upsells son componentes client-side ubicados estratégicamente.

**Tech Stack:** Next.js 16 app router, Resend SDK, TypeScript, Tailwind CSS v4, Supabase (service role para obtener email del instalador)

---

## File Map

| File | Action | Responsibility |
|------|--------|---------------|
| `src/lib/email.ts` | Create | Resend client singleton + `sendNewReviewEmail()` |
| `src/app/api/reviews/submit/route.ts` | Create | Server-side review insert + trigger email |
| `src/app/api/track/whatsapp-click/route.ts` | Create | Increment whatsapp_clicks stat via RPC |
| `src/components/installer/whatsapp-cta.tsx` | Modify | Add onClick fire-and-forget tracking |
| `src/app/review/[token]/page.tsx` | Modify | Call API route instead of direct Supabase insert |
| `src/components/dashboard/upgrade-modal.tsx` | Create | Reusable PRO upgrade modal con beneficios + CTA |
| `src/app/dashboard/onboarding/page.tsx` | Modify | Momento 1: banner PRO debajo de "Ir al dashboard" |
| `src/app/dashboard/services/page.tsx` | Modify | Momento 2: abrir UpgradeModal en lugar de toast al agregar 2do oficio |
| `src/components/dashboard/profile-progress.tsx` | Modify | Momento 3: card upsell cuando pct===100 && FREE |
| `src/app/dashboard/page.tsx` | Modify | Momento 4: upsell personalizado con totalViews |

---

## Task 1: Instalar Resend y crear email lib

**Files:**
- Create: `src/lib/email.ts`

- [ ] **Step 1: Instalar el paquete resend**

```bash
pnpm add resend
```

Expected: resend agregado a package.json y node_modules.

- [ ] **Step 2: Crear `src/lib/email.ts`**

```typescript
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

interface NewReviewEmailParams {
  installerName: string
  installerEmail: string
  reviewerName: string | null
  rating: number
  comment: string | null
  profileUrl: string
}

export async function sendNewReviewEmail(params: NewReviewEmailParams) {
  const { installerName, installerEmail, reviewerName, rating, comment, profileUrl } = params

  const stars = '★'.repeat(rating) + '☆'.repeat(5 - rating)
  const ratingLabels = ['', 'Muy malo', 'Malo', 'Regular', 'Bueno', 'Excelente']
  const ratingLabel = ratingLabels[rating] ?? ''

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Nueva reseña en TecnoInstalador</title>
</head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">

<!-- Wrapper -->
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f1f5f9;padding:40px 16px;">
  <tr>
    <td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#1d4ed8 0%,#1e40af 100%);border-radius:16px 16px 0 0;padding:32px 40px;text-align:center;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td align="center" style="padding-bottom:16px;">
                  <table cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="background:rgba(255,255,255,0.15);border-radius:12px;padding:10px 14px;">
                        <span style="font-size:22px;font-weight:900;color:#ffffff;letter-spacing:-0.5px;">Tecno<span style="color:#93c5fd;">Instalador</span></span>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="padding:8px 0 4px;">
                  <div style="display:inline-block;background:rgba(255,255,255,0.2);border-radius:100px;padding:6px 16px;">
                    <span style="font-size:13px;font-weight:600;color:#dbeafe;letter-spacing:0.5px;text-transform:uppercase;">Nueva reseña recibida</span>
                  </div>
                </td>
              </tr>
              <tr>
                <td style="padding-top:12px;">
                  <p style="margin:0;font-size:28px;font-weight:800;color:#ffffff;line-height:1.2;">¡Tenés una nueva reseña!</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Body card -->
        <tr>
          <td style="background:#ffffff;padding:32px 40px;">

            <!-- Greeting -->
            <p style="margin:0 0 24px;font-size:16px;color:#334155;line-height:1.6;">
              Hola <strong style="color:#1e293b;">${installerName}</strong>, alguien acaba de dejar una reseña sobre tu trabajo en TecnoInstalador.
            </p>

            <!-- Review card -->
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:2px solid #e2e8f0;border-radius:12px;overflow:hidden;margin-bottom:24px;">
              <tr>
                <td style="padding:24px;">

                  <!-- Stars -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:12px;">
                    <tr>
                      <td>
                        <span style="font-size:28px;letter-spacing:2px;color:#f59e0b;">${stars}</span>
                      </td>
                      <td align="right" style="vertical-align:middle;">
                        <span style="display:inline-block;background:#1d4ed8;color:#ffffff;font-size:12px;font-weight:700;padding:4px 10px;border-radius:100px;">${ratingLabel}</span>
                      </td>
                    </tr>
                  </table>

                  <!-- Divider -->
                  <div style="height:1px;background:#e2e8f0;margin-bottom:16px;"></div>

                  <!-- Reviewer name -->
                  <p style="margin:0 0 4px;font-size:12px;font-weight:600;color:#94a3b8;text-transform:uppercase;letter-spacing:0.5px;">De</p>
                  <p style="margin:0 0 16px;font-size:16px;font-weight:700;color:#1e293b;">${reviewerName ?? 'Cliente anónimo'}</p>

                  ${comment ? `
                  <!-- Comment -->
                  <p style="margin:0 0 4px;font-size:12px;font-weight:600;color:#94a3b8;text-transform:uppercase;letter-spacing:0.5px;">Comentario</p>
                  <p style="margin:0;font-size:15px;color:#334155;line-height:1.7;font-style:italic;">"${comment}"</p>
                  ` : ''}

                </td>
              </tr>
            </table>

            <!-- CTA -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
              <tr>
                <td align="center">
                  <a href="${profileUrl}" style="display:inline-block;background:linear-gradient(135deg,#1d4ed8 0%,#1e40af 100%);color:#ffffff;font-size:15px;font-weight:700;padding:14px 32px;border-radius:10px;text-decoration:none;letter-spacing:0.2px;">Ver mi perfil público →</a>
                </td>
              </tr>
            </table>

            <!-- Tip box -->
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:10px;margin-bottom:8px;">
              <tr>
                <td style="padding:16px 20px;">
                  <p style="margin:0;font-size:13px;color:#1e40af;line-height:1.6;">
                    <strong>💡 Tip:</strong> Compartí el link de tu perfil en tus redes para conseguir más reseñas y subir en las búsquedas.
                  </p>
                </td>
              </tr>
            </table>

          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f8fafc;border-top:1px solid #e2e8f0;border-radius:0 0 16px 16px;padding:24px 40px;text-align:center;">
            <p style="margin:0 0 8px;font-size:12px;color:#94a3b8;line-height:1.6;">
              Recibís este email porque tenés una cuenta de instalador en TecnoInstalador.<br>
              Si no querés recibir estas notificaciones, podés configurarlo desde tu perfil.
            </p>
            <p style="margin:0;font-size:11px;color:#cbd5e1;">
              © ${new Date().getFullYear()} TecnoInstalador — Desarrollado desde Las Breñas con 💜
            </p>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>

</body>
</html>`

  return resend.emails.send({
    from: process.env.RESEND_FROM!,
    to: installerEmail,
    subject: `⭐ ${reviewerName ?? 'Alguien'} te dejó ${rating} estrella${rating === 1 ? '' : 's'} en TecnoInstalador`,
    html,
  })
}
```

- [ ] **Step 3: Verificar que TypeScript no tiene errores**

```bash
pnpm tsc --noEmit 2>&1 | head -20
```

Expected: Sin errores relacionados con `src/lib/email.ts`.

- [ ] **Step 4: Commit**

```bash
git add src/lib/email.ts package.json pnpm-lock.yaml
git commit -m "feat: add Resend email lib with sendNewReviewEmail"
```

---

## Task 2: API route para submit de reseña con email

**Files:**
- Create: `src/app/api/reviews/submit/route.ts`
- Modify: `src/app/review/[token]/page.tsx` (líneas 60-91 — handleSubmit)

El review form actualmente hace el insert directo desde el cliente con Supabase anon key. Necesitamos moverlo a un API route para poder llamar a Resend y al service role client para obtener el email del instalador.

- [ ] **Step 1: Crear `src/app/api/reviews/submit/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleSupabaseClient } from '@/lib/supabase/service-role'
import { sendNewReviewEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
  const { token, rating, comentario, clientName } = await req.json()

  if (!token || !rating || rating < 1 || rating > 5) {
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })
  }

  const supabase = createServiceRoleSupabaseClient()

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

  // Enviar email al instalador (fire-and-forget, no bloqueamos la respuesta)
  const installer = invite.installer as any
  if (installer) {
    // Obtener email desde auth.users via service role
    const { data: authUser } = await supabase.auth.admin.getUserById(installer.user_id)
    const installerEmail = authUser?.user?.email

    if (installerEmail) {
      const installerName = installer.nombre_comercial ?? installer.nombre ?? 'Instalador'
      const profileUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/i/${installer.url_slug}`

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

  return NextResponse.json({ ok: true })
}
```

- [ ] **Step 2: Verificar que `createServiceRoleSupabaseClient` existe**

```bash
grep -r "createServiceRoleSupabaseClient" src/lib/supabase/ --include="*.ts" -l
```

Si no existe, buscar el nombre correcto:
```bash
grep -r "service.role\|serviceRole\|service_role" src/lib/supabase/ --include="*.ts" -l
```

Usar el nombre de función correcto en el import de la route.

- [ ] **Step 3: Verificar que NEXT_PUBLIC_SITE_URL existe en .env.local**

```bash
grep "NEXT_PUBLIC_SITE_URL" .env.local
```

Si no existe, agregar al `.env.local`:
```
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Y en producción configurar en Vercel como `https://tecnoinstalador.com` (o el dominio correcto).

- [ ] **Step 4: Actualizar `src/app/review/[token]/page.tsx` — reemplazar handleSubmit**

Reemplazar la función `handleSubmit` (líneas 60-93) con la versión que llama al API route:

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  if (rating === 0) {
    toast({ title: 'Por favor seleccioná una puntuación', variant: 'warning' })
    return
  }

  setSubmitting(true)

  const res = await fetch('/api/reviews/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, rating, comentario, clientName }),
  })

  if (!res.ok) {
    const json = await res.json().catch(() => ({}))
    toast({ title: 'Error al enviar', description: json.error ?? 'Intentá de nuevo', variant: 'error' })
    setSubmitting(false)
    return
  }

  setSubmitted(true)
  setSubmitting(false)
}
```

También eliminar el import de `createClient` si ya no se usa para el submit (todavía se usa para `useEffect` de carga — verificar y mantener si es necesario). Si `supabase` solo se usa en `useEffect`, dejar el import. Si ya no se usa en absoluto, removerlo.

- [ ] **Step 5: Verificar TypeScript**

```bash
pnpm tsc --noEmit 2>&1 | head -30
```

- [ ] **Step 6: Commit**

```bash
git add src/app/api/reviews/submit/route.ts src/app/review/[token]/page.tsx
git commit -m "feat: move review submit to API route and trigger email notification"
```

---

## Task 3: WhatsApp click tracking

**Files:**
- Create: `src/app/api/track/whatsapp-click/route.ts`
- Modify: `src/components/installer/whatsapp-cta.tsx`

- [ ] **Step 1: Crear `src/app/api/track/whatsapp-click/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleSupabaseClient } from '@/lib/supabase/service-role'

export async function POST(req: NextRequest) {
  const { installer_id } = await req.json()

  if (!installer_id) {
    return NextResponse.json({ error: 'installer_id requerido' }, { status: 400 })
  }

  const supabase = createServiceRoleSupabaseClient()

  const { error } = await supabase.rpc('increment_stat', {
    p_installer_id: installer_id,
    p_field: 'whatsapp_clicks',
  })

  if (error) {
    console.error('[track] whatsapp_clicks increment failed:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
```

- [ ] **Step 2: Verificar que el RPC `increment_stat` acepta `p_field: 'whatsapp_clicks'`**

```bash
grep -r "increment_stat\|whatsapp_clicks" supabase/ --include="*.sql" -l
```

Leer el archivo encontrado para confirmar que el campo `whatsapp_clicks` está soportado.

- [ ] **Step 3: Actualizar `src/components/installer/whatsapp-cta.tsx`**

Agregar la prop `installerId` y el `onClick` fire-and-forget. Reemplazar todo el archivo con:

```typescript
'use client'

import { MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { buildWhatsAppUrl, buildContactMessage } from "@/lib/utils"
import { cn } from "@/lib/utils"

interface WhatsAppCTAProps {
  whatsapp: string
  installerName: string
  installerId?: string
  service?: string
  fixed?: boolean
  className?: string
  label?: string
}

export function WhatsAppCTA({
  whatsapp,
  installerName,
  installerId,
  service,
  fixed = false,
  className,
  label = "Contactar por WhatsApp",
}: WhatsAppCTAProps) {
  const message = buildContactMessage(installerName, service)
  const url = buildWhatsAppUrl(whatsapp, message)

  const handleClick = () => {
    if (!installerId) return
    fetch('/api/track/whatsapp-click', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ installer_id: installerId }),
    }).catch(() => {}) // fire-and-forget, never block the link
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className={cn(
        fixed &&
          "fixed bottom-20 right-4 z-50 md:bottom-8 lg:bottom-8 shadow-lg shadow-green-500/30",
        className
      )}
    >
      <Button
        variant="whatsapp"
        size={fixed ? "lg" : "default"}
        className={cn(fixed && "rounded-full px-6 font-bold text-base shadow-lg")}
      >
        <MessageCircle className="w-5 h-5" />
        {label}
      </Button>
    </a>
  )
}
```

- [ ] **Step 4: Pasar `installerId` en todos los usos de WhatsAppCTA**

Buscar todos los lugares donde se usa `WhatsAppCTA`:

```bash
grep -r "WhatsAppCTA" src/ --include="*.tsx" -l
```

Para cada archivo encontrado, leerlo y agregar `installerId={installer.id}` (o el campo equivalente que tenga el `id` del instalador en ese contexto).

- [ ] **Step 5: Verificar TypeScript**

```bash
pnpm tsc --noEmit 2>&1 | head -30
```

- [ ] **Step 6: Commit**

```bash
git add src/app/api/track/whatsapp-click/route.ts src/components/installer/whatsapp-cta.tsx
git commit -m "feat: WhatsApp click tracking via fire-and-forget API route"
```

---

## Task 4: UpgradeModal — componente reutilizable

**Files:**
- Create: `src/components/dashboard/upgrade-modal.tsx`

- [ ] **Step 1: Crear `src/components/dashboard/upgrade-modal.tsx`**

```typescript
'use client'

import { X, Zap, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface UpgradeModalProps {
  open: boolean
  onClose: () => void
  trigger?: 'trade' | 'service' | 'gallery' | 'generic'
}

const BENEFITS = [
  'Hasta 3 oficios y servicios ilimitados',
  'Aparecés antes en los resultados de búsqueda',
  'Galería de fotos de tus trabajos (hasta 20)',
  'Presupuestos digitales para tus clientes',
  'Estadísticas de visitas y clicks de WhatsApp',
]

const TRIGGER_TEXTS: Record<NonNullable<UpgradeModalProps['trigger']>, string> = {
  trade: 'Con el plan Gratis solo podés tener 1 oficio. Subí a PRO y sumá hasta 3 oficios para llegar a más clientes.',
  service: 'Llegaste al límite de servicios del plan Gratis. Con PRO tenés servicios ilimitados.',
  gallery: 'El plan Gratis permite 3 fotos. Con PRO subís hasta 20 fotos de tus trabajos.',
  generic: 'Desbloqueá todas las funciones de TecnoInstalador y conseguí más clientes.',
}

export function UpgradeModal({ open, onClose, trigger = 'generic' }: UpgradeModalProps) {
  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative w-full max-w-md bg-background rounded-2xl shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header gradient */}
        <div className="bg-gradient-to-br from-primary to-blue-700 px-6 pt-6 pb-8 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <Zap className="w-4 h-4 text-yellow-300" />
            </div>
            <span className="text-sm font-semibold text-blue-100 uppercase tracking-wide">Plan PRO</span>
          </div>
          <h2 className="text-2xl font-extrabold leading-tight mb-2">Conseguí más clientes con PRO</h2>
          <p className="text-blue-100 text-sm leading-relaxed">{TRIGGER_TEXTS[trigger]}</p>
        </div>

        {/* Benefits */}
        <div className="px-6 py-5">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Lo que incluye PRO</p>
          <ul className="space-y-2.5 mb-6">
            {BENEFITS.map(b => (
              <li key={b} className="flex items-start gap-2.5">
                <div className="w-5 h-5 bg-primary/10 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3 h-3 text-primary" />
                </div>
                <span className="text-sm text-foreground">{b}</span>
              </li>
            ))}
          </ul>

          {/* Price hint */}
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 mb-5 text-center">
            <p className="text-xs text-muted-foreground mb-0.5">Desde</p>
            <p className="text-lg font-extrabold text-primary">$X.XXX / mes</p>
            <p className="text-xs text-muted-foreground">Cancelás cuando quieras</p>
          </div>

          {/* CTAs */}
          <div className="flex flex-col gap-2">
            <Button asChild className="w-full font-bold" size="lg">
              <Link href="/dashboard/plan" onClick={onClose}>Ver planes y precios →</Link>
            </Button>
            <button
              onClick={onClose}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors py-1"
            >
              Ahora no
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
```

> **Nota sobre el precio:** El `$X.XXX / mes` es un placeholder intencional. Si el precio está disponible en una env var o en `/api/plans/prices`, leerlo y reemplazarlo con el valor real. Si no, dejarlo así — el usuario va a `/dashboard/plan` donde ve los precios reales.

- [ ] **Step 2: Verificar que el precio PRO está disponible**

```bash
grep -r "NEXT_PUBLIC_PRICE\|PRO_PRICE\|plans/prices" src/ .env.local --include="*.ts" --include="*.tsx" 2>/dev/null | head -10
```

Si hay una env var o constante con el precio PRO, usarla en el modal. Si no, dejar el placeholder como está.

- [ ] **Step 3: Verificar TypeScript**

```bash
pnpm tsc --noEmit 2>&1 | head -20
```

- [ ] **Step 4: Commit**

```bash
git add src/components/dashboard/upgrade-modal.tsx
git commit -m "feat: UpgradeModal reutilizable para conversión FREE→PRO"
```

---

## Task 5: Momento 1 — Onboarding step 3 upsell

**Files:**
- Modify: `src/app/dashboard/onboarding/page.tsx`

En el step 3 (¡Listo!), debajo del botón "Ir al dashboard", agregar un banner PRO. El instalador siempre está en FREE durante el onboarding.

- [ ] **Step 1: Agregar import de Link y Zap en onboarding/page.tsx**

Al inicio del archivo, en los imports existentes, agregar:
```typescript
import Link from 'next/link'
import { Zap } from 'lucide-react'
```

- [ ] **Step 2: Reemplazar el bloque `step === 3` en onboarding/page.tsx**

Localizar el bloque (aproximadamente líneas 111-121):
```typescript
{step === 3 && (
  <div className="text-center space-y-4">
    <div className="text-6xl">🎉</div>
    <h2 className="text-3xl font-extrabold">¡Tu perfil está listo!</h2>
    <p className="text-muted-foreground">Ya aparecés en el buscador. Completá tu perfil para conseguir más clientes.</p>
    <button className="w-full font-bold bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3 rounded-lg text-base disabled:opacity-50"
      disabled={saving} onClick={handleFinish}>
      {saving ? 'Guardando...' : 'Ir a mi dashboard →'}
    </button>
  </div>
)}
```

Reemplazarlo con:

```typescript
{step === 3 && (
  <div className="text-center space-y-4">
    <div className="text-6xl">🎉</div>
    <h2 className="text-3xl font-extrabold">¡Tu perfil está listo!</h2>
    <p className="text-muted-foreground">Ya aparecés en el buscador. Completá tu perfil para conseguir más clientes.</p>
    <button className="w-full font-bold bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3 rounded-lg text-base disabled:opacity-50"
      disabled={saving} onClick={handleFinish}>
      {saving ? 'Guardando...' : 'Ir a mi dashboard →'}
    </button>

    {/* PRO upsell */}
    <Link
      href="/dashboard/plan"
      className="flex items-center gap-3 p-4 rounded-xl border-2 border-primary/30 bg-primary/5 hover:bg-primary/10 hover:border-primary/50 transition-all text-left group"
    >
      <div className="w-9 h-9 bg-primary/15 rounded-lg flex items-center justify-center shrink-0">
        <Zap className="w-5 h-5 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-foreground">Con PRO aparecés primero en búsquedas</p>
        <p className="text-xs text-muted-foreground">Hasta 3 oficios, galería de fotos, presupuestos digitales →</p>
      </div>
    </Link>
  </div>
)}
```

- [ ] **Step 3: Verificar TypeScript**

```bash
pnpm tsc --noEmit 2>&1 | head -20
```

- [ ] **Step 4: Commit**

```bash
git add src/app/dashboard/onboarding/page.tsx
git commit -m "feat: Momento 1 — banner PRO en step 3 del onboarding"
```

---

## Task 6: Momento 2 — Services page, UpgradeModal al agregar 2do oficio

**Files:**
- Modify: `src/app/dashboard/services/page.tsx`

Actualmente cuando el instalador FREE intenta agregar un 2do oficio, `canAddTrade` retorna `allowed: false` y se muestra un toast genérico. Reemplazar ese toast con el `UpgradeModal`.

- [ ] **Step 1: Importar UpgradeModal en services/page.tsx**

Agregar al bloque de imports al inicio:
```typescript
import { UpgradeModal } from '@/components/dashboard/upgrade-modal'
```

- [ ] **Step 2: Agregar estado showUpgradeModal**

Dentro del componente `ServicesPage`, junto a los otros `useState`, agregar:
```typescript
const [showUpgradeModal, setShowUpgradeModal] = useState(false)
```

- [ ] **Step 3: Reemplazar el toast en toggleTrade cuando no está permitido**

Localizar en `toggleTrade` (aproximadamente líneas 71-74):
```typescript
const check = canAddTrade(installer, selectedTradeIds.length)
if (!check.allowed) {
  toast({ title: 'Límite de oficios', description: check.reason, variant: 'warning' })
  return
}
```

Reemplazar con:
```typescript
const check = canAddTrade(installer, selectedTradeIds.length)
if (!check.allowed) {
  setShowUpgradeModal(true)
  return
}
```

- [ ] **Step 4: Agregar UpgradeModal en el JSX retornado**

Al final del JSX, justo antes del `</div>` de cierre del wrapper principal (última línea antes del `return` closing), agregar:
```typescript
<UpgradeModal
  open={showUpgradeModal}
  onClose={() => setShowUpgradeModal(false)}
  trigger="trade"
/>
```

El lugar correcto es como último elemento dentro del `<div className="max-w-2xl mx-auto space-y-6">`.

- [ ] **Step 5: Verificar TypeScript**

```bash
pnpm tsc --noEmit 2>&1 | head -20
```

- [ ] **Step 6: Commit**

```bash
git add src/app/dashboard/services/page.tsx
git commit -m "feat: Momento 2 — UpgradeModal al intentar agregar 2do oficio"
```

---

## Task 7: Momento 3 — ProfileProgress upsell al 100% FREE

**Files:**
- Modify: `src/components/dashboard/profile-progress.tsx`

Actualmente en línea 57: `if (pct === 100) return null`. Necesitamos pasar el plan para mostrar un upsell en lugar de `null` cuando el perfil está completo y el plan es FREE.

- [ ] **Step 1: Actualizar la interface InstallerSnippet y el componente**

Reemplazar todo el archivo `src/components/dashboard/profile-progress.tsx` con:

```typescript
import Link from 'next/link'
import { Circle, ChevronRight, Zap, CheckCircle2 } from 'lucide-react'

interface InstallerSnippet {
  foto_perfil_url?: string | null
  descripcion?: string | null
  ciudad?: string | null
  whatsapp?: string | null
  installer_trades?: { id: string }[]
  installer_services?: { id: string }[]
  plan?: string | null
}

interface Step {
  label: string
  done: boolean
  href: string
}

export function ProfileProgress({ installer }: { installer: InstallerSnippet }) {
  const steps: Step[] = [
    {
      label: 'Foto de perfil',
      done: !!installer.foto_perfil_url,
      href: '/dashboard/profile',
    },
    {
      label: 'Descripción',
      done: !!installer.descripcion && installer.descripcion.length > 20,
      href: '/dashboard/profile',
    },
    {
      label: 'Ciudad',
      done: !!installer.ciudad,
      href: '/dashboard/profile',
    },
    {
      label: 'WhatsApp de contacto',
      done: !!installer.whatsapp,
      href: '/dashboard/profile',
    },
    {
      label: 'Al menos 1 oficio',
      done: (installer.installer_trades?.length ?? 0) > 0,
      href: '/dashboard/services',
    },
    {
      label: 'Al menos 1 servicio',
      done: (installer.installer_services?.length ?? 0) > 0,
      href: '/dashboard/services',
    },
  ]

  const completedCount = steps.filter(s => s.done).length
  const pct = Math.round((completedCount / steps.length) * 100)
  const pending = steps.filter(s => !s.done)

  if (pct === 100) {
    if (installer.plan === 'FREE') {
      return (
        <div className="mx-3 mb-3 p-3 bg-primary/5 border border-primary/20 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
            <span className="text-xs font-semibold text-foreground">¡Perfil completo!</span>
          </div>
          <p className="text-xs text-muted-foreground mb-2.5 leading-relaxed">
            Subí a PRO para aparecer primero en búsquedas y conseguir más clientes.
          </p>
          <Link
            href="/dashboard/plan"
            className="flex items-center justify-center gap-1.5 w-full py-1.5 rounded-lg bg-primary text-white text-xs font-bold hover:bg-primary/90 transition-colors"
          >
            <Zap className="w-3 h-3" />
            Ver plan PRO
          </Link>
        </div>
      )
    }
    return null
  }

  return (
    <div className="mx-3 mb-3 p-3 bg-primary/5 border border-primary/20 rounded-xl">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-semibold text-foreground">Completá tu perfil</span>
        <span className="text-xs font-bold text-primary">{pct}%</span>
      </div>
      <div className="w-full h-1.5 bg-muted rounded-full mb-2.5">
        <div
          className="h-1.5 bg-primary rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <ul className="space-y-1">
        {pending.slice(0, 3).map(step => (
          <li key={step.label}>
            <Link
              href={step.href}
              className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors group"
            >
              <Circle className="w-3 h-3 shrink-0 text-muted-foreground/40" />
              <span className="flex-1">{step.label}</span>
              <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-60 transition-opacity" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
```

- [ ] **Step 2: Verificar que dashboard/layout.tsx pasa el campo `plan` al installer**

```bash
grep -n "plan\|installer" src/app/dashboard/layout.tsx | head -20
```

Si el `select` en layout.tsx ya incluye `plan` (que debería, dado que se usa `installer.plan` en otras partes), está listo. Si no, agregar `plan` al select.

- [ ] **Step 3: Verificar TypeScript**

```bash
pnpm tsc --noEmit 2>&1 | head -20
```

- [ ] **Step 4: Commit**

```bash
git add src/components/dashboard/profile-progress.tsx
git commit -m "feat: Momento 3 — upsell PRO cuando perfil 100% completo en plan FREE"
```

---

## Task 8: Momento 4 — Dashboard upsell personalizado con totalViews

**Files:**
- Modify: `src/app/dashboard/page.tsx` (líneas 75-86)

El banner genérico actual dice "Subí a PRO y conseguí más clientes". Reemplazarlo con datos reales de visitas.

- [ ] **Step 1: Reemplazar el bloque FREE plan upsell en dashboard/page.tsx**

Localizar el bloque (aproximadamente líneas 75-86):
```typescript
{/* FREE plan upsell */}
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

Reemplazar con:
```typescript
{/* FREE plan upsell — personalizado con datos reales */}
{installer.plan === 'FREE' && !profileIncomplete && (
  <div className="flex items-center gap-3 p-4 rounded-xl border border-primary/20 bg-primary/5">
    <Zap className="w-5 h-5 text-primary shrink-0" />
    <div className="flex-1 min-w-0">
      {totalViews > 0 ? (
        <>
          <p className="text-sm font-semibold">
            Tuviste {totalViews} visita{totalViews === 1 ? '' : 's'} esta semana
          </p>
          <p className="text-xs text-muted-foreground">Con PRO aparecés antes que los demás y conseguís más clientes.</p>
        </>
      ) : (
        <>
          <p className="text-sm font-semibold">Subí a PRO y conseguí más clientes</p>
          <p className="text-xs text-muted-foreground">Mejor posición en búsqueda, presupuestos y galería de fotos.</p>
        </>
      )}
    </div>
    <Button size="sm" asChild className="shrink-0">
      <Link href="/dashboard/plan">Ver planes</Link>
    </Button>
  </div>
)}
```

- [ ] **Step 2: Verificar TypeScript**

```bash
pnpm tsc --noEmit 2>&1 | head -20
```

- [ ] **Step 3: Commit**

```bash
git add src/app/dashboard/page.tsx
git commit -m "feat: Momento 4 — upsell personalizado con visitas reales de la semana"
```

---

## Task 9: Build de verificación final y push

- [ ] **Step 1: Build completo**

```bash
pnpm build 2>&1 | tail -30
```

Expected: `✓ Compiled successfully` sin errores. Si hay errores, resolverlos antes de continuar.

- [ ] **Step 2: Verificar manualmente en dev server**

```bash
pnpm dev
```

Probar en el navegador:
1. Ir a `/dashboard/onboarding` → completar hasta step 3 → verificar que aparece el banner PRO
2. Ir a `/dashboard/services` como usuario FREE → intentar agregar 2do oficio → verificar que abre el UpgradeModal
3. Ir a `/dashboard` → verificar que el upsell muestra visitas si `totalViews > 0`
4. Ir a un perfil público con WhatsApp → clickear el botón → verificar en Supabase que `whatsapp_clicks` incrementa
5. Ir a un link de reseña → enviar una reseña → verificar que el instalador recibe el email

- [ ] **Step 3: Push a main**

```bash
git push origin main
```

---

## Self-Review

### Spec coverage
- ✅ WhatsApp Click Tracking → Tasks 3
- ✅ Email Nueva Reseña → Tasks 1 + 2
- ✅ Momento 1 (Onboarding step 3) → Task 5
- ✅ Momento 2 (Services page 2do oficio) → Task 6
- ✅ Momento 3 (ProfileProgress 100% FREE) → Task 7
- ✅ Momento 4 (Dashboard upsell personalizado) → Task 8

### Verificaciones críticas
- El precio en UpgradeModal tiene un placeholder `$X.XXX` — si hay precio disponible en env/constants, usarlo. Si no, el CTA lleva a `/dashboard/plan` donde el precio real es visible.
- La función `createServiceRoleSupabaseClient` debe existir — Task 2 Step 2 verifica el nombre correcto antes de usarla.
- `NEXT_PUBLIC_SITE_URL` debe estar en `.env.local` y en Vercel — Task 2 Step 3 lo verifica.
