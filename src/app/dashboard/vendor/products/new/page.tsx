"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createProduct } from "@/lib/actions/products"

const categories = [
  "Ropa deportiva","Bisuteria","Juguetes","Mascotas","Moda","Tecnologia",
  "Cocina","Belleza","Salud","Hogar","Natural home","Deportes","Bebe",
  "Aseo","Bienestar","Herramientas","Pinateria","Navidad","Halloween",
  "Libros","Papeleria","Vehiculos","Otros"
]

export default function NewProductPage() {
  const router = useRouter()
  const [error, setError]         = useState("")
  const [loading, setLoading]     = useState(false)
  const [images, setImages]       = useState<File[]>([])
  const [previews, setPreviews]   = useState<string[]>([])
  const [envioGratis, setEnvioGratis] = useState(false)

  function handleImages(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (files.length + images.length > 10) { setError("Maximo 10 fotos"); return }
    setImages(prev => [...prev, ...files])
    setPreviews(prev => [...prev, ...files.map(f => URL.createObjectURL(f))])
  }

  function removeImage(i: number) {
    setImages(prev => prev.filter((_,j) => j !== i))
    setPreviews(prev => prev.filter((_,j) => j !== i))
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setError(""); setLoading(true)
    const formData = new FormData(e.currentTarget)
    formData.set("envio_gratis", String(envioGratis))
    images.forEach(img => formData.append("images", img))
    const result = await createProduct(formData)
    if (result?.error) { setError(result.error); setLoading(false) }
    else { router.push("/dashboard/vendor") }
  }

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');
    .np-root{background:#F5F5F5;min-height:100vh;font-family:'Poppins',sans-serif;padding:2rem;}
    .np-inner{max-width:800px;margin:0 auto;}
    .np-header{background:#0B0B0B;border-radius:16px;padding:1.75rem 2rem;margin-bottom:1.5rem;border:1px solid rgba(212,175,55,.12);}
    .np-card{background:#fff;border-radius:16px;padding:1.75rem;border:1px solid rgba(0,0,0,.06);box-shadow:0 2px 8px rgba(0,0,0,.04);margin-bottom:1rem;}
    .np-label{display:block;font-size:11px;color:#888;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:8px;font-family:'Poppins',sans-serif;}
    .np-input{width:100%;padding:11px 14px;border:1px solid rgba(0,0,0,.12);border-radius:10px;font-size:14px;outline:none;font-family:'Poppins',sans-serif;color:#111;box-sizing:border-box;transition:border-color .2s;}
    .np-input:focus{border-color:#D4AF37;}
    .np-select{width:100%;padding:11px 14px;border:1px solid rgba(0,0,0,.12);border-radius:10px;font-size:14px;outline:none;font-family:'Poppins',sans-serif;color:#111;background:#fff;box-sizing:border-box;}
    .np-textarea{width:100%;padding:11px 14px;border:1px solid rgba(0,0,0,.12);border-radius:10px;font-size:14px;outline:none;font-family:'Poppins',sans-serif;color:#111;resize:vertical;box-sizing:border-box;}
    .np-textarea:focus{border-color:#D4AF37;}
    .np-radio{display:flex;align-items:center;gap:8px;cursor:pointer;padding:12px 20px;border:1px solid rgba(0,0,0,.12);border-radius:10px;flex:1;justify-content:center;transition:all .2s;}
    .np-radio:hover{border-color:#D4AF37;}
    .np-btn-gold{flex:1;padding:14px;background:#D4AF37;color:#0B0B0B;border:none;cursor:pointer;font-size:14px;text-transform:uppercase;font-weight:700;border-radius:12px;font-family:'Poppins',sans-serif;transition:background .2s;}
    .np-btn-gold:hover{background:#e8c84a;}
    .np-btn-gold:disabled{opacity:.6;cursor:not-allowed;}
    .np-btn-cancel{flex:1;padding:14px;background:#fff;color:#888;border:1px solid rgba(0,0,0,.1);cursor:pointer;font-size:14px;border-radius:12px;font-family:'Poppins',sans-serif;transition:all .2s;}
    .np-btn-cancel:hover{border-color:#D4AF37;color:#D4AF37;}
    .np-drop{border:2px dashed rgba(0,0,0,.12);border-radius:12px;padding:2.5rem;text-align:center;cursor:pointer;transition:border-color .2s;}
    .np-drop:hover{border-color:#D4AF37;}
  `

  return (
    <>
      <style>{css}</style>
      <div className="np-root">
        <div className="np-inner">

          <div className="np-header">
            <p style={{ fontSize: 11, letterSpacing: 3, textTransform: "uppercase", color: "#D4AF37", marginBottom: 4, fontFamily: "'Poppins',sans-serif" }}>Vendedor</p>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#fff", margin: 0, fontFamily: "'Poppins',sans-serif" }}>Nuevo producto</h1>
          </div>

          {error && <div style={{ marginBottom: 16, padding: "14px 18px", background: "rgba(220,38,38,.08)", border: "1px solid rgba(220,38,38,.2)", borderRadius: 12, color: "#ef4444", fontSize: 14, fontFamily: "'Poppins',sans-serif" }}>{error}</div>}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>

            <div className="np-card">
              <div style={{ marginBottom: 16 }}>
                <label className="np-label">Nombre del producto *</label>
                <input name="name" type="text" required placeholder="Nombre del producto" className="np-input" />
              </div>
              <div>
                <label className="np-label">Descripcion</label>
                <textarea name="description" rows={4} placeholder="Describe tu producto..." className="np-textarea" />
              </div>
            </div>

            <div className="np-card">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                <div>
                  <label className="np-label">Precio de venta (COP) *</label>
                  <input name="price" type="number" required min="0" step="100" placeholder="0" className="np-input" />
                </div>
                <div>
                  <label className="np-label">Precio original (tachado, opcional)</label>
                  <input name="original_price" type="number" min="0" step="100" placeholder="Precio antes del descuento" className="np-input" />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label className="np-label">Categoria *</label>
                  <select name="category" required className="np-select">
                    <option value="">Seleccionar...</option>
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
                <div>
                  <label className="np-label">Stock (cantidad disponible)</label>
                  <input name="stock" type="number" min="1" step="1" placeholder="Ej: 10" className="np-input" />
                </div>
              </div>
            </div>

            <div className="np-card">
              <label className="np-label">Estado del producto *</label>
              <div style={{ display: "flex", gap: 12 }}>
                <label className="np-radio">
                  <input type="radio" name="condition" value="new" defaultChecked style={{ accentColor: "#D4AF37" }} />
                  <span style={{ fontSize: 14, color: "#111", fontWeight: 500, fontFamily: "'Poppins',sans-serif" }}>Nuevo</span>
                </label>
                <label className="np-radio">
                  <input type="radio" name="condition" value="used" style={{ accentColor: "#D4AF37" }} />
                  <span style={{ fontSize: 14, color: "#111", fontWeight: 500, fontFamily: "'Poppins',sans-serif" }}>Usado</span>
                </label>
              </div>
            </div>

            <div className="np-card" style={{ border: `1px solid ${envioGratis ? "rgba(22,163,74,.3)" : "rgba(0,0,0,.06)"}`, background: envioGratis ? "rgba(22,163,74,.03)" : "#fff", cursor: "pointer", transition: "all .2s" }} onClick={() => setEnvioGratis(!envioGratis)}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={envioGratis ? "#16a34a" : "#888"} strokeWidth="1.75">
                    <path d="M1 3h15v13H1z"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
                  </svg>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 700, color: envioGratis ? "#16a34a" : "#111", fontFamily: "'Poppins',sans-serif" }}>Envio gratis</p>
                    <p style={{ fontSize: 12, color: "#888", fontFamily: "'Poppins',sans-serif" }}>El cliente no paga envio — tu asumes el costo con Interrapidisimo</p>
                  </div>
                </div>
                <div style={{ width: 44, height: 24, borderRadius: 999, background: envioGratis ? "#16a34a" : "#ddd", position: "relative", transition: "all .2s", flexShrink: 0 }}>
                  <div style={{ position: "absolute", top: 2, left: envioGratis ? 22 : 2, width: 20, height: 20, borderRadius: "50%", background: "#fff", transition: "all .2s", boxShadow: "0 1px 4px rgba(0,0,0,.2)" }} />
                </div>
              </div>
            </div>

            <div className="np-card">
              <label className="np-label">Fotos del producto (maximo 10)</label>
              <div className="np-drop" onClick={() => document.getElementById("img-input")?.click()}>
                <input id="img-input" type="file" accept="image/*" multiple style={{ display: "none" }} onChange={handleImages} />
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.25" style={{ marginBottom: 10 }}>
                  <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                </svg>
                <p style={{ fontSize: 14, color: "#888", fontFamily: "'Poppins',sans-serif" }}>Clic para subir fotos</p>
                <p style={{ fontSize: 12, color: "#D4AF37", marginTop: 4, fontFamily: "'Poppins',sans-serif" }}>{images.length}/10 fotos</p>
              </div>
              {previews.length > 0 && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 8, marginTop: 12 }}>
                  {previews.map((preview, i) => (
                    <div key={i} style={{ position: "relative" }}>
                      <img src={preview} style={{ width: "100%", aspectRatio: "1", objectFit: "cover", borderRadius: 10, border: "1px solid rgba(0,0,0,.08)" }} alt="" />
                      <button type="button" onClick={() => removeImage(i)} style={{ position: "absolute", top: 4, right: 4, width: 22, height: 22, background: "#ef4444", color: "#fff", border: "none", cursor: "pointer", fontSize: 12, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>x</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ display: "flex", gap: 12 }}>
              <button type="submit" disabled={loading} className="np-btn-gold">{loading ? "Publicando..." : "Publicar producto"}</button>
              <button type="button" onClick={() => router.back()} className="np-btn-cancel">Cancelar</button>
            </div>

          </form>
        </div>
      </div>
    </>
  )
}