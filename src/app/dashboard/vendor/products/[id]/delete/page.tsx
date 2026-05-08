'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function DeleteProductPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')

  async function handleDelete() {
    setDeleting(true)
    const { error } = await supabase
      .from('products')
      .update({ status: 'deleted' })
      .eq('id', id)
    if (error) { setError(error.message); setDeleting(false) }
    else { router.push('/dashboard/vendor') }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#fff', fontFamily: 'sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ maxWidth: '480px', width: '100%', padding: '2rem', border: '1px solid #eee', borderTop: '3px solid #dc2626' }}>

        <p style={{ fontSize: '0.65rem', letterSpacing: '3px', textTransform: 'uppercase', color: '#dc2626', marginBottom: '0.75rem' }}>
          Eliminar producto
        </p>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 300, color: '#111', marginBottom: '1rem' }}>
          Confirmar eliminacion
        </h1>
        <p style={{ fontSize: '0.875rem', color: '#666', marginBottom: '2rem', lineHeight: 1.6 }}>
          Esta accion ocultara el producto del catalogo. No se puede deshacer.
        </p>

        {error && (
          <div style={{ marginBottom: '1rem', padding: '0.75rem', background: '#fff5f5', border: '1px solid #fecaca', color: '#dc2626', fontSize: '0.875rem' }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            onClick={handleDelete} disabled={deleting}
            style={{ flex: 1, padding: '0.875rem', background: deleting ? '#e5e5e5' : '#dc2626', color: '#fff', border: 'none', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', cursor: deleting ? 'not-allowed' : 'pointer' }}
          >
            {deleting ? 'Eliminando...' : 'Eliminar'}
          </button>
          <button
            onClick={() => router.back()}
            style={{ flex: 1, padding: '0.875rem', background: '#fff', color: '#111', border: '1px solid #ddd', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', cursor: 'pointer' }}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  )
}
