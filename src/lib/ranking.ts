import { createClient } from '@/lib/supabase/server'

const PLAN_SCORE: Record<string, number> = {
  premium: 100,
  pro: 50,
  basic: 10,
}

export interface RankedService {
  id: string
  user_id: string
  business_name: string
  category: string
  description: string
  city: string
  phone: string
  whatsapp: string
  price: string
  service_image_url: string
  avatar_url: string
  rating: number
  review_count: number
  sales_count: number
  last_active_at: string
  profession: string | null
  experience: string | null
  plan_type: string | null
  score: number
  badge: 'premium' | 'pro' | 'verified' | 'active' | null
}

export async function getRankedServices(): Promise<RankedService[]> {
  const supabase = await createClient()

  const { data: services, error } = await supabase
    .from('provider_profiles')
    .select(`
      id,
      user_id,
      business_name,
      category,
      description,
      city,
      phone,
      whatsapp,
      price,
      service_image_url,
      avatar_url,
      rating,
      review_count,
      sales_count,
      last_active_at,
      profession,
      experience,
      status
    `)
    .eq('status', 'active')

  if (error || !services) return []

  const userIds = services.map((s: any) => s.user_id).filter(Boolean)

  const { data: subscriptions } = await supabase
    .from('subscriptions')
    .select('user_id, plan_type')
    .in('user_id', userIds)
    .eq('status', 'active')

  const planMap: Record<string, string> = {}
  if (subscriptions) {
    for (const sub of subscriptions) {
      planMap[sub.user_id] = sub.plan_type
    }
  }

  const ranked = services.map((service: any) => {
    const plan = planMap[service.user_id] ?? null
    const score = calculateServiceScore(service, plan)
    const badge = getBadge(plan, service)

    return {
      ...service,
      plan_type: plan,
      score,
      badge,
    }
  })

  ranked.sort((a: any, b: any) => b.score - a.score)

  return ranked
}

export function calculateServiceScore(service: any, plan: string | null): number {
  let score = 0

  score += PLAN_SCORE[plan ?? ''] ?? 0

  const rating = parseFloat(service.rating) || 0
  score += rating * 10

  const reviews = parseInt(service.review_count) || 0
  score += Math.min(reviews * 2, 30)

  const sales = parseInt(service.sales_count) || 0
  score += Math.min(sales, 20)

  if (service.last_active_at) {
    const daysSinceActive =
      (Date.now() - new Date(service.last_active_at).getTime()) /
      (1000 * 60 * 60 * 24)
    if (daysSinceActive < 1) score += 20
    else if (daysSinceActive < 7) score += 15
    else if (daysSinceActive < 30) score += 8
  }

  return Math.round(score)
}

export function getBadge(
  plan: string | null,
  service: any
): 'premium' | 'pro' | 'verified' | 'active' | null {
  if (plan === 'premium') return 'premium'
  if (plan === 'pro') return 'pro'
  const rating = parseFloat(service.rating) || 0
  const reviews = parseInt(service.review_count) || 0
  if (rating >= 4.5 && reviews >= 5) return 'verified'
  if (service.last_active_at) {
    const days =
      (Date.now() - new Date(service.last_active_at).getTime()) /
      (1000 * 60 * 60 * 24)
    if (days < 7) return 'active'
  }
  return null
}

export async function getFeaturedServices(): Promise<{
  premium: RankedService[]
  pro: RankedService[]
}> {
  const all = await getRankedServices()
  return {
    premium: all.filter((s) => s.plan_type === 'premium').slice(0, 6),
    pro: all.filter((s) => s.plan_type === 'pro').slice(0, 6),
  }
}

export function sortServicesByPriority(services: RankedService[]): RankedService[] {
  return [...services].sort((a, b) => b.score - a.score)
}