'use client'

import { useState, useTransition, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trade } from "@/types"
import { Search, MapPin } from "lucide-react"

const PROVINCIAS = [
  'Buenos Aires', 'Ciudad Autónoma de Buenos Aires', 'Catamarca', 'Chaco', 'Chubut',
  'Córdoba', 'Corrientes', 'Entre Ríos', 'Formosa', 'Jujuy', 'La Pampa', 'La Rioja',
  'Mendoza', 'Misiones', 'Neuquén', 'Río Negro', 'Salta', 'San Juan', 'San Luis',
  'Santa Cruz', 'Santa Fe', 'Santiago del Estero', 'Tierra del Fuego', 'Tucumán',
]

interface Props {
  trades: Trade[]
  initialParams: { ciudad?: string; trade?: string; provincia?: string }
}

export function MarketplaceFilters({ trades, initialParams }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [provincia, setProvincia] = useState(initialParams.provincia ?? '')
  const [ciudad, setCiudad] = useState(initialParams.ciudad ?? '')
  const [trade, setTrade] = useState(initialParams.trade ?? '')

  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [activeSuggestion, setActiveSuggestion] = useState(-1)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)

  // Fetch city suggestions when ciudad or provincia changes
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)

    const hasQuery = ciudad.trim().length >= 3
    const hasProvincia = provincia !== ''

    if (!hasQuery) {
      setSuggestions([])
      return
    }

    debounceRef.current = setTimeout(async () => {
      const params = new URLSearchParams()
      params.set('q', ciudad.trim())
      if (hasProvincia) params.set('provincia', provincia)

      try {
        const res = await fetch(`/api/cities?${params}`)
        const cities: string[] = await res.json()
        setSuggestions(cities)
        setShowSuggestions(cities.length > 0)
        setActiveSuggestion(-1)
      } catch {
        setSuggestions([])
      }
    }, 300)
  }, [ciudad, provincia])

  // When province changes, reset city and fetch top cities for that province
  const handleProvinciaChange = (val: string) => {
    setProvincia(val)
    setCiudad('')
    setSuggestions([])
  }

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node))
        setShowSuggestions(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const selectSuggestion = (value: string) => {
    setCiudad(value)
    setSuggestions([])
    setShowSuggestions(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveSuggestion(i => Math.min(i + 1, suggestions.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveSuggestion(i => Math.max(i - 1, 0))
    } else if (e.key === 'Enter' && activeSuggestion >= 0) {
      e.preventDefault()
      selectSuggestion(suggestions[activeSuggestion])
    } else if (e.key === 'Escape') {
      setShowSuggestions(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setShowSuggestions(false)
    const params = new URLSearchParams()
    if (ciudad) params.set('ciudad', ciudad)
    if (provincia) params.set('provincia', provincia)
    if (trade && trade !== 'todos') params.set('trade', trade)
    startTransition(() => router.push(`/buscar?${params.toString()}`))
  }

  return (
    <form
      onSubmit={handleSearch}
      className="flex flex-col gap-3 p-4 bg-card border border-border rounded-xl shadow-sm"
    >
      <div className="flex flex-col md:flex-row gap-3">

        {/* Provincia */}
        <div className="md:w-56">
          <Select value={provincia} onValueChange={handleProvinciaChange}>
            <SelectTrigger>
              <SelectValue placeholder="Provincia" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas las provincias</SelectItem>
              {PROVINCIAS.map(p => (
                <SelectItem key={p} value={p}>{p}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Ciudad con autocomplete */}
        <div className="flex-1 relative" ref={wrapperRef}>
          <Input
            placeholder={provincia ? `Ciudad en ${provincia}...` : 'Ciudad o localidad...'}
            value={ciudad}
            onChange={e => { setCiudad(e.target.value); setShowSuggestions(true) }}
            onKeyDown={handleKeyDown}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            autoComplete="off"
          />
          {showSuggestions && suggestions.length > 0 && (
            <ul className="absolute z-50 top-full left-0 right-0 mt-1 bg-card border border-border rounded-xl shadow-lg overflow-hidden">
              {suggestions.map((s, i) => (
                <li
                  key={s}
                  onMouseDown={() => selectSuggestion(s)}
                  className={`flex items-center gap-2 px-3 py-2.5 text-sm cursor-pointer transition-colors
                    ${i === activeSuggestion ? 'bg-accent text-foreground' : 'hover:bg-accent/60 text-foreground'}`}
                >
                  <MapPin className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  {s}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Oficio */}
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

        {/* Buscar */}
        <Button type="submit" loading={isPending} className="md:w-auto">
          <Search className="w-4 h-4 mr-2" />
          Buscar
        </Button>
      </div>
    </form>
  )
}
