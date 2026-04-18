import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { AdminSidebar } from '@/components/admin/admin-sidebar'

function isAdminEmail(email: string): boolean {
  const allowed = (process.env.ADMIN_EMAILS ?? '').split(',').map(e => e.trim()).filter(Boolean)
  return allowed.includes(email)
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Double-check (middleware already guards, this is defense in depth)
  if (!user || !isAdminEmail(user.email ?? '')) {
    redirect('/')
  }

  return (
    <div className="flex min-h-screen bg-slate-950">
      <AdminSidebar adminEmail={user.email!} />
      <main className="flex-1 pt-14 lg:pt-0 p-4 lg:p-6 pb-20 lg:pb-6 text-slate-100 min-w-0">
        {children}
      </main>
    </div>
  )
}
