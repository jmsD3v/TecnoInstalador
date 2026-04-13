'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  Zap,
  ArrowRight,
  Star,
  Search,
  MapPin,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const DURATION = 6000; // ms per slide

interface Props {
  isLoggedIn: boolean;
}

export function HeroCarousel({ isLoggedIn }: Props) {
  const [active, setActive] = useState(0);
  const [prev, setPrev] = useState<number | null>(null);
  const [animating, setAnimating] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const goTo = useCallback(
    (next: number) => {
      if (animating) return;
      setAnimating(true);
      setPrev(active);
      setActive(next);
      setTimeout(() => {
        setPrev(null);
        setAnimating(false);
      }, 600);
    },
    [active, animating],
  );

  // Auto-advance
  useEffect(() => {
    timerRef.current = setTimeout(() => goTo(active === 0 ? 1 : 0), DURATION);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [active, goTo]);

  return (
    <div className='relative min-h-[620px] sm:min-h-[660px] md:min-h-[780px] overflow-hidden'>
      {/* ── SLIDE 0 — INSTALLER ── */}
      <SlideWrapper visible={active === 0} exiting={prev === 0}>
        <div className='container mx-auto px-5 pt-14 pb-16 sm:pt-20 sm:pb-20 md:pt-36 md:pb-28'>
          <InstallerHero isLoggedIn={isLoggedIn} />
        </div>
      </SlideWrapper>

      {/* ── SLIDE 1 — CLIENT ── */}
      <SlideWrapper visible={active === 1} exiting={prev === 1}>
        <div className='container mx-auto px-5 pt-14 pb-16 sm:pt-20 sm:pb-20 md:pt-36 md:pb-28'>
          <ClientHero />
        </div>
      </SlideWrapper>

      {/* ── DOTS ── */}
      <div className='absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2.5 z-20'>
        {[0, 1].map((i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            aria-label={`Slide ${i + 1}`}
            className={cn(
              'h-1.5 rounded-full transition-all duration-300',
              active === i
                ? i === 0
                  ? 'w-8 bg-orange-400'
                  : 'w-8 bg-emerald-400'
                : 'w-2 bg-border hover:bg-muted-foreground',
            )}
          />
        ))}
      </div>
    </div>
  );
}

/* ── Slide transition wrapper ────────────────────────────── */
function SlideWrapper({
  visible,
  exiting,
  children,
}: {
  visible: boolean;
  exiting: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        'absolute inset-0 transition-all duration-500',
        visible && !exiting && 'opacity-100 translate-y-0 z-10',
        exiting && 'opacity-0 -translate-y-4 z-0 pointer-events-none',
        !visible &&
          !exiting &&
          'opacity-0 translate-y-4 z-0 pointer-events-none',
      )}
    >
      {children}
    </div>
  );
}

