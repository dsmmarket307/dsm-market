'use client'

import { useState } from 'react'

interface Props {
  type: 'vendor' | 'admin'
}

export default function ReporteIA({ type }: Props) {
  const [reporte, setReporte] = useState('')
  const [metrics, setMetrics] = useState<any>(null)
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
      setMetrics(data.metrics)
    } catch {
      setError('Error de conexion. Intenta de nuevo.')
    }
    setLoading(false)
  }

  function descargarTXT() {
    const fecha = new Date().toLocaleDateString('es-CO')
    const titulo = type === 'vendor' ? 'Reporte de Vendedor DMS Market' : 'Reporte Ejecutivo DMS Market'
    const metricsText = metrics ? (type === 'vendor' ? `
METRICAS CLAVE
Ventas Totales: $${metrics.totalVentas?.toLocaleString('es-CO')} COP
Ingresos Netos: $${metrics.ingresosNetos?.toLocaleString('es-CO')} COP
Comision Plataforma: $${metrics.comisionPlataforma?.toLocaleString('es-CO')} COP
Ordenes Totales: ${metrics.totalOrdenes}
Tasa Conversion: ${metrics.tasaConversion}%
Ticket Promedio: $${metrics.ticketPromedio?.toLocaleString('es-CO')} COP
Ventas Esta Semana: $${metrics.ventasSemana?.toLocaleString('es-CO')} COP
` : `
METRICAS CLAVE
Ventas Totales: $${metrics.totalVentas?.toLocaleString('es-CO')} COP
Comisiones: $${metrics.comisiones?.toLocaleString('es-CO')} COP
Vendedores: ${metrics.vendedores}
Compradores: ${metrics.compradores}
Ordenes Totales: ${metrics.totalOrdenes}
Ticket Promedio: $${metrics.ticketPromedio?.toLocaleString('es-CO')} COP
`) : ''

    const contenido = `DMS MARKET
${titulo}
Fecha: ${fecha}
${'='.repeat(60)}
${metricsText}
${'='.repeat(60)}
ANALISIS IA
${reporte}
${'='.repeat(60)}
Generado automaticamente por DMS Market con Inteligencia Artificial
    `.trim()

    const blob = new Blob([contenido], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `reporte-dms-${type}-${fecha.replace(/\//g, '-')}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const vendorMetrics = metrics && type === 'vendor' ? [
    { label: 'Ventas Totales', value: '$' + metrics.totalVentas?.toLocaleString('es-CO'), color: '#1D9E75', sub: 'COP bruto' },
    { label: 'Ingresos Netos', value: '$' + metrics.ingresosNetos?.toLocaleString('es-CO'), color: '#D4AF37', sub: 'despues comision' },
    { label: 'Comision (10%)', value: '$' + metrics.comisionPlataforma?.toLocaleString('es-CO'), color: '#a78bfa', sub: 'plataforma' },
    { label: 'Ticket Promedio', value: '$' + metrics.ticketPromedio?.toLocaleString('es-CO'), color: '#38bdf8', sub: 'por orden' },
    { label: 'Conversion', value: metrics.tasaConversion + '%', color: metrics.tasaConversion > 70 ? '#1D9E75' : '#f59e0b', sub: 'ordenes entregadas' },
    { label: 'Esta Semana', value: '$' + metrics.ventasSemana?.toLocaleString('es-CO'), color: '#fb923c', sub: metrics.ordenesSemana + ' ordenes' },
  ] : []

  const adminMetrics = metrics && type === 'admin' ? [
    { label: 'Ventas Totales', value: '$' + metrics.totalVentas?.toLocaleString('es-CO'), color: '#1D9E75', sub: 'marketplace' },
    { label: 'Comisiones', value: '$' + metrics.comisiones?.toLocaleString('es-CO'), color: '#D4AF37', sub: 'ganadas' },
    { label: 'Vendedores', value: metrics.vendedores, color: '#a78bfa', sub: 'activos' },
    { label: 'Compradores', value: metrics.compradores, color: '#38bdf8', sub: 'registrados' },
    { label: 'Ticket Promedio', value: '$' + metrics.ticketPromedio?.toLocaleString('es-CO'), color: '#fb923c', sub: 'por orden' },
    { label: 'Nuevos/Semana', value: metrics.usuariosNuevosSemana, color: '#1D9E75', sub: 'usuarios nuevos' },
  ] : []

  const currentMetrics = type === 'vendor' ? vendorMetrics : adminMetrics
  const topCats = metrics?.topCategorias ?? []

  const maxCat = topCats.length > 0 ? Math.max(...topCats.map((c: any) => c[1])) : 1

  return (
    <div style={{ background: '#151515', borderRadius: 16, padding: '1.5rem', border: '1px solid rgba(212,175,55,.15)', marginBottom: '1.25rem', fontFamily: 'Poppins, sans-serif' }}>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: 10 }}>
        <div>
          <p style={{ fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', color: '#D4AF37', margin: 0 }}>Inteligencia Artificial</p>
          <p style={{ fontSize: 16, fontWeight: 700, color: '#fff', margin: '4px 0 0' }}>
            {type === 'vendor' ? 'Centro de Inteligencia del Vendedor' : 'Centro de Inteligencia del Marketplace'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {reporte && (
            <button onClick={descargarTXT}
              style={{ padding: '8px 16px', background: 'rgba(29,158,117,.15)', border: '1px solid rgba(29,158,117,.3)', borderRadius: 8, color: '#1D9E75', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
              Descargar Reporte
            </button>
          )}
          <button onClick={generarReporte} disabled={loading}
            style={{ padding: '8px 20px', background: loading ? '#333' : '#D4AF37', border: 'none', borderRadius: 8, color: loading ? '#666' : '#000', fontSize: 12, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer' }}>
            {loading ? 'Analizando...' : reporte ? 'Actualizar' : 'Generar Reporte IA'}
          </button>
        </div>
      </div>

      {error && <p style={{ color: '#ef4444', fontSize: 13, marginBottom: '0.75rem' }}>{error}</p>}

      {!reporte && !loading && (
        <div style={{ padding: '2rem', textAlign: 'center', border: '1px dashed rgba(212,175,55,.2)', borderRadius: 12 }}>
          <p style={{ color: '#D4AF37', fontSize: 24, margin: '0 0 8px' }}>IA</p>
          <p style={{ color: '#888', fontSize: 13 }}>Analisis profundo con IA: contabilidad, estrategia, metas y tareas semanales.</p>
          <p style={{ color: '#555', fontSize: 12, marginTop: 4 }}>Haz clic en "Generar Reporte IA" para comenzar.</p>
        </div>
      )}

      {loading && (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <p style={{ color: '#D4AF37', fontSize: 13, marginBottom: 8 }}>Analizando datos del marketplace...</p>
          <p style={{ color: '#555', fontSize: 12 }}>Generando contabilidad, estrategia y tareas semanales...</p>
        </div>
      )}

      {reporte && metrics && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10, marginBottom: '1.25rem' }}>
            {currentMetrics.map((m: any) => (
              <div key={m.label} style={{ background: '#0f0f0f', borderRadius: 12, padding: '1rem', border: '1px solid rgba(255,255,255,.06)' }}>
                <p style={{ fontSize: 10, color: '#666', textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 6px' }}>{m.label}</p>
                <p style={{ fontSize: 18, fontWeight: 700, color: m.color, margin: '0 0 2px' }}>{m.value}</p>
                <p style={{ fontSize: 10, color: '#555', margin: 0 }}>{m.sub}</p>
              </div>
            ))}
          </div>

          {topCats.length > 0 && (
            <div style={{ background: '#0f0f0f', borderRadius: 12, padding: '1.25rem', border: '1px solid rgba(255,255,255,.06)', marginBottom: '1.25rem' }}>
              <p style={{ fontSize: 10, color: '#888', textTransform: 'uppercase', letterSpacing: 2, margin: '0 0 1rem' }}>
                {type === 'vendor' ? 'Mis Categorias' : 'Top Categorias del Marketplace'}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {topCats.map((cat: any, i: number) => (
                  <div key={i}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <p style={{ fontSize: 12, color: '#ccc', margin: 0 }}>{cat[0]}</p>
                      <p style={{ fontSize: 12, color: '#D4AF37', fontWeight: 700, margin: 0 }}>{cat[1]} productos</p>
                    </div>
                    <div style={{ height: 6, background: '#1a1a1a', borderRadius: 999, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: Math.round((cat[1] / maxCat) * 100) + '%', background: i === 0 ? '#D4AF37' : i === 1 ? '#1D9E75' : '#a78bfa', borderRadius: 999, transition: 'width 0.5s' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {type === 'vendor' && metrics && (
            <div style={{ background: '#0f0f0f', borderRadius: 12, padding: '1.25rem', border: '1px solid rgba(29,158,117,.15)', marginBottom: '1.25rem' }}>
              <p style={{ fontSize: 10, color: '#1D9E75', textTransform: 'uppercase', letterSpacing: 2, margin: '0 0 1rem' }}>Contabilidad</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {[
                  { label: 'Ingresos Brutos', value: '$' + metrics.totalVentas?.toLocaleString('es-CO'), color: '#fff' },
                  { label: 'Comision DMS (10%)', value: '- $' + metrics.comisionPlataforma?.toLocaleString('es-CO'), color: '#ef4444' },
                  { label: 'Ingresos Netos', value: '$' + metrics.ingresosNetos?.toLocaleString('es-CO'), color: '#1D9E75' },
                  { label: 'Saldo por Cobrar', value: '$' + metrics.saldoPendiente?.toLocaleString('es-CO'), color: '#D4AF37' },
                  { label: 'Saldo Liberado', value: '$' + metrics.saldoLiberado?.toLocaleString('es-CO'), color: '#a78bfa' },
                  { label: 'Proyeccion Mes', value: '$' + (metrics.ventasSemana * 4)?.toLocaleString('es-CO'), color: '#38bdf8' },
                ].map(item => (
                  <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid rgba(255,255,255,.04)' }}>
                    <p style={{ fontSize: 12, color: '#666', margin: 0 }}>{item.label}</p>
                    <p style={{ fontSize: 13, color: item.color, fontWeight: 700, margin: 0 }}>{item.value} COP</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ background: '#0f0f0f', borderRadius: 12, padding: '1.25rem', border: '1px solid rgba(212,175,55,.1)' }}>
            <p style={{ fontSize: 10, color: '#D4AF37', textTransform: 'uppercase', letterSpacing: 2, margin: '0 0 1rem' }}>Analisis IA — Estrategia y Tareas</p>
            <p style={{ color: '#ccc', fontSize: 13, lineHeight: 1.9, whiteSpace: 'pre-wrap', margin: 0 }}>{reporte}</p>
          </div>
        </>
      )}
    </div>
  )
}
