'use client'

import { useState } from 'react'
import { Mail, Shield } from 'lucide-react'

interface UserActionsProps {
  installerId: string
  isActive: boolean
}

export function UserActions({ installerId, isActive: initialActive }: UserActionsProps) {
  const [isActive, setIsActive] = useState(initialActive)
  const [resetting, setResetting] = useState(false)
  const [toggling, setToggling] = useState(false)
  const [message, setMessage] = useState('')

  const handleResetPassword = async () => {
    setResetting(true)
    const res = await fetch(`/api/admin/users/${installerId}/reset-password`, { method: 'POST' })
    const json = await res.json()
    setMessage(res.ok ? '✓ Email de recuperación enviado' : `Error: ${json.error}`)
    setResetting(false)
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
      <div className="flex gap-3 flex-wrap">
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
      </div>
    </div>
  )
}
