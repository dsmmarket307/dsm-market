import { createClient } from '@/lib/supabase/server'
import { sortServicesByScore } from '@/lib/service-score'

export interface RankedService {
  id: string
  provider_id: string
  business_name: string
  description: string
  category: string
  city: string
  phone: string | null
  whatsapp: string | null
  price: string | null
  service_image_url: string | null
  avatar_url: string | null
  profession: string | null
  experience: string | null
  status: string
  plan_type: string | null
  avg_rating: number | null
  review_count: number | null
  sale_count: number | null
  last_active_at: string | null
  created_at: string
  computed_score: number
  plan_boost: number
  reputation_score: number
  activity_score: number
}

export async function getRankedServices(category?: string): Promise<RankedService[]> {
  const supabase = await createClient()

  const { data: subs } = await supabase
    .from('subscriptions')
    .select('user_id, plan_type')
    .eq('status', 'active')

  const subMap: Record<string, string> = {}
  subs?.forEach((s: any) => { subMap[s.user_id] = s.plan_type })

  let query = supabase
    .from('services')
    .select('*')
    .eq('status', 'approved')

  if (category && category !== 'Todos') {
    query = query.eq('category', category)
  }

  const { data: services } = await query

  if (!services) return []

  const enriched = services.map((s: any) => ({
    ...s,
    plan_type: subMap[s.provider_id] ?? null,
  }))

  return sortServicesByScore(enriched) as RankedService[]
}

export async function getFeaturedServices(limit = 6): Promise<RankedService[]> {
  const all = await getRankedServices()
  return all
    .filter(s => s.plan_type === 'premium' || s.plan_type === 'pro')
    .slice(0, limit)
}

export async function updateServiceScore(serviceId: string, score: number): Promise<void> {
  const supabase = await createClient()
  await supabase
    .from('services')
    .update({ score, last_active_at: new Date().toISOString() })
    .eq('id', serviceId)
}

export function groupServicesByPlan(services: RankedService[]): {
  premium: RankedService[]
  pro: RankedService[]
  basic: RankedService[]
  free: RankedService[]
} {
  return {
    premium: services.filter(s => s.plan_type === 'premium'),
    pro:     services.filter(s => s.plan_type === 'pro'),
    basic:   services.filter(s => s.plan_type === 'basic'),
    free:    services.filter(s => !s.plan_type),
  }
}
