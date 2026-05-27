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
  const [variantesSeleccionadas, setVariantesSeleccionadas] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [transportadora, setTransportadora] = useState('')
  const [fleteInfo, setFleteInfo] = useState<{ rango: string; zona: string } | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [address, setAddress] = useState({
    nombre: '', telefono: '', direccion: '', ciudad: '', departamento: '', notas: '',
  })

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      setUserId(user.id)
      const params = new URLSearchParams(window.location.search)
      const productId = params.get('id')
      const qty = parseInt(params.get('qty') ?? '1')
      const variantes = params.get('variantes') ?? ''
      setVariantesSeleccionadas(variantes)
      if (productId) {
        const { data: p } = await supabase.from('products').select('id, name, price').eq('id', productId).single()
        const { data: imgs } = await supabase.from('product_images').select('url').eq('product_id', productId).order('position').limit(1)
        if (p) {
          setItem({ id: p.id, name: p.name, price: p.price, quantity: qty, image: imgs?.[0]?.url ?? null })
        } else { router.push('/'); return }
      } else {
        const stored = sessionStorage.getItem('checkout_item')
        if (stored) { setItem(JSON.parse(stored)) } else { router.push('/'); return }
      }
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

  const variantesArray = variantesSeleccionadas
    ? variantesSeleccionadas.split('|').filter(Boolean).map(v => {
        const [nombre, opcion] = v.split(':')
        return { nombre, opcion }
      })
    : []

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
          items: [{ id: item.id, name: item.name, price: item.price, quantity: item.quantity, variantes: variantesSeleccionadas }],
          shipping_cost: 0,
          shipping_address: { ...address, transportadora },
          buyer_id: userId,
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
      <p style={{ color: '#D4AF37', letterSpacing: '2px', fontSize: '0.875rem' }}>Cargando...</p>
    </div>
  )

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '0.75rem 1rem', border: '1px solid #ddd',
    fontSize: '0.875rem', color: '#111', outline: 'none',
    background: '#fafafa', boxSizing: 'border-box', borderRadius: '8px',
    fontFamily: 'sans-serif',
  }

  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: '0.65rem', letterSpacing: '2px',
    textTransform: 'uppercase', color: '#888', marginBottom: '0.5rem',
  }

  return (
    <div style={{ minHeight: '100vh', background: '#fff', fontFamily: "'Segoe UI', sans-serif" }}>
      <nav style={{ padding: '0 clamp(1rem, 4vw, 2.5rem)', height: '68px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, background: '#0B0B0B', zIndex: 50, boxShadow: '0 2px 20px rgba(0,0,0,0.3)' }}>
        <a href="/"><img src="https://awbepztacmvurjylfoas.supabase.co/storage/v1/object/public/assets/ChatGPT_Image_3_may_2026__21_13_12-removebg-preview.png" alt="DMS Market" style={{ height: '52px', width: 'auto', objectFit: 'contain' }} /></a>
        <span style={{ fontSize: '0.75rem', color: '#888', letterSpacing: '2px', textTransform: 'uppercase' }}>Checkout seguro</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          <span style={{ fontSize: '0.75rem', color: '#D4AF37' }}>Pago seguro</span>
        </div>
      </nav>

      <div style={{ background: '#f8f8f8', padding: '0.75rem clamp(1rem, 4vw, 2.5rem)', borderBottom: '1px solid #eee' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#888' }}>
          <a href="/" style={{ color: '#888', textDecoration: 'none' }}>Inicio</a><span>/</span>
          <span style={{ color: '#111' }}>Checkout</span>
        </div>
      </div>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: 'clamp(1.5rem, 4vw, 3rem) clamp(1rem, 4vw, 2rem)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
        <div>
          <div style={{ marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid #f0f0f0' }}>
            <p style={{ fontSize: '0.65rem', letterSpacing: '3px', textTransform: 'uppercase', color: '#D4AF37', marginBottom: '1rem' }}>Tu pedido</p>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', padding: '1rem', border: '1px solid #eee', borderRadius: '12px' }}>
              {item?.image && <img src={item.image} alt={item.name} style={{ width: '72px', height: '72px', objectFit: 'cover', borderRadius: '8px', flexShrink: 0 }} />}
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#111', marginBottom: '0.25rem' }}>{item?.name}</p>
                <p style={{ fontSize: '0.75rem', color: '#aaa' }}>Cantidad: {item?.quantity}</p>
                {variantesArray.length > 0 && (
                  <div style={{ marginTop: '0.4rem', display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                    {variantesArray.map((v, i) => (
                      <span key={i} style={{ fontSize: '0.7rem', background: '#fffbf0', border: '1px solid rgba(212,175,55,.4)', color: '#0B0B0B', padding: '2px 8px', borderRadius: '6px', fontWeight: 600 }}>
                        {v.nombre}: {v.opcion}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <p style={{ fontSize: '1rem', fontWeight: 700, color: '#111', whiteSpace: 'nowrap' }}>${Number(subtotal).toLocaleString('es-CO')}</p>
            </div>
          </div>

          <p style={{ fontSize: '0.65rem', letterSpacing: '3px', textTransform: 'uppercase', color: '#D4AF37', marginBottom: '1rem' }}>Dirección de envío</p>
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
                <label style={labelStyle}>{field.label}</label>
                <input value={address[field.key as keyof typeof address]}
                  onChange={e => setAddress(prev => ({ ...prev, [field.key]: e.target.value }))}
                  placeholder={field.placeholder} style={inputStyle}
                  onFocus={e => { e.target.style.borderColor = '#D4AF37'; e.target.style.background = '#fff' }}
                  onBlur={e => { e.target.style.borderColor = '#ddd'; e.target.style.background = '#fafafa' }} />
              </div>
            ))}
            <div>
              <label style={labelStyle}>Elige tu transportadora</label>
              <select value={transportadora} onChange={e => setTransportadora(e.target.value)}
                style={{ ...inputStyle, cursor: 'pointer' }}
                onFocus={e => { e.target.style.borderColor = '#D4AF37' }}
                onBlur={e => { e.target.style.borderColor = '#ddd' }}>
                {TRANSPORTADORAS.map(t => (<option key={t} value={t}>{t}</option>))}
              </select>
              {fleteInfo && (
                <div style={{ background: '#fffbf0', border: '1px solid rgba(212,175,55,.3)', borderRadius: '8px', padding: '0.875rem 1rem', marginTop: '0.75rem' }}>
                  <p style={{ fontSize: '0.82rem', fontWeight: 700, color: '#111', marginBottom: '0.3rem' }}>
                    Flete estimado: <span style={{ color: '#D4AF37' }}>{fleteInfo.rango} COP</span>
                  </p>
                  <p style={{ fontSize: '0.75rem', color: '#888', lineHeight: 1.5 }}>El flete lo pagas en efectivo al recibir tu pedido. Este valor no está incluido en el total.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div>
          <div style={{ border: '1px solid #eee', borderTop: '3px solid #D4AF37', padding: '1.5rem', position: 'sticky', top: '80px', borderRadius: '12px' }}>
            <p style={{ fontSize: '0.65rem', letterSpacing: '3px', textTransform: 'uppercase', color: '#888', marginBottom: '1.5rem' }}>Resumen</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                <span style={{ color: '#666' }}>Subtotal</span>
                <span style={{ color: '#111' }}>${subtotal.toLocaleString('es-CO')}</span>
              </div>
              {variantesArray.length > 0 && variantesArray.map((v, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                  <span style={{ color: '#888' }}>{v.nombre}</span>
                  <span style={{ color: '#D4AF37', fontWeight: 600 }}>{v.opcion}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                <span style={{ color: '#666' }}>Flete</span>
                <span style={{ color: '#D4AF37', fontSize: '0.8rem' }}>{fleteInfo ? fleteInfo.rango + ' COP' : 'Escribe tu ciudad'}</span>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 0', borderTop: '2px solid #111', marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#111' }}>Total producto</span>
              <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111' }}>${total.toLocaleString('es-CO')}</span>
            </div>
            <button onClick={handleCheckout} disabled={processing}
              style={{ width: '100%', padding: '1rem', background: processing ? '#ccc' : '#D4AF37', color: processing ? '#999' : '#0B0B0B', border: 'none', fontSize: '0.85rem', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', cursor: processing ? 'not-allowed' : 'pointer', borderRadius: '8px', boxShadow: processing ? 'none' : '0 4px 20px rgba(212,175,55,0.3)', transition: 'all .2s' }}>
              {processing ? 'Procesando...' : 'Pagar con Mercado Pago'}
            </button>
            <div style={{ marginTop: '1rem', padding: '0.75rem', background: '#f0fdf4', borderRadius: '8px', border: '1px solid #c8e6c9' }}>
              <p style={{ fontSize: '0.7rem', color: '#2e7d32', textAlign: 'center', lineHeight: 1.6 }}>Tu pago es seguro. El dinero se libera al vendedor después de confirmar la entrega.</p>
            </div>
            <div style={{ marginTop: '1rem', padding: '0.75rem', background: '#f8f8f8', borderRadius: '8px' }}>
              <p style={{ fontSize: '0.65rem', color: '#888', marginBottom: '0.75rem', textAlign: 'center', letterSpacing: '1px', textTransform: 'uppercase' }}>Medios de pago</p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                <img src="https://http2.mlstatic.com/frontend-assets/mp-web-navigation/ui-navigation/5.19.1/mercadopago/logo__large@2x.png" alt="Mercado Pago" style={{ height: '18px', objectFit: 'contain' }} />
                <img src="https://awbepztacmvurjylfoas.supabase.co/storage/v1/object/public/assets/Visa-Logo.jpg" alt="Visa" style={{ height: '18px', objectFit: 'contain' }} />
                <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" style={{ height: '20px', objectFit: 'contain' }} />
                <img src="https://awbepztacmvurjylfoas.supabase.co/storage/v1/object/public/assets/nequi-logo-png.png" alt="Nequi" style={{ height: '20px', objectFit: 'contain' }} />
                <img src="https://awbepztacmvurjylfoas.supabase.co/storage/v1/object/public/assets/daviplata.png" alt="Daviplata" style={{ height: '20px', objectFit: 'contain' }} />
                <img src="https://awbepztacmvurjylfoas.supabase.co/storage/v1/object/public/assets/logo%20efecty.jpg" alt="Efecty" style={{ height: '20px', objectFit: 'contain' }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer style={{ background: '#0B0B0B', borderTop: '1px solid rgba(212,175,55,.15)', marginTop: '4rem', padding: '2rem clamp(1rem, 4vw, 2.5rem)', textAlign: 'center' }}>
        <img src="https://awbepztacmvurjylfoas.supabase.co/storage/v1/object/public/assets/ChatGPT_Image_3_may_2026__21_13_12-removebg-preview.png" alt="DMS Market" style={{ height: '50px', objectFit: 'contain', marginBottom: '1rem' }} />
        <p style={{ fontSize: '0.75rem', color: '#444' }}>2025 DMS Market · Colombia · Todos los derechos reservados.</p>
        <p style={{ fontSize: '0.75rem', color: '#444', marginTop: '0.25rem' }}>Pagos procesados por Mercado Pago</p>
      </footer>
    </div>
  )
}

