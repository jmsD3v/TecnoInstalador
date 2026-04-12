# TecnoInstalador — Plan Completo de Desarrollo

**Fecha:** 2026-04-12  
**Enfoque:** Capas secuenciales (A) — Fundación → Admin → Front polish  
**Prioridad transversal:** Seguridad extrema en cada capa

---

## Estado actual del proyecto

### Stack
- Next.js 16.2.3, React 19, Tailwind v4, Supabase, MercadoPago
- PWA habilitado con `next-pwa`
- Deploy en Vercel con cron job cada 15 min

### Rutas existentes
| Ruta | Estado |
|---|---|
| `/` | ✅ Landing completa, pricing real desde env vars |
| `/buscar` | ✅ Marketplace con filtros ciudad/provincia/oficio |
| `/planes` | ✅ Pricing público con CTAs |
| `/i/[slug]` | ✅ Perfil público del instalador |
| `/review/[token]` | ✅ Formulario de reseña para clientes |
| `/auth/login` | ✅ Login con email + Google |
| `/auth/register` | ✅ Registro + creación de perfil |
| `/auth/callback` | ✅ OAuth callback |
| `/dashboard` | ✅ Overview con stats |
| `/dashboard/profile` | ✅ Edición de perfil, foto, banner |
| `/dashboard/gallery` | ✅ Galería de trabajos |
| `/dashboard/services` | ✅ Oficios y servicios |
| `/dashboard/quotes` | ✅ Presupuestos (solo PRO/PREMIUM) |
| `/dashboard/reviews` | ✅ Gestión de reseñas + respuestas |
| `/dashboard/reviews/invites` | ✅ Generador de links únicos |
| `/dashboard/plan` | ✅ Gestión de suscripción MP |
| `/api/payments/subscribe` | ✅ Crea checkout MP |
| `/api/payments/cancel` | ✅ Cancela suscripción |
| `/api/cron/sync-subscriptions` | ✅ Sincroniza estados MP cada 15min |
| `/api/plans/prices` | ✅ Precios desde env vars |

### Faltante identificado
- No hay admin dashboard
- No hay GSAP ni skeletons
- No hay flujo de password recovery
- No hay onboarding post-registro
- Varios links rotos (footer legal, navbar sin link dashboard, perfil sin back)
- Estado compartido del dashboard: cada página hace su propio fetch al installer

---

## Fase 1 — Fundación (bloqueante para todo lo demás)

### 1.1 GSAP Setup

**Instalación:**
```bash
pnpm add gsap
```

**Archivos a crear:**
- `src/lib/gsap.ts` — singleton que registra plugins ScrollTrigger y Flip, exporta `gsap`
- `src/hooks/use-gsap-animation.ts` — hook wrapper para `useGSAP` con cleanup automático

**Animaciones por vista:**

| Vista | Tipo | Descripción |
|---|---|---|
| Homepage hero | Timeline | badge → h1 → p → botones → social proof, stagger 0.1s, `from: {opacity:0, y:30}` |
| Homepage secciones | ScrollTrigger | Cada sección: `from: {opacity:0, y:40}`, trigger: `80% bottom` |
| Homepage trades grid | ScrollTrigger stagger | Iconos de oficios entran escalonados |
| `/buscar` results | Stagger | Cards entran al cargar resultados (`from: {opacity:0, scale:0.95}`) |
| `/i/[slug]` | Timeline | Avatar → nombre → rating → galería → reviews, stagger 0.08s |
| Page transitions | ViewTransition + GSAP | Cross-fade suave entre rutas vía Next.js View Transitions API |
| Onboarding stepper | Slide | Cada paso entra desde derecha, sale a izquierda |
| Admin counters | CountTo | Números animados 0 → valor real al montar `/admin` |
| Confetti bienvenida | GSAP particles | Al completar onboarding, confetti explosión y fade out |

**Consideraciones de rendimiento:**
- `ScrollTrigger.refresh()` en resize
- Cleanup con `ctx.revert()` en `useGSAP`
- `will-change: transform` solo en elementos activamente animados
- Reducir/eliminar animaciones si `prefers-reduced-motion` está activo

### 1.2 Boneyard (Skeletons)

