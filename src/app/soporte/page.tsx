'use client'
import { useState } from 'react'

const FAQS = [
  { q: '¿Como compro en DMS Market?', a: 'Registrate, busca el producto que necesitas, agrega al carrito y paga de forma segura con Mercado Pago.' },
  { q: '¿Como vendo en DMS Market?', a: 'Registrate como vendedor, verifica tu cuenta, publica tus productos y empieza a vender.' },
  { q: '¿Cuales son los metodos de pago?', a: 'Aceptamos Mercado Pago, tarjetas de credito, debito y pagos en efectivo.' },
  { q: '¿Como hago seguimiento a mi pedido?', a: 'Ingresa a tu dashboard, ve a Ordenes y encontraras el estado actualizado de tu pedido.' },
  { q: '¿Que hago si mi pedido no llega?', a: 'Contacta al vendedor desde tu dashboard o abre un caso de disputa. Nuestro equipo te ayudara.' },
  { q: '¿Como devuelvo un producto?', a: 'Tienes hasta 7 dias para solicitar una devolucion. Ve a tu orden y selecciona Solicitar devolucion.' },
  { q: '¿Es seguro comprar en DMS Market?', a: 'Si. Usamos cifrado SSL, pagos protegidos y un sistema de escrow que protege tu dinero hasta confirmar la entrega.' },
  { q: '¿Como me registro como proveedor de servicios?', a: 'Ve a Registrarse, selecciona Proveedor de servicios y completa tu perfil profesional.' },
]

