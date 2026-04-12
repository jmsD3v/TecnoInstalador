// ─────────────────────────────────────────────
// TecnoInstalador - Types
// ─────────────────────────────────────────────

export type PlanType = 'FREE' | 'PRO' | 'PREMIUM'
export type QuoteStatus = 'DRAFT' | 'SENT' | 'ACCEPTED' | 'REJECTED'
export type ReviewSource = 'link_unico' | 'manual'
export type ColorPalette = 'azul' | 'verde' | 'amarillo' | 'gris'

export interface Trade {
  id: string
  nombre: string
  slug: string
  icono?: string
  created_at: string
}

export interface Service {
  id: string
  trade_id: string
  nombre: string
  slug: string
  created_at: string
  trade?: Trade
}

export interface Installer {
  id: string
  user_id: string
  nombre: string
  apellido: string
  nombre_comercial?: string
  descripcion?: string
  ciudad: string
  provincia: string
  pais: string
  telefono?: string
  whatsapp: string
  url_slug: string
  plan: PlanType
  trial_ends_at?: string
  is_active: boolean
  color_palette: ColorPalette
  titulo_profesional?: string
  foto_perfil_url?: string
  banner_url?: string
  banner_position_y?: number
  dominio_personalizado?: string
  dominio_personalizado_activo: boolean
  total_reviews: number
  avg_rating: number
  created_at: string
  updated_at: string
  subscription_id?: string
  plan_expires_at?: string
  // Relations
  installer_trades?: InstallerTrade[]
  installer_services?: InstallerService[]
  gallery_items?: GalleryItem[]
  reviews?: Review[]
}

export interface InstallerTrade {
  id: string
  installer_id: string
  trade_id: string
  created_at: string
  trade?: Trade
}

export interface InstallerService {
  id: string
  installer_id: string
  service_id: string
  created_at: string
  service?: Service
}

export interface GalleryItem {
  id: string
  installer_id: string
  image_url: string
  titulo?: string
  descripcion?: string
  sort_order: number
  created_at: string
}

export interface Review {
  id: string
  installer_id: string
  rating: number
  comentario?: string
  foto_url?: string
  client_name?: string
  is_public: boolean
  source: ReviewSource
  reply_from_installer?: string
  reply_at?: string
  created_at: string
}

export interface ReviewInvite {
  id: string
  installer_id: string
  client_email?: string
  client_phone?: string
  client_name?: string
  token_unico: string
  used_at?: string
  created_at: string
}

export interface QuoteItem {
  concepto: string
  cantidad: number
  precio_unitario: number
  subtotal: number
}

export interface Quote {
  id: string
  installer_id: string
  client_name: string
  client_phone: string
  client_email?: string
  descripcion_trabajo: string
  items: QuoteItem[]
  total: number
  currency: string
  status: QuoteStatus
  whatsapp_message_preview?: string
  created_at: string
  updated_at: string
}

export interface Stats {
  id: string
  installer_id: string
  date: string
  profile_views: number
  whatsapp_clicks: number
}

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

// ─────────────────────────────────────────────
// Plan limits config
// ─────────────────────────────────────────────

export const PLAN_LIMITS = {
  FREE: {
    max_trades: 1,
    max_services: 3,
    max_gallery: 5,
    quotes: false,
    featured: false,
    custom_domain: false,
    stats: false,
  },
  PRO: {
    max_trades: 3,
    max_services: 10,
    max_gallery: 30,
    quotes: true,
    featured: false,
    custom_domain: false,
    stats: false,
  },
  PREMIUM: {
    max_trades: 999,
    max_services: 999,
    max_gallery: 200,
    quotes: true,
    featured: true,
    custom_domain: true,
    stats: true,
  },
} as const

export type PlanLimits = typeof PLAN_LIMITS[PlanType]

// Color palettes
export const COLOR_PALETTES: Record<ColorPalette, {
  primary: string
  primaryForeground: string
  label: string
  bg: string
  border: string
}> = {
  azul: {
    primary: '#1d4ed8',
    primaryForeground: '#ffffff',
    label: 'Azul Profesional',
    bg: '#eff6ff',
    border: '#bfdbfe',
  },
  verde: {
    primary: '#15803d',
    primaryForeground: '#ffffff',
    label: 'Verde Técnico',
    bg: '#f0fdf4',
    border: '#bbf7d0',
  },
  amarillo: {
    primary: '#b45309',
    primaryForeground: '#ffffff',
    label: 'Amarillo Construcción',
    bg: '#fffbeb',
    border: '#fde68a',
  },
  gris: {
    primary: '#374151',
    primaryForeground: '#ffffff',
    label: 'Gris Moderno',
    bg: '#f9fafb',
    border: '#d1d5db',
  },
}
