'use client'

import { useState, useEffect } from 'react'
import { Gift, Copy, Check, Users, Zap } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'

const supabase = createClient()

export default function ReferralPage() {
  const [referralCode, setReferralCode] = useState<string | null>(null)
  const [referralCount, setReferralCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: inst } = await supabase
        .from('installers')
        .select('id, referral_code')
        .eq('user_id', user.id)
        .single()

      if (!inst) return
      setReferralCode(inst.referral_code)

      // Count referrals
      const { count } = await supabase
        .from('installers')
        .select('id', { count: 'exact', head: true })
        .eq('referred_by', inst.id)

      setReferralCount(count ?? 0)
      setLoading(false)
    }
    load()
  }, [])

  const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://tecnoinstalador.com'
  const referralUrl = referralCode ? `${APP_URL}/auth/register?ref=${referralCode}` : ''

  const handleCopy = async () => {
    if (!referralUrl) return
    await navigator.clipboard.writeText(referralUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) return (
    <div className="max-w-lg mx-auto py-12 space-y-4">
      {[1, 2].map(i => <div key={i} className="h-24 bg-muted rounded-xl animate-pulse" />)}
    </div>
  )

  return (
    <div className="max-w-lg mx-auto py-8 px-4 space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Gift className="w-6 h-6 text-purple-500" />
          Programa de referidos
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Compartí tu link único. Por cada instalador que se registre con tu código y active un plan pago, obtenés <strong>30 días de plan PRO gratis</strong>.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <Users className="w-6 h-6 mx-auto text-blue-500 mb-1" />
          <p className="text-3xl font-bold">{referralCount}</p>
          <p className="text-xs text-muted-foreground mt-1">Instaladores referidos</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <Zap className="w-6 h-6 mx-auto text-amber-500 mb-1" />
          <p className="text-3xl font-bold">{referralCount * 30}d</p>
          <p className="text-xs text-muted-foreground mt-1">Días PRO ganados</p>
        </div>
      </div>

      {/* Referral link */}
      {referralUrl && (
        <div className="space-y-3">
          <p className="text-sm font-semibold">Tu link de referido</p>
          <div className="flex items-center gap-2">
            <input
              readOnly
              value={referralUrl}
              className="flex-1 rounded-lg border border-input bg-muted px-3 py-2 text-sm font-mono text-muted-foreground"
              onClick={e => (e.target as HTMLInputElement).select()}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="shrink-0 gap-1.5"
            >
              {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copiado' : 'Copiar'}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Compartí este link con otros profesionales. Cuando se registren usando tu link, quedan vinculados a tu cuenta.
          </p>
        </div>
      )}

      {/* How it works */}
      <div className="rounded-xl border border-border bg-card/50 p-5 space-y-3">
        <p className="text-sm font-semibold">¿Cómo funciona?</p>
        <ol className="space-y-2 text-sm text-muted-foreground list-none">
          {[
            'Compartí tu link único con otros profesionales',
            'Se registran usando tu link',
            'Cuando activan un plan pago, vos ganás 30 días de PRO',
            '¡Sin límite — cuantos más referidos, más días gratis!',
          ].map((step, i) => (
            <li key={i} className="flex items-start gap-2.5">
              <span className="shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">{i + 1}</span>
              {step}
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}
