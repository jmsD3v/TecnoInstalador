'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, XCircle } from 'lucide-react'

export default function DomainVerifyActions({ id, domain }: { id: string; domain: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function act(action: 'approve' | 'reject') {
    setLoading(true)
    await fetch(`/api/admin/domains/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    })
    router.refresh()
    setLoading(false)
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => act('approve')}
        disabled={loading}
        className="flex items-center gap-1 rounded-lg bg-green-600 text-white px-3 py-1.5 text-xs font-medium hover:bg-green-700 disabled:opacity-50"
      >
        <CheckCircle className="size-3" /> Verificar
      </button>
      <button
        onClick={() => act('reject')}
        disabled={loading}
        className="flex items-center gap-1 rounded-lg bg-destructive text-destructive-foreground px-3 py-1.5 text-xs font-medium hover:opacity-90 disabled:opacity-50"
      >
        <XCircle className="size-3" /> Rechazar
      </button>
    </div>
  )
}
