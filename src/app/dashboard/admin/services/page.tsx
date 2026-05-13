'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function AdminServicesPage() {
  const router = useRouter()
  const supabase = createClient()
  const [services, setServices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [procesando, setProcesando] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      const role = user.user_metadata?.role ?? 'buyer'
      if (role !== 'admin') { router.push('/dashboard'); return }

      const { data } = await supabase
        .from('services')
        .select('*')
        .order('created_at', { ascending: false })

      setServices(data ?? [])
      setLoading(false)
    }
    load()
  }, [])

  async function updateStatus(id: string, status: string) {
    setProcesando(id)
    await supabase.from('services').update({ status }).eq('id', id)
    setServices(prev => prev.map(s => s.id === id ? { ...s, status } : s))
    setProcesando(null)
  }

  const statusColor: Record<string, string> = {
    pending: '#F59E0B',
    approved: '#10B981',
    rejected: '#EF4444',
  }
  const statusLabel: Record<string, string> = {
    pending: 'Pendiente',
    approved: 'Aprobado',
    rejected: 'Rechazado',
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#C9A84C' }}>Cargando servicios...</p>
    </div>
  )

  return (
    <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto', background: '#fff', minHeight: '100vh' }}>
      <div style={{ marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '2px solid #C9A84C', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <p style={{ fontSize: '0.7rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#C9A84C', marginBottom: '0.25rem' }}>Admin</p>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#111' }}>Servicios</h1>
        </div>
        <a href="/dashboard/admin" style={{ fontSize: '0.8rem', color: '#888', textDecoration: 'none' }}>← Volver al panel</a>
      </div>

      {services.length === 0 ? (
        <p style={{ color: '#aaa', textAlign: 'center', padding: '3rem' }}>No hay servicios registrados.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {services.map(service => (
            <div key={service.id} style={{ border: '1px solid #eee', borderRadius: '12px', padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: statusColor[service.status] ?? '#aaa', background: statusColor[service.status] + '20', padding: '0.2rem 0.6rem', borderRadius: '999px' }}>
                    {statusLabel[service.status] ?? service.status}
                  </span>
                  <span style={{ fontSize: '0.7rem', color: '#aaa' }}>{service.category}</span>
                </div>
                <p style={{ fontSize: '1rem', fontWeight: 700, color: '#111', marginBottom: '0.25rem' }}>{service.business_name}</p>
                <p style={{ fontSize: '0.8rem', color: '#555', marginBottom: '0.25rem' }}>{service.city} — {service.phone}</p>
                <p style={{ fontSize: '0.8rem', color: '#888', lineHeight: 1.6 }}>{service.description?.slice(0, 120)}...</p>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                <button
                  disabled={procesando === service.id || service.status === 'approved'}
                  onClick={() => updateStatus(service.id, 'approved')}
                  style={{ padding: '0.5rem 1.25rem', background: service.status === 'approved' ? '#e5e5e5' : '#10B981', color: service.status === 'approved' ? '#999' : '#fff', border: 'none', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 700, cursor: service.status === 'approved' ? 'not-allowed' : 'pointer' }}>
                  Aprobar
                </button>
                <button
                  disabled={procesando === service.id || service.status === 'rejected'}
                  onClick={() => updateStatus(service.id, 'rejected')}
                  style={{ padding: '0.5rem 1.25rem', background: service.status === 'rejected' ? '#e5e5e5' : '#EF4444', color: service.status === 'rejected' ? '#999' : '#fff', border: 'none', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 700, cursor: service.status === 'rejected' ? 'not-allowed' : 'pointer' }}>
                  Rechazar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}