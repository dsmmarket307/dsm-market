'use client'
import { useRouter } from 'next/navigation'

export default function FailurePage() {
  const router = useRouter()
  return (
    <div style={{ minHeight: '100vh', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif' }}>
      <div style={{ textAlign: 'center', maxWidth: '480px', padding: '2rem' }}>
        <div style={{ width: '64px', height: '64px', background: '#fff5f5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
          <span style={{ fontSize: '2rem', color: '#dc2626' }}>x</span>
        </div>
        <p style={{ fontSize: '0.65rem', letterSpacing: '3px', textTransform: 'uppercase', color: '#dc2626', marginBottom: '0.5rem' }}>Pago fallido</p>
        <h1 style={{ fontSize: '2rem', fontWeight: 300, color: '#111', marginBottom: '1rem' }}>No se proceso el pago</h1>
        <p style={{ fontSize: '0.875rem', color: '#666', lineHeight: 1.7, marginBottom: '2rem' }}>
          Hubo un problema con tu pago. Por favor intenta de nuevo.
        </p>
        <button onClick={() => router.push('/checkout')} style={{ padding: '0.875rem 2rem', background: '#C9A84C', color: '#fff', border: 'none', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', cursor: 'pointer' }}>
          Intentar de nuevo
        </button>
      </div>
    </div>
  )
}
