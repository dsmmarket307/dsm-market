'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const bancos = [
  'Bancolombia',
  'Banco de Bogota',
  'Davivienda',
  'BBVA',
  'Banco Popular',
  'Banco de Occidente',
  'Colpatria',
  'Nequi',
  'Daviplata',
  'Banco Agrario',
  'Otro',
]

export default function DatosBancariosPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    banco: '',
    tipo_cuenta: 'ahorros',
    numero_cuenta: '',
    cedula: '',
    celular: '',
    direccion: '',
    ciudad: '',
  })

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      const { data } = await supabase
        .from('profiles')
        .select('banco, tipo_cuenta, numero_cuenta, cedula, celular, direccion, ciudad')
        .eq('id', user.id)
        .single()
      if (data) {
        setForm({
          banco: data.banco ?? '',
          tipo_cuenta: data.tipo_cuenta ?? 'ahorros',
          numero_cuenta: data.numero_cuenta ?? '',
          cedula: data.cedula ?? '',
          celular: data.celular ?? '',
          direccion: data.direccion ?? '',
          ciudad: data.ciudad ?? '',
        })
      }
      setLoading(false)
    }
    load()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { error } = await supabase
      .from('profiles')
      .update(form)
      .eq('id', user.id)
    if (error) { setError(error.message); setSaving(false); return }
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
    setSaving(false)
  }

  const inputStyle = { width: '100%', padding: '0.75rem 1rem', border: '1px solid #ddd', fontSize: '0.875rem', color: '#111', outline: 'none', background: '#fafafa', boxSizing: 'border-box' as const }
  const labelStyle = { display: 'block', fontSize: '0.65rem', letterSpacing: '2px', textTransform: 'uppercase' as const, color: '#888', marginBottom: '0.5rem' }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif' }}>
      <p style={{ color: '#C9A84C', letterSpacing: '2px', fontSize: '0.875rem' }}>Cargando...</p>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#fff', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '700px', margin: '0 auto', padding: 'clamp(1.5rem, 4vw, 3rem) clamp(1rem, 4vw, 2rem)' }}>

        <div style={{ marginBottom: '2rem', borderBottom: '1px solid #f0f0f0', paddingBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <p style={{ fontSize: '0.65rem', letterSpacing: '3px', textTransform: 'uppercase', color: '#C9A84C', marginBottom: '0.5rem' }}>Vendedor</p>
            <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: 300, color: '#111' }}>Datos de pago</h1>
          </div>
          <a href="/dashboard/vendor" style={{ fontSize: '0.75rem', color: '#888', textDecoration: 'none' }}>Volver al panel</a>
        </div>

        <div style={{ marginBottom: '2rem', padding: '1rem 1.25rem', background: '#fffbeb', border: '1px solid #C9A84C', borderLeft: '4px solid #C9A84C' }}>
          <p style={{ fontSize: '0.8rem', color: '#92400e', lineHeight: 1.6 }}>
            Estos datos son confidenciales y solo los ve el administrador de DSM Market para enviarte tus pagos. Mantenlos actualizados.
          </p>
        </div>

        {error && (
          <div style={{ marginBottom: '1.5rem', padding: '0.875rem', background: '#fff5f5', border: '1px solid #fecaca', color: '#dc2626', fontSize: '0.875rem' }}>
            {error}
          </div>
        )}

        {saved && (
          <div style={{ marginBottom: '1.5rem', padding: '0.875rem', background: '#e8f5e9', border: '1px solid #c8e6c9', color: '#2e7d32', fontSize: '0.875rem' }}>
            Datos guardados correctamente.
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          <div style={{ padding: '1.25rem', background: '#fafafa', border: '1px solid #eee', borderTop: '2px solid #C9A84C' }}>
            <p style={{ fontSize: '0.65rem', letterSpacing: '3px', textTransform: 'uppercase', color: '#888', marginBottom: '1rem' }}>Datos bancarios</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={labelStyle}>Banco</label>
                <select value={form.banco} onChange={e => setForm(p => ({ ...p, banco: e.target.value }))}
                  style={{ ...inputStyle, background: '#fff' }}>
                  <option value="">Selecciona tu banco</option>
                  {bancos.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Tipo de cuenta</label>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  {['ahorros', 'corriente'].map(tipo => (
                    <label key={tipo} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', padding: '0.75rem 1.25rem', border: '1px solid ' + (form.tipo_cuenta === tipo ? '#C9A84C' : '#ddd'), flex: 1, justifyContent: 'center', background: form.tipo_cuenta === tipo ? '#fffbeb' : '#fff' }}>
                      <input type="radio" name="tipo_cuenta" value={tipo} checked={form.tipo_cuenta === tipo} onChange={() => setForm(p => ({ ...p, tipo_cuenta: tipo }))} style={{ accentColor: '#C9A84C' }} />
                      <span style={{ fontSize: '0.875rem', color: '#111', textTransform: 'capitalize' }}>{tipo}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label style={labelStyle}>Numero de cuenta</label>
                <input value={form.numero_cuenta} onChange={e => setForm(p => ({ ...p, numero_cuenta: e.target.value }))}
                  placeholder="Numero de cuenta bancaria" style={inputStyle}
                  onFocus={e => { e.target.style.borderColor = '#C9A84C'; e.target.style.background = '#fff' }}
                  onBlur={e => { e.target.style.borderColor = '#ddd'; e.target.style.background = '#fafafa' }} />
              </div>
            </div>
          </div>

          <div style={{ padding: '1.25rem', background: '#fafafa', border: '1px solid #eee', borderTop: '2px solid #C9A84C' }}>
            <p style={{ fontSize: '0.65rem', letterSpacing: '3px', textTransform: 'uppercase', color: '#888', marginBottom: '1rem' }}>Datos personales</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={labelStyle}>Cedula de ciudadania</label>
                <input value={form.cedula} onChange={e => setForm(p => ({ ...p, cedula: e.target.value }))}
                  placeholder="Numero de cedula" style={inputStyle}
                  onFocus={e => { e.target.style.borderColor = '#C9A84C'; e.target.style.background = '#fff' }}
                  onBlur={e => { e.target.style.borderColor = '#ddd'; e.target.style.background = '#fafafa' }} />
              </div>
              <div>
                <label style={labelStyle}>Numero de celular</label>
                <input value={form.celular} onChange={e => setForm(p => ({ ...p, celular: e.target.value }))}
                  placeholder="300 000 0000" style={inputStyle}
                  onFocus={e => { e.target.style.borderColor = '#C9A84C'; e.target.style.background = '#fff' }}
                  onBlur={e => { e.target.style.borderColor = '#ddd'; e.target.style.background = '#fafafa' }} />
              </div>
              <div>
                <label style={labelStyle}>Direccion de domicilio</label>
                <input value={form.direccion} onChange={e => setForm(p => ({ ...p, direccion: e.target.value }))}
                  placeholder="Calle, carrera, numero, apartamento" style={inputStyle}
                  onFocus={e => { e.target.style.borderColor = '#C9A84C'; e.target.style.background = '#fff' }}
                  onBlur={e => { e.target.style.borderColor = '#ddd'; e.target.style.background = '#fafafa' }} />
              </div>
              <div>
                <label style={labelStyle}>Ciudad</label>
                <input value={form.ciudad} onChange={e => setForm(p => ({ ...p, ciudad: e.target.value }))}
                  placeholder="Ciudad de residencia" style={inputStyle}
                  onFocus={e => { e.target.style.borderColor = '#C9A84C'; e.target.style.background = '#fff' }}
                  onBlur={e => { e.target.style.borderColor = '#ddd'; e.target.style.background = '#fafafa' }} />
              </div>
            </div>
          </div>

          <button type="submit" disabled={saving}
            style={{ width: '100%', padding: '1rem', background: saving ? '#e5e5e5' : '#C9A84C', color: saving ? '#999' : '#fff', border: 'none', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', cursor: saving ? 'not-allowed' : 'pointer' }}>
            {saving ? 'Guardando...' : 'Guardar datos de pago'}
          </button>
        </form>
      </div>
    </div>
  )
}