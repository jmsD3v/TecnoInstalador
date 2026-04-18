import { Navbar } from '@/components/layout/navbar'
import { SiteFooter } from '@/components/layout/site-footer'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export const metadata = {
  title: 'Política de Privacidad – TecnoInstalador',
  description: 'Política de privacidad y tratamiento de datos personales de TecnoInstalador.',
}

export default async function PrivacidadPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar user={user} />
      <div className="flex-1 container mx-auto px-4 py-12 max-w-3xl">
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <h1 className="text-3xl font-extrabold mb-2">Política de Privacidad</h1>
          <p className="text-muted-foreground text-sm mb-8">Última actualización: abril de 2025</p>

          <h2>1. Responsable del tratamiento</h2>
          <p>
            TecnoInstalador (en adelante, "la plataforma") es responsable del tratamiento de los datos personales de sus usuarios, en cumplimiento de la Ley N° 25.326 de Protección de Datos Personales de la República Argentina y sus normas reglamentarias.
          </p>

          <h2>2. Datos que recopilamos</h2>
          <p>Recopilamos los siguientes datos cuando te registrás o usás la plataforma:</p>
          <ul>
            <li><strong>Datos de registro:</strong> nombre, apellido, dirección de correo electrónico.</li>
            <li><strong>Datos de perfil (instaladores):</strong> nombre comercial, título profesional, descripción, ciudad, provincia, teléfono, número de WhatsApp, foto de perfil e imagen de portada.</li>
            <li><strong>Datos de uso:</strong> páginas visitadas, búsquedas realizadas, vistas de perfil (solo estadísticas agregadas).</li>
            <li><strong>Datos de pago:</strong> las transacciones son procesadas íntegramente por MercadoPago. TecnoInstalador no almacena datos de tarjetas ni información bancaria.</li>
          </ul>

          <h2>3. Finalidad del tratamiento</h2>
          <p>Utilizamos tus datos para:</p>
          <ul>
            <li>Gestionar tu cuenta y brindarte acceso a las funciones de la plataforma.</li>
            <li>Mostrar tu perfil en los resultados de búsqueda pública.</li>
            <li>Procesar pagos y gestionar suscripciones.</li>
            <li>Enviarte notificaciones relacionadas con tu cuenta (reseñas, vencimiento de suscripción, cambios en los términos).</li>
            <li>Mejorar la plataforma mediante análisis de uso agregado y anónimo.</li>
          </ul>

          <h2>4. Bases legales del tratamiento</h2>
          <p>
            El tratamiento de tus datos se basa en: (a) la ejecución del contrato de uso de la plataforma; (b) tu consentimiento explícito otorgado al registrarte; y (c) el cumplimiento de obligaciones legales aplicables.
          </p>

          <h2>5. Compartición de datos</h2>
          <p>No vendemos, alquilamos ni cedemos tus datos personales a terceros con fines comerciales. Podemos compartir información con:</p>
          <ul>
            <li><strong>Proveedores de infraestructura:</strong> Supabase (base de datos y almacenamiento de archivos, infraestructura AWS) y Vercel (hosting). Ambos cuentan con medidas de seguridad adecuadas.</li>
            <li><strong>MercadoPago:</strong> para el procesamiento de pagos, según sus propias políticas de privacidad.</li>
            <li><strong>Autoridades públicas:</strong> cuando sea requerido por ley o por resolución judicial.</li>
          </ul>

          <h2>6. Datos públicos de instaladores</h2>
          <p>
            El perfil de los instaladores (nombre, foto, oficio, ciudad, descripción, reseñas) es público y visible en los resultados de búsqueda, incluso para usuarios no registrados. Al completar tu perfil aceptás que esta información sea pública. Podés desactivar tu perfil en cualquier momento desde el panel de control.
          </p>

          <h2>7. Conservación de datos</h2>
          <p>
            Conservamos tus datos mientras mantengas tu cuenta activa. Al eliminar tu cuenta, todos tus datos personales serán borrados de nuestros sistemas en un plazo máximo de 30 días, salvo obligación legal de conservación.
          </p>

          <h2>8. Seguridad</h2>
          <p>
            Implementamos medidas técnicas y organizativas adecuadas para proteger tus datos frente a accesos no autorizados, pérdida o alteración. Las contraseñas se almacenan con hashing seguro. Las comunicaciones utilizan cifrado TLS/HTTPS.
          </p>

          <h2>9. Tus derechos (ARCO)</h2>
          <p>En virtud de la Ley 25.326 tenés derecho a:</p>
          <ul>
            <li><strong>Acceso:</strong> solicitar qué datos personales tenemos sobre vos.</li>
            <li><strong>Rectificación:</strong> corregir datos inexactos o incompletos.</li>
            <li><strong>Cancelación:</strong> solicitar la eliminación de tus datos.</li>
            <li><strong>Oposición:</strong> oponerte al tratamiento de tus datos en determinados supuestos.</li>
          </ul>
          <p>
            Para ejercer estos derechos escribí a: <a href="mailto:privacidad@tecnoinstalador.net">privacidad@tecnoinstalador.net</a>. Responderemos en un plazo máximo de 30 días hábiles.
          </p>
          <p>
            También podés presentar una reclamación ante la Agencia de Acceso a la Información Pública (AAIP), autoridad de control en Argentina.
          </p>

          <h2>10. Cookies</h2>
          <p>
            La plataforma utiliza cookies de sesión estrictamente necesarias para el funcionamiento del inicio de sesión y la seguridad. No utilizamos cookies de publicidad ni de seguimiento de terceros.
          </p>

          <h2>11. Cambios en esta política</h2>
          <p>
            Podemos actualizar esta política periódicamente. Te notificaremos los cambios relevantes por correo electrónico o mediante un aviso en la plataforma. El uso continuado de TecnoInstalador tras la notificación implica la aceptación de la política actualizada.
          </p>

          <h2>12. Contacto</h2>
          <p>
            Para cualquier consulta sobre privacidad: <a href="mailto:privacidad@tecnoinstalador.net">privacidad@tecnoinstalador.net</a>
          </p>
        </div>
      </div>
      <SiteFooter />
    </div>
  )
}
