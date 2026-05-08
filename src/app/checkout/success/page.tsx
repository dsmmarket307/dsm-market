'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function SuccessPage() {
  const router = useRouter()
  useEffect(() => {
    setTimeout(() => router.push('/dashboard/buyer'), 5000)
  }, [])

  return (
    <div style={{ minHeight: '100vh', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif' }}>
      <div style={{ textAlign: 'center', maxWidth: '480px', padding: '2rem' }}>
        <div style={{ width: '64px', height: '64px', background: '#e8f5e9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
          <span style={{ fontSize: '2rem', color: '#1D9E75' }}>?</span>
        </div>
        <p style={{ fontSize: '0.65rem', letterSpacing: '3px', textTransform: 'uppercase', color: '#C9A84C', marginBottom: '0.5rem' }}>Pago exitoso</p>
        <h1 style={{ fontSize: '2rem', fontWeight: 300, color: '#111', marginBottom: '1rem' }}>Compra confirmada</h1>
        <p style={{ fontSize: '0.875rem', color: '#666', lineHeight: 1.7, marginBottom: '2rem' }}>
          Tu pago fue procesado correctamente. El vendedor preparara tu pedido y el dinero quedara retenido hasta confirmar la entrega.
        </p>
        <p style={{ fontSize: '0.75rem', color: '#aaa' }}>Redirigiendo en 5 segundos...</p>
      </div>
    </div>
  )
}
