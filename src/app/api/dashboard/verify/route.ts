import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createServiceRoleClient } from '@/lib/supabase/service'

// GET — return current verification status for authenticated installer
export async function GET() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const service = createServiceRoleClient()

  // Get installer
  const { data: installer, error: instErr } = await service
    .from('installers')
    .select('id, is_verified')
    .eq('user_id', user.id)
    .single()

  if (instErr || !installer) return NextResponse.json({ status: 'none' })

  if (installer.is_verified) return NextResponse.json({ status: 'approved' })

  // Check latest request
  const { data: req } = await service
    .from('verification_requests')
    .select('status, admin_note, created_at')
    .eq('installer_id', installer.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (!req) return NextResponse.json({ status: 'none' })

  return NextResponse.json({
    status: req.status,
    adminNote: req.admin_note,
    createdAt: req.created_at,
  })
}

// POST — upload docs and create verification request
export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const service = createServiceRoleClient()

  // Get installer
  const { data: installer, error: instErr } = await service
    .from('installers')
    .select('id, is_verified')
    .eq('user_id', user.id)
    .single()

  if (instErr || !installer) return NextResponse.json({ error: 'Installer not found' }, { status: 404 })
  if (installer.is_verified) return NextResponse.json({ error: 'Ya verificado' }, { status: 400 })

  // Check no pending request exists
  const { data: existing } = await service
    .from('verification_requests')
    .select('status')
    .eq('installer_id', installer.id)
    .eq('status', 'pending')
    .single()

  if (existing) return NextResponse.json({ error: 'Ya tenés una solicitud pendiente' }, { status: 400 })

  const formData = await req.formData()
  const files = formData.getAll('files') as File[]
  if (files.length === 0) return NextResponse.json({ error: 'No files provided' }, { status: 400 })
  if (files.length > 5) return NextResponse.json({ error: 'Máximo 5 archivos' }, { status: 400 })

  // Validate file sizes (10 MB each)
  for (const file of files) {
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: `Archivo ${file.name} supera 10 MB` }, { status: 400 })
    }
  }

  // Upload files to storage
  const docUrls: string[] = []
  for (const file of files) {
    const ext = file.name.split('.').pop() ?? 'bin'
    const path = `${user.id}/${installer.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const buffer = await file.arrayBuffer()

    const { error: uploadErr } = await service.storage
      .from('verification-docs')
      .upload(path, buffer, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadErr) {
      console.error('[verify] upload error:', uploadErr)
      return NextResponse.json({ error: 'Error al subir archivo' }, { status: 500 })
    }

    docUrls.push(path)
  }

  // Create verification request
  const { error: insertErr } = await service
    .from('verification_requests')
    .insert({
      installer_id: installer.id,
      doc_urls: docUrls,
      status: 'pending',
    })

  if (insertErr) {
    console.error('[verify] insert error:', insertErr)
    return NextResponse.json({ error: 'Error al crear solicitud' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
