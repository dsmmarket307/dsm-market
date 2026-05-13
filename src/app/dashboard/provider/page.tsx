'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function ProviderDashboardPage() {
  const router = useRouter()
  const supabase = createClient()
  const [service, setService] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      await supabase.auth.getSession()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }

      const { data } = await supabase
        .from('services')
        .select('*')
        .eq('provider_id', user.id)
        .single()

      if (!data) { router.push('/auth/register-provider'); return }
      setService(data)
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif' }}>
      <p style={{ color: '#C9A84C', fontSize: '1rem' }}>Cargando tu panel...</p>
    </div>
  )

  const diasRestantes = service.plan_expires_at
    ? Math.max(0, Math.ceil((new Date(service.plan_expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0

  const statusColor: Record<string, string> = {
    pending: '#F59E0B',
    approved: '#10B981',
    rejected: '#EF4444',
  }
  const statusLabel: Record<string, string> = {
    pending: 'En revision',
    approved: 'Aprobado y activo',
    rejected: 'Rechazado',
  }

  return (
    <div style={{ minHeight: '100vh', background: '#fafaf8', fontFamily: 'sans-serif' }}>

      <nav style={{ borderBottom: '2px solid #C9A84C', padding: '0 2rem', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff', position: 'sticky', top: 0, zIndex: 50 }}>
        <a href="/" style={{ fontSize: '1.25rem', fontWeight: 700, color: '#C9A84C', textDecoration: 'none' }}>DMS Market</a>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <a href="/servicios" style={{ fontSize: '0.8rem', color: '#555', textDecoration: 'none' }}>Ver servicios</a>
          <button onClick={async () => { await supabase.auth.signOut(); router.push('/auth/login') }}
            style={{ fontSize: '0.8rem', color: '#888', background: 'none', border: '1px solid #ddd', padding: '0.4rem 0.875rem', borderRadius: '999px', cursor: 'pointer' }}>
            Cerrar sesion
          </button>
        </div>
      </nav>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2.5rem 2rem' }}>

        <div style={{ marginBottom: '2rem' }}>
          <p style={{ fontSize: '0.65rem', letterSpacing: '3px', textTransform: 'uppercase', color: '#C9A84C', marginBottom: '0.5rem', fontWeight: 600 }}>Mi panel</p>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#111' }}>Bienvenido, {service.business_name}</h1>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <p style={{ fontSize: '0.7rem', color: '#aaa', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>Estado</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: statusColor[service.status] ?? '#aaa', flexShrink: 0 }} />
              <p style={{ fontSize: '0.95rem', fontWeight: 700, color: statusColor[service.status] ?? '#aaa' }}>
                {statusLabel[service.status] ?? service.status}
              </p>
            </div>
          </div>

          <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <p style={{ fontSize: '0.7rem', color: '#aaa', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>Plan actual</p>
            <p style={{ fontSize: '0.95rem', fontWeight: 700, color: '#111', textTransform: 'capitalize' }}>{service.plan ?? 'Gratis'}</p>
          </div>

          <div style={{ background: diasRestantes < 10 ? '#fff8f0' : '#fff', border: `1px solid ${diasRestantes < 10 ? '#C9A84C' : '#eee'}`, borderRadius: '12px', padding: '1.25rem', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <p style={{ fontSize: '0.7rem', color: '#aaa', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>Dias restantes</p>
            <p style={{ fontSize: '0.95rem', fontWeight: 700, color: diasRestantes < 10 ? '#C9A84C' : '#111' }}>{diasRestantes} dias</p>
          </div>

          <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <p style={{ fontSize: '0.7rem', color: '#aaa', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>Ciudad</p>
            <p style={{ fontSize: '0.95rem', fontWeight: 700, color: '#111' }}>{service.city}</p>
          </div>
        </div>

        {service.status === 'pending' && (
          <div style={{ background: '#fffbeb', border: '1px solid #C9A84C', borderLeft: '4px solid #C9A84C', borderRadius: '8px', padding: '1rem 1.25rem', marginBottom: '2rem' }}>
            <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#92400e', marginBottom: '0.25rem' }}>Tu servicio esta en revision</p>
            <p style={{ fontSize: '0.8rem', color: '#b45309', lineHeight: 1.6 }}>El equipo de DMS Market lo revisara en las proximas 24 horas y te notificaremos cuando este activo.</p>
          </div>
        )}

        {service.status === 'rejected' && (
          <div style={{ background: '#fff5f5', border: '1px solid #fecaca', borderLeft: '4px solid #EF4444', borderRadius: '8px', padding: '1rem 1.25rem', marginBottom: '2rem' }}>
            <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#dc2626', marginBottom: '0.25rem' }}>Tu servicio fue rechazado</p>
            <p style={{ fontSize: '0.8rem', color: '#dc2626', lineHeight: 1.6 }}>Por favor edita tu servicio y vuelve a enviarlo para revision.</p>
          </div>
        )}

        <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', marginBottom: '2rem' }}>
          {service.service_image_url && (
            <div style={{ width: '100%', height: '220px', overflow: 'hidden' }}>
              <img src={service.service_image_url} alt={service.business_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          )}
          <div style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <p style={{ fontSize: '0.7rem', color: '#C9A84C', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600, marginBottom: '0.25rem' }}>{service.category}</p>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111' }}>{service.business_name}</h2>
              </div>
              <button
                onClick={() => router.push('/dashboard/provider/edit')}
                style={{ fontSize: '0.8rem', background: '#C9A84C', color: '#fff', padding: '0.5rem 1.25rem', border: 'none', borderRadius: '999px', fontWeight: 600, cursor: 'pointer' }}>
                Editar servicio
              </button>
            </div>
            <p style={{ fontSize: '0.875rem', color: '#555', lineHeight: 1.7, marginBottom: '1rem' }}>{service.description}</p>
            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
              {service.price && (
                <div>
                  <p style={{ fontSize: '0.7rem', color: '#aaa', marginBottom: '0.2rem' }}>Precio</p>
                  <p style={{ fontSize: '0.9rem', fontWeight: 600, color: '#111' }}>{service.price}</p>
                </div>
              )}
              <div>
                <p style={{ fontSize: '0.7rem', color: '#aaa', marginBottom: '0.2rem' }}>Celular</p>
                <p style={{ fontSize: '0.9rem', fontWeight: 600, color: '#111' }}>{service.phone}</p>
              </div>
              {service.whatsapp && (
                <div>
                  <p style={{ fontSize: '0.7rem', color: '#aaa', marginBottom: '0.2rem' }}>WhatsApp</p>
                  <p style={{ fontSize: '0.9rem', fontWeight: 600, color: '#111' }}>{service.whatsapp}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {service.status === 'approved' && (
          <div style={{ textAlign: 'center' }}>
            <a href="/servicios" style={{ fontSize: '0.85rem', color: '#C9A84C', textDecoration: 'none', fontWeight: 600, border: '1px solid #C9A84C', padding: '0.6rem 1.5rem', borderRadius: '999px' }}>
              Ver mi servicio en el catalogo
            </a>
          </div>
        )}
      </div>

      <footer style={{ borderTop: '1px solid #eee', padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '3rem' }}>
        <span style={{ color: '#C9A84C', fontWeight: 700 }}>DMS Market</span>
        <p style={{ fontSize: '0.75rem', color: '#999' }}>2025 DMS Market. Colombia</p>
      </footer>
    </div>
  )
}