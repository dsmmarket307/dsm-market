import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type { PlanType, BillingCycle } from '@/types'
import { PLAN_LIMITS } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const topic = body.type || body.topic
    const resourceId = body.data?.id || body.id

    if (!topic || !resourceId) {
      return NextResponse.json({ received: true }, { status: 200 })
    }

    if (topic !== 'payment') {
      return NextResponse.json({ received: true }, { status: 200 })
    }

    const paymentResponse = await fetch(
      `https://api.mercadopago.com/v1/payments/${resourceId}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
        },
      }
    )

    if (!paymentResponse.ok) {
      return NextResponse.json({ error: 'Error fetching payment' }, { status: 400 })
    }

    const payment = await paymentResponse.json()

    if (payment.status !== 'approved') {
      return NextResponse.json({ received: true }, { status: 200 })
    }

    const externalReference = payment.external_reference
    if (!externalReference) {
      return NextResponse.json({ error: 'No external reference' }, { status: 400 })
    }

    const parts = externalReference.split('|')
    if (parts.length !== 3) {
      return NextResponse.json({ error: 'Invalid external reference' }, { status: 400 })
    }

    const [userId, planType, billingCycle] = parts as [string, PlanType, BillingCycle]
    const limits = PLAN_LIMITS[planType]
    const amount = billingCycle === 'annual' ? limits.price_annual : limits.price_monthly
    const daysToAdd = billingCycle === 'annual' ? 365 : 30
    const expiresAt = new Date(Date.now() + daysToAdd * 24 * 60 * 60 * 1000)

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

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

    if (subError) {
      return NextResponse.json({ error: subError.message }, { status: 500 })
    }

    await supabase.from('payment_history').insert({
      user_id: userId,
      plan: planType,
      amount,
      billing_cycle: billingCycle,
      payment_provider: 'mercadopago',
      payment_status: 'approved',
      transaction_id: String(payment.id),
      mp_preference_id: payment.order?.id ? String(payment.order.id) : '',
    })

    await supabase
      .from('trial_periods')
      .update({ active: false })
      .eq('user_id', userId)

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (err) {
    console.error('Webhook error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}