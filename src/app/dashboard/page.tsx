import { redirect } from "next/navigation"
import Link from "next/link"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PlanBadge } from "@/components/ui/plan-badge"
import { StarRating } from "@/components/ui/avatar"
import { Star, Eye, MessageCircle, FileText, ChevronRight, AlertCircle } from "lucide-react"
import { getEffectivePlan, PLAN_LABELS } from "@/lib/plans"

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: installer } = await supabase
    .from('installers')
    .select(`
      *,
      installer_trades(count),
      installer_services(count),
      gallery_items(count)
    `)
    .eq('user_id', user.id)
    .single()

  if (!installer) redirect('/auth/register')

  // Últimas 7 días de stats
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const { data: stats } = await supabase
    .from('stats')
    .select('profile_views, whatsapp_clicks')
    .eq('installer_id', installer.id)
    .gte('date', sevenDaysAgo.toISOString().split('T')[0])

  const totalViews = stats?.reduce((sum, s) => sum + (s.profile_views ?? 0), 0) ?? 0
  const totalClicks = stats?.reduce((sum, s) => sum + (s.whatsapp_clicks ?? 0), 0) ?? 0

  const effectivePlan = getEffectivePlan(installer)
  const profileIncomplete = !installer.descripcion || (installer.installer_trades as any)?.count === 0

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">
            Hola, {installer.nombre} 👋
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {new Date().toLocaleDateString('es-AR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <PlanBadge plan={installer.plan} />
      </div>

      {/* Incomplete profile warning */}
      {profileIncomplete && (
        <div className="flex items-start gap-3 p-4 rounded-xl border border-amber-200 bg-amber-50">
          <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-800">Completá tu perfil para aparecer en búsquedas</p>
            <p className="text-xs text-amber-700 mt-0.5">Agregá tu descripción y elegí tus oficios.</p>
          </div>
          <Button size="sm" variant="outline" asChild>
            <Link href="/dashboard/profile">Completar</Link>
          </Button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Reseñas", value: installer.total_reviews, icon: Star, color: "text-yellow-500" },
          { label: "Rating", value: installer.avg_rating?.toFixed(1) ?? "0.0", icon: Star, color: "text-yellow-400", isRating: true },
          { label: "Visitas (7d)", value: totalViews, icon: Eye, color: "text-blue-500" },
          { label: "WA clicks (7d)", value: totalClicks, icon: MessageCircle, color: "text-green-500" },
        ].map(stat => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <stat.icon className={`w-5 h-5 ${stat.color} mb-2`} />
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Acciones rápidas</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {[
              { href: '/dashboard/reviews/invites', label: 'Generar link de reseña', icon: Star },
              { href: '/dashboard/gallery', label: 'Agregar fotos', icon: Eye },
              { href: '/dashboard/quotes', label: 'Nuevo presupuesto', icon: FileText, locked: effectivePlan === 'FREE' },
            ].map(action => (
              <Button
                key={action.href}
                variant="ghost"
                className="justify-start w-full"
                asChild={!action.locked}
                disabled={action.locked}
              >
                <Link href={action.locked ? '/dashboard/plan' : action.href}>
                  <action.icon className="w-4 h-4 mr-2" />
                  {action.label}
                  {action.locked && <span className="ml-auto text-xs text-amber-600">Pro</span>}
                  {!action.locked && <ChevronRight className="w-4 h-4 ml-auto opacity-40" />}
                </Link>
              </Button>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Tu perfil público</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              URL: <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">
                /i/{installer.url_slug}
              </code>
            </p>
            <Button variant="outline" size="sm" asChild className="w-full">
              <Link href={`/i/${installer.url_slug}`} target="_blank">
                Ver mi perfil público
                <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
            {installer.plan === 'FREE' && (
              <div className="text-xs text-muted-foreground border border-dashed border-border rounded-lg p-3">
                Con plan Pro o Premium, aparecés más arriba en las búsquedas.
                <Link href="/dashboard/plan" className="text-primary ml-1 hover:underline">Ver planes →</Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
