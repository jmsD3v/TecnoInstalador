'use client'

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trade } from "@/types"
import { Search } from "lucide-react"

interface Props {
  trades: Trade[]
  initialParams: { ciudad?: string; trade?: string; service?: string }
}

export function MarketplaceFilters({ trades, initialParams }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [ciudad, setCiudad] = useState(initialParams.ciudad ?? "")
  const [trade, setTrade] = useState(initialParams.trade ?? "")

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (ciudad) params.set('ciudad', ciudad)
    if (trade && trade !== 'todos') params.set('trade', trade)
    startTransition(() => {
      router.push(`/buscar?${params.toString()}`)
    })
  }

  return (
    <form
      onSubmit={handleSearch}
      className="flex flex-col md:flex-row gap-3 p-4 bg-card border border-border rounded-xl shadow-sm"
    >
      <div className="flex-1">
        <Input
          placeholder="Ciudad (ej: Buenos Aires, Córdoba...)"
          value={ciudad}
          onChange={e => setCiudad(e.target.value)}
          required
        />
      </div>
      <div className="md:w-52">
        <Select value={trade} onValueChange={setTrade}>
          <SelectTrigger>
            <SelectValue placeholder="Todos los oficios" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos los oficios</SelectItem>
            {trades.map(t => (
              <SelectItem key={t.slug} value={t.slug}>{t.nombre}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button type="submit" loading={isPending} className="md:w-auto">
        <Search className="w-4 h-4 mr-2" />
        Buscar
      </Button>
    </form>
  )
}
