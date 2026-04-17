'use client'

import { useState, useEffect } from 'react'
import { Bell, Star, BadgeCheck, Info, CheckCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { formatRelativeDate } from '@/lib/utils'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Notification {
  id: string
  type: string
  title: string
  body: string | null
  link: string | null
  is_read: boolean
  created_at: string
}

const supabase = createClient()

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [markingAll, setMarkingAll] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: inst } = await supabase
        .from('installers')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (!inst) return

      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('installer_id', inst.id)
        .order('created_at', { ascending: false })
        .limit(50)

      setNotifications(data ?? [])
      setLoading(false)
    }
    load()
  }, [])

  const markRead = async (id: string) => {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id)
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
    router.refresh()
  }

  const markAllRead = async () => {
    setMarkingAll(true)
    const ids = notifications.filter(n => !n.is_read).map(n => n.id)
    if (ids.length > 0) {
      await supabase.from('notifications').update({ is_read: true }).in('id', ids)
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
      router.refresh()
    }
    setMarkingAll(false)
  }

  const unreadCount = notifications.filter(n => !n.is_read).length

  const iconForType = (type: string) => {
    if (type === 'review') return <Star className="w-4 h-4 text-yellow-500 fill-yellow-400" />
    if (type === 'verification') return <BadgeCheck className="w-4 h-4 text-sky-500" />
    return <Info className="w-4 h-4 text-muted-foreground" />
  }

  if (loading) return (
    <div className="max-w-xl mx-auto py-12 space-y-3">
      {[1, 2, 3].map(i => (
        <div key={i} className="h-16 bg-muted rounded-xl animate-pulse" />
      ))}
    </div>
  )

  return (
    <div className="max-w-xl mx-auto py-8 px-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Bell className="w-6 h-6" />
            Notificaciones
          </h1>
          {unreadCount > 0 && (
            <p className="text-sm text-muted-foreground mt-1">{unreadCount} sin leer</p>
          )}
        </div>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            disabled={markingAll}
            onClick={markAllRead}
            className="flex items-center gap-1.5"
          >
            <CheckCheck className="w-4 h-4" />
            Marcar todo leído
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Bell className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p className="font-medium">Sin notificaciones</p>
          <p className="text-sm mt-1">Acá aparecerán tus reseñas y actualizaciones importantes.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map(n => {
            const inner = (
              <div
                key={n.id}
                className={`flex items-start gap-3 p-4 rounded-xl border transition-colors cursor-pointer ${
                  n.is_read
                    ? 'bg-card border-border opacity-70'
                    : 'bg-card border-primary/30 shadow-sm'
                }`}
                onClick={() => !n.is_read && markRead(n.id)}
              >
                <div className="mt-0.5 shrink-0">{iconForType(n.type)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className={`text-sm font-semibold ${n.is_read ? 'text-muted-foreground' : 'text-foreground'}`}>
                      {n.title}
                    </p>
                    {!n.is_read && (
                      <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                    )}
                  </div>
                  {n.body && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.body}</p>}
                  <p className="text-xs text-muted-foreground mt-1">{formatRelativeDate(n.created_at)}</p>
                </div>
              </div>
            )

            return n.link ? (
              <Link key={n.id} href={n.link} onClick={() => !n.is_read && markRead(n.id)}>
                {inner}
              </Link>
            ) : (
              <div key={n.id}>{inner}</div>
            )
          })}
        </div>
      )}
    </div>
  )
}
