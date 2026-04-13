import { Navbar } from '@/components/layout/navbar'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export default async function TerminosPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={user} />
      <div className="container mx-auto px-4 py-12 max-w-3xl prose dark:prose-invert">
        <h1>Términos y Condiciones</h1>
        <p className="text-muted-foreground">Última actualización: {new Date().toLocaleDateString('es-AR')}</p>
        <p>Al usar TecnoInstalador aceptás estos términos. Este documento se actualizará próximamente con el contenido legal completo.</p>
        <h2>Uso de la plataforma</h2>
        <p>TecnoInstalador conecta profesionales del oficio con clientes. Los instaladores son responsables de la veracidad de su información.</p>
        <h2>Suscripciones</h2>
        <p>Los pagos son procesados por MercadoPago. Las suscripciones se renuevan automáticamente y pueden cancelarse en cualquier momento.</p>
        <h2>Contacto</h2>
        <p>Para consultas: <a href="mailto:hola@tecnoinstalador.com">hola@tecnoinstalador.com</a></p>
      </div>
    </div>
  )
}
