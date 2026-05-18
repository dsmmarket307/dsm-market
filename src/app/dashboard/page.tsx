import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const role = user.user_metadata?.role ?? "buyer"

  if (role === "admin") redirect("/dashboard/admin")
  if (role === "seller") redirect("/dashboard/vendor")
  if (role === "provider") redirect("/dashboard/provider")
  redirect("/dashboard/buyer")
}
