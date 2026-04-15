# Sprint 5 — Fixes & Features Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Corregir bugs de middleware, footer, filtro de ciudades, íconos PWA, agregar página 404, servicio "paisajismo", guía de perfil con hints + barra de progreso, y revisar mobile.

**Architecture:** Cambios independientes en rutas, componentes y migraciones SQL. Cada tarea es autónoma. Las migraciones se aplican a Supabase producción con `mcp__claude_ai_Supabase__apply_migration`.

**Tech Stack:** Next.js 16, React 19, Tailwind CSS v4, Supabase, TypeScript

---

## File Map

| Archivo | Acción | Responsabilidad |
|---|---|---|
| `src/middleware.ts` | Renombrar → `src/proxy.ts` | Auth/routing proxy |
| `src/app/not-found.tsx` | Crear | Página 404 personalizada |
| `public/icons/` | Crear | PWA icons (8 tamaños) |
| `src/app/buscar/page.tsx` | Modificar | Fix footer position |
| `src/app/api/cities/route.ts` | Modificar | Bajar umbral a 3 chars |
| `src/app/buscar/filters.tsx` | Modificar | Bajar umbral a 3 chars |
| `supabase/migrations/005_add_paisajismo.sql` | Crear | Servicio paisajismo |
| `src/app/dashboard/profile/page.tsx` | Modificar | Agregar hints a FormFields |
| `src/components/dashboard/profile-progress.tsx` | Crear | Barra de completitud |
| `src/app/dashboard/layout.tsx` | Modificar | Incluir ProfileProgress |

---

## Task 1: Renombrar middleware → proxy

**Files:**
- Rename: `src/middleware.ts` → `src/proxy.ts`

- [ ] **Step 1: Leer el archivo actual**

```bash
# Verificar contenido actual (ya lo tenemos — es el archivo de auth/routing)
```

- [ ] **Step 2: Crear src/proxy.ts con el mismo contenido pero función renombrada**

Crear `src/proxy.ts` con este contenido exacto:

```typescript
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

function isAdminEmail(email: string): boolean {
  const allowed = (process.env.ADMIN_EMAILS ?? '').split(',').map(e => e.trim()).filter(Boolean)
  return allowed.includes(email)
}

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!user || !isAdminEmail(user.email ?? '')) {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  if (request.nextUrl.pathname.startsWith('/dashboard') && !user) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  if (
    (request.nextUrl.pathname.startsWith('/auth/login') ||
     request.nextUrl.pathname.startsWith('/auth/register')) &&
    user
  ) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  supabaseResponse.headers.set('x-pathname', request.nextUrl.pathname)
  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|icons|images|manifest.json|sw.js).*)',
  ],
}
```

- [ ] **Step 3: Eliminar src/middleware.ts**

```bash
rm src/middleware.ts
```

- [ ] **Step 4: Verificar que el dev server no muestra el warning**

Reiniciar `pnpm dev` y confirmar que desapareció el warning `"middleware" file convention is deprecated`.

- [ ] **Step 5: Commit**

```bash
git add src/proxy.ts
git rm src/middleware.ts
git commit -m "fix: renombrar middleware → proxy (Next.js 16 convention)"
```

---

## Task 2: Crear página 404 personalizada

**Files:**
- Create: `src/app/not-found.tsx`

- [ ] **Step 1: Crear src/app/not-found.tsx**

```tsx
import Link from 'next/link'
import { Home, Search } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <p className="text-8xl font-black text-primary/20 leading-none mb-4">404</p>
        <h1 className="text-2xl font-extrabold mb-2">Página no encontrada</h1>
        <p className="text-muted-foreground mb-8">
          La página que buscás no existe o fue movida.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors"
          >
            <Home className="w-4 h-4" />
            Ir al inicio
          </Link>
          <Link
            href="/buscar"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg border border-border text-foreground font-semibold text-sm hover:bg-accent transition-colors"
          >
            <Search className="w-4 h-4" />
            Buscar instaladores
          </Link>
        </div>
        <p className="text-xs text-muted-foreground/50 mt-8">TecnoInstalador</p>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verificar en browser**

Navegar a `http://localhost:3000/ruta-inexistente` y confirmar que muestra la página 404 personalizada.

