'use client'

import { useState } from 'react'
import { Copy, Check, Code2 } from 'lucide-react'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://tecnoinstalador.net'

export function WidgetEmbedClient({ slug }: { slug: string }) {
  const [copied, setCopied] = useState(false)

  const iframeCode = `<iframe src="${APP_URL}/widget/${slug}" width="320" height="420" frameborder="0" style="border-radius:12px;box-shadow:0 2px 12px rgba(0,0,0,.12);" title="Mis reseñas"></iframe>`

  async function copy() {
    await navigator.clipboard.writeText(iframeCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="p-6 max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Code2 className="size-5" /> Widget de reseñas
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Incrustá tus reseñas en tu propio sitio web con este código.
        </p>
      </div>

      {/* Preview */}
      <div className="rounded-xl border overflow-hidden">
        <iframe
          src={`/widget/${slug}`}
          width="100%"
          height="380"
          frameBorder="0"
          title="Preview widget"
          className="block"
        />
      </div>

      {/* Embed code */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Código para tu sitio</label>
        <div className="relative">
          <pre className="bg-muted rounded-lg p-4 text-xs overflow-x-auto pr-12 whitespace-pre-wrap break-all">
            {iframeCode}
          </pre>
          <button
            onClick={copy}
            className="absolute top-2 right-2 p-1.5 rounded-lg hover:bg-background transition-colors"
          >
            {copied
              ? <Check className="size-4 text-green-500" />
              : <Copy className="size-4 text-muted-foreground" />
            }
          </button>
        </div>
      </div>

      {/* Instructions */}
      <div className="rounded-xl border p-4 text-xs text-muted-foreground space-y-1">
        <p className="font-medium text-foreground">¿Cómo usarlo?</p>
        <ol className="list-decimal list-inside space-y-0.5">
          <li>Copiá el código de arriba</li>
          <li>Pegalo en el HTML de tu sitio donde quieras que aparezcan tus reseñas</li>
          <li>El widget se actualiza automáticamente cuando recibís nuevas reseñas</li>
        </ol>
      </div>
    </div>
  )
}
