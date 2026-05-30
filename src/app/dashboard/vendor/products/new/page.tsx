"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createProduct } from "@/lib/actions/products"
import { useTheme } from "@/lib/theme-context"

const categories = [
  "Ropa deportiva","Bisuteria","Juguetes","Mascotas","Moda","Tecnologia",
  "Cocina","Belleza","Salud","Hogar","Natural home","Deportes","Bebe",
  "Aseo","Bienestar","Herramientas","Pinateria","Navidad","Halloween",
  "Libros","Papeleria","Vehiculos","Otros"
]

const STORAGE_KEY = "dms_new_product_draft"

const THEMES = {
  dark:  { bg: '#0f0f0f', bg2: '#151515', bg3: '#0B0B0B', text: '#ffffff', text2: '#999999', border: 'rgba(212,175,55,0.12)', borderFaint: 'rgba(212,175,55,0.08)', gold: '#D4AF37', inputBg: '#0f0f0f', inputBorder: 'rgba(255,255,255,0.1)', selectBg: '#151515' },
  light: { bg: '#f5f5f5', bg2: '#ffffff',  bg3: '#ffffff',  text: '#111111', text2: '#666666', border: 'rgba(0,0,0,0.12)',        borderFaint: 'rgba(0,0,0,0.07)',        gold: '#B8960C', inputBg: '#ffffff', inputBorder: 'rgba(0,0,0,0.15)',    selectBg: '#f5f5f5' },
}

