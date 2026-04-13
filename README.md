<div align="center">

# ⚡ TecnoInstalador

### La plataforma que conecta profesionales del oficio con sus próximos clientes

[![Next.js](https://img.shields.io/badge/Next.js_16-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)

</div>

---

## ¿Qué es TecnoInstalador?

**TecnoInstalador** es un marketplace argentino donde electricistas, plomeros, gasistas, carpinteros y +30 oficios más crean su perfil profesional verificado y reciben contactos directos de clientes por WhatsApp — sin intermediarios, sin comisiones.

Los clientes encuentran al profesional ideal por ciudad y oficio, ven sus reseñas reales y los contactan en segundos.

---

## ✨ Características principales

### Para profesionales
- 🪪 **Perfil público personalizado** con URL propia (`/i/tu-nombre`)
- 📸 **Galería de trabajos** con descripciones editables
- ⭐ **Reseñas verificadas** via links únicos para clientes
- 💬 **Botón WhatsApp** directo desde el perfil
- 📄 **Generador de presupuestos** con envío por WhatsApp
- 📊 **Estadísticas** de visitas y contactos generados
- 🏅 **Planes Free / Pro / Premium** con suscripción via MercadoPago

### Para clientes
- 🔍 **Buscador** por oficio y ciudad
- ✅ Perfiles verificados con reseñas reales
- 📱 Contacto directo sin registro previo

### Plataforma
- 📱 **Mobile-first** — diseñado y optimizado para celular
- 🌙 Modo oscuro nativo
- ⚡ App Router de Next.js 16 con Server Components
- 🔐 Autenticación completa con Supabase Auth
- 💳 Suscripciones recurrentes con MercadoPago (mensual / anual)
- 🛡️ Panel de administración con gestión de usuarios, reseñas y suscripciones

---

## 🛠️ Tech Stack

| Capa | Tecnología |
|------|-----------|
| Framework | [Next.js 16](https://nextjs.org/) App Router |
| Lenguaje | TypeScript 5 |
| Estilos | Tailwind CSS + shadcn/ui |
| Base de datos | [Supabase](https://supabase.com/) (PostgreSQL) |
| Autenticación | Supabase Auth |
| Storage | Supabase Storage |
| Pagos | MercadoPago Subscriptions API |
| Animaciones | GSAP + CSS animations |
| Iconos | Tabler Icons + Lucide React |
| Deploy | [Vercel](https://vercel.com/) |

---

## 🚀 Instalación local

### Requisitos

- Node.js 18+
- pnpm 9+
- Cuenta en [Supabase](https://supabase.com/)
- Cuenta en [MercadoPago Developers](https://developers.mercadopago.com/) (para pagos)

### Pasos

```bash
# Clonar el repositorio
git clone https://github.com/jmsD3v/TecnoInstalador.git
cd TecnoInstalador

# Instalar dependencias (usar pnpm, no npm)
pnpm install

# Configurar variables de entorno
cp .env.local.example .env.local
# Editar .env.local con tus credenciales

# Iniciar el servidor de desarrollo
pnpm dev
```

Abrí [http://localhost:3000](http://localhost:3000) en tu navegador.

---

## 🔐 Variables de entorno

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# MercadoPago
MERCADOPAGO_ACCESS_TOKEN=
NEXT_PUBLIC_MP_PRO_MONTHLY_ID=
NEXT_PUBLIC_MP_PRO_ANNUAL_ID=
NEXT_PUBLIC_MP_PREMIUM_MONTHLY_ID=
NEXT_PUBLIC_MP_PREMIUM_ANNUAL_ID=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
ADMIN_EMAILS=tu@email.com
```

---

## 📁 Estructura del proyecto

```
src/
├── app/                    # App Router — páginas y layouts
│   ├── auth/               # Login, registro, onboarding
│   ├── admin/              # Panel de administración
│   ├── buscar/             # Marketplace / buscador
│   ├── dashboard/          # Panel del profesional (protegido)
│   └── i/[slug]/           # Perfil público del instalador
├── components/
│   ├── home/               # Hero carousel, stats animados, trades
│   ├── installer/          # Perfil público, reseñas colapsables
│   ├── layout/             # Navbar, sidebar desktop, mobile nav
│   ├── marketplace/        # Cards de instaladores
│   └── ui/                 # Componentes base (shadcn/ui)
├── lib/
│   ├── supabase/           # Clientes server/client
│   ├── mp-plans.ts         # Integración MercadoPago
│   └── trade-icons.tsx     # Mapeo oficio → ícono (Tabler Icons)
└── types/                  # Tipos TypeScript globales
```

---

## 🧩 Planes

| Feature | Free | Pro | Premium |
|---------|:----:|:---:|:-------:|
| Oficios | 1 | 3 | ∞ |
| Servicios | 3 | 10 | ∞ |
| Fotos en galería | 5 | 30 | ∞ |
| Presupuestos desde la app | ✗ | ✓ | ✓ |
| Estadísticas de visitas | ✗ | ✗ | ✓ |
| Posición en búsqueda | Normal | Mejor | Destacada |
| Badge verificado | ✗ | ✓ | ✓ |

---

## 🗺️ Rutas principales

| Ruta | Descripción |
|------|------------|
| `/` | Landing page |
| `/buscar` | Marketplace de profesionales |
| `/i/[slug]` | Perfil público del instalador |
| `/auth/login` | Inicio de sesión |
| `/auth/register` | Registro |
| `/dashboard` | Panel del profesional |
| `/dashboard/plan` | Gestión de suscripción |
| `/review/[token]` | Formulario de reseña (link único) |
| `/admin` | Panel de administración |

---

## ⚙️ Setup de Supabase

1. Crear proyecto en [supabase.com](https://supabase.com/)
2. Ejecutar las migraciones en `supabase/migrations/`
3. Crear bucket de Storage: `installer-media` (lectura pública)
4. Habilitar Row Level Security en todas las tablas
5. Cargar variables de entorno

---

## 📄 Licencia

Este proyecto es privado. Todos los derechos reservados © 2026 TecnoInstalador.

---

<div align="center">
  <sub>Hecho con ⚡ en Argentina</sub>
</div>
