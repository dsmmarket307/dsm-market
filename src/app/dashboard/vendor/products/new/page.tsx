"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createProduct } from "@/lib/actions/products"

const categories = [
  "Ropa deportiva","Bisuteria","Juguetes","Mascotas","Moda","Tecnologia",
  "Cocina","Belleza","Salud","Hogar","Natural home","Deportes","Bebe",
  "Aseo","Bienestar","Herramientas","Pinateria","Navidad","Halloween",
  "Libros","Papeleria","Vehiculos","Otros"
]

const STORAGE_KEY = "dms_new_product_draft"

export default function NewProductPage() {
  const router = useRouter()
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [images, setImages] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [envioGratis, setEnvioGratis] = useState(false)
  const [variantes, setVariantes] = useState<{ nombre: string; opciones: string }[]>([])
  const [description, setDescription] = useState("")
  const [generatingDesc, setGeneratingDesc] = useState(false)
  const [generatingTitle, setGeneratingTitle] = useState(false)
  const [nameVal, setNameVal] = useState("")
  const [categoryVal, setCategoryVal] = useState("")
  const [priceVal, setPriceVal] = useState("")
  const [originalPriceVal, setOriginalPriceVal] = useState("")
  const [stockVal, setStockVal] = useState("")
  const [conditionVal, setConditionVal] = useState("new")
  const [moderationWarning, setModerationWarning] = useState("")
  const [moderationBlocked, setModerationBlocked] = useState(false)
  const [skipModeration, setSkipModeration] = useState(false)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const draft = JSON.parse(saved)
        if (draft.nameVal) setNameVal(draft.nameVal)
        if (draft.description) setDescription(draft.description)
        if (draft.categoryVal) setCategoryVal(draft.categoryVal)
        if (draft.priceVal) setPriceVal(draft.priceVal)
        if (draft.originalPriceVal) setOriginalPriceVal(draft.originalPriceVal)
        if (draft.stockVal) setStockVal(draft.stockVal)
        if (draft.conditionVal) setConditionVal(draft.conditionVal)
        if (draft.envioGratis !== undefined) setEnvioGratis(draft.envioGratis)
        if (draft.variantes) setVariantes(draft.variantes)
      }
    } catch {}
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        nameVal, description, categoryVal, priceVal,
        originalPriceVal, stockVal, conditionVal, envioGratis, variantes
      }))
    } catch {}
  }, [nameVal, description, categoryVal, priceVal, originalPriceVal, stockVal, conditionVal, envioGratis, variantes])

  function clearDraft() {
    try { localStorage.removeItem(STORAGE_KEY) } catch {}
  }

  async function compressImage(file: File): Promise<File> {
    return new Promise((resolve) => {
      const img = new Image()
      const url = URL.createObjectURL(file)
      img.onload = () => {
        const canvas = document.createElement("canvas")
        const MAX = 1200
        let w = img.width, h = img.height
        if (w > MAX) { h = Math.round(h * MAX / w); w = MAX }
        if (h > MAX) { w = Math.round(w * MAX / h); h = MAX }
        canvas.width = w; canvas.height = h
        canvas.getContext("2d")!.drawImage(img, 0, 0, w, h)
        canvas.toBlob(blob => {
          if (blob) resolve(new File([blob], file.name, { type: "image/jpeg" }))
          else resolve(file)
        }, "image/jpeg", 0.75)
        URL.revokeObjectURL(url)
      }
      img.src = url
    })
  }

  async function handleImages(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (files.length + images.length > 10) { setError("Maximo 10 fotos"); return }
    const compressed = await Promise.all(files.map(compressImage))
    setImages(prev => [...prev, ...compressed])
    setPreviews(prev => [...prev, ...compressed.map(f => URL.createObjectURL(f))])
  }

  async function handlePaste(e: React.ClipboardEvent) {
    const items = Array.from(e.clipboardData?.items ?? [])
    const imageItems = items.filter(item => item.type.startsWith("image/"))
    if (imageItems.length === 0) return
    const files = imageItems.map(item => item.getAsFile()).filter(Boolean) as File[]
    if (files.length + images.length > 10) { setError("Maximo 10 fotos"); return }
    const compressed = await Promise.all(files.map(compressImage))
    setImages(prev => [...prev, ...compressed])
    setPreviews(prev => [...prev, ...compressed.map(f => URL.createObjectURL(f))])
  }

  function removeImage(i: number) {
    setImages(prev => prev.filter((_,j) => j !== i))
    setPreviews(prev => prev.filter((_,j) => j !== i))
  }

  function agregarVariante() {
    setVariantes(prev => [...prev, { nombre: "", opciones: "" }])
  }

  function eliminarVariante(i: number) {
    setVariantes(prev => prev.filter((_,j) => j !== i))
  }

  function updateVariante(i: number, field: "nombre" | "opciones", value: string) {
    setVariantes(prev => prev.map((v, j) => j === i ? { ...v, [field]: value } : v))
  }

  async function generateTitle() {
    if (!nameVal.trim()) { setError("Escribe el nombre del producto primero"); return }
    setError("")
    setGeneratingTitle(true)
    try {
      const res = await fetch('/api/generate-title', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: nameVal, category: categoryVal }),
      })
      const data = await res.json()
      if (data.title) setNameVal(data.title)
      else setError("No se pudo generar el titulo.")
    } catch {
      setError("Error al conectar con IA.")
    }
    setGeneratingTitle(false)
  }

  async function generateDescription() {
    if (!nameVal.trim()) { setError("Escribe el nombre del producto primero"); return }
    setError("")
    setGeneratingDesc(true)
    try {
      const res = await fetch('/api/generate-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: nameVal, category: categoryVal }),
      })
      const data = await res.json()
      if (data.description) setDescription(data.description)
      else setError("No se pudo generar la descripcion.")
    } catch {
      setError("Error al conectar con IA.")
    }
    setGeneratingDesc(false)
  }

  async function submitProduct(force: boolean = false) {
    setError("")
    setModerationWarning("")
    setModerationBlocked(false)

    if (!force) {
      try {
        const modRes = await fetch('/api/moderate-product', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: nameVal, description })
        })
        const modData = await modRes.json()
        if (modData.status === 'blocked') {
          setModerationBlocked(true)
          setError('No se puede publicar este producto porque infringe las politicas del marketplace. ' + (modData.reason ?? ''))
          return
        }
        if (modData.status === 'warning') {
          setModerationWarning('Este producto podria contener contenido sospechoso: ' + (modData.reason ?? ''))
          return
        }
      } catch {}
    }

    setLoading(true)
    try {
      const formData = new FormData()
      formData.set("name", nameVal)
      formData.set("description", description)
      formData.set("price", priceVal)
      formData.set("original_price", originalPriceVal)
      formData.set("category", categoryVal)
      formData.set("stock", stockVal)
      formData.set("condition", conditionVal)
      formData.set("envio_gratis", String(envioGratis))
      formData.set("variantes", JSON.stringify(
        variantes.filter(v => v.nombre && v.opciones).map(v => ({
          nombre: v.nombre,
          opciones: v.opciones.split(",").map(o => o.trim()).filter(Boolean)
        }))
      ))
      images.forEach(img => formData.append("images", img))
      const result = await createProduct(formData)
      if (result?.error) { setError(result.error); setLoading(false) }
      else { clearDraft(); router.push("/dashboard/vendor") }
    } catch (err) {
      setError("Error al publicar. Intenta de nuevo.")
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    await submitProduct(skipModeration)
    setSkipModeration(false)
  }

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');
    .np-root{background:#0f0f0f;min-height:100vh;font-family:'Poppins',sans-serif;padding:2rem;}
    .np-inner{max-width:800px;margin:0 auto;}
    .np-header{background:#0B0B0B;border-radius:16px;padding:1.75rem 2rem;margin-bottom:1.5rem;border:1px solid rgba(212,175,55,.12);}
    .np-card{background:#151515;border-radius:16px;padding:1.75rem;border:1px solid rgba(212,175,55,.08);box-shadow:0 2px 8px rgba(0,0,0,.04);margin-bottom:1rem;}
    .np-label{display:block;font-size:11px;color:#999999;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:8px;font-family:'Poppins',sans-serif;}
    .np-input{width:100%;padding:11px 14px;border:1px solid rgba(255,255,255,.1);border-radius:10px;font-size:14px;outline:none;font-family:'Poppins',sans-serif;color:#ffffff;background:#0f0f0f;box-sizing:border-box;transition:border-color .2s;}
    .np-input:focus{border-color:#D4AF37;}
    .np-select{width:100%;padding:11px 14px;border:1px solid rgba(255,255,255,.1);border-radius:10px;font-size:14px;outline:none;font-family:'Poppins',sans-serif;color:#ffffff;background:#151515;box-sizing:border-box;}
    .np-textarea{width:100%;padding:11px 14px;border:1px solid rgba(255,255,255,.1);border-radius:10px;font-size:14px;outline:none;font-family:'Poppins',sans-serif;color:#ffffff;resize:vertical;box-sizing:border-box;background:#0f0f0f;}
    .np-textarea:focus{border-color:#D4AF37;}
    .np-radio{display:flex;align-items:center;gap:8px;cursor:pointer;padding:12px 20px;border:1px solid rgba(255,255,255,.1);border-radius:10px;flex:1;justify-content:center;transition:all .2s;}
    .np-radio:hover{border-color:#D4AF37;}
    .np-btn-gold{flex:1;padding:14px;background:#D4AF37;color:#0B0B0B;border:none;cursor:pointer;font-size:14px;text-transform:uppercase;font-weight:700;border-radius:12px;font-family:'Poppins',sans-serif;transition:background .2s;}
    .np-btn-gold:hover{background:#e8c84a;}
    .np-btn-gold:disabled{opacity:.6;cursor:not-allowed;}
    .np-btn-cancel{flex:1;padding:14px;background:#151515;color:#999999;border:1px solid rgba(255,255,255,.08);cursor:pointer;font-size:14px;border-radius:12px;font-family:'Poppins',sans-serif;transition:all .2s;}
    .np-btn-cancel:hover{border-color:#D4AF37;color:#D4AF37;}
    .np-drop{border:2px dashed rgba(212,175,55,.2);border-radius:12px;padding:2.5rem;text-align:center;cursor:pointer;transition:border-color .2s;outline:none;}
    .np-drop:hover,.np-drop:focus{border-color:#D4AF37;}
    .np-btn-ia{padding:10px 18px;background:rgba(212,175,55,.1);border:1px solid rgba(212,175,55,.4);border-radius:10px;color:#D4AF37;font-size:12px;font-weight:700;cursor:pointer;font-family:'Poppins',sans-serif;transition:all .2s;white-space:nowrap;}
    .np-btn-ia:hover{background:rgba(212,175,55,.2);}
    .np-btn-ia:disabled{opacity:.5;cursor:not-allowed;}
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

          {error && (
            <div style={{ marginBottom: 16, padding: "14px 18px", background: "rgba(220,38,38,.08)", border: "1px solid rgba(220,38,38,.2)", borderRadius: 12, color: "#ef4444", fontSize: 14, fontFamily: "'Poppins',sans-serif" }}>
              {error}
            </div>
          )}

          {moderationWarning && (
            <div style={{ marginBottom: 16, padding: "14px 18px", background: "rgba(245,158,11,.08)", border: "1px solid rgba(245,158,11,.3)", borderRadius: 12, fontFamily: "'Poppins',sans-serif" }}>
              <p style={{ color: "#f59e0b", fontSize: 14, marginBottom: 10 }}>{moderationWarning}</p>
              <div style={{ display: "flex", gap: 10 }}>
                <button type="button" onClick={() => setModerationWarning("")}
                  style={{ padding: "8px 16px", background: "transparent", border: "1px solid rgba(255,255,255,.1)", borderRadius: 8, color: "#888", fontSize: 12, cursor: "pointer" }}>
                  Revisar contenido
                </button>
                <button type="button" onClick={() => { setModerationWarning(""); setSkipModeration(true); setTimeout(() => document.getElementById("form-producto")?.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true })), 100) }}
                  style={{ padding: "8px 16px", background: "#f59e0b", border: "none", borderRadius: 8, color: "#000", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                  Publicar de todas formas
                </button>
              </div>
            </div>
          )}

          <form id="form-producto" onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>

            <div className="np-card">
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <label className="np-label" style={{ margin: 0 }}>Nombre del producto *</label>
                  <button type="button" className="np-btn-ia" onClick={generateTitle} disabled={generatingTitle}>
                    {generatingTitle ? "Generando..." : "Mejorar titulo con IA"}
                  </button>
                </div>
                <input name="name" type="text" required placeholder="Nombre del producto" className="np-input"
                  value={nameVal} onChange={e => { setNameVal(e.target.value); setModerationWarning(""); setModerationBlocked(false) }} />
              </div>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <label className="np-label" style={{ margin: 0 }}>Descripcion</label>
                  <button type="button" className="np-btn-ia" onClick={generateDescription} disabled={generatingDesc}>
                    {generatingDesc ? "Generando..." : "Generar con IA"}
                  </button>
                </div>
                <textarea rows={4} placeholder="Describe tu producto o usa el boton para generarla con IA..."
                  className="np-textarea" value={description} onChange={e => { setDescription(e.target.value); setModerationWarning(""); setModerationBlocked(false) }} />
                {description && (
                  <p style={{ fontSize: 11, color: "#D4AF37", marginTop: 6, fontFamily: "'Poppins',sans-serif" }}>
                    Descripcion generada con IA. Puedes editarla libremente.
                  </p>
                )}
              </div>
            </div>

            <div className="np-card">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                <div>
                  <label className="np-label">Precio de venta (COP) *</label>
                  <input name="price" type="number" required min="0" step="100" placeholder="0" className="np-input"
                    value={priceVal} onChange={e => setPriceVal(e.target.value)} />
                </div>
                <div>
                  <label className="np-label">Precio original (tachado, opcional)</label>
                  <input name="original_price" type="number" min="0" step="100" placeholder="Precio antes del descuento" className="np-input"
                    value={originalPriceVal} onChange={e => setOriginalPriceVal(e.target.value)} />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label className="np-label">Categoria *</label>
                  <select name="category" required className="np-select"
                    value={categoryVal} onChange={e => setCategoryVal(e.target.value)}>
                    <option value="">Seleccionar...</option>
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
                <div>
                  <label className="np-label">Stock (cantidad disponible)</label>
                  <input name="stock" type="number" min="1" step="1" placeholder="Ej: 10" className="np-input"
                    value={stockVal} onChange={e => setStockVal(e.target.value)} />
                </div>
              </div>
            </div>

            <div className="np-card">
              <label className="np-label">Estado del producto *</label>
              <div style={{ display: "flex", gap: 12 }}>
                <label className="np-radio" style={{ border: conditionVal === "new" ? "1px solid #D4AF37" : "1px solid rgba(255,255,255,.1)" }}>
                  <input type="radio" name="condition" value="new" checked={conditionVal === "new"} onChange={() => setConditionVal("new")} style={{ accentColor: "#D4AF37" }} />
                  <span style={{ fontSize: 14, color: "#ffffff", fontWeight: 500, fontFamily: "'Poppins',sans-serif" }}>Nuevo</span>
                </label>
                <label className="np-radio" style={{ border: conditionVal === "used" ? "1px solid #D4AF37" : "1px solid rgba(255,255,255,.1)" }}>
                  <input type="radio" name="condition" value="used" checked={conditionVal === "used"} onChange={() => setConditionVal("used")} style={{ accentColor: "#D4AF37" }} />
                  <span style={{ fontSize: 14, color: "#ffffff", fontWeight: 500, fontFamily: "'Poppins',sans-serif" }}>Usado</span>
                </label>
              </div>
            </div>

            <div className="np-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <label className="np-label" style={{ margin: 0 }}>Variantes (opcional)</label>
                <button type="button" onClick={agregarVariante}
                  style={{ padding: "6px 14px", background: "rgba(212,175,55,.1)", border: "1px solid rgba(212,175,55,.3)", borderRadius: 8, color: "#D4AF37", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "'Poppins',sans-serif" }}>
                  + Agregar variante
                </button>
              </div>
              {variantes.length === 0 && (
                <p style={{ fontSize: 13, color: "#666", fontFamily: "'Poppins',sans-serif" }}>Ej: Talla (S, M, L, XL) o Color (Rojo, Azul, Negro)</p>
              )}
              {variantes.map((v, i) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 2fr auto", gap: 10, marginBottom: 10, alignItems: "center" }}>
                  <input value={v.nombre} onChange={e => updateVariante(i, "nombre", e.target.value)}
                    placeholder="Ej: Talla" className="np-input" />
                  <input value={v.opciones} onChange={e => updateVariante(i, "opciones", e.target.value)}
                    placeholder="Ej: S, M, L, XL" className="np-input" />
                  <button type="button" onClick={() => eliminarVariante(i)}
                    style={{ width: 36, height: 36, background: "rgba(220,38,38,.1)", border: "1px solid rgba(220,38,38,.2)", borderRadius: 8, color: "#ef4444", cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    x
                  </button>
                </div>
              ))}
            </div>

            <div className="np-card" style={{ border: `1px solid ${envioGratis ? "rgba(22,163,74,.3)" : "rgba(212,175,55,.08)"}`, background: envioGratis ? "rgba(22,163,74,.05)" : "#151515", cursor: "pointer", transition: "all .2s" }} onClick={() => setEnvioGratis(!envioGratis)}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={envioGratis ? "#16a34a" : "#888"} strokeWidth="1.75">
                    <path d="M1 3h15v13H1z"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
                  </svg>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 700, color: envioGratis ? "#16a34a" : "#ffffff", fontFamily: "'Poppins',sans-serif" }}>Envio gratis</p>
                    <p style={{ fontSize: 12, color: "#999999", fontFamily: "'Poppins',sans-serif" }}>El cliente no paga envio</p>
                  </div>
                </div>
                <div style={{ width: 44, height: 24, borderRadius: 999, background: envioGratis ? "#16a34a" : "#333", position: "relative", transition: "all .2s", flexShrink: 0 }}>
                  <div style={{ position: "absolute", top: 2, left: envioGratis ? 22 : 2, width: 20, height: 20, borderRadius: "50%", background: "#fff", transition: "all .2s", boxShadow: "0 1px 4px rgba(0,0,0,.2)" }} />
                </div>
              </div>
            </div>

            <div className="np-card">
              <label className="np-label">Fotos del producto (maximo 10)</label>
              <div className="np-drop" onClick={() => document.getElementById("img-input")?.click()} onPaste={handlePaste} tabIndex={0}>
                <input id="img-input" type="file" accept="image/*" multiple style={{ display: "none" }} onChange={handleImages} />
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="1.25" style={{ marginBottom: 10 }}>
                  <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                </svg>
                <p style={{ fontSize: 14, color: "#999999", fontFamily: "'Poppins',sans-serif", marginBottom: 4 }}>Clic para subir fotos</p>
                <p style={{ fontSize: 12, color: "#888", fontFamily: "'Poppins',sans-serif", marginBottom: 4 }}>o pega una imagen con Ctrl+V</p>
                <p style={{ fontSize: 12, color: "#D4AF37", fontFamily: "'Poppins',sans-serif" }}>{images.length}/10 fotos</p>
              </div>
              {previews.length > 0 && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 8, marginTop: 12 }}>
                  {previews.map((preview, i) => (
                    <div key={i} style={{ position: "relative" }}>
                      <img src={preview} style={{ width: "100%", aspectRatio: "1", objectFit: "cover", borderRadius: 10, border: "1px solid rgba(212,175,55,.1)" }} alt="" />
                      <button type="button" onClick={() => removeImage(i)} style={{ position: "absolute", top: 4, right: 4, width: 22, height: 22, background: "#ef4444", color: "#fff", border: "none", cursor: "pointer", fontSize: 12, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>x</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ display: "flex", gap: 12 }}>
              <button type="submit" disabled={loading || moderationBlocked} className="np-btn-gold">
                {loading ? "Publicando..." : "Publicar producto"}
              </button>
              <button type="button" onClick={() => router.back()} className="np-btn-cancel">Cancelar</button>
            </div>

          </form>
        </div>
      </div>
    </>
  )
}
