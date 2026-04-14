# Sprint 6 — Conversión, Tracking y Emails

## Goal
Corregir el tracking de clicks de WhatsApp, agregar notificaciones por email al recibir reseñas, y mejorar los hooks de conversión free → paid en momentos clave del journey del instalador.

## Architecture
- WhatsApp tracking: onClick fire-and-forget en WhatsAppCTA → API route → `increment_stat` RPC
- Emails: Resend SDK → `src/lib/email.ts` centraliza el envío → template HTML rico (ui-ux-pro-max)
- Upsells: componentes client-side en onboarding, services page, ProfileProgress y dashboard resumen

## Tech Stack
Next.js 16, Resend SDK (`resend`), TypeScript, Tailwind (inline styles para email)

---

## Features

### 1. WhatsApp Click Tracking
- `WhatsAppCTA` agrega `onClick` que llama a `/api/track/whatsapp-click` con `installer_id`
- API route hace `supabase.rpc('increment_stat', { p_installer_id, p_field: 'whatsapp_clicks' })`
- Fire-and-forget: no bloquea apertura del link

### 2. Email — Nueva Reseña
- Trigger: cuando se crea una review (hookear el endpoint existente de reviews)
- Destinatario: email del instalador (obtener desde `auth.users` via service role)
- Template: HTML rico con colores del proyecto, estrellas, nombre del cliente, CTA al perfil
- Sender: `RESEND_FROM` env var
- `src/lib/email.ts` — función `sendNewReviewEmail({ installerName, installerEmail, reviewerName, rating, comment, profileUrl })`

### 3. Conversion Hooks

#### Momento 1 — Onboarding step 3 (¡Listo!)
- Debajo del botón "Ir al dashboard", banner PRO: "Con PRO podés tener hasta 3 oficios y aparecés primero en búsquedas → Ver planes"
- Solo visible si plan === 'FREE' (ya lo es siempre en onboarding)

#### Momento 2 — Services page, 2do oficio bloqueado
- El lock actual solo muestra texto "Pro". Reemplazar por modal de conversión con: lista de beneficios, precio aproximado, CTA a `/planes`
- Componente: `UpgradeModal` reutilizable

#### Momento 3 — ProfileProgress al 100% FREE
- Cuando `pct === 100 && plan === 'FREE'`, en lugar de `return null`, mostrar card de upsell: "¡Perfil completo! Subí a PRO para aparecer primero"

#### Momento 4 — Dashboard resumen, upsell personalizado
- El banner genérico "Subí a PRO" se reemplaza con datos reales: "Tuviste N visitas esta semana. Con PRO aparecés antes que los demás."
- Requiere pasar `totalViews` al banner (ya disponible en el server component)

## Files
- `src/lib/email.ts` — Resend client + `sendNewReviewEmail()`
- `src/components/email/new-review.tsx` — template HTML del email (ui-ux-pro-max)
- `src/app/api/track/whatsapp-click/route.ts` — tracking endpoint
- `src/components/installer/whatsapp-cta.tsx` — agregar onClick
- `src/components/dashboard/upgrade-modal.tsx` — modal de conversión reutilizable
- `src/app/dashboard/onboarding/page.tsx` — Momento 1
- `src/app/dashboard/services/page.tsx` — Momento 2
- `src/components/dashboard/profile-progress.tsx` — Momento 3
- `src/app/dashboard/page.tsx` — Momento 4
- Hookear Resend en el endpoint de creación de reviews