- [ ] **Step 3: Commit**

```bash
git add src/app/not-found.tsx
git commit -m "feat: agregar página 404 personalizada"
```

---

## Task 3: Generar PWA icons

**Files:**
- Create: `public/icons/icon-{72,96,128,144,152,192,384,512}.png`
- Create: `scripts/generate-icons.mjs` (temporal, se puede borrar después)

- [ ] **Step 1: Instalar sharp temporalmente**

```bash
pnpm add -D sharp
```

- [ ] **Step 2: Crear scripts/generate-icons.mjs**

```javascript
import sharp from 'sharp'
import { mkdir } from 'fs/promises'

await mkdir('public/icons', { recursive: true })

const SIZES = [72, 96, 128, 144, 152, 192, 384, 512]
const BG = '#1d4ed8'   // theme_color del manifest
const TEXT_COLOR = '#ffffff'

for (const size of SIZES) {
  const fontSize = Math.round(size * 0.38)
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <rect width="${size}" height="${size}" rx="${Math.round(size * 0.18)}" fill="${BG}"/>
    <text x="50%" y="54%" font-family="system-ui, sans-serif" font-weight="900" font-size="${fontSize}" fill="${TEXT_COLOR}" text-anchor="middle" dominant-baseline="middle">TI</text>
  </svg>`

  await sharp(Buffer.from(svg))
    .png()
    .toFile(`public/icons/icon-${size}.png`)

  console.log(`✓ icon-${size}.png`)
}
console.log('Done.')
```

- [ ] **Step 3: Ejecutar el script**

```bash
node scripts/generate-icons.mjs
```

Salida esperada:
```
✓ icon-72.png
✓ icon-96.png
✓ icon-128.png
✓ icon-144.png
✓ icon-152.png
✓ icon-192.png
✓ icon-384.png
✓ icon-512.png
Done.
```

- [ ] **Step 4: Verificar que los íconos existen**

```bash
ls public/icons/
```

- [ ] **Step 5: Verificar que GET /icons/icon-144.png resuelve 200**

En browser: `http://localhost:3000/icons/icon-144.png`

- [ ] **Step 6: Limpiar y commitear**

```bash
rm scripts/generate-icons.mjs
pnpm remove sharp
git add public/icons/
git commit -m "feat: agregar PWA icons (8 tamaños)"
```

---

## Task 4: Fix footer en /buscar

**Files:**
- Modify: `src/app/buscar/page.tsx`

El problema: `min-h-screen` sin `flex flex-col` hace que `mt-auto` del footer no funcione.

- [ ] **Step 1: Editar el wrapper principal en BuscarPage**

En `src/app/buscar/page.tsx`, cambiar:

```tsx
// ANTES
<div className="min-h-screen bg-background">
  <Navbar user={user} />
  <div className="container mx-auto px-4 py-6 md:py-10">
```

```tsx
// DESPUÉS
<div className="min-h-screen bg-background flex flex-col">
  <Navbar user={user} />
  <div className="flex-1 container mx-auto px-4 py-6 md:py-10">
```

- [ ] **Step 2: Verificar en browser**

En `http://localhost:3000/buscar` (sin filtros), el footer debe estar pegado al fondo de la pantalla aun cuando hay poco contenido.

- [ ] **Step 3: Verificar con resultados cargados**

Buscar instaladores y confirmar que el footer queda debajo de los resultados, no superpuesto.

- [ ] **Step 4: Commit**

```bash
git add src/app/buscar/page.tsx
git commit -m "fix: footer pegado al fondo en /buscar (flex flex-col)"
```

---

