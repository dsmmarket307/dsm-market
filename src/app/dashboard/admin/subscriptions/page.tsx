import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AdminSubscriptionsClient from './AdminSubscriptionsClient'

export default async function AdminSubscriptionsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/dashboard')

  const { data: summary } = await supabase
    .from('admin_subscription_summary')
    .select('*')

  const { data: payments } = await supabase
    .from('payment_history')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(20)

  const totalProviders = summary?.length || 0
  const activeSubscriptions = summary?.filter(s => s.provider_status === 'subscribed').length || 0
  const activeTrial = summary?.filter(s => s.provider_status === 'trial').length || 0
  const expired = summary?.filter(s => s.provider_status === 'trial_expired' || s.provider_status === 'no_plan').length || 0

  const mrr = summary
    ?.filter(s => s.provider_status === 'subscribed' && s.plan_type)
    .reduce((acc, s) => {
      const prices: Record<string, number> = { basic: 29900, pro: 59900, premium: 99900 }
      const amount = s.billing_cycle === 'annual'
        ? (prices[s.plan_type] * 12 * 0.8) / 12
        : prices[s.plan_type] || 0
      return acc + amount
    }, 0) || 0

  const expiringIn7Days = summary?.filter(s => {
    if (!s.subscription_expires) return false
    const exp = new Date(s.subscription_expires)
    const now = new Date()
    const diff = Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return diff >= 0 && diff <= 7
  }).length || 0

  return (
    <AdminSubscriptionsClient
      summary={summary || []}
      payments={payments || []}
      stats={{
        totalProviders,
        activeSubscriptions,
        activeTrial,
        expired,
        mrr,
        expiringIn7Days,
      }}
    />
  )
}
