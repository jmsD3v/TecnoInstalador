'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/input'
import { CheckCircle2, XCircle } from 'lucide-react'

interface Props {
  requestId: string
  installerId: string
  installerEmail: string
  installerName: string
}

export function VerificationActions({ requestId, installerId, installerEmail, installerName }: Props) {
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState<'approve' | 'reject' | null>(null)
  const router = useRouter()

  const act = async (action: 'approve' | 'reject') => {
    setLoading(action)
    const res = await fetch(`/api/admin/verifications/${requestId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, adminNote: note.trim() || null, installerId, installerEmail, installerName }),
    })
    if (res.ok) {
      router.refresh()
    } else {
      const data = await res.json().catch(() => ({}))
      alert(data.error ?? 'Error')
    }
    setLoading(null)
  }

  return (
    <div className="space-y-3 border-t border-slate-700 pt-4">
      <div>
        <label className="text-xs text-slate-400 uppercase tracking-wider">Nota para el instalador <span className="normal-case text-slate-500">(opcional)</span></label>
        <Textarea
          className="mt-1.5 bg-slate-700 border-slate-600 text-slate-100 placeholder:text-slate-500 focus-visible:ring-orange-500"
          rows={2}
          placeholder="Motivo de rechazo, o dejá vacío para aprobar sin nota…"
          value={note}
          onChange={e => setNote(e.target.value)}
        />
      </div>
      <div className="flex gap-3">
        <Button
          variant="default"
          className="bg-green-600 hover:bg-green-500 text-white flex-1"
          disabled={loading !== null}
          onClick={() => act('approve')}
        >
          <CheckCircle2 className="w-4 h-4 mr-2" />
          {loading === 'approve' ? 'Aprobando…' : 'Aprobar'}
        </Button>
        <Button
          variant="destructive"
          className="flex-1"
          disabled={loading !== null}
          onClick={() => act('reject')}
        >
          <XCircle className="w-4 h-4 mr-2" />
          {loading === 'reject' ? 'Rechazando…' : 'Rechazar'}
        </Button>
      </div>
    </div>
  )
}
