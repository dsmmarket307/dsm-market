'use server'
import { createClient } from '@/lib/supabase/server'
import type { ProviderSubscriptionState, PlanType, BillingCycle } from '@/types'
import { PLAN_LIMITS } from '@/types'

export async function activateTrial(userId: string): Promise<{ error?: string }> {
  const supabase = await createClient()

  const { data: existing } = await supabase
    .from('trial_periods')
    .select('id')
    .eq('user_id', userId)
    .single()

  if (existing) return {}

  const { error } = await supabase.from('trial_periods').insert({
    user_id: userId,
    started_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
    active: true,
  })

  if (error) return { error: error.message }
  return {}
}

export async function getProviderSubscriptionState(
  userId: string
): Promise<ProviderSubscriptionState> {
  const supabase = await createClient()

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  const { data: trial } = await supabase
    .from('trial_periods')
    .select('*')
    .eq('user_id', userId)
    .single()

  const now = new Date()

  if (subscription) {
    const expiresAt = new Date(subscription.expires_at)
    const daysRemaining = Math.max(
      0,
      Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    )
    const limits = PLAN_LIMITS[subscription.plan_type as PlanType]
    return {
      status: 'subscribed',
      trial: trial ?? null,
      subscription,
      daysRemaining,
      canPublishServices: true,
      canUseAI: limits.canUseAI,
      canUsePrioritySearch: limits.canUsePrioritySearch,
      canUseAnalytics: limits.canUseAnalytics,
      canUseCampaigns: limits.canUseCampaigns,
      maxServices: limits.maxServices,
    }
  }

  if (trial) {
    const expiresAt = new Date(trial.expires_at)
    const daysRemaining = Math.max(
      0,
      Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    )
    const isActive = trial.active && now < expiresAt

    if (isActive) {
      return {
        status: 'trial',
        trial,
        subscription: null,
        daysRemaining,
        canPublishServices: true,
        canUseAI: true,
        canUsePrioritySearch: false,
        canUseAnalytics: false,
        canUseCampaigns: false,
        maxServices: 5,
      }
    }

    return {
      status: 'trial_expired',
      trial,
      subscription: null,
      daysRemaining: 0,
      canPublishServices: false,
      canUseAI: false,
      canUsePrioritySearch: false,
      canUseAnalytics: false,
      canUseCampaigns: false,
      maxServices: 0,
    }
  }

  return {
    status: 'no_plan',
    trial: null,
    subscription: null,
    daysRemaining: 0,
    canPublishServices: false,
    canUseAI: false,
    canUsePrioritySearch: false,
    canUseAnalytics: false,
    canUseCampaigns: false,
    maxServices: 0,
  }
}

export async function createPaymentPreference(
  userId: string,
  planType: PlanType,
  billingCycle: BillingCycle
): Promise<{ preferenceId?: string; initPoint?: string; error?: string }> {
  const limits = PLAN_LIMITS[planType]
  const amount =
    billingCycle === 'annual' ? limits.price_annual : limits.price_monthly

  const body = {
    items: [
      {
        title: `DMS Market - Plan ${limits.label} (${billingCycle === 'annual' ? 'Anual' : 'Mensual'})`,
        quantity: 1,
        unit_price: amount,
        currency_id: 'COP',
      },
    ],
    back_urls: {
      success: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/provider/suscripcion?status=success`,
      failure: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/provider/suscripcion?status=failure`,
      pending: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/provider/suscripcion?status=pending`,
    },
    auto_return: 'approved',
    external_reference: `${userId}|${planType}|${billingCycle}`,
    notification_url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/webhooks/mercadopago-subscription`,
  }

  const response = await fetch(
    'https://api.mercadopago.com/checkout/preferences',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
      },
      body: JSON.stringify(body),
    }
  )

  if (!response.ok) {
    const err = await response.json()
    return { error: err.message || 'Error creando preferencia de pago' }
  }

  const data = await response.json()
  return {
    preferenceId: data.id,
    initPoint: data.init_point,
  }
}

export async function activateSubscription(
  userId: string,
  planType: PlanType,
  billingCycle: BillingCycle,
  transactionId: string,
  mpPreferenceId: string,
  amount: number
): Promise<{ error?: string }> {
  const supabase = await createClient()

  const daysToAdd = billingCycle === 'annual' ? 365 : 30
  const expiresAt = new Date(Date.now() + daysToAdd * 24 * 60 * 60 * 1000)

  await supabase
    .from('subscriptions')
    .update({ status: 'expired' })
    .eq('user_id', userId)
    .eq('status', 'active')

  const { error: subError } = await supabase.from('subscriptions').insert({
    user_id: userId,
    plan_type: planType,
    billing_cycle: billingCycle,
    status: 'active',
    starts_at: new Date().toISOString(),
    expires_at: expiresAt.toISOString(),
  })

  if (subError) return { error: subError.message }

  await supabase.from('payment_history').insert({
    user_id: userId,
    plan: planType,
    amount,
    billing_cycle: billingCycle,
    payment_provider: 'mercadopago',
    payment_status: 'approved',
    transaction_id: transactionId,
    mp_preference_id: mpPreferenceId,
  })

  await supabase
    .from('trial_periods')
    .update({ active: false })
    .eq('user_id', userId)

  return {}
}

export async function getPaymentHistory(userId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('payment_history')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) return []
  return data
}