## Task 5: Fix filtro de ciudades (umbral 3 chars)

**Files:**
- Modify: `src/app/api/cities/route.ts`
- Modify: `src/app/buscar/filters.tsx`

- [ ] **Step 1: Editar route.ts — bajar umbral de 4 a 3**

En `src/app/api/cities/route.ts`, cambiar:

```typescript
// ANTES
if (!q || q.length < 4) return NextResponse.json([])
```

```typescript
// DESPUÉS
if (!q || q.length < 3) return NextResponse.json([])
```

- [ ] **Step 2: Editar filters.tsx — bajar umbral y actualizar placeholder**

En `src/app/buscar/filters.tsx`, cambiar:

```typescript
// ANTES — en el useEffect
const hasQuery = ciudad.trim().length >= 4
```

```typescript
// DESPUÉS
const hasQuery = ciudad.trim().length >= 3
```

Y actualizar el placeholder del Input:

```tsx
// ANTES
placeholder={provincia ? `Ciudad en ${provincia} (mín. 4 letras)` : 'Ciudad (mín. 4 letras)'}
```

```tsx
// DESPUÉS
placeholder={provincia ? `Ciudad en ${provincia}...` : 'Ciudad o localidad...'}
```

- [ ] **Step 3: Verificar en browser**

Escribir "Gen" en el campo ciudad y confirmar que aparecen sugerencias. Escribir "Pine" y confirmar que aparece "General Pinedo" (o similar).

- [ ] **Step 4: Commit**

```bash
git add src/app/api/cities/route.ts src/app/buscar/filters.tsx
git commit -m "fix: bajar umbral de autocomplete de ciudades a 3 chars"
```

---

## Task 6: Migración — servicio Paisajismo

**Files:**
- Create: `supabase/migrations/005_add_paisajismo.sql`

- [ ] **Step 1: Verificar servicios huérfanos en Supabase**

Ejecutar en Supabase MCP:
```sql
SELECT s.id, s.nombre, s.trade_id FROM services s WHERE s.trade_id IS NULL;
```

Si hay resultados, incluirlos en la migración.

- [ ] **Step 2: Crear supabase/migrations/005_add_paisajismo.sql**

```sql
-- Agregar servicio Paisajismo bajo el trade Jardinería
INSERT INTO services (trade_id, nombre, slug)
SELECT id, 'Paisajismo', 'paisajismo'
FROM trades
WHERE slug = 'jardineria'
ON CONFLICT DO NOTHING;
```

- [ ] **Step 3: Aplicar la migración en producción**

Usar Supabase MCP: `mcp__claude_ai_Supabase__apply_migration` con el contenido del archivo.

- [ ] **Step 4: Verificar que el servicio fue creado**

```sql
SELECT s.nombre, t.nombre as trade FROM services s
JOIN trades t ON s.trade_id = t.id
WHERE s.slug = 'paisajismo';
```

Resultado esperado: `Paisajismo | Jardinería`

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/005_add_paisajismo.sql
git commit -m "feat: agregar servicio Paisajismo bajo Jardinería"
```

---

## Task 7: Hints contextuales en formulario de perfil

**Files:**
- Modify: `src/app/dashboard/profile/page.tsx`

El componente `FormField` ya acepta la prop `hint`. Solo hay que agregar textos explicativos a los campos que pueden confundir a usuarios no técnicos.

- [ ] **Step 1: Agregar hints a los campos confusos**

En `src/app/dashboard/profile/page.tsx`, actualizar estos FormFields:

```tsx
// nombre_comercial — ya tiene hint, mejorarlo:
<FormField
  label="Nombre comercial"
  hint="El nombre que aparecerá públicamente. Si trabajás solo, podés poner tu nombre y apellido. Ej: Electricidad Martínez, Plomería San Juan."
>

// titulo_profesional — ya tiene hint, hacerlo más claro:
<FormField
  label="Título profesional"
  hint="Tu especialidad en pocas palabras. Ej: Electricista matriculado, Gasista habilitado, Técnico en Redes. Esto aparece bajo tu nombre en el buscador."
