import { createClient } from "@/lib/supabase/server"
import { createClient as createAdmin } from "@supabase/supabase-js"
import { redirect } from "next/navigation"

const reasonLabels: any = {
  shipping_problem: "Problema con envio",
  damaged_product: "Producto danado",
  malfunction: "Mal funcionamiento",
  talk_to_advisor: "Hablar con asesor",
  other: "Otro",
}

const statusLabels: any = {
  open: "Abierta",
  in_review: "En revision",
  resolved: "Resuelta",
  closed: "Cerrada",
}

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

  return (
    <div style={{ padding: "2rem", maxWidth: "900px", margin: "0 auto", background: "#fff", minHeight: "100vh" }}>
      <div style={{ marginBottom: "2rem", paddingBottom: "1rem", borderBottom: "2px solid #C9A84C" }}>
        <p style={{ fontSize: "0.7rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#C9A84C", marginBottom: "0.25rem" }}>Vendedor</p>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 700, color: "#111" }}>Disputas de mis productos</h1>
      </div>

      {!disputes || disputes.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem", border: "1px solid #eee" }}>
          <p style={{ color: "#888", fontSize: "0.875rem" }}>No tienes disputas activas.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {disputes.map((dispute: any) => (
            <div key={dispute.id} style={{ border: "1px solid #eee", padding: "1.25rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
                    <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "#111" }}>{reasonLabels[dispute.reason] ?? dispute.reason}</span>
                    <span style={{ fontSize: "0.7rem", padding: "0.2rem 0.6rem", background: dispute.status === "open" ? "#fdecea" : dispute.status === "in_review" ? "#fff8e1" : "#e8f5e9", color: dispute.status === "open" ? "#c62828" : dispute.status === "in_review" ? "#f57f17" : "#2e7d32", border: "1px solid #eee" }}>
                      {statusLabels[dispute.status]}
                    </span>
                  </div>
                  <p style={{ fontSize: "0.8rem", color: "#555", marginBottom: "0.25rem" }}>{dispute.description}</p>
                  <p style={{ fontSize: "0.75rem", color: "#888" }}>Contacto: {dispute.phone} — {dispute.email}</p>
                  <p style={{ fontSize: "0.75rem", color: "#888" }}>{new Date(dispute.created_at).toLocaleDateString("es-CO")}</p>
                </div>
              </div>

              {dispute.evidence_urls && dispute.evidence_urls.length > 0 && (
                <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.75rem", flexWrap: "wrap" }}>
                  {dispute.evidence_urls.map((url: string, i: number) => (
                    <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                      <img src={url} alt={`Evidencia ${i+1}`} style={{ width: "70px", height: "70px", objectFit: "cover", border: "1px solid #eee" }} />
                    </a>
                  ))}
                </div>
              )}

              {dispute.admin_notes && (
                <div style={{ padding: "0.75rem", background: "#FBF5E6", border: "1px solid #C9A84C" }}>
                  <p style={{ fontSize: "0.75rem", color: "#C9A84C", fontWeight: 600, marginBottom: "0.25rem" }}>Respuesta del administrador:</p>
                  <p style={{ fontSize: "0.875rem", color: "#111" }}>{dispute.admin_notes}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
