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
    <div style={{ minHeight: '100vh', background: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif', padding: '2rem' }}>

      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <p style={{ color: '#C9A84C', fontSize: '1.75rem', fontWeight: 700, letterSpacing: '4px', lineHeight: 1 }}>DMS</p>
        <p style={{ color: '#111', fontSize: '0.7rem', letterSpacing: '6px', textTransform: 'uppercase', marginTop: '4px' }}>MARKET</p>
      </div>

      {/* Tarjeta */}
      <div style={{ width: '100%', maxWidth: '480px', background: '#fff', border: '1px solid #e5e5e5', borderTop: '3px solid #C9A84C', padding: '2.5rem', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>

        <p style={{ fontSize: '0.65rem', letterSpacing: '3px', textTransform: 'uppercase', color: '#C9A84C', marginBottom: '0.5rem' }}>
          Nueva cuenta
        </p>
        <h1 style={{ fontSize: '2rem', fontWeight: 300, color: '#111', marginBottom: '0.5rem' }}>
          Registrarse
        </h1>
        <div style={{ width: '36px', height: '2px', background: '#C9A84C', marginBottom: '2rem' }} />

        {error && (
          <div style={{ marginBottom: '1.25rem', padding: '0.75rem 1rem', background: '#fff5f5', border: '1px solid #fecaca', color: '#dc2626', fontSize: '0.85rem', borderRadius: '4px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <input type="hidden" name="redirectTo" value={redirectTo} />

          {[
            { label: 'Nombre completo', name: 'name', type: 'text', placeholder: 'Tu nombre' },
            { label: 'Correo electronico', name: 'email', type: 'email', placeholder: 'tu@correo.com' },
          ].map(field => (
            <div key={field.name}>
              <label style={{ display: 'block', fontSize: '0.65rem', letterSpacing: '2px', textTransform: 'uppercase', color: '#888', marginBottom: '0.5rem' }}>
                {field.label}
              </label>
              <input
                name={field.name}
                type={field.type}
                required
                placeholder={field.placeholder}
                style={{ width: '100%', padding: '0.75rem 1rem', border: '1px solid #ddd', fontSize: '0.875rem', color: '#111', outline: 'none', background: '#fafafa', boxSizing: 'border-box' }}
                onFocus={(e) => { e.target.style.borderColor = '#C9A84C'; e.target.style.background = '#fff' }}
                onBlur={(e) => { e.target.style.borderColor = '#ddd'; e.target.style.background = '#fafafa' }}
              />
            </div>
          ))}

          <div>
            <label style={{ display: 'block', fontSize: '0.65rem', letterSpacing: '2px', textTransform: 'uppercase', color: '#888', marginBottom: '0.5rem' }}>
              Tipo de cuenta
            </label>
            <select
              name="role"
              defaultValue="buyer"
              style={{ width: '100%', padding: '0.75rem 1rem', border: '1px solid #ddd', fontSize: '0.875rem', color: '#111', outline: 'none', background: '#fafafa', boxSizing: 'border-box' }}
              onFocus={(e) => (e.target.style.borderColor = '#C9A84C')}
              onBlur={(e) => (e.target.style.borderColor = '#ddd')}
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
              <label style={{ display: 'block', fontSize: '0.65rem', letterSpacing: '2px', textTransform: 'uppercase', color: '#888', marginBottom: '0.5rem' }}>
                {field.label}
              </label>
              <input
                name={field.name}
                type="password"
                required
                placeholder={field.placeholder}
                style={{ width: '100%', padding: '0.75rem 1rem', border: '1px solid #ddd', fontSize: '0.875rem', color: '#111', outline: 'none', background: '#fafafa', boxSizing: 'border-box' }}
                onFocus={(e) => { e.target.style.borderColor = '#C9A84C'; e.target.style.background = '#fff' }}
                onBlur={(e) => { e.target.style.borderColor = '#ddd'; e.target.style.background = '#fafafa' }}
              />
            </div>
          ))}

          <button
            type="submit"
            disabled={loading}
            style={{ width: '100%', padding: '0.875rem', background: loading ? '#e5e5e5' : '#C9A84C', color: loading ? '#999' : '#fff', border: 'none', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase', cursor: loading ? 'not-allowed' : 'pointer', marginTop: '0.5rem' }}
          >
            {loading ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>
        </form>

        <p style={{ marginTop: '1.25rem', textAlign: 'center', fontSize: '0.7rem', color: '#bbb' }}>
          Al registrarte aceptas los terminos y politica de privacidad de DMS Market.
        </p>

        <div style={{ margin: '1.5rem 0', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ flex: 1, height: '1px', background: '#eee' }} />
          <span style={{ fontSize: '0.65rem', color: '#ccc', letterSpacing: '2px' }}>o</span>
          <div style={{ flex: 1, height: '1px', background: '#eee' }} />
        </div>

        <p style={{ textAlign: 'center', fontSize: '0.875rem', color: '#888' }}>
          Ya tienes cuenta?{' '}
          <Link href={`/auth/login?redirect=${redirectTo}`} style={{ color: '#C9A84C', fontWeight: 600, textDecoration: 'none' }}>
            Iniciar sesion
          </Link>
        </p>
      </div>

      {/* Footer */}
      <p style={{ marginTop: '2rem', fontSize: '0.7rem', color: '#ccc' }}>
        2025 DMS Market. Colombia
      </p>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Cargando...</div>}>
      <RegisterForm />
    </Suspense>
  )
}