>

// descripcion — ya tiene hint, mejorarlo:
<FormField
  label="Descripción"
  hint="Contá brevemente quién sos, cuántos años de experiencia tenés y en qué zona trabajás. Cuanto más completa, mejor te encuentran los clientes."
>

// whatsapp — ya tiene hint:
<FormField
  label="WhatsApp"
  required
  hint="Número completo sin espacios ni guiones. Ejemplo para Argentina: 5493624123456 (549 + código de área sin 0 + número sin 15)."
>
```

- [ ] **Step 2: Agregar hint a ciudad**

```tsx
// ciudad — actualmente no tiene hint:
<FormField label="Ciudad" required hint="Escribí la ciudad o localidad donde ofrecés tus servicios principalmente.">
```

- [ ] **Step 3: Verificar en browser**

Ir a `http://localhost:3000/dashboard/profile` y confirmar que los hints se muestran bajo cada campo.

- [ ] **Step 4: Commit**

```bash
git add src/app/dashboard/profile/page.tsx
git commit -m "feat: agregar hints explicativos en formulario de perfil"
```

---

## Task 8: Componente ProfileProgress (barra de completitud)

**Files:**
- Create: `src/components/dashboard/profile-progress.tsx`
- Modify: `src/app/dashboard/layout.tsx`

- [ ] **Step 1: Crear src/components/dashboard/profile-progress.tsx**

```tsx
import Link from 'next/link'
import { CheckCircle2, Circle, ChevronRight } from 'lucide-react'

interface Installer {
  nombre: string | null
  foto_perfil_url: string | null
  descripcion: string | null
  ciudad: string | null
  whatsapp: string | null
  installer_trades?: { id: string }[]
  installer_services?: { id: string }[]
}

interface Step {
  label: string
  done: boolean
  href: string
}

export function ProfileProgress({ installer }: { installer: Installer }) {
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
      label: 'Ciudad y provincia',
      done: !!installer.ciudad,
      href: '/dashboard/profile',
    },
    {
      label: 'WhatsApp',
      done: !!installer.whatsapp,
      href: '/dashboard/profile',
    },
    {
      label: 'Al menos 1 oficio',
      done: (installer.installer_trades?.length ?? 0) > 0,
      href: '/dashboard/profile',
    },
    {
      label: 'Al menos 1 servicio',
      done: (installer.installer_services?.length ?? 0) > 0,
      href: '/dashboard/services',
    },
  ]

  const completedCount = steps.filter(s => s.done).length
  const pct = Math.round((completedCount / steps.length) * 100)

  if (pct === 100) return null

  return (
    <div className="mx-3 mb-4 p-3 bg-primary/5 border border-primary/20 rounded-xl">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-foreground">Completá tu perfil</span>
        <span className="text-xs font-bold text-primary">{pct}%</span>
      </div>
      <div className="w-full h-1.5 bg-muted rounded-full mb-3">
        <div
          className="h-1.5 bg-primary rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <ul className="space-y-1">
        {steps.filter(s => !s.done).slice(0, 3).map(step => (
          <li key={step.label}>
            <Link
              href={step.href}
              className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors group"
            >
              <Circle className="w-3.5 h-3.5 shrink-0 text-muted-foreground/40" />
              <span className="flex-1">{step.label}</span>
              <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
```

- [ ] **Step 2: Modificar src/app/dashboard/layout.tsx — cargar datos para ProfileProgress**

Agregar el select extendido para obtener trades y services del installer, y pasar el componente al sidebar:

```typescript
// Cambiar la query del installer para incluir trades y services:
const { data: installer } = await supabase
  .from('installers')
  .select('plan, trial_ends_at, url_slug, onboarding_completed, nombre, foto_perfil_url, descripcion, ciudad, whatsapp, installer_trades(id), installer_services(id)')
  .eq('user_id', user.id)
  .single()
```

