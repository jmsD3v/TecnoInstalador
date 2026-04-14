import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

interface NewReviewEmailParams {
  installerName: string
  installerEmail: string
  reviewerName: string | null
  rating: number
  comment: string | null
  profileUrl: string
}

export async function sendNewReviewEmail(params: NewReviewEmailParams) {
  const { installerName, installerEmail, reviewerName, rating, comment, profileUrl } = params

  const stars = '★'.repeat(rating) + '☆'.repeat(5 - rating)
  const ratingLabels = ['', 'Muy malo', 'Malo', 'Regular', 'Bueno', 'Excelente']
  const ratingLabel = ratingLabels[rating] ?? ''
  const year = new Date().getFullYear()

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Nueva reseña en TecnoInstalador</title>
</head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f1f5f9;padding:40px 16px;">
  <tr>
    <td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#1d4ed8 0%,#1e40af 100%);border-radius:16px 16px 0 0;padding:32px 40px;text-align:center;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td align="center" style="padding-bottom:16px;">
                  <table cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="background:rgba(255,255,255,0.15);border-radius:12px;padding:10px 14px;">
                        <span style="font-size:22px;font-weight:900;color:#ffffff;letter-spacing:-0.5px;">Tecno<span style="color:#93c5fd;">Instalador</span></span>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="padding:8px 0 4px;">
                  <div style="display:inline-block;background:rgba(255,255,255,0.2);border-radius:100px;padding:6px 16px;">
                    <span style="font-size:13px;font-weight:600;color:#dbeafe;letter-spacing:0.5px;text-transform:uppercase;">Nueva reseña recibida</span>
                  </div>
                </td>
              </tr>
              <tr>
                <td style="padding-top:12px;">
                  <p style="margin:0;font-size:28px;font-weight:800;color:#ffffff;line-height:1.2;">¡Tenés una nueva reseña!</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="background:#ffffff;padding:32px 40px;">

            <p style="margin:0 0 24px;font-size:16px;color:#334155;line-height:1.6;">
              Hola <strong style="color:#1e293b;">${installerName}</strong>, alguien acaba de dejar una reseña sobre tu trabajo en TecnoInstalador.
            </p>

            <!-- Review card -->
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:2px solid #e2e8f0;border-radius:12px;margin-bottom:24px;">
              <tr>
                <td style="padding:24px;">

                  <!-- Stars + label -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:12px;">
                    <tr>
                      <td>
                        <span style="font-size:28px;letter-spacing:2px;color:#f59e0b;">${stars}</span>
                      </td>
                      <td align="right" style="vertical-align:middle;">
                        <span style="display:inline-block;background:#1d4ed8;color:#ffffff;font-size:12px;font-weight:700;padding:4px 10px;border-radius:100px;">${ratingLabel}</span>
                      </td>
                    </tr>
                  </table>

                  <div style="height:1px;background:#e2e8f0;margin-bottom:16px;"></div>

                  <p style="margin:0 0 4px;font-size:12px;font-weight:600;color:#94a3b8;text-transform:uppercase;letter-spacing:0.5px;">De</p>
                  <p style="margin:0 0 ${comment ? '16px' : '0'};font-size:16px;font-weight:700;color:#1e293b;">${reviewerName ?? 'Cliente anónimo'}</p>

                  ${comment ? `
                  <p style="margin:0 0 4px;font-size:12px;font-weight:600;color:#94a3b8;text-transform:uppercase;letter-spacing:0.5px;">Comentario</p>
                  <p style="margin:0;font-size:15px;color:#334155;line-height:1.7;font-style:italic;">&ldquo;${comment}&rdquo;</p>
                  ` : ''}

                </td>
              </tr>
            </table>

            <!-- CTA -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
              <tr>
                <td align="center">
                  <a href="${profileUrl}" style="display:inline-block;background:linear-gradient(135deg,#1d4ed8 0%,#1e40af 100%);color:#ffffff;font-size:15px;font-weight:700;padding:14px 32px;border-radius:10px;text-decoration:none;letter-spacing:0.2px;">Ver mi perfil público &rarr;</a>
                </td>
              </tr>
            </table>

            <!-- Tip -->
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:10px;padding:16px 20px;">
                  <p style="margin:0;font-size:13px;color:#1e40af;line-height:1.6;">
                    <strong>&#128161; Tip:</strong> Compartí el link de tu perfil en tus redes para conseguir más reseñas y subir en las búsquedas.
                  </p>
                </td>
              </tr>
            </table>

          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f8fafc;border-top:1px solid #e2e8f0;border-radius:0 0 16px 16px;padding:24px 40px;text-align:center;">
            <p style="margin:0 0 8px;font-size:12px;color:#94a3b8;line-height:1.6;">
              Recibís este email porque tenés una cuenta de instalador en TecnoInstalador.
            </p>
            <p style="margin:0;font-size:11px;color:#cbd5e1;">
              &copy; ${year} TecnoInstalador &mdash; Desarrollado desde Las Bre&ntilde;as con &#128156;
            </p>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>

</body>
</html>`

  return resend.emails.send({
    from: process.env.RESEND_FROM!,
    to: installerEmail,
    subject: `⭐ ${reviewerName ?? 'Alguien'} te dejó ${rating} estrella${rating === 1 ? '' : 's'} en TecnoInstalador`,
    html,
  })
}
