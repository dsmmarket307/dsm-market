import { createClient } from "@/lib/supabase/server"
import { createClient as createAdmin } from "@supabase/supabase-js"
import { redirect } from "next/navigation"
import DisputesClient from "./DisputesClient"

export default async function VendorDisputesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")
  if (user.user_metadata?.role !== "seller") redirect("/dashboard")

  const admin = createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: disputes } = await admin
    .from("disputes")
    .select("*")
    .eq("seller_id", user.id)
    .order("created_at", { ascending: false })

  return <DisputesClient disputes={disputes ?? []} />
}