export default function NewProductPage() {
  const router = useRouter()
  const { theme, toggleTheme } = useTheme()
  const T = THEMES[theme]

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
  const [imageAnalysis, setImageAnalysis] = useState<Record<number, any>>({})
  const [analyzingImages, setAnalyzingImages] = useState(false)

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
    setImageAnalysis({})
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
    setImageAnalysis({})
  }

  function removeImage(i: number) {
    setImages(prev => prev.filter((_,j) => j !== i))
    setPreviews(prev => prev.filter((_,j) => j !== i))
    setImageAnalysis({})
  }

  async function analyzeImages() {
    if (images.length === 0) return
    setAnalyzingImages(true)
    setImageAnalysis({})
    const newAnalysis: Record<number, any> = {}
    for (let i = 0; i < images.length; i++) {
      try {
        const reader = new FileReader()
        const base64 = await new Promise<string>((resolve) => {
          reader.onload = () => resolve((reader.result as string).split(",")[1])
          reader.readAsDataURL(images[i])
        })
        const res = await fetch("/api/analyze-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageBase64: base64, mimeType: images[i].type, index: i })
        })
        const data = await res.json()
        newAnalysis[i] = data
      } catch {
        newAnalysis[i] = { score: 75, issues: [], suggestions: [], isGood: true, coverRecommended: i === 0 }
      }
    }
    setImageAnalysis(newAnalysis)
    setAnalyzingImages(false)
  }

  async function generateTitle() {
    if (!nameVal.trim()) { setError("Escribe el nombre del producto primero"); return }
    setError("")
    setGeneratingTitle(true)
    try {
      const res = await fetch("/api/generate-title", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
      const res = await fetch("/api/generate-description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
        const modRes = await fetch("/api/moderate-product", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: nameVal, description })
        })
        const modData = await modRes.json()
        if (modData.status === "blocked") {
          setModerationBlocked(true)
          setError("No se puede publicar este producto porque infringe las politicas del marketplace. " + (modData.reason ?? ""))
          return
        }
        if (modData.status === "warning") {
          setModerationWarning("Este producto podria contener contenido sospechoso: " + (modData.reason ?? ""))
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
    } catch {
      setError("Error al publicar. Intenta de nuevo.")
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    await submitProduct(skipModeration)
    setSkipModeration(false)
  }

  const inputStyle = { width: '100%', padding: '11px 14px', border: `1px solid ${T.inputBorder}`, borderRadius: 10, fontSize: 14, outline: 'none', fontFamily: "'Poppins',sans-serif", color: T.text, background: T.inputBg, boxSizing: 'border-box' as const, transition: 'border-color .2s' }
  const selectStyle = { width: '100%', padding: '11px 14px', border: `1px solid ${T.inputBorder}`, borderRadius: 10, fontSize: 14, outline: 'none', fontFamily: "'Poppins',sans-serif", color: T.text, background: T.selectBg, boxSizing: 'border-box' as const }
  const textareaStyle = { width: '100%', padding: '11px 14px', border: `1px solid ${T.inputBorder}`, borderRadius: 10, fontSize: 14, outline: 'none', fontFamily: "'Poppins',sans-serif", color: T.text, resize: 'vertical' as const, boxSizing: 'border-box' as const, background: T.inputBg }
  const labelStyle = { display: 'block', fontSize: 11, color: T.text2, textTransform: 'uppercase' as const, letterSpacing: '1.5px', marginBottom: 8, fontFamily: "'Poppins',sans-serif" }
  const cardStyle = { background: T.bg2, borderRadius: 16, padding: '1.75rem', border: `1px solid ${T.borderFaint}`, marginBottom: '1rem' }
  const btnIaStyle = { padding: '10px 18px', background: `rgba(212,175,55,0.1)`, border: `1px solid rgba(212,175,55,0.4)`, borderRadius: 10, color: T.gold, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: "'Poppins',sans-serif", whiteSpace: 'nowrap' as const }

  return (
    <div style={{ background: T.bg, minHeight: '100vh', fontFamily: "'Poppins',sans-serif", padding: '2rem', transition: 'background .3s' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>

        {/* HEADER */}
        <div style={{ background: T.bg3, borderRadius: 16, padding: '1.75rem 2rem', marginBottom: '1.5rem', border: `1px solid ${T.border}`, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <p style={{ fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', color: T.gold, marginBottom: 4 }}>Vendedor</p>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: T.text, margin: 0 }}>Nuevo producto</h1>
          </div>
          <button onClick={toggleTheme} title="Cambiar tema" style={{ background: 'transparent', border: `1px solid ${T.border}`, borderRadius: 10, padding: '8px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, color: T.text2, fontSize: 12 }}>
            {theme === 'dark' ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
            )}
            {theme === 'dark' ? 'Claro' : 'Oscuro'}
          </button>
        </div>

        {error && (
          <div style={{ marginBottom: 16, padding: '14px 18px', background: 'rgba(220,38,38,.08)', border: '1px solid rgba(220,38,38,.2)', borderRadius: 12, color: '#ef4444', fontSize: 14 }}>
            {error}
          </div>
        )}

        {moderationWarning && (
          <div style={{ marginBottom: 16, padding: '14px 18px', background: 'rgba(245,158,11,.08)', border: '1px solid rgba(245,158,11,.3)', borderRadius: 12 }}>
            <p style={{ color: '#f59e0b', fontSize: 14, marginBottom: 10 }}>{moderationWarning}</p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="button" onClick={() => setModerationWarning("")}
                style={{ padding: '8px 16px', background: 'transparent', border: `1px solid ${T.inputBorder}`, borderRadius: 8, color: T.text2, fontSize: 12, cursor: 'pointer' }}>
                Revisar contenido
              </button>
              <button type="button" onClick={() => { setModerationWarning(""); setSkipModeration(true); setTimeout(() => document.getElementById("form-producto")?.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true })), 100) }}
                style={{ padding: '8px 16px', background: '#f59e0b', border: 'none', borderRadius: 8, color: '#000', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                Publicar de todas formas
              </button>
            </div>
          </div>
        )}

        <form id="form-producto" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

          {/* NOMBRE Y DESCRIPCION */}
          <div style={cardStyle}>
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <label style={{ ...labelStyle, marginBottom: 0 }}>Nombre del producto *</label>
                <button type="button" style={btnIaStyle} onClick={generateTitle} disabled={generatingTitle}>
                  {generatingTitle ? 'Generando...' : 'Mejorar titulo con IA'}
                </button>
              </div>
              <input name="name" type="text" required placeholder="Nombre del producto" style={inputStyle}
                value={nameVal} onChange={e => { setNameVal(e.target.value); setModerationWarning(""); setModerationBlocked(false) }} />
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <label style={{ ...labelStyle, marginBottom: 0 }}>Descripcion</label>
                <button type="button" style={btnIaStyle} onClick={generateDescription} disabled={generatingDesc}>
                  {generatingDesc ? 'Generando...' : 'Generar con IA'}
                </button>
              </div>
              <textarea rows={4} placeholder="Describe tu producto o usa el boton para generarla con IA..."
                style={textareaStyle} value={description} onChange={e => { setDescription(e.target.value); setModerationWarning(""); setModerationBlocked(false) }} />
              {description && (
                <p style={{ fontSize: 11, color: T.gold, marginTop: 6 }}>Descripcion generada con IA. Puedes editarla libremente.</p>
              )}
            </div>
          </div>

          {/* PRECIO Y CATEGORIA */}
          <div style={cardStyle}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div>
                <label style={labelStyle}>Precio de venta (COP) *</label>
                <input name="price" type="number" required min="0" step="100" placeholder="0" style={inputStyle}
                  value={priceVal} onChange={e => setPriceVal(e.target.value)} />
              </div>
              <div>
                <label style={labelStyle}>Precio original (tachado, opcional)</label>
                <input name="original_price" type="number" min="0" step="100" placeholder="Precio antes del descuento" style={inputStyle}
                  value={originalPriceVal} onChange={e => setOriginalPriceVal(e.target.value)} />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={labelStyle}>Categoria *</label>
                <select name="category" required style={selectStyle} value={categoryVal} onChange={e => setCategoryVal(e.target.value)}>
                  <option value="">Seleccionar...</option>
                  {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Stock (cantidad disponible)</label>
                <input name="stock" type="number" min="1" step="1" placeholder="Ej: 10" style={inputStyle}
                  value={stockVal} onChange={e => setStockVal(e.target.value)} />
              </div>
            </div>
          </div>

          {/* CONDICION */}
          <div style={cardStyle}>
            <label style={labelStyle}>Estado del producto *</label>
            <div style={{ display: 'flex', gap: 12 }}>
              {(['new','used'] as const).map(val => (
                <label key={val} onClick={() => setConditionVal(val)} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', padding: '12px 20px', border: `1px solid ${conditionVal === val ? T.gold : T.inputBorder}`, borderRadius: 10, flex: 1, justifyContent: 'center' }}>
                  <input type="radio" name="condition" value={val} checked={conditionVal === val} onChange={() => setConditionVal(val)} style={{ accentColor: T.gold }} />
                  <span style={{ fontSize: 14, color: T.text, fontWeight: 500 }}>{val === 'new' ? 'Nuevo' : 'Usado'}</span>
                </label>
              ))}
            </div>
          </div>

          {/* VARIANTES */}
          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <label style={{ ...labelStyle, marginBottom: 0 }}>Variantes (opcional)</label>
              <button type="button" onClick={() => setVariantes(prev => [...prev, { nombre: '', opciones: '' }])}
                style={{ padding: '6px 14px', background: `rgba(212,175,55,0.1)`, border: `1px solid rgba(212,175,55,0.3)`, borderRadius: 8, color: T.gold, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                + Agregar variante
              </button>
            </div>
            {variantes.length === 0 && (
              <p style={{ fontSize: 13, color: T.text2 }}>Ej: Talla (S, M, L, XL) o Color (Rojo, Azul, Negro)</p>
            )}
            {variantes.map((v, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 2fr auto', gap: 10, marginBottom: 10, alignItems: 'center' }}>
                <input value={v.nombre} onChange={e => setVariantes(prev => prev.map((vv, j) => j === i ? { ...vv, nombre: e.target.value } : vv))}
                  placeholder="Ej: Talla" style={inputStyle} />
                <input value={v.opciones} onChange={e => setVariantes(prev => prev.map((vv, j) => j === i ? { ...vv, opciones: e.target.value } : vv))}
                  placeholder="Ej: S, M, L, XL" style={inputStyle} />
                <button type="button" onClick={() => setVariantes(prev => prev.filter((_,j) => j !== i))}
                  style={{ width: 36, height: 36, background: 'rgba(220,38,38,.1)', border: '1px solid rgba(220,38,38,.2)', borderRadius: 8, color: '#ef4444', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  x
                </button>
              </div>
            ))}
          </div>

          {/* ENVIO GRATIS */}
          <div style={{ ...cardStyle, border: `1px solid ${envioGratis ? 'rgba(22,163,74,.3)' : T.borderFaint}`, background: envioGratis ? 'rgba(22,163,74,.05)' : T.bg2, cursor: 'pointer' }} onClick={() => setEnvioGratis(!envioGratis)}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={envioGratis ? '#16a34a' : T.text2} strokeWidth="1.75">
                  <path d="M1 3h15v13H1z"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
                </svg>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: envioGratis ? '#16a34a' : T.text }}>Envio gratis</p>
                  <p style={{ fontSize: 12, color: T.text2 }}>El cliente no paga envio</p>
                </div>
              </div>
              <div style={{ width: 44, height: 24, borderRadius: 999, background: envioGratis ? '#16a34a' : (theme === 'dark' ? '#333' : '#ccc'), position: 'relative', transition: 'all .2s', flexShrink: 0 }}>
                <div style={{ position: 'absolute', top: 2, left: envioGratis ? 22 : 2, width: 20, height: 20, borderRadius: '50%', background: '#fff', transition: 'all .2s', boxShadow: '0 1px 4px rgba(0,0,0,.2)' }} />
              </div>
            </div>
          </div>

          {/* FOTOS */}
          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <label style={{ ...labelStyle, marginBottom: 0 }}>Fotos del producto (maximo 10)</label>
              {images.length > 0 && (
                <button type="button" style={btnIaStyle} onClick={analyzeImages} disabled={analyzingImages}>
                  {analyzingImages ? 'Analizando...' : 'Analizar con IA'}
                </button>
              )}
            </div>
            <div onClick={() => document.getElementById('img-input')?.click()} onPaste={handlePaste} tabIndex={0}
              style={{ border: `2px dashed rgba(212,175,55,0.2)`, borderRadius: 12, padding: '2.5rem', textAlign: 'center', cursor: 'pointer', outline: 'none' }}>
              <input id="img-input" type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleImages} />
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={T.text2} strokeWidth="1.25" style={{ marginBottom: 10 }}>
                <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
              </svg>
              <p style={{ fontSize: 14, color: T.text2, marginBottom: 4 }}>Clic para subir fotos</p>
              <p style={{ fontSize: 12, color: T.text2, marginBottom: 4 }}>o pega una imagen con Ctrl+V</p>
              <p style={{ fontSize: 12, color: T.gold }}>{images.length}/10 fotos</p>
            </div>

            {previews.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 8, marginTop: 12 }}>
                {previews.map((preview, i) => (
                  <div key={i} style={{ position: 'relative' }}>
                    <img src={preview} style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: 10, border: imageAnalysis[i] ? (imageAnalysis[i].isGood ? '2px solid #1D9E75' : '2px solid #f59e0b') : `1px solid ${T.border}` }} alt="" />
                    <button type="button" onClick={() => removeImage(i)} style={{ position: 'absolute', top: 4, right: 4, width: 22, height: 22, background: '#ef4444', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 12, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>x</button>
                    {imageAnalysis[i] && (
                      <div style={{ position: 'absolute', bottom: 4, left: 4, background: imageAnalysis[i].isGood ? '#1D9E75' : '#f59e0b', color: '#fff', fontSize: 9, fontWeight: 700, padding: '2px 5px', borderRadius: 4 }}>
                        {imageAnalysis[i].score}
                      </div>
                    )}
                    {imageAnalysis[i]?.coverRecommended && (
                      <div style={{ position: 'absolute', top: 4, left: 4, background: T.gold, color: '#000', fontSize: 8, fontWeight: 700, padding: '2px 5px', borderRadius: 4 }}>
                        PORTADA
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {Object.keys(imageAnalysis).length > 0 && !analyzingImages && (
              <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
                {Object.entries(imageAnalysis).map(([idx, analysis]: [string, any]) => (
                  analysis.issues?.length > 0 || analysis.suggestions?.length > 0 ? (
                    <div key={idx} style={{ padding: '0.6rem 0.875rem', background: analysis.isGood ? 'rgba(29,158,117,.08)' : 'rgba(245,158,11,.08)', border: '1px solid ' + (analysis.isGood ? 'rgba(29,158,117,.2)' : 'rgba(245,158,11,.2)'), borderRadius: 8, fontSize: 11 }}>
                      <p style={{ color: analysis.isGood ? '#1D9E75' : '#f59e0b', fontWeight: 600, margin: '0 0 3px' }}>
                        Imagen {Number(idx) + 1} · {analysis.score}/100 {analysis.coverRecommended ? '· Portada sugerida' : ''}
                      </p>
                      {analysis.issues?.length > 0 && <p style={{ color: '#f59e0b', margin: '2px 0 0' }}>{analysis.issues.join(' · ')}</p>}
                      {analysis.suggestions?.length > 0 && <p style={{ color: T.text2, margin: '2px 0 0' }}>{analysis.suggestions.join(' · ')}</p>}
                    </div>
                  ) : null
                ))}
              </div>
            )}
          </div>

          {/* BOTONES */}
          <div style={{ display: 'flex', gap: 12 }}>
            <button type="submit" disabled={loading || moderationBlocked}
              style={{ flex: 1, padding: 14, background: T.gold, color: '#0B0B0B', border: 'none', cursor: 'pointer', fontSize: 14, textTransform: 'uppercase', fontWeight: 700, borderRadius: 12, fontFamily: "'Poppins',sans-serif", opacity: (loading || moderationBlocked) ? 0.6 : 1 }}>
              {loading ? 'Publicando...' : 'Publicar producto'}
            </button>
            <button type="button" onClick={() => router.back()}
              style={{ flex: 1, padding: 14, background: 'transparent', color: T.text2, border: `1px solid ${T.borderFaint}`, cursor: 'pointer', fontSize: 14, borderRadius: 12, fontFamily: "'Poppins',sans-serif" }}>
              Cancelar
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}