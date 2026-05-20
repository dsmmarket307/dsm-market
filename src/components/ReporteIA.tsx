'use client'

import { useState } from 'react'

interface Props {
  type: 'vendor' | 'admin'
  metrics?: any
}

export default function ReporteIA({ type, metrics }: Props) {
  const [reporte, setReporte] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function generarReporte() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type })
      })
      const data = await res.json()
      if (data.error) { setError('No se pudo generar el reporte.'); setLoading(false); return }
      setReporte(data.reporte)
    } catch {
      setError('Error de conexion. Intenta de nuevo.')
    }
    setLoading(false)
  }

  function descargarPDF() {
    const fecha = new Date().toLocaleDateString('es-CO')
    const titulo = type === 'vendor' ? 'Reporte de Vendedor' : 'Reporte del Marketplace'
    const contenido = `
DMS MARKET
${titulo}
Fecha: ${fecha}
${'='.repeat(50)}

${reporte}

${'='.repeat(50)}
Generado automaticamente por DMS Market con IA
    `.trim()

    const blob = new Blob([contenido], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `reporte-dms-${type}-${fecha.replace(/\//g, '-')}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div style={{
      background: '#151515', borderRadius: 16, padding: '1.5rem',
      border: '1px solid rgba(212,175,55,.15)', marginBottom: '1.25rem'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div>
          <p style={{ fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: '#D4AF37', margin: 0 }}>Inteligencia Artificial</p>
          <p style={{ fontSize: 15, fontWeight: 700, color: '#fff', margin: '4px 0 0', fontFamily: 'Poppins, sans-serif' }}>
            {type === 'vendor' ? 'Reporte de mis ventas' : 'Reporte del Marketplace'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {reporte && (
            <button onClick={descargarPDF}
              style={{
                padding: '8px 16px', background: 'rgba(29,158,117,.15)',
                border: '1px solid rgba(29,158,117,.3)', borderRadius: 8,
                color: '#1D9E75', fontSize: 12, fontWeight: 700, cursor: 'pointer',
                fontFamily: 'Poppins, sans-serif'
              }}>
              Descargar
            </button>
          )}
          <button onClick={generarReporte} disabled={loading}
            style={{
              padding: '8px 20px',
              background: loading ? '#333' : '#D4AF37',
              border: 'none', borderRadius: 8,
              color: loading ? '#666' : '#000',
              fontSize: 12, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'Poppins, sans-serif'
            }}>
            {loading ? 'Generando...' : reporte ? 'Regenerar' : 'Generar reporte IA'}
          </button>
        </div>
      </div>

      {error && (
        <p style={{ color: '#ef4444', fontSize: 13, marginBottom: '0.75rem' }}>{error}</p>
      )}

      {!reporte && !loading && (
        <p style={{ color: '#555', fontSize: 13, fontFamily: 'Poppins, sans-serif' }}>
          Haz clic en "Generar reporte IA" para obtener un analisis automatico con recomendaciones.
        </p>
      )}

      {loading && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '1rem 0' }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#D4AF37', animation: 'pulse 1s infinite' }} />
          <p style={{ color: '#888', fontSize: 13, fontFamily: 'Poppins, sans-serif' }}>Analizando datos y generando reporte...</p>
        </div>
      )}

      {reporte && (
        <div style={{
          background: '#0f0f0f', borderRadius: 10, padding: '1.25rem',
          border: '1px solid rgba(212,175,55,.1)', marginTop: '0.5rem'
        }}>
          <p style={{
            color: '#ccc', fontSize: 13, lineHeight: 1.8,
            fontFamily: 'Poppins, sans-serif', whiteSpace: 'pre-wrap'
          }}>
            {reporte}
          </p>
        </div>
      )}
    </div>
  )
}
