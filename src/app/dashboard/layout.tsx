import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import DashboardNav from "./nav"

export default async function DashboardLayout({ children }: any) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const role = user.user_metadata?.role ?? "buyer"
  const name = user.user_metadata?.name ?? user.email?.split("@")[0] ?? ""

  return (
    <div style={{ background: "#f5f5f5", minHeight: "100vh", display: "flex", fontFamily: "sans-serif" }}>
      <DashboardNav role={role} name={name} email={user.email ?? ""} />
      <main style={{ flex: 1, overflow: "auto" }}>
        {children}
      </main>
    </div>
  )
}
