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
    const body = await req.json()
    const topic = body.topic || body.type
    const resourceId = body.id || body.data?.id

    if (topic !== 'payment' || !resourceId) {
      return NextResponse.json({ ok: true })
    }

    const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${resourceId}`, {
      headers: { Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}` },
    })

    if (!mpRes.ok) return NextResponse.json({ error: 'Error MP' }, { status: 500 })

    const payment = await mpRes.json()
    if (payment.status !== 'approved') return NextResponse.json({ ok: true })

    const admin = getAdmin()
    const { data: order } = await admin
      .from('orders')
      .select('*')
      .eq('preference_id', payment.preference_id)
      .single()

    if (order) {
      await admin.from('orders').update({
        status: 'paid',
        payment_id: String(payment.id),
        payment_status: payment.status,
        paid_at: new Date().toISOString(),
      }).eq('id', order.id)
    } else {
      const subtotal = payment.metadata?.subtotal || payment.transaction_amount || 0
      const platformFee = payment.metadata?.platform_fee || Math.round(subtotal * 0.05)
      await admin.from('orders').insert({
        payment_id: String(payment.id),
        preference_id: payment.preference_id,
        payment_status: payment.status,
        status: 'paid',
        total_amount: payment.transaction_amount,
        platform_fee: platformFee,
        seller_earnings: subtotal - platformFee,
        paid_at: new Date().toISOString(),
        buyer_email: payment.payer?.email || null,
      })
    }

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ ok: true })
}
