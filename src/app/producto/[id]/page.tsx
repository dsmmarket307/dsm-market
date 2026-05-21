import { createClient } from "@/lib/supabase/server"
import { createClient as createAdmin } from "@supabase/supabase-js"
import { redirect } from "next/navigation"
import ProductDetail from "./ProductDetail"
import type { Metadata } from "next"

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const admin = createAdmin(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  const { data: product } = await admin.from("products").select("name, seo_title, seo_description, category").eq("id", id).single()
  if (!product) return { title: "DMS Market" }
  const title = product.seo_title || `${product.name} | DMS Market`
  const description = product.seo_description || `Compra ${product.name} con envio rapido en DMS Market.`
  return {
    title,
    description,
    openGraph: { title, description, siteName: "DMS Market" },
  }
}

export default async function ProductoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const admin = createAdmin(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

  const { data: product } = await admin
    .from("products")
    .select("*, badge, rating, vendidos, seo_title, seo_description, slug")
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

  const { data: seller } = await admin
    .from("profiles")
    .select("id, name, store_name, store_logo_url, store_description, store_phone")
    .eq("id", product.seller_id)
    .single()

  const { data: recommended } = await admin
    .from("products")
    .select("id, name, price, original_price, category")
    .eq("status", "approved")
    .eq("category", product.category)
    .neq("id", id)
    .order("created_at", { ascending: false })
    .limit(6)

  const recIds = recommended?.map((p: any) => p.id) ?? []
  const { data: recImages } = recIds.length > 0
    ? await admin.from("product_images").select("product_id, url, position").in("product_id", recIds).order("position", { ascending: true })
    : { data: [] }

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
      seller={seller}
      recommended={recommended ?? []}
      recImages={recImages ?? []}
    />
  )
}