import { createClient } from "@/lib/supabase/server"
import { createClient as createAdmin } from "@supabase/supabase-js"
import { redirect } from "next/navigation"
import { updateDisputeStatus } from "@/lib/actions/disputes"

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

  const open = disputes?.filter((d: any) => d.status === "open").length ?? 0
  const inReview = disputes?.filter((d: any) => d.status === "in_review").length ?? 0
  const resolved = disputes?.filter((d: any) => d.status === "resolved").length ?? 0

  return (
    <div style={{ padding: "2rem", maxWidth: "1000px", margin: "0 auto", background: "#fff", minHeight: "100vh" }}>
      <div style={{ marginBottom: "2rem", paddingBottom: "1rem", borderBottom: "2px solid #C9A84C" }}>
        <p style={{ fontSize: "0.7rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#C9A84C", marginBottom: "0.25rem" }}>Administrador</p>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 700, color: "#111" }}>Centro de Disputas</h1>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem", marginBottom: "2rem" }}>
        <div style={{ border: "1px solid #eee", padding: "1.25rem" }}>
          <p style={{ fontSize: "0.75rem", color: "#888", textTransform: "uppercase", marginBottom: "0.5rem" }}>Abiertas</p>
          <p style={{ fontSize: "1.75rem", fontWeight: 700, color: "#E05252" }}>{open}</p>
        </div>
        <div style={{ border: "1px solid #eee", padding: "1.25rem" }}>
          <p style={{ fontSize: "0.75rem", color: "#888", textTransform: "uppercase", marginBottom: "0.5rem" }}>En revision</p>
          <p style={{ fontSize: "1.75rem", fontWeight: 700, color: "#C9A84C" }}>{inReview}</p>
        </div>
        <div style={{ border: "1px solid #eee", padding: "1.25rem" }}>
          <p style={{ fontSize: "0.75rem", color: "#888", textTransform: "uppercase", marginBottom: "0.5rem" }}>Resueltas</p>
          <p style={{ fontSize: "1.75rem", fontWeight: 700, color: "#4CAF7D" }}>{resolved}</p>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {!disputes || disputes.length === 0 ? (
          <p style={{ color: "#888", textAlign: "center", padding: "3rem" }}>No hay disputas registradas.</p>
        ) : (
          disputes.map((dispute: any) => (
            <div key={dispute.id} style={{ border: "1px solid #eee", padding: "1.25rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
                    <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "#111" }}>{reasonLabels[dispute.reason] ?? dispute.reason}</span>
                    <span style={{ fontSize: "0.7rem", padding: "0.2rem 0.6rem", background: dispute.status === "open" ? "#fdecea" : dispute.status === "in_review" ? "#fff8e1" : "#e8f5e9", color: dispute.status === "open" ? "#c62828" : dispute.status === "in_review" ? "#f57f17" : "#2e7d32", border: "1px solid #eee" }}>
                      {statusLabels[dispute.status]}
                    </span>
                  </div>
                  <p style={{ fontSize: "0.8rem", color: "#555", marginBottom: "0.25rem" }}>{dispute.description}</p>
                  <p style={{ fontSize: "0.75rem", color: "#888" }}>Celular: {dispute.phone} — Email: {dispute.email}</p>
                  <p style={{ fontSize: "0.75rem", color: "#888" }}>{new Date(dispute.created_at).toLocaleDateString("es-CO")}</p>
                </div>
              </div>

              {dispute.evidence_urls && dispute.evidence_urls.length > 0 && (
                <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem", flexWrap: "wrap" }}>
                  {dispute.evidence_urls.map((url: string, i: number) => (
                    <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                      <img src={url} alt={`Evidencia ${i+1}`} style={{ width: "80px", height: "80px", objectFit: "cover", border: "1px solid #eee" }} />
                    </a>
                  ))}
                </div>
              )}

              {dispute.admin_notes && (
                <div style={{ padding: "0.75rem", background: "#f9f9f9", border: "1px solid #eee", marginBottom: "1rem" }}>
                  <p style={{ fontSize: "0.75rem", color: "#888", marginBottom: "0.25rem" }}>Notas del admin:</p>
                  <p style={{ fontSize: "0.875rem", color: "#111" }}>{dispute.admin_notes}</p>
                </div>
              )}

              <form action={async (formData: FormData) => {
                "use server"
                const status = formData.get("status") as string
                const notes = formData.get("notes") as string
                await updateDisputeStatus(dispute.id, status, notes)
              }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr auto", gap: "0.75rem", alignItems: "end" }}>
                  <div>
                    <label style={{ fontSize: "0.7rem", color: "#888", display: "block", marginBottom: "0.25rem" }}>Estado</label>
                    <select name="status" defaultValue={dispute.status} style={{ width: "100%", padding: "0.625rem", border: "1px solid #ddd", fontSize: "0.875rem", outline: "none" }}>
                      <option value="open">Abierta</option>
                      <option value="in_review">En revision</option>
                      <option value="resolved">Resuelta</option>
                      <option value="closed">Cerrada</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: "0.7rem", color: "#888", display: "block", marginBottom: "0.25rem" }}>Notas del administrador</label>
                    <input name="notes" defaultValue={dispute.admin_notes ?? ""} placeholder="Escribe una nota para el comprador..." style={{ width: "100%", padding: "0.625rem", border: "1px solid #ddd", fontSize: "0.875rem", outline: "none" }} />
                  </div>
                  <button type="submit" style={{ padding: "0.625rem 1.25rem", background: "#C9A84C", color: "#fff", border: "none", cursor: "pointer", fontSize: "0.8rem", fontWeight: 600 }}>
                    Actualizar
                  </button>
                </div>
              </form>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
