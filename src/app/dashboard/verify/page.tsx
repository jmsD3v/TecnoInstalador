'use client'

import { useState, useRef } from 'react'
import { BadgeCheck, Upload, FileText, CheckCircle2, Clock, XCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/input'
import { useRouter } from 'next/navigation'

type VerificationStatus = 'none' | 'pending' | 'approved' | 'rejected'

interface PageProps {
  searchParams: Promise<{ status?: string; note?: string }>
}

export default function VerifyPage({ searchParams }: PageProps) {
  // Status is passed from server component wrapper — read via props
  // But this is a client component, so we fetch status client-side
  return <VerifyContent />
}

function VerifyContent() {
  const [files, setFiles] = useState<File[]>([])
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetchedStatus, setFetchedStatus] = useState<{
    loaded: boolean
    status: VerificationStatus
    adminNote?: string | null
    createdAt?: string
  }>({ loaded: false, status: 'none' })
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  // Fetch status on mount
  useState(() => {
    fetch('/api/dashboard/verify')
      .then(r => r.json())
      .then(data => setFetchedStatus({ loaded: true, ...data }))
      .catch(() => setFetchedStatus({ loaded: true, status: 'none' }))
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? [])
    setFiles(prev => [...prev, ...selected].slice(0, 5))
  }

  const removeFile = (idx: number) => setFiles(prev => prev.filter((_, i) => i !== idx))

  const handleSubmit = async () => {
    if (files.length === 0) return
    setLoading(true)

    const formData = new FormData()
    files.forEach(f => formData.append('files', f))
    if (note.trim()) formData.append('note', note.trim())

    const res = await fetch('/api/dashboard/verify', {
      method: 'POST',
      body: formData,
    })

    if (res.ok) {
      router.refresh()
      setFetchedStatus({ loaded: true, status: 'pending' })
      setFiles([])
      setNote('')
    } else {
      const data = await res.json().catch(() => ({}))
      alert(data.error ?? 'Error al enviar la solicitud')
    }
    setLoading(false)
  }

  if (!fetchedStatus.loaded) {
    return (
      <div className="max-w-xl mx-auto py-12 text-center text-muted-foreground">
        Cargando…
      </div>
    )
  }

  const { status, adminNote } = fetchedStatus

  return (
    <div className="max-w-xl mx-auto py-8 px-4 space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BadgeCheck className="w-6 h-6 text-sky-500" />
          Verificación profesional
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Verificá tu identidad para obtener la insignia ✅ en tu perfil público y aumentar la confianza de los clientes.
        </p>
      </div>

      {/* Status banner */}
      {status === 'approved' && (
        <div className="flex items-start gap-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-xl p-4">
          <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-green-800 dark:text-green-300">¡Cuenta verificada!</p>
            <p className="text-sm text-green-700 dark:text-green-400">Tu perfil ya muestra la insignia de profesional verificado.</p>
          </div>
        </div>
      )}

      {status === 'pending' && (
        <div className="flex items-start gap-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
          <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-amber-800 dark:text-amber-300">Solicitud en revisión</p>
            <p className="text-sm text-amber-700 dark:text-amber-400">Revisaremos tu documentación en 1-2 días hábiles y te notificaremos por email.</p>
          </div>
        </div>
      )}

      {status === 'rejected' && (
        <div className="flex items-start gap-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl p-4">
          <XCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-red-800 dark:text-red-300">Verificación no aprobada</p>
            {adminNote && <p className="text-sm text-red-700 dark:text-red-400 mt-1"><strong>Motivo:</strong> {adminNote}</p>}
            <p className="text-sm text-red-700 dark:text-red-400 mt-1">Podés reenviar la documentación correcta a continuación.</p>
          </div>
        </div>
      )}

      {/* Upload form — show when none or rejected */}
      {(status === 'none' || status === 'rejected') && (
        <div className="border border-border rounded-xl p-5 space-y-4">
          <div>
            <p className="font-semibold text-sm mb-2">Documentación requerida</p>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>DNI frente y dorso (foto o PDF)</li>
              <li>Matrícula o certificación profesional (si aplica)</li>
            </ul>
          </div>

          {/* Drop zone */}
          <div
            className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              Hacé clic para seleccionar archivos
            </p>
            <p className="text-xs text-muted-foreground mt-1">JPG, PNG, WebP o PDF — máx. 10 MB por archivo</p>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp,application/pdf"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          {/* Selected files */}
          {files.length > 0 && (
            <ul className="space-y-2">
              {files.map((f, i) => (
                <li key={i} className="flex items-center justify-between bg-muted rounded-lg px-3 py-2 text-sm">
                  <span className="flex items-center gap-2 truncate">
                    <FileText className="w-4 h-4 shrink-0 text-muted-foreground" />
                    <span className="truncate">{f.name}</span>
                  </span>
                  <button
                    onClick={() => removeFile(i)}
                    className="ml-2 text-muted-foreground hover:text-destructive transition-colors shrink-0"
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          )}

          {/* Optional note */}
          <div>
            <label className="text-sm font-medium">Nota adicional <span className="text-muted-foreground font-normal">(opcional)</span></label>
            <Textarea
              className="mt-1.5"
              rows={2}
              placeholder="Ej: adjunto matrícula de electricista habilitado N° 12345"
              value={note}
              onChange={e => setNote(e.target.value)}
            />
          </div>

          <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/50 rounded-lg p-3">
            <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            Tus documentos se almacenan de forma segura y privada. Solo el equipo de TecnoInstalador puede acceder a ellos.
          </div>

          <Button
            onClick={handleSubmit}
            disabled={files.length === 0 || loading}
            className="w-full"
          >
            {loading ? 'Enviando…' : 'Enviar solicitud de verificación'}
          </Button>
        </div>
      )}
    </div>
  )
}
