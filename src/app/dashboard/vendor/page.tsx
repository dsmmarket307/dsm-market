import { createClient } from "@/lib/supabase/server"
import { createClient as createAdmin } from "@supabase/supabase-js"
import { redirect } from "next/navigation"
import VendorDashboardClient from "./VendorDashboardClient"

export default async function VendorDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const role = user.user_metadata?.role ?? "buyer"
  if (role !== "seller") redirect("/dashboard")

  const admin = createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: profile } = await admin.from("profiles").select("seller_status, documento_url, politicas_aceptadas").eq("id", user.id).single()
  const { data: products } = await admin.from("products").select("id, name, category, price, status").eq("seller_id", user.id).order("created_at", { ascending: false })
  const productIds = products?.map((p: any) => p.id) ?? []
  const { data: images } = productIds.length > 0 ? await admin.from("product_images").select("product_id, url, position").in("product_id", productIds).order("position", { ascending: true }) : { data: [] }
  const { data: orders } = await admin.from("orders").select("*").eq("seller_id", user.id).order("created_at", { ascending: false })
  const { data: payouts } = await admin.from("payouts").select("id, amount, status").eq("seller_id", user.id)
  const name = user.user_metadata?.name ?? user.email?.split("@")[0]

  return (
    <VendorDashboardClient
      name={name}
      profile={profile}
      products={products ?? []}
      orders={orders ?? []}
      payouts={payouts ?? []}
      images={images ?? []}
    />
  )
}
