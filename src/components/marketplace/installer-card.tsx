import Link from "next/link"
import { MapPin, Star, MessageCircle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PlanBadge } from "@/components/ui/plan-badge"
import { InstallerAvatar, StarRating } from "@/components/ui/avatar"
import { Installer, InstallerTrade } from "@/types"
import { buildWhatsAppUrl, buildContactMessage } from "@/lib/utils"
import { cn } from "@/lib/utils"

interface InstallerCardProps {
  installer: Installer & { installer_trades?: (InstallerTrade & { trade?: { nombre: string } })[] }
  className?: string
}

export function InstallerCard({ installer, className }: InstallerCardProps) {
  const trades = installer.installer_trades?.map(it => it.trade?.nombre).filter(Boolean) ?? []
  const mainTrade = trades[0] ?? "Profesional"
  const waUrl = buildWhatsAppUrl(
    installer.whatsapp,
    buildContactMessage(installer.nombre_comercial ?? installer.nombre)
  )

  return (
    <Card className={cn(
      "overflow-hidden hover:shadow-md transition-shadow duration-200 group",
      installer.plan === 'PREMIUM' && "ring-2 ring-yellow-400/50",
      className
    )}>
      <CardContent className="p-0">
        {/* Header */}
        <div className="p-4 flex items-start gap-3">
          <InstallerAvatar
            nombre={installer.nombre}
            apellido={installer.apellido}
            fotoUrl={installer.foto_perfil_url}
            size="lg"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="font-bold text-base leading-tight truncate">
                  {installer.nombre_comercial ?? `${installer.nombre} ${installer.apellido}`}
                </h3>
                <p className="text-sm text-muted-foreground truncate">{installer.titulo_profesional || mainTrade}</p>
              </div>
              <PlanBadge plan={installer.plan} className="shrink-0" />
            </div>

            {/* Rating */}
            <div className="flex items-center gap-1.5 mt-1">
              <StarRating rating={installer.avg_rating} size="sm" />
              <span className="text-xs text-muted-foreground">
                {installer.avg_rating.toFixed(1)} ({installer.total_reviews})
              </span>
            </div>
          </div>
        </div>

        {/* Location + extra trades */}
        <div className="px-4 pb-3 flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="w-3 h-3" />
            {installer.ciudad}, {installer.provincia}
          </span>
          {trades.slice(1).map(trade => (
            <span key={trade} className="text-xs bg-muted px-2 py-0.5 rounded-full">
              {trade}
            </span>
          ))}
        </div>

        {/* Actions */}
        <div className="px-4 pb-4 flex gap-2">
          <Button variant="outline" size="sm" className="flex-1" asChild>
            <Link href={`/i/${installer.url_slug}`}>Ver perfil</Link>
          </Button>
          <Button variant="whatsapp" size="sm" asChild>
            <a href={waUrl} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="w-4 h-4" />
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
