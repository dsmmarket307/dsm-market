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

export async function createDispute(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "No autenticado" }

  const admin = getAdmin()

  const order_id = formData.get("order_id") as string
  const reason = formData.get("reason") as string
  const description = formData.get("description") as string
  const phone = formData.get("phone") as string
  const email = formData.get("email") as string
  const evidenceFiles = formData.getAll("evidence") as File[]

  if (!reason || !description || !phone || !email) {
    return { error: "Completa todos los campos requeridos" }
  }

  const evidence_urls: string[] = []

  for (let i = 0; i < evidenceFiles.length; i++) {
    const file = evidenceFiles[i]
    if (!file || file.size === 0) continue
    const ext = file.name.split(".").pop()
    const path = `disputes/${user.id}/${Date.now()}-${i}.${ext}`
    const { error: uploadError } = await supabase.storage.from("products").upload(path, file)
    if (!uploadError) {
      const { data } = supabase.storage.from("products").getPublicUrl(path)
      evidence_urls.push(data.publicUrl)
    }
  }

  let seller_id = null
  if (order_id) {
    const { data: order } = await admin.from("orders").select("seller_id").eq("id", order_id).single()
    seller_id = order?.seller_id
  }

  const { error } = await admin.from("disputes").insert({
    order_id: order_id || null,
    buyer_id: user.id,
    seller_id,
    reason,
    description,
    phone,
    email,
    evidence_urls,
    status: "open",
  })

  if (error) return { error: error.message }

  revalidatePath("/dashboard/buyer/disputes")
  return { success: true }
}

export async function updateDisputeStatus(disputeId: string, status: string, adminNotes: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.user_metadata?.role !== "admin") return { error: "No autorizado" }

  const admin = getAdmin()
  const { error } = await admin.from("disputes").update({ status, admin_notes: adminNotes, updated_at: new Date().toISOString() }).eq("id", disputeId)

  if (error) return { error: error.message }

  revalidatePath("/dashboard/admin/disputes")
  return { success: true }
}
