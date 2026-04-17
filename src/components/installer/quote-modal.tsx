'use client'

import { useState } from 'react'
import { MessageCircle, X, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input, FormField } from '@/components/ui/input'
import { buildWhatsAppUrl } from '@/lib/utils'

interface QuoteModalProps {
  whatsapp: string
  installerName: string
  installerId?: string
  service?: string
  fixed?: boolean
  fullWidth?: boolean
  className?: string
  label?: string
}

export function QuoteModal({
  whatsapp,
  installerName,
  installerId,
  service,
  fixed = false,
  fullWidth = false,
  className = '',
  label = 'Contactar por WhatsApp',
}: QuoteModalProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [sending, setSending] = useState(false)

  const handleOpen = (e: React.MouseEvent) => {
    e.preventDefault()
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
    setName('')
    setDescription('')
  }

  const handleSend = async () => {
    setSending(true)

    // Track WA click
    if (installerId) {
      fetch('/api/track/whatsapp-click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ installer_id: installerId }),
      }).catch(() => {})
    }

    // Send quote request email (fire-and-forget)
    if (installerId && (name.trim() || description.trim())) {
      fetch('/api/track/quote-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          installer_id: installerId,
          client_name: name.trim() || null,
          job_description: description.trim() || null,
          service: service || null,
        }),
      }).catch(() => {})
    }

    // Build WA message with quote info
    const parts = [
      `Hola ${installerName}! Te contacto desde TecnoInstalador.`,
      service ? `Servicio: ${service}` : null,
      name.trim() ? `Mi nombre es ${name.trim()}.` : null,
      description.trim() ? `Trabajo: ${description.trim()}` : null,
    ].filter(Boolean)

    const message = parts.join(' ')
    const url = buildWhatsAppUrl(whatsapp, message)

    setSending(false)
    handleClose()
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const btnClass = [
    'inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-all',
    'bg-[#25D366] hover:bg-[#1ebe59] text-white',
    fixed ? 'fixed bottom-20 right-4 z-50 md:bottom-8 lg:bottom-8 shadow-lg shadow-green-500/30 rounded-full px-6 py-3 text-base' : 'px-4 py-2 text-sm',
    fullWidth ? 'w-full py-4 text-base' : '',
    className,
  ].filter(Boolean).join(' ')

  return (
    <>
      <button onClick={handleOpen} className={btnClass}>
        <MessageCircle className="w-5 h-5" />
        {label}
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Modal */}
          <div className="relative w-full max-w-md bg-background rounded-2xl shadow-2xl border border-border p-6 space-y-5 animate-in slide-in-from-bottom-4 duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold">Contactar a {installerName}</h2>
                <p className="text-sm text-muted-foreground">Dejá tus datos y te redirigimos a WhatsApp</p>
              </div>
              <button
                onClick={handleClose}
                className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <FormField label="Tu nombre" hint="Opcional">
                <Input
                  placeholder="Ej: Juan García"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  autoFocus
                />
              </FormField>
              <FormField label="¿Qué necesitás?" hint="Opcional — ayuda al profesional a prepararse">
                <textarea
                  rows={3}
                  placeholder="Ej: Necesito cambiar el tablero eléctrico del departamento..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                />
              </FormField>
            </div>

            <Button
              onClick={handleSend}
              disabled={sending}
              className="w-full bg-[#25D366] hover:bg-[#1ebe59] text-white font-bold py-3"
            >
              <Send className="w-4 h-4 mr-2" />
              {sending ? 'Abriendo WhatsApp…' : 'Ir a WhatsApp'}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              Tus datos solo se usan para contactar al profesional
            </p>
          </div>
        </div>
      )}
    </>
  )
}
