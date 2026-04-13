'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Eye, MessageCircle, TrendingUp } from 'lucide-react'
import { DashboardStatsSkeleton } from '@/components/skeletons/dashboard-stats-skeleton'

const supabase = createClient()

export default function StatsPage() {
  const [data, setData] = useState<{ date: string; views: number; clicks: number }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: inst } = await supabase
        .from('installers')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (!inst) return

      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const { data: stats } = await supabase
        .from('stats')
        .select('date, profile_views, whatsapp_clicks')
        .eq('installer_id', inst.id)
        .gte('date', thirtyDaysAgo.toISOString().split('T')[0])
        .order('date', { ascending: true })

      setData((stats ?? []).map(s => ({
        date: new Date(s.date).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' }),
        views: s.profile_views ?? 0,
        clicks: s.whatsapp_clicks ?? 0,
      })))
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <DashboardStatsSkeleton />

  const totalViews = data.reduce((s, d) => s + d.views, 0)
  const totalClicks = data.reduce((s, d) => s + d.clicks, 0)
  const convRate = totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(1) : '0'

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Estadísticas</h1>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Visitas (30d)', value: totalViews, icon: Eye, color: 'text-blue-500' },
          { label: 'Clicks WA (30d)', value: totalClicks, icon: MessageCircle, color: 'text-green-500' },
          { label: 'Conversión', value: `${convRate}%`, icon: TrendingUp, color: 'text-purple-500' },
        ].map(stat => (
          <div key={stat.label} className="rounded-xl border border-border bg-card p-4">
            <stat.icon className={`w-5 h-5 ${stat.color} mb-2`} />
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      {data.length > 0 ? (
        <div className="rounded-xl border border-border bg-card p-4">
          <h2 className="text-base font-semibold mb-4">Visitas y clicks — últimos 30 días</h2>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
              <Line type="monotone" dataKey="views" stroke="#3b82f6" strokeWidth={2} dot={false} name="Visitas" />
              <Line type="monotone" dataKey="clicks" stroke="#22c55e" strokeWidth={2} dot={false} name="Clicks WA" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
          <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p>Todavía no hay datos. Compartí tu perfil para empezar a recibir visitas.</p>
        </div>
      )}
    </div>
  )
}
