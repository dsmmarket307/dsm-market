"use client"

import { useState } from "react"
import { createDispute } from "@/lib/actions/disputes"
import { useRouter } from "next/navigation"

const reasons = [
  { value: "shipping_problem", label: "Problema con mi envio" },
  { value: "damaged_product", label: "Producto danado" },
  { value: "malfunction", label: "Mal funcionamiento" },
  { value: "talk_to_advisor", label: "Hablar con un asesor" },
  { value: "other", label: "Otro" },
]

export default function BuyerDisputesPage() {
  const router = useRouter()
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [previews, setPreviews] = useState([])
  const [files, setFiles] = useState([])

  function handleFiles(e) {
    const selected = Array.from(e.target.files ?? [])
    setFiles(selected)
    setPreviews(selected.map((f) => URL.createObjectURL(f)))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError("")
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    files.forEach((f) => formData.append("evidence", f))
    const result = await createDispute(formData)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    } else {
      setSuccess(true)
    }
  }

  if (success) {
    return (
      <div style={{ padding: "2rem", maxWidth: "700px", margin: "0 auto", background: "#fff", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
        <div style={{ width: "60px", height: "60px", background: "#e8f5e9", border: "1px solid #4CAF7D", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1.5rem" }}>
          <span style={{ fontSize: "1.5rem", color: "#4CAF7D" }}>✓</span>
        </div>
        <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#111", marginBottom: "0.75rem" }}>Disputa enviada</h2>
        <p style={{ fontSize: "0.875rem", color: "#888", marginBottom: "2rem" }}>Hemos recibido tu caso. Un asesor de DMS Market revisara tu situacion y te contactara pronto.</p>
        <button onClick={() => router.push("/dashboard/buyer")} style={{ padding: "0.875rem 2rem", background: "#C9A84C", color: "#fff", border: "none", cursor: "pointer", fontSize: "0.875rem", textTransform: "uppercase" }}>
          Volver al inicio
        </button>
      </div>
    )
  }

  return (
    <div style={{ padding: "2rem", maxWidth: "700px", margin: "0 auto", background: "#fff", minHeight: "100vh" }}>
      <div style={{ marginBottom: "2rem", paddingBottom: "1rem", borderBottom: "2px solid #C9A84C" }}>
        <p style={{ fontSize: "0.7rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#C9A84C", marginBottom: "0.25rem" }}>Centro de ayuda</p>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 700, color: "#111" }}>Abrir una disputa</h1>
        <p style={{ fontSize: "0.875rem", color: "#888", marginTop: "0.5rem" }}>Describe tu problema y nuestro equipo te ayudara a resolverlo.</p>
      </div>

      {error && (
        <div style={{ marginBottom: "1rem", padding: "0.875rem", background: "#fdecea", border: "1px solid #E05252", color: "#c62828", fontSize: "0.875rem" }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

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
          <label style={{ display: "block", fontSize: "0.75rem", color: "#888", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.5rem" }}>Descripcion del problema *</label>
          <textarea name="description" required rows={5} placeholder="Describe detalladamente lo que ocurrio..." style={{ width: "100%", padding: "0.75rem 1rem", border: "1px solid #ddd", fontSize: "0.875rem", outline: "none", color: "#111", resize: "vertical" }} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.75rem", color: "#888", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.5rem" }}>Celular de contacto *</label>
            <input name="phone" type="tel" required placeholder="Ej: 3001234567" style={{ width: "100%", padding: "0.75rem 1rem", border: "1px solid #ddd", fontSize: "0.875rem", outline: "none", color: "#111" }} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.75rem", color: "#888", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.5rem" }}>Correo electronico *</label>
            <input name="email" type="email" required placeholder="tu@correo.com" style={{ width: "100%", padding: "0.75rem 1rem", border: "1px solid #ddd", fontSize: "0.875rem", outline: "none", color: "#111" }} />
          </div>
        </div>

        <div>
          <label style={{ display: "block", fontSize: "0.75rem", color: "#888", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.5rem" }}>Evidencia — fotos o videos</label>
          <div style={{ border: "2px dashed #ddd", padding: "1.5rem", textAlign: "center", cursor: "pointer" }} onClick={() => document.getElementById("evidence-input").click()}>
            <input id="evidence-input" type="file" accept="image/*,video/*" multiple style={{ display: "none" }} onChange={handleFiles} />
            <p style={{ fontSize: "0.875rem", color: "#888" }}>Clic para subir fotos o videos como evidencia</p>
            <p style={{ fontSize: "0.75rem", color: "#C9A84C", marginTop: "0.25rem" }}>{files.length} archivo(s) seleccionado(s)</p>
          </div>
          {previews.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.5rem", marginTop: "0.75rem" }}>
              {previews.map((p, i) => (
                <img key={i} src={p} style={{ width: "100%", aspectRatio: "1", objectFit: "cover", border: "1px solid #eee" }} />
              ))}
            </div>
          )}
        </div>

        <div style={{ padding: "1rem", background: "#FBF5E6", border: "1px solid #C9A84C" }}>
          <p style={{ fontSize: "0.8rem", color: "#888", lineHeight: 1.6 }}>
            Al enviar esta disputa, un asesor de DMS Market revisara tu caso en un plazo de 24 a 48 horas habiles y te contactara al correo y celular proporcionados.
          </p>
        </div>

        <div style={{ display: "flex", gap: "1rem" }}>
          <button type="submit" disabled={loading} style={{ flex: 1, padding: "1rem", background: "#C9A84C", color: "#fff", border: "none", cursor: loading ? "not-allowed" : "pointer", fontSize: "0.875rem", textTransform: "uppercase", fontWeight: 600, opacity: loading ? 0.7 : 1 }}>
            {loading ? "Enviando..." : "Enviar disputa"}
          </button>
          <button type="button" onClick={() => router.back()} style={{ flex: 1, padding: "1rem", background: "#fff", color: "#888", border: "1px solid #ddd", cursor: "pointer", fontSize: "0.875rem" }}>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  )
}
