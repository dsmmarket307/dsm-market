const PLAN_BOOST: Record<string, number> = {
  premium: 100,
  pro: 50,
  basic: 10,
}

export function sortServicesByScore(services: any[]): any[] {
  const scored = services.map((s) => {
    const plan_boost = PLAN_BOOST[s.plan_type ?? ''] ?? 0
    const reputation_score =
      (parseFloat(s.avg_rating) || 0) * 10 +
      Math.min((parseInt(s.review_count) || 0) * 2, 30)
    const activity_score = getActivityScore(s.last_active_at)
    const sale_score = Math.min(parseInt(s.sale_count) || 0, 20)
    const computed_score = plan_boost + reputation_score + activity_score + sale_score

    return {
      ...s,
      computed_score,
      plan_boost,
      reputation_score,
      activity_score,
    }
  })

  return scored.sort((a, b) => b.computed_score - a.computed_score)
}

function getActivityScore(last_active_at: string | null): number {
  if (!last_active_at) return 0
  const days =
    (Date.now() - new Date(last_active_at).getTime()) / (1000 * 60 * 60 * 24)
  if (days < 1) return 20
  if (days < 7) return 15
  if (days < 30) return 8
  return 0
}