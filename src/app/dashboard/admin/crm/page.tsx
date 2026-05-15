import { createClient } from "@/lib/supabase/server"
import { createClient as createAdmin } from "@supabase/supabase-js"
import { redirect } from "next/navigation"

export default async function CRMDropiPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")
  const role = user.user_metadata?.role ?? "buyer"
  if (role !== "admin") redirect("/dashboard")

  const admin = createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: pedidos } = await admin
    .from("crm_pedidos_dropi")
    .select("*")
    .order("created_at", { ascending: false })

  const lista = pedidos ?? []
  const totalGanancia = lista.reduce((s: number, p: any) => s + Number(p.ganancia ?? 0), 0)
  const pendientes = lista.filter((p: any) => p.estado === "pendiente").length
  const enCamino = lista.filter((p: any) => p.estado === "en_camino").length

  return (
    <div style={{ padding: "2rem", maxWidth: "1100px", margin: "0 auto", background: "#fff", minHeight: "100vh" }}>
      <div style={{ marginBottom: "2rem", paddingBottom: "1rem", borderBottom: "2px solid #C9A84C" }}>
        <p style={{ fontSize: "0.7rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#C9A84C", marginBottom: "0.25rem" }}>Centro de control</p>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 700, color: "#111", margin: 0 }}>CRM Dropi</h1>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", marginBottom: "2.5rem" }}>
        <div style={{ border: "1px solid #eee", padding: "1.5rem" }}>
          <p style={{ fontSize: "0.7rem", color: "#888", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.5rem" }}>Total pedidos</p>
          <p style={{ fontSize: "1.75rem", fontWeight: 700, color: "#111" }}>{lista.length}</p>
        </div>
        <div style={{ border: "1px solid #eee", padding: "1.5rem" }}>
          <p style={{ fontSize: "0.7rem", color: "#888", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.5rem" }}>Pendientes</p>
          <p style={{ fontSize: "1.75rem", fontWeight: 700, color: "#E8A020" }}>{pendientes}</p>
        </div>
        <div style={{ border: "1px solid #eee", padding: "1.5rem" }}>
          <p style={{ fontSize: "0.7rem", color: "#888", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.5rem" }}>En camino</p>
          <p style={{ fontSize: "1.75rem", fontWeight: 700, color: "#8B5CF6" }}>{enCamino}</p>
        </div>
        <div style={{ border: "1px solid #eee", padding: "1.5rem" }}>
          <p style={{ fontSize: "0.7rem", color: "#888", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.5rem" }}>Ganancia total</p>
          <p style={{ fontSize: "1.75rem", fontWeight: 700, color: "#22C55E" }}>${totalGanancia.toLocaleString("es-CO")}</p>
        </div>
      </div>

      <div style={{ border: "1px solid #eee" }}>
        <div style={{ padding: "1rem 1.5rem", borderBottom: "1px solid #eee" }}>
          <p style={{ fontWeight: 700, color: "#111", fontSize: "0.95rem" }}>Pedidos Dropi</p>
        </div>
        {lista.length === 0 ? (
          <div style={{ padding: "3rem", textAlign: "center" }}>
            <p style={{ fontSize: "0.9rem", color: "#888" }}>No hay pedidos Dropi aun.</p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem" }}>
              <thead>
                <tr style={{ background: "#fafafa" }}>
                  {["Codigo", "Producto", "Cliente", "Telefono", "Proveedor", "Venta", "Ganancia", "Estado"].map(h => (
                    <th key={h} style={{ padding: "0.75rem 1rem", textAlign: "left", fontWeight: 700, color: "#888", textTransform: "uppercase", fontSize: "0.65rem", letterSpacing: "0.08em", borderBottom: "1px solid #eee" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {lista.map((p: any, i: number) => (
                  <tr key={p.id} style={{ borderBottom: "1px solid #f5f5f5", background: i % 2 === 0 ? "#fff" : "#fafafa" }}>
                    <td style={{ padding: "0.875rem 1rem", color: "#C9A84C", fontWeight: 700, fontFamily: "monospace" }}>{p.codigo_producto}</td>
                    <td style={{ padding: "0.875rem 1rem", color: "#111" }}>{p.nombre_producto}</td>
                    <td style={{ padding: "0.875rem 1rem", color: "#444" }}>{p.cliente_nombre}</td>
                    <td style={{ padding: "0.875rem 1rem", color: "#444" }}>{p.cliente_telefono}</td>
                    <td style={{ padding: "0.875rem 1rem", color: "#555" }}>${Number(p.precio_proveedor).toLocaleString("es-CO")}</td>
                    <td style={{ padding: "0.875rem 1rem", color: "#111", fontWeight: 600 }}>${Number(p.precio_venta).toLocaleString("es-CO")}</td>
                    <td style={{ padding: "0.875rem 1rem", color: "#22C55E", fontWeight: 700 }}>${Number(p.ganancia).toLocaleString("es-CO")}</td>
                    <td style={{ padding: "0.875rem 1rem" }}>
                      <span style={{ padding: "0.2rem 0.65rem", fontSize: "0.7rem", fontWeight: 700, color: "#fff", background: p.estado === "pendiente" ? "#E8A020" : p.estado === "en_camino" ? "#8B5CF6" : p.estado === "entregado" ? "#22C55E" : "#3B82F6", borderRadius: "2px" }}>
                        {p.estado}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}