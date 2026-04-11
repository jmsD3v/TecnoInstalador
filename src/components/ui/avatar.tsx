'use client'

import * as React from "react"
import * as AvatarPrimitive from "@radix-ui/react-avatar"
import { cn } from "@/lib/utils"
import { getInitials } from "@/lib/utils"

// ─── Avatar ──────────────────────────────────

const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
      className
    )}
    {...props}
  />
))
Avatar.displayName = AvatarPrimitive.Root.displayName

const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    className={cn("aspect-square h-full w-full object-cover", className)}
    {...props}
  />
))
AvatarImage.displayName = AvatarPrimitive.Image.displayName

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(
      "flex h-full w-full items-center justify-center rounded-full bg-muted font-semibold text-muted-foreground",
      className
    )}
    {...props}
  />
))
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName

// ─── InstallerAvatar ─────────────────────────

interface InstallerAvatarProps {
  nombre: string
  apellido: string
  fotoUrl?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const sizeMap = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-16 w-16 text-xl',
  xl: 'h-24 w-24 text-3xl',
}

export function InstallerAvatar({ nombre, apellido, fotoUrl, size = 'md', className }: InstallerAvatarProps) {
  return (
    <Avatar className={cn(sizeMap[size], className)}>
      {fotoUrl && <AvatarImage src={fotoUrl} alt={`${nombre} ${apellido}`} />}
      <AvatarFallback className="bg-primary/10 text-primary font-bold">
        {getInitials(nombre, apellido)}
      </AvatarFallback>
    </Avatar>
  )
}

// ─── StarRating ──────────────────────────────

interface StarRatingProps {
  rating: number
  max?: number
  size?: 'sm' | 'md' | 'lg'
  showNumber?: boolean
  interactive?: boolean
  onChange?: (rating: number) => void
  className?: string
}

export function StarRating({
  rating,
  max = 5,
  size = 'md',
  showNumber = false,
  interactive = false,
  onChange,
  className,
}: StarRatingProps) {
  const [hovered, setHovered] = React.useState(0)
  const starSize = size === 'sm' ? 'text-sm' : size === 'md' ? 'text-xl' : 'text-3xl'

  return (
    <div className={cn("flex items-center gap-0.5", className)}>
      {Array.from({ length: max }, (_, i) => {
        const filled = interactive ? (hovered || rating) > i : rating > i
        return (
          <span
            key={i}
            className={cn(
              starSize,
              "transition-colors duration-100 select-none",
              filled ? "text-yellow-400" : "text-gray-200",
              interactive && "cursor-pointer hover:scale-110 transition-transform"
            )}
            onMouseEnter={() => interactive && setHovered(i + 1)}
            onMouseLeave={() => interactive && setHovered(0)}
            onClick={() => interactive && onChange?.(i + 1)}
            role={interactive ? "button" : undefined}
            aria-label={interactive ? `${i + 1} estrellas` : undefined}
          >
            ★
          </span>
        )
      })}
      {showNumber && (
        <span className="ml-1 text-sm font-semibold text-foreground">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  )
}

export { Avatar, AvatarImage, AvatarFallback }