- [ ] **Step 3: Pasar ProfileProgress al DashboardSidebar**

En `src/app/dashboard/layout.tsx`, agregar `ProfileProgress` como children del sidebar o como elemento separado dentro del layout. La forma más simple es renderizarlo directamente en el layout antes del `<main>`:

```tsx
import { ProfileProgress } from '@/components/dashboard/profile-progress'

// En el return:
return (
  <div className="flex min-h-screen bg-muted/20">
    <DashboardSidebar plan={installer.plan} trialEndsAt={installer.trial_ends_at} urlSlug={installer.url_slug} isAdmin={isAdmin} profileProgress={<ProfileProgress installer={installer} />} />
    <main className="flex-1 flex flex-col">
      <div className="flex-1 p-4 md:p-6 pb-24 lg:pb-6">
        <InstallerProvider>{children}</InstallerProvider>
      </div>
    </main>
    <MobileBottomNav plan={installer.plan} urlSlug={installer.url_slug} isAdmin={isAdmin} trialEndsAt={installer.trial_ends_at} />
  </div>
)
```

- [ ] **Step 4: Actualizar DashboardSidebar para aceptar y renderizar profileProgress**

Leer `src/components/layout/dashboard-sidebar.tsx` y agregar la prop `profileProgress?: React.ReactNode` y renderizarla dentro del sidebar, justo antes de los nav links.

- [ ] **Step 5: Verificar en browser**

Ir al dashboard con un perfil incompleto y confirmar que aparece la barra de progreso con pasos pendientes. Con perfil completo, confirmar que no aparece.

- [ ] **Step 6: Commit**

```bash
git add src/components/dashboard/profile-progress.tsx src/app/dashboard/layout.tsx src/components/layout/dashboard-sidebar.tsx
git commit -m "feat: agregar barra de completitud de perfil en dashboard"
```

---

## Task 9: Revisión mobile

**Files:**
- Modify: `src/app/buscar/filters.tsx` (si hay problemas en mobile)
- Modify: `src/app/i/[slug]/page.tsx` (si hay problemas en mobile)

- [ ] **Step 1: Revisar /buscar en mobile (320px, 375px, 390px)**

En Chrome DevTools, activar vista mobile y verificar:
- Los filtros se apilan verticalmente ✓ (ya tienen `flex-col md:flex-row`)
- El botón "Buscar" es full-width en mobile ✓ (ya tiene `md:w-auto`)
- Las cards de instaladores son 1 columna ✓ (ya tienen `grid-cols-1 md:grid-cols-2`)

Si el input de ciudad tiene overflow en mobile, agregar `min-w-0` al div relativo:

```tsx
// En filters.tsx — el div del input ciudad:
<div className="flex-1 relative min-w-0" ref={wrapperRef}>
```

- [ ] **Step 2: Revisar /i/[slug] en mobile**

Leer `src/app/i/[slug]/page.tsx` y verificar que el layout del perfil público se adapta bien en pantallas pequeñas. Ajustar `grid-cols` y padding si es necesario.

- [ ] **Step 3: Commit (solo si hay cambios)**

```bash
git add src/app/buscar/filters.tsx src/app/i/[slug]/page.tsx
git commit -m "fix: ajustes de responsive en /buscar y perfil público"
```

---

## Orden de ejecución recomendado

1. Task 1 (middleware) — fix crítico del warning
2. Task 4 (footer) — bug visible
3. Task 5 (ciudades) — bug de funcionalidad
4. Task 6 (paisajismo) — migración DB
5. Task 2 (404) — feature
6. Task 3 (icons) — requiere Node script
7. Task 7 (hints) — mejora UX
8. Task 8 (progress bar) — feature más compleja
9. Task 9 (mobile) — revisión final

---

## Verificación final

```bash
pnpm build
```

Debe completar sin errores de TypeScript ni de build.
