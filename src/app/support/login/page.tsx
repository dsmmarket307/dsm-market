'use client'

import { useState, Suspense } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'

function SupportLoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(
    searchParams.get('error') === 'no_access'
      ? 'No tienes acceso como agente de soporte.'
      : ''
  )

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    await supabase.auth.signOut()

    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password })

    if (authError || !data.user) {
      setError('Credenciales incorrectas. Verifica tu email y contrasena.')
      setLoading(false)
      return
    }

    window.location.href = '/support/dashboard'
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#080808',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      padding: '1rem',
    }}>
      <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <div style={{
          position: 'absolute', top: '-20%', left: '-10%',
          width: 600, height: 600,
          background: 'radial-gradient(circle, rgba(212,175,55,0.04) 0%, transparent 70%)',
          borderRadius: '50%'
        }} />
        <div style={{
          position: 'absolute', bottom: '-20%', right: '-10%',
          width: 500, height: 500,
          background: 'radial-gradient(circle, rgba(212,175,55,0.03) 0%, transparent 70%)',
          borderRadius: '50%'
        }} />
      </div>

      <div style={{ width: '100%', maxWidth: 420, position: 'relative' }}>
        <div style={{
          background: '#0f0f0f',
          border: '1px solid rgba(212,175,55,0.15)',
          borderRadius: 20,
          padding: '2.5rem 2rem',
          boxShadow: '0 25px 80px rgba(0,0,0,0.6)',
        }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: 56, height: 56,
              background: 'rgba(212,175,55,0.1)',
              border: '1px solid rgba(212,175,55,0.25)',
              borderRadius: 16,
              marginBottom: '1rem',
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="1.5">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
            </div>
            <p style={{ fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', color: '#D4AF37', margin: '0 0 4px', fontWeight: 600 }}>
              DMS Market
            </p>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff', margin: '0 0 6px' }}>
              Portal de Soporte
            </h1>
            <p style={{ fontSize: 13, color: '#555', margin: 0 }}>
              Acceso exclusivo para agentes
            </p>
          </div>

          <div style={{ height: 1, background: 'rgba(212,175,55,0.08)', marginBottom: '1.75rem' }} />

          {error && (
            <div style={{
              padding: '0.75rem 1rem',
              background: 'rgba(239,68,68,0.08)',
              border: '1px solid rgba(239,68,68,0.2)',
              borderRadius: 10,
              marginBottom: '1.25rem',
              display: 'flex', alignItems: 'center', gap: '0.5rem'
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <p style={{ color: '#EF4444', fontSize: 12, margin: 0 }}>{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: 11, color: '#888', letterSpacing: 1, textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                Correo corporativo
              </label>
              <div style={{ position: 'relative' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2"
                  style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}>
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="agente@dmsmarket.com"
                  required
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    padding: '0.75rem 0.875rem 0.75rem 2.25rem',
                    background: '#151515',
                    border: '1px solid rgba(212,175,55,0.15)',
                    borderRadius: 10,
                    color: '#fff', fontSize: 13, outline: 'none',
                    transition: 'border-color .2s',
                  }}
                  onFocus={e => e.target.style.borderColor = 'rgba(212,175,55,0.4)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(212,175,55,0.15)'}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: 11, color: '#888', letterSpacing: 1, textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                Contrasena
              </label>
              <div style={{ position: 'relative' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2"
                  style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}>
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    padding: '0.75rem 0.875rem 0.75rem 2.25rem',
                    background: '#151515',
                    border: '1px solid rgba(212,175,55,0.15)',
                    borderRadius: 10,
                    color: '#fff', fontSize: 13, outline: 'none',
                    transition: 'border-color .2s',
                  }}
                  onFocus={e => e.target.style.borderColor = 'rgba(212,175,55,0.4)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(212,175,55,0.15)'}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: '0.5rem',
                padding: '0.875rem',
                background: loading ? '#1a1a1a' : 'linear-gradient(135deg, #D4AF37, #B8960C)',
                border: 'none',
                borderRadius: 10,
                color: loading ? '#555' : '#000',
                fontSize: 14,
                fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all .2s',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              }}
            >
              {loading ? (
                <>
                  <div style={{ width: 14, height: 14, border: '2px solid #555', borderTopColor: '#888', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
                  Verificando...
                </>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                    <polyline points="10 17 15 12 10 7"/>
                    <line x1="15" y1="12" x2="3" y2="12"/>
                  </svg>
                  Ingresar al Portal
                </>
              )}
            </button>
          </form>

          <div style={{ marginTop: '1.75rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
            <p style={{ fontSize: 11, color: '#444', margin: 0 }}>
              Problemas de acceso?{' '}
              <a href="mailto:admin@dmsmarket.com" style={{ color: '#D4AF37', textDecoration: 'none' }}>
                Contacta al admin
              </a>
            </p>
          </div>
        </div>

        <p style={{ textAlign: 'center', fontSize: 11, color: '#333', marginTop: '1.25rem' }}>
          2025 DMS Market - Portal Corporativo de Soporte
        </p>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input::placeholder { color: #444; }
      `}</style>
    </div>
  )
}

export default function SupportLoginPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#080808' }} />}>
      <SupportLoginForm />
    </Suspense>
  )
}

