'use client'

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input, FormField, Textarea } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/components/ui/toast"
import { Quote, QuoteItem, Installer } from "@/types"
import { Skeleton } from "@/components/ui/skeleton"
import { canUseQuotes, getEffectivePlan } from "@/lib/plans"
import { formatCurrency, buildQuoteWhatsAppMessage } from "@/lib/utils"
import { Plus, Trash2, Lock, MessageCircle, FileText, X } from "lucide-react"
import Link from "next/link"

const STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Borrador',
  SENT: 'Enviado',
  ACCEPTED: 'Aceptado',
  REJECTED: 'Rechazado',
}
const STATUS_VARIANTS: Record<string, 'outline' | 'default' | 'success' | 'destructive'> = {
  DRAFT: 'outline',
  SENT: 'default',
  ACCEPTED: 'success',
  REJECTED: 'destructive',
}

export default function QuotesPage() {
  const supabase = createClient()
  const toast = useToast()

  const [loading, setLoading] = useState(true)
  const [installer, setInstaller] = useState<Installer | null>(null)
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [previewQuote, setPreviewQuote] = useState<Quote | null>(null)

  // Form state
  const [clientName, setClientName] = useState("")
  const [clientPhone, setClientPhone] = useState("")
  const [clientEmail, setClientEmail] = useState("")
  const [descripcion, setDescripcion] = useState("")
  const [items, setItems] = useState<Omit<QuoteItem, 'subtotal'>[]>([
    { concepto: '', cantidad: 1, precio_unitario: 0 }
  ])

  useEffect(() => { load() }, [])

  const load = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: inst } = await supabase
      .from('installers')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (inst) {
      setInstaller(inst)
      const { data } = await supabase
        .from('quotes')
        .select('*')
        .eq('installer_id', inst.id)
        .order('created_at', { ascending: false })
      setQuotes(data ?? [])
    }
    setLoading(false)
  }

  const computedItems: QuoteItem[] = items.map(i => ({
    ...i,
    subtotal: i.cantidad * i.precio_unitario,
  }))
  const total = computedItems.reduce((s, i) => s + i.subtotal, 0)

  const addItem = () => setItems(prev => [...prev, { concepto: '', cantidad: 1, precio_unitario: 0 }])
  const removeItem = (idx: number) => setItems(prev => prev.filter((_, i) => i !== idx))
  const updateItem = (idx: number, field: keyof Omit<QuoteItem, 'subtotal'>, value: string | number) => {
    setItems(prev => prev.map((item, i) => i === idx ? { ...item, [field]: value } : item))
  }

  const handleSave = async () => {
    if (!installer) return
    setSaving(true)

    const waMessage = buildQuoteWhatsAppMessage(
      installer.nombre_comercial ?? installer.nombre,
      clientName,
      descripcion,
      computedItems,
      total
    )

    const { data, error } = await supabase
      .from('quotes')
      .insert({
        installer_id: installer.id,
        client_name: clientName,
        client_phone: clientPhone,
        client_email: clientEmail || null,
        descripcion_trabajo: descripcion,
        items: computedItems,
        total,
        currency: 'ARS',
        status: 'DRAFT',
        whatsapp_message_preview: waMessage,
      })
      .select()
      .single()

    if (!error && data) {
      toast({ title: 'Presupuesto guardado', variant: 'success' })
      setQuotes(prev => [data, ...prev])
      setShowForm(false)
      resetForm()
      setPreviewQuote(data)
    }
    setSaving(false)
  }

  const resetForm = () => {
    setClientName(""); setClientPhone(""); setClientEmail("")
    setDescripcion(""); setItems([{ concepto: '', cantidad: 1, precio_unitario: 0 }])
  }

  const handleSendWA = (quote: Quote) => {
    const wa = `https://wa.me/${quote.client_phone}?text=${encodeURIComponent(quote.whatsapp_message_preview ?? '')}`
    window.open(wa, '_blank')
    supabase.from('quotes').update({ status: 'SENT' }).eq('id', quote.id)
    setQuotes(prev => prev.map(q => q.id === quote.id ? { ...q, status: 'SENT' } : q))
  }

  if (loading) return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-10 w-36 rounded-lg" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
      </div>
    </div>
  )

  const effectivePlan = installer ? getEffectivePlan(installer) : 'FREE'
  const { allowed } = canUseQuotes(installer ?? { plan: 'FREE' as const, trial_ends_at: undefined })

  if (!allowed) {
    return (
      <div className="max-w-md mx-auto text-center py-16 space-y-4">
        <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto">
          <Lock className="w-8 h-8 text-amber-600" />
        </div>
        <h1 className="text-2xl font-bold">Presupuestos</h1>
        <p className="text-muted-foreground">Esta función está disponible en el plan Pro y Premium.</p>
        <Button asChild><Link href="/dashboard/plan">Ver planes</Link></Button>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Presupuestos</h1>
          <p className="text-muted-foreground text-sm mt-1">{quotes.length} presupuesto(s)</p>
        </div>
        <Button onClick={() => { setShowForm(true); setPreviewQuote(null) }}>
          <Plus className="w-4 h-4 mr-2" />Nuevo presupuesto
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Nuevo presupuesto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Nombre cliente" required>
                <Input value={clientName} onChange={e => setClientName(e.target.value)} required />
              </FormField>
              <FormField label="WhatsApp cliente" required>
                <Input placeholder="5491112345678" value={clientPhone} onChange={e => setClientPhone(e.target.value)} required />
              </FormField>
            </div>
            <FormField label="Email cliente">
              <Input type="email" value={clientEmail} onChange={e => setClientEmail(e.target.value)} />
            </FormField>
            <FormField label="Descripción del trabajo" required>
              <Textarea value={descripcion} onChange={e => setDescripcion(e.target.value)} required placeholder="Ej: Instalación eléctrica en cocina..." />
            </FormField>

            {/* Items */}
            <div>
              <label className="text-sm font-medium mb-2 block">Ítems</label>
              <div className="space-y-2">
                {items.map((item, idx) => (
                  <div key={idx} className="flex gap-2 items-end">
                    <div className="flex-1">
                      <Input placeholder="Concepto" value={item.concepto} onChange={e => updateItem(idx, 'concepto', e.target.value)} />
                    </div>
                    <div className="w-16">
                      <Input type="number" min={1} value={item.cantidad} onChange={e => updateItem(idx, 'cantidad', +e.target.value)} />
                    </div>
                    <div className="w-28">
                      <Input type="number" min={0} placeholder="Precio" value={item.precio_unitario || ''} onChange={e => updateItem(idx, 'precio_unitario', +e.target.value)} />
                    </div>
                    <div className="w-28 text-sm font-medium text-right px-2 pb-2">
                      {formatCurrency(item.cantidad * item.precio_unitario)}
                    </div>
                    {items.length > 1 && (
                      <Button type="button" size="icon" variant="ghost" onClick={() => removeItem(idx)}>
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              <Button type="button" variant="outline" size="sm" className="mt-2" onClick={addItem}>
                <Plus className="w-4 h-4 mr-1" /> Agregar ítem
              </Button>
            </div>

            <div className="flex items-center justify-between border-t pt-3">
              <span className="font-bold">Total:</span>
              <span className="text-xl font-extrabold">{formatCurrency(total)}</span>
            </div>

            <div className="flex gap-2">
              <Button loading={saving} onClick={handleSave}>Guardar presupuesto</Button>
              <Button variant="ghost" onClick={() => { setShowForm(false); resetForm() }}>Cancelar</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* WhatsApp preview */}
      {previewQuote && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-green-800">Mensaje listo para WhatsApp</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <pre className="text-sm whitespace-pre-wrap font-mono bg-white rounded-lg p-3 border border-green-200 text-gray-700 max-h-48 overflow-y-auto">
              {previewQuote.whatsapp_message_preview}
            </pre>
            <Button variant="whatsapp" onClick={() => handleSendWA(previewQuote)}>
              <MessageCircle className="w-4 h-4 mr-2" />
              Enviar por WhatsApp
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Quotes list */}
      {quotes.length === 0 && !showForm ? (
        <div className="text-center py-12 text-muted-foreground">
          <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p className="font-medium">No hay presupuestos todavía</p>
        </div>
      ) : (
        <div className="space-y-3">
          {quotes.map(quote => (
            <Card key={quote.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold">{quote.client_name}</p>
                      <Badge variant={STATUS_VARIANTS[quote.status] as any}>
                        {STATUS_LABELS[quote.status]}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">{quote.descripcion_trabajo}</p>
                    <p className="text-lg font-bold mt-1">{formatCurrency(quote.total)}</p>
                  </div>
                  <Button size="sm" variant="whatsapp" onClick={() => handleSendWA(quote)}>
                    <MessageCircle className="w-4 h-4 mr-1" />
                    WhatsApp
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
