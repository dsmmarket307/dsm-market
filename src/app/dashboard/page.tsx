import { createClient } from "@/lib/supabase/server"
import { createClient as createAdmin } from "@supabase/supabase-js"
import { redirect } from "next/navigation"

const roleLabels: any = { buyer: "Comprador", seller: "Vendedor", admin: "Administrador" }
const roleStats: any = {
  buyer: [{ label: "Pedidos activos", value: "0" }, { label: "Total comprado", value: "$0" }, { label: "Favoritos", value: "0" }],
  seller: [{ label: "Productos activos", value: "0" }, { label: "Ventas totales", value: "$0" }, { label: "Pendientes", value: "0" }],
  admin: [{ label: "Usuarios totales", value: "0" }, { label: "Transacciones", value: "0" }, { label: "Reportes", value: "0" }],
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const admin = createAdmin(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  const { data: profile } = await admin.from("profiles").select("*").eq("id", user.id).single()

  const role = user.user_metadata?.role ?? "buyer"
  const name = user.user_metadata?.name ?? user.email?.split("@")[0]
  const stats = roleStats[role] ?? roleStats.buyer
  const hour = new Date().getHours()
  const greeting = hour < 12 ? "Buenos dias" : hour < 19 ? "Buenas tardes" : "Buenas noches"

  return (
    <div style={{ padding: "2rem", maxWidth: "900px", margin: "0 auto", background: "#fff" }}>
      <div style={{ marginBottom: "2rem", paddingBottom: "1rem", borderBottom: "2px solid #C9A84C" }}>
        <p style={{ fontSize: "0.75rem", color: "#C9A84C", textTransform: "uppercase", letterSpacing: "0.2em", marginBottom: "0.25rem" }}>{greeting}</p>
        <h1 style={{ fontSize: "2rem", fontWeight: 600, color: "#111", marginBottom: "0.25rem" }}>{name}</h1>
        <span style={{ fontSize: "0.75rem", background: "#FBF5E6", color: "#C9A84C", padding: "0.25rem 0.75rem", border: "1px solid #C9A84C" }}>{roleLabels[role]}</span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem", marginBottom: "2rem" }}>
        {stats.map((stat: any, i: number) => (
          <div key={i} style={{ border: "1px solid #eee", padding: "1.5rem", background: "#fff" }}>
            <p style={{ fontSize: "0.75rem", color: "#888", textTransform: "uppercase", marginBottom: "0.5rem" }}>{stat.label}</p>
            <p style={{ fontSize: "2rem", fontWeight: 700, color: "#C9A84C" }}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div style={{ marginTop: "1.5rem" }}>
        {role === "admin" && <a href="/dashboard/admin" style={{ display: "inline-block", background: "#C9A84C", color: "#fff", padding: "0.875rem 2rem", textDecoration: "none", fontSize: "0.875rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>Ir al panel de administrador</a>}
        {role === "seller" && <a href="/dashboard/vendor" style={{ display: "inline-block", background: "#C9A84C", color: "#fff", padding: "0.875rem 2rem", textDecoration: "none", fontSize: "0.875rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>Ir al panel de vendedor</a>}
        {role === "buyer" && <a href="/dashboard/buyer" style={{ display: "inline-block", background: "#C9A84C", color: "#fff", padding: "0.875rem 2rem", textDecoration: "none", fontSize: "0.875rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>Ver productos</a>}
      </div>
    </div>
  )
}
