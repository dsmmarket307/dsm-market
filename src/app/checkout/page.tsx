'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const ZONAS: Record<string, { rango: string; zona: string }> = {
  'bogota': { rango: '$8,000 - $14,000', zona: 'Urbana' },
  'bogotá': { rango: '$8,000 - $14,000', zona: 'Urbana' },
  'medellin': { rango: '$8,000 - $14,000', zona: 'Urbana' },
  'medellín': { rango: '$8,000 - $14,000', zona: 'Urbana' },
  'cali': { rango: '$8,000 - $14,000', zona: 'Urbana' },
  'barranquilla': { rango: '$8,000 - $14,000', zona: 'Urbana' },
  'bucaramanga': { rango: '$8,000 - $14,000', zona: 'Urbana' },
  'pereira': { rango: '$12,000 - $18,000', zona: 'Zonal' },
  'manizales': { rango: '$12,000 - $18,000', zona: 'Zonal' },
  'armenia': { rango: '$12,000 - $18,000', zona: 'Zonal' },
  'ibague': { rango: '$12,000 - $18,000', zona: 'Zonal' },
  'ibagué': { rango: '$12,000 - $18,000', zona: 'Zonal' },
  'cartagena': { rango: '$12,000 - $18,000', zona: 'Zonal' },
  'cucuta': { rango: '$12,000 - $18,000', zona: 'Zonal' },
  'cúcuta': { rango: '$12,000 - $18,000', zona: 'Zonal' },
  'santa marta': { rango: '$12,000 - $18,000', zona: 'Zonal' },
  'villavicencio': { rango: '$12,000 - $18,000', zona: 'Zonal' },
  'neiva': { rango: '$12,000 - $18,000', zona: 'Zonal' },
  'palmira': { rango: '$12,000 - $18,000', zona: 'Zonal' },
  'bello': { rango: '$12,000 - $18,000', zona: 'Zonal' },
  'soledad': { rango: '$12,000 - $18,000', zona: 'Zonal' },
  'soacha': { rango: '$12,000 - $18,000', zona: 'Zonal' },
  'pasto': { rango: '$15,000 - $22,000', zona: 'Territorial' },
  'monteria': { rango: '$15,000 - $22,000', zona: 'Territorial' },
  'montería': { rango: '$15,000 - $22,000', zona: 'Territorial' },
  'popayan': { rango: '$15,000 - $22,000', zona: 'Territorial' },
  'popayán': { rango: '$15,000 - $22,000', zona: 'Territorial' },
  'sincelejo': { rango: '$15,000 - $22,000', zona: 'Territorial' },
  'valledupar': { rango: '$15,000 - $22,000', zona: 'Territorial' },
  'tunja': { rango: '$15,000 - $22,000', zona: 'Territorial' },
  'riohacha': { rango: '$15,000 - $22,000', zona: 'Territorial' },
  'florencia': { rango: '$15,000 - $22,000', zona: 'Territorial' },
  'yopal': { rango: '$15,000 - $22,000', zona: 'Territorial' },
  'quibdo': { rango: '$15,000 - $22,000', zona: 'Territorial' },
  'quibdó': { rango: '$15,000 - $22,000', zona: 'Territorial' },
}

const TRANSPORTADORAS = [
  'Selecciona la transportadora',
  'Servientrega',
  'Interrapidísimo',
  'Envia',
  'TCC',
  'Coordinadora',
  'Deprisa',
  'Veloces',
  'La Libertad',
  'Otro',
]

function getFleteInfo(ciudad: string) {
  const key = ciudad.trim().toLowerCase()
  return ZONAS[key] || { rango: '$22,000 - $42,000', zona: 'Especial' }
}