const CATEGORIAS = [
  { titulo: 'Compras', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="1.5"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>, desc: 'Como comprar, pagos, envios y devoluciones' },
  { titulo: 'Ventas', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="1.5"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>, desc: 'Como vender, publicar productos y gestionar ordenes' },
  { titulo: 'Pagos', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="1.5"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>, desc: 'Metodos de pago, reembolsos y facturacion' },
  { titulo: 'Cuenta', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>, desc: 'Perfil, seguridad y configuracion de cuenta' },
  { titulo: 'Envios', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="1.5"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>, desc: 'Seguimiento, tiempos de entrega y transportadoras' },
  { titulo: 'Disputas', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="1.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>, desc: 'Reclamaciones, devoluciones y resolucion de problemas' },
]

export default function SoportePage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [enviado, setEnviado] = useState(false)

  function handleContacto(e: React.FormEvent) {
    e.preventDefault()
    setEnviado(true)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0B0B0B', fontFamily: 'Poppins, system-ui, sans-serif', color: '#fff' }}>

      {/* NAV */}
      <nav style={{ padding: '1rem 2rem', borderBottom: '1px solid rgba(212,175,55,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <a href="/" style={{ textDecoration: 'none' }}>
          <img src="https://awbepztacmvurjylfoas.supabase.co/storage/v1/object/public/assets/ChatGPT_Image_3_may_2026__21_13_12-removebg-preview.png" alt="DMS Market" style={{ height: 48, objectFit: 'contain' }} />
        </a>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <a href="/" style={{ color: '#888', fontSize: 14, textDecoration: 'none' }}>Inicio</a>
          <a href="/auth/login" style={{ color: '#D4AF37', fontSize: 14, textDecoration: 'none', fontWeight: 600 }}>Ingresar</a>
        </div>
      </nav>

      {/* HERO */}
      <div style={{ textAlign: 'center', padding: '4rem 2rem 3rem', borderBottom: '1px solid rgba(212,175,55,0.08)' }}>
        <p style={{ fontSize: 11, letterSpacing: 4, textTransform: 'uppercase', color: '#D4AF37', fontWeight: 600, margin: '0 0 1rem' }}>Centro de Ayuda</p>
        <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 700, margin: '0 0 1rem', lineHeight: 1.2 }}>
          ¿En que podemos<br /><span style={{ color: '#D4AF37' }}>ayudarte?</span>
        </h1>
        <p style={{ color: '#888', fontSize: 16, maxWidth: 500, margin: '0 auto 2rem' }}>
          Encuentra respuestas rapidas o contacta a nuestro equipo de soporte.
        </p>
        <button
          onClick={() => { const btn = document.querySelector('[title="Asistente DMS Market"]') as HTMLButtonElement; btn?.click() }}
          style={{ padding: '0.875rem 2rem', background: 'linear-gradient(135deg, #D4AF37, #B8960C)', border: 'none', borderRadius: 12, color: '#000', fontSize: 16, fontWeight: 700, cursor: 'pointer' }}>
          Hablar con un asesor
        </button>
      </div>

      {/* CATEGORIAS */}
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '3rem 2rem' }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: '1.5rem', textAlign: 'center' }}>Categorias de ayuda</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          {CATEGORIAS.map(cat => (
            <div key={cat.titulo} style={{ background: '#111', border: '1px solid rgba(212,175,55,0.1)', borderRadius: 14, padding: '1.25rem', display: 'flex', gap: '1rem', alignItems: 'flex-start', cursor: 'pointer', transition: 'border-color .2s' }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(212,175,55,0.4)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(212,175,55,0.1)')}>
              <div style={{ width: 44, height: 44, background: 'rgba(212,175,55,0.08)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {cat.icon}
              </div>
              <div>
                <p style={{ color: '#fff', fontWeight: 600, fontSize: 15, margin: '0 0 4px' }}>{cat.titulo}</p>
                <p style={{ color: '#888', fontSize: 13, margin: 0, lineHeight: 1.5 }}>{cat.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div style={{ maxWidth: 700, margin: '0 auto', padding: '0 2rem 3rem' }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: '1.5rem', textAlign: 'center' }}>Preguntas frecuentes</h2>
        {FAQS.map((faq, i) => (
          <div key={i} style={{ background: '#111', border: '1px solid rgba(212,175,55,0.1)', borderRadius: 12, marginBottom: 8, overflow: 'hidden' }}>
            <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
              style={{ width: '100%', padding: '1rem 1.25rem', background: 'transparent', border: 'none', color: '#fff', fontSize: 15, fontWeight: 600, textAlign: 'left', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              {faq.q}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="2" style={{ transform: openFaq === i ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform .2s', flexShrink: 0 }}>
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>
            {openFaq === i && (
              <div style={{ padding: '0 1.25rem 1rem', color: '#aaa', fontSize: 14, lineHeight: 1.7 }}>
                {faq.a}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* CONTACTO */}
      <div style={{ background: '#0f0f0f', borderTop: '1px solid rgba(212,175,55,0.08)', borderBottom: '1px solid rgba(212,175,55,0.08)', padding: '3rem 2rem' }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: '0.5rem', textAlign: 'center' }}>Contactanos</h2>
          <p style={{ color: '#888', fontSize: 14, textAlign: 'center', marginBottom: '2rem' }}>Nuestro equipo responde en menos de 24 horas.</p>
          {enviado ? (
            <div style={{ textAlign: 'center', padding: '2rem', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 14 }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="1.5" style={{ display: 'block', margin: '0 auto 1rem' }}>
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <p style={{ color: '#10B981', fontWeight: 600, fontSize: 18, margin: '0 0 0.5rem' }}>Mensaje enviado</p>
              <p style={{ color: '#888', fontSize: 14, margin: 0 }}>Te responderemos pronto a tu correo.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Tu nombre"
                style={{ padding: '0.875rem 1rem', background: '#151515', border: '1px solid rgba(212,175,55,0.15)', borderRadius: 10, color: '#fff', fontSize: 14, outline: 'none' }} />
              <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Tu correo" type="email"
                style={{ padding: '0.875rem 1rem', background: '#151515', border: '1px solid rgba(212,175,55,0.15)', borderRadius: 10, color: '#fff', fontSize: 14, outline: 'none' }} />
              <textarea value={mensaje} onChange={e => setMensaje(e.target.value)} placeholder="Describe tu problema o consulta..." rows={4}
                style={{ padding: '0.875rem 1rem', background: '#151515', border: '1px solid rgba(212,175,55,0.15)', borderRadius: 10, color: '#fff', fontSize: 14, outline: 'none', resize: 'vertical', fontFamily: 'inherit' }} />
              <button onClick={handleContacto} disabled={!nombre || !email || !mensaje}
                style={{ padding: '0.875rem', background: !nombre || !email || !mensaje ? '#222' : 'linear-gradient(135deg, #D4AF37, #B8960C)', border: 'none', borderRadius: 10, color: !nombre || !email || !mensaje ? '#555' : '#000', fontSize: 15, fontWeight: 700, cursor: !nombre || !email || !mensaje ? 'not-allowed' : 'pointer' }}>
                Enviar mensaje
              </button>
            </div>
          )}
        </div>
      </div>

      {/* INFO CONTACTO */}
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '3rem 2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', textAlign: 'center' }}>
        {[
          { icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="1.5"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>, titulo: 'Email', valor: 'soporte.dmsmarket@hotmail.com' },
          { icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="1.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>, titulo: 'Chat en vivo', valor: 'Disponible en la plataforma' },
          { icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>, titulo: 'Horario', valor: 'Lunes a Viernes 8am - 6pm' },
        ].map(item => (
          <div key={item.titulo} style={{ background: '#111', border: '1px solid rgba(212,175,55,0.1)', borderRadius: 14, padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.75rem' }}>{item.icon}</div>
            <p style={{ color: '#D4AF37', fontWeight: 600, fontSize: 15, margin: '0 0 0.375rem' }}>{item.titulo}</p>
            <p style={{ color: '#888', fontSize: 13, margin: 0 }}>{item.valor}</p>
          </div>
        ))}
      </div>

      {/* FOOTER */}
      <div style={{ textAlign: 'center', padding: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.06)', color: '#444', fontSize: 13 }}>
        2025 DMS Market. Colombia.{' '}
        <a href="/politicas" style={{ color: '#D4AF37', textDecoration: 'none' }}>Politicas</a>
      </div>
    </div>
  )
}
