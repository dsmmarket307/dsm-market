import { createClient } from "@/lib/supabase/server"
import { createClient as createAdmin } from "@supabase/supabase-js"
import { redirect } from "next/navigation"
import { uploadGuide } from "@/lib/actions/orders"
import OrdersClient from "./OrdersClient"

export default async function VendorOrdersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")
  const role = user.user_metadata?.role ?? "buyer"
  if (role !== "seller") redirect("/dashboard")

  const admin = createAdmin(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

  const { data: orders } = await admin
    .from("orders")
    .select("*, products(id, name, price, category)")
    .eq("seller_id", user.id)
    .order("created_at", { ascending: false })

  const productIds = (orders || []).map((o: any) => o.product_id).filter(Boolean)
  const { data: allImages } = productIds.length > 0
    ? await admin.from("product_images").select("product_id, url, position").in("product_id", productIds).eq("position", 1)
    : { data: [] }

  const imageMap: Record<string, string> = {}
  ;(allImages || []).forEach((img: any) => { imageMap[img.product_id] = img.url })

  const enriched = (orders || []).map((order: any) => ({
    ...order,
    mainImage: order.product_id ? imageMap[order.product_id] || null : null,
    variantes: order.variantes_seleccionadas
      ? order.variantes_seleccionadas.split("|").filter(Boolean).map((v: string) => {
          const [nombre, opcion] = v.split(":")
          return { nombre, opcion }
        })
      : []
  }))

  return <OrdersClient orders={enriched} uploadGuide={uploadGuide} />
}

