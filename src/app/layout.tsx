import type { Metadata, Viewport } from "next"
import localFont from "next/font/local"
import { headers } from "next/headers"
import "./globals.css"
import { ToastContextProvider } from "@/components/ui/toast"
import { ThemeProvider } from "@/components/theme/theme-provider"

const monaspaceKrypton = localFont({
  src: [
    { path: './fonts/MonaspaceKrypton-Regular.woff2', weight: '400', style: 'normal' },
    { path: './fonts/MonaspaceKrypton-Medium.woff2',  weight: '500', style: 'normal' },
    { path: './fonts/MonaspaceKrypton-Bold.woff2',    weight: '700', style: 'normal' },
  ],
  variable: '--font-krypton',
  display: 'swap',
})

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://tecnoinstalador.com'

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: "TecnoInstalador – Electricistas, Plomeros y Técnicos en Argentina",
    template: "%s | TecnoInstalador",
  },
  description:
    "Encontrá electricistas, plomeros, gasistas, técnicos en aire acondicionado y más de 30 oficios en tu ciudad. Perfiles verificados, reseñas reales y contacto directo por WhatsApp.",
  keywords: [
    "electricista", "plomero", "gasista", "técnico", "instalador",
    "electricista cerca", "plomero urgente", "gasista matriculado",
    "técnico aire acondicionado", "carpintero", "pintor",
    "instalador solar", "técnico heladera", "electricista Argentina",
    "contratar electricista", "servicio técnico domicilio",
    "TecnoInstalador",
  ],
  authors: [{ name: "TecnoInstalador", url: APP_URL }],
  creator: "TecnoInstalador",
  publisher: "TecnoInstalador",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "TecnoInstalador",
  },
  formatDetection: { telephone: false },
  openGraph: {
    type: "website",
    locale: "es_AR",
    siteName: "TecnoInstalador",
    title: "TecnoInstalador – Electricistas, Plomeros y Técnicos en Argentina",
    description: "Encontrá profesionales verificados cerca tuyo. Más de 30 oficios, reseñas reales y contacto directo por WhatsApp.",
    url: APP_URL,
    images: [{ url: "/og-default.png", width: 1200, height: 630, alt: "TecnoInstalador" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "TecnoInstalador – Electricistas, Plomeros y Técnicos en Argentina",
    description: "Encontrá profesionales verificados cerca tuyo. Más de 30 oficios en toda Argentina.",
    images: ["/og-default.png"],
  },
  alternates: { canonical: APP_URL },
}

export const viewport: Viewport = {
  themeColor: "#f97316",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // Read nonce injected by proxy.ts middleware — needed for CSP compliance
  const nonce = (await headers()).get('x-nonce') ?? undefined

  return (
    <html lang="es" suppressHydrationWarning className={monaspaceKrypton.variable}>
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        {/* Script anti-flash: aplica el tema guardado antes de que React hidrate.
            nonce= required for Content-Security-Policy (no unsafe-inline in script-src) */}
        <script nonce={nonce} dangerouslySetInnerHTML={{ __html:
          `(function(){var t=localStorage.getItem('theme')||'dark';` +
          `document.documentElement.classList.add(t==='dark'?'dark':'light')})()`
        }} />
      </head>
      <body className="antialiased bg-background text-foreground">
        <ThemeProvider>
          <ToastContextProvider>
            {children}
          </ToastContextProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
