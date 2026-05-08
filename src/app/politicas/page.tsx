export default function PoliticasPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#fff', fontFamily: 'sans-serif' }}>
      <nav style={{ borderBottom: '1px solid #f0f0f0', padding: '0 2rem', height: '56px', display: 'flex', alignItems: 'center', background: '#fff' }}>
        <a href="/" style={{ color: '#C9A84C', fontWeight: 700, fontSize: '1.1rem', letterSpacing: '2px', textDecoration: 'none' }}>DMS</a>
      </nav>
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '3rem 2rem' }}>
        <p style={{ fontSize: '0.65rem', letterSpacing: '3px', textTransform: 'uppercase', color: '#C9A84C', marginBottom: '0.5rem' }}>Legal</p>
        <h1 style={{ fontSize: '2rem', fontWeight: 300, color: '#111', marginBottom: '0.5rem' }}>Politicas de DSM Market</h1>
        <div style={{ width: '40px', height: '2px', background: '#C9A84C', marginBottom: '3rem' }} />
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 600, color: '#111', marginBottom: '0.75rem' }}>1. Comision de la plataforma</h2>
          <p style={{ fontSize: '0.875rem', color: '#555', lineHeight: 1.8 }}>DSM Market cobra una comision del 5% sobre el valor de cada venta exitosa. Esta comision se descuenta automaticamente del pago al vendedor. Ejemplo: producto de $100.000 COP — comision DSM $5.000 — vendedor recibe $95.000.</p>
        </div>
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 600, color: '#111', marginBottom: '0.75rem' }}>2. Retencion de pagos</h2>
          <p style={{ fontSize: '0.875rem', color: '#555', lineHeight: 1.8 }}>El dinero de cada compra queda retenido por 7 dias despues de confirmada la entrega. Pasados los 7 dias sin reclamos, el pago se libera al vendedor.</p>
        </div>
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 600, color: '#111', marginBottom: '0.75rem' }}>3. Guia de envio obligatoria</h2>
          <p style={{ fontSize: '0.875rem', color: '#555', lineHeight: 1.8 }}>El vendedor DEBE subir la guia de envio dentro de las 48 horas siguientes al pago. Sin guia de envio, el pago NO sera liberado. DSM Market puede cancelar la orden si el vendedor no sube la guia en el tiempo establecido.</p>
        </div>
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 600, color: '#111', marginBottom: '0.75rem' }}>4. Politica de vendedores</h2>
          <p style={{ fontSize: '0.875rem', color: '#555', lineHeight: 1.8 }}>Para vender en DSM Market debes: ser mayor de edad, tener documento de identidad colombiano valido, subir copia de tu documento al registrarte, ser aprobado por el equipo de DSM Market y cumplir con los tiempos de envio declarados.</p>
        </div>
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 600, color: '#111', marginBottom: '0.75rem' }}>5. Politica antifraude</h2>
          <p style={{ fontSize: '0.875rem', color: '#555', lineHeight: 1.8 }}>DSM Market monitorea todas las transacciones. Cualquier actividad sospechosa puede resultar en la suspension inmediata de la cuenta. Queda prohibido publicar productos falsos, manipular resenas o realizar transacciones fuera de la plataforma.</p>
        </div>
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 600, color: '#111', marginBottom: '0.75rem' }}>6. Privacidad de datos</h2>
          <p style={{ fontSize: '0.875rem', color: '#555', lineHeight: 1.8 }}>Tus datos personales son tratados conforme a la Ley 1581 de 2012 de Colombia. No vendemos ni compartimos tu informacion con terceros sin tu consentimiento.</p>
        </div>
        <div style={{ marginTop: '3rem', padding: '1.5rem', background: '#fafafa', border: '1px solid #eee', borderLeft: '4px solid #C9A84C' }}>
          <p style={{ fontSize: '0.75rem', color: '#888', lineHeight: 1.7 }}>Version 1.0 — 2025 DSM Market Colombia</p>
        </div>
      </div>
    </div>
  )
}