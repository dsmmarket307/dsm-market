'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

const categories = [
  'Diseno y creatividad',
  'Tecnologia y sistemas',
  'Clases y tutorias',
  'Belleza y bienestar',
  'Reparaciones y mantenimiento',
  'Eventos y fotografia',
  'Juridico y contable',
  'Salud y medicina',
  'Construccion y remodelacion',
  'Delivery y mandados',
  'Marketing y publicidad',
  'Otros',
]

export default function RegisterProviderPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState(1)
  const [serviceImage, setServiceImage] = useState<File | null>(null)
  const [servicePreview, setServicePreview] = useState<string | null>(null)
  const [avatarImage, setAvatarImage] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    business_name: '',
    category: '',
    description: '',
    price: '',
    city: '',
    phone: '',
    whatsapp: '',
  })

  function handleChange(key: string, value: string) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  function handleServiceImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setServiceImage(file)
    setServicePreview(URL.createObjectURL(file))
  }

  function handleAvatarImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarImage(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  async function handleStep1(e: React.FormEvent) {
    e.preventDefault()
    if (form.password !== form.confirmPassword) { setError('Las contrasenas no coinciden'); return }
    if (form.password.length < 6) { setError('La contrasena debe tener minimo 6 caracteres'); return }
    setError('')
    setStep(2)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { name: form.name, role: 'provider' } },
    })

    if (signUpError) { setError(signUpError.message); setLoading(false); return }

    if (data.user) {
      let serviceImageUrl = null
      let avatarUrl = null

      if (serviceImage) {
        const ext = serviceImage.name.split('.').pop()
        const fileName = data.user.id + '-servicio.' + ext
        const { error: uploadError } = await supabase.storage.from('servicios').upload(fileName, serviceImage, { upsert: true })
        if (!uploadError) {
          const { data: urlData } = supabase.storage.from('servicios').getPublicUrl(fileName)
          serviceImageUrl = urlData.publicUrl
        }
      }

      if (avatarImage) {
        const ext = avatarImage.name.split('.').pop()
        const fileName = data.user.id + '-avatar.' + ext
        const { error: uploadError } = await supabase.storage.from('avatares').upload(fileName, avatarImage, { upsert: true })
        if (!uploadError) {
          const { data: urlData } = supabase.storage.from('avatares').getPublicUrl(fileName)
          avatarUrl = urlData.publicUrl
        }
      }

      await supabase.from('profiles').insert({
        id: data.user.id,
        name: form.name,
        role: 'provider',
        celular: form.phone,
        ciudad: form.city,
        avatar_url: avatarUrl,
      })

      await supabase.from('services').insert({
        provider_id: data.user.id,
        business_name: form.business_name,
        category: form.category,
        description: form.description,
        price: form.price,
        city: form.city,
        phone: form.phone,
        whatsapp: form.whatsapp || form.phone,
        status: 'pending',
        plan: 'free',
        plan_expires_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
        service_image_url: serviceImageUrl,
        avatar_url: avatarUrl,
      })

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      })

      if (signInError) {
        setError(signInError.message)
        setLoading(false)
        return
      }

      router.push('/auth/provider-success')
      setLoading(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.75rem 1rem',
    border: '1px solid #ddd',
    fontSize: '0.875rem',
    color: '#111',
    outline: 'none',
    background: '#fafafa',
    boxSizing: 'border-box',
  }

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '0.65rem',
    letterSpacing: '2px',
    textTransform: 'uppercase',
    color: '#888',
    marginBottom: '0.5rem',
  }

  return (
    <div style={{ minHeight: '100vh', background: '#fff', fontFamily: 'sans-serif' }}>
      <nav style={{ borderBottom: '1px solid #f0f0f0', padding: '0 2rem', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, background: '#fff', zIndex: 50 }}>
        <a href="/" style={{ color: '#C9A84C', fontWeight: 700, fontSize: '1.1rem', letterSpacing: '2px', textDecoration: 'none' }}>DMS Market</a>
        <Link href="/auth/login" style={{ fontSize: '0.8rem', color: '#888', textDecoration: 'none' }}>Ya tengo cuenta</Link>
      </nav>

      <div style={{ maxWidth: '560px', margin: '0 auto', padding: '3rem 2rem' }}>

        <div style={{ marginBottom: '2rem' }}>
          <p style={{ fontSize: '0.65rem', letterSpacing: '3px', textTransform: 'uppercase', color: '#C9A84C', marginBottom: '0.5rem' }}>
            {step === 1 ? 'Paso 1 de 2 — Cuenta' : 'Paso 2 de 2 — Tu servicio'}
          </p>
          <h1 style={{ fontSize: '2rem', fontWeight: 300, color: '#111', marginBottom: '0.5rem' }}>
            {step === 1 ? 'Publica tu servicio' : 'Datos de tu servicio'}
          </h1>
          <div style={{ width: '40px', height: '2px', background: '#C9A84C', marginBottom: '1rem' }} />
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <div style={{ flex: 1, height: '4px', borderRadius: '2px', background: '#C9A84C' }} />
            <div style={{ flex: 1, height: '4px', borderRadius: '2px', background: step === 2 ? '#C9A84C' : '#eee' }} />
          </div>
        </div>

        <div style={{ marginBottom: '1.5rem', padding: '1rem', background: '#fffbeb', border: '1px solid #C9A84C', borderLeft: '4px solid #C9A84C' }}>
          <p style={{ fontSize: '0.8rem', color: '#92400e', fontWeight: 600, marginBottom: '0.25rem' }}>3 meses GRATIS</p>
          <p style={{ fontSize: '0.75rem', color: '#b45309', lineHeight: 1.6 }}>
            Publica tu servicio gratis durante 90 dias. A partir del cuarto mes elige tu plan.
          </p>
        </div>

        {error && (
          <div style={{ marginBottom: '1.5rem', padding: '0.875rem', background: '#fff5f5', border: '1px solid #fecaca', color: '#dc2626', fontSize: '0.875rem' }}>
            {error}
          </div>
        )}

        {step === 1 && (
          <form onSubmit={handleStep1} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={labelStyle}>Nombre completo</label>
              <input value={form.name} onChange={e => handleChange('name', e.target.value)} required placeholder="Tu nombre" style={inputStyle}
                onFocus={e => { e.target.style.borderColor = '#C9A84C'; e.target.style.background = '#fff' }}
                onBlur={e => { e.target.style.borderColor = '#ddd'; e.target.style.background = '#fafafa' }} />
            </div>
            <div>
              <label style={labelStyle}>Correo electronico</label>
              <input value={form.email} onChange={e => handleChange('email', e.target.value)} required type="email" placeholder="tu@correo.com" style={inputStyle}
                onFocus={e => { e.target.style.borderColor = '#C9A84C'; e.target.style.background = '#fff' }}
                onBlur={e => { e.target.style.borderColor = '#ddd'; e.target.style.background = '#fafafa' }} />
            </div>
            <div>
              <label style={labelStyle}>Contrasena</label>
              <input value={form.password} onChange={e => handleChange('password', e.target.value)} required type="password" placeholder="Minimo 6 caracteres" style={inputStyle}
                onFocus={e => { e.target.style.borderColor = '#C9A84C'; e.target.style.background = '#fff' }}
                onBlur={e => { e.target.style.borderColor = '#ddd'; e.target.style.background = '#fafafa' }} />
            </div>
            <div>
              <label style={labelStyle}>Confirmar contrasena</label>
              <input value={form.confirmPassword} onChange={e => handleChange('confirmPassword', e.target.value)} required type="password" placeholder="Repite la contrasena" style={inputStyle}
                onFocus={e => { e.target.style.borderColor = '#C9A84C'; e.target.style.background = '#fff' }}
                onBlur={e => { e.target.style.borderColor = '#ddd'; e.target.style.background = '#fafafa' }} />
            </div>

            <div>
              <label style={labelStyle}>Tu foto de perfil (opcional)</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: '#f5f5f5', border: '2px dashed #ddd', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, cursor: 'pointer' }}
                  onClick={() => document.getElementById('avatar-input')?.click()}>
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ fontSize: '1.5rem', color: '#ccc' }}>+</span>
                  )}
                </div>
                <div>
                  <p style={{ fontSize: '0.8rem', color: '#555', marginBottom: '0.25rem' }}>Sube tu foto para generar confianza</p>
                  <p style={{ fontSize: '0.75rem', color: '#aaa' }}>JPG o PNG — max 2MB</p>
                </div>
                <input id="avatar-input" type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarImage} />
              </div>
            </div>

            <button type="submit" style={{ width: '100%', padding: '1rem', background: '#C9A84C', color: '#fff', border: 'none', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', cursor: 'pointer' }}>
              Continuar
            </button>
            <p style={{ textAlign: 'center', fontSize: '0.875rem', color: '#888' }}>
              Ya tienes cuenta?{' '}
              <Link href="/auth/login" style={{ color: '#C9A84C', textDecoration: 'none', fontWeight: 600 }}>Iniciar sesion</Link>
            </p>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={labelStyle}>Nombre de tu negocio o servicio *</label>
              <input value={form.business_name} onChange={e => handleChange('business_name', e.target.value)} required placeholder="Ej: Diseno web profesional" style={inputStyle}
                onFocus={e => { e.target.style.borderColor = '#C9A84C'; e.target.style.background = '#fff' }}
                onBlur={e => { e.target.style.borderColor = '#ddd'; e.target.style.background = '#fafafa' }} />
            </div>
            <div>
              <label style={labelStyle}>Categoria *</label>
              <select value={form.category} onChange={e => handleChange('category', e.target.value)} required style={{ ...inputStyle, background: '#fff' }}
                onFocus={e => (e.target.style.borderColor = '#C9A84C')}
                onBlur={e => (e.target.style.borderColor = '#ddd')}>
                <option value="">Selecciona una categoria</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Descripcion del servicio *</label>
              <textarea value={form.description} onChange={e => handleChange('description', e.target.value)} required rows={4} placeholder="Describe que ofreces, tu experiencia, que incluye el servicio..." style={{ ...inputStyle, resize: 'vertical', fontFamily: 'sans-serif' }}
                onFocus={e => { e.target.style.borderColor = '#C9A84C'; e.target.style.background = '#fff' }}
                onBlur={e => { e.target.style.borderColor = '#ddd'; e.target.style.background = '#fafafa' }} />
            </div>
            <div>
              <label style={labelStyle}>Precio aproximado</label>
              <input value={form.price} onChange={e => handleChange('price', e.target.value)} placeholder="Ej: Desde $50.000 la hora" style={inputStyle}
                onFocus={e => { e.target.style.borderColor = '#C9A84C'; e.target.style.background = '#fff' }}
                onBlur={e => { e.target.style.borderColor = '#ddd'; e.target.style.background = '#fafafa' }} />
            </div>

            <div>
              <label style={labelStyle}>Foto del servicio (opcional)</label>
              <div style={{ border: '2px dashed #ddd', padding: '1.5rem', textAlign: 'center', cursor: 'pointer', background: '#fafafa', borderRadius: '4px' }}
                onClick={() => document.getElementById('service-image-input')?.click()}>
                <input id="service-image-input" type="file" accept="image/*" style={{ display: 'none' }} onChange={handleServiceImage} />
                {servicePreview ? (
                  <img src={servicePreview} alt="Servicio" style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'contain', borderRadius: '4px' }} />
                ) : (
                  <>
                    <p style={{ fontSize: '0.875rem', color: '#888', marginBottom: '0.25rem' }}>Sube una foto de tu trabajo o servicio</p>
                    <p style={{ fontSize: '0.75rem', color: '#C9A84C' }}>JPG o PNG — max 5MB</p>
                  </>
                )}
              </div>
              <p style={{ fontSize: '0.75rem', color: '#aaa', marginTop: '0.5rem' }}>Una buena foto aumenta la confianza del cliente.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={labelStyle}>Ciudad *</label>
                <input value={form.city} onChange={e => handleChange('city', e.target.value)} required placeholder="Tu ciudad" style={inputStyle}
                  onFocus={e => { e.target.style.borderColor = '#C9A84C'; e.target.style.background = '#fff' }}
                  onBlur={e => { e.target.style.borderColor = '#ddd'; e.target.style.background = '#fafafa' }} />
              </div>
              <div>
                <label style={labelStyle}>Celular *</label>
                <input value={form.phone} onChange={e => handleChange('phone', e.target.value)} required placeholder="300 000 0000" style={inputStyle}
                  onFocus={e => { e.target.style.borderColor = '#C9A84C'; e.target.style.background = '#fff' }}
                  onBlur={e => { e.target.style.borderColor = '#ddd'; e.target.style.background = '#fafafa' }} />
              </div>
            </div>
            <div>
              <label style={labelStyle}>WhatsApp (opcional)</label>
              <input value={form.whatsapp} onChange={e => handleChange('whatsapp', e.target.value)} placeholder="Si es diferente al celular" style={inputStyle}
                onFocus={e => { e.target.style.borderColor = '#C9A84C'; e.target.style.background = '#fff' }}
                onBlur={e => { e.target.style.borderColor = '#ddd'; e.target.style.background = '#fafafa' }} />
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button type="button" onClick={() => setStep(1)} style={{ flex: 1, padding: '1rem', background: '#fff', color: '#111', border: '1px solid #ddd', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', cursor: 'pointer' }}>
                Atras
              </button>
              <button type="submit" disabled={loading} style={{ flex: 2, padding: '1rem', background: loading ? '#e5e5e5' : '#C9A84C', color: loading ? '#999' : '#fff', border: 'none', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', cursor: loading ? 'not-allowed' : 'pointer' }}>
                {loading ? 'Publicando...' : 'Publicar mi servicio gratis'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}