**Instalación:**
```bash
pnpm add https://github.com/0xGF/boneyard
```
> Verificar API exacta de boneyard al instalar. Si no tiene package exportable, copiar los componentes base al repo en `src/components/ui/skeleton/`.

**Skeletons a crear:**

| Componente skeleton | Usado en |
|---|---|
| `InstallerCardSkeleton` | `/buscar` Suspense fallback (grid de 6) |
| `ProfilePageSkeleton` | `/i/[slug]` Suspense fallback |
| `DashboardStatsSkeleton` | `/dashboard` mientras carga |
| `ReviewCardSkeleton` | `/dashboard/reviews`, perfil público |
| `GalleryGridSkeleton` | `/dashboard/gallery`, perfil público |
| `AdminTableSkeleton` | Todas las tablas de `/admin/*` |
| `PricingCardsSkeleton` | `/planes` mientras carga |

**Patrón:** Reemplazar todos los `animate-spin` actuales en `Suspense` fallbacks por el skeleton correspondiente.

### 1.3 InstallerContext (estado compartido dashboard)

**Archivo:** `src/contexts/installer-context.tsx`

```typescript
// Exporta:
// - InstallerProvider (envuelve el DashboardLayout)
// - useInstaller() → { installer, refreshInstaller, loading }
```

- El `DashboardLayout` fetchea el installer una sola vez y lo provee via context
- `refreshInstaller()` re-fetcha desde Supabase y actualiza el estado global
- Se llama desde: cambio de plan, edición de perfil, cualquier acción que mute el installer
- Resultado: la sidebar muestra el plan actualizado sin recargar la página

### 1.4 Security Headers

**Archivo:** `next.config.ts` — agregar `headers()` con:

```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
Content-Security-Policy: default-src 'self'; img-src 'self' data: blob: *.supabase.co; ...
```

**Rate limiting:**
- Usar Vercel's built-in Edge Middleware rate limiting en `/api/payments/*` y `/api/auth/*`
- Máximo 10 requests/minuto por IP en endpoints de pagos

**Validación de input:**
```bash
pnpm add zod
```
- Agregar schemas Zod en todos los API route handlers existentes y nuevos
- Nunca confiar en `req.body` sin validar

---

## Fase 2 — Admin Dashboard

### 2.1 Autenticación de Admin

**Variable de entorno a agregar:**
```
ADMIN_EMAILS=tu@email.com,otro@email.com
```

**Middleware** (`src/middleware.ts`) — extender el actual:
```typescript
// Si pathname empieza con /admin:
// 1. Verificar que user existe
// 2. Verificar que user.email está en process.env.ADMIN_EMAILS.split(',')
// 3. Si no: redirect('/') sin mensaje de error
```

**Principio:** Falla cerrada, sin mensaje explicativo — seguridad por oscuridad para el path de admin.

### 2.2 Layout del Admin

**Archivo:** `src/app/admin/layout.tsx`

- Sidebar fija oscura (tema separado del dashboard de instaladores)
- Links: Overview, Usuarios, Reseñas, Suscripciones
- Footer con email del admin logueado + botón logout
- No usa el `DashboardLayout` ni el `InstallerContext` — es independiente

**Archivo:** `src/components/admin/admin-sidebar.tsx`

### 2.3 Páginas del Admin

#### `/admin` — Overview
- Total usuarios, usuarios activos hoy, nuevos esta semana
- Distribución por plan (FREE/PRO/PREMIUM) con donut chart
- Reseñas pendientes de moderación (badge de alerta si > 0)
- MRR estimado (suma de suscripciones activas × precio)
- Contadores animados con GSAP al montar

#### `/admin/users` — Gestión de usuarios
- Tabla paginada: nombre, email, ciudad, plan, fecha registro, estado
- Búsqueda por nombre/email
- Filtros: por plan, por estado (activo/inactivo)
- Acciones por fila: ver detalle, activar/desactivar

#### `/admin/users/[id]` — Detalle de usuario
- Info completa del installer
- Estado de suscripción MP (si tiene)
- Botón **"Enviar reset de contraseña"** → llama `supabase.auth.admin.generateLink()` con `type: 'recovery'` → Supabase envía el email directamente al usuario
- Toggle **Activo/Inactivo** → actualiza `installers.is_active` via service role
- Historial de reseñas del installer

