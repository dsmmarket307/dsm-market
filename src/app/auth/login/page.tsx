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
    <>
      <style>{`
        .login-left { display: flex; }
        .login-right { flex: 1; }
        @media (max-width: 768px) {
          .login-left { display: none; }
          .login-right { min-height: 100vh; justify-content: center; }
        }
      `}</style>
      <div style={{ minHeight: '100vh', background: '#0B0B0B', display: 'flex', fontFamily: "'Inter', sans-serif" }}>

        <div className="login-left" style={{ flex: 1, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '20%', left: '30%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(212,175,55,0.12) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
          <div style={{ position: 'relative', zIndex: 1, maxWidth: '420px', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '3rem' }}>
              <div style={{ width: '48px', height: '48px', background: 'linear-gradient(135deg, #D4AF37, #f5d77a)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.85rem', color: '#0B0B0B', letterSpacing: '1px' }}>DMS</div>
              <div>
                <p style={{ color: '#D4AF37', fontWeight: 800, fontSize: '1.1rem', margin: 0, letterSpacing: '1px' }}>DMS Market</p>
                <p style={{ color: '#888', fontSize: '0.6rem', margin: 0, letterSpacing: '3px', textTransform: 'uppercase' }}>Premium Commerce</p>
              </div>
            </div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 700, color: '#fff', marginBottom: '1rem', lineHeight: 1.2 }}>
              Bienvenido a<br /><span style={{ color: '#D4AF37' }}>DMS Market</span>
            </h1>
            <p style={{ color: '#888', fontSize: '1rem', lineHeight: 1.7, marginBottom: '3rem' }}>
              Compra y vende productos y servicios de forma rapida, moderna y segura.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {[
                { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>, title: 'Compras seguras', desc: 'Tu dinero protegido hasta la entrega' },
                { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>, title: 'Vendedores verificados', desc: 'Trabajamos solo con los mejores' },
                { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>, title: 'Marketplace moderno', desc: 'La nueva forma de comprar y vender' },
                { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>, title: 'Soporte 24/7', desc: 'Siempre disponibles para ayudarte' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '40px', height: '40px', background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.2)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{item.icon}</div>
                  <div>
                    <p style={{ color: '#fff', fontWeight: 600, fontSize: '0.875rem', margin: 0 }}>{item.title}</p>
                    <p style={{ color: '#666', fontSize: '0.75rem', margin: 0 }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="login-right" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', background: '#0f0f0f' }}>
          <div style={{ width: '100%', maxWidth: '420px', background: 'rgba(21,21,21,0.9)', border: '1px solid rgba(212,175,55,0.15)', borderRadius: '20px', padding: '2.5rem', boxShadow: '0 0 60px rgba(212,175,55,0.05)' }}>
            <div style={{ marginBottom: '2rem' }}>
              <p style={{ fontSize: '0.65rem', letterSpacing: '3px', textTransform: 'uppercase', color: '#D4AF37', marginBottom: '0.5rem', fontWeight: 600 }}>Bienvenido de vuelta</p>
              <h2 style={{ fontSize: '2rem', fontWeight: 700, color: '#fff', margin: 0 }}>Iniciar sesion</h2>
              <p style={{ color: '#666', fontSize: '0.875rem', marginTop: '0.5rem' }}>Ingresa a tu cuenta para continuar</p>
            </div>

            {error && (
              <div style={{ marginBottom: '1.25rem', padding: '0.875rem 1rem', background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.3)', color: '#f87171', fontSize: '0.85rem', borderRadius: '10px' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <input type="hidden" name="redirectTo" value={redirectTo} />
              <div>
                <label style={{ display: 'block', fontSize: '0.65rem', letterSpacing: '2px', textTransform: 'uppercase', color: '#888', marginBottom: '0.5rem' }}>Correo electronico</label>
                <input name="email" type="email" required placeholder="tu@correo.com"
                  style={{ width: '100%', padding: '0.875rem 1rem', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', fontSize: '0.875rem', color: '#fff', outline: 'none', background: '#151515', boxSizing: 'border-box' }}
                  onFocus={e => e.target.style.borderColor = '#D4AF37'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.65rem', letterSpacing: '2px', textTransform: 'uppercase', color: '#888', marginBottom: '0.5rem' }}>Contrasena</label>
                <div style={{ position: 'relative' }}>
                  <input name="password" type={showPassword ? 'text' : 'password'} required placeholder="••••••••"
                    style={{ width: '100%', padding: '0.875rem 3rem 0.875rem 1rem', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', fontSize: '0.875rem', color: '#fff', outline: 'none', background: '#151515', boxSizing: 'border-box' }}
                    onFocus={e => e.target.style.borderColor = '#D4AF37'}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
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
                <Link href="/auth/forgot-password" style={{ fontSize: '0.75rem', color: '#D4AF37', textDecoration: 'none' }}>Olvidaste tu contrasena?</Link>
              </div>
              <button type="submit" disabled={loading}
                style={{ width: '100%', padding: '1rem', background: loading ? '#333' : '#D4AF37', color: loading ? '#999' : '#0B0B0B', border: 'none', fontSize: '0.875rem', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', cursor: loading ? 'not-allowed' : 'pointer', borderRadius: '10px', boxShadow: loading ? 'none' : '0 4px 20px rgba(212,175,55,0.3)' }}>
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
              <Link href={`/auth/register?redirect=${redirectTo}`} style={{ color: '#D4AF37', fontWeight: 600, textDecoration: 'none' }}>Crear cuenta</Link>
            </p>

            <div style={{ marginTop: '1.5rem', padding: '0.75rem', background: 'rgba(212,175,55,0.05)', border: '1px solid rgba(212,175,55,0.1)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              <p style={{ fontSize: '0.72rem', color: '#555', margin: 0 }}>Tu <span style={{ color: '#D4AF37' }}>seguridad</span> es nuestra prioridad</p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#0B0B0B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><p style={{ color: '#D4AF37' }}>Cargando...</p></div>}>
      <LoginForm />
    </Suspense>
  )
}
