'use client'

import { useEffect, useRef, useState } from 'react'

// Parses "+2.400" → { num: 2400, prefix: "+", suffix: "", decimals: 0 }
// Parses "4.8★"  → { num: 4.8,  prefix: "",  suffix: "★", decimals: 1 }
function parse(value: string) {
  const prefix = value.startsWith('+') ? '+' : ''
  const raw = value.replace(/^[+]/, '').replace(/[^\d.,]/g, '')
  const isThousands = /\d+\.\d{3}$/.test(raw)
  const normalized = isThousands ? raw.replace('.', '') : raw.replace(',', '.')
  const num = parseFloat(normalized)
  const decimals = isThousands ? 0 : (normalized.includes('.') ? normalized.split('.')[1].length : 0)
  const suffix = value.replace(/^[+]/, '').replace(/[\d.,]/g, '')
  return { num, prefix, suffix, decimals, isThousands }
}

function formatNum(n: number, decimals: number, isThousands: boolean) {
  if (isThousands) return new Intl.NumberFormat('es-AR').format(Math.round(n))
  return n.toFixed(decimals)
}

// Only animates the number — icon and label stay in the server component
export function CountUp({ value, color }: { value: string; color: string }) {
  const { num, prefix, suffix, decimals, isThousands } = parse(value)
  const [display, setDisplay] = useState(formatNum(0, decimals, isThousands))
  const raf = useRef<number | null>(null)
  const elRef = useRef<HTMLParagraphElement>(null)
  const started = useRef(false)

  useEffect(() => {
    const el = elRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || started.current) return
        started.current = true
        observer.disconnect()

        const duration = 1400
        const start = performance.now()

        function tick(now: number) {
          const elapsed = now - start
          const progress = Math.min(elapsed / duration, 1)
          const eased = 1 - Math.pow(1 - progress, 3)
          setDisplay(formatNum(eased * num, decimals, isThousands))
          if (progress < 1) {
            raf.current = requestAnimationFrame(tick)
          } else {
            setDisplay(formatNum(num, decimals, isThousands))
          }
        }

        raf.current = requestAnimationFrame(tick)
      },
      { threshold: 0.1 }
    )

    observer.observe(el)
    return () => {
      observer.disconnect()
      if (raf.current) cancelAnimationFrame(raf.current)
    }
  }, [num, decimals, isThousands])

  return (
    <p ref={elRef} className={`text-3xl font-extrabold tabular-nums ${color}`}>
      {prefix}{display}{suffix}
    </p>
  )
}
