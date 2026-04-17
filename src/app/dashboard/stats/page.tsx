'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts'
import { Eye, MessageCircle, TrendingUp, TrendingDown, Minus, Calendar, Star } from 'lucide-react'
import { DashboardStatsSkeleton } from '@/components/skeletons/dashboard-stats-skeleton'

const supabase = createClient()

type Period = 7 | 30 | 90

interface DayStats {
  date: string
  views: number
  clicks: number
}

interface PeriodSummary {
  views: number
  clicks: number
  convRate: number
  bestDay: DayStats | null
}

function summarize(data: DayStats[]): PeriodSummary {
  const views = data.reduce((s, d) => s + d.views, 0)
  const clicks = data.reduce((s, d) => s + d.clicks, 0)
  const convRate = views > 0 ? (clicks / views) * 100 : 0
  const bestDay = data.reduce<DayStats | null>((best, d) =>
    !best || d.views > best.views ? d : best, null)
  return { views, clicks, convRate, bestDay }
}

function Trend({ curr, prev }: { curr: number; prev: number }) {
  if (prev === 0) return <span className="text-xs text-muted-foreground">—</span>
  const pct = ((curr - prev) / prev) * 100
  const up = pct >= 0
  const Icon = Math.abs(pct) < 0.05 ? Minus : up ? TrendingUp : TrendingDown
  return (
    <span className={`flex items-center gap-0.5 text-xs font-semibold ${up ? 'text-green-500' : 'text-red-500'}`}>
      <Icon className="w-3 h-3" />
      {Math.abs(pct).toFixed(1)}%
    </span>
  )
}

export default function StatsPage() {
  const [period, setPeriod] = useState<Period>(30)
  const [current, setCurrent] = useState<DayStats[]>([])
  const [previous, setPrevious] = useState<DayStats[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: inst } = await supabase
        .from('installers')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (!inst) return

      const startDate = new Date()
      startDate.setDate(startDate.getDate() - period * 2)

      const { data: stats } = await supabase
        .from('stats')
        .select('date, profile_views, whatsapp_clicks')
        .eq('installer_id', inst.id)
        .gte('date', startDate.toISOString().split('T')[0])
        .order('date', { ascending: true })

      const all: DayStats[] = (stats ?? []).map(s => ({
        date: s.date,
        views: s.profile_views ?? 0,
        clicks: s.whatsapp_clicks ?? 0,
      }))

      const cutoff = new Date()
      cutoff.setDate(cutoff.getDate() - period)
      const cutoffStr = cutoff.toISOString().split('T')[0]

      setCurrent(all.filter(d => d.date >= cutoffStr))
      setPrevious(all.filter(d => d.date < cutoffStr))
      setLoading(false)
    }
    load()
  }, [period])

  const curr = summarize(current)
  const prev = summarize(previous)

  const chartData = current.map(d => ({
    date: new Date(d.date + 'T12:00:00').toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' }),
    Visitas: d.views,
    'Clicks WA': d.clicks,
  }))

  const PERIOD_LABELS: Record<Period, string> = { 7: '7 días', 30: '30 días', 90: '90 días' }

  if (loading) return <DashboardStatsSkeleton />

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header + period selector */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold">Estadísticas</h1>
        <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
          {([7, 30, 90] as Period[]).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                period === p
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {PERIOD_LABELS[p]}
            </button>
          ))}
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Visitas', value: curr.views, prevVal: prev.views, icon: Eye, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-950/30' },
          { label: 'Clicks WhatsApp', value: curr.clicks, prevVal: prev.clicks, icon: MessageCircle, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-950/30' },
          { label: 'Conversión', value: `${curr.convRate.toFixed(1)}%`, prevVal: prev.convRate, currNum: curr.convRate, icon: TrendingUp, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-950/30' },
        ].map(stat => (
          <div key={stat.label} className="rounded-xl border border-border bg-card p-4 space-y-2">
            <div className={`w-8 h-8 rounded-lg ${stat.bg} flex items-center justify-center`}>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </div>
            <p className="text-2xl font-bold">{stat.value}</p>
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">{stat.label} ({PERIOD_LABELS[period]})</p>
              <Trend curr={stat.currNum ?? (stat.value as number)} prev={stat.prevVal} />
            </div>
            <p className="text-xs text-muted-foreground">
              Período anterior: {'currNum' in stat ? `${stat.prevVal.toFixed(1)}%` : stat.prevVal}
            </p>
          </div>
        ))}
      </div>

      {/* Best day */}
      {curr.bestDay && (
        <div className="rounded-xl border border-border bg-card p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center shrink-0">
            <Star className="w-5 h-5 text-amber-500 fill-amber-400/30" />
          </div>
          <div>
            <p className="text-sm font-semibold">Mejor día del período</p>
            <p className="text-xs text-muted-foreground">
              {new Date(curr.bestDay.date + 'T12:00:00').toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}
              {' — '}<strong>{curr.bestDay.views}</strong> visitas, <strong>{curr.bestDay.clicks}</strong> clicks WA
            </p>
          </div>
        </div>
      )}

      {/* Chart */}
      {chartData.length > 0 ? (
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <h2 className="text-base font-semibold">Evolución — {PERIOD_LABELS[period]}</h2>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={chartData} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  background: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: 12,
                }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="Visitas" stroke="#3b82f6" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
              <Line type="monotone" dataKey="Clicks WA" stroke="#22c55e" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
          <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p>Sin datos en este período. Compartí tu perfil para empezar a recibir visitas.</p>
        </div>
      )}
    </div>
  )
}
