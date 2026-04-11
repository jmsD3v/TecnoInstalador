'use client'

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input, FormField } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/components/ui/toast"
import { ReviewInvite } from "@/types"
import { Link2, Copy, Check, Plus, Clock } from "lucide-react"
import { formatRelativeDate } from "@/lib/utils"

export default function InvitesPage() {
  const supabase = createClient()
  const toast = useToast()

  const [loading, setLoading] = useState(true)
  const [installerId, setInstallerId] = useState<string | null>(null)
  const [invites, setInvites] = useState<ReviewInvite[]>([])
  const [creating, setCreating] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const [clientName, setClientName] = useState("")
  const [clientPhone, setClientPhone] = useState("")
  const [clientEmail, setClientEmail] = useState("")

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: inst } = await supabase
        .from('installers')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (!inst) return
      setInstallerId(inst.id)

      const { data } = await supabase
        .from('review_invites')
        .select('*')
        .eq('installer_id', inst.id)
        .order('created_at', { ascending: false })

      setInvites(data ?? [])
      setLoading(false)
    }
    load()
  }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!installerId) return
    setCreating(true)

    const { data, error } = await supabase
      .from('review_invites')
      .insert({
        installer_id: installerId,
        client_name: clientName || null,
        client_phone: clientPhone || null,
        client_email: clientEmail || null,
      })
      .select()
      .single()

    if (!error && data) {
      toast({ title: 'Link creado', variant: 'success' })
      setInvites(prev => [data, ...prev])
      setClientName("")
      setClientPhone("")
      setClientEmail("")
      setShowForm(false)
    }
    setCreating(false)
  }

  const getLink = (token: string) =>
    `${window.location.origin}/review/${token}`

  const handleCopy = async (token: string, id: string) => {
    await navigator.clipboard.writeText(getLink(token))
    setCopiedId(id)
    toast({ title: 'Link copiado', variant: 'success' })
    setTimeout(() => setCopiedId(null), 2000)
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Links de reseña</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Generá links únicos para que tus clientes dejen reseñas verificadas
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4 mr-2" />
          Nuevo link
        </Button>
      </div>

      {/* Create form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Crear link de reseña</CardTitle>
            <CardDescription>Los datos del cliente son opcionales</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              <FormField label="Nombre del cliente">
                <Input
                  placeholder="Ej: Juan García"
                  value={clientName}
                  onChange={e => setClientName(e.target.value)}
                />
              </FormField>
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Teléfono">
                  <Input
                    placeholder="11 1234-5678"
                    value={clientPhone}
                    onChange={e => setClientPhone(e.target.value)}
                  />
                </FormField>
                <FormField label="Email">
                  <Input
                    type="email"
                    placeholder="cliente@email.com"
                    value={clientEmail}
                    onChange={e => setClientEmail(e.target.value)}
                  />
                </FormField>
              </div>
              <div className="flex gap-2">
                <Button type="submit" loading={creating}>Generar link</Button>
                <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>Cancelar</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Invites list */}
      {invites.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Link2 className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p className="font-medium">No creaste ningún link todavía</p>
          <p className="text-sm mt-1">Generá un link y compartilo con tus clientes por WhatsApp</p>
        </div>
      ) : (
        <div className="space-y-3">
          {invites.map(invite => (
            <Card key={invite.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-sm">{invite.client_name ?? 'Cliente sin nombre'}</p>
                      {invite.used_at ? (
                        <Badge variant="success" className="text-xs">Usada ✓</Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs">
                          <Clock className="w-3 h-3 mr-1" />
                          Pendiente
                        </Badge>
                      )}
                    </div>
                    {invite.client_phone && (
                      <p className="text-xs text-muted-foreground mt-0.5">{invite.client_phone}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Creado {formatRelativeDate(invite.created_at)}
                    </p>
                    <p className="text-xs font-mono text-muted-foreground mt-1 truncate max-w-xs">
                      /review/{invite.token_unico}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCopy(invite.token_unico, invite.id)}
                    disabled={!!invite.used_at}
                  >
                    {copiedId === invite.id
                      ? <><Check className="w-4 h-4 text-green-500" /> Copiado</>
                      : <><Copy className="w-4 h-4" /> Copiar link</>
                    }
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
