import { MetadataRoute } from 'next'
import { createServiceRoleClient } from '@/lib/supabase/service'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? 'https://tecnoinstalador.net'
  const now = new Date()

  // Static pages
  const statics: MetadataRoute.Sitemap = [
    { url: base,                      lastModified: now, changeFrequency: 'weekly',  priority: 1.0 },
    { url: `${base}/buscar`,          lastModified: now, changeFrequency: 'daily',   priority: 0.9 },
    { url: `${base}/planes`,          lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/auth/register`,   lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/legal/terminos`,  lastModified: now, changeFrequency: 'yearly',  priority: 0.2 },
    { url: `${base}/legal/privacidad`,lastModified: now, changeFrequency: 'yearly',  priority: 0.2 },
  ]

  const supabase = createServiceRoleClient()

  // Installer profiles
  const { data: installers } = await supabase
    .from('installers')
    .select('url_slug, updated_at')
    .eq('is_active', true)
    .not('url_slug', 'is', null)

  const profiles: MetadataRoute.Sitemap = (installers ?? []).map(i => ({
    url: `${base}/i/${i.url_slug}`,
    lastModified: i.updated_at ? new Date(i.updated_at) : now,
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  // SEO landing pages: /buscar/[trade]/[ciudad]
  const { data: tradeCity } = await supabase
    .from('installers')
    .select('ciudad, installer_trades!inner(trade:trades(slug))')
    .eq('is_active', true)
    .not('ciudad', 'is', null)

  const { slugify } = await import('@/lib/utils')
  const seen = new Set<string>()
  const seoLandings: MetadataRoute.Sitemap = []

  for (const inst of tradeCity ?? []) {
    const city = (inst.ciudad ?? '').trim()
    if (!city) continue
    const ciudadSlug = slugify(city)
    for (const it of (inst.installer_trades as any[]) ?? []) {
      const tradeSlug = it.trade?.slug
      if (!tradeSlug) continue
      const key = `${tradeSlug}/${ciudadSlug}`
      if (seen.has(key)) continue
      seen.add(key)
      seoLandings.push({
        url: `${base}/buscar/${tradeSlug}/${ciudadSlug}`,
        lastModified: now,
        changeFrequency: 'weekly',
        priority: 0.85,
      })
    }
  }

  return [...statics, ...seoLandings, ...profiles]
}
