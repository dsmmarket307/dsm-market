import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { service_id, provider_id, lead_type, source, device, plan_type, service_name, category, visitor_id } = body

    if (!service_id) {
      return NextResponse.json({ error: 'service_id requerido' }, { status: 400 })
    }

    const { error } = await supabase.from('service_leads').insert({
      service_id,
      provider_id: provider_id || null,
      visitor_id: visitor_id || null,
      lead_type: lead_type || 'whatsapp_click',
      source: source || 'service_detail',
      device: device || null,
      plan_type: plan_type || null,
      service_name: service_name || null,
      category: category || null,
      metadata: {
        user_agent: req.headers.get('user-agent'),
        referer: req.headers.get('referer'),
        timestamp: new Date().toISOString(),
      }
    })

    if (error) throw error

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error('Lead tracking error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
