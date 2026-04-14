import Link from 'next/link'
import { Home, Search } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <p className="text-8xl font-black text-primary/20 leading-none mb-4">404</p>
        <h1 className="text-2xl font-extrabold mb-2">Página no encontrada</h1>
        <p className="text-muted-foreground mb-8">
          La página que buscás no existe o fue movida.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors"
          >
            <Home className="w-4 h-4" />
            Ir al inicio
          </Link>
          <Link
            href="/buscar"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg border border-border text-foreground font-semibold text-sm hover:bg-accent transition-colors"
          >
            <Search className="w-4 h-4" />
            Buscar instaladores
          </Link>
        </div>
        <p className="text-xs text-muted-foreground/50 mt-8">TecnoInstalador</p>
      </div>
    </div>
  )
}
