import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: subs, error: subError } = await admin
    .from('subscriptions')
    .select('user_id, plan_type')
    .eq('status', 'active')

  const { data: services } = await admin
    .from('services')
    .select('id, provider_id, business_name, status')
    .eq('status', 'approved')

  const subMap: Record<string, string> = {}
  if (subs) {
    subs.forEach((s: any) => {
      subMap[s.user_id] = s.plan_type
    })
  }

  const enriched = (services ?? []).map((s: any) => ({
    business_name: s.business_name,
    provider_id: s.provider_id,
    plan_type: subMap[s.provider_id] ?? null,
    found_in_submap: s.provider_id in subMap,
  }))

  return NextResponse.json({
    subError,
    subs,
    subMap,
    enriched,
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    has_service_key: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
  })
}
