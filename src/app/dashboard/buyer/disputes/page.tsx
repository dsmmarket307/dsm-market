"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

const reasons = [
  { value: "shipping_problem", label: "Problema con mi envio" },
  { value: "damaged_product", label: "Producto danado" },
  { value: "malfunction", label: "Mal funcionamiento" },
  { value: "talk_to_advisor", label: "Hablar con un asesor" },
  { value: "other", label: "Otro" },
]

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

export default function BuyerDisputesPage() {
  const router = useRouter()
  const [view, setView] = useState("list")
  const [disputes, setDisputes] = useState<any[]>([])
  const [loadingDisputes, setLoadingDisputes] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])

  useEffect(() => {
    fetch("/api/disputes/buyer")
      .then((r) => r.json())
      .then((data) => { setDisputes(data.disputes ?? []); setLoadingDisputes(false) })
      .catch(() => setLoadingDisputes(false))
  }, [])

  function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files ?? [])
    setFiles(selected)
    setPreviews(selected.map((f) => URL.createObjectURL(f)))
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError("")
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    files.forEach((f) => formData.append("evidence", f))
    try {
      const response = await fetch("/api/disputes", { method: "POST", body: formData })
      const data = await response.json()
      if (data.error) { setError(data.error); setLoading(false) }
      else { setSuccess(true) }
    } catch {
      setError("Error al enviar. Intenta de nuevo.")
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div style={{ padding: "2rem", maxWidth: "700px", margin: "0 auto", background: "#fff", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
        <div style={{ width: "60px", height: "60px", background: "#e8f5e9", border: "1px solid #4CAF7D", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1.5rem" }}>
          <span style={{ fontSize: "1.5rem", color: "#4CAF7D" }}>✓</span>
        </div>
        <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#111", marginBottom: "0.75rem" }}>Disputa enviada</h2>
        <p style={{ fontSize: "0.875rem", color: "#888", marginBottom: "2rem" }}>Hemos recibido tu caso. Un asesor te contactara pronto.</p>
        <button onClick={() => { setSuccess(false); setView("list") }} style={{ padding: "0.875rem 2rem", background: "#C9A84C", color: "#fff", border: "none", cursor: "pointer", fontSize: "0.875rem", textTransform: "uppercase" }}>
          Ver mis disputas
        </button>
      </div>
    )
  }

  return (
    <div style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto", background: "#fff", minHeight: "100vh" }}>
      <div style={{ marginBottom: "2rem", paddingBottom: "1rem", borderBottom: "2px solid #C9A84C" }}>
        <p style={{ fontSize: "0.7rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#C9A84C", marginBottom: "0.25rem" }}>Centro de ayuda</p>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 700, color: "#111" }}>Disputas</h1>
      </div>

      <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem" }}>
        <button onClick={() => setView("list")} style={{ padding: "0.625rem 1.5rem", background: view === "list" ? "#C9A84C" : "#fff", color: view === "list" ? "#fff" : "#888", border: "1px solid #ddd", cursor: "pointer", fontSize: "0.875rem" }}>
          Mis disputas
        </button>
        <button onClick={() => setView("new")} style={{ padding: "0.625rem 1.5rem", background: view === "new" ? "#C9A84C" : "#fff", color: view === "new" ? "#fff" : "#888", border: "1px solid #ddd", cursor: "pointer", fontSize: "0.875rem" }}>
          + Nueva disputa
        </button>
      </div>

      {view === "list" && (
        <div>
          {loadingDisputes ? (
            <p style={{ color: "#888", textAlign: "center", padding: "2rem" }}>Cargando...</p>
          ) : disputes.length === 0 ? (
            <div style={{ textAlign: "center", padding: "3rem", border: "1px solid #eee" }}>
              <p style={{ color: "#888", fontSize: "0.875rem", marginBottom: "1rem" }}>No tienes disputas activas.</p>
              <button onClick={() => setView("new")} style={{ padding: "0.75rem 1.5rem", background: "#C9A84C", color: "#fff", border: "none", cursor: "pointer", fontSize: "0.875rem" }}>
                Abrir una disputa
              </button>
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
                      <p style={{ fontSize: "0.75rem", color: "#888" }}>{new Date(dispute.created_at).toLocaleDateString("es-CO")}</p>
                    </div>
                  </div>

                  {dispute.evidence_urls && dispute.evidence_urls.length > 0 && (
                    <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.75rem", flexWrap: "wrap" }}>
                      {dispute.evidence_urls.map((url: string, i: number) => (
                        <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                          <img src={url} alt="" style={{ width: "60px", height: "60px", objectFit: "cover", border: "1px solid #eee" }} />
                        </a>
                      ))}
                    </div>
                  )}

                  {dispute.admin_notes ? (
                    <div style={{ padding: "0.875rem", background: "#FBF5E6", border: "1px solid #C9A84C" }}>
                      <p style={{ fontSize: "0.7rem", color: "#C9A84C", fontWeight: 700, textTransform: "uppercase", marginBottom: "0.375rem" }}>Respuesta del equipo DMS Market</p>
                      <p style={{ fontSize: "0.875rem", color: "#111" }}>{dispute.admin_notes}</p>
                    </div>
                  ) : (
                    <div style={{ padding: "0.75rem", background: "#f9f9f9", border: "1px solid #eee" }}>
                      <p style={{ fontSize: "0.8rem", color: "#888" }}>Tu caso esta siendo revisado. Te contactaremos pronto.</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {view === "new" && (
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {error && (
            <div style={{ padding: "0.875rem", background: "#fdecea", border: "1px solid #E05252", color: "#c62828", fontSize: "0.875rem" }}>
              {error}
            </div>
          )}

          <div>
            <label style={{ display: "block", fontSize: "0.75rem", color: "#888", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.5rem" }}>Tipo de problema *</label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
              {reasons.map((r) => (
                <label key={r.value} style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.875rem 1rem", border: "1px solid #ddd", cursor: "pointer" }}>
                  <input type="radio" name="reason" value={r.value} required style={{ accentColor: "#C9A84C" }} />
                  <span style={{ fontSize: "0.875rem", color: "#111" }}>{r.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.75rem", color: "#888", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.5rem" }}>Numero de orden (opcional)</label>
            <input name="order_id" type="text" placeholder="Ej: abc12345..." style={{ width: "100%", padding: "0.75rem 1rem", border: "1px solid #ddd", fontSize: "0.875rem", outline: "none", color: "#111" }} />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.75rem", color: "#888", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.5rem" }}>Descripcion *</label>
            <textarea name="description" required rows={4} placeholder="Describe detalladamente lo que ocurrio..." style={{ width: "100%", padding: "0.75rem 1rem", border: "1px solid #ddd", fontSize: "0.875rem", outline: "none", color: "#111", resize: "vertical" }} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.75rem", color: "#888", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.5rem" }}>Celular *</label>
              <input name="phone" type="tel" required placeholder="3001234567" style={{ width: "100%", padding: "0.75rem 1rem", border: "1px solid #ddd", fontSize: "0.875rem", outline: "none", color: "#111" }} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.75rem", color: "#888", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.5rem" }}>Correo *</label>
              <input name="email" type="email" required placeholder="tu@correo.com" style={{ width: "100%", padding: "0.75rem 1rem", border: "1px solid #ddd", fontSize: "0.875rem", outline: "none", color: "#111" }} />
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.75rem", color: "#888", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.5rem" }}>Evidencia</label>
            <div style={{ border: "2px dashed #ddd", padding: "1.5rem", textAlign: "center", cursor: "pointer" }} onClick={() => document.getElementById("evidence-input")?.click()}>
              <input id="evidence-input" type="file" accept="image/*,video/*" multiple style={{ display: "none" }} onChange={handleFiles} />
              <p style={{ fontSize: "0.875rem", color: "#888" }}>Clic para subir fotos o videos</p>
              <p style={{ fontSize: "0.75rem", color: "#C9A84C", marginTop: "0.25rem" }}>{files.length} archivo(s)</p>
            </div>
            {previews.length > 0 && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.5rem", marginTop: "0.75rem" }}>
                {previews.map((p, i) => <img key={i} src={p} alt="" style={{ width: "100%", aspectRatio: "1", objectFit: "cover", border: "1px solid #eee" }} />)}
              </div>
            )}
          </div>

          <div style={{ display: "flex", gap: "1rem" }}>
            <button type="submit" disabled={loading} style={{ flex: 1, padding: "1rem", background: "#C9A84C", color: "#fff", border: "none", cursor: loading ? "not-allowed" : "pointer", fontSize: "0.875rem", textTransform: "uppercase", fontWeight: 600, opacity: loading ? 0.7 : 1 }}>
              {loading ? "Enviando..." : "Enviar disputa"}
            </button>
            <button type="button" onClick={() => setView("list")} style={{ flex: 1, padding: "1rem", background: "#fff", color: "#888", border: "1px solid #ddd", cursor: "pointer", fontSize: "0.875rem" }}>
              Cancelar
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
