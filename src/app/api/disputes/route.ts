import { createClient } from "@/lib/supabase/server"
import { createClient as createAdmin } from "@supabase/supabase-js"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 })

  const admin = createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const formData = await request.formData()
  const order_id = formData.get("order_id") as string
  const reason = formData.get("reason") as string
  const description = formData.get("description") as string
  const phone = formData.get("phone") as string
  const email = formData.get("email") as string
  const evidenceFiles = formData.getAll("evidence") as File[]

  if (!reason || !description || !phone || !email) {
    return NextResponse.json({ error: "Completa todos los campos requeridos" }, { status: 400 })
  }

  const evidence_urls: string[] = []

  for (let i = 0; i < evidenceFiles.length; i++) {
    const file = evidenceFiles[i]
    if (!file || file.size === 0) continue
    const ext = file.name.split(".").pop()
    const path = `disputes/${user.id}/${Date.now()}-${i}.${ext}`
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const { error: uploadError } = await supabase.storage.from("products").upload(path, buffer, { contentType: file.type })
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

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
