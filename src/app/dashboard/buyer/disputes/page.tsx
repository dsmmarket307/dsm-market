"use client"

import { useState, useEffect } from "react"
import { useTheme } from "@/lib/theme-context"

const THEMES = {
  dark: { bg: '#0f0f0f', card: '#151515', text: '#ffffff', text2: '#999999', text3: '#555555', border: 'rgba(255,255,255,0.06)', borderDash: 'rgba(212,175,55,0.3)', input: '#151515', gold: '#D4AF37', goldBg: 'rgba(212,175,55,0.08)', goldBorder: 'rgba(212,175,55,0.2)' },
  light: { bg: '#f5f5f5', card: '#ffffff', text: '#111111', text2: '#666666', text3: '#999999', border: 'rgba(0,0,0,0.1)', borderDash: 'rgba(184,150,12,0.4)', input: '#f0f0f0', gold: '#B8960C', goldBg: 'rgba(184,150,12,0.08)', goldBorder: 'rgba(184,150,12,0.2)' },
}

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
  const { theme } = useTheme()
  const t = THEMES[theme]

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
      <div style={{ padding: "2rem", display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh", fontFamily: "'Poppins', sans-serif", background: t.bg }}>
        <div style={{ textAlign: "center", maxWidth: "400px" }}>
          <div style={{ width: "64px", height: "64px", background: "rgba(76,175,80,0.15)", border: "1px solid #4CAF7D", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem" }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#4CAF7D" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          </div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: t.text, marginBottom: "0.75rem" }}>Disputa enviada</h2>
          <p style={{ fontSize: "0.875rem", color: t.text2, marginBottom: "2rem" }}>Hemos recibido tu caso. Un asesor te contactara pronto.</p>
          <button onClick={() => { setSuccess(false); setView("list") }} style={{ padding: "0.875rem 2rem", background: t.gold, color: "#0B0B0B", border: "none", cursor: "pointer", fontSize: "0.875rem", fontWeight: 700, borderRadius: "8px" }}>
            Ver mis disputas
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: "2rem", fontFamily: "'Poppins', sans-serif", background: t.bg, minHeight: "100vh" }}>

      <div style={{ marginBottom: "2rem" }}>
        <p style={{ fontSize: "0.65rem", letterSpacing: "3px", textTransform: "uppercase", color: t.gold, marginBottom: "0.25rem" }}>Centro de ayuda</p>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 700, color: t.text, margin: 0 }}>Disputas</h1>
      </div>

      <div style={{ display: "flex", gap: "0.75rem", marginBottom: "2rem" }}>
        <button onClick={() => setView("list")} style={{ padding: "0.625rem 1.5rem", background: view === "list" ? t.gold : "transparent", color: view === "list" ? "#0B0B0B" : t.text2, border: `1px solid ${view === "list" ? t.gold : t.border}`, cursor: "pointer", fontSize: "0.875rem", borderRadius: "8px", fontWeight: 600 }}>
          Mis disputas
        </button>
        <button onClick={() => setView("new")} style={{ padding: "0.625rem 1.5rem", background: view === "new" ? t.gold : "transparent", color: view === "new" ? "#0B0B0B" : t.text2, border: `1px solid ${view === "new" ? t.gold : t.border}`, cursor: "pointer", fontSize: "0.875rem", borderRadius: "8px", fontWeight: 600 }}>
          + Nueva disputa
        </button>
      </div>

      {view === "list" && (
        <div>
          {loadingDisputes ? (
            <p style={{ color: t.text2, textAlign: "center", padding: "2rem" }}>Cargando...</p>
          ) : disputes.length === 0 ? (
            <div style={{ textAlign: "center", padding: "3rem", background: t.card, border: `1px solid ${t.border}`, borderRadius: "12px" }}>
              <p style={{ color: t.text3, fontSize: "0.875rem", marginBottom: "1rem" }}>No tienes disputas activas.</p>
              <button onClick={() => setView("new")} style={{ padding: "0.75rem 1.5rem", background: t.gold, color: "#0B0B0B", border: "none", cursor: "pointer", fontSize: "0.875rem", borderRadius: "8px", fontWeight: 700 }}>
                Abrir una disputa
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {disputes.map((dispute: any) => (
                <div key={dispute.id} style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: "12px", padding: "1.25rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
                        <span style={{ fontSize: "0.875rem", fontWeight: 600, color: t.text }}>{reasonLabels[dispute.reason] ?? dispute.reason}</span>
                        <span style={{ fontSize: "0.7rem", padding: "0.2rem 0.6rem", borderRadius: "999px", background: dispute.status === "open" ? "rgba(220,38,38,0.15)" : dispute.status === "in_review" ? "rgba(245,127,23,0.15)" : "rgba(76,175,80,0.15)", color: dispute.status === "open" ? "#f87171" : dispute.status === "in_review" ? "#f57f17" : "#4CAF7D" }}>
                          {statusLabels[dispute.status]}
                        </span>
                      </div>
                      <p style={{ fontSize: "0.8rem", color: t.text2, marginBottom: "0.25rem" }}>{dispute.description}</p>
                      <p style={{ fontSize: "0.75rem", color: t.text3 }}>{new Date(dispute.created_at).toLocaleDateString("es-CO")}</p>
                    </div>
                  </div>
                  {dispute.admin_notes ? (
                    <div style={{ padding: "0.875rem", background: t.goldBg, border: `1px solid ${t.goldBorder}`, borderRadius: "8px" }}>
                      <p style={{ fontSize: "0.7rem", color: t.gold, fontWeight: 700, textTransform: "uppercase", marginBottom: "0.375rem" }}>Respuesta del equipo DMS Market</p>
                      <p style={{ fontSize: "0.875rem", color: t.text }}>{dispute.admin_notes}</p>
                    </div>
                  ) : (
                    <div style={{ padding: "0.75rem", background: t.border, border: `1px solid ${t.border}`, borderRadius: "8px" }}>
                      <p style={{ fontSize: "0.8rem", color: t.text3 }}>Tu caso esta siendo revisado. Te contactaremos pronto.</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {view === "new" && (
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem", maxWidth: "600px" }}>
          {error && (
            <div style={{ padding: "0.875rem", background: "rgba(220,38,38,0.1)", border: "1px solid rgba(220,38,38,0.3)", color: "#f87171", fontSize: "0.875rem", borderRadius: "8px" }}>
              {error}
            </div>
          )}
          <div>
            <label style={{ display: "block", fontSize: "0.65rem", color: t.text2, textTransform: "uppercase", letterSpacing: "2px", marginBottom: "0.75rem" }}>Tipo de problema *</label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
              {reasons.map((r) => (
                <label key={r.value} style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.875rem 1rem", border: `1px solid ${t.border}`, borderRadius: "8px", cursor: "pointer", background: t.card }}>
                  <input type="radio" name="reason" value={r.value} required style={{ accentColor: t.gold }} />
                  <span style={{ fontSize: "0.875rem", color: t.text }}>{r.label}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.65rem", color: t.text2, textTransform: "uppercase", letterSpacing: "2px", marginBottom: "0.5rem" }}>Numero de orden (opcional)</label>
            <input name="order_id" type="text" placeholder="Ej: abc12345..." style={{ width: "100%", padding: "0.75rem 1rem", border: `1px solid ${t.border}`, borderRadius: "8px", fontSize: "0.875rem", color: t.text, outline: "none", background: t.input, boxSizing: "border-box" }} onFocus={e => e.target.style.borderColor = t.gold} onBlur={e => e.target.style.borderColor = t.border} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.65rem", color: t.text2, textTransform: "uppercase", letterSpacing: "2px", marginBottom: "0.5rem" }}>Descripcion *</label>
            <textarea name="description" required rows={4} placeholder="Describe detalladamente lo que ocurrio..." style={{ width: "100%", padding: "0.75rem 1rem", border: `1px solid ${t.border}`, borderRadius: "8px", fontSize: "0.875rem", color: t.text, outline: "none", background: t.input, resize: "vertical", boxSizing: "border-box" }} onFocus={e => e.target.style.borderColor = t.gold} onBlur={e => e.target.style.borderColor = t.border} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.65rem", color: t.text2, textTransform: "uppercase", letterSpacing: "2px", marginBottom: "0.5rem" }}>Celular *</label>
              <input name="phone" type="tel" required placeholder="3001234567" style={{ width: "100%", padding: "0.75rem 1rem", border: `1px solid ${t.border}`, borderRadius: "8px", fontSize: "0.875rem", color: t.text, outline: "none", background: t.input, boxSizing: "border-box" }} onFocus={e => e.target.style.borderColor = t.gold} onBlur={e => e.target.style.borderColor = t.border} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.65rem", color: t.text2, textTransform: "uppercase", letterSpacing: "2px", marginBottom: "0.5rem" }}>Correo *</label>
              <input name="email" type="email" required placeholder="tu@correo.com" style={{ width: "100%", padding: "0.75rem 1rem", border: `1px solid ${t.border}`, borderRadius: "8px", fontSize: "0.875rem", color: t.text, outline: "none", background: t.input, boxSizing: "border-box" }} onFocus={e => e.target.style.borderColor = t.gold} onBlur={e => e.target.style.borderColor = t.border} />
            </div>
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.65rem", color: t.text2, textTransform: "uppercase", letterSpacing: "2px", marginBottom: "0.5rem" }}>Evidencia</label>
            <div style={{ border: `2px dashed ${t.borderDash}`, padding: "1.5rem", textAlign: "center", cursor: "pointer", background: t.card, borderRadius: "8px" }} onClick={() => document.getElementById("evidence-input")?.click()}>
              <input id="evidence-input" type="file" accept="image/*,video/*" multiple style={{ display: "none" }} onChange={handleFiles} />
              <p style={{ fontSize: "0.875rem", color: t.text2 }}>Clic para subir fotos o videos</p>
              <p style={{ fontSize: "0.75rem", color: t.gold, marginTop: "0.25rem" }}>{files.length} archivo(s)</p>
            </div>
            {previews.length > 0 && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.5rem", marginTop: "0.75rem" }}>
                {previews.map((p, i) => <img key={i} src={p} alt="" style={{ width: "100%", aspectRatio: "1", objectFit: "cover", borderRadius: "6px" }} />)}
              </div>
            )}
          </div>
          <div style={{ display: "flex", gap: "1rem" }}>
            <button type="submit" disabled={loading} style={{ flex: 1, padding: "1rem", background: loading ? t.border : t.gold, color: loading ? t.text2 : "#0B0B0B", border: "none", cursor: loading ? "not-allowed" : "pointer", fontSize: "0.875rem", fontWeight: 700, borderRadius: "8px" }}>
              {loading ? "Enviando..." : "Enviar disputa"}
            </button>
            <button type="button" onClick={() => setView("list")} style={{ flex: 1, padding: "1rem", background: "transparent", color: t.text2, border: `1px solid ${t.border}`, cursor: "pointer", fontSize: "0.875rem", borderRadius: "8px" }}>
              Cancelar
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
