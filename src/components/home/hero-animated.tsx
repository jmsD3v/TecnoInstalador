'use client'

import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap } from '@/lib/gsap'
import Link from 'next/link'
import { Zap, ArrowRight, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface HeroAnimatedProps {
  isLoggedIn: boolean
}

export function HeroAnimated({ isLoggedIn }: HeroAnimatedProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power2.out' } })
    tl
      .from('.hero-badge', { opacity: 0, y: -20, duration: 0.5 })
      .from('.hero-title', { opacity: 0, y: 30, duration: 0.6 }, '-=0.2')
      .from('.hero-subtitle', { opacity: 0, y: 20, duration: 0.5 }, '-=0.3')
      .from('.hero-cta', { opacity: 0, y: 20, duration: 0.4, stagger: 0.1 }, '-=0.2')
      .from('.hero-social', { opacity: 0, duration: 0.4 }, '-=0.1')
  }, { scope: containerRef })

  return (
    <div ref={containerRef} className="relative container mx-auto px-4 py-20 md:py-36">
      <div className="max-w-3xl">
        <div className="hero-badge inline-flex items-center gap-2 border border-primary/30 bg-primary/10 text-primary text-xs font-bold px-4 py-2 rounded-full mb-8 tracking-wider uppercase">
          <Zap className="w-3.5 h-3.5" />
          Plataforma para profesionales del oficio
        </div>

        <h1 className="hero-title text-5xl md:text-7xl font-extrabold leading-[1.05] tracking-tight mb-6">
          Tu perfil<br />
          <span className="bg-gradient-to-r from-orange-500 via-orange-400 to-yellow-400 bg-clip-text text-transparent">
            profesional
          </span><br />
          en minutos
        </h1>

        <p className="hero-subtitle text-lg md:text-xl text-muted-foreground max-w-xl mb-10 leading-relaxed">
          Mostrá tus servicios,{' '}
          <span className="text-emerald-400 font-semibold">recibí reseñas verificadas</span>{' '}
          y conectá con nuevos clientes desde cualquier dispositivo.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <Button size="xl" asChild className="hero-cta font-bold shadow-lg shadow-primary/25">
            <Link href={isLoggedIn ? '/dashboard' : '/auth/register'}>
              {isLoggedIn ? 'Ir a mi dashboard' : 'Crear mi perfil gratis'}
              <ArrowRight className="w-5 h-5" />
            </Link>
          </Button>
          <Button size="xl" variant="outline" asChild className="hero-cta">
            <Link href="/buscar">Ver instaladores</Link>
          </Button>
        </div>

        <div className="hero-social flex items-center gap-6 mt-10 flex-wrap">
          <div className="flex -space-x-2">
            {[
              { bg: '#f97316', init: 'JM' },
              { bg: '#fb923c', init: 'CR' },
              { bg: '#3b82f6', init: 'MP' },
              { bg: '#8b5cf6', init: 'AL' },
            ].map((a, i) => (
              <div key={i} className="w-8 h-8 rounded-full border-2 border-background flex items-center justify-center text-xs font-bold text-white" style={{ background: a.bg }}>
                {a.init}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <div className="flex">
              {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />)}
            </div>
            <span><span className="text-foreground font-semibold">+500</span> profesionales activos</span>
          </div>
        </div>
      </div>
    </div>
  )
}
