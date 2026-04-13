import Link from "next/link"
import { MapPin, Star, MessageCircle, Crown, Zap } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { InstallerAvatar, StarRating } from "@/components/ui/avatar"
import { Installer, InstallerTrade } from "@/types"
import { buildWhatsAppUrl, buildContactMessage } from "@/lib/utils"
import { cn } from "@/lib/utils"

interface InstallerCardProps {
  installer: Installer & { installer_trades?: (InstallerTrade & { trade?: { nombre: string } })[] }
  className?: string
}

function PlanIcon({ plan }: { plan: string }) {
  if (plan === 'PREMIUM') return <Crown className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
  if (plan === 'PRO') return <Zap className="w-3.5 h-3.5 text-blue-400 shrink-0" />
  return null
}

export function InstallerCard({ installer, className }: InstallerCardProps) {
  const trades = installer.installer_trades?.map(it => it.trade?.nombre).filter(Boolean) ?? []
  const mainTrade = trades[0] ?? "Profesional"
  const waUrl = buildWhatsAppUrl(
    installer.whatsapp,
    buildContactMessage(installer.nombre_comercial ?? installer.nombre)
  )
  const displayName = installer.nombre_comercial ?? `${installer.nombre} ${installer.apellido}`

  return (
    <Card className={cn(
      "overflow-hidden hover:shadow-md transition-shadow duration-200",
      installer.plan === 'PREMIUM' && "ring-2 ring-yellow-400/40",
      installer.plan === 'PRO' && "ring-1 ring-blue-400/30",
      className
    )}>
      <CardContent className="p-4">
        {/* Header: avatar + name + plan icon */}
        <div className="flex items-start gap-3 mb-3">
          <InstallerAvatar
            nombre={installer.nombre}
            apellido={installer.apellido}
            fotoUrl={installer.foto_perfil_url}
            size="lg"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="font-bold text-base leading-tight">{displayName}</h3>
              <PlanIcon plan={installer.plan} />
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">
              {installer.titulo_profesional || mainTrade}
            </p>
            <div className="flex items-center gap-1 mt-1">
              <StarRating rating={installer.avg_rating} size="sm" />
              <span className="text-xs text-muted-foreground">
                {installer.avg_rating.toFixed(1)} ({installer.total_reviews})
              </span>
            </div>
          </div>
        </div>

        {/* Location + up to 2 trade tags */}
        <div className="flex flex-wrap items-center gap-1.5 mb-4">
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="w-3 h-3 shrink-0" />
            {installer.ciudad}, {installer.provincia}
          </span>
          {trades.slice(0, 2).map(trade => (
            <span key={trade} className="text-xs bg-muted px-2 py-0.5 rounded-full">
              {trade}
            </span>
          ))}
          {trades.length > 2 && (
            <span className="text-xs text-muted-foreground">+{trades.length - 2}</span>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
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
