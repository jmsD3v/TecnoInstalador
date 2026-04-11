import { Review } from "@/types"
import { StarRating } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { formatRelativeDate } from "@/lib/utils"
import { User } from "lucide-react"
import { cn } from "@/lib/utils"

interface ReviewCardProps {
  review: Review
  showReply?: boolean
  className?: string
}

export function ReviewCard({ review, showReply = true, className }: ReviewCardProps) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Avatar / foto */}
          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0 overflow-hidden">
            {review.foto_url ? (
              <img
                src={review.foto_url}
                alt={review.client_name ?? 'Cliente'}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-5 h-5 text-muted-foreground" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="font-semibold text-sm">
                {review.client_name ?? 'Cliente anónimo'}
              </span>
              <span className="text-xs text-muted-foreground">
                {formatRelativeDate(review.created_at)}
              </span>
            </div>

            <StarRating rating={review.rating} size="sm" className="my-1" />

            {review.comentario && (
              <p className="text-sm text-muted-foreground leading-relaxed">
                {review.comentario}
              </p>
            )}

            {/* Reply from installer */}
            {showReply && review.reply_from_installer && (
              <div className="mt-3 pl-3 border-l-2 border-primary/30">
                <p className="text-xs font-semibold text-primary mb-0.5">Respuesta del instalador:</p>
                <p className="text-sm text-muted-foreground">{review.reply_from_installer}</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
