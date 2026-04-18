'use client'

import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts'

type Item = { created_at: string; plan?: string; status?: string }

function groupByDay(items: Item[]): { label: string; value: number }[] {
  const map: Record<string, number> = {}
  for (const item of items) {
    const d = new Date(item.created_at)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    map[key] = (map[key] ?? 0) + 1
  }
  return Object.entries(map)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, value]) => ({
      label: new Date(date + 'T12:00:00').toLocaleDateString('es-AR', { day: 'numeric', month: 'short' }),
      value,
    }))
}

export default function AdminBICharts({
  signups,
  subs,
}: {
  signups: Item[]
  subs: Item[]
}) {
  const signupsByDay = groupByDay(signups)
  const newSubsByDay = groupByDay(subs.filter(s => s.status === 'authorized'))

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-base font-semibold mb-3">Registros por día (últimos 30 días)</h2>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={signupsByDay}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="label" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
            <Tooltip formatter={(v: number) => [v, 'Registros']} />
            <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div>
        <h2 className="text-base font-semibold mb-3">Nuevas suscripciones pagas por día</h2>
        {newSubsByDay.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sin suscripciones nuevas en este período.</p>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={newSubsByDay}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip formatter={(v: number) => [v, 'Suscripciones']} />
              <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
