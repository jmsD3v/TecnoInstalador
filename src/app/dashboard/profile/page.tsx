'use client'

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input, FormField, Textarea } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/components/ui/toast"
import { COLOR_PALETTES, ColorPalette } from "@/types"
import { InstallerAvatar } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { Check, Camera, X } from "lucide-react"

export default function ProfilePage() {
  const supabase = createClient()
  const toast = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const bannerInputRef = useRef<HTMLInputElement>(null)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [uploadingBanner, setUploadingBanner] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [bannerUrl, setBannerUrl] = useState<string | null>(null)
  const [bannerPositionY, setBannerPositionY] = useState(50)
  const [isDragging, setIsDragging] = useState(false)
  const dragStartY = useRef<number>(0)
  const dragStartPos = useRef<number>(50)
  const bannerPreviewRef = useRef<HTMLDivElement>(null)

  const [form, setForm] = useState({
    nombre: '',
    apellido: '',
    nombre_comercial: '',
    titulo_profesional: '',
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
      setUserId(user.id)

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
          titulo_profesional: data.titulo_profesional ?? '',
          descripcion: data.descripcion ?? '',
          ciudad: data.ciudad ?? '',
          provincia: data.provincia ?? '',
          pais: data.pais ?? 'Argentina',
          telefono: data.telefono ?? '',
          whatsapp: data.whatsapp ?? '',
          color_palette: data.color_palette ?? 'azul',
        })
        setPhotoUrl(data.foto_perfil_url ?? null)
        setBannerUrl(data.banner_url ?? null)
        setBannerPositionY(data.banner_position_y ?? 50)
      }
      setLoading(false)
    }
    load()
  }, [])

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !userId) return

    if (file.size > 2 * 1024 * 1024) {
      toast({ title: 'Imagen demasiado grande', description: 'Máximo 2MB', variant: 'error' })
      return
    }

    setUploadingPhoto(true)
    const ext = file.name.split('.').pop()
    const path = `avatars/${userId}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('installer-media')
      .upload(path, file, { upsert: true, contentType: file.type })

    if (uploadError) {
      toast({ title: 'Error al subir foto', description: uploadError.message, variant: 'error' })
      setUploadingPhoto(false)
      return
    }

    const { data: { publicUrl } } = supabase.storage
      .from('installer-media')
      .getPublicUrl(path)

    const { error: updateError } = await supabase
      .from('installers')
      .update({ foto_perfil_url: publicUrl })
      .eq('user_id', userId)

    if (updateError) {
      toast({ title: 'Error al guardar foto', description: updateError.message, variant: 'error' })
    } else {
      setPhotoUrl(publicUrl)
      toast({ title: 'Foto actualizada', variant: 'success' })
    }
    setUploadingPhoto(false)
    // Reset input so same file can be re-selected
    e.target.value = ''
  }

  const handleBannerChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !userId) return

    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'Imagen demasiado grande', description: 'Máximo 5MB', variant: 'error' })
      return
    }

    setUploadingBanner(true)
    const ext = file.name.split('.').pop()
    const path = `banners/${userId}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('installer-media')
      .upload(path, file, { upsert: true, contentType: file.type })

    if (uploadError) {
      toast({ title: 'Error al subir portada', description: uploadError.message, variant: 'error' })
      setUploadingBanner(false)
      return
    }

    const { data: { publicUrl } } = supabase.storage
      .from('installer-media')
      .getPublicUrl(path)

    const url = `${publicUrl}?t=${Date.now()}`
    const { error: updateError } = await supabase
      .from('installers')
      .update({ banner_url: url })
      .eq('user_id', userId)

    if (updateError) {
      toast({ title: 'Error al guardar portada', description: updateError.message, variant: 'error' })
    } else {
      setBannerUrl(url)
      toast({ title: 'Portada actualizada', variant: 'success' })
    }
    setUploadingBanner(false)
    e.target.value = ''
  }

  const handleRemoveBanner = async () => {
    if (!userId) return
    const { error } = await supabase
      .from('installers')
      .update({ banner_url: null })
      .eq('user_id', userId)
    if (!error) {
      setBannerUrl(null)
      toast({ title: 'Portada eliminada', variant: 'success' })
    }
  }

  const handleRemovePhoto = async () => {
    if (!userId) return
    const { error } = await supabase
      .from('installers')
      .update({ foto_perfil_url: null })
      .eq('user_id', userId)

    if (!error) {
      setPhotoUrl(null)
      toast({ title: 'Foto eliminada', variant: 'success' })
    }
  }

  const handleDragStart = (clientY: number) => {
    setIsDragging(true)
    dragStartY.current = clientY
    dragStartPos.current = bannerPositionY
  }

  const handleDragMove = (clientY: number) => {
    if (!isDragging || !bannerPreviewRef.current) return
    const rect = bannerPreviewRef.current.getBoundingClientRect()
    const delta = clientY - dragStartY.current
    const pctDelta = (delta / rect.height) * 100
    const newPos = Math.max(0, Math.min(100, dragStartPos.current + pctDelta))
    setBannerPositionY(newPos)
  }

  const handleDragEnd = async () => {
    if (!isDragging) return
    setIsDragging(false)
    if (!userId) return
    await supabase
      .from('installers')
      .update({ banner_position_y: Math.round(bannerPositionY) })
      .eq('user_id', userId)
  }

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

        {/* ── IMAGEN DE PORTADA ──────────────────────── */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Imagen de portada</CardTitle>
            <CardDescription>Se muestra como fondo de tu perfil público. Si no subís una, se usa el color que elegiste.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Preview */}
            <div
              ref={bannerPreviewRef}
              className="relative w-full h-32 rounded-xl overflow-hidden border border-border flex items-center justify-center select-none"
              style={bannerUrl ? undefined : { background: COLOR_PALETTES[form.color_palette]?.primary ?? '#f97316' }}
              onMouseDown={bannerUrl ? (e) => handleDragStart(e.clientY) : undefined}
              onMouseMove={bannerUrl ? (e) => handleDragMove(e.clientY) : undefined}
              onMouseUp={bannerUrl ? () => handleDragEnd() : undefined}
              onMouseLeave={bannerUrl && isDragging ? () => handleDragEnd() : undefined}
              onTouchStart={bannerUrl ? (e) => handleDragStart(e.touches[0].clientY) : undefined}
              onTouchMove={bannerUrl ? (e) => { e.preventDefault(); handleDragMove(e.touches[0].clientY) } : undefined}
              onTouchEnd={bannerUrl ? () => handleDragEnd() : undefined}
            >
              {bannerUrl ? (
                <>
                  <img
                    src={bannerUrl}
                    alt="Portada"
                    className="w-full h-full object-cover pointer-events-none"
                    style={{ objectPosition: `center ${bannerPositionY}%` }}
                    draggable={false}
                  />
                  <div className={cn(
                    "absolute inset-0 flex items-center justify-center transition-opacity",
                    isDragging ? "opacity-100" : "opacity-0 hover:opacity-100"
                  )}>
                    <span className="bg-black/50 text-white text-xs px-3 py-1.5 rounded-full">
                      {isDragging ? 'Soltá para guardar' : 'Arrastrá para ajustar'}
                    </span>
                  </div>
                </>
              ) : (
                <span className="text-white/60 text-sm">Sin imagen — se usará el color elegido</span>
              )}
              {uploadingBanner && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
            <input
              ref={bannerInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleBannerChange}
            />
            <div className="flex gap-2 flex-wrap">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => bannerInputRef.current?.click()}
                loading={uploadingBanner}
              >
                <Camera className="w-4 h-4" />
                {bannerUrl ? 'Cambiar portada' : 'Subir portada'}
              </Button>
              {bannerUrl && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveBanner}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <X className="w-4 h-4" />
                  Eliminar portada
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* ── FOTO DE PERFIL ─────────────────────────── */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Foto de perfil</CardTitle>
            <CardDescription>Aparece en tu perfil público y en los resultados de búsqueda</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <div className="relative shrink-0">
                <InstallerAvatar
                  nombre={form.nombre || 'U'}
                  apellido={form.apellido || ''}
                  fotoUrl={photoUrl ?? undefined}
                  size="xl"
                  className="ring-2 ring-border"
                />
                {uploadingPhoto && (
                  <div className="absolute inset-0 rounded-full bg-black/60 flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  JPG, PNG o WebP · Máximo 2 MB
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handlePhotoChange}
                />
                <div className="flex gap-2 flex-wrap">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    loading={uploadingPhoto}
                  >
                    <Camera className="w-4 h-4" />
                    {photoUrl ? 'Cambiar foto' : 'Subir foto'}
                  </Button>
                  {photoUrl && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleRemovePhoto}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <X className="w-4 h-4" />
                      Eliminar
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── INFORMACIÓN PERSONAL ───────────────────── */}
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
            <FormField label="Título profesional" hint="Ej: Oficial Eléctrico Especializado · Técnico en Redes · Gasista Matriculado">
              <Input
                placeholder="Ej: Oficial Eléctrico Especializado"
                value={form.titulo_profesional}
                onChange={e => setForm(f => ({ ...f, titulo_profesional: e.target.value }))}
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

        {/* ── UBICACIÓN ──────────────────────────────── */}
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

        {/* ── CONTACTO ───────────────────────────────── */}
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

        {/* ── PALETA DE COLORES ──────────────────────── */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Color del perfil</CardTitle>
            <CardDescription>Define el color principal de tu perfil público</CardDescription>
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
                  <div className="w-8 h-8 rounded-lg shrink-0" style={{ background: palette.primary }} />
                  <span className="text-sm font-medium">{palette.label}</span>
                  {form.color_palette === key && <Check className="w-4 h-4 text-primary ml-auto" />}
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
