export type UserRole = 'buyer' | 'seller' | 'provider' | 'admin'

export type PlanType = 'basic' | 'pro' | 'premium'

export type BillingCycle = 'monthly' | 'annual'

export type SubscriptionStatus = 'active' | 'expired' | 'cancelled' | 'pending'

export type ProviderStatus = 'trial' | 'subscribed' | 'trial_expired' | 'no_plan'

export interface Profile {
  id: string
  name: string
  role: UserRole
  created_at: string
}

export interface AuthUser {
  id: string
  email: string
  profile: Profile | null
}

export interface Subscription {
  id: string
  user_id: string
  plan_type: PlanType
  billing_cycle: BillingCycle
  status: SubscriptionStatus
  starts_at: string
  expires_at: string
  created_at: string
  updated_at: string
}

export interface TrialPeriod {
  id: string
  user_id: string
  started_at: string
  expires_at: string
  active: boolean
  created_at: string
}

export interface PaymentHistory {
  id: string
  user_id: string
  plan: PlanType
  amount: number
  billing_cycle: BillingCycle
  payment_provider: string
  payment_status: 'approved' | 'pending' | 'rejected' | 'refunded'
  transaction_id: string | null
  mp_preference_id: string | null
  created_at: string
}

export interface ProviderSubscriptionState {
  status: ProviderStatus
  trial: TrialPeriod | null
  subscription: Subscription | null
  daysRemaining: number
  canPublishServices: boolean
  canUseAI: boolean
  canUsePrioritySearch: boolean
  canUseAnalytics: boolean
  canUseCampaigns: boolean
  maxServices: number
}

export const PLAN_LIMITS = {
  basic: {
    maxServices: 20,
    canUseAI: true,
    canUsePrioritySearch: false,
    canUseAnalytics: false,
    canUseCampaigns: false,
    label: 'Basico',
    price_monthly: 29900,
    price_annual: 287040,
  },
  pro: {
    maxServices: 80,
    canUseAI: true,
    canUsePrioritySearch: true,
    canUseAnalytics: true,
    canUseCampaigns: false,
    label: 'Pro',
    price_monthly: 59900,
    price_annual: 575040,
  },
  premium: {
    maxServices: 999999,
    canUseAI: true,
    canUsePrioritySearch: true,
    canUseAnalytics: true,
    canUseCampaigns: true,
    label: 'Premium',
    price_monthly: 99900,
    price_annual: 959040,
  },
} as const
