'use client'

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Wrench } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input, FormField } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/components/ui/toast"
import { slugify } from "@/lib/utils"
import { GoogleAuthButton } from "@/components/auth/google-button"

export default function RegisterPage() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const router = useRouter()
  const toast = useToast()
  const supabase = createClient()

  // Step 1: auth
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [signedUpUserId, setSignedUpUserId] = useState<string | null>(null)

  // Step 2: profile
  const [nombre, setNombre] = useState("")
  const [apellido, setApellido] = useState("")
  const [ciudad, setCiudad] = useState("")
  const [provincia, setProvincia] = useState("")
  const [whatsapp, setWhatsapp] = useState("")

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    setLoading(true)

    const { data, error } = await supabase.auth.signUp({ email, password })

    if (error) {
      setErrors({ email: error.message })
      setLoading(false)
      return
    }

    // Si Supabase devuelve sesión inmediata (email confirm desactivado)
    // o solo el user (confirm activado pero lo guardamos para paso 2)
    const userId = data.session?.user?.id ?? data.user?.id
    if (!userId) {
      setErrors({ email: 'No se pudo crear la cuenta. Verificá que el email no esté registrado.' })
      setLoading(false)
      return
    }

    setSignedUpUserId(userId)
    setLoading(false)
    setStep(2)
  }

  const handleCreateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    setLoading(true)

    // Preferimos el user de la sesión activa; fallback al guardado en paso 1
    const { data: { user: sessionUser } } = await supabase.auth.getUser()
    const userId = sessionUser?.id ?? signedUpUserId
    if (!userId) {
      setErrors({ general: 'Sesión expirada. Por favor registrate de nuevo.' })
      setLoading(false)
      return
    }

    // Generate unique slug
    const baseSlug = slugify(`${nombre} ${apellido}`)
    const randomSuffix = Math.floor(Math.random() * 9000 + 1000)
    const url_slug = `${baseSlug}-${randomSuffix}`

    const { error } = await supabase.from('installers').insert({
      user_id: userId,
      nombre,
      apellido,
      ciudad,
      provincia,
      pais: 'Argentina',
      whatsapp: whatsapp.replace(/\D/g, ''),
      url_slug,
      plan: 'FREE',
      is_active: true,
      color_palette: 'azul',
      dominio_personalizado_activo: false,
      total_reviews: 0,
      avg_rating: 0,
    })

    if (error) {
      // El error más común acá es RLS: no hay sesión activa (email confirm habilitado)
      const msg = error.code === '42501' || error.message.includes('policy')
        ? 'Necesitás confirmar tu email antes de continuar. Revisá tu bandeja de entrada.'
        : `Error al crear el perfil: ${error.message}`
      setErrors({ general: msg })
      setLoading(false)
      return
    }

    toast({ title: "¡Perfil creado!", description: "Bienvenido a TecnoInstalador", variant: "success" })
    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <Wrench className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl">TecnoInstalador</span>
          </Link>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-6">
          {[1, 2].map(s => (
            <div
              key={s}
              className={`h-1.5 flex-1 rounded-full transition-colors ${s <= step ? 'bg-primary' : 'bg-muted'}`}
            />
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{step === 1 ? 'Crear cuenta' : 'Completá tu perfil'}</CardTitle>
            <CardDescription>
              {step === 1
                ? 'Paso 1 de 2 — Datos de acceso'
                : 'Paso 2 de 2 — Información profesional'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {step === 1 ? (
              <div className="flex flex-col gap-4">
                <GoogleAuthButton label="Registrarse con Google" />

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">o con email</span>
                  </div>
                </div>

                <form onSubmit={handleRegister} className="flex flex-col gap-4">
                <FormField label="Email" required error={errors.email}>
                  <Input
                    type="email"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                  />
                </FormField>
                <FormField label="Contraseña" required hint="Mínimo 6 caracteres">
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </FormField>
                <Button type="submit" loading={loading} className="w-full mt-2">
                  Continuar
                </Button>
                <p className="text-center text-sm text-muted-foreground">
                  ¿Ya tenés cuenta?{" "}
                  <Link href="/auth/login" className="text-primary font-medium hover:underline">
                    Iniciar sesión
                  </Link>
                </p>
                </form>
              </div>
            ) : (
              <form onSubmit={handleCreateProfile} className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-3">
                  <FormField label="Nombre" required>
                    <Input value={nombre} onChange={e => setNombre(e.target.value)} required />
                  </FormField>
                  <FormField label="Apellido" required>
                    <Input value={apellido} onChange={e => setApellido(e.target.value)} required />
                  </FormField>
                </div>
                <FormField label="Ciudad" required>
                  <Input placeholder="Ej: Buenos Aires" value={ciudad} onChange={e => setCiudad(e.target.value)} required />
                </FormField>
                <FormField label="Provincia" required>
                  <Input placeholder="Ej: CABA" value={provincia} onChange={e => setProvincia(e.target.value)} required />
                </FormField>
                <FormField label="WhatsApp" required hint="Formato internacional: 5491112345678">
                  <Input
                    placeholder="5491112345678"
                    value={whatsapp}
                    onChange={e => setWhatsapp(e.target.value)}
                    required
                  />
                </FormField>
                {errors.general && (
                  <p className="text-sm text-red-500">{errors.general}</p>
                )}
                <Button type="submit" loading={loading} className="w-full mt-2">
                  Crear mi perfil
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export const dynamic = 'force-dynamic'
