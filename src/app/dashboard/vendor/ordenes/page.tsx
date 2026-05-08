'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function VendorOrdenesPage() {
  const supabase = createClient()
  const router = useRouter()
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState<Record<string, boolean>>({})
  const [success, setSuccess] = useState<Record<string, boolean>>({})

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      const { data } = await supabase
        .from('orders')
        .select('*, order_items(*, products(name, price))')
        .eq('seller_id', user.id)
        .order('created_at', { ascending: false })
      setOrders(data ?? [])
      setLoading(false)
    }
    load()
  }, [])

  async function handleGuia(orderId: string, file: File) {
    setUploading(prev => ({ ...prev, [orderId]: true }))
    try {
      const ext = file.name.split('.').pop()
      const fileName = 'guia-' + orderId + '.' + ext
      const { error: uploadError } = await supabase.storage
        .from('shipping-guides')
        .upload(fileName, file, { upsert: true })
      if (uploadError) throw uploadError
      const { data: urlData } = supabase.storage.from('shipping-guides').getPublicUrl(fileName)
      await supabase.from('orders').update({
        guia_url: urlData.publicUrl,
        guia_uploaded_at: new Date().toISOString(),
        status: 'shipped',
      }).eq('id', orderId)
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, guia_url: urlData.publicUrl, status: 'shipped' } : o))
      setSuccess(prev => ({ ...prev, [orderId]: true }))
    } catch (err: any) {
      alert('Error: ' + err.message)
    }
    setUploading(prev => ({ ...prev, [orderId]: false }))
  }

  const statusLabel: Record<string, string> = {
    pending_payment: 'Pago pendiente',
    paid: 'Pagado',
    processing: 'Procesando',
    shipped: 'Enviado',
    delivered: 'Entregado',
    held: 'Retenido',
    released: 'Liberado',
    cancelled: 'Cancelado',
  }

  const statusColor: Record<string, string> = {
    paid: '#C9A84C',
    shipped: '#6366f1',
    delivered: '#1D9E75',
    released: '#1D9E75',
    cancelled: '#dc2626',
    pending_payment: '#888',
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif' }}>
      <p style={{ color: '#C9A84C', letterSpacing: '2px', fontSize: '0.875rem' }}>Cargando...</p>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#fff', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: 'clamp(1.5rem, 4vw, 3rem) clamp(1rem, 4vw, 2rem)' }}>

        <div style={{ marginBottom: '2rem', borderBottom: '1px solid #f0f0f0', paddingBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <p style={{ fontSize: '0.65rem', letterSpacing: '3px', textTransform: 'uppercase', color: '#C9A84C', marginBottom: '0.5rem' }}>Vendedor</p>
            <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: 300, color: '#111' }}>Mis ordenes</h1>
          </div>
          <a href="/dashboard/vendor" style={{ fontSize: '0.75rem', color: '#888', textDecoration: 'none' }}>Volver al panel</a>
        </div>

        {orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
            <p style={{ color: '#aaa', fontSize: '0.875rem' }}>No tienes ordenes aun.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {orders.map(order => (
              <div key={order.id} style={{ border: '1px solid #eee', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ padding: '1rem 1.5rem', background: '#fafafa', borderBottom: '1px solid #eee', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <p style={{ fontSize: '0.7rem', color: '#aaa', marginBottom: '0.25rem' }}>Orden #{order.id.slice(0, 8)}</p>
                    <p style={{ fontSize: '0.75rem', color: '#888' }}>{new Date(order.created_at).toLocaleDateString('es-CO')}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.65rem', padding: '0.25rem 0.75rem', borderRadius: '999px', fontWeight: 600, background: '#f0f0f0', color: statusColor[order.status] ?? '#888' }}>
                      {statusLabel[order.status] ?? order.status}
                    </span>
                    <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1D9E75' }}>
                      Tu ganancia: ${Number(order.seller_amount).toLocaleString('es-CO')}
                    </p>
                  </div>
                </div>

                <div style={{ padding: '1rem 1.5rem' }}>
                  {order.order_items?.map((item: any) => (
                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', padding: '0.5rem 0', borderBottom: '1px solid #f9f9f9' }}>
                      <span style={{ color: '#555' }}>{item.products?.name} x{item.quantity}</span>
                      <span style={{ color: '#111', fontWeight: 500 }}>${Number(item.subtotal).toLocaleString('es-CO')}</span>
                    </div>
                  ))}
                </div>

                {order.status === 'paid' && !order.guia_url && (
                  <div style={{ padding: '1rem 1.5rem', background: '#fffbeb', borderTop: '1px solid #fef3c7' }}>
                    <p style={{ fontSize: '0.8rem', color: '#92400e', fontWeight: 500, marginBottom: '0.75rem' }}>
                      Debes subir la guia de envio para que se libere tu pago
                    </p>
                    <label style={{ display: 'inline-block', padding: '0.625rem 1.25rem', background: '#C9A84C', color: '#fff', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', cursor: 'pointer' }}>
                      {uploading[order.id] ? 'Subiendo...' : 'Subir guia de envio'}
                      <input type="file" accept="image/*,.pdf" style={{ display: 'none' }}
                        onChange={e => { const f = e.target.files?.[0]; if (f) handleGuia(order.id, f) }} />
                    </label>
                  </div>
                )}

                {order.guia_url && (
                  <div style={{ padding: '1rem 1.5rem', background: '#e8f5e9', borderTop: '1px solid #c8e6c9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <p style={{ fontSize: '0.8rem', color: '#2e7d32', fontWeight: 500 }}>Guia de envio subida</p>
                    <a href={order.guia_url} target="_blank" style={{ fontSize: '0.75rem', color: '#2e7d32', textDecoration: 'none', fontWeight: 600 }}>Ver guia</a>
                  </div>
                )}

                {success[order.id] && (
                  <div style={{ padding: '0.75rem 1.5rem', background: '#e8f5e9', borderTop: '1px solid #c8e6c9' }}>
                    <p style={{ fontSize: '0.8rem', color: '#2e7d32' }}>Guia subida correctamente. La orden esta en camino.</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}