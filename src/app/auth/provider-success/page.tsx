export default function ProviderSuccessPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#fff', fontFamily: 'sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ maxWidth: '480px', width: '100%', padding: '2rem', textAlign: 'center' }}>
        <div style={{ width: '72px', height: '72px', background: '#e8f5e9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
          <span style={{ fontSize: '2rem', color: '#1D9E75' }}>OK</span>
        </div>
        <p style={{ fontSize: '0.65rem', letterSpacing: '3px', textTransform: 'uppercase', color: '#C9A84C', marginBottom: '0.75rem' }}>Registro exitoso</p>
        <h1 style={{ fontSize: '2rem', fontWeight: 300, color: '#111', marginBottom: '1rem' }}>Tu servicio fue enviado</h1>
        <p style={{ fontSize: '0.875rem', color: '#666', lineHeight: 1.7, marginBottom: '2rem' }}>
          El equipo de DMS Market revisara tu servicio y lo aprobara en las proximas 24 horas. Te notificaremos cuando este activo.
        </p>
        <div style={{ padding: '1rem', background: '#fffbeb', border: '1px solid #C9A84C', marginBottom: '2rem', borderRadius: '4px' }}>
          <p style={{ fontSize: '0.8rem', color: '#92400e', fontWeight: 600, marginBottom: '0.25rem' }}>Tu mes gratis ya empezo</p>
          <p style={{ fontSize: '0.75rem', color: '#b45309' }}>Tienes 30 dias gratis. A partir del dia 31 elige tu plan para continuar publicado.</p>
        </div>
        <a href="/" style={{ display: 'inline-block', background: '#C9A84C', color: '#fff', padding: '0.875rem 2rem', textDecoration: 'none', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase' }}>
          Ir al inicio
        </a>
      </div>
    </div>
  )
}