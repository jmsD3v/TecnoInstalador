/**
 * Consolidated daily cron job.
 * Runs all scheduled tasks in one invocation to stay within Vercel free tier cron limits.
 * Scheduled via vercel.json — runs once per day.
 */
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const maxDuration = 60

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization') ?? ''
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const base = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const headers = { Authorization: `Bearer ${process.env.CRON_SECRET}` }

  const results: Record<string, unknown> = {}

  // 1. Sync MercadoPago subscriptions
  try {
    const res = await fetch(`${base}/api/cron/sync-subscriptions`, { headers })
    results.syncSubscriptions = await res.json()
  } catch (err) {
    results.syncSubscriptions = { error: String(err) }
    console.error('[cron/daily] sync-subscriptions error:', err)
  }

  // 2. Auto review invite notifications
  try {
    const res = await fetch(`${base}/api/cron/auto-review-invites`, { headers })
    results.autoReviewInvites = await res.json()
  } catch (err) {
    results.autoReviewInvites = { error: String(err) }
    console.error('[cron/daily] auto-review-invites error:', err)
  }

  // 3. Email sequences (onboarding nudge D+3, upgrade nudge D+14)
  try {
    const res = await fetch(`${base}/api/cron/email-sequences`, { headers })
    results.emailSequences = await res.json()
  } catch (err) {
    results.emailSequences = { error: String(err) }
    console.error('[cron/daily] email-sequences error:', err)
  }

  console.log('[cron/daily] completed:', JSON.stringify(results))
  return NextResponse.json(results)
}