#### `/admin/reviews` — Moderación de reseñas
- Tabla de todas las reseñas con filtros: Públicas / Ocultas / Con reporte
- Vista de la reseña completa (rating, comentario, foto si tiene)
- Acciones: Mostrar / Ocultar (toggle `is_public`) — nunca DELETE físico
- Soft delete: campo `deleted_at` en la tabla reviews (agregar en migration)

#### `/admin/subscriptions` — Vista financiera
- Lista de todas las suscripciones con estado MP
- Columnas: installer, plan, periodo, estado, próximo cobro, monto
- MRR total al tope de la página
- Export CSV básico

### 2.4 API Routes del Admin

Todas bajo `/api/admin/*`, protegidas con verificación de `ADMIN_EMAILS` en el handler (doble verificación: middleware + handler).

```
POST /api/admin/users/[id]/reset-password → genera link recovery
PATCH /api/admin/users/[id]/toggle-active → activa/desactiva cuenta  
PATCH /api/admin/reviews/[id]/toggle-public → oculta/muestra reseña
GET  /api/admin/stats → datos del overview
```

---

## Fase 3 — Flujos completos & Conectividad

### 3.1 Password Recovery

**Rutas nuevas:**
- `src/app/auth/forgot-password/page.tsx` — formulario con email → `supabase.auth.resetPasswordForEmail(email, { redirectTo: '/auth/update-password' })`
- `src/app/auth/update-password/page.tsx` — formulario nueva contraseña → `supabase.auth.updateUser({ password })` → redirect `/dashboard`

**Link desde login:** Agregar "¿Olvidaste tu contraseña?" en `/auth/login` apuntando a `/auth/forgot-password`.

**Supabase hace:** Envía el email con token firmado, valida expiración del token, aplica el cambio.  
**Nosotros hacemos:** UI de los dos formularios + manejo de errores + feedback visual.

### 3.2 Onboarding Post-Registro

**Ruta nueva:** `src/app/dashboard/onboarding/page.tsx`

Stepper de 3 pasos (animado con GSAP — slide entre pasos):
1. **Nombre comercial + ciudad** (pre-fill con lo ingresado en registro)
2. **Elegir oficio principal** (grid de oficios con iconos)
3. **Foto de perfil** (opcional, con skip)

Al completar → setear `onboarding_completed: true` en `installers` → redirect `/dashboard` con confetti GSAP y toast "¡Tu perfil está listo!".

**Redirect automático:** En el `DashboardLayout`, si `installer.onboarding_completed === false`, redirect a `/dashboard/onboarding`. Solo la primera vez.

**Campo nuevo en DB:** `onboarding_completed boolean DEFAULT false` en tabla `installers`.

### 3.3 Links rotos a reparar

| Problema | Solución |
|---|---|
| Footer sin links legales | Crear `/legal/terminos` y `/legal/privacidad` (páginas stub con texto placeholder) |
| Navbar sin link al dashboard cuando logueado | Agregar lógica en `navbar.tsx` para mostrar "Mi dashboard" si `user` existe |
| Perfil `/i/[slug]` sin volver al marketplace | Agregar breadcrumb/botón "← Volver a búsqueda" en la página de perfil |
| Dashboard sidebar con link a stats inexistente | Crear `/dashboard/stats` o remover el link de la sidebar |
| Onboarding sin guía post-registro | Implementado en 3.2 |

### 3.4 Stats Dashboard (nueva página)

**Ruta:** `/dashboard/stats` (solo PREMIUM)

- Gráfico de visitas al perfil (últimos 30 días)
- Gráfico de clicks en WhatsApp (últimos 30 días)
- Tasa de conversión visitas → clicks
- Los datos ya existen en la tabla `stats` — solo falta la UI
- Usar `recharts` (idiomático en React, tree-shakeable, sin canvas manual)

### 3.5 Flujo de suscripción mejorado

- Subscribe → skeleton loading (no spinner) mientras redirige a MP
- Return de MP → polling de estado hasta que cron sincronice (máx 60s, con feedback)
- Success → `refreshInstaller()` → sidebar actualiza badge de plan
- Error → toast con mensaje claro + botón retry

### 3.6 Realtime en reviews

