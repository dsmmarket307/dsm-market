import { createClient } from "@/lib/supabase/server"
import { createClient as createAdmin } from "@supabase/supabase-js"
import { redirect } from "next/navigation"
import OrdersClient from "./OrdersClient"

export default async function VendorOrdersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")
  const role = user.user_metadata?.role ?? "buyer"
  if (role !== "seller") redirect("/dashboard")

  const admin = createAdmin(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  const { data: orders } = await admin.from("orders").select("*").eq("seller_id", user.id).order("created_at", { ascending: false })

  return <OrdersClient orders={orders ?? []} />
}