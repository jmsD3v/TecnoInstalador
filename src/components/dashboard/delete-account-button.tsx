'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'

export function DeleteAccountButton() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [confirm, setConfirm] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')

  const handleDelete = async () => {
    setDeleting(true)
    setError('')
    const res = await fetch('/api/account/delete', { method: 'DELETE' })
    if (res.ok) {
      router.push('/?deleted=1')
    } else {
      const json = await res.json()
      setError(json.error ?? 'Error al eliminar la cuenta')
      setDeleting(false)
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 text-sm font-medium text-destructive hover:text-destructive/80 transition-colors"
      >
        <Trash2 className="w-4 h-4" />
        Eliminar mi cuenta
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => !deleting && setOpen(false)} />
          <div className="relative bg-card border border-border rounded-2xl shadow-2xl p-6 w-full max-w-sm space-y-4">
            <h2 className="text-lg font-bold text-destructive">Eliminar cuenta</h2>
            <p className="text-sm text-muted-foreground">
              Esta acción es <strong>irreversible</strong>. Se eliminarán tu perfil, fotos, reseñas y todos tus datos.
            </p>
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">Escribí <strong>ELIMINAR</strong> para confirmar:</p>
              <input
                type="text"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                placeholder="ELIMINAR"
                className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:border-destructive"
                autoComplete="off"
              />
            </div>
            {error && <p className="text-xs text-destructive">{error}</p>}
            <div className="flex gap-3">
              <button
                onClick={() => { setOpen(false); setConfirm(''); setError('') }}
                disabled={deleting}
                className="flex-1 px-4 py-2 text-sm font-medium border border-border rounded-lg hover:bg-accent transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={confirm !== 'ELIMINAR' || deleting}
                className="flex-1 px-4 py-2 text-sm font-semibold rounded-lg bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors disabled:opacity-50"
              >
                {deleting ? 'Eliminando...' : 'Sí, eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
