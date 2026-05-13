import { createClient } from "@/lib/supabase/server"
import { createClient as createAdmin } from "@supabase/supabase-js"
import { redirect } from "next/navigation"
import Link from "next/link"

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
    <div style={{ padding: "2rem", maxWidth: "1000px", margin: "0 auto", background: "#fff", minHeight: "100vh" }}>

      <div style={{ marginBottom: "2rem", paddingBottom: "1rem", borderBottom: "2px solid #C9A84C" }}>
        <p style={{ fontSize: "0.7rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#C9A84C", marginBottom: "0.25rem" }}>Panel</p>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 700, color: "#111" }}>Administrador</h1>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", marginBottom: "2.5rem" }}>
        <div style={{ border: "1px solid #eee", padding: "1.5rem" }}>
          <p style={{ fontSize: "0.75rem", color: "#888", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.5rem" }}>Vendedores pendientes</p>
          <p style={{ fontSize: "2rem", fontWeight: 700, color: "#C9A84C" }}>{pendingVendors?.length ?? 0}</p>
        </div>
        <div style={{ border: "1px solid #eee", padding: "1.5rem" }}>
          <p style={{ fontSize: "0.75rem", color: "#888", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.5rem" }}>Productos pendientes</p>
          <p style={{ fontSize: "2rem", fontWeight: 700, color: "#C9A84C" }}>{pendingProducts?.length ?? 0}</p>
        </div>
        <div style={{ border: "1px solid #eee", padding: "1.5rem" }}>
          <p style={{ fontSize: "0.75rem", color: "#888", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.5rem" }}>Servicios pendientes</p>
          <p style={{ fontSize: "2rem", fontWeight: 700, color: "#C9A84C" }}>{pendingServices?.length ?? 0}</p>
        </div>
        <div style={{ border: "1px solid #eee", padding: "1.5rem" }}>
          <p style={{ fontSize: "0.75rem", color: "#888", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.5rem" }}>Comisiones ganadas</p>
          <p style={{ fontSize: "2rem", fontWeight: 700, color: "#4CAF7D" }}>${totalRevenue.toLocaleString("es-CO")}</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
        <Link href="/dashboard/admin/vendors" style={{ textDecoration: "none", border: "1px solid #eee", padding: "1.5rem", display: "block" }}>
          <div style={{ width: "32px", height: "3px", background: "#C9A84C", marginBottom: "1rem" }} />
          <p style={{ fontSize: "1.125rem", fontWeight: 600, color: "#111", marginBottom: "0.375rem" }}>Vendedores</p>
          <p style={{ fontSize: "0.8rem", color: "#888" }}>Aprobar o rechazar perfiles de vendedores</p>
          <p style={{ marginTop: "1rem", fontSize: "0.8rem", color: "#C9A84C", fontWeight: 600 }}>Ver vendedores →</p>
        </Link>

        <Link href="/dashboard/admin/products" style={{ textDecoration: "none", border: "1px solid #eee", padding: "1.5rem", display: "block" }}>
          <div style={{ width: "32px", height: "3px", background: "#C9A84C", marginBottom: "1rem" }} />
          <p style={{ fontSize: "1.125rem", fontWeight: 600, color: "#111", marginBottom: "0.375rem" }}>Productos</p>
          <p style={{ fontSize: "0.8rem", color: "#888" }}>Aprobar o rechazar productos de vendedores</p>
          <p style={{ marginTop: "1rem", fontSize: "0.8rem", color: "#C9A84C", fontWeight: 600 }}>Ver productos →</p>
        </Link>

        <Link href="/dashboard/admin/services" style={{ textDecoration: "none", border: "1px solid #eee", padding: "1.5rem", display: "block" }}>
          <div style={{ width: "32px", height: "3px", background: "#C9A84C", marginBottom: "1rem" }} />
          <p style={{ fontSize: "1.125rem", fontWeight: 600, color: "#111", marginBottom: "0.375rem" }}>Servicios</p>
          <p style={{ fontSize: "0.8rem", color: "#888" }}>Aprobar o rechazar servicios de proveedores</p>
          <p style={{ marginTop: "1rem", fontSize: "0.8rem", color: "#C9A84C", fontWeight: 600 }}>Ver servicios →</p>
        </Link>
      </div>
    </div>
  )
}