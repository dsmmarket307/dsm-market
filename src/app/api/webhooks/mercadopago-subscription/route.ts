import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { activateSubscription } from '@/lib/actions/subscriptions'
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

    const { error } = await activateSubscription(
      userId,
      planType,
      billingCycle,
      String(payment.id),
      payment.order?.id ? String(payment.order.id) : '',
      amount
    )

    if (error) {
      return NextResponse.json({ error }, { status: 500 })
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (err) {
    console.error('Webhook error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
