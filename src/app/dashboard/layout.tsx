import { redirect } from "next/navigation"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { DashboardSidebar, MobileBottomNav } from "@/components/layout/dashboard-sidebar"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: installer } = await supabase
    .from('installers')
    .select('plan, trial_ends_at')
    .eq('user_id', user.id)
    .single()

  // If no installer profile yet, show onboarding (they just registered)
  if (!installer) redirect('/auth/register')

  return (
    <div className="flex min-h-screen bg-muted/20">
      <DashboardSidebar plan={installer.plan} trialEndsAt={installer.trial_ends_at} />
      <main className="flex-1 flex flex-col">
        <div className="flex-1 p-4 md:p-6 pb-24 lg:pb-6">
          {children}
        </div>
      </main>
      <MobileBottomNav plan={installer.plan} />
    </div>
  )
}
