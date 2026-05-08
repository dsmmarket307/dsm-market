'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { login } from '@/lib/actions/auth'

function LoginForm() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect') || '/dashboard'

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    const result = await login(formData)
    if (result?.error) { setError(result.error); setLoading(false) }
  }

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <p style={{ fontSize: '0.65rem', letterSpacing: '3px', textTransform: 'uppercase', color: '#C9A84C', marginBottom: '0.5rem' }}>
          Bienvenido de vuelta
        </p>
        <h1 style={{ fontSize: '2rem', fontWeight: 300, color: '#111', marginBottom: '0.5rem' }}>
          Iniciar sesion
        </h1>
        <div style={{ width: '36px', height: '2px', background: '#C9A84C' }} />
      </div>

      {error && (
        <div style={{ marginBottom: '1.25rem', padding: '0.75rem 1rem', background: '#fff5f5', border: '1px solid #fecaca', color: '#dc2626', fontSize: '0.85rem', borderRadius: '4px' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <input type="hidden" name="redirectTo" value={redirectTo} />

        <div>
          <label style={{ display: 'block', fontSize: '0.65rem', letterSpacing: '2px', textTransform: 'uppercase', color: '#888', marginBottom: '0.5rem' }}>
            Correo electronico
          </label>
          <input
            name="email"
            type="email"
            required
            placeholder="tu@correo.com"
            style={{ width: '100%', padding: '0.75rem 1rem', border: '1px solid #ddd', fontSize: '0.875rem', color: '#111', outline: 'none', background: '#fafafa', boxSizing: 'border-box' }}
            onFocus={(e) => { e.target.style.borderColor = '#C9A84C'; e.target.style.background = '#fff' }}
            onBlur={(e) => { e.target.style.borderColor = '#ddd'; e.target.style.background = '#fafafa' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.65rem', letterSpacing: '2px', textTransform: 'uppercase', color: '#888', marginBottom: '0.5rem' }}>
            Contrasena
          </label>
          <input
            name="password"
            type="password"
            required
            placeholder="········"
            style={{ width: '100%', padding: '0.75rem 1rem', border: '1px solid #ddd', fontSize: '0.875rem', color: '#111', outline: 'none', background: '#fafafa', boxSizing: 'border-box' }}
            onFocus={(e) => { e.target.style.borderColor = '#C9A84C'; e.target.style.background = '#fff' }}
            onBlur={(e) => { e.target.style.borderColor = '#ddd'; e.target.style.background = '#fafafa' }}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Link href="/auth/forgot-password" style={{ fontSize: '0.75rem', color: '#aaa', textDecoration: 'none' }}>
            Olvidaste tu contrasena?
          </Link>
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{ width: '100%', padding: '0.875rem', background: loading ? '#e5e5e5' : '#C9A84C', color: loading ? '#999' : '#fff', border: 'none', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase', cursor: loading ? 'not-allowed' : 'pointer' }}
        >
          {loading ? 'Ingresando...' : 'Ingresar'}
        </button>
      </form>

      <div style={{ margin: '1.5rem 0', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ flex: 1, height: '1px', background: '#eee' }} />
        <span style={{ fontSize: '0.65rem', color: '#ccc', letterSpacing: '2px' }}>o</span>
        <div style={{ flex: 1, height: '1px', background: '#eee' }} />
      </div>

      <p style={{ textAlign: 'center', fontSize: '0.875rem', color: '#888' }}>
        No tienes cuenta?{' '}
        <Link href={`/auth/register?redirect=${redirectTo}`} style={{ color: '#C9A84C', fontWeight: 600, textDecoration: 'none' }}>
          Crear cuenta
        </Link>
      </p>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <LoginForm />
    </Suspense>
  )
}