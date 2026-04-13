'use client'

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Installer } from '@/types'

interface InstallerContextValue {
  installer: Installer | null
  loading: boolean
  refreshInstaller: () => Promise<void>
}

// Module-level singleton — stable reference, no re-render issues
const supabase = createClient()

const InstallerContext = createContext<InstallerContextValue | null>(null)

export function InstallerProvider({ children }: { children: React.ReactNode }) {
  const [installer, setInstaller] = useState<Installer | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchInstaller = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }

    const { data } = await supabase
      .from('installers')
      .select('*')
      .eq('user_id', user.id)
      .single()

    setInstaller(data ?? null)
    setLoading(false)
  }, []) // supabase is module-level, not a dep

  useEffect(() => { fetchInstaller() }, [fetchInstaller])

  return (
    <InstallerContext.Provider value={{ installer, loading, refreshInstaller: fetchInstaller }}>
      {children}
    </InstallerContext.Provider>
  )
}

export function useInstaller() {
  const ctx = useContext(InstallerContext)
  if (!ctx) throw new Error('useInstaller must be used inside InstallerProvider')
  return ctx
}
