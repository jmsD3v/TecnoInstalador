'use client'

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input, FormField, Textarea } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/components/ui/toast"
import { COLOR_PALETTES, ColorPalette } from "@/types"
import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

export default function ProfilePage() {
  const supabase = createClient()
  const toast = useToast()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState({
    nombre: '',
    apellido: '',
    nombre_comercial: '',
    descripcion: '',
    ciudad: '',
    provincia: '',
    pais: 'Argentina',
    telefono: '',
    whatsapp: '',
    color_palette: 'azul' as ColorPalette,
  })

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('installers')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (data) {
        setForm({
          nombre: data.nombre ?? '',
          apellido: data.apellido ?? '',
          nombre_comercial: data.nombre_comercial ?? '',
          descripcion: data.descripcion ?? '',
          ciudad: data.ciudad ?? '',
          provincia: data.provincia ?? '',
          pais: data.pais ?? 'Argentina',
          telefono: data.telefono ?? '',
          whatsapp: data.whatsapp ?? '',
          color_palette: data.color_palette ?? 'azul',
        })
      }
      setLoading(false)
    }
    load()
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase
      .from('installers')
      .update({ ...form, updated_at: new Date().toISOString() })
      .eq('user_id', user.id)

    if (error) {
      toast({ title: 'Error al guardar', description: error.message, variant: 'error' })
    } else {
      toast({ title: 'Perfil actualizado', variant: 'success' })
    }
    setSaving(false)
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Mi perfil</h1>
        <p className="text-muted-foreground text-sm mt-1">Información que verán tus clientes</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Información personal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Nombre" required>
                <Input value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} required />
              </FormField>
              <FormField label="Apellido" required>
                <Input value={form.apellido} onChange={e => setForm(f => ({ ...f, apellido: e.target.value }))} required />
              </FormField>
            </div>
            <FormField label="Nombre comercial" hint="Nombre que aparecerá en tu perfil público (opcional)">
              <Input
                placeholder="Ej: Electricidad Martínez"
                value={form.nombre_comercial}
                onChange={e => setForm(f => ({ ...f, nombre_comercial: e.target.value }))}
              />
            </FormField>
            <FormField label="Descripción" hint="Contá quién sos y qué hacés">
              <Textarea
                placeholder="Soy electricista matriculado con 10 años de experiencia..."
                value={form.descripcion}
                onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))}
                className="min-h-[100px]"
              />
            </FormField>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Ubicación</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField label="Ciudad" required>
              <Input value={form.ciudad} onChange={e => setForm(f => ({ ...f, ciudad: e.target.value }))} required />
            </FormField>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Provincia" required>
                <Input value={form.provincia} onChange={e => setForm(f => ({ ...f, provincia: e.target.value }))} required />
              </FormField>
              <FormField label="País">
                <Input value={form.pais} onChange={e => setForm(f => ({ ...f, pais: e.target.value }))} />
              </FormField>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Contacto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField label="Teléfono">
              <Input placeholder="011 1234-5678" value={form.telefono} onChange={e => setForm(f => ({ ...f, telefono: e.target.value }))} />
            </FormField>
            <FormField label="WhatsApp" required hint="Número internacional sin + ni espacios: 5491112345678">
              <Input
                placeholder="5491112345678"
                value={form.whatsapp}
                onChange={e => setForm(f => ({ ...f, whatsapp: e.target.value }))}
                required
              />
            </FormField>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Paleta de colores</CardTitle>
            <CardDescription>Define el aspecto visual de tu perfil público</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {(Object.entries(COLOR_PALETTES) as [ColorPalette, typeof COLOR_PALETTES[ColorPalette]][]).map(([key, palette]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, color_palette: key }))}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left",
                    form.color_palette === key
                      ? "border-primary shadow-sm"
                      : "border-border hover:border-muted-foreground/30"
                  )}
                >
                  <div
                    className="w-8 h-8 rounded-lg shrink-0"
                    style={{ background: palette.primary }}
                  />
                  <span className="text-sm font-medium">{palette.label}</span>
                  {form.color_palette === key && (
                    <Check className="w-4 h-4 text-primary ml-auto" />
                  )}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Button type="submit" loading={saving} className="w-full">
          Guardar cambios
        </Button>
      </form>
    </div>
  )
}
