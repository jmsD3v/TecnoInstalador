import { Navbar } from '@/components/layout/navbar'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export default async function PrivacidadPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={user} />
      <div className="container mx-auto px-4 py-12 max-w-3xl prose dark:prose-invert">
        <h1>Política de Privacidad</h1>
        <p className="text-muted-foreground">Última actualización: {new Date().toLocaleDateString('es-AR')}</p>
        <p>TecnoInstalador respeta tu privacidad. Este documento se actualizará con el contenido completo.</p>
        <h2>Datos que recopilamos</h2>
        <p>Nombre, email, ciudad, teléfono de contacto. Nunca vendemos tus datos a terceros.</p>
        <h2>Almacenamiento</h2>
        <p>Datos almacenados en Supabase (infraestructura en AWS). Las imágenes en Supabase Storage.</p>
        <h2>Contacto</h2>
        <p>Para ejercer derechos ARCO: <a href="mailto:privacidad@tecnoinstalador.com">privacidad@tecnoinstalador.com</a></p>
      </div>
    </div>
  )
}
