export interface ProfileForScore {
  foto_perfil_url?: string | null
  descripcion?: string | null
  ciudad?: string | null
  whatsapp?: string | null
  titulo_profesional?: string | null
  nombre_comercial?: string | null
  installer_trades?: unknown[]
  installer_services?: unknown[]
  gallery_items?: unknown[]
  review_count?: number
}

interface ScoreItem {
  label: string
  done: boolean
  points: number
}

export function computeProfileScore(p: ProfileForScore): { score: number; items: ScoreItem[] } {
  const items: ScoreItem[] = [
    { label: 'Foto de perfil',       done: !!p.foto_perfil_url,                                 points: 15 },
    { label: 'Descripción',          done: !!p.descripcion && p.descripcion.length >= 50,        points: 15 },
    { label: 'Ciudad',               done: !!p.ciudad,                                           points: 10 },
    { label: 'WhatsApp',             done: !!p.whatsapp,                                         points: 10 },
    { label: 'Título profesional',   done: !!p.titulo_profesional,                               points: 10 },
    { label: 'Nombre comercial',     done: !!p.nombre_comercial,                                 points: 5  },
    { label: 'Al menos 1 oficio',    done: (p.installer_trades?.length ?? 0) > 0,               points: 15 },
    { label: 'Al menos 1 servicio',  done: (p.installer_services?.length ?? 0) > 0,             points: 10 },
    { label: 'Al menos 1 foto',      done: (p.gallery_items?.length ?? 0) > 0,                  points: 5  },
    { label: 'Al menos 1 reseña',    done: (p.review_count ?? 0) > 0,                           points: 5  },
  ]
  const total = items.reduce((acc, i) => acc + i.points, 0)           // 100
  const score = items.filter(i => i.done).reduce((acc, i) => acc + i.points, 0)
  return { score: Math.round((score / total) * 100), items }
}