En `/dashboard/reviews`:
- Supabase Realtime subscription en `reviews` filtrada por `installer_id`
- Nueva reseña → aparece automáticamente en la lista con animación GSAP (slide-in desde arriba)

---

## Fase 4 — Pulido final

### 4.1 .gitignore

Agregar `.superpowers/` al `.gitignore`.

### 4.2 Variables de entorno a agregar

```
ADMIN_EMAILS=tu@email.com
NEXT_PUBLIC_APP_URL=https://tecnoinstalador.vercel.app  # ya existe
```

### 4.3 Migración de DB necesaria

```sql
-- Campo onboarding
ALTER TABLE installers ADD COLUMN onboarding_completed boolean DEFAULT false;

-- Soft delete en reviews
ALTER TABLE reviews ADD COLUMN deleted_at timestamptz;

-- Índices de performance para admin queries
CREATE INDEX idx_installers_plan ON installers(plan);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_reviews_is_public ON reviews(is_public);
```

### 4.4 RLS Policies a verificar/agregar en Supabase

(Ya configurado manualmente el 2026-04-12)

```sql
-- installers: solo el dueño puede modificar
ALTER TABLE installers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "installers_own" ON installers USING (auth.uid() = user_id);

-- reviews: INSERT sin auth (clientes), SELECT solo públicas
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reviews_public_read" ON reviews FOR SELECT USING (is_public = true AND deleted_at IS NULL);
CREATE POLICY "reviews_insert_public" ON reviews FOR INSERT WITH CHECK (true);
CREATE POLICY "reviews_owner_all" ON reviews USING (
  installer_id IN (SELECT id FROM installers WHERE user_id = auth.uid())
);

-- subscriptions: solo el dueño puede ver
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "subscriptions_owner" ON subscriptions USING (
  installer_id IN (SELECT id FROM installers WHERE user_id = auth.uid())
);

-- gallery_items: dueño puede modificar, todos pueden ver
ALTER TABLE gallery_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "gallery_public_read" ON gallery_items FOR SELECT USING (true);
CREATE POLICY "gallery_owner_write" ON gallery_items USING (
  installer_id IN (SELECT id FROM installers WHERE user_id = auth.uid())
);
```

---

## Orden de implementación sugerido

```
Sprint 1 — Fundación
  [ ] Security headers en next.config.ts
  [ ] Instalar + configurar GSAP (singleton, plugins)
  [ ] Instalar boneyard, crear todos los skeletons
  [ ] InstallerContext en dashboard layout
  [ ] Zod en todos los API routes existentes

Sprint 2 — Admin
  [ ] Middleware admin auth
  [ ] AdminSidebar + AdminLayout
  [ ] /admin overview con stats + GSAP counters
  [ ] /admin/users (lista + detalle + reset password + toggle active)
  [ ] /admin/reviews (moderación)
  [ ] /admin/subscriptions (vista financiera)

Sprint 3 — Flujos
  [ ] /auth/forgot-password + /auth/update-password
  [ ] /dashboard/onboarding (stepper 3 pasos + GSAP slide)
  [ ] Migración DB (onboarding_completed, deleted_at, índices)
  [ ] Reparar links rotos (footer, navbar, perfil)
  [ ] /dashboard/stats con gráficos

Sprint 4 — Animaciones & Polish
  [ ] GSAP homepage hero timeline
  [ ] GSAP ScrollTrigger en todas las secciones de la landing
  [ ] GSAP page transitions (View Transitions API)
  [ ] GSAP stagger en /buscar cards y perfil público
  [ ] Realtime reviews en dashboard
  [ ] Flujo de suscripción mejorado con feedback
  [ ] .gitignore update
```

---

## Archivos clave de referencia

- `src/types/index.ts` — tipos globales, PLAN_LIMITS, COLOR_PALETTES
- `src/lib/mercadopago.ts` — cliente MP singleton
- `src/lib/mp-plans.ts` — fetchPlanPrices() desde env vars
- `src/lib/plans.ts` — getEffectivePlan(), sortInstallersByPlan()
- `src/middleware.ts` — auth guard, extender para admin
- `src/app/api/cron/sync-subscriptions/route.ts` — cron MP
- `vercel.json` — configuración del cron

---

*Spec aprobado el 2026-04-12. Implementar siguiendo el orden de sprints.*
