# Architecture Analysis — TecnoInstalador

Análisis generado automáticamente el 2026-04-20 a partir del código fuente real.

---

## 1. Patrón Arquitectónico Detectado

### Monolito Modular con App Router (Next.js 16)

TecnoInstalador es un monolito full-stack bien estructurado que combina:

- **Server Components por defecto** para rendering sin JavaScript del lado cliente
- **Client Components** (`"use client"`) sólo donde hay interactividad (modales, carousels, formularios)
- **Route Handlers** (`src/app/api/`) como backend REST interno — no hay servidor separado
- **Proxy middleware** (`src/proxy.ts`) para seguridad, routing de dominios y protección de rutas
- **Cron jobs** como módulo de background processing vía API routes protegidas

No hay microservicios ni event bus. El coupling es intencional y apropiado para el estadio actual del producto.

---

## 2. Principios Aplicados

### Detectados en el código

|Principio|Evidencia en el código|
|---|---|
|**SoC (Separation of Concerns)**|3 clientes Supabase separados: `client.ts` (browser), `server.ts` (SSR), `service.ts` (admin). Auth, pagos, email en módulos independientes.|
|**SRP (Single Responsibility)**|Cada Route Handler hace una sola cosa. `email.ts` sólo envía emails. `admin-auth.ts` sólo valida admin. `mp-plans.ts` sólo expone precios.|
|**DRY**|`requireAdmin()` reusado en todos los routes admin. `getEffectivePlan()` centraliza lógica de trials. `computeProfileScore()` es la única fuente de verdad para el score.|
|**KISS**|Sin ORMs. Sin queues. Sin state management global. Supabase JS directo con tipos generados.|
|**YAGNI**|Sin caching distribuido, sin saga pattern, sin CQRS — funcionalidades no necesarias aún.|
|**Security by Design**|CSP nonce-based en proxy, HSTS, X-Frame-Options DENY, Permissions-Policy, RLS en Supabase, `ADMIN_EMAILS` lista blanca.|
|**Least Privilege**|3 clientes Supabase con permisos distintos. El service role sólo se usa en server-side donde es necesario.|
|**Fail Fast**|Zod valida todos los POST bodies. Proxy bloquea antes de llegar al handler. `fetchPlanPrices()` retorna null si falta env var.|
|**Idempotencia**|`sync-subscriptions` puede correrse N veces — sólo actualiza si el estado cambió.|
|**Convention Over Configuration**|App Router dicta la estructura de rutas. Tailwind + shadcn/ui dicta los componentes UI.|
|**12-Factor App**|Config via env vars, build determinístico, deploy en Vercel (plataforma stateless).|
|**Design for Failure**|Polling cron en lugar de webhooks — self-healing si MP no puede alcanzar la app. Email con fire-and-forget para no bloquear el flujo principal.|
|**High Cohesion**|`src/lib/` agrupa utilidades por dominio. Cada directorio en `components/` corresponde a un contexto (home, installer, dashboard, admin).|
|**Low Coupling**|Las páginas no importan lógica de otras páginas. Los componentes UI son agnósticos al dominio.|

### No detectados / parciales

- **Observability First**: Sentry para errores ✓, Plausible para analytics ✓. Sin distributed tracing ni structured logging en crons.
- **Backpressure & Rate Limiting**: No detectado a nivel de Route Handlers. El proxy no implementa rate limiting por IP.
- **Open/Closed**: La lista de oficios y planes es extensible via DB, no via código.

---

## 3. Módulos y Límites de Dominio

### Módulo de Identidad y Auth

**Archivos:** `src/app/auth/`, `src/proxy.ts`, `src/lib/supabase/`

- Login, registro, reset, OAuth callback
- Protección de rutas en proxy (dashboard, admin)
- Sesión máxima de 8 horas desde `last_sign_in_at`
- 3 clientes Supabase: browser / SSR / service-role

### Módulo Marketplace (Directorio público)

**Archivos:** `src/app/buscar/`, `src/app/i/[slug]/`, `src/app/api/buscar`, `src/app/api/cities`

- Búsqueda por oficio + ciudad
- Perfil público del instalador con galería, reseñas, botón WhatsApp, modal de presupuesto
- Tracking de clicks y solicitudes de presupuesto

### Módulo Dashboard (Panel del profesional)

**Archivos:** `src/app/dashboard/`, `src/app/api/dashboard/`

- Gestión de perfil, galería, servicios, oficios
- Gestión de suscripción y plan
- Estadísticas (PRO/PREMIUM)
- Generador de presupuestos
- Programa de referidos
- Dominio personalizado
- Verificación profesional
- Widget embebible
- Notificaciones in-app

### Módulo Admin

**Archivos:** `src/app/admin/`, `src/app/api/admin/`

- Gestión de usuarios (activar, desactivar, cambiar plan, borrar)
- Moderación de reseñas
- Gestión de suscripciones
- Gestión de dominios personalizados
- Analytics BI con Recharts
- Revisión de verificaciones profesionales
- Auth: email en `ADMIN_EMAILS` env var + `requireAdmin()` helper

### Módulo de Pagos (MercadoPago)

**Archivos:** `src/app/api/payments/`, `src/lib/mercadopago.ts`, `src/lib/mp-plans.ts`, `src/app/api/cron/sync-subscriptions`

- Creación de preapprovals en MP
- Cancelación de suscripciones
- Polling diario de estado (cron) — sin webhooks
- Precios leídos desde env vars
- Actualización de plan del instalador al detectar pago autorizado

### Módulo de Reseñas

**Archivos:** `src/app/review/[token]/`, `src/app/api/reviews/`, `src/app/api/cron/auto-review-invites`

- Links únicos por token para reseñas verificadas
- Auto-invitación 48h post-contacto (cron)
- Moderación admin (toggle público/privado)

### Módulo de Email

**Archivos:** `src/lib/email.ts`, `src/app/api/auth/send-welcome`, `src/app/api/cron/email-sequences`

- Proveedor: Resend
- 7 plantillas: welcome, review, WhatsApp click, verificación, presupuesto, onboarding D+3, upgrade D+14
- Cron: secuencias D+3 y D+14 para instaladores inactivos/free

### Módulo de Dominio Personalizado

**Archivos:** `src/proxy.ts`, `src/app/dashboard/domain/`, `src/app/api/dashboard/domain`, `src/app/admin/domains/`, `src/app/api/admin/`

- Instaladores Premium pueden vincular su propio dominio
- Lookup con cache en memoria (5 min) en proxy.ts
- Flujo: solicitud → revisión admin → aprobación → rewrite automático

### Módulo de Tracking y Analítica

**Archivos:** `src/app/api/track/`, `src/components/analytics/plausible.tsx`, `src/app/admin/analytics/`

- Track de clicks WhatsApp y solicitudes de presupuesto en tabla Supabase
- Plausible.io para analytics de visitantes
- Sentry para error tracking
- Dashboard BI admin con Recharts

---

## 4. Flujos Principales del Sistema

### Registro y Onboarding

```text
/auth/register → Supabase Auth signup
  → INSERT installers (plan=FREE, trial_ends_at=now+7d)
  → POST /api/auth/send-welcome → Resend welcome email
  → Redirect /dashboard/onboarding
  → Cron D+3: si onboarding_completed=false → nudge email
  → Cron D+14: si plan=FREE → upgrade nudge email
```

### Búsqueda y Contacto (flujo cliente)

```text
/buscar → GET /api/buscar (filtros: oficio, ciudad, plan)
  → Lista InstallerCard ordenada por plan (PREMIUM > PRO > FREE)
  → Click en card → /i/[slug] (Server Component)
  → Click WhatsApp → POST /api/track/whatsapp-click
    → INSERT whatsapp_clicks + email al instalador
  → Click "Pedir presupuesto" → QuoteModal
    → POST /api/track/quote-request
    → INSERT quote_requests + email al instalador
  → Cron 48h: si status=contacted → notificación in-app pedir reseña
```

### Suscripción MercadoPago

```text
/dashboard/plan → Click "Suscribirse"
  → POST /api/payments/subscribe
    → MP: crear preapproval (plan ID desde env var)
    → INSERT subscriptions (status=pending, mp_preapproval_id)
    → Redirect a MP payment link
  → Usuario paga en MP
  → Cron diario: GET /api/cron/sync-subscriptions
    → MP API: GET preapproval status
    → Si authorized → UPDATE installers.plan + subscriptions.status
    → Si referral_code usó → verificar 5 pagos → +30 días PRO al referente
```

