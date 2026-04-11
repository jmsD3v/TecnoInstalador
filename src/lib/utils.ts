import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Slugify para URL del instalador
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // quitar tildes
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

// Formatear número de WhatsApp
export function buildWhatsAppUrl(numero: string, mensaje?: string): string {
  const clean = numero.replace(/\D/g, '')
  const base = `https://wa.me/${clean}`
  if (mensaje) {
    return `${base}?text=${encodeURIComponent(mensaje)}`
  }
  return base
}

// Mensaje pre-formateado para WhatsApp desde perfil
export function buildContactMessage(installerName: string, service?: string): string {
  const base = `Hola ${installerName}! Te contacto desde TecnoInstalador.`
  if (service) {
    return `${base} Estoy interesado/a en: ${service}.`
  }
  return `${base} Me gustaría obtener más información sobre tus servicios.`
}

// Formatear moneda ARS
export function formatCurrency(amount: number, currency = 'ARS'): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount)
}

// Formatear fecha relativa
export function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days === 0) return 'Hoy'
  if (days === 1) return 'Ayer'
  if (days < 30) return `Hace ${days} días`
  if (days < 365) return `Hace ${Math.floor(days / 30)} meses`
  return `Hace ${Math.floor(days / 365)} años`
}

// Generar mensaje de presupuesto para WhatsApp
export function buildQuoteWhatsAppMessage(
  installerName: string,
  clientName: string,
  descripcion: string,
  items: { concepto: string; cantidad: number; precio_unitario: number; subtotal: number }[],
  total: number,
  currency = 'ARS'
): string {
  const itemsText = items
    .map(item => `  • ${item.concepto} (x${item.cantidad}): ${formatCurrency(item.subtotal, currency)}`)
    .join('\n')

  return `*Presupuesto de ${installerName}*

👤 Cliente: ${clientName}
📋 Trabajo: ${descripcion}

*Detalle:*
${itemsText}

*TOTAL: ${formatCurrency(total, currency)}*

_Presupuesto generado desde TecnoInstalador_`
}

// Rating a estrellas
export function ratingToStars(rating: number): string {
  return '★'.repeat(rating) + '☆'.repeat(5 - rating)
}

// Iniciales del nombre
export function getInitials(nombre: string, apellido: string): string {
  return `${nombre.charAt(0)}${apellido.charAt(0)}`.toUpperCase()
}