export default function CheckoutPage() {
  const router = useRouter()
  const supabase = createClient()
  const [item, setItem] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [transportadora, setTransportadora] = useState('')
  const [fleteInfo, setFleteInfo] = useState<{ rango: string; zona: string } | null>(null)
  const [address, setAddress] = useState({
    nombre: '',
    telefono: '',
    direccion: '',
    ciudad: '',
    departamento: '',
    notas: '',
  })

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      const stored = sessionStorage.getItem('checkout_item')
      if (!stored) { router.push('/dashboard/buyer/products'); return }
      setItem(JSON.parse(stored))
      setLoading(false)
    }
    load()
  }, [])

  useEffect(() => {
    if (address.ciudad && transportadora && transportadora !== 'Selecciona la transportadora') {
      setFleteInfo(getFleteInfo(address.ciudad))
    } else {
      setFleteInfo(null)
    }
  }, [address.ciudad, transportadora])

  const subtotal = item ? item.price * item.quantity : 0
  const total = subtotal

  async function handleCheckout() {
    if (!address.nombre || !address.telefono || !address.direccion || !address.ciudad) {
      alert('Por favor completa todos los campos de envío')
      return
    }
    if (!transportadora || transportadora === 'Selecciona la transportadora') {
      alert('Por favor selecciona una transportadora')
      return
    }
    setProcessing(true)
    try {
      const res = await fetch('/api/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: [{
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
          }],
          shipping_cost: 0,
          shipping_address: { ...address, transportadora },
        }),
      })
      const data = await res.json()
      if (data.init_point) {
        sessionStorage.setItem('shipping_address', JSON.stringify({ ...address, transportadora }))
        window.location.href = data.init_point
      } else {
        alert('Error al procesar el pago')
        setProcessing(false)
      }
    } catch (error) {
      console.error(error)
      setProcessing(false)
    }
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif' }}>
      <p style={{ color: '#C9A84C', letterSpacing: '2px', fontSize: '0.875rem' }}>Cargando...</p>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#fff', fontFamily: 'sans-serif' }}>
      <nav style={{ borderBottom: '1px solid #f0f0f0', padding: '0 2rem', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff', position: 'sticky', top: 0, zIndex: 50 }}>
        <a href="/" style={{ color: '#C9A84C', fontWeight: 700, fontSize: '1.1rem', letterSpacing: '2px', textDecoration: 'none' }}>DMS</a>
        <span style={{ fontSize: '0.75rem', color: '#888', letterSpacing: '2px', textTransform: 'uppercase' }}>Checkout</span>
      </nav>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: 'clamp(1.5rem, 4vw, 3rem) clamp(1rem, 4vw, 2rem)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>

        <div>
          <div style={{ marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid #f0f0f0' }}>
            <p style={{ fontSize: '0.65rem', letterSpacing: '3px', textTransform: 'uppercase', color: '#C9A84C', marginBottom: '1rem' }}>Tu pedido</p>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', padding: '1rem', border: '1px solid #f0f0f0', borderRadius: '4px' }}>
              {item?.image && (
                <img src={item.image} alt={item.name} style={{ width: '64px', height: '64px', objectFit: 'cover', borderRadius: '4px', flexShrink: 0 }} />
              )}
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '0.875rem', fontWeight: 500, color: '#111', marginBottom: '0.25rem' }}>{item?.name}</p>
                <p style={{ fontSize: '0.75rem', color: '#aaa' }}>Cantidad: {item?.quantity}</p>
              </div>
              <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#111', whiteSpace: 'nowrap' }}>
                ${Number(subtotal).toLocaleString('es-CO')}
              </p>
            </div>
          </div>

          <p style={{ fontSize: '0.65rem', letterSpacing: '3px', textTransform: 'uppercase', color: '#C9A84C', marginBottom: '1rem' }}>Dirección de envío</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[
              { label: 'Nombre completo', key: 'nombre', placeholder: 'Tu nombre completo' },
              { label: 'Teléfono', key: 'telefono', placeholder: '300 000 0000' },
              { label: 'Dirección', key: 'direccion', placeholder: 'Calle, carrera, número, apartamento' },
              { label: 'Ciudad', key: 'ciudad', placeholder: 'Ej: Pereira, Bogotá, Cali...' },
              { label: 'Departamento', key: 'departamento', placeholder: 'Departamento' },
              { label: 'Notas adicionales (opcional)', key: 'notas', placeholder: 'Instrucciones especiales...' },
            ].map(field => (
              <div key={field.key}>
                <label style={{ display: 'block', fontSize: '0.65rem', letterSpacing: '2px', textTransform: 'uppercase', color: '#888', marginBottom: '0.5rem' }}>
                  {field.label}
                </label>
                <input
                  value={address[field.key as keyof typeof address]}
                  onChange={e => setAddress(prev => ({ ...prev, [field.key]: e.target.value }))}
                  placeholder={field.placeholder}
                  style={{ width: '100%', padding: '0.75rem 1rem', border: '1px solid #ddd', fontSize: '0.875rem', color: '#111', outline: 'none', background: '#fafafa', boxSizing: 'border-box' }}
                  onFocus={e => { e.target.style.borderColor = '#C9A84C'; e.target.style.background = '#fff' }}
                  onBlur={e => { e.target.style.borderColor = '#ddd'; e.target.style.background = '#fafafa' }}
                />
              </div>
            ))}

            <div>
              <label style={{ display: 'block', fontSize: '0.65rem', letterSpacing: '2px', textTransform: 'uppercase', color: '#888', marginBottom: '0.5rem' }}>
                Elige tu transportadora
              </label>
              <select
                value={transportadora}
                onChange={e => setTransportadora(e.target.value)}
                style={{ width: '100%', padding: '0.75rem 1rem', border: '1px solid #ddd', fontSize: '0.875rem', color: '#111', outline: 'none', background: '#fafafa', boxSizing: 'border-box', borderRadius: '6px' }}
                onFocus={e => (e.target.style.borderColor = '#C9A84C')}
                onBlur={e => (e.target.style.borderColor = '#ddd')}
              >
                {TRANSPORTADORAS.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>

              {fleteInfo && (
                <div style={{ background: '#fffbf0', border: '1px solid #C9A84C', borderRadius: '8px', padding: '0.875rem 1rem', marginTop: '0.75rem' }}>
                  <p style={{ fontSize: '0.82rem', fontWeight: 700, color: '#111', marginBottom: '0.3rem' }}>
                    Flete estimado: <span style={{ color: '#C9A84C' }}>{fleteInfo.rango} COP</span>
                  </p>
                  <p style={{ fontSize: '0.75rem', color: '#888', lineHeight: 1.5 }}>
                    El flete lo pagas en efectivo al recibir tu pedido. Este valor no está incluido en el total.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div>
          <div style={{ border: '1px solid #eee', borderTop: '3px solid #C9A84C', padding: '1.5rem', position: 'sticky', top: '80px' }}>
            <p style={{ fontSize: '0.65rem', letterSpacing: '3px', textTransform: 'uppercase', color: '#888', marginBottom: '1.5rem' }}>Resumen</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                <span style={{ color: '#666' }}>Subtotal</span>
                <span style={{ color: '#111' }}>${subtotal.toLocaleString('es-CO')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                <span style={{ color: '#666' }}>Flete</span>
                <span style={{ color: '#C9A84C', fontSize: '0.8rem' }}>
                  {fleteInfo ? fleteInfo.rango + ' COP' : 'Escribe tu ciudad'}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 0', borderTop: '2px solid #111', marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#111' }}>Total producto</span>
              <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111' }}>${total.toLocaleString('es-CO')}</span>
            </div>

            <button onClick={handleCheckout} disabled={processing}
              style={{ width: '100%', padding: '1rem', background: processing ? '#e5e5e5' : '#C9A84C', color: processing ? '#999' : '#fff', border: 'none', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase', cursor: processing ? 'not-allowed' : 'pointer', borderRadius: '999px', boxShadow: processing ? 'none' : '0 4px 20px rgba(201,168,76,0.4)' }}>
              {processing ? 'Procesando...' : 'Pagar con MercadoPago'}
            </button>

            <div style={{ marginTop: '1rem', padding: '0.75rem', background: '#f0faf4', borderRadius: '8px', border: '1px solid #c8e6c9' }}>
              <p style={{ fontSize: '0.7rem', color: '#2e7d32', textAlign: 'center', lineHeight: 1.6 }}>
                Tu pago es seguro. El dinero se libera al vendedor después de confirmar la entrega.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}