/* ── Slide 0: Installer ──────────────────────────────────── */
function InstallerHero({ isLoggedIn }: { isLoggedIn: boolean }) {
  return (
    <div className='max-w-3xl'>
      <div className='inline-flex items-center gap-2 border border-primary/30 bg-primary/10 text-primary text-[11px] sm:text-xs font-bold px-3 sm:px-4 py-1.5 sm:py-2 rounded-full mb-5 sm:mb-8 tracking-wider uppercase'>
        <Zap className='w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0' />
        <span className='hidden sm:inline'>
          Plataforma para profesionales del oficio
        </span>
        <span className='sm:hidden'>Para profesionales del oficio</span>
      </div>

      <h1 className='text-4xl sm:text-5xl md:text-7xl font-extrabold leading-[1.05] tracking-tight mb-4 sm:mb-6'>
        Tu perfil
        <br />
        <span className='bg-linear-to-r from-orange-500 via-orange-400 to-yellow-400 bg-clip-text text-transparent'>
          profesional
        </span>
        <br />
        en minutos
      </h1>

      <p className='text-base sm:text-lg md:text-xl text-muted-foreground max-w-xl mb-7 sm:mb-10 leading-relaxed'>
        Mostrá tus servicios,<br />
        <span className='text-orange-400 font-semibold'>recibí reseñas verificadas</span><br />
        y conseguí más clientes sin intermediarios.
      </p>

      <div className='flex flex-col sm:flex-row gap-3 sm:gap-4'>
        <Button
          size='xl'
          asChild
          className='w-full sm:w-[256px] sm:px-5 justify-center font-bold shadow-lg shadow-primary/25'
        >
          <Link href={isLoggedIn ? '/dashboard' : '/auth/register'}>
            {isLoggedIn ? 'Ir a mi panel' : 'Crear mi perfil'}
            <ArrowRight className='w-5 h-5 shrink-0' />
          </Link>
        </Button>
        <Button
          size='xl'
          variant='outline'
          asChild
          className='w-full sm:w-[256px] sm:px-5 justify-center'
        >
          <Link href='/buscar'>
            Ver instaladores
            <ArrowRight className='w-5 h-5 shrink-0' />
          </Link>
        </Button>
      </div>

      <div className='flex items-center gap-4 sm:gap-6 mt-7 sm:mt-10'>
        <div className='flex -space-x-2'>
          {[
            { bg: '#f97316', init: 'JM' },
            { bg: '#fb923c', init: 'CR' },
            { bg: '#3b82f6', init: 'MP' },
            { bg: '#8b5cf6', init: 'AL' },
          ].map((a, i) => (
            <div
              key={i}
              className='w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 border-background flex items-center justify-center text-[10px] sm:text-xs font-bold text-white'
              style={{ background: a.bg }}
            >
              {a.init}
            </div>
          ))}
        </div>
        <div className='flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground'>
          <div className='flex'>
            {[1, 2, 3, 4, 5].map((i) => (
              <Star
                key={i}
                className='w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-400 fill-yellow-400'
              />
            ))}
          </div>
          <span>
            <span className='text-foreground font-semibold'>+500</span>{' '}
            profesionales activos
          </span>
        </div>
      </div>
    </div>
  );
}

/* ── Slide 1: Client ─────────────────────────────────────── */
function ClientHero() {
  return (
    <div className='max-w-3xl'>
      <div className='inline-flex items-center gap-2 border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-[11px] sm:text-xs font-bold px-3 sm:px-4 py-1.5 sm:py-2 rounded-full mb-5 sm:mb-8 tracking-wider uppercase'>
        <Search className='w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0' />
        <span className='hidden sm:inline'>
          Encontrá al profesional que necesitás
        </span>
        <span className='sm:hidden'>Encontrá al profesional ideal</span>
      </div>

      <h1 className='text-4xl sm:text-5xl md:text-7xl font-extrabold leading-[1.05] tracking-tight mb-4 sm:mb-6'>
        El técnico
        <br />
        <span className='bg-linear-to-r from-emerald-400 via-green-300 to-lime-300 bg-clip-text text-transparent'>
          que buscás
        </span>
        <br />
        cerca tuyo
      </h1>

      <p className='text-base sm:text-lg md:text-xl text-muted-foreground max-w-xl mb-7 sm:mb-10 leading-relaxed'>
        Electricistas, plomeros, gasistas y más —<br />
        <span className='text-emerald-400 font-semibold'>verificados con reseñas reales</span><br />
        contacto directo por WhatsApp.
      </p>

      <div className='flex flex-col sm:flex-row gap-3 sm:gap-4'>
        <Button
          size='xl'
          asChild
          className='w-full sm:w-[256px] sm:px-5 justify-center font-bold shadow-lg shadow-emerald-500/20 bg-emerald-500 hover:bg-emerald-400 text-white'
        >
          <Link href='/buscar'>
            <Search className='w-5 h-5 shrink-0' />
            Buscar técnico
          </Link>
        </Button>
        <Button
          size='xl'
          variant='outline'
          asChild
          className='w-full sm:w-[256px] sm:px-5 justify-center'
        >
          <Link href='/auth/register'>
            <Zap className='w-5 h-5 shrink-0' />
            ¿Sos profesional?
          </Link>
        </Button>
      </div>

      <div className='flex items-center gap-4 sm:gap-6 mt-7 sm:mt-10'>
        <div className='flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground'>
          <ShieldCheck className='w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 shrink-0' />
          <span>Verificados · Sin registro</span>
        </div>
        <div className='flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground'>
          <div className='flex'>
            {[1, 2, 3, 4, 5].map((i) => (
              <Star
                key={i}
                className='w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-400 fill-yellow-400'
              />
            ))}
          </div>
          <span>
            <span className='text-foreground font-semibold'>4.8★</span> rating
            promedio
          </span>
        </div>
      </div>
    </div>
  );
}
