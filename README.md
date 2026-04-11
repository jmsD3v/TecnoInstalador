# TecnoInstalador

SaaS para instaladores y oficios (electricistas, plomeros, gasistas, técnicos de aire, pintores, etc.)

## Stack
- **Frontend**: Next.js 15 (App Router) + TypeScript + TailwindCSS + shadcn/ui
- **Backend**: Supabase (Auth + PostgreSQL + Storage)
- **Deploy**: Vercel + Supabase

## Inicio rápido

```bash
npm install
cp .env.local.example .env.local
# Completar con credenciales de Supabase
npm run dev
```

## Setup Supabase
1. Crear proyecto en supabase.com
2. Ejecutar `supabase/migrations/001_initial_schema.sql` en el SQL Editor
3. Crear bucket de Storage: `installer-media` (lectura pública)
4. Cargar las variables de entorno en .env.local

## Rutas
- `/` — Landing
- `/auth/login` y `/auth/register` — Auth
- `/dashboard/*` — Panel del instalador (protegido)
- `/i/[slug]` — Perfil público
- `/buscar` — Marketplace
- `/review/[token]` — Formulario de reseña

## Planes
| Plan    | Oficios | Servicios | Fotos | Presupuestos |
|---------|---------|-----------|-------|--------------|
| FREE    | 1       | 3         | 5     | No           |
| PRO     | 3       | 10        | 30    | Sí           |
| PREMIUM | ∞       | ∞         | 200   | Sí + Destacado|

## Pagos (TODO)
Ver stub en `src/app/dashboard/plan/page.tsx` para integrar MercadoPago o Stripe.
