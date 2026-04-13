'use client'

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/components/ui/toast"
import { GalleryItem, Installer } from "@/types"
import { canAddGalleryItem, getEffectivePlan, PLAN_LIMITS } from "@/lib/plans"
import { Upload, Trash2, Lock, Image } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"

export default function GalleryPage() {
  const supabase = createClient()
  const toast = useToast()
  const fileRef = useRef<HTMLInputElement>(null)

  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [installer, setInstaller] = useState<Installer | null>(null)
  const [items, setItems] = useState<GalleryItem[]>([])

  useEffect(() => {
    load()
  }, [])

  const load = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: inst } = await supabase
      .from('installers')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (inst) {
      setInstaller(inst)
      const { data: gallery } = await supabase
        .from('gallery_items')
        .select('*')
        .eq('installer_id', inst.id)
        .order('sort_order')

      setItems(gallery ?? [])
    }
    setLoading(false)
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (!files.length || !installer) return

    const effectivePlan = getEffectivePlan(installer)
    const limits = PLAN_LIMITS[effectivePlan]

    for (const file of files) {
      const check = canAddGalleryItem(installer, items.length)
      if (!check.allowed) {
        toast({ title: 'Límite de galería', description: check.reason, variant: 'warning' })
        break
      }

      setUploading(true)
      const ext = file.name.split('.').pop()
      const path = `gallery/${installer.id}/${Date.now()}.${ext}`

      const { error: uploadError, data } = await supabase.storage
        .from('installer-media')
        .upload(path, file, { upsert: false })

      if (uploadError) {
        toast({ title: 'Error al subir imagen', description: uploadError.message, variant: 'error' })
        setUploading(false)
        continue
      }

      const { data: { publicUrl } } = supabase.storage
        .from('installer-media')
        .getPublicUrl(path)

      const { error: dbError } = await supabase.from('gallery_items').insert({
        installer_id: installer.id,
        image_url: publicUrl,
        sort_order: items.length,
      })

      if (dbError) {
        toast({ title: 'Error al guardar', description: dbError.message, variant: 'error' })
      }
    }

    setUploading(false)
    load()
    if (fileRef.current) fileRef.current.value = ''
  }

  const handleDelete = async (item: GalleryItem) => {
    const { error } = await supabase
      .from('gallery_items')
      .delete()
      .eq('id', item.id)

    if (!error) {
      toast({ title: 'Foto eliminada', variant: 'success' })
      setItems(prev => prev.filter(i => i.id !== item.id))
    }
  }

  if (loading) return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-10 w-32 rounded-lg" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="aspect-square rounded-xl" />
        ))}
      </div>
    </div>
  )

  const effectivePlan = installer ? getEffectivePlan(installer) : 'FREE'
  const limits = PLAN_LIMITS[effectivePlan]
  const atLimit = items.length >= limits.max_gallery

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Galería de trabajos</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {items.length}/{limits.max_gallery === 200 ? '200' : limits.max_gallery} fotos
          </p>
        </div>
        <div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleUpload}
            disabled={atLimit || uploading}
          />
          <Button
            onClick={() => fileRef.current?.click()}
            disabled={atLimit || uploading}
            loading={uploading}
          >
            <Upload className="w-4 h-4 mr-2" />
            Agregar fotos
          </Button>
        </div>
      </div>

      {atLimit && (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-50 border border-amber-200 text-sm">
          <Lock className="w-4 h-4 text-amber-600 shrink-0" />
          <p className="text-amber-800">
            Límite de galería alcanzado.
            <Link href="/dashboard/plan" className="text-primary ml-1 font-semibold">Mejorar plan →</Link>
          </p>
        </div>
      )}

      {items.length === 0 ? (
        <div
          className="border-2 border-dashed border-border rounded-xl p-12 flex flex-col items-center gap-3 cursor-pointer hover:border-primary/50 transition-colors"
          onClick={() => fileRef.current?.click()}
        >
          <Image className="w-12 h-12 text-muted-foreground" />
          <p className="text-muted-foreground text-sm">Hacé click para subir tus primeras fotos</p>
          <Button variant="outline" size="sm">Seleccionar fotos</Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {items.map(item => (
            <div key={item.id} className="relative group aspect-square rounded-xl overflow-hidden bg-muted">
              <img
                src={item.image_url}
                alt={item.titulo ?? 'Trabajo'}
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Button
                  variant="destructive"
                  size="icon"
                  className="w-9 h-9"
                  onClick={() => handleDelete(item)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}

          {/* Add more slot */}
          {!atLimit && (
            <div
              className="aspect-square rounded-xl border-2 border-dashed border-border flex items-center justify-center cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => fileRef.current?.click()}
            >
              <Upload className="w-6 h-6 text-muted-foreground" />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
