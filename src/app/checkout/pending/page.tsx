'use client'
import { useRouter } from 'next/navigation'

export default function PendingPage() {
  const router = useRouter()
  return (
    <div style={{ minHeight: '100vh', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif' }}>
      <div style={{ textAlign: 'center', maxWidth: '480px', padding: '2rem' }}>
        <div style={{ width: '64px', height: '64px', background: '#fffbeb', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
          <span style={{ fontSize: '2rem', color: '#C9A84C' }}>!</span>
        </div>
        <p style={{ fontSize: '0.65rem', letterSpacing: '3px', textTransform: 'uppercase', color: '#C9A84C', marginBottom: '0.5rem' }}>Pago pendiente</p>
        <h1 style={{ fontSize: '2rem', fontWeight: 300, color: '#111', marginBottom: '1rem' }}>Pago en proceso</h1>
        <p style={{ fontSize: '0.875rem', color: '#666', lineHeight: 1.7, marginBottom: '2rem' }}>
          Tu pago esta siendo procesado. Te notificaremos cuando se confirme.
        </p>
        <button onClick={() => router.push('/dashboard/buyer')} style={{ padding: '0.875rem 2rem', background: '#C9A84C', color: '#fff', border: 'none', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', cursor: 'pointer' }}>
          Ir a mi panel
        </button>
      </div>
    </div>
  )
}
