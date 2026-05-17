'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { register } from '@/lib/actions/auth'

function RegisterForm() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect') || '/dashboard'

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)
    const password = formData.get('password') as string
    const confirmPassword = formData.get('confirmPassword') as string
    if (password !== confirmPassword) { setError('Las contrasenas no coinciden'); return }
    if (password.length < 6) { setError('Minimo 6 caracteres'); return }
    setLoading(true)
    const result = await register(formData)
    if (result?.error) { setError(result.error); setLoading(false) }
  }

  return (
    <div>
      <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <p style={{ fontSize: '0.65rem', letterSpacing: '3px', textTransform: 'uppercase', color: '#D4AF37', marginBottom: '0.5rem', fontWeight: 600 }}>Nueva cuenta</p>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#fff', marginBottom: '0.5rem' }}>Registrarse</h1>
        <div style={{ width: '36px', height: '2px', background: '#D4AF37', margin: '0 auto' }} />
      </div>

      {error && (
        <div style={{ marginBottom: '1.25rem', padding: '0.75rem 1rem', background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.3)', color: '#f87171', fontSize: '0.85rem', borderRadius: '8px' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <input type="hidden" name="redirectTo" value={redirectTo} />

        {[
          { label: 'Nombre completo', name: 'name', type: 'text', placeholder: 'Tu nombre' },
          { label: 'Correo electronico', name: 'email', type: 'email', placeholder: 'tu@correo.com' },
        ].map(field => (
          <div key={field.name}>
            <label style={{ display: 'block', fontSize: '0.65rem', letterSpacing: '2px', textTransform: 'uppercase', color: '#888', marginBottom: '0.5rem' }}>{field.label}</label>
            <input name={field.name} type={field.type} required placeholder={field.placeholder}
              style={{ width: '100%', padding: '0.75rem 1rem', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', fontSize: '0.875rem', color: '#fff', outline: 'none', background: '#151515', boxSizing: 'border-box' }}
              onFocus={e => { e.target.style.borderColor = '#D4AF37' }}
              onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)' }}
            />
          </div>
        ))}

        <div>
          <label style={{ display: 'block', fontSize: '0.65rem', letterSpacing: '2px', textTransform: 'uppercase', color: '#888', marginBottom: '0.5rem' }}>Tipo de cuenta</label>
          <select name="role" defaultValue="buyer"
            style={{ width: '100%', padding: '0.75rem 1rem', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', fontSize: '0.875rem', color: '#fff', outline: 'none', background: '#151515', boxSizing: 'border-box' }}
            onFocus={e => { e.target.style.borderColor = '#D4AF37' }}
            onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)' }}
          >
            <option value="buyer">Comprador</option>
            <option value="seller">Vendedor</option>
          </select>
        </div>

        {[
          { label: 'Contrasena', name: 'password', placeholder: 'Minimo 6 caracteres' },
          { label: 'Confirmar contrasena', name: 'confirmPassword', placeholder: 'Repite la contrasena' },
        ].map(field => (
          <div key={field.name}>
            <label style={{ display: 'block', fontSize: '0.65rem', letterSpacing: '2px', textTransform: 'uppercase', color: '#888', marginBottom: '0.5rem' }}>{field.label}</label>
            <input name={field.name} type="password" required placeholder={field.placeholder}
              style={{ width: '100%', padding: '0.75rem 1rem', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', fontSize: '0.875rem', color: '#fff', outline: 'none', background: '#151515', boxSizing: 'border-box' }}
              onFocus={e => { e.target.style.borderColor = '#D4AF37' }}
              onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)' }}
            />
          </div>
        ))}

        <button type="submit" disabled={loading}
          style={{ width: '100%', padding: '0.875rem', background: loading ? '#333' : '#D4AF37', color: loading ? '#999' : '#0B0B0B', border: 'none', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase', cursor: loading ? 'not-allowed' : 'pointer', borderRadius: '8px', marginTop: '0.5rem', boxShadow: loading ? 'none' : '0 4px 20px rgba(212,175,55,0.3)' }}>
          {loading ? 'Creando cuenta...' : 'Crear cuenta'}
        </button>
      </form>

      <p style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.7rem', color: '#555' }}>
        Al registrarte aceptas los terminos y politica de privacidad de DMS Market.
      </p>

      <div style={{ margin: '1.5rem 0', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
        <span style={{ fontSize: '0.65rem', color: '#555', letterSpacing: '2px' }}>o</span>
        <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
      </div>

      <p style={{ textAlign: 'center', fontSize: '0.875rem', color: '#666' }}>
        Ya tienes cuenta?{' '}
        <Link href={`/auth/login?redirect=${redirectTo}`} style={{ color: '#D4AF37', fontWeight: 600, textDecoration: 'none' }}>
          Iniciar sesion
        </Link>
      </p>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f0f0f' }}>Cargando...</div>}>
      <RegisterForm />
    </Suspense>
  )
}