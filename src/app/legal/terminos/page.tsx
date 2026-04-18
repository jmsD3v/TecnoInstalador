import { Navbar } from '@/components/layout/navbar'
import { SiteFooter } from '@/components/layout/site-footer'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export const metadata = {
  title: 'Términos y Condiciones – TecnoInstalador',
  description: 'Términos y condiciones de uso de la plataforma TecnoInstalador.',
}

export default async function TerminosPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar user={user} />
      <div className="flex-1 container mx-auto px-4 py-12 max-w-3xl">
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <h1 className="text-3xl font-extrabold mb-2">Términos y Condiciones</h1>
          <p className="text-muted-foreground text-sm mb-8">Última actualización: abril de 2025</p>

          <h2>1. Aceptación de los términos</h2>
          <p>
            Al acceder o utilizar TecnoInstalador (en adelante, "la plataforma"), usted acepta estos Términos y Condiciones en su totalidad. Si no está de acuerdo con alguna parte de estos términos, no podrá utilizar la plataforma. TecnoInstalador se reserva el derecho de modificar estos términos en cualquier momento, notificando los cambios a través de la plataforma.
          </p>

          <h2>2. Descripción del servicio</h2>
          <p>
            TecnoInstalador es una plataforma digital que conecta profesionales independientes del sector técnico e instalaciones (electricistas, plomeros, gasistas, técnicos y demás oficios) con personas que requieren sus servicios. La plataforma actúa únicamente como intermediario; no es parte contratante en ningún acuerdo celebrado entre instaladores y clientes.
          </p>

          <h2>3. Registro y cuenta de usuario</h2>
          <p>
            Para utilizar las funciones de instalador debés registrarte con información veraz y actualizada. Sos responsable de mantener la confidencialidad de tu contraseña y de toda la actividad que ocurra bajo tu cuenta. TecnoInstalador no se responsabiliza por accesos no autorizados derivados de negligencia del usuario.
          </p>
          <p>
            Nos reservamos el derecho de suspender o eliminar cuentas que:
          </p>
          <ul>
            <li>Proporcionen información falsa o engañosa.</li>
            <li>Infrinjan estos términos o la legislación argentina vigente.</li>
            <li>Realicen conductas abusivas hacia otros usuarios o hacia la plataforma.</li>
          </ul>

          <h2>4. Responsabilidades del instalador</h2>
          <p>Los profesionales que publican su perfil en TecnoInstalador declaran y garantizan que:</p>
          <ul>
            <li>La información de su perfil (nombre, especialidad, ubicación, contacto) es veraz y está actualizada.</li>
            <li>Cuentan con las habilitaciones, matrículas y seguros que su oficio requiere según la legislación argentina.</li>
            <li>Son responsables de la calidad y seguridad de los trabajos que realizan.</li>
            <li>Las reseñas que soliciten a clientes corresponden a trabajos efectivamente realizados.</li>
          </ul>

          <h2>5. Suscripciones y pagos</h2>
          <p>
            TecnoInstalador ofrece planes de suscripción pagos (Pro y Premium) con funciones adicionales. Los pagos son procesados por MercadoPago, plataforma de pagos habilitada en Argentina. Las suscripciones se renuevan automáticamente al vencer el período contratado (mensual o anual) hasta que el usuario las cancele.
          </p>
          <p>
            La cancelación puede realizarse en cualquier momento desde el panel de control. Al cancelar, el acceso a las funciones premium se mantiene hasta el fin del período ya pagado, sin reembolso por el tiempo no utilizado.
          </p>
          <p>
            Los precios están expresados en pesos argentinos (ARS) e incluyen IVA cuando corresponda. TecnoInstalador se reserva el derecho de modificar los precios con un aviso previo de 30 días.
          </p>

          <h2>6. Contenido del usuario</h2>
          <p>
            Al publicar contenido (fotos, descripciones, datos de contacto) en la plataforma, otorgás a TecnoInstalador una licencia no exclusiva, gratuita y mundial para mostrar dicho contenido en el contexto de la prestación del servicio. No publicarás contenido que sea ilegal, difamatorio, engañoso o que viole derechos de terceros.
          </p>

          <h2>7. Limitación de responsabilidad</h2>
          <p>
            TecnoInstalador no garantiza la calidad, seguridad ni legalidad de los servicios ofrecidos por los instaladores registrados. En ningún caso la plataforma será responsable por daños directos, indirectos, incidentales o consecuentes derivados del uso o la imposibilidad de uso de la plataforma, ni de los trabajos realizados por los profesionales allí registrados.
          </p>

          <h2>8. Propiedad intelectual</h2>
          <p>
            El nombre, logo, diseño y código de TecnoInstalador son propiedad exclusiva de sus desarrolladores. Queda prohibida su reproducción total o parcial sin autorización expresa.
          </p>

          <h2>9. Legislación aplicable</h2>
          <p>
            Estos términos se rigen por las leyes de la República Argentina. Cualquier controversia será sometida a la jurisdicción de los tribunales ordinarios de la Ciudad de Buenos Aires, con renuncia expresa a cualquier otro fuero.
          </p>

          <h2>10. Contacto</h2>
          <p>
            Para consultas relacionadas con estos términos: <a href="mailto:hola@tecnoinstalador.net">hola@tecnoinstalador.net</a>
          </p>
        </div>
      </div>
      <SiteFooter />
    </div>
  )
}
