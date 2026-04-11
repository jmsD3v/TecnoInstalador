'use client'

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/components/ui/toast"
import { Trade, Service, Installer } from "@/types"
import { canAddTrade, canAddService, getEffectivePlan, PLAN_LIMITS } from "@/lib/plans"
import { Plus, X, Lock } from "lucide-react"
import Link from "next/link"

export default function ServicesPage() {
  const supabase = createClient()
  const toast = useToast()

  const [loading, setLoading] = useState(true)
  const [installer, setInstaller] = useState<Installer | null>(null)
  const [allTrades, setAllTrades] = useState<Trade[]>([])
  const [allServices, setAllServices] = useState<Service[]>([])
  const [selectedTradeIds, setSelectedTradeIds] = useState<string[]>([])
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [activeTrade, setActiveTrade] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const [{ data: inst }, { data: trades }, { data: services }] = await Promise.all([
        supabase.from('installers').select('*').eq('user_id', user.id).single(),
        supabase.from('trades').select('*').order('nombre'),
        supabase.from('services').select('*, trade:trades(*)').order('nombre'),
      ])

      if (inst) {
        setInstaller(inst)

        const [{ data: it }, { data: is_ }] = await Promise.all([
          supabase.from('installer_trades').select('trade_id').eq('installer_id', inst.id),
          supabase.from('installer_services').select('service_id').eq('installer_id', inst.id),
        ])

        setSelectedTradeIds((it ?? []).map((x: any) => x.trade_id))
        setSelectedServiceIds((is_ ?? []).map((x: any) => x.service_id))
      }

      setAllTrades(trades ?? [])
      setAllServices(services ?? [])
      setLoading(false)
    }
    load()
  }, [])

  const effectivePlan = installer ? getEffectivePlan(installer) : 'FREE'
  const limits = PLAN_LIMITS[effectivePlan]

  const toggleTrade = (tradeId: string) => {
    if (selectedTradeIds.includes(tradeId)) {
      setSelectedTradeIds(prev => prev.filter(id => id !== tradeId))
      // Remove services of this trade
      const tradeServiceIds = allServices
        .filter(s => s.trade_id === tradeId)
        .map(s => s.id)
      setSelectedServiceIds(prev => prev.filter(id => !tradeServiceIds.includes(id)))
    } else {
      if (!installer) return
      const check = canAddTrade(installer, selectedTradeIds.length)
      if (!check.allowed) {
        toast({ title: 'Límite de oficios', description: check.reason, variant: 'warning' })
        return
      }
      setSelectedTradeIds(prev => [...prev, tradeId])
      setActiveTrade(tradeId)
    }
  }

  const toggleService = (serviceId: string) => {
    if (selectedServiceIds.includes(serviceId)) {
      setSelectedServiceIds(prev => prev.filter(id => id !== serviceId))
    } else {
      if (!installer) return
      const check = canAddService(installer, selectedServiceIds.length)
      if (!check.allowed) {
        toast({ title: 'Límite de servicios', description: check.reason, variant: 'warning' })
        return
      }
      setSelectedServiceIds(prev => [...prev, serviceId])
    }
  }

  const handleSave = async () => {
    if (!installer) return
    setSaving(true)

    // Sync trades
    await supabase.from('installer_trades').delete().eq('installer_id', installer.id)
    if (selectedTradeIds.length > 0) {
      await supabase.from('installer_trades').insert(
        selectedTradeIds.map(trade_id => ({ installer_id: installer.id, trade_id }))
      )
    }

    // Sync services
    await supabase.from('installer_services').delete().eq('installer_id', installer.id)
    if (selectedServiceIds.length > 0) {
      await supabase.from('installer_services').insert(
        selectedServiceIds.map(service_id => ({ installer_id: installer.id, service_id }))
      )
    }

    toast({ title: 'Guardado', description: 'Oficios y servicios actualizados', variant: 'success' })
    setSaving(false)
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const activeTradeServices = allServices.filter(
    s => activeTrade ? s.trade_id === activeTrade : selectedTradeIds.includes(s.trade_id)
  )

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Oficios y servicios</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Plan {effectivePlan}: hasta {limits.max_trades} oficio(s) y {limits.max_services} servicio(s)
          </p>
        </div>
        <Button onClick={handleSave} loading={saving} size="sm">
          Guardar cambios
        </Button>
      </div>

      {effectivePlan === 'FREE' && (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-50 border border-amber-200 text-sm">
          <Lock className="w-4 h-4 text-amber-600 shrink-0" />
          <p className="text-amber-800">
            Plan Gratis: 1 oficio y 3 servicios máx.
            <Link href="/dashboard/plan" className="text-primary ml-1 font-semibold hover:underline">Mejorar plan →</Link>
          </p>
        </div>
      )}

      {/* Trades selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Oficios</CardTitle>
          <CardDescription>
            Seleccionados: {selectedTradeIds.length}/{limits.max_trades === 999 ? '∞' : limits.max_trades}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {allTrades.map(trade => {
              const isSelected = selectedTradeIds.includes(trade.id)
              const atLimit = !isSelected && selectedTradeIds.length >= limits.max_trades
              return (
                <button
                  key={trade.id}
                  type="button"
                  onClick={() => !atLimit && toggleTrade(trade.id)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                    isSelected
                      ? 'bg-primary text-white border-primary'
                      : atLimit
                      ? 'border-border text-muted-foreground opacity-50 cursor-not-allowed'
                      : 'border-border hover:border-primary hover:text-primary'
                  }`}
                >
                  {trade.nombre}
                  {isSelected && <X className="inline w-3 h-3 ml-1" />}
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Services selection */}
      {selectedTradeIds.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Servicios</CardTitle>
            <CardDescription>
              Seleccionados: {selectedServiceIds.length}/{limits.max_services === 999 ? '∞' : limits.max_services}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Trade filter tabs */}
            <div className="flex gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => setActiveTrade(null)}
                className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                  activeTrade === null ? 'bg-primary text-white border-primary' : 'border-border hover:border-primary'
                }`}
              >
                Todos
              </button>
              {allTrades.filter(t => selectedTradeIds.includes(t.id)).map(trade => (
                <button
                  key={trade.id}
                  type="button"
                  onClick={() => setActiveTrade(trade.id)}
                  className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                    activeTrade === trade.id ? 'bg-primary text-white border-primary' : 'border-border hover:border-primary'
                  }`}
                >
                  {trade.nombre}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap gap-2">
              {activeTradeServices.map(service => {
                const isSelected = selectedServiceIds.includes(service.id)
                const atLimit = !isSelected && selectedServiceIds.length >= limits.max_services
                return (
                  <button
                    key={service.id}
                    type="button"
                    onClick={() => !atLimit && toggleService(service.id)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                      isSelected
                        ? 'bg-primary/10 text-primary border-primary/30'
                        : atLimit
                        ? 'border-border text-muted-foreground opacity-50 cursor-not-allowed'
                        : 'border-border hover:border-primary/30 hover:text-primary'
                    }`}
                  >
                    {service.nombre}
                    {isSelected && <X className="inline w-3 h-3 ml-1" />}
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
