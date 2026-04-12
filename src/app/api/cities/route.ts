import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')?.trim() ?? ''
  const provincia = req.nextUrl.searchParams.get('provincia')?.trim() ?? ''

  if (!q || q.length < 4) return NextResponse.json([])

  try {
    const params = new URLSearchParams({ max: '10', campos: 'nombre,provincia.nombre' })
    if (q) params.set('nombre', q)
    if (provincia) params.set('provincia', provincia)

    const url = `https://apis.datos.gob.ar/georef/api/localidades?${params}`
    const res = await fetch(url, { next: { revalidate: 3600 } })
    if (!res.ok) return NextResponse.json([])

    const json = await res.json()
    const localidades: { nombre: string; provincia: { nombre: string } }[] = json.localidades ?? []

    const cities = localidades.map(l => l.nombre)
    return NextResponse.json(cities)
  } catch {
    return NextResponse.json([])
  }
}
