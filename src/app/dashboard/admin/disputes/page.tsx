import { createClient } from "@/lib/supabase/server"
import { createClient as createAdmin } from "@supabase/supabase-js"
import { redirect } from "next/navigation"
import { updateDisputeStatus } from "@/lib/actions/disputes"
import { DisputesClient } from "./DisputesClient"

export default async function AdminDisputesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")
  if (user.user_metadata?.role !== "admin") redirect("/dashboard")

  const admin = createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: disputes } = await admin
    .from("disputes")
    .select("*")
    .order("created_at", { ascending: false })

  const updateDisputeAction = async (id: string, status: string, notes: string) => {
    "use server"
    await updateDisputeStatus(id, status, notes)
  }

  return (
    <DisputesClient
      disputes={disputes ?? []}
      updateDisputeAction={updateDisputeAction}
    />
  )
}
