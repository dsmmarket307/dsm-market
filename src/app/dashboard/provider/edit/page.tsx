'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const categories = [
  'Diseno y creatividad', 'Tecnologia y sistemas', 'Clases y tutorias',
  'Belleza y bienestar', 'Reparaciones y mantenimiento', 'Eventos y fotografia',
  'Juridico y contable', 'Salud y medicina', 'Construccion y remodelacion',
  'Delivery y mandados', 'Marketing y publicidad', 'Otros',
]

export default function EditProviderPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [serviceId, setServiceId] = useState('')
  const [serviceImage, setServiceImage] = useState<File | null>(null)
  const [servicePreview, setServicePreview] = useState<string | null>(null)
  const [avatarImage, setAvatarImage] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [form, setForm] = useState({
    business_name: '',
    category: '',
    description: '',
    price: '',
    city: '',
    phone: '',
    whatsapp: '',
    service_image_url: '',
    avatar_url: '',
  })

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }

      const { data } = await supabase
        .from('services')
        .select('*')
        .eq('provider_id', user.id)
        .single()

      if (!data) { router.push('/dashboard/provider'); return }

      setServiceId(data.id)
      setForm({
        business_name: data.business_name ?? '',
        category: data.category ?? '',
        description: data.description ?? '',
        price: data.price ?? '',
        city: data.city ?? '',
        phone: data.phone ?? '',
        whatsapp: data.whatsapp ?? '',
        service_image_url: data.service_image_url ?? '',
        avatar_url: data.avatar_url ?? '',
      })
      setServicePreview(data.service_image_url ?? null)
      setAvatarPreview(data.avatar_url ?? null)
      setLoading(false)
    }
    load()
  }, [])

  function handleChange(key: string, value: string) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth/login'); return }

    let serviceImageUrl = form.service_image_url
    let avatarUrl = form.avatar_url

    if (serviceImage) {
      const ext = serviceImage.name.split('.').pop()
      const fileName = user.id + '-servicio.' + ext
      const { error: uploadError } = await supabase.storage.from('servicios').upload(fileName, serviceImage, { upsert: true })
      if (!uploadError) {
        const { data: urlData } = supabase.storage.from('servicios').getPublicUrl(fileName)
        serviceImageUrl = urlData.publicUrl
      }
    }

    if (avatarImage) {
      const ext = avatarImage.name.split('.').pop()
      const fileName = user.id + '-avatar.' + ext
      const { error: uploadError } = await supabase.storage.from('avatares').upload(fileName, avatarImage, { upsert: true })
      if (!uploadError) {
        const { data: urlData } = supabase.storage.from('avatares').getPublicUrl(fileName)
        avatarUrl = urlData.publicUrl
      }
    }

    const { error: updateError } = await supabase
      .from('services')
      .update({
        business_name: form.business_name,
        category: form.category,
        description: form.description,
        price: form.price,
        city: form.city,
        phone: form.phone,
        whatsapp: form.whatsapp,
        service_image_url: serviceImageUrl,
        avatar_url: avatarUrl,
        status: 'pending',
      })
      .eq('id', serviceId)

    if (updateError) {
      setError(updateError.message)
      setSaving(false)
      return
    }

    setSuccess(true)
    setSaving(false)
    setTimeout(() => router.push('/dashboard/provider'), 1500)
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '0.75rem 1rem', border: '1px solid #ddd',
    fontSize: '0.875rem', color: '#111', outline: 'none', background: '#fafafa', boxSizing: 'border-box',
  }
  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: '0.65rem', letterSpacing: '2px',
    textTransform: 'uppercase', color: '#888', marginBottom: '0.5rem',
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#C9A84C' }}>Cargando...</p>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#fff', fontFamily: 'sans-serif' }}>
      <nav style={{ borderBottom: '2px solid #C9A84C', padding: '0 2rem', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff', position: 'sticky', top: 0, zIndex: 50 }}>
        <a href="/" style={{ fontSize: '1.25rem', fontWeight: 700, color: '#C9A84C', textDecoration: 'none' }}>DMS Market</a>
        <button onClick={() => router.push('/dashboard/provider')} style={{ fontSize: '0.8rem', color: '#888', background: 'none', border: '1px solid #ddd', padding: '0.4rem 0.875rem', borderRadius: '999px', cursor: 'pointer' }}>
          ← Volver al panel
        </button>
      </nav>

      <div style={{ maxWidth: '560px', margin: '0 auto', padding: '3rem 2rem' }}>
        <div style={{ marginBottom: '2rem' }}>
          <p style={{ fontSize: '0.65rem', letterSpacing: '3px', textTransform: 'uppercase', color: '#C9A84C', marginBottom: '0.5rem' }}>Mi servicio</p>
          <h1 style={{ fontSize: '2rem', fontWeight: 300, color: '#111' }}>Editar servicio</h1>
          <div style={{ width: '40px', height: '2px', background: '#C9A84C', marginTop: '0.75rem' }} />
        </div>

        {error && (
          <div style={{ marginBottom: '1.5rem', padding: '0.875rem', background: '#fff5f5', border: '1px solid #fecaca', color: '#dc2626', fontSize: '0.875rem' }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{ marginBottom: '1.5rem', padding: '0.875rem', background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#16a34a', fontSize: '0.875rem' }}>
            ¡Guardado! Redirigiendo...
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          <div>
            <label style={labelStyle}>Foto de perfil</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: '#f5f5f5', border: '2px dashed #ddd', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, cursor: 'pointer' }}
                onClick={() => document.getElementById('avatar-input')?.click()}>
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ fontSize: '1.5rem', color: '#ccc' }}>+</span>
                )}
              </div>
              <p style={{ fontSize: '0.8rem', color: '#555' }}>Haz clic para cambiar tu foto</p>
              <input id="avatar-input" type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) { setAvatarImage(f); setAvatarPreview(URL.createObjectURL(f)) } }} />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Nombre del negocio *</label>
            <input value={form.business_name} onChange={e => handleChange('business_name', e.target.value)} required style={inputStyle} />
          </div>

          <div>
            <label style={labelStyle}>Categoria *</label>
            <select value={form.category} onChange={e => handleChange('category', e.target.value)} required style={{ ...inputStyle, background: '#fff' }}>
              <option value="">Selecciona</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label style={labelStyle}>Descripcion *</label>
            <textarea value={form.description} onChange={e => handleChange('description', e.target.value)} required rows={5} style={{ ...inputStyle, resize: 'vertical', fontFamily: 'sans-serif' }} />
          </div>

          <div>
            <label style={labelStyle}>Precio</label>
            <input value={form.price} onChange={e => handleChange('price', e.target.value)} style={inputStyle} />
          </div>

          <div>
            <label style={labelStyle}>Foto del servicio</label>
            <div style={{ border: '2px dashed #ddd', padding: '1.5rem', textAlign: 'center', cursor: 'pointer', background: '#fafafa', borderRadius: '4px' }}
              onClick={() => document.getElementById('service-image-input')?.click()}>
              <input id="service-image-input" type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) { setServiceImage(f); setServicePreview(URL.createObjectURL(f)) } }} />
              {servicePreview ? (
                <img src={servicePreview} alt="Servicio" style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'contain', borderRadius: '4px' }} />
              ) : (
                <p style={{ fontSize: '0.875rem', color: '#888' }}>Haz clic para subir foto</p>
              )}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={labelStyle}>Ciudad *</label>
              <input value={form.city} onChange={e => handleChange('city', e.target.value)} required style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Celular *</label>
              <input value={form.phone} onChange={e => handleChange('phone', e.target.value)} required style={inputStyle} />
            </div>
          </div>

          <div>
            <label style={labelStyle}>WhatsApp</label>
            <input value={form.whatsapp} onChange={e => handleChange('whatsapp', e.target.value)} style={inputStyle} />
          </div>

          <div style={{ background: '#fffbeb', border: '1px solid #C9A84C', borderLeft: '4px solid #C9A84C', padding: '0.75rem 1rem', fontSize: '0.8rem', color: '#92400e' }}>
            Al guardar, tu servicio volvera a estado "En revision" hasta que el admin lo apruebe.
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button type="button" onClick={() => router.push('/dashboard/provider')} style={{ flex: 1, padding: '1rem', background: '#fff', color: '#111', border: '1px solid #ddd', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', cursor: 'pointer' }}>
              Cancelar
            </button>
            <button type="submit" disabled={saving} style={{ flex: 2, padding: '1rem', background: saving ? '#e5e5e5' : '#C9A84C', color: saving ? '#999' : '#fff', border: 'none', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', cursor: saving ? 'not-allowed' : 'pointer' }}>
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}