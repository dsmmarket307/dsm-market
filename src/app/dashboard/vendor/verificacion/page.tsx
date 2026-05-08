
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function VerificacionPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [uploaded, setUploaded] = useState(false)
  const [accepted, setAccepted] = useState(false)
  const [docFile, setDocFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      setUser(user)
    }
    load()
  }, [])

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { setError('El archivo no puede superar 5MB'); return }
    setDocFile(file)
    setPreview(URL.createObjectURL(file))
    setError('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!accepted) { setError('Debes aceptar las politicas para continuar'); return }
    if (!docFile) { setError('Debes subir tu documento de identidad'); return }
    setLoading(true)
    setError('')
    try {
      const ext = docFile.name.split('.').pop()
      const fileName = user.id + '-documento.' + ext
      const { error: uploadError } = await supabase.storage
        .from('documentos')
        .upload(fileName, docFile, { upsert: true })
      if (uploadError) throw uploadError
      const { data: urlData } = supabase.storage.from('documentos').getPublicUrl(fileName)
      await supabase.from('profiles').update({
        documento_url: urlData.publicUrl,
        politicas_aceptadas: true,
        politicas_version: '1.0',
        politicas_fecha: new Date().toISOString(),
      }).eq('id', user.id)
      await supabase.from('policies_acceptance').insert({
        user_id: user.id,
        policy_version: '1.0',
      })
      setUploaded(true)
      setTimeout(() => router.push('/dashboard/vendor'), 2000)
    } catch (err: any) {
      setError(err.message)
    }
    setLoading(false)
  }

  if (uploaded) return (
    <div style={{ minHeight: '100vh', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: '64px', height: '64px', background: '#e8f5e9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
          <span style={{ fontSize: '2rem', color: '#1D9E75' }}>OK</span>
        </div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 300, color: '#111', marginBottom: '0.5rem' }}>Documento enviado</h2>
        <p style={{ color: '#888', fontSize: '0.875rem' }}>El equipo de DSM Market revisara tu solicitud.</p>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#fff', fontFamily: 'sans-serif' }}>
      <nav style={{ borderBottom: '1px solid #f0f0f0', padding: '0 2rem', height: '56px', display: 'flex', alignItems: 'center', background: '#fff', position: 'sticky', top: 0, zIndex: 50 }}>
        <a href="/" style={{ color: '#C9A84C', fontWeight: 700, fontSize: '1.1rem', letterSpacing: '2px', textDecoration: 'none' }}>DMS</a>
      </nav>

      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '3rem 2rem' }}>
        <p style={{ fontSize: '0.65rem', letterSpacing: '3px', textTransform: 'uppercase', color: '#C9A84C', marginBottom: '0.5rem' }}>Verificacion</p>
        <h1 style={{ fontSize: '2rem', fontWeight: 300, color: '#111', marginBottom: '0.5rem' }}>Verifica tu cuenta</h1>
        <div style={{ width: '40px', height: '2px', background: '#C9A84C', marginBottom: '2rem' }} />

        <p style={{ fontSize: '0.875rem', color: '#666', lineHeight: 1.7, marginBottom: '2rem' }}>
          Para vender en DSM Market necesitas subir una copia de tu documento de identidad colombiano y aceptar nuestras politicas.
        </p>

        {error && (
          <div style={{ marginBottom: '1.5rem', padding: '0.875rem', background: '#fff5f5', border: '1px solid #fecaca', color: '#dc2626', fontSize: '0.875rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.65rem', letterSpacing: '2px', textTransform: 'uppercase', color: '#888', marginBottom: '0.75rem' }}>
              Documento de identidad (CC o NIT)
            </label>
            <div onClick={() => document.getElementById('doc-input')?.click()}
              style={{ border: '2px dashed #ddd', padding: '2rem', textAlign: 'center', cursor: 'pointer', background: '#fafafa' }}>
              <input id="doc-input" type="file" accept="image/*,.pdf" style={{ display: 'none' }} onChange={handleFile} />
              {preview ? (
                <img src={preview} alt="Documento" style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'contain' }} />
              ) : (
                <>
                  <p style={{ fontSize: '0.875rem', color: '#888', marginBottom: '0.25rem' }}>Clic para subir documento</p>
                  <p style={{ fontSize: '0.75rem', color: '#C9A84C' }}>JPG, PNG o PDF - max 5MB</p>
                </>
              )}
            </div>
          </div>

          <div style={{ padding: '1.5rem', background: '#fafafa', border: '1px solid #eee', borderLeft: '4px solid #C9A84C' }}>
            <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#111', marginBottom: '1rem' }}>Politicas DSM Market v1.0</h3>
            <ul style={{ fontSize: '0.8rem', color: '#555', lineHeight: 1.8, paddingLeft: '1.25rem', marginBottom: '1.25rem' }}>
              <li>DSM Market cobra 5% de comision por venta exitosa</li>
              <li>El dinero queda retenido 7 dias despues de la entrega</li>
              <li>Debes subir la guia de envio dentro de 48 horas del pago</li>
              <li>Sin guia de envio no se libera el pago</li>
              <li>Productos falsos o fraudes resultan en suspension inmediata</li>
            </ul>
            <a href="/politicas" target="_blank" style={{ fontSize: '0.75rem', color: '#C9A84C', textDecoration: 'none' }}>
              Leer politicas completas
            </a>
          </div>

          <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', cursor: 'pointer' }}>
            <input type="checkbox" checked={accepted} onChange={e => setAccepted(e.target.checked)}
              style={{ marginTop: '2px', width: '16px', height: '16px', flexShrink: 0, accentColor: '#C9A84C' }} />
            <span style={{ fontSize: '0.8rem', color: '#555', lineHeight: 1.6 }}>
              He leido y acepto los terminos y politicas de DSM Market. Confirmo que mi documento es verdadero.
            </span>
          </label>

          <button type="submit" disabled={loading || !accepted || !docFile}
            style={{ width: '100%', padding: '1rem', background: loading || !accepted || !docFile ? '#e5e5e5' : '#C9A84C', color: loading || !accepted || !docFile ? '#999' : '#fff', border: 'none', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', cursor: loading || !accepted || !docFile ? 'not-allowed' : 'pointer' }}>
            {loading ? 'Enviando...' : 'Enviar verificacion'}
          </button>
        </form>
      </div>
    </div>
  )
}
