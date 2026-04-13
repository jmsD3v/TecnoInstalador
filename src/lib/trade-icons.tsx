import {
  IconPlug, IconDroplet, IconFlame, IconAirConditioning, IconWall, IconAntenna,
  IconCamera, IconHammer, IconKey, IconBolt, IconSolarPanel, IconDeviceLaptop,
  IconDeviceDesktop, IconPlant, IconBucket, IconEngine, IconCar, IconTruck,
  IconPaint, IconNetwork, IconWashMachine, IconBuilding, IconBug, IconSmartHome,
  IconDeviceMobile, IconWindow, IconDoor, IconRouter,
  type TablerIcon,
} from '@tabler/icons-react'

interface TradeIcon {
  Icon: TablerIcon
  gradient: string
}

const MAP: Array<{ keywords: string[]; icon: TradeIcon }> = [
  { keywords: ['electricista'],                           icon: { Icon: IconPlug,             gradient: 'from-yellow-400 to-amber-500' } },
  { keywords: ['plomero'],                                icon: { Icon: IconDroplet,           gradient: 'from-sky-400 to-blue-500' } },
  { keywords: ['gasista'],                                icon: { Icon: IconFlame,             gradient: 'from-orange-500 to-red-500' } },
  { keywords: ['a/c', 'refriger', 'aire acond'],          icon: { Icon: IconAirConditioning,   gradient: 'from-cyan-400 to-teal-500' } },
  { keywords: ['albañil'],                                icon: { Icon: IconWall,              gradient: 'from-stone-400 to-stone-600' } },
  { keywords: ['antena', 'televisión', ' tv'],            icon: { Icon: IconAntenna,           gradient: 'from-slate-400 to-slate-700' } },
  { keywords: ['cámara', 'camara', 'cctv'],               icon: { Icon: IconCamera,            gradient: 'from-slate-500 to-zinc-700' } },
  { keywords: ['carpintero de mueble', 'mdf'],            icon: { Icon: IconHammer,            gradient: 'from-amber-400 to-yellow-600' } },
  { keywords: ['carpintero'],                             icon: { Icon: IconHammer,            gradient: 'from-amber-600 to-orange-700' } },
  { keywords: ['cerrajero'],                              icon: { Icon: IconKey,               gradient: 'from-rose-400 to-pink-600' } },
  { keywords: ['herrero', 'soldador'],                    icon: { Icon: IconBolt,              gradient: 'from-gray-400 to-gray-700' } },
  { keywords: ['impermeab'],                              icon: { Icon: IconWall,              gradient: 'from-blue-400 to-sky-500' } },
  { keywords: ['pc y notebook', 'pc y', 'notebook'],      icon: { Icon: IconDeviceLaptop,      gradient: 'from-blue-400 to-indigo-500' } },
  { keywords: ['informátic', 'informatica'],              icon: { Icon: IconDeviceDesktop,     gradient: 'from-indigo-400 to-blue-600' } },
  { keywords: ['jardinero'],                              icon: { Icon: IconPlant,             gradient: 'from-emerald-400 to-green-600' } },
  { keywords: ['limpieza'],                               icon: { Icon: IconBucket,            gradient: 'from-sky-300 to-cyan-500' } },
  { keywords: ['mecánico automotriz', 'mecanico'],        icon: { Icon: IconEngine,            gradient: 'from-blue-500 to-indigo-700' } },
  { keywords: ['pintor de automóvil', 'pintor de auto'],  icon: { Icon: IconCar,               gradient: 'from-red-400 to-rose-600' } },
  { keywords: ['flete', 'mudanza'],                       icon: { Icon: IconTruck,             gradient: 'from-blue-300 to-sky-500' } },
  { keywords: ['pintor'],                                 icon: { Icon: IconPaint,             gradient: 'from-lime-400 to-green-500' } },
  { keywords: ['piso', 'revestim'],                       icon: { Icon: IconWall,              gradient: 'from-stone-300 to-stone-600' } },
  { keywords: ['portón', 'porton', 'automatism'],         icon: { Icon: IconDoor,              gradient: 'from-gray-400 to-gray-700' } },
  { keywords: ['redes e internet', 'redes'],              icon: { Icon: IconRouter,            gradient: 'from-violet-400 to-purple-500' } },
  { keywords: ['electrodomésto', 'electrodomestic'],      icon: { Icon: IconWashMachine,       gradient: 'from-orange-400 to-red-500' } },
  { keywords: ['techista'],                               icon: { Icon: IconBuilding,          gradient: 'from-stone-400 to-stone-600' } },
  { keywords: ['solar', 'instalador solar'],              icon: { Icon: IconSolarPanel,        gradient: 'from-yellow-300 to-orange-400' } },
  { keywords: ['fumigador'],                              icon: { Icon: IconBug,               gradient: 'from-green-600 to-emerald-700' } },
  { keywords: ['domótica', 'domotica', 'smart home'],     icon: { Icon: IconSmartHome,         gradient: 'from-indigo-400 to-violet-600' } },
  { keywords: ['celular', 'móvil', 'movil'],              icon: { Icon: IconDeviceMobile,      gradient: 'from-pink-400 to-rose-500' } },
  { keywords: ['vidriero', 'aberturas', 'vidriería'],     icon: { Icon: IconWindow,            gradient: 'from-sky-200 to-blue-400' } },
  { keywords: ['network', 'infraestructura'],             icon: { Icon: IconNetwork,           gradient: 'from-violet-300 to-purple-400' } },
]

export function getTradeIcon(tradeName: string): TradeIcon {
  const lower = tradeName.toLowerCase()
  for (const { keywords, icon } of MAP) {
    if (keywords.some(kw => lower.includes(kw))) return icon
  }
  return { Icon: IconPlug, gradient: 'from-primary/70 to-primary' }
}
