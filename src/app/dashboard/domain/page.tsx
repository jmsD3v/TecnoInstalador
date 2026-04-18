'use client'

import { useEffect, useState } from 'react'
import { AlertCircle, CheckCircle, Clock, ExternalLink, Globe } from 'lucide-react'

interface DomainData {
  id: string
  domain: string
  verified: boolean
  dns_verified_at: string | null
  created_at: string
}

export default function DomainPage() {
  const [plan, setPlan] = useState<string>('')
  const [domain, setDomain] = useState<DomainData | null>(null)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    fetch('/api/dashboard/domain')
      .then(r => r.json())
      .then(d => {
        setPlan(d.plan ?? '')
        setDomain(d.domain ?? null)
      })
      .finally(() => setLoading(false))
  }, [])

  async function handleSave() {
    setError('')
    setSuccess('')
    setSaving(true)
    const res = await fetch('/api/dashboard/domain', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ domain: input.trim().toLowerCase().replace(/^https?:\/\//, '') }),
    })
    const data = await res.json()
    if (!res.ok) {
      setError(data.error ?? 'Error al guardar')
    } else {
      setDomain(data.domain)
      setInput('')
      setSuccess('Dominio guardado. Pendiente verificación.')
    }
    setSaving(false)
  }

  async function handleDelete() {
    if (!domain) return
    setDeleting(true)
    await fetch('/api/dashboard/domain', { method: 'DELETE' })
    setDomain(null)
    setDeleting(false)
  }

  if (loading) return <div className="p-6 text-sm text-muted-foreground">Cargando...</div>

  if (plan !== 'PREMIUM') {
    return (
      <div className="p-6 max-w-lg">
        <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-5 text-sm text-yellow-700 dark:text-yellow-300">
          <p className="font-semibold mb-1">Plan Premium requerido</p>
          <p>El dominio personalizado está disponible solo para planes Premium.</p>
          <a href="/dashboard/plan" className="mt-3 inline-block text-yellow-700 dark:text-yellow-300 underline font-medium">
            Ver planes →
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Globe className="size-5" /> Dominio personalizado
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Mostrá tu perfil desde tu propio dominio, como <code>www.miempresa.com</code>.
        </p>
      </div>

      {domain ? (
        <div className="rounded-xl border p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-medium">
              {domain.verified
                ? <CheckCircle className="size-4 text-green-500" />
                : <Clock className="size-4 text-yellow-500" />}
              <span>{domain.domain}</span>
            </div>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              domain.verified
                ? 'bg-green-500/15 text-green-700 dark:text-green-400'
                : 'bg-yellow-500/15 text-yellow-700 dark:text-yellow-400'
            }`}>
              {domain.verified ? 'Verificado' : 'Pendiente'}
            </span>
          </div>

          {!domain.verified && (
            <div className="rounded-lg bg-muted/60 p-4 text-xs space-y-2">
              <p className="font-semibold">Configurá el DNS de tu dominio:</p>
              <p>Agregá un registro CNAME apuntando a <code className="font-bold">cname.vercel-dns.com</code></p>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    <th className="pb-1 pr-4">Tipo</th>
                    <th className="pb-1 pr-4">Nombre</th>
                    <th className="pb-1">Valor</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="pt-1 pr-4 font-mono">CNAME</td>
                    <td className="pt-1 pr-4 font-mono">www (o @)</td>
                    <td className="pt-1 font-mono">cname.vercel-dns.com</td>
                  </tr>
                </tbody>
              </table>
              <p className="text-muted-foreground">
                Los cambios DNS pueden tardar hasta 48h en propagarse. Una vez configurado, notificanos para verificar.
              </p>
            </div>
          )}

          {domain.verified && (
            <a
              href={`https://${domain.domain}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
            >
              Visitar <ExternalLink className="size-3" />
            </a>
          )}

          <button
            onClick={handleDelete}
            disabled={deleting}
            className="text-xs text-destructive hover:underline disabled:opacity-50"
          >
            {deleting ? 'Eliminando...' : 'Eliminar dominio'}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <label className="text-sm font-medium">Tu dominio</label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="www.miempresa.com"
              value={input}
              onChange={e => setInput(e.target.value)}
              className="flex-1 rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              onClick={handleSave}
              disabled={saving || !input.trim()}
              className="rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium disabled:opacity-50"
            >
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
          {error && (
            <p className="flex items-center gap-1 text-xs text-destructive">
              <AlertCircle className="size-3" /> {error}
            </p>
          )}
          {success && (
            <p className="flex items-center gap-1 text-xs text-green-600">
              <CheckCircle className="size-3" /> {success}
            </p>
          )}
        </div>
      )}

      <div className="rounded-xl border p-4 text-xs text-muted-foreground space-y-1">
        <p className="font-medium text-foreground">¿Cómo funciona?</p>
        <ol className="list-decimal list-inside space-y-1">
          <li>Ingresá tu dominio (ej: <code>www.miempresa.com</code>)</li>
          <li>Configurá el DNS con el registro CNAME indicado</li>
          <li>Nuestro equipo verifica y activa el dominio</li>
          <li>Tu perfil queda accesible desde tu propio dominio</li>
        </ol>
      </div>
    </div>
  )
}
