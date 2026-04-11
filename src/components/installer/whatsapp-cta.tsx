'use client'

import { MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { buildWhatsAppUrl, buildContactMessage } from "@/lib/utils"
import { cn } from "@/lib/utils"

interface WhatsAppCTAProps {
  whatsapp: string
  installerName: string
  service?: string
  fixed?: boolean
  className?: string
  label?: string
}

export function WhatsAppCTA({
  whatsapp,
  installerName,
  service,
  fixed = false,
  className,
  label = "Contactar por WhatsApp",
}: WhatsAppCTAProps) {
  const message = buildContactMessage(installerName, service)
  const url = buildWhatsAppUrl(whatsapp, message)

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        fixed &&
          "fixed bottom-20 right-4 z-50 md:bottom-8 lg:bottom-8 shadow-lg shadow-green-500/30",
        className
      )}
    >
      <Button
        variant="whatsapp"
        size={fixed ? "lg" : "default"}
        className={cn(fixed && "rounded-full px-6 font-bold text-base shadow-lg")}
      >
        <MessageCircle className="w-5 h-5" />
        {label}
      </Button>
    </a>
  )
}
