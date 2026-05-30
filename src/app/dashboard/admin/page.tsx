import { createClient } from "@/lib/supabase/server"
import { createClient as createAdmin } from "@supabase/supabase-js"
import { redirect } from "next/navigation"
import AdminDashboardClient from "./AdminDashboardClient"

export default async function AdminDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const role = user.user_metadata?.role ?? "buyer"
  if (role !== "admin") redirect("/dashboard")

  const admin = createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: pendingVendors } = await admin.from("profiles").select("*").eq("role", "seller").eq("seller_status", "pending")
  const { data: pendingProducts } = await admin.from("products").select("*").eq("status", "pending")
  const { data: allOrders } = await admin.from("orders").select("*")
  const { data: pendingServices } = await admin.from("services").select("*").eq("status", "pending")

  const totalRevenue = allOrders?.reduce((sum: number, o: any) => sum + Number(o.platform_fee), 0) ?? 0

  return (
    <AdminDashboardClient
      pendingVendors={pendingVendors?.length ?? 0}
      pendingProducts={pendingProducts?.length ?? 0}
      pendingServices={pendingServices?.length ?? 0}
      totalRevenue={totalRevenue}
    />
  )
}
