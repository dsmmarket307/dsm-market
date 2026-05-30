import { createClient } from "@/lib/supabase/server"
import { createClient as createAdmin } from "@supabase/supabase-js"
import { redirect } from "next/navigation"
import BuyerDashboardClient from "./BuyerDashboardClient"

export default async function BuyerDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const role = user.user_metadata?.role ?? "buyer"
  if (role !== "buyer") redirect("/dashboard")

  const admin = createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: orders } = await admin
    .from("orders")
    .select("*")
    .eq("buyer_id", user.id)
    .order("created_at", { ascending: false })

  const totalSpent = orders?.reduce((sum: number, o: any) => sum + Number(o.total_price ?? 0), 0) ?? 0
  const active = orders?.filter((o: any) => !["delivered","released","cancelled"].includes(o.status)).length ?? 0
  const delivered = orders?.filter((o: any) => ["delivered","released"].includes(o.status)).length ?? 0
  const name = user.user_metadata?.name ?? user.email?.split("@")[0]

  return (
    <BuyerDashboardClient
      name={name}
      orders={orders ?? []}
      totalSpent={totalSpent}
      active={active}
      delivered={delivered}
    />
  )
}
