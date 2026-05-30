import { createClient } from "@/lib/supabase/server"
import { createClient as createAdmin } from "@supabase/supabase-js"
import { redirect } from "next/navigation"
import { releasePayout, deleteOrder } from "@/lib/actions/orders"
import { OrdersClient } from "./OrdersClient"

function getCountdown(confirmedAt: string | null, autoReleaseDate: string | null) {
  if (!confirmedAt) return null
  const releaseAt = autoReleaseDate
    ? new Date(autoReleaseDate)
    : new Date(new Date(confirmedAt).getTime() + 48 * 60 * 60 * 1000)
  const diff = releaseAt.getTime() - Date.now()
  if (diff <= 0) return { ready: true, hours: 0, minutes: 0 }
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  return { ready: false, hours, minutes }
}

export default async function AdminOrdersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const role = user.user_metadata?.role ?? "buyer"
  if (role !== "admin") redirect("/dashboard")

  const admin = createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: orders } = await admin
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false })

  const enriched = orders?.map((o: any) => ({
    ...o,
    countdown: getCountdown(o.confirmed_by_buyer_at, o.auto_release_date),
  })) ?? []

  const releasePayoutAction = async (id: string) => {
    "use server"
    await releasePayout(id)
  }

  const deleteOrderAction = async (id: string) => {
    "use server"
    await deleteOrder(id)
  }

  return (
    <OrdersClient
      orders={enriched}
      releasePayoutAction={releasePayoutAction}
      deleteOrderAction={deleteOrderAction}
    />
  )
}
