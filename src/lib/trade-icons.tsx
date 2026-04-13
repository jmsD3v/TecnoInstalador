import {
  Zap, Droplets, Flame, Wind, Monitor, Wifi, Camera, Smartphone,
  Package, Sun, HardHat, Leaf, PaintBucket, Hammer, KeyRound,
  Truck, Wrench, type LucideIcon,
} from 'lucide-react'

interface TradeIcon {
  Icon: LucideIcon
  gradient: string
}

const MAP: Array<{ keywords: string[]; icon: TradeIcon }> = [
  { keywords: ['electric', 'electricist'], icon: { Icon: Zap,         gradient: 'from-yellow-400 to-amber-500' } },
  { keywords: ['plomer', 'plomería', 'sanitari'], icon: { Icon: Droplets,    gradient: 'from-sky-400 to-blue-500' } },
  { keywords: ['gas', 'gasfiter'],              icon: { Icon: Flame,       gradient: 'from-orange-500 to-red-500' } },
  { keywords: ['aire', 'acondicion', 'hvac', 'refriger', 'clima'], icon: { Icon: Wind, gradient: 'from-cyan-400 to-teal-500' } },
  { keywords: ['pc', 'computadora', 'técnico pc', 'computac'], icon: { Icon: Monitor, gradient: 'from-blue-400 to-indigo-500' } },
  { keywords: ['red', 'internet', 'wifi', 'cableado'],            icon: { Icon: Wifi,    gradient: 'from-violet-400 to-purple-500' } },
  { keywords: ['cámara', 'camara', 'cctv', 'seguridad', 'vigilanc'], icon: { Icon: Camera, gradient: 'from-slate-400 to-slate-600' } },
  { keywords: ['celular', 'smartphone', 'móvil', 'movil', 'tablet'], icon: { Icon: Smartphone, gradient: 'from-pink-400 to-rose-500' } },
  { keywords: ['mueble', 'mdf', 'carpinter', 'maderer'],          icon: { Icon: Package, gradient: 'from-amber-400 to-yellow-600' } },
  { keywords: ['solar', 'paneles solar', 'fotovolt'],             icon: { Icon: Sun,     gradient: 'from-yellow-300 to-orange-400' } },
  { keywords: ['albañil', 'albanil', 'construcc', 'revoque', 'mampost'], icon: { Icon: HardHat, gradient: 'from-stone-400 to-stone-600' } },
  { keywords: ['jardín', 'jardin', 'paisajism', 'podador'],       icon: { Icon: Leaf,    gradient: 'from-emerald-400 to-green-500' } },
  { keywords: ['pintur', 'pintor'],                               icon: { Icon: PaintBucket, gradient: 'from-lime-400 to-green-500' } },
  { keywords: ['herrer', 'solda', 'metal', 'hierro'],             icon: { Icon: Hammer,  gradient: 'from-gray-400 to-gray-600' } },
  { keywords: ['cerrajer', 'cerradura', 'llave'],                 icon: { Icon: KeyRound, gradient: 'from-rose-400 to-pink-600' } },
  { keywords: ['flet', 'mudanza', 'transport'],                   icon: { Icon: Truck,   gradient: 'from-blue-300 to-sky-500' } },
]

export function getTradeIcon(tradeName: string): TradeIcon {
  const lower = tradeName.toLowerCase()
  for (const { keywords, icon } of MAP) {
    if (keywords.some(kw => lower.includes(kw))) return icon
  }
  return { Icon: Wrench, gradient: 'from-primary/70 to-primary' }
}
