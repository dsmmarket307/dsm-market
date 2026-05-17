"use client"

import { useState, useEffect } from "react"

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

const logoUrl = "https://awbepztacmvurjylfoas.supabase.co/storage/v1/object/public/assets/ChatGPT_Image_3_may_2026__21_13_12-removebg-preview.png"

export default function BuyerDisputesPage() {
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

  const sidebarLinks = [
    { label: "Inicio", href: "/dashboard/buyer", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> },
    { label: "Mis pedidos", href: "/dashboard/buyer", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/></svg> },
    { label: "Ver productos", href: "/dashboard/buyer/products", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg> },
    { label: "Disputas", href: "/dashboard/buyer/disputes", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>, active: true },
  ]

  if (success) {
    return (
      <div style={{ minHeight: "100vh", background: "#0f0f0f", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Inter', sans-serif" }}>
        <div style={{ textAlign: "center", maxWidth: "400px", padding: "2rem" }}>
          <div style={{ width: "64px", height: "64px", background: "rgba(76,175,80,0.15)", border: "1px solid #4CAF7D", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem" }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#4CAF7D" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          </div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#fff", marginBottom: "0.75rem" }}>Disputa enviada</h2>
          <p style={{ fontSize: "0.875rem", color: "#888", marginBottom: "2rem" }}>Hemos recibido tu caso. Un asesor te contactara pronto.</p>
          <button onClick={() => { setSuccess(false); setView("list") }} style={{ padding: "0.875rem 2rem", background: "#D4AF37", color: "#0B0B0B", border: "none", cursor: "pointer", fontSize: "0.875rem", fontWeight: 700, borderRadius: "8px" }}>
            Ver mis disputas
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0f0f0f", display: "flex", fontFamily: "'Inter', sans-serif" }}>

      <div style={{ width: "240px", background: "#0B0B0B", borderRight: "1px solid rgba(212,175,55,0.1)", display: "flex", flexDirection: "column", padding: "1.5rem 0", position: "fixed", top: 0, left: 0, height: "100vh" }}>
        <div style={{ padding: "0 1.5rem", marginBottom: "2rem" }}>
          <img src={logoUrl} alt="DMS Market" style={{ width: "120px", objectFit: "contain" }} />
        </div>
        <nav style={{ flex: 1, padding: "0 1rem", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          {sidebarLinks.map((item, i) => (
            <a key={i} href={item.href} style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.75rem 1rem", borderRadius: "8px", textDecoration: "none", background: item.active ? "rgba(212,175,55,0.12)" : "transparent", color: item.active ? "#D4AF37" : "#888" }}>
              {item.icon}
              <span style={{ fontSize: "0.875rem", fontWeight: item.active ? 600 : 400 }}>{item.label}</span>
            </a>
          ))}
        </nav>
        <div style={{ padding: "1rem" }}>
          <a href="/dashboard/buyer" style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.75rem 1rem", borderRadius: "8px", background: "transparent", border: "1px solid rgba(255,255,255,0.08)", color: "#888", fontSize: "0.875rem", textDecoration: "none" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5"/><polyline points="12 19 5 12 12 5"/></svg>
            Volver al panel
          </a>
        </div>
      </div>

      <div style={{ marginLeft: "240px", flex: 1, padding: "2rem" }}>
        <div style={{ marginBottom: "2rem" }}>
          <p style={{ fontSize: "0.65rem", letterSpacing: "3px", textTransform: "uppercase", color: "#D4AF37", marginBottom: "0.25rem" }}>Centro de ayuda</p>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 700, color: "#fff", margin: 0 }}>Disputas</h1>
        </div>

        <div style={{ display: "flex", gap: "0.75rem", marginBottom: "2rem" }}>
          <button onClick={() => setView("list")} style={{ padding: "0.625rem 1.5rem", background: view === "list" ? "#D4AF37" : "transparent", color: view === "list" ? "#0B0B0B" : "#888", border: "1px solid " + (view === "list" ? "#D4AF37" : "rgba(255,255,255,0.08)"), cursor: "pointer", fontSize: "0.875rem", borderRadius: "8px", fontWeight: 600 }}>
            Mis disputas
          </button>
          <button onClick={() => setView("new")} style={{ padding: "0.625rem 1.5rem", background: view === "new" ? "#D4AF37" : "transparent", color: view === "new" ? "#0B0B0B" : "#888", border: "1px solid " + (view === "new" ? "#D4AF37" : "rgba(255,255,255,0.08)"), cursor: "pointer", fontSize: "0.875rem", borderRadius: "8px", fontWeight: 600 }}>
            + Nueva disputa
          </button>
        </div>

        {view === "list" && (
          <div>
            {loadingDisputes ? (
              <p style={{ color: "#888", textAlign: "center", padding: "2rem" }}>Cargando...</p>
            ) : disputes.length === 0 ? (
              <div style={{ textAlign: "center", padding: "3rem", background: "#151515", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px" }}>
                <p style={{ color: "#555", fontSize: "0.875rem", marginBottom: "1rem" }}>No tienes disputas activas.</p>
                <button onClick={() => setView("new")} style={{ padding: "0.75rem 1.5rem", background: "#D4AF37", color: "#0B0B0B", border: "none", cursor: "pointer", fontSize: "0.875rem", borderRadius: "8px", fontWeight: 700 }}>
                  Abrir una disputa
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {disputes.map((dispute: any) => (
                  <div key={dispute.id} style={{ background: "#151515", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", padding: "1.25rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
                          <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "#fff" }}>{reasonLabels[dispute.reason] ?? dispute.reason}</span>
                          <span style={{ fontSize: "0.7rem", padding: "0.2rem 0.6rem", borderRadius: "999px", background: dispute.status === "open" ? "rgba(220,38,38,0.15)" : dispute.status === "in_review" ? "rgba(245,127,23,0.15)" : "rgba(76,175,80,0.15)", color: dispute.status === "open" ? "#f87171" : dispute.status === "in_review" ? "#f57f17" : "#4CAF7D" }}>
                            {statusLabels[dispute.status]}
                          </span>
                        </div>
                        <p style={{ fontSize: "0.8rem", color: "#888", marginBottom: "0.25rem" }}>{dispute.description}</p>
                        <p style={{ fontSize: "0.75rem", color: "#555" }}>{new Date(dispute.created_at).toLocaleDateString("es-CO")}</p>
                      </div>
                    </div>
                    {dispute.admin_notes ? (
                      <div style={{ padding: "0.875rem", background: "rgba(212,175,55,0.08)", border: "1px solid rgba(212,175,55,0.2)", borderRadius: "8px" }}>
                        <p style={{ fontSize: "0.7rem", color: "#D4AF37", fontWeight: 700, textTransform: "uppercase", marginBottom: "0.375rem" }}>Respuesta del equipo DMS Market</p>
                        <p style={{ fontSize: "0.875rem", color: "#fff" }}>{dispute.admin_notes}</p>
                      </div>
                    ) : (
                      <div style={{ padding: "0.75rem", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "8px" }}>
                        <p style={{ fontSize: "0.8rem", color: "#555" }}>Tu caso esta siendo revisado. Te contactaremos pronto.</p>
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
              <label style={{ display: "block", fontSize: "0.65rem", color: "#888", textTransform: "uppercase", letterSpacing: "2px", marginBottom: "0.75rem" }}>Tipo de problema *</label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                {reasons.map((r) => (
                  <label key={r.value} style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.875rem 1rem", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", cursor: "pointer", background: "#151515" }}>
                    <input type="radio" name="reason" value={r.value} required style={{ accentColor: "#D4AF37" }} />
                    <span style={{ fontSize: "0.875rem", color: "#ccc" }}>{r.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.65rem", color: "#888", textTransform: "uppercase", letterSpacing: "2px", marginBottom: "0.5rem" }}>Numero de orden (opcional)</label>
              <input name="order_id" type="text" placeholder="Ej: abc12345..."
                style={{ width: "100%", padding: "0.75rem 1rem", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", fontSize: "0.875rem", color: "#fff", outline: "none", background: "#151515", boxSizing: "border-box" }}
                onFocus={e => e.target.style.borderColor = "#D4AF37"}
                onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.08)"}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.65rem", color: "#888", textTransform: "uppercase", letterSpacing: "2px", marginBottom: "0.5rem" }}>Descripcion *</label>
              <textarea name="description" required rows={4} placeholder="Describe detalladamente lo que ocurrio..."
                style={{ width: "100%", padding: "0.75rem 1rem", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", fontSize: "0.875rem", color: "#fff", outline: "none", background: "#151515", resize: "vertical", boxSizing: "border-box" }}
                onFocus={e => e.target.style.borderColor = "#D4AF37"}
                onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.08)"}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.65rem", color: "#888", textTransform: "uppercase", letterSpacing: "2px", marginBottom: "0.5rem" }}>Celular *</label>
                <input name="phone" type="tel" required placeholder="3001234567"
                  style={{ width: "100%", padding: "0.75rem 1rem", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", fontSize: "0.875rem", color: "#fff", outline: "none", background: "#151515", boxSizing: "border-box" }}
                  onFocus={e => e.target.style.borderColor = "#D4AF37"}
                  onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.08)"}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.65rem", color: "#888", textTransform: "uppercase", letterSpacing: "2px", marginBottom: "0.5rem" }}>Correo *</label>
                <input name="email" type="email" required placeholder="tu@correo.com"
                  style={{ width: "100%", padding: "0.75rem 1rem", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", fontSize: "0.875rem", color: "#fff", outline: "none", background: "#151515", boxSizing: "border-box" }}
                  onFocus={e => e.target.style.borderColor = "#D4AF37"}
                  onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.08)"}
                />
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.65rem", color: "#888", textTransform: "uppercase", letterSpacing: "2px", marginBottom: "0.5rem" }}>Evidencia</label>
              <div style={{ border: "2px dashed rgba(212,175,55,0.3)", padding: "1.5rem", textAlign: "center", cursor: "pointer", background: "#151515", borderRadius: "8px" }}
                onClick={() => document.getElementById("evidence-input")?.click()}>
                <input id="evidence-input" type="file" accept="image/*,video/*" multiple style={{ display: "none" }} onChange={handleFiles} />
                <p style={{ fontSize: "0.875rem", color: "#888" }}>Clic para subir fotos o videos</p>
                <p style={{ fontSize: "0.75rem", color: "#D4AF37", marginTop: "0.25rem" }}>{files.length} archivo(s)</p>
              </div>
              {previews.length > 0 && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.5rem", marginTop: "0.75rem" }}>
                  {previews.map((p, i) => <img key={i} src={p} alt="" style={{ width: "100%", aspectRatio: "1", objectFit: "cover", borderRadius: "6px" }} />)}
                </div>
              )}
            </div>

            <div style={{ display: "flex", gap: "1rem" }}>
              <button type="submit" disabled={loading} style={{ flex: 1, padding: "1rem", background: loading ? "#333" : "#D4AF37", color: loading ? "#999" : "#0B0B0B", border: "none", cursor: loading ? "not-allowed" : "pointer", fontSize: "0.875rem", fontWeight: 700, borderRadius: "8px", boxShadow: "0 4px 20px rgba(212,175,55,0.3)" }}>
                {loading ? "Enviando..." : "Enviar disputa"}
              </button>
              <button type="button" onClick={() => setView("list")} style={{ flex: 1, padding: "1rem", background: "transparent", color: "#888", border: "1px solid rgba(255,255,255,0.08)", cursor: "pointer", fontSize: "0.875rem", borderRadius: "8px" }}>
                Cancelar
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
