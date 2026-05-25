export interface ServiceForScore {
  id: string
  provider_id: string
  plan_type: string | null
  avg_rating: number | null
  review_count: number | null
  sale_count: number | null
  last_active_at: string | null
  created_at: string | null
}

export interface ScoredService extends ServiceForScore {
  computed_score: number
  plan_boost: number
  reputation_score: number
  activity_score: number
}

const PLAN_BOOST: Record<string, number> = {
  premium: 100,
  pro: 50,
  basic: 20,
}

export function calculateServiceScore(service: ServiceForScore): ScoredService {
  const planBoost = PLAN_BOOST[service.plan_type ?? ''] ?? 0

  const rating = Math.min(service.avg_rating ?? 0, 5)
  const reviews = Math.min(service.review_count ?? 0, 100)
  const sales = Math.min(service.sale_count ?? 0, 200)
  const reputationScore = (rating / 5) * 30 + (reviews / 100) * 20 + (sales / 200) * 20

  const now = Date.now()
  const lastActive = service.last_active_at
    ? new Date(service.last_active_at).getTime()
    : service.created_at
    ? new Date(service.created_at).getTime()
    : now

  const daysSinceActive = Math.max(0, (now - lastActive) / (1000 * 60 * 60 * 24))
  const activityScore = Math.max(0, 30 - daysSinceActive * 0.5)

  const computedScore = planBoost + reputationScore + activityScore

  return {
    ...service,
    computed_score: Math.round(computedScore * 100) / 100,
    plan_boost: planBoost,
    reputation_score: Math.round(reputationScore * 100) / 100,
    activity_score: Math.round(activityScore * 100) / 100,
  }
}

export function sortServicesByScore<T extends ServiceForScore>(services: T[]): (T & ScoredService)[] {
  return services
    .map(s => ({ ...s, ...calculateServiceScore(s) }))
    .sort((a, b) => b.computed_score - a.computed_score)
}
