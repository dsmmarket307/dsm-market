import { createClient } from "@/lib/supabase/server"
import { createClient as createAdmin } from "@supabase/supabase-js"
import { redirect } from "next/navigation"
import Link from "next/link"

type PedidoDropi = {
  id: string
  order_id: string
  codigo_producto: string
  nombre_producto: string
  cliente_nombre: string
  cliente_telefono: string
  cliente_direccion: string
  precio_proveedor: number
  precio_venta: number
  ganancia: number
  codigo: string
  guia: string | null
  estado: "pendiente" | "comprado" | "en_camino" | "entregado"
  created_at: string
}

const ESTADO_LABEL: Record<string, string> = {
  pendiente: "Pendiente",
  comprado: "Comprado en Dropi",
  en_camino: "En camino",
  entregado: "Entregado",
}

const ESTADO_COLOR: Record<string, string> = {
  pendiente: "#E8A020",
  comprado: "#3B82F6",
  en_camino: "#8B5CF6",
  entregado: "#22C55E",
}

function formatCOP(n: number) {
  return "$" + n.toLocaleString("es-CO")
}

function Badge({ estado }: { estado: string }) {
  return (
    <span style={{
      display: "inline-block",
      padding: "0.2rem 0.65rem",
      fontSize: "0.7rem",
      fontWeight: 700,
      letterSpacing: "0.05em",
      textTransform: "uppercase",
      color: "#fff",
      background: ESTADO_COLOR[estado] ?? "#888",
      borderRadius: "2px",
    }}>
      {ESTADO_LABEL[estado] ?? estado}
    </span>
  )
}

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

  const { data: pedidos, error } = await admin
    .from("crm_pedidos_dropi")
    .select("*")
    .order("created_at", { ascending: false })

  const lista: PedidoDropi[] = pedidos ?? []

  const totalPedidos = lista.length
  const totalGanancia = lista.reduce((s, p) => s + Number(p.ganancia ?? 0), 0)
  const pendientes = lista.filter(p => p.estado === "pendiente").length
  const enCamino = lista.filter(p => p.estado === "en_camino").length
  const tablaNoExiste = error?.message?.includes("does not exist")

  return (
    <div style={{ padding: "2rem", maxWidth: "1100px", margin: "0 auto", background: "#fff", minHeight: "100vh" }}>

      <div style={{ marginBottom: "2rem", paddingBottom: "1rem", borderBottom: "2px solid #C9A84C", display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <p style={{ fontSize: "0.7rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#C9A84C", marginBottom: "0.25rem" }}>Centro de control</p>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 700, color: "#111", margin: 0 }}>CRM Dropi</h1>
        </div>
        <Link href="/dashboard/admin/crm/nuevo" style={{ display: "inline-block", padding: "0.6rem 1.25rem", background: "#111", color: "#C9A84C", fontSize: "0.8rem", fontWeight: 700, textDecoration: "none", letterSpacing: "0.05em", border: "1px solid #111" }}>
          + Nuevo pedido Dropi
        </Link>
      </div>

      {tablaNoExiste && (
        <div style={{ marginBottom: "2rem", padding: "1.25rem 1.5rem", background: "#FBF5E6", border: "1px solid #C9A84C", borderLeft: "4px solid #C9A84C" }}>
          <p style={{ fontWeight: 700, color: "#111", marginBottom: "0.5rem" }}>Tabla CRM no creada aun</p>
          <p style={{ fontSize: "0.85rem", color: "#555", marginBottom: "0.75rem" }}>Ejecuta este SQL en Supabase para activar el CRM:</p>
          <pre style={{ background: "#111", color: "#C9A84C", padding: "1rem", fontSize: "0.75rem", overflowX: "auto", lineHeight: 1.6 }}>{`CREATE TABLE crm_pedidos_dropi (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id         TEXT,
  codigo_producto  TEXT,
  nombre_producto  TEXT,
  cliente_nombre   TEXT,
  cliente_telefono TEXT,
  cliente_direccion TEXT,
  precio_proveedor NUMERIC DEFAULT 0,
  precio_venta     NUMERIC DEFAULT 0,
  ganancia         NUMERIC GENERATED ALWAYS AS (precio_venta - precio_proveedor) STORED,
  codigo       TEXT,
  guia             TEXT,
  estado           TEXT DEFAULT 'pendiente',
  created_at       TIMESTAMPTZ DEFAULT now()
);`}</pre>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", marginBottom: "2.5rem" }}>
        {[
          { label: "Total pedidos", value: totalPedidos, color: "#111" },
          { label: "Pendientes", value: pendientes, color: "#E8A020" },
          { label: "En camino", value: enCamino, color: "#8B5CF6" },
          { label: "Ganancia total", value: formatCOP(totalGanancia), color: "#22C55E" },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ border: "1px solid #eee", padding: "1.5rem" }}>
            <p style={{ fontSize: "0.7rem", color: "#888", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.5rem" }}>{label}</p>
            <p style={{ fontSize: "1.75rem", fontWeight: 700, color }}>{value}</p>
          </div>
        ))}
      </div>

      <div style={{ border: "1px solid #eee" }}>
        <div style={{ padding: "1rem 1.5rem", borderBottom: "1px solid #eee", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <p style={{ fontWeight: 700, color: "#111", fontSize: "0.95rem" }}>Pedidos Dropi</p>
          <p style={{ fontSize: "0.75rem", color: "#888" }}>{totalPedidos} pedido{totalPedidos !== 1 ? "s" : ""}</p>
        </div>

        {lista.length === 0 ? (
          <div style={{ padding: "3rem", textAlign: "center" }}>
            <p style={{ fontSize: "0.9rem", color: "#888", marginBottom: "0.5rem" }}>No hay pedidos Dropi aun.</p>
            <p style={{ fontSize: "0.8rem", color: "#bbb" }}>Cuando un producto de Dropi se venda, aparecera aqui.</p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem" }}>
              <thead>
                <tr style={{ background: "#fafafa" }}>
                  {["Codigo", "Producto", "Cliente", "Telefono", "Proveedor", "Venta", "Ganancia", "Estado", "Accion"].map(h => (
                    <th key={h} style={{ padding: "0.75rem 1rem", textAlign: "left", fontWeight: 700, color: "#888", textTransform: "uppercase", fontSize: "0.65rem", letterSpacing: "0.08em", borderBottom: "1px solid #eee" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {lista.map((p, i) => (
                  <tr key={p.id} style={{ borderBottom: "1px solid #f5f5f5", background: i % 2 === 0 ? "#fff" : "#fafafa" }}>
                    <td style={{ padding: "0.875rem 1rem", color: "#C9A84C", fontWeight: 700, fontFamily: "monospace" }}>{p.codigo_producto}</td>
                    <td style={{ padding: "0.875rem 1rem", color: "#111", maxWidth: "160px" }}>
                      <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.nombre_producto}</div>
                    </td>
                    <td style={{ padding: "0.875rem 1rem", color: "#444" }}>{p.cliente_nombre}</td>
                    <td style={{ padding: "0.875rem 1rem", color: "#444" }}>{p.cliente_telefono}</td>
                    <td style={{ padding: "0.875rem 1rem", color: "#555" }}>{formatCOP(Number(p.precio_proveedor))}</td>
                    <td style={{ padding: "0.875rem 1rem", color: "#111", fontWeight: 600 }}>{formatCOP(Number(p.precio_venta))}</td>
                    <td style={{ padding: "0.875rem 1rem", color: "#22C55E", fontWeight: 700 }}>{formatCOP(Number(p.ganancia))}</td>
                    <td style={{ padding: "0.875rem 1rem" }}><Badge estado={p.estado} /></td>
                    <td style={{ padding: "0.875rem 1rem" }}>
                      <Link href={`/dashboard/admin/crm/${p.id}`} style={{ fontSize: "0.75rem", color: "#C9A84C", fontWeight: 700, textDecoration: "none" }}>
                        Ver
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div style={{ marginTop: "2rem", padding: "1rem 1.5rem", background: "#fafafa", border: "1px solid #eee", display: "flex", gap: "2rem", flexWrap: "wrap" }}>
        {Object.entries(ESTADO_LABEL).map(([key, label]) => (
          <div key={key} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: ESTADO_COLOR[key] }} />
            <span style={{ fontSize: "0.75rem", color: "#555" }}>{label}</span>
          </div>
        ))}
      </div>

    </div>
  )
}
