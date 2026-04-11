'use client'

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/components/ui/toast"
import { Review } from "@/types"
import { ReviewCard } from "@/components/reviews/review-card"
import { StarRating } from "@/components/ui/avatar"
import { MessageSquarePlus, Star } from "lucide-react"
import Link from "next/link"

export default function ReviewsPage() {
  const supabase = createClient()
  const toast = useToast()

  const [loading, setLoading] = useState(true)
  const [installerId, setInstallerId] = useState<string | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [replyingId, setReplyingId] = useState<string | null>(null)
  const [replyText, setReplyText] = useState("")
  const [savingReply, setSavingReply] = useState(false)

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
        .from('reviews')
        .select('*')
        .eq('installer_id', inst.id)
        .order('created_at', { ascending: false })

      setReviews(data ?? [])
      setLoading(false)
    }
    load()
  }, [])

  const avgRating = reviews.length
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : 0

  const handleSaveReply = async (reviewId: string) => {
    setSavingReply(true)
    const { error } = await supabase
      .from('reviews')
      .update({ reply_from_installer: replyText, reply_at: new Date().toISOString() })
      .eq('id', reviewId)

    if (!error) {
      toast({ title: 'Respuesta guardada', variant: 'success' })
      setReviews(prev =>
        prev.map(r => r.id === reviewId ? { ...r, reply_from_installer: replyText } : r)
      )
      setReplyingId(null)
      setReplyText("")
    }
    setSavingReply(false)
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
          <h1 className="text-2xl font-bold">Reseñas</h1>
          <p className="text-muted-foreground text-sm mt-1">{reviews.length} reseña(s) recibidas</p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/dashboard/reviews/invites">
            <MessageSquarePlus className="w-4 h-4 mr-2" />
            Pedir reseña
          </Link>
        </Button>
      </div>

      {/* Summary */}
      {reviews.length > 0 && (
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="text-center">
              <p className="text-4xl font-extrabold">{avgRating.toFixed(1)}</p>
              <StarRating rating={avgRating} size="sm" className="justify-center mt-1" />
              <p className="text-xs text-muted-foreground mt-1">{reviews.length} reseñas</p>
            </div>
            <div className="flex-1 space-y-1">
              {[5, 4, 3, 2, 1].map(star => {
                const count = reviews.filter(r => r.rating === star).length
                const pct = reviews.length ? (count / reviews.length) * 100 : 0
                return (
                  <div key={star} className="flex items-center gap-2">
                    <span className="text-xs w-4">{star}</span>
                    <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                    <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-yellow-400 rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground w-6">{count}</span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reviews list */}
      {reviews.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Star className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p className="font-medium">Todavía no tenés reseñas</p>
          <p className="text-sm mt-1">Compartí un link único con tus clientes para recibir tu primera reseña</p>
          <Button variant="outline" size="sm" className="mt-4" asChild>
            <Link href="/dashboard/reviews/invites">Generar link de reseña</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map(review => (
            <div key={review.id}>
              <ReviewCard review={review} showReply={true} />
              {/* Reply section */}
              <div className="ml-4 mt-2">
                {replyingId === review.id ? (
                  <div className="flex flex-col gap-2">
                    <Textarea
                      placeholder="Escribí tu respuesta..."
                      value={replyText}
                      onChange={e => setReplyText(e.target.value)}
                      className="text-sm"
                    />
                    <div className="flex gap-2">
                      <Button size="sm" loading={savingReply} onClick={() => handleSaveReply(review.id)}>
                        Guardar respuesta
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setReplyingId(null)}>
                        Cancelar
                      </Button>
                    </div>
                  </div>
                ) : !review.reply_from_installer ? (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-xs text-muted-foreground"
                    onClick={() => { setReplyingId(review.id); setReplyText("") }}
                  >
                    Responder
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-xs text-muted-foreground"
                    onClick={() => { setReplyingId(review.id); setReplyText(review.reply_from_installer ?? "") }}
                  >
                    Editar respuesta
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
