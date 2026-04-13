'use client'

import { useState } from 'react'
import { ReviewCard } from '@/components/reviews/review-card'
import { Button } from '@/components/ui/button'
import { ChevronDown, ChevronUp } from 'lucide-react'
import type { Review } from '@/types'

const INITIAL_COUNT = 3

export function CollapsibleReviews({ reviews }: { reviews: Review[] }) {
  const [expanded, setExpanded] = useState(false)
  const visible = expanded ? reviews : reviews.slice(0, INITIAL_COUNT)
  const remaining = reviews.length - INITIAL_COUNT

  return (
    <div className="space-y-3">
      {visible.map(review => (
        <ReviewCard key={review.id} review={review} />
      ))}
      {reviews.length > INITIAL_COUNT && (
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => setExpanded(v => !v)}
        >
          {expanded ? (
            <><ChevronUp className="w-4 h-4 mr-1" /> Mostrar menos</>
          ) : (
            <><ChevronDown className="w-4 h-4 mr-1" /> Ver {remaining} reseña{remaining !== 1 ? 's' : ''} más</>
          )}
        </Button>
      )}
    </div>
  )
}
