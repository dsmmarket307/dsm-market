'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { login } from '@/lib/actions/auth'

function LoginForm() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
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
        <p style={{ fontSize: '0.65rem', letterSpacing: '3px', textTransform: 'uppercase', color: '#D4AF37', marginBottom: '0.5rem', fontWeight: 600 }}>
          Bienvenido de vuelta
        </p>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#fff', marginBottom: '0.5rem' }}>
          Iniciar sesion
        </h1>
        <div style={{ width: '36px', height: '2px', background: '#D4AF37' }} />
      </div>

      {error && (
        <div style={{ marginBottom: '1.25rem', padding: '0.75rem 1rem', background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.3)', color: '#f87171', fontSize: '0.85rem', borderRadius: '8px' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <input type="hidden" name="redirectTo" value={redirectTo} />

        <div>
          <label style={{ display: 'block', fontSize: '0.65rem', letterSpacing: '2px', textTransform: 'uppercase', color: '#888', marginBottom: '0.5rem' }}>
            Correo electronico
          </label>
          <input name="email" type="email" required placeholder="tu@correo.com"
            style={{ width: '100%', padding: '0.75rem 1rem', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', fontSize: '0.875rem', color: '#fff', outline: 'none', background: '#151515', boxSizing: 'border-box' }}
            onFocus={e => { e.target.style.borderColor = '#D4AF37' }}
            onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.65rem', letterSpacing: '2px', textTransform: 'uppercase', color: '#888', marginBottom: '0.5rem' }}>
            Contrasena
          </label>
          <div style={{ position: 'relative' }}>
            <input name="password" type={showPassword ? 'text' : 'password'} required placeholder="••••••••"
              style={{ width: '100%', padding: '0.75rem 3rem 0.75rem 1rem', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', fontSize: '0.875rem', color: '#fff', outline: 'none', background: '#151515', boxSizing: 'border-box' }}
              onFocus={e => { e.target.style.borderColor = '#D4AF37' }}
              onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)' }}
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)}
              style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#666', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              {showPassword
                ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              }
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Link href="/auth/forgot-password" style={{ fontSize: '0.75rem', color: '#D4AF37', textDecoration: 'none' }}>
            Olvidaste tu contrasena?
          </Link>
        </div>

        <button type="submit" disabled={loading}
          style={{ width: '100%', padding: '0.875rem', background: loading ? '#333' : '#D4AF37', color: loading ? '#999' : '#0B0B0B', border: 'none', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase', cursor: loading ? 'not-allowed' : 'pointer', borderRadius: '8px', boxShadow: loading ? 'none' : '0 4px 20px rgba(212,175,55,0.3)' }}>
          {loading ? 'Ingresando...' : 'Ingresar'}
        </button>
      </form>

      <div style={{ margin: '1.5rem 0', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
        <span style={{ fontSize: '0.65rem', color: '#555', letterSpacing: '2px' }}>o</span>
        <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
      </div>

      <p style={{ textAlign: 'center', fontSize: '0.875rem', color: '#666' }}>
        No tienes cuenta?{' '}
        <Link href={`/auth/register?redirect=${redirectTo}`} style={{ color: '#D4AF37', fontWeight: 600, textDecoration: 'none' }}>
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
