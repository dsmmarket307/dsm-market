import { createClient } from "@/lib/supabase/server"
import { createClient as createAdmin } from "@supabase/supabase-js"
import { redirect } from "next/navigation"
import LandingClient from "@/components/LandingClient"

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) redirect("/dashboard")

  const admin = createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: allProducts } = await admin
    .from("products")
    .select("id, name, price, category")
    .eq("status", "approved")
    .order("created_at", { ascending: false })

  const productIds = allProducts?.map((p: any) => p.id) ?? []

  const { data: images } = productIds.length > 0 ? await admin
    .from("product_images")
    .select("product_id, url, position")
    .in("product_id", productIds)
    .order("position", { ascending: true }) : { data: [] }

  const { data: banners } = await admin
    .from("banners")
    .select("*")
    .eq("active", true)
    .order("position", { ascending: true })

  const seen = new Set()
  const featured = (allProducts ?? []).filter((p: any) => {
    if (seen.has(p.category)) return false
    seen.add(p.category)
    return true
  }).slice(0, 6)

  return (
    <LandingClient
      products={featured}
      images={images ?? []}
      banners={banners ?? []}
    />
  )
}
