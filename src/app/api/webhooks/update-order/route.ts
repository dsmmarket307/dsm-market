import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(req: NextRequest) {
  try {
    const { preference_id } = await req.json()
    if (!preference_id) return NextResponse.json({ error: 'No preference_id' }, { status: 400 })

    const admin = getAdmin()
    const { error } = await admin
      .from('orders')
      .update({
        status: 'paid',
        payment_status: 'approved',
        paid_at: new Date().toISOString(),
      })
      .eq('preference_id', preference_id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
