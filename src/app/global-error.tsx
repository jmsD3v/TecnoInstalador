'use client'

import * as Sentry from '@sentry/nextjs'
import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <html lang="es">
      <body className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="text-center space-y-4 max-w-md">
          <p className="text-4xl">⚠️</p>
          <h1 className="text-xl font-bold text-slate-100">Algo salió mal</h1>
          <p className="text-slate-400 text-sm">
            Ocurrió un error inesperado. El equipo fue notificado automáticamente.
          </p>
          <button
            onClick={reset}
            className="px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-400 text-white text-sm font-semibold transition-colors"
          >
            Reintentar
          </button>
        </div>
      </body>
    </html>
  )
}
