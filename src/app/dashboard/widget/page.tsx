import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { WidgetEmbedClient } from './widget-embed-client'

export default async function DashboardWidgetPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: installer } = await supabase
    .from('installers')
    .select('url_slug')
    .eq('user_id', user.id)
    .single()

  if (!installer?.url_slug) {
    return (
      <div className="p-6 text-muted-foreground text-sm">
        No se encontró tu perfil. <a href="/dashboard/profile" className="underline">Completá tu registro</a>.
      </div>
    )
  }

  return <WidgetEmbedClient slug={installer.url_slug} />
}
