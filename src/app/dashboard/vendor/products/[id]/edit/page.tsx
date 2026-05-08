'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const categories = [
  'Ropa deportiva','Bisuteria','Juguetes','Mascotas','Moda',
  'Tecnologia','Cocina','Belleza','Salud','Hogar',
  'Natural home','Deportes','Bebe','Aseo','Bienestar',
  'Herramientas','Pinateria','Navidad','Halloween',
  'Libros','Papeleria','Vehiculos','Otros'
]

export default function EditProductPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [category, setCategory] = useState('')

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('products').select('*').eq('id', id).single()
      if (data) {
        setName(data.name)
        setDescription(data.description ?? '')
        setPrice(data.price)
        setCategory(data.category)
      }
      setLoading(false)
    }
    load()
  }, [id])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    const { error } = await supabase
      .from('products')
      .update({ name, description, price: Number(price), category, status: 'pending' })
      .eq('id', id)
    if (error) { setError(error.message); setSaving(false) }
    else { router.push('/dashboard/vendor') }
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif' }}>
      <p style={{ color: '#C9A84C', letterSpacing: '2px', fontSize: '0.875rem' }}>Cargando...</p>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#fff', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '3rem 2rem' }}>

        <div style={{ marginBottom: '2.5rem', borderBottom: '1px solid #f0f0f0', paddingBottom: '1.5rem' }}>
          <p style={{ fontSize: '0.65rem', letterSpacing: '3px', textTransform: 'uppercase', color: '#C9A84C', marginBottom: '0.5rem' }}>Vendedor</p>
          <h1 style={{ fontSize: '2rem', fontWeight: 300, color: '#111' }}>Editar producto</h1>
          <div style={{ width: '36px', height: '2px', background: '#C9A84C', marginTop: '0.75rem' }} />
        </div>

        <p style={{ fontSize: '0.8rem', color: '#888', marginBottom: '2rem', padding: '0.75rem 1rem', background: '#fffbeb', border: '1px solid #C9A84C' }}>
          Al editar el producto volvera a estado pendiente de aprobacion.
        </p>

        {error && (
          <div style={{ marginBottom: '1.5rem', padding: '0.875rem', background: '#fff5f5', border: '1px solid #fecaca', color: '#dc2626', fontSize: '0.875rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.65rem', letterSpacing: '2px', textTransform: 'uppercase', color: '#888', marginBottom: '0.5rem' }}>Nombre *</label>
            <input
              value={name} onChange={e => setName(e.target.value)} required
              style={{ width: '100%', padding: '0.75rem 1rem', border: '1px solid #ddd', fontSize: '0.875rem', color: '#111', outline: 'none', background: '#fafafa', boxSizing: 'border-box' }}
              onFocus={e => { e.target.style.borderColor = '#C9A84C'; e.target.style.background = '#fff' }}
              onBlur={e => { e.target.style.borderColor = '#ddd'; e.target.style.background = '#fafafa' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.65rem', letterSpacing: '2px', textTransform: 'uppercase', color: '#888', marginBottom: '0.5rem' }}>Descripcion</label>
            <textarea
              value={description} onChange={e => setDescription(e.target.value)} rows={4}
              style={{ width: '100%', padding: '0.75rem 1rem', border: '1px solid #ddd', fontSize: '0.875rem', color: '#111', outline: 'none', background: '#fafafa', boxSizing: 'border-box', resize: 'vertical', fontFamily: 'sans-serif' }}
              onFocus={e => { e.target.style.borderColor = '#C9A84C'; e.target.style.background = '#fff' }}
              onBlur={e => { e.target.style.borderColor = '#ddd'; e.target.style.background = '#fafafa' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.65rem', letterSpacing: '2px', textTransform: 'uppercase', color: '#888', marginBottom: '0.5rem' }}>Precio (COP) *</label>
              <input
                type="number" value={price} onChange={e => setPrice(e.target.value)} required min="0" step="100"
                style={{ width: '100%', padding: '0.75rem 1rem', border: '1px solid #ddd', fontSize: '0.875rem', color: '#111', outline: 'none', background: '#fafafa', boxSizing: 'border-box' }}
                onFocus={e => { e.target.style.borderColor = '#C9A84C'; e.target.style.background = '#fff' }}
                onBlur={e => { e.target.style.borderColor = '#ddd'; e.target.style.background = '#fafafa' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.65rem', letterSpacing: '2px', textTransform: 'uppercase', color: '#888', marginBottom: '0.5rem' }}>Categoria *</label>
              <select
                value={category} onChange={e => setCategory(e.target.value)} required
                style={{ width: '100%', padding: '0.75rem 1rem', border: '1px solid #ddd', fontSize: '0.875rem', color: '#111', outline: 'none', background: '#fafafa', boxSizing: 'border-box' }}
                onFocus={e => (e.target.style.borderColor = '#C9A84C')}
                onBlur={e => (e.target.style.borderColor = '#ddd')}
              >
                <option value="">Seleccionar...</option>
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', paddingTop: '1rem' }}>
            <button
              type="submit" disabled={saving}
              style={{ flex: 1, padding: '0.875rem', background: saving ? '#e5e5e5' : '#C9A84C', color: saving ? '#999' : '#fff', border: 'none', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', cursor: saving ? 'not-allowed' : 'pointer' }}
            >
              {saving ? 'Guardando...' : 'Guardar cambios'}
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
