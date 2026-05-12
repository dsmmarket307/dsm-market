import { createClient } from "@/lib/supabase/server"
import { createClient as createAdmin } from "@supabase/supabase-js"
import { redirect } from "next/navigation"
import ProductDetail from "@/components/ProductDetail"

export default async function ProductoPage({ params }: any) {
  const { id } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const admin = createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: product } = await admin
    .from("products")
    .select("*")
    .eq("id", id)
    .eq("status", "approved")
    .single()

  if (!product) redirect("/")

  const { data: images } = await admin
    .from("product_images")
    .select("url, position")
    .eq("product_id", id)
    .order("position", { ascending: true })

  const { data: reviews } = await admin
    .from("reviews")
    .select("*, profiles(name)")
    .eq("product_id", id)
    .order("created_at", { ascending: false })

  const avgRating = reviews && reviews.length > 0
    ? Math.round(reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length)
    : 0

  return (
    <ProductDetail
      product={product}
      images={images ?? []}
      reviews={reviews ?? []}
      avgRating={avgRating}
      user={user}
    />
  )
}