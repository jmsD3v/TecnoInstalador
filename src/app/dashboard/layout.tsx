import { redirect } from "next/navigation"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { DashboardSidebar, MobileBottomNav } from "@/components/layout/dashboard-sidebar"
import { InstallerProvider } from "@/contexts/installer-context"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const adminEmails = (process.env.ADMIN_EMAILS ?? '').split(',').map(e => e.trim()).filter(Boolean)
  const isAdmin = adminEmails.includes(user.email ?? '')

  const { data: installer } = await supabase
    .from('installers')
    .select('plan, trial_ends_at, url_slug, onboarding_completed')
    .eq('user_id', user.id)
    .single()

  // If no installer profile yet, show onboarding (they just registered)
  if (!installer) redirect('/auth/register')

  if (installer && installer.onboarding_completed === false) {
    const { headers } = await import('next/headers')
    const headersList = await headers()
    const pathname = headersList.get('x-pathname') ?? ''
    if (!pathname.includes('/dashboard/onboarding')) {
      redirect('/dashboard/onboarding')
    }
  }

  return (
    <div className="flex min-h-screen bg-muted/20">
      <DashboardSidebar plan={installer.plan} trialEndsAt={installer.trial_ends_at} urlSlug={installer.url_slug} isAdmin={isAdmin} />
      <main className="flex-1 flex flex-col">
        <div className="flex-1 p-4 md:p-6 pb-24 lg:pb-6">
          <InstallerProvider>{children}</InstallerProvider>
        </div>
      </main>
      <MobileBottomNav plan={installer.plan} />
    </div>
  )
}
