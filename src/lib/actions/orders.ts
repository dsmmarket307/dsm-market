"use server"

import { createClient } from "@/lib/supabase/server"
import { createClient as createAdmin } from "@supabase/supabase-js"
import { revalidatePath } from "next/cache"

function getAdmin() {
  return createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function releasePayout(orderId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.user_metadata?.role !== "admin") return { error: "No autorizado" }

  const admin = getAdmin()

  const { data: order } = await admin
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .single()

  if (!order) return { error: "Orden no encontrada" }

  const { error } = await admin
    .from("orders")
    .update({ status: "released", payout_released_at: new Date().toISOString() })
    .eq("id", orderId)

  if (error) return { error: error.message }

  await admin.from("payouts").insert({
    seller_id: order.seller_id,
    order_id: orderId,
    amount: order.seller_earnings,
    platform_fee: order.platform_fee,
    status: "released",
    released_at: new Date().toISOString(),
  })

  revalidatePath("/dashboard/admin")
  return { success: true }
}

export async function uploadGuide(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.user_metadata?.role !== "seller") return { error: "No autorizado" }

  const admin = getAdmin()
  const orderId = formData.get("orderId") as string
  const trackingNumber = formData.get("trackingNumber") as string
  const shippingCompany = formData.get("shippingCompany") as string

  const { error } = await admin
    .from("orders")
    .update({
      tracking_number: trackingNumber,
      shipping_company: shippingCompany,
      guide_uploaded_at: new Date().toISOString(),
      status: "shipped",
    })
    .eq("id", orderId)

  if (error) return { error: error.message }

  revalidatePath("/dashboard/vendor")
  return { success: true }
}

export async function confirmDelivery(orderId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "No autorizado" }

  const admin = getAdmin()

  const releaseDate = new Date()
  releaseDate.setDate(releaseDate.getDate() + 7)

  const { error } = await admin
    .from("orders")
    .update({
      status: "delivered",
      delivered_at: new Date().toISOString(),
      confirmed_by_buyer_at: new Date().toISOString(),
      release_date: releaseDate.toISOString(),
    })
    .eq("id", orderId)

  if (error) return { error: error.message }

  revalidatePath("/dashboard/buyer")
  return { success: true }
}
