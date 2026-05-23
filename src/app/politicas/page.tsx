export default function PoliticasPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#0B0B0B', fontFamily: "'Inter', sans-serif", color: '#e5e5e5' }}>

      {/* NAV */}
      <nav style={{ borderBottom: '1px solid #1a1a1a', padding: '0 2rem', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#0B0B0B', position: 'sticky', top: 0, zIndex: 100 }}>
        <a href="/" style={{ color: '#D4AF37', fontWeight: 700, fontSize: '1.2rem', letterSpacing: '3px', textDecoration: 'none' }}>DMS</a>
        <a href="/" style={{ color: '#888', fontSize: '0.8rem', textDecoration: 'none', letterSpacing: '1px' }}>← Volver al inicio</a>
      </nav>

      {/* HERO */}
      <div style={{ borderBottom: '1px solid #1a1a1a', padding: '4rem 2rem', textAlign: 'center', background: 'linear-gradient(180deg, #111 0%, #0B0B0B 100%)' }}>
        <p style={{ fontSize: '0.65rem', letterSpacing: '4px', textTransform: 'uppercase', color: '#D4AF37', marginBottom: '1rem' }}>Legal & Transparencia</p>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 300, color: '#f5f5f5', marginBottom: '1rem', letterSpacing: '1px' }}>Políticas de DMS Market</h1>
        <div style={{ width: '48px', height: '2px', background: '#D4AF37', margin: '0 auto 1.5rem' }} />
        <p style={{ fontSize: '0.875rem', color: '#666', maxWidth: '500px', margin: '0 auto', lineHeight: 1.8 }}>
          Estas políticas regulan el uso de nuestra plataforma. Al registrarte o realizar una compra, aceptas los términos aquí descritos.
        </p>
      </div>

      {/* ÍNDICE */}
      <div style={{ maxWidth: '820px', margin: '3rem auto 0', padding: '0 2rem' }}>
        <div style={{ background: '#111', border: '1px solid #1e1e1e', borderLeft: '3px solid #D4AF37', borderRadius: '4px', padding: '1.5rem 2rem', marginBottom: '3.5rem' }}>
          <p style={{ fontSize: '0.7rem', letterSpacing: '3px', textTransform: 'uppercase', color: '#D4AF37', marginBottom: '1rem' }}>Contenido</p>
          {[
            { label: '1. Términos y Condiciones', anchor: '#terminos' },
            { label: '2. Política de Privacidad', anchor: '#privacidad' },
            { label: '3. Política de Devoluciones', anchor: '#devoluciones' },
            { label: '4. Política de Envíos', anchor: '#envios' },
            { label: '5. Política de Vendedores', anchor: '#vendedores' },
          ].map((item) => (
            <a key={item.anchor} href={item.anchor} style={{ display: 'block', fontSize: '0.85rem', color: '#aaa', marginBottom: '0.4rem', lineHeight: 1.6, textDecoration: 'none' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#D4AF37')}
              onMouseLeave={e => (e.currentTarget.style.color = '#aaa')}>
              {item.label}
            </a>
          ))}
        </div>

        {/* SECCIÓN 1 - TÉRMINOS */}
        <section id="terminos" style={{ marginBottom: '3.5rem', scrollMarginTop: '80px' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '1rem', marginBottom: '1.5rem' }}>
            <span style={{ fontSize: '0.65rem', color: '#D4AF37', letterSpacing: '2px', fontWeight: 600 }}>01</span>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 500, color: '#f0f0f0', letterSpacing: '0.5px', margin: 0 }}>Términos y Condiciones</h2>
          </div>
          <div style={{ borderLeft: '1px solid #1e1e1e', paddingLeft: '1.5rem' }}>
            <Item titulo="Aceptación">Al acceder y usar DMS Market, aceptas cumplir estos términos. Si no estás de acuerdo, no uses la plataforma.</Item>
            <Item titulo="Uso permitido">La plataforma es exclusiva para la compra y venta de productos legales en Colombia. Queda prohibido publicar productos falsificados, ilegales o que infrinjan derechos de terceros.</Item>
            <Item titulo="Comisión de la plataforma">DMS Market cobra una comisión del <Gold>5%</Gold> sobre el valor de cada venta exitosa. Esta comisión se descuenta automáticamente del pago al vendedor. Ejemplo: producto de $100.000 COP — comisión DMS $5.000 — vendedor recibe $95.000.</Item>
            <Item titulo="Retención de pagos">El dinero de cada compra queda retenido por <Gold>7 días</Gold> después de confirmada la entrega. Pasados los 7 días sin reclamos, el pago se libera al vendedor.</Item>
            <Item titulo="Modificaciones">DMS Market se reserva el derecho de modificar estos términos en cualquier momento. Los cambios se notificarán con al menos 15 días de anticipación.</Item>
          </div>
        </section>

        <Divider />

        {/* SECCIÓN 2 - PRIVACIDAD */}
        <section id="privacidad" style={{ marginBottom: '3.5rem', scrollMarginTop: '80px' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '1rem', marginBottom: '1.5rem' }}>
            <span style={{ fontSize: '0.65rem', color: '#D4AF37', letterSpacing: '2px', fontWeight: 600 }}>02</span>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 500, color: '#f0f0f0', letterSpacing: '0.5px', margin: 0 }}>Política de Privacidad</h2>
          </div>
          <div style={{ borderLeft: '1px solid #1e1e1e', paddingLeft: '1.5rem' }}>
            <Item titulo="Datos recopilados">Recopilamos nombre, correo electrónico, número de teléfono, dirección de entrega y documento de identidad (para vendedores). Estos datos son necesarios para operar el marketplace.</Item>
            <Item titulo="Uso de datos">Tus datos se usan exclusivamente para procesar pedidos, verificar identidades de vendedores y mejorar la experiencia en la plataforma.</Item>
            <Item titulo="Cumplimiento legal">Tus datos personales son tratados conforme a la <Gold>Ley 1581 de 2012</Gold> de Colombia (Habeas Data). No vendemos ni compartimos tu información con terceros sin tu consentimiento expreso.</Item>
            <Item titulo="Seguridad">Utilizamos cifrado SSL y medidas de seguridad estándar de la industria para proteger tu información.</Item>
            <Item titulo="Tus derechos">Puedes solicitar en cualquier momento el acceso, corrección o eliminación de tus datos escribiendo a soporte@dmsmarket.co</Item>
          </div>
        </section>

        <Divider />

        {/* SECCIÓN 3 - DEVOLUCIONES */}
        <section id="devoluciones" style={{ marginBottom: '3.5rem', scrollMarginTop: '80px' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '1rem', marginBottom: '1.5rem' }}>
            <span style={{ fontSize: '0.65rem', color: '#D4AF37', letterSpacing: '2px', fontWeight: 600 }}>03</span>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 500, color: '#f0f0f0', letterSpacing: '0.5px', margin: 0 }}>Política de Devoluciones</h2>
          </div>
          <div style={{ borderLeft: '1px solid #1e1e1e', paddingLeft: '1.5rem' }}>
            <Item titulo="Plazo para reclamar">El comprador tiene <Gold>7 días calendario</Gold> desde la recepción del producto para reportar inconformidades o solicitar devolución.</Item>
            <Item titulo="Causales válidas">Se aceptan devoluciones por: producto defectuoso o dañado, producto diferente al descrito, producto no recibido después del plazo acordado.</Item>
            <Item titulo="Proceso">Para iniciar una devolución contacta a soporte@dmsmarket.co con foto del producto, número de orden y descripción del problema. DMS Market mediará entre comprador y vendedor.</Item>
            <Item titulo="Reembolso">Una vez aprobada la devolución, el reembolso se realiza en un plazo de <Gold>5 a 10 días hábiles</Gold> al método de pago original.</Item>
            <Item titulo="Exclusiones">No aplican devoluciones por cambio de opinión, productos usados o dañados por el comprador.</Item>
          </div>
        </section>

        <Divider />

        {/* SECCIÓN 4 - ENVÍOS */}
        <section id="envios" style={{ marginBottom: '3.5rem', scrollMarginTop: '80px' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '1rem', marginBottom: '1.5rem' }}>
            <span style={{ fontSize: '0.65rem', color: '#D4AF37', letterSpacing: '2px', fontWeight: 600 }}>04</span>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 500, color: '#f0f0f0', letterSpacing: '0.5px', margin: 0 }}>Política de Envíos</h2>
          </div>
          <div style={{ borderLeft: '1px solid #1e1e1e', paddingLeft: '1.5rem' }}>
            <Item titulo="Responsabilidad del vendedor">El vendedor es responsable de empacar y enviar el producto de forma segura. Debe subir la guía de envío dentro de las <Gold>48 horas</Gold> siguientes al pago confirmado.</Item>
            <Item titulo="Guía obligatoria">Sin guía de envío cargada en la plataforma, el pago <Gold>NO será liberado</Gold>. DMS Market puede cancelar la orden si el vendedor no cumple este requisito en el tiempo establecido.</Item>
            <Item titulo="Cobertura">Los envíos aplican a todo el territorio colombiano. Las tarifas y tiempos de entrega son responsabilidad de la transportadora seleccionada por el vendedor.</Item>
            <Item titulo="Seguimiento">El comprador recibirá el número de guía por correo electrónico y podrá hacer seguimiento directamente con la transportadora.</Item>
            <Item titulo="Pérdida en tránsito">En caso de pérdida del paquete, DMS Market iniciará una investigación con la transportadora. El vendedor debe tener seguro de envío para cubrir estas situaciones.</Item>
          </div>
        </section>

        <Divider />

        {/* SECCIÓN 5 - VENDEDORES */}
        <section id="vendedores" style={{ marginBottom: '3.5rem', scrollMarginTop: '80px' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '1rem', marginBottom: '1.5rem' }}>
            <span style={{ fontSize: '0.65rem', color: '#D4AF37', letterSpacing: '2px', fontWeight: 600 }}>05</span>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 500, color: '#f0f0f0', letterSpacing: '0.5px', margin: 0 }}>Política de Vendedores</h2>
          </div>
          <div style={{ borderLeft: '1px solid #1e1e1e', paddingLeft: '1.5rem' }}>
            <Item titulo="Requisitos para vender">Para vender en DMS Market debes: ser mayor de edad, tener documento de identidad colombiano válido, subir copia de tu documento al registrarte y ser aprobado por el equipo de DMS Market.</Item>
            <Item titulo="Aprobación de cuenta">El proceso de verificación toma entre <Gold>1 y 3 días hábiles</Gold>. Nos reservamos el derecho de rechazar solicitudes que no cumplan los requisitos.</Item>
            <Item titulo="Publicación de productos">Los productos deben tener descripción veraz, fotos reales y precio en pesos colombianos (COP). Queda prohibido publicar productos falsos, usados como nuevos o con imágenes engañosas.</Item>
            <Item titulo="Política antifraude">DMS Market monitorea todas las transacciones. Cualquier actividad sospechosa puede resultar en la suspensión inmediata de la cuenta. Queda prohibido manipular reseñas o realizar transacciones fuera de la plataforma.</Item>
            <Item titulo="Suspensión">Una cuenta puede ser suspendida por: incumplimiento de tiempos de envío, más de 3 devoluciones en un mes, fraude comprobado o violación de estos términos.</Item>
          </div>
        </section>

        {/* FOOTER LEGAL */}
        <div style={{ marginTop: '4rem', marginBottom: '4rem', padding: '1.5rem 2rem', background: '#111', border: '1px solid #1e1e1e', borderRadius: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          <p style={{ fontSize: '0.75rem', color: '#555', margin: 0 }}>Versión 2.0 · Mayo 2025 · DMS Market Colombia</p>
          <p style={{ fontSize: '0.75rem', color: '#555', margin: 0 }}>soporte@dmsmarket.co</p>
        </div>

      </div>
    </div>
  )
}

function Item({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '1.25rem' }}>
      <p style={{ fontSize: '0.8rem', fontWeight: 600, color: '#D4AF37', marginBottom: '0.35rem', letterSpacing: '0.5px' }}>{titulo}</p>
      <p style={{ fontSize: '0.875rem', color: '#888', lineHeight: 1.85, margin: 0 }}>{children}</p>
    </div>
  )
}

function Gold({ children }: { children: React.ReactNode }) {
  return <span style={{ color: '#D4AF37', fontWeight: 500 }}>{children}</span>
}

function Divider() {
  return <div style={{ width: '100%', height: '1px', background: '#1a1a1a', marginBottom: '3.5rem' }} />
}
