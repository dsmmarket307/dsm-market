import { createClient as createAdmin } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export async function GET() {
  const admin = createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: products } = await admin
    .from("products")
    .select("id, name, price, original_price, category, condition, stock")
    .eq("status", "approved")
    .order("created_at", { ascending: false })

  const productIds = products?.map((p) => p.id) ?? []

  const { data: images } = productIds.length > 0 ? await admin
    .from("product_images")
    .select("product_id, url, position")
    .in("product_id", productIds)
    .order("position", { ascending: true }) : { data: [] }

  const { data: reviews } = productIds.length > 0 ? await admin
    .from("reviews")
    .select("product_id, rating")
    .in("product_id", productIds) : { data: [] }

  return NextResponse.json({
    products: products ?? [],
    images: images ?? [],
    reviews: reviews ?? [],
  })
}
