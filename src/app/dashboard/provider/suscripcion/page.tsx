import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getProviderSubscriptionState } from '@/lib/actions/subscriptions'
import SubscriptionClient from './SubscriptionClient'

export default async function SuscripcionPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, name')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'provider') redirect('/dashboard')

  const state = await getProviderSubscriptionState(user.id)

  return (
    <SubscriptionClient
      userId={user.id}
      userName={profile.name}
      state={state}
    />
  )
}
