import { createClient } from "@/lib/supabase/server"
import { createClient as createAdmin } from "@supabase/supabase-js"
import { redirect } from "next/navigation"

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const admin = createAdmin(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  const { data: profile } = await admin.from("profiles").select("role").eq("id", user.id).single()

  const role = profile?.role ?? user.user_metadata?.role ?? "buyer"

  if (role === "admin") redirect("/dashboard/admin")
  if (role === "seller") redirect("/dashboard/vendor")
  if (role === "provider") redirect("/dashboard/provider")
  redirect("/dashboard/buyer")
}
