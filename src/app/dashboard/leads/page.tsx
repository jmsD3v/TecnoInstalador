'use client'

import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Inbox, ChevronDown } from 'lucide-react'

type Lead = {
  id: string
  client_name: string | null
  job_description: string | null
  service: string | null
  status: 'new' | 'contacted' | 'won' | 'lost'
  notes: string | null
  created_at: string
}

const STATUS_LABELS: Record<Lead['status'], string> = {
  new: 'Nueva',
  contacted: 'Contactado',
  won: 'Ganado',
  lost: 'Perdido',
}

const STATUS_COLORS: Record<Lead['status'], string> = {
  new: 'bg-blue-500/15 text-blue-700 dark:text-blue-400',
  contacted: 'bg-yellow-500/15 text-yellow-700 dark:text-yellow-400',
  won: 'bg-green-500/15 text-green-700 dark:text-green-400',
  lost: 'bg-red-500/15 text-red-600 dark:text-red-400',
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [notes, setNotes] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/dashboard/leads')
      .then(r => r.json())
      .then(d => {
        setLeads(d.leads ?? [])
        const n: Record<string, string> = {}
        for (const l of d.leads ?? []) n[l.id] = l.notes ?? ''
        setNotes(n)
      })
      .finally(() => setLoading(false))
  }, [])

  async function updateLead(id: string, patch: Partial<Pick<Lead, 'status' | 'notes'>>) {
    setSaving(id)
    const res = await fetch(`/api/dashboard/leads/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    })
    if (res.ok) {
      const { lead } = await res.json()
      setLeads(prev => prev.map(l => l.id === id ? lead : l))
    }
    setSaving(null)
  }

  const counts = {
    new: leads.filter(l => l.status === 'new').length,
    contacted: leads.filter(l => l.status === 'contacted').length,
    won: leads.filter(l => l.status === 'won').length,
    lost: leads.filter(l => l.status === 'lost').length,
  }

  if (loading) return <div className="p-6 text-sm text-muted-foreground">Cargando...</div>

  return (
    <div className="p-6 max-w-3xl space-y-6">
      <div>
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Inbox className="size-5" /> Consultas recibidas
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Gestioná las consultas que llegaron desde tu perfil.
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-3">
        {(['new', 'contacted', 'won', 'lost'] as Lead['status'][]).map(s => (
          <div key={s} className="rounded-xl border p-3 text-center">
            <div className="text-2xl font-bold">{counts[s]}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{STATUS_LABELS[s]}</div>
          </div>
        ))}
      </div>

      {leads.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Aún no recibiste consultas. Compartí tu perfil para empezar.
        </p>
      ) : (
        <div className="space-y-2">
          {leads.map(lead => (
            <div key={lead.id} className="rounded-xl border overflow-hidden">
              <button
                onClick={() => setExpanded(expanded === lead.id ? null : lead.id)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/40"
              >
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[lead.status]}`}>
                    {STATUS_LABELS[lead.status]}
                  </span>
                  <div>
                    <p className="text-sm font-medium">{lead.client_name ?? 'Cliente desconocido'}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(lead.created_at), "d MMM yyyy, HH:mm", { locale: es })}
                      {lead.service && ` · ${lead.service}`}
                    </p>
                  </div>
                </div>
                <ChevronDown className={`size-4 text-muted-foreground transition-transform ${expanded === lead.id ? 'rotate-180' : ''}`} />
              </button>

              {expanded === lead.id && (
                <div className="border-t px-4 py-3 space-y-3 bg-muted/20">
                  {lead.job_description && (
                    <p className="text-sm">{lead.job_description}</p>
                  )}

                  {/* Status buttons */}
                  <div className="flex flex-wrap gap-2">
                    {(['new', 'contacted', 'won', 'lost'] as Lead['status'][]).map(s => (
                      <button
                        key={s}
                        onClick={() => updateLead(lead.id, { status: s })}
                        disabled={saving === lead.id}
                        className={`text-xs px-3 py-1 rounded-full border font-medium transition-colors ${
                          lead.status === s
                            ? STATUS_COLORS[s] + ' border-transparent'
                            : 'border-border hover:bg-muted/60'
                        }`}
                      >
                        {STATUS_LABELS[s]}
                      </button>
                    ))}
                  </div>

                  {/* Notes */}
                  <div className="space-y-1">
                    <label className="text-xs font-medium">Notas internas</label>
                    <textarea
                      value={notes[lead.id] ?? ''}
                      onChange={e => setNotes(prev => ({ ...prev, [lead.id]: e.target.value }))}
                      placeholder="Ej: cliente interesado, presupuesto acordado..."
                      rows={2}
                      className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    />
                    <button
                      onClick={() => updateLead(lead.id, { notes: notes[lead.id] })}
                      disabled={saving === lead.id}
                      className="text-xs bg-primary text-primary-foreground rounded-lg px-3 py-1 font-medium disabled:opacity-50"
                    >
                      {saving === lead.id ? 'Guardando...' : 'Guardar nota'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