### Custom Domain Routing

```text
Request llega a Vercel con host=profesional.com
  → proxy.ts: host !== APP_URL → lookupCustomDomain(host)
    → Cache HIT (< 5 min): rewrite a /i/[slug]
    → Cache MISS: SELECT custom_domains WHERE domain=host AND verified=true
      → Si encontrado: cache + rewrite a /i/[slug]
      → Si no: redirect a APP_URL
```

### Flujo Admin

```text
/admin/* → proxy.ts: requireAdmin check (email en ADMIN_EMAILS)
  → requireAdmin() helper en cada Route Handler (double-check)
  → Operaciones vía service-role Supabase (bypass RLS)
```

---

## 5. Decisiones Técnicas (ADR Implícitas)

### ADR-01: Polling en lugar de Webhooks para MercadoPago

**Decisión:** Cron job diario que consulta la API de MP, sin endpoint webhook.
**Motivo:** Vercel free tier no garantiza disponibilidad confiable para webhooks inbound. El polling es self-healing y más simple de depurar.
**Trade-off:** Estado de suscripción puede tardar hasta 24h en reflejarse.

### ADR-02: 3 clientes Supabase separados

**Decisión:** `client.ts` (browser), `server.ts` (SSR), `service.ts` (admin bypass RLS).
**Motivo:** Least Privilege — operaciones públicas usan anon key, operaciones de admin usan service role sólo server-side.
**Trade-off:** Más archivos, pero sin riesgo de exponer service role al cliente.

### ADR-03: Proxy middleware para auth (no route groups)

**Decisión:** `src/proxy.ts` centraliza protección de rutas, headers de seguridad y routing de dominios.
**Motivo:** Único punto de control. Evita duplicar lógica en cada layout o page.
**Trade-off:** El proxy en Next.js 16 tiene limitaciones (no puede usar fetch con cache, no es para auth completa — el double-check con `requireAdmin()` en cada Route Handler lo compensa).

### ADR-04: Cron jobs via Route Handlers en lugar de Edge Functions

**Decisión:** `/api/cron/*` activados por Vercel Cron (o agente externo).
**Motivo:** Simplicidad. Sin infraestructura extra. Acceso completo al runtime Node.js.
**Trade-off:** Sin garantías de ejecución — si el deploy falla, el cron falla silenciosamente.

### ADR-05: Resend como proveedor de email

**Decisión:** Resend SDK en lugar de SMTP/SES/SendGrid.
**Motivo:** Integración simple con Next.js. Plantillas en JSX posibles. Free tier generoso.
**Trade-off:** Dependencia de servicio externo; las plantillas son strings HTML inline.

### ADR-06: Precios de planes desde env vars

**Decisión:** `MP_PRICE_PRO_MONTHLY`, etc. en lugar de hardcoded o en DB.
**Motivo:** Los plan IDs de MercadoPago son estáticos por entorno; cambiarlos requiere deploy de todas formas.
**Trade-off:** Para cambiar precio hay que hacer redeploy.

### ADR-07: Plan gating en `lib/plans.ts` centralizado

**Decisión:** `getEffectivePlan()`, `canAddTrade()`, `canUseStats()` en un único módulo.
**Motivo:** Single source of truth. Los limits de plan se replican en DB (`PLAN_LIMITS` constante) y en UI (`plan-gate.tsx`).
**Trade-off:** Los límites están hardcodeados en código; cambiarlos requiere deploy.

---

## 6. Dependencias Críticas

### Servicios externos

|Servicio|Uso|Riesgo si cae|
|---|---|---|
|**Supabase**|DB, Auth, Storage|Aplicación completa no funciona|
|**MercadoPago**|Pagos recurrentes|Nuevas suscripciones fallan; existentes quedan desincronizadas hasta próximo cron|
|**Vercel**|Deploy, Cron|Aplicación no disponible|
|**Resend**|Emails transaccionales|Emails no se envían; flujos de onboarding y notificaciones afectados|
|**Sentry**|Error tracking|Sin impacto en funcionalidad|
|**Plausible**|Analytics de visitantes|Sin impacto en funcionalidad|

### Dependencias de código críticas

