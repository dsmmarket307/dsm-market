import { createClient as createAdmin } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const admin = createAdmin(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const formData = await request.formData()
    const product_id = formData.get("product_id") as string
    const rating = Number(formData.get("rating"))
    const comment = formData.get("comment") as string
    const reviewer_name = formData.get("reviewer_name") as string
    const photo = formData.get("photo") as File | null

    console.log("Review data:", { product_id, rating, comment, reviewer_name })

    if (!product_id || !rating || !reviewer_name) {
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 })
    }

    let photo_url = null

    if (photo && photo.size > 0) {
      const ext = photo.name.split('.').pop()
      const fileName = `review-${Date.now()}.${ext}`
      const arrayBuffer = await photo.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)

      const { error: uploadError } = await admin.storage
        .from('reviews')
        .upload(fileName, buffer, { contentType: photo.type, upsert: true })

      if (uploadError) {
        console.log("Upload error:", uploadError)
      } else {
        const { data: urlData } = admin.storage.from('reviews').getPublicUrl(fileName)
        photo_url = urlData.publicUrl
      }
    }

    const { data, error } = await admin.from("reviews").insert({
      product_id,
      rating,
      comment: comment || null,
      reviewer_name,
      photo_url,
    })

    console.log("Insert result:", { data, error })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.log("Catch error:", err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const admin = createAdmin(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { id } = await request.json()
    if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 })

    const { error } = await admin.from("reviews").delete().eq("id", id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}