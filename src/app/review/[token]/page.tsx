'use client'

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Wrench, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input, FormField, Textarea } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { StarRating } from "@/components/ui/avatar"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/components/ui/toast"
import Link from "next/link"

export default function ReviewPage() {
  const params = useParams()
  const token = params.token as string
  const supabase = createClient()
  const toast = useToast()

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState("")

  const [invite, setInvite] = useState<any>(null)
  const [installer, setInstaller] = useState<any>(null)

  const [rating, setRating] = useState(0)
  const [comentario, setComentario] = useState("")
  const [clientName, setClientName] = useState("")

  useEffect(() => {
    const load = async () => {
      const { data: inv } = await supabase
        .from('review_invites')
        .select('*, installer:installers(*)')
        .eq('token_unico', token)
        .single()

      if (!inv) {
        setError("Este link no es válido o ya fue utilizado.")
        setLoading(false)
        return
      }

      if (inv.used_at) {
        setError("Este link ya fue utilizado. Solo se puede usar una vez.")
        setLoading(false)
        return
      }

      setInvite(inv)
      setInstaller(inv.installer)
      setClientName(inv.client_name ?? "")
      setLoading(false)
    }
    load()
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (rating === 0) {
      toast({ title: 'Por favor seleccioná una puntuación', variant: 'warning' })
      return
    }

    setSubmitting(true)

    // Insert review
    const { error: reviewError } = await supabase.from('reviews').insert({
      installer_id: invite.installer_id,
      rating,
      comentario: comentario || null,
      client_name: clientName || null,
      is_public: true,
      source: 'link_unico',
    })

    if (reviewError) {
      toast({ title: 'Error al enviar', description: reviewError.message, variant: 'error' })
      setSubmitting(false)
      return
    }

    // Mark invite as used
    await supabase
      .from('review_invites')
      .update({ used_at: new Date().toISOString() })
      .eq('token_unico', token)

    setSubmitted(true)
    setSubmitting(false)
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (error) return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">⚠️</span>
        </div>
        <h2 className="text-xl font-bold mb-2">Link inválido</h2>
        <p className="text-muted-foreground">{error}</p>
        <Button variant="outline" className="mt-4" asChild>
          <Link href="/">Ir al inicio</Link>
        </Button>
      </div>
    </div>
  )

  if (submitted) return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold mb-2">¡Gracias por tu reseña!</h2>
        <p className="text-muted-foreground">
          Tu opinión ayuda a {installer?.nombre_comercial ?? installer?.nombre} a crecer.
        </p>
        <Button variant="outline" className="mt-4" asChild>
          <Link href={`/i/${installer?.url_slug}`}>Ver perfil del instalador</Link>
        </Button>
      </div>
    </div>
  )

  const displayName = installer?.nombre_comercial ?? `${installer?.nombre} ${installer?.apellido}`

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/20">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Wrench className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold">TecnoInstalador</span>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Dejá tu reseña</CardTitle>
            <CardDescription>
              Contanos cómo fue tu experiencia con <strong>{displayName}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Star rating */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Puntuación *</label>
                <StarRating
                  rating={rating}
                  interactive
                  onChange={setRating}
                  size="lg"
                />
                {rating > 0 && (
                  <p className="text-sm text-muted-foreground">
                    {['', 'Muy malo', 'Malo', 'Regular', 'Bueno', 'Excelente'][rating]}
                  </p>
                )}
              </div>

              <FormField label="Tu nombre">
                <Input
                  placeholder="Ej: Juan García"
                  value={clientName}
                  onChange={e => setClientName(e.target.value)}
                />
              </FormField>

              <FormField label="Comentario" hint="Contá tu experiencia (opcional)">
                <Textarea
                  placeholder="El trabajo quedó excelente, muy prolijo y puntual..."
                  value={comentario}
                  onChange={e => setComentario(e.target.value)}
                  className="min-h-[100px]"
                />
              </FormField>

              <Button type="submit" loading={submitting} className="w-full" disabled={rating === 0}>
                Enviar reseña
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export const dynamic = 'force-dynamic'
