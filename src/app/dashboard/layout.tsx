import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import DashboardNav from "./nav"
import { ThemeProvider } from "@/lib/theme-context"

export default async function DashboardLayout({ children }: any) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")
  const role = user.user_metadata?.role ?? "buyer"
  const name = user.user_metadata?.name ?? user.email?.split("@")[0] ?? ""
  return (
    <ThemeProvider>
      <div style={{ minHeight: "100vh", display: "flex", fontFamily: "sans-serif", background: "inherit" }}>
        <DashboardNav role={role} name={name} email={user.email ?? ""} />
        <main style={{ flex: 1, overflow: "auto", background: "inherit" }}>
          {children}
        </main>
      </div>
    </ThemeProvider>
  )
}


