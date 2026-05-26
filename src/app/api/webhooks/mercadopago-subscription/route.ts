import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

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
    if (topic !== "payment" || !resourceId) return NextResponse.json({ ok: true })

    const mpRes = await fetch("https://api.mercadopago.com/v1/payments/" + resourceId, {
      headers: { Authorization: "Bearer " + process.env.MERCADOPAGO_ACCESS_TOKEN },
    })
    if (!mpRes.ok) return NextResponse.json({ ok: true })
    const payment = await mpRes.json()
    if (payment.status !== "approved") return NextResponse.json({ ok: true })

    const externalRef = payment.external_reference
    if (!externalRef) return NextResponse.json({ ok: true })

    const parts = externalRef.split("|")
    if (parts.length < 3) return NextResponse.json({ ok: true })

    const [userId, planType, billingCycle] = parts
    const amount = payment.transaction_amount

    const admin = getAdmin()

    const daysToAdd = billingCycle === "annual" ? 365 : 30
    const expiresAt = new Date(Date.now() + daysToAdd * 24 * 60 * 60 * 1000)

    await admin
      .from("subscriptions")
      .update({ status: "expired" })
      .eq("user_id", userId)
      .eq("status", "active")

    await admin.from("subscriptions").insert({
      user_id: userId,
      plan_type: planType,
      billing_cycle: billingCycle,
      status: "active",
      starts_at: new Date().toISOString(),
      expires_at: expiresAt.toISOString(),
    })

    await admin.from("payment_history").insert({
      user_id: userId,
      plan: planType,
      amount,
      billing_cycle: billingCycle,
      payment_provider: "mercadopago",
      payment_status: "approved",
      transaction_id: String(payment.id),
      mp_preference_id: payment.preference_id,
    })

    await admin
      .from("trial_periods")
      .update({ active: false })
      .eq("user_id", userId)

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ ok: true })
}
