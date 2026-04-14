'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Mail, Shield, Trash2 } from 'lucide-react'

interface UserActionsProps {
  installerId: string
  isActive: boolean
}

export function UserActions({ installerId, isActive: initialActive }: UserActionsProps) {
  const router = useRouter()
  const [isActive, setIsActive] = useState(initialActive)
  const [resetting, setResetting] = useState(false)
  const [toggling, setToggling] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [message, setMessage] = useState('')

  const handleResetPassword = async () => {
    setResetting(true)
    const res = await fetch(`/api/admin/users/${installerId}/reset-password`, { method: 'POST' })
    const json = await res.json()
    setMessage(res.ok ? '✓ Email de recuperación enviado' : `Error: ${json.error}`)
    setResetting(false)
  }

  const handleDelete = async () => {
    setDeleting(true)
    const res = await fetch(`/api/admin/users/${installerId}/delete`, { method: 'DELETE' })
    if (res.ok) {
      router.push('/admin/users')
    } else {
      const json = await res.json()
      setMessage(`Error: ${json.error}`)
      setDeleting(false)
      setDeleteConfirm(false)
    }
  }

  const handleToggleActive = async () => {
    setToggling(true)
    const res = await fetch(`/api/admin/users/${installerId}/toggle-active`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !isActive }),
    })
    if (res.ok) setIsActive(prev => !prev)
    setToggling(false)
  }

  return (
    <div className="space-y-3">
      {message && (
        <p className="text-sm text-green-400 bg-green-900/30 border border-green-800 rounded-lg px-4 py-2">
          {message}
        </p>
      )}
      <div className="flex gap-3 flex-wrap items-start">
        <button
          onClick={handleResetPassword}
          disabled={resetting}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-600 text-slate-200 hover:bg-slate-700 text-sm disabled:opacity-50"
        >
          <Mail className="w-4 h-4" />
          {resetting ? 'Enviando...' : 'Enviar reset de contraseña'}
        </button>
        <button
          onClick={handleToggleActive}
          disabled={toggling}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm disabled:opacity-50 ${
            isActive
              ? 'border-red-700 text-red-400 hover:bg-red-900/30'
              : 'border-green-700 text-green-400 hover:bg-green-900/30'
          }`}
        >
          <Shield className="w-4 h-4" />
          {toggling ? 'Actualizando...' : isActive ? 'Desactivar cuenta' : 'Activar cuenta'}
        </button>
        {!deleteConfirm ? (
          <button
            onClick={() => setDeleteConfirm(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-red-800 text-red-400 hover:bg-red-900/30 text-sm"
          >
            <Trash2 className="w-4 h-4" />
            Eliminar cuenta
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-red-400 text-sm">¿Confirmás? Esta acción es irreversible.</span>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="px-3 py-1.5 rounded-lg bg-red-700 text-white text-sm font-semibold disabled:opacity-50"
            >
              {deleting ? 'Eliminando...' : 'Sí, eliminar'}
            </button>
            <button
              onClick={() => setDeleteConfirm(false)}
              className="px-3 py-1.5 rounded-lg border border-slate-600 text-slate-300 text-sm"
            >
              Cancelar
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
