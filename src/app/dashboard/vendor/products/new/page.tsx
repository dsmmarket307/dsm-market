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

  function handleImages(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (files.length + images.length > 10) { setError("Maximo 10 fotos"); return }
    setImages(prev => [...prev, ...files])
    setPreviews(prev => [...prev, ...files.map(f => URL.createObjectURL(f))])
  }

  function removeImage(i: number) {
    setImages(prev => prev.filter((_, j) => j !== i))
    setPreviews(prev => prev.filter((_, j) => j !== i))
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError("")
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    images.forEach(img => formData.append("images", img))
    const result = await createProduct(formData)
    if (result?.error) { setError(result.error); setLoading(false) }
    else { router.push("/dashboard/vendor") }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#fff', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '3rem 2rem' }}>

        {/* Header */}
        <div style={{ marginBottom: '2.5rem', borderBottom: '1px solid #f0f0f0', paddingBottom: '1.5rem' }}>
          <p style={{ fontSize: '0.65rem', letterSpacing: '3px', textTransform: 'uppercase', color: '#C9A84C', marginBottom: '0.5rem' }}>
            Vendedor
          </p>
          <h1 style={{ fontSize: '2rem', fontWeight: 300, color: '#111' }}>
            Nuevo producto
          </h1>
          <div style={{ width: '36px', height: '2px', background: '#C9A84C', marginTop: '0.75rem' }} />
        </div>

        {error && (
          <div style={{ marginBottom: '1.5rem', padding: '0.875rem 1rem', background: '#fff5f5', border: '1px solid #fecaca', color: '#dc2626', fontSize: '0.875rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          <div>
            <label style={{ display: 'block', fontSize: '0.65rem', letterSpacing: '2px', textTransform: 'uppercase', color: '#888', marginBottom: '0.5rem' }}>
              Nombre del producto *
            </label>
            <input
              name="name" type="text" required placeholder="Nombre del producto"
              style={{ width: '100%', padding: '0.75rem 1rem', border: '1px solid #ddd', fontSize: '0.875rem', color: '#111', outline: 'none', background: '#fafafa', boxSizing: 'border-box' }}
              onFocus={e => { e.target.style.borderColor = '#C9A84C'; e.target.style.background = '#fff' }}
              onBlur={e => { e.target.style.borderColor = '#ddd'; e.target.style.background = '#fafafa' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.65rem', letterSpacing: '2px', textTransform: 'uppercase', color: '#888', marginBottom: '0.5rem' }}>
              Descripcion
            </label>
            <textarea
              name="description" rows={4} placeholder="Describe tu producto..."
              style={{ width: '100%', padding: '0.75rem 1rem', border: '1px solid #ddd', fontSize: '0.875rem', color: '#111', outline: 'none', background: '#fafafa', boxSizing: 'border-box', resize: 'vertical', fontFamily: 'sans-serif' }}
              onFocus={e => { e.target.style.borderColor = '#C9A84C'; e.target.style.background = '#fff' }}
              onBlur={e => { e.target.style.borderColor = '#ddd'; e.target.style.background = '#fafafa' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.65rem', letterSpacing: '2px', textTransform: 'uppercase', color: '#888', marginBottom: '0.5rem' }}>
                Precio (COP) *
              </label>
              <input
                name="price" type="number" required min="0" step="100" placeholder="0"
                style={{ width: '100%', padding: '0.75rem 1rem', border: '1px solid #ddd', fontSize: '0.875rem', color: '#111', outline: 'none', background: '#fafafa', boxSizing: 'border-box' }}
                onFocus={e => { e.target.style.borderColor = '#C9A84C'; e.target.style.background = '#fff' }}
                onBlur={e => { e.target.style.borderColor = '#ddd'; e.target.style.background = '#fafafa' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.65rem', letterSpacing: '2px', textTransform: 'uppercase', color: '#888', marginBottom: '0.5rem' }}>
                Categoria *
              </label>
              <select
                name="category" required
                style={{ width: '100%', padding: '0.75rem 1rem', border: '1px solid #ddd', fontSize: '0.875rem', color: '#111', outline: 'none', background: '#fafafa', boxSizing: 'border-box' }}
                onFocus={e => (e.target.style.borderColor = '#C9A84C')}
                onBlur={e => (e.target.style.borderColor = '#ddd')}
              >
                <option value="">Seleccionar...</option>
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.65rem', letterSpacing: '2px', textTransform: 'uppercase', color: '#888', marginBottom: '0.5rem' }}>
              Fotos (maximo 10)
            </label>
            <div
              onClick={() => document.getElementById("img-input")?.click()}
              style={{ border: '2px dashed #ddd', padding: '2rem', textAlign: 'center', cursor: 'pointer', background: '#fafafa' }}
            >
              <input id="img-input" type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleImages} />
              <p style={{ fontSize: '0.875rem', color: '#888', marginBottom: '0.25rem' }}>Clic para subir fotos</p>
              <p style={{ fontSize: '0.75rem', color: '#C9A84C' }}>{images.length}/10 fotos</p>
            </div>

            {previews.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.5rem', marginTop: '1rem' }}>
                {previews.map((preview, i) => (
                  <div key={i} style={{ position: 'relative' }}>
                    <img src={preview} style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', border: '1px solid #eee' }} />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      style={{ position: 'absolute', top: '4px', right: '4px', width: '20px', height: '20px', background: '#dc2626', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      x
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '1rem', paddingTop: '1rem' }}>
            <button
              type="submit" disabled={loading}
              style={{ flex: 1, padding: '0.875rem', background: loading ? '#e5e5e5' : '#C9A84C', color: loading ? '#999' : '#fff', border: 'none', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', cursor: loading ? 'not-allowed' : 'pointer' }}
            >
              {loading ? 'Publicando...' : 'Publicar producto'}
            </button>
            <button
              type="button" onClick={() => router.back()}
              style={{ flex: 1, padding: '0.875rem', background: '#fff', color: '#111', border: '1px solid #ddd', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', cursor: 'pointer' }}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}