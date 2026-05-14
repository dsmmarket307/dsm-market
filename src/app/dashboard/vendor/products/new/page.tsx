"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createProduct } from "@/lib/actions/products"

const categories = [
  "Ropa deportiva","Bisuteria","Juguetes","Mascotas","Moda",
  "Tecnologia","Cocina","Belleza","Salud","Hogar",
  "Natural home","Deportes","Bebe","Aseo","Bienestar",
  "Herramientas","Pinateria","Navidad","Halloween",
  "Libros","Papeleria","Vehiculos","Otros"
]

export default function NewProductPage() {
  const router = useRouter()
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [images, setImages] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [envioGratis, setEnvioGratis] = useState(false)

  function handleImages(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (files.length + images.length > 10) { setError("Maximo 10 fotos"); return }
    setImages((prev) => [...prev, ...files])
    setPreviews((prev) => [...prev, ...files.map((f) => URL.createObjectURL(f))])
  }

  function removeImage(i: number) {
    setImages((prev) => prev.filter((_, j) => j !== i))
    setPreviews((prev) => prev.filter((_, j) => j !== i))
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError("")
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    formData.set('envio_gratis', String(envioGratis))
    images.forEach((img) => formData.append("images", img))
    const result = await createProduct(formData)
    if (result?.error) { setError(result.error); setLoading(false) }
    else { router.push("/dashboard/vendor") }
  }

  return (
    <div style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto", background: "#fff", minHeight: "100vh" }}>
      <div style={{ marginBottom: "2rem", paddingBottom: "1rem", borderBottom: "2px solid #C9A84C" }}>
        <p style={{ fontSize: "0.7rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#C9A84C", marginBottom: "0.25rem" }}>Vendedor</p>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 700, color: "#111" }}>Nuevo producto</h1>
      </div>

      {error && <div style={{ marginBottom: "1rem", padding: "0.875rem", background: "#fdecea", border: "1px solid #E05252", color: "#c62828", fontSize: "0.875rem" }}>{error}</div>}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

        <div>
          <label style={{ display: "block", fontSize: "0.75rem", color: "#888", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.5rem" }}>Nombre del producto *</label>
          <input name="name" type="text" required placeholder="Nombre del producto" style={{ width: "100%", padding: "0.75rem 1rem", border: "1px solid #ddd", fontSize: "0.875rem", outline: "none", color: "#111" }} />
        </div>

        <div>
          <label style={{ display: "block", fontSize: "0.75rem", color: "#888", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.5rem" }}>Descripcion</label>
          <textarea name="description" rows={4} placeholder="Describe tu producto..." style={{ width: "100%", padding: "0.75rem 1rem", border: "1px solid #ddd", fontSize: "0.875rem", outline: "none", color: "#111", resize: "vertical" }} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.75rem", color: "#888", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.5rem" }}>Precio de venta (COP) *</label>
            <input name="price" type="number" required min="0" step="100" placeholder="0" style={{ width: "100%", padding: "0.75rem 1rem", border: "1px solid #ddd", fontSize: "0.875rem", outline: "none", color: "#111" }} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.75rem", color: "#888", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.5rem" }}>Precio original (tachado, opcional)</label>
            <input name="original_price" type="number" min="0" step="100" placeholder="Precio antes del descuento" style={{ width: "100%", padding: "0.75rem 1rem", border: "1px solid #ddd", fontSize: "0.875rem", outline: "none", color: "#111" }} />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.75rem", color: "#888", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.5rem" }}>Categoria *</label>
            <select name="category" required style={{ width: "100%", padding: "0.75rem 1rem", border: "1px solid #ddd", fontSize: "0.875rem", outline: "none", color: "#111", background: "#fff" }}>
              <option value="">Seleccionar...</option>
              {categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.75rem", color: "#888", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.5rem" }}>Stock (cantidad disponible)</label>
            <input name="stock" type="number" min="1" step="1" placeholder="Ej: 10" style={{ width: "100%", padding: "0.75rem 1rem", border: "1px solid #ddd", fontSize: "0.875rem", outline: "none", color: "#111" }} />
          </div>
        </div>

        <div>
          <label style={{ display: "block", fontSize: "0.75rem", color: "#888", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.5rem" }}>Estado del producto *</label>
          <div style={{ display: "flex", gap: "1rem" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", padding: "0.75rem 1.5rem", border: "1px solid #ddd", flex: 1, justifyContent: "center" }}>
              <input type="radio" name="condition" value="new" defaultChecked style={{ accentColor: "#C9A84C" }} />
              <span style={{ fontSize: "0.875rem", color: "#111", fontWeight: 500 }}>Nuevo</span>
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", padding: "0.75rem 1.5rem", border: "1px solid #ddd", flex: 1, justifyContent: "center" }}>
              <input type="radio" name="condition" value="used" style={{ accentColor: "#C9A84C" }} />
              <span style={{ fontSize: "0.875rem", color: "#111", fontWeight: 500 }}>Usado</span>
            </label>
          </div>
        </div>

        {/* ENVIO GRATIS */}
        <div style={{ border: `2px solid ${envioGratis ? '#16a34a' : '#ddd'}`, borderRadius: '8px', padding: '1rem 1.25rem', background: envioGratis ? '#f0fdf4' : '#fff', transition: 'all 0.2s', cursor: 'pointer' }}
          onClick={() => setEnvioGratis(!envioGratis)}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={envioGratis ? '#16a34a' : '#888'} strokeWidth="2">
                <path d="M1 3h15v13H1z"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
              </svg>
              <div>
                <p style={{ fontSize: '0.875rem', fontWeight: 700, color: envioGratis ? '#16a34a' : '#111' }}>Envío gratis</p>
                <p style={{ fontSize: '0.75rem', color: '#888' }}>El cliente no paga envío — tú asumes el costo con Interrapidísimo</p>
              </div>
            </div>
            <div style={{ width: '44px', height: '24px', borderRadius: '999px', background: envioGratis ? '#16a34a' : '#ddd', position: 'relative', transition: 'all 0.2s', flexShrink: 0 }}>
              <div style={{ position: 'absolute', top: '2px', left: envioGratis ? '22px' : '2px', width: '20px', height: '20px', borderRadius: '50%', background: '#fff', transition: 'all 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }} />
            </div>
          </div>
        </div>

        <div>
          <label style={{ display: "block", fontSize: "0.75rem", color: "#888", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.5rem" }}>Fotos del producto (maximo 10)</label>
          <div style={{ border: "2px dashed #ddd", padding: "2rem", textAlign: "center", cursor: "pointer" }} onClick={() => document.getElementById("img-input")?.click()}>
            <input id="img-input" type="file" accept="image/*" multiple style={{ display: "none" }} onChange={handleImages} />
            <p style={{ fontSize: "0.875rem", color: "#888" }}>Clic para subir fotos</p>
            <p style={{ fontSize: "0.75rem", color: "#C9A84C", marginTop: "0.25rem" }}>{images.length}/10 fotos</p>
          </div>
          {previews.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "0.5rem", marginTop: "0.75rem" }}>
              {previews.map((preview, i) => (
                <div key={i} style={{ position: "relative" }}>
                  <img src={preview} style={{ width: "100%", aspectRatio: "1", objectFit: "cover", border: "1px solid #eee" }} alt="" />
                  <button type="button" onClick={() => removeImage(i)} style={{ position: "absolute", top: "4px", right: "4px", width: "20px", height: "20px", background: "#E05252", color: "#fff", border: "none", cursor: "pointer", fontSize: "0.75rem" }}>x</button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ display: "flex", gap: "1rem", paddingTop: "0.5rem" }}>
          <button type="submit" disabled={loading} style={{ flex: 1, padding: "1rem", background: "#C9A84C", color: "#fff", border: "none", cursor: loading ? "not-allowed" : "pointer", fontSize: "0.875rem", textTransform: "uppercase", fontWeight: 600, opacity: loading ? 0.7 : 1, borderRadius: "999px" }}>
            {loading ? "Publicando..." : "Publicar producto"}
          </button>
          <button type="button" onClick={() => router.back()} style={{ flex: 1, padding: "1rem", background: "#fff", color: "#888", border: "1px solid #ddd", cursor: "pointer", fontSize: "0.875rem", borderRadius: "999px" }}>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  )
}