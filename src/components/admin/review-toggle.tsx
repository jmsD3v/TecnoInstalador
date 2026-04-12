'use client'

import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

export function ReviewToggle({ reviewId, isPublic: initial }: { reviewId: string; isPublic: boolean }) {
  const [isPublic, setIsPublic] = useState(initial)
  const [loading, setLoading] = useState(false)

  const toggle = async () => {
    setLoading(true)
    const res = await fetch(`/api/admin/reviews/${reviewId}/toggle-public`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_public: !isPublic }),
    })
    if (res.ok) setIsPublic(prev => !prev)
    setLoading(false)
  }

  return (
    <button onClick={toggle} disabled={loading} className="text-slate-400 hover:text-orange-400 transition-colors">
      {isPublic ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
    </button>
  )
}
