import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DashboardNav from './nav'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const meta = user.user_metadata
  const role = (meta?.role as string) ?? 'buyer'
  const name = (meta?.name as string) ?? user.email?.split('@')[0] ?? ''

  return (
    <div className="min-h-screen flex" style={{ background: '#0A0A0A' }}>
      <DashboardNav role={role} name={name} email={user.email ?? ''} />
      <main className="flex-1 md:pt-0 pt-16 overflow-auto">
        {children}
      </main>
    </div>
  )
}