"use client"

import { useTheme } from "@/lib/theme-context"

const THEMES = {
  dark:  { bg: "#0f0f0f", bg2: "#1a1a1a", text: "#ffffff", text2: "#999999", border: "rgba(212,175,55,0.12)", gold: "#D4AF37", input: "#0f0f0f", inputBorder: "rgba(255,255,255,0.1)", inputText: "#ffffff" },
  light: { bg: "#f5f5f5", bg2: "#e8e8e8", text: "#111111", text2: "#666666", border: "rgba(0,0,0,0.1)",        gold: "#B8960C", input: "#ffffff", inputBorder: "rgba(0,0,0,0.15)",    inputText: "#111111" },
}

const reasonLabels: Record<string, string> = {
  shipping_problem: "Problema con envio",
  damaged_product:  "Producto danado",
  malfunction:      "Mal funcionamiento",
  talk_to_advisor:  "Hablar con asesor",
  other:            "Otro",
}

const statusLabels: Record<string, string> = {
  open:      "Abierta",
  in_review: "En revision",
  resolved:  "Resuelta",
  closed:    "Cerrada",
}

interface Dispute {
  id: string
  status: string
  reason: string
  description: string
  phone: string
  email: string
  admin_notes?: string | null
  evidence_urls?: string[] | null
  created_at: string
  [key: string]: any
}

interface Props {
  disputes: Dispute[]
  updateDisputeAction: (id: string, status: string, notes: string) => Promise<void>
}

export function DisputesClient({ disputes, updateDisputeAction }: Props) {
  const { theme } = useTheme()
  const t = THEMES[theme]

  const open     = disputes.filter((d) => d.status === "open").length
  const inReview = disputes.filter((d) => d.status === "in_review").length
  const resolved = disputes.filter((d) => d.status === "resolved").length

  return (
    <div style={{ padding: "2rem", maxWidth: "1000px", margin: "0 auto", background: t.bg, minHeight: "100vh", fontFamily: "'Poppins',sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet" />

      <div style={{ marginBottom: "2rem", paddingBottom: "1rem", borderBottom: `2px solid ${t.gold}` }}>
        <p style={{ fontSize: "0.7rem", letterSpacing: "0.2em", textTransform: "uppercase", color: t.gold, marginBottom: "0.25rem" }}>Administrador</p>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 700, color: t.text, margin: 0 }}>Centro de Disputas</h1>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem", marginBottom: "2rem" }}>
        <div style={{ border: `1px solid ${t.border}`, padding: "1.25rem", borderRadius: 12, background: t.bg2 }}>
          <p style={{ fontSize: "0.75rem", color: t.text2, textTransform: "uppercase", marginBottom: "0.5rem" }}>Abiertas</p>
          <p style={{ fontSize: "1.75rem", fontWeight: 700, color: "#E05252", margin: 0 }}>{open}</p>
        </div>
        <div style={{ border: `1px solid ${t.border}`, padding: "1.25rem", borderRadius: 12, background: t.bg2 }}>
          <p style={{ fontSize: "0.75rem", color: t.text2, textTransform: "uppercase", marginBottom: "0.5rem" }}>En revision</p>
          <p style={{ fontSize: "1.75rem", fontWeight: 700, color: t.gold, margin: 0 }}>{inReview}</p>
        </div>
        <div style={{ border: `1px solid ${t.border}`, padding: "1.25rem", borderRadius: 12, background: t.bg2 }}>
          <p style={{ fontSize: "0.75rem", color: t.text2, textTransform: "uppercase", marginBottom: "0.5rem" }}>Resueltas</p>
          <p style={{ fontSize: "1.75rem", fontWeight: 700, color: "#4CAF7D", margin: 0 }}>{resolved}</p>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {disputes.length === 0 ? (
          <p style={{ color: t.text2, textAlign: "center", padding: "3rem" }}>No hay disputas registradas.</p>
        ) : (
          disputes.map((dispute) => (
            <div key={dispute.id} style={{ border: `1px solid ${t.border}`, padding: "1.25rem", borderRadius: 12, background: t.bg2 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
                    <span style={{ fontSize: "0.875rem", fontWeight: 600, color: t.text }}>
                      {reasonLabels[dispute.reason] ?? dispute.reason}
                    </span>
                    <span style={{
                      fontSize: "0.7rem", padding: "0.2rem 0.6rem", borderRadius: 999,
                      background: dispute.status === "open" ? "rgba(224,82,82,0.1)" : dispute.status === "in_review" ? "rgba(212,175,55,0.1)" : "rgba(76,175,125,0.1)",
                      color:      dispute.status === "open" ? "#E05252"              : dispute.status === "in_review" ? t.gold                   : "#4CAF7D",
                      border: `1px solid ${dispute.status === "open" ? "rgba(224,82,82,0.2)" : dispute.status === "in_review" ? "rgba(212,175,55,0.2)" : "rgba(76,175,125,0.2)"}`,
                    }}>
                      {statusLabels[dispute.status]}
                    </span>
                  </div>
                  <p style={{ fontSize: "0.8rem", color: t.text2, marginBottom: "0.25rem" }}>{dispute.description}</p>
                  <p style={{ fontSize: "0.75rem", color: t.text2 }}>Celular: {dispute.phone} — Email: {dispute.email}</p>
                  <p style={{ fontSize: "0.75rem", color: t.text2 }}>{new Date(dispute.created_at).toLocaleDateString("es-CO")}</p>
                </div>
              </div>

              {dispute.evidence_urls && dispute.evidence_urls.length > 0 && (
                <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem", flexWrap: "wrap" }}>
                  {dispute.evidence_urls.map((url: string, i: number) => (
                    <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                      <img src={url} alt={`Evidencia ${i + 1}`} style={{ width: "80px", height: "80px", objectFit: "cover", border: `1px solid ${t.border}`, borderRadius: 6 }} />
                    </a>
                  ))}
                </div>
              )}

              {dispute.admin_notes && (
                <div style={{ padding: "0.75rem", background: t.bg, border: `1px solid ${t.border}`, borderRadius: 8, marginBottom: "1rem" }}>
                  <p style={{ fontSize: "0.75rem", color: t.text2, marginBottom: "0.25rem" }}>Notas del admin:</p>
                  <p style={{ fontSize: "0.875rem", color: t.text, margin: 0 }}>{dispute.admin_notes}</p>
                </div>
              )}

              <form action={async (formData: FormData) => {
                const status = formData.get("status") as string
                const notes  = formData.get("notes") as string
                await updateDisputeAction(dispute.id, status, notes)
              }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr auto", gap: "0.75rem", alignItems: "end" }}>
                  <div>
                    <label style={{ fontSize: "0.7rem", color: t.text2, display: "block", marginBottom: "0.25rem" }}>Estado</label>
                    <select name="status" defaultValue={dispute.status} style={{ width: "100%", padding: "0.625rem", background: t.input, border: `1px solid ${t.inputBorder}`, color: t.inputText, fontSize: "0.875rem", outline: "none", borderRadius: 6 }}>
                      <option value="open">Abierta</option>
                      <option value="in_review">En revision</option>
                      <option value="resolved">Resuelta</option>
                      <option value="closed">Cerrada</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: "0.7rem", color: t.text2, display: "block", marginBottom: "0.25rem" }}>Notas del administrador</label>
                    <input name="notes" defaultValue={dispute.admin_notes ?? ""} placeholder="Escribe una nota para el comprador..." style={{ width: "100%", padding: "0.625rem", background: t.input, border: `1px solid ${t.inputBorder}`, color: t.inputText, fontSize: "0.875rem", outline: "none", borderRadius: 6, boxSizing: "border-box" }} />
                  </div>
                  <button type="submit" style={{ padding: "0.625rem 1.25rem", background: t.gold, color: "#fff", border: "none", cursor: "pointer", fontSize: "0.8rem", fontWeight: 600, borderRadius: 6 }}>
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
