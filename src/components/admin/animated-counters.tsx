'use client'

import { useEffect, useRef } from 'react'
import { gsap } from '@/lib/gsap'
import { Users, TrendingUp, Star, CreditCard } from 'lucide-react'

interface CounterCard {
  label: string
  value: number
  prefix?: string
  suffix?: string
  icon: 'users' | 'trending' | 'star' | 'credit'
  color: string
}

const ICONS = {
  users: Users,
  trending: TrendingUp,
  star: Star,
  credit: CreditCard,
}

function Counter({ end, prefix = '', suffix = '' }: { end: number; prefix?: string; suffix?: string }) {
  const spanRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (!spanRef.current) return
    const obj = { val: 0 }
    gsap.to(obj, {
      val: end,
      duration: 1.4,
      ease: 'power2.out',
      delay: 0.2,
      onUpdate() {
        if (spanRef.current) {
          spanRef.current.textContent = prefix + Math.round(obj.val).toLocaleString('es-AR') + suffix
        }
      },
    })
  }, [end, prefix, suffix])

  return <span ref={spanRef}>{prefix}0{suffix}</span>
}

export function AnimatedCounters({ cards }: { cards: CounterCard[] }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map(card => {
        const Icon = ICONS[card.icon]
        return (
          <div key={card.label} className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <Icon className={`w-5 h-5 ${card.color} mb-2`} />
            <p className={`text-3xl font-bold ${card.color}`}>
              <Counter end={card.value} prefix={card.prefix} suffix={card.suffix} />
            </p>
            <p className="text-xs text-slate-400 mt-1">{card.label}</p>
          </div>
        )
      })}
    </div>
  )
}
