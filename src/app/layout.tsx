import type { Metadata, Viewport } from "next"
import localFont from "next/font/local"
import "./globals.css"
import { ToastContextProvider } from "@/components/ui/toast"
import { ThemeProvider } from "@/components/theme/theme-provider"

//Monaspace Krypton — descargá desde https://monaspace.githubnext.com/
//Ponés los .woff2 en src/app/fonts/ y descomentás esta sección:

const monaspaceKrypton = localFont({
  src: [
    { path: './fonts/MonaspaceKrypton-Regular.woff2', weight: '400', style: 'normal' },
    { path: './fonts/MonaspaceKrypton-Medium.woff2',  weight: '500', style: 'normal' },
    { path: './fonts/MonaspaceKrypton-Bold.woff2',    weight: '700', style: 'normal' },
  ],
  variable: '--font-krypton',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: "TecnoInstalador – Encontrá al profesional ideal",
    template: "%s | TecnoInstalador",
  },
  description:
    "TecnoInstalador conecta a electricistas, plomeros, gasistas, técnicos y más con clientes que necesitan sus servicios.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "TecnoInstalador",
  },
  formatDetection: { telephone: false },
  openGraph: {
    type: "website",
    siteName: "TecnoInstalador",
    title: "TecnoInstalador – Encontrá al profesional ideal",
    description: "Conectamos instaladores y técnicos con clientes en toda Argentina.",
  },
}

export const viewport: Viewport = {
  themeColor: "#f97316",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" suppressHydrationWarning className={monaspaceKrypton.variable}>
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        {/* Script anti-flash: aplica el tema guardado antes de que React hidrate */}
        <script dangerouslySetInnerHTML={{ __html:
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