|Paquete|Versión|Propósito|
|---|---|---|
|`next`|16.2.3|Framework core|
|`react`|19.2.4|UI runtime|
|`@supabase/ssr`|^0.10.2|Cliente SSR con cookies|
|`@supabase/supabase-js`|^2.103.0|SDK Supabase|
|`mercadopago`|^2.12.0|Pagos|
|`resend`|^6.11.0|Email|
|`zod`|^4.3.6|Validación|
|`gsap`|^3.14.2|Animaciones home|
|`recharts`|^3.8.1|Dashboard BI admin|
|`lru-cache`|^11.3.5|Cache en memoria (proxy)|
|`@sentry/nextjs`|^10.49.0|Error tracking|

### Dependencia de repositorio externo (riesgo)

- `boneyard-monorepo` — dependencia en GitHub (observada en sesión anterior). Supply chain risk; verificar si sigue presente en package.json.

---

## 7. Riesgos y Mejoras

### Riesgos detectados

#### 🔴 Alto

1. **Sin rate limiting en Route Handlers** — Los endpoints públicos (`/api/reviews/submit`, `/api/track/*`, `/api/buscar`) no tienen protección contra abuso. Un actor malicioso puede spamear reviews o saturar la DB.
2. **Cache en memoria en proxy para dominios** — En un deploy multi-instance (Vercel), cada instancia tiene su propia cache. Dominio recién verificado puede tardar 5 min extra en rutear correctamente por instancias distintas.
3. **Cron sin observabilidad** — Si un cron falla silenciosamente (timeout, error no catcheado), no hay alerta. Los crons de email-sequences y sync-subscriptions son críticos para el negocio.

#### 🟡 Medio

1. **Admin auth sólo por email** — `ADMIN_EMAILS` es una lista estática en env var. No hay 2FA ni revocación granular. Si el email de admin es comprometido, el acceso admin es total.
2. **Precios hardcodeados en env vars** — Cambiar precios requiere redeploy. Para un marketplace con pricing dinámico esto puede ser limitante.
3. **Logs sin estructura** — Las llamadas `console.log` en crons no son logs estructurados. Sin formato JSON y sin correlación de request ID, la depuración en producción es difícil.
4. **Trial logic en cliente** — `getEffectivePlan()` se usa también en Server Components para decidir qué mostrar. Si hay inconsistencia entre la lógica y la DB, usuarios pueden ver features que no deberían.

#### 🟢 Bajo

1. **Supabase types no generados automáticamente** — Si el schema cambia, los tipos TypeScript pueden quedar desactualizados hasta la próxima generación manual.
2. **Sin test coverage significativa** — Hay dependencias de testing (vitest, @testing-library) pero no se detectaron archivos `.test.ts` en la exploración.

### Mejoras sugeridas

|Mejora|Prioridad|Esfuerzo|
|---|---|---|
|Rate limiting en endpoints públicos (Upstash Redis + middleware)|Alta|Medio|
|Structured logging en crons (JSON con timestamp, jobName, status)|Alta|Bajo|
|Alertas de fallo en crons (email/Slack si job falla)|Alta|Bajo|
|Tests unitarios para `lib/plans.ts` y `lib/utils.ts`|Media|Bajo|
|Cache de dominios en Redis/Upstash para consistencia multi-instancia|Media|Medio|
|Migración de precios a tabla en DB con cache|Baja|Alto|
|Generación automática de tipos Supabase en CI|Baja|Bajo|

---

## 8. Resumen Ejecutivo

TecnoInstalador es un marketplace argentino de profesionales del hogar construido como monolito full-stack sobre Next.js 16 App Router con Server Components. La arquitectura combina rendering en servidor para SEO y performance, Route Handlers como backend REST interno, y un proxy middleware centralizado para seguridad y routing. La persistencia está delegada enteramente a Supabase (PostgreSQL + Auth + Storage), los pagos recurrentes a MercadoPago via polling cron (en lugar de webhooks), y los emails transaccionales a Resend.

El sistema tiene tres roles diferenciados (cliente público, profesional autenticado, administrador), tres niveles de plan (Free, Pro, Premium) con lógica de gating centralizada, y módulos bien separados para marketplace, dashboard, admin, pagos, reseñas y dominios personalizados. La seguridad está integrada por diseño: CSP nonce-based, HSTS, RLS en todas las tablas, y doble validación de permisos admin. Los principales riesgos son la ausencia de rate limiting en endpoints públicos y la falta de observabilidad en los jobs de background.
