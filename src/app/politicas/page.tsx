export default function PoliticasPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#0B0B0B', fontFamily: "'Inter', sans-serif", color: '#e5e5e5' }}>

      {/* NAV */}
      <nav style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '0 clamp(1rem, 4vw, 2.5rem)', height: '68px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#0B0B0B', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 2px 20px rgba(0,0,0,0.3)' }}>
        <a href="/">
          <img src="https://awbepztacmvurjylfoas.supabase.co/storage/v1/object/public/assets/ChatGPT_Image_3_may_2026__21_13_12-removebg-preview.png" alt="DMS Market" style={{ height: '55px', width: 'auto', objectFit: 'contain' }} />
        </a>
        <a href="/" style={{ color: '#888', fontSize: '0.8rem', textDecoration: 'none', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
          Volver al inicio
        </a>
      </nav>

      {/* HERO */}
      <div style={{ background: 'linear-gradient(180deg, #111 0%, #0B0B0B 100%)', padding: 'clamp(2.5rem, 5vw, 4rem) clamp(1rem, 4vw, 2.5rem)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '2rem', flexWrap: 'wrap' }}>
          <div>
            <p style={{ fontSize: '0.65rem', letterSpacing: '4px', textTransform: 'uppercase', color: '#D4AF37', marginBottom: '0.75rem', fontWeight: 600 }}>Legal & Transparencia</p>
            <h1 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', fontWeight: 700, color: '#f5f5f5', marginBottom: '0.75rem' }}>Términos y Condiciones</h1>
            <div style={{ width: '40px', height: '2px', background: '#D4AF37', marginBottom: '1rem' }} />
            <p style={{ fontSize: '0.875rem', color: '#666', maxWidth: '480px', lineHeight: 1.8 }}>Al utilizar DMS Market, aceptas nuestros Términos y Condiciones. Lee detenidamente las políticas que rigen el uso de nuestra plataforma.</p>
          </div>
          <div style={{ width: '140px', height: '140px', background: 'linear-gradient(135deg, #1a1a1a, #222)', border: '1px solid rgba(212,175,55,0.2)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="72" height="72" viewBox="0 0 24 24" fill="none">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="#D4AF37" strokeWidth="1.5" fill="rgba(212,175,55,0.1)"/>
              <path d="M9 12l2 2 4-4" stroke="#D4AF37" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
        </div>
      </div>

      {/* LAYOUT PRINCIPAL */}
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '3rem clamp(1rem, 4vw, 2rem)', display: 'grid', gridTemplateColumns: 'clamp(180px, 25%, 240px) 1fr', gap: '2.5rem', alignItems: 'start' }}>

        {/* SIDEBAR */}
        <div style={{ position: 'sticky', top: '88px' }}>
          {/* ÍNDICE */}
          <div style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.25rem' }}>
            {[
              { num: '1', label: 'Términos y Condiciones', anchor: '#terminos', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
              { num: '2', label: 'Política de Privacidad', anchor: '#privacidad', icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' },
              { num: '3', label: 'Política de Devoluciones', anchor: '#devoluciones', icon: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15' },
              { num: '4', label: 'Política de Envíos', anchor: '#envios', icon: 'M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4' },
              { num: '5', label: 'Política de Vendedores', anchor: '#vendedores', icon: 'M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z' },
            ].map((item) => (
              <a key={item.anchor} href={item.anchor} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', borderRadius: '8px', textDecoration: 'none', marginBottom: '0.25rem', color: '#aaa', fontSize: '0.8rem' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="1.5"><path d={item.icon}/></svg>
                {item.label}
              </a>
            ))}
          </div>

          {/* SELLO */}
          <div style={{ background: '#111', border: '1px solid rgba(212,175,55,0.2)', borderRadius: '12px', padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              <p style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fff', margin: 0 }}>Compra y vende con confianza en DMS Market</p>
            </div>
            {['Transacciones seguras', 'Protección al comprador', 'Soporte especializado', 'Pagos protegidos'].map(item => (
              <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="2"><path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="10"/></svg>
                <span style={{ fontSize: '0.75rem', color: '#888' }}>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CONTENIDO */}
        <div>

          {/* SECCIÓN 1 - TÉRMINOS */}
          <section id="terminos" style={{ marginBottom: '3rem', scrollMarginTop: '88px' }}>

            {/* Comisión */}
            <div style={{ marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ width: '32px', height: '32px', background: '#D4AF37', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0B0B0B' }}>1</span>
                </div>
                <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#f0f0f0', margin: 0 }}>Comisión de la plataforma</h2>
              </div>
              <p style={{ fontSize: '0.875rem', color: '#888', lineHeight: 1.85, marginBottom: '1.25rem' }}>
                DMS Market cobra una comisión del <span style={{ color: '#D4AF37', fontWeight: 600 }}>5%</span> sobre el valor de cada venta exitosa. Esta comisión se descuenta automáticamente del pago correspondiente al vendedor.
              </p>

              {/* Ejemplo */}
              <div style={{ background: '#141414', border: '1px solid #222', borderRadius: '10px', padding: '1.25rem', marginBottom: '1.25rem' }}>
                <p style={{ fontSize: '0.75rem', color: '#D4AF37', fontWeight: 700, marginBottom: '0.5rem', letterSpacing: '1px' }}>Ejemplo:</p>
                <p style={{ fontSize: '0.85rem', color: '#ccc', marginBottom: '1rem', fontWeight: 600 }}>Producto de $100.000 COP</p>
                {[
                  { label: 'Comisión DMS Market (5%)', value: '$5.000 COP' },
                  { label: 'Comisión Mercado Pago (3.29% + IVA)', value: 'Calculado automáticamente' },
                  { label: 'Valor restante transferido al vendedor', value: 'Después de descuentos aplicables' },
                ].map(row => (
                  <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0', borderTop: '1px solid #1e1e1e', gap: '1rem', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ width: '5px', height: '5px', background: '#D4AF37', borderRadius: '50%', flexShrink: 0 }} />
                      <span style={{ fontSize: '0.8rem', color: '#aaa' }}>{row.label}</span>
                    </div>
                    <span style={{ fontSize: '0.8rem', color: '#ccc', fontWeight: 500 }}>{row.value}</span>
                  </div>
                ))}
              </div>

              <p style={{ fontSize: '0.875rem', color: '#888', lineHeight: 1.85, marginBottom: '0.75rem' }}>
                Todas las ventas realizadas dentro de DMS Market <span style={{ color: '#f0f0f0', fontWeight: 600 }}>incluyen costos de procesamiento de pagos correspondientes a Mercado Pago</span> equivalentes al <span style={{ color: '#D4AF37', fontWeight: 600 }}>3.29% + IVA</span> por transacción realizada.
              </p>
              <p style={{ fontSize: '0.875rem', color: '#888', lineHeight: 1.85 }}>
                Estas comisiones se aplican <span style={{ color: '#f0f0f0', fontWeight: 600 }}>automáticamente</span> sobre cada venta procesada dentro de la plataforma.
              </p>
            </div>

            <Divider />

            {/* Retención */}
            <Item titulo="Retención de pagos">
              El dinero de cada compra queda retenido por <Gold>7 días</Gold> después de confirmada la entrega. Pasados los 7 días sin reclamos, el pago se libera al vendedor.
            </Item>
            <Item titulo="Uso permitido">
              La plataforma es exclusiva para la compra y venta de productos legales en Colombia. Queda prohibido publicar productos falsificados, ilegales o que infrinjan derechos de terceros.
            </Item>
            <Item titulo="Modificaciones">
              DMS Market se reserva el derecho de modificar estos términos en cualquier momento. Los cambios se notificarán con al menos 15 días de anticipación.
            </Item>
          </section>

          <Divider />

          {/* SECCIÓN 2 - PRIVACIDAD */}
          <section id="privacidad" style={{ marginBottom: '3rem', scrollMarginTop: '88px' }}>
            <SectionHeader numero="2" titulo="Política de Privacidad" />
            <Item titulo="Datos recopilados">Recopilamos nombre, correo electrónico, número de teléfono, dirección de entrega y documento de identidad (para vendedores). Estos datos son necesarios para operar el marketplace.</Item>
            <Item titulo="Uso de datos">Tus datos se usan exclusivamente para procesar pedidos, verificar identidades de vendedores y mejorar la experiencia en la plataforma.</Item>
            <Item titulo="Cumplimiento legal">Tus datos personales son tratados conforme a la <Gold>Ley 1581 de 2012</Gold> de Colombia (Habeas Data). No vendemos ni compartimos tu información con terceros sin tu consentimiento expreso.</Item>
            <Item titulo="Seguridad">Utilizamos cifrado SSL y medidas de seguridad estándar de la industria para proteger tu información.</Item>
            <Item titulo="Tus derechos">Puedes solicitar en cualquier momento el acceso, corrección o eliminación de tus datos escribiendo a soporte@dmsmarket.co</Item>
          </section>

          <Divider />

          {/* SECCIÓN 3 - DEVOLUCIONES */}
          <section id="devoluciones" style={{ marginBottom: '3rem', scrollMarginTop: '88px' }}>
            <SectionHeader numero="3" titulo="Política de Devoluciones" />
            <Item titulo="Plazo para reclamar">El comprador tiene <Gold>7 días calendario</Gold> desde la recepción del producto para reportar inconformidades o solicitar devolución.</Item>
            <Item titulo="Causales válidas">Se aceptan devoluciones por: producto defectuoso o dañado, producto diferente al descrito, producto no recibido después del plazo acordado.</Item>
            <Item titulo="Proceso">Para iniciar una devolución contacta a soporte@dmsmarket.co con foto del producto, número de orden y descripción del problema. DMS Market mediará entre comprador y vendedor.</Item>
            <Item titulo="Reembolso">Una vez aprobada la devolución, el reembolso se realiza en un plazo de <Gold>5 a 10 días hábiles</Gold> al método de pago original.</Item>
            <Item titulo="Exclusiones">No aplican devoluciones por cambio de opinión, productos usados o dañados por el comprador.</Item>
          </section>

          <Divider />

          {/* SECCIÓN 4 - ENVÍOS */}
          <section id="envios" style={{ marginBottom: '3rem', scrollMarginTop: '88px' }}>
            <SectionHeader numero="4" titulo="Política de Envíos" />
            <Item titulo="Responsabilidad del vendedor">El vendedor es responsable de empacar y enviar el producto de forma segura. Debe subir la guía de envío dentro de las <Gold>48 horas</Gold> siguientes al pago confirmado.</Item>
            <Item titulo="Guía obligatoria">Sin guía de envío cargada en la plataforma, el pago <Gold>NO será liberado</Gold>. DMS Market puede cancelar la orden si el vendedor no cumple este requisito en el tiempo establecido.</Item>
            <Item titulo="Cobertura">Los envíos aplican a todo el territorio colombiano. Las tarifas y tiempos de entrega son responsabilidad de la transportadora seleccionada por el vendedor.</Item>
            <Item titulo="Seguimiento">El comprador recibirá el número de guía por correo electrónico y podrá hacer seguimiento directamente con la transportadora.</Item>
            <Item titulo="Pérdida en tránsito">En caso de pérdida del paquete, DMS Market iniciará una investigación con la transportadora. El vendedor debe tener seguro de envío para cubrir estas situaciones.</Item>
          </section>

          <Divider />

          {/* SECCIÓN 5 - VENDEDORES */}
          <section id="vendedores" style={{ marginBottom: '3rem', scrollMarginTop: '88px' }}>
            <SectionHeader numero="5" titulo="Política de Vendedores" />
            <Item titulo="Requisitos para vender">Para vender en DMS Market debes: ser mayor de edad, tener documento de identidad colombiano válido, subir copia de tu documento al registrarte y ser aprobado por el equipo de DMS Market.</Item>
            <Item titulo="Aprobación de cuenta">El proceso de verificación toma entre <Gold>1 y 3 días hábiles</Gold>. Nos reservamos el derecho de rechazar solicitudes que no cumplan los requisitos.</Item>
            <Item titulo="Publicación de productos">Los productos deben tener descripción veraz, fotos reales y precio en pesos colombianos (COP). Queda prohibido publicar productos falsos, usados como nuevos o con imágenes engañosas.</Item>
            <Item titulo="Transferencia de dinero">
              Los fondos generados por las ventas realizadas dentro de la plataforma serán transferidos <Gold>únicamente a la cuenta bancaria registrada</Gold> por el vendedor en DMS Market.<br /><br />
              El vendedor es responsable de <Gold>verificar correctamente</Gold> la información bancaria y método de pago configurado en su cuenta.<br /><br />
              DMS Market no se hace responsable por transferencias fallidas ocasionadas por datos bancarios incorrectos ingresados por el vendedor.
            </Item>
            <Item titulo="Política antifraude">DMS Market monitorea todas las transacciones. Cualquier actividad sospechosa puede resultar en la suspensión inmediata de la cuenta. Queda prohibido manipular reseñas o realizar transacciones fuera de la plataforma.</Item>
            <Item titulo="Suspensión">Una cuenta puede ser suspendida por: incumplimiento de tiempos de envío, más de 3 devoluciones en un mes, fraude comprobado o violación de estos términos.</Item>
          </section>

          {/* FOOTER LEGAL */}
          <div style={{ marginTop: '3rem', padding: '1.5rem 2rem', background: '#111', border: '1px solid #1e1e1e', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
            <p style={{ fontSize: '0.75rem', color: '#555', margin: 0 }}>Versión 2.0 · Mayo 2025 · DMS Market Colombia</p>
            <p style={{ fontSize: '0.75rem', color: '#555', margin: 0 }}>soporte@dmsmarket.co</p>
          </div>

        </div>
      </div>

      {/* SELLOS BOTTOM */}
      <div style={{ background: '#0B0B0B', borderTop: '1px solid rgba(255,255,255,0.06)', padding: '2rem clamp(1rem, 4vw, 2.5rem)' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1.5rem' }}>
          {[
            { icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z', title: 'Compra segura', desc: 'Protegemos tu dinero en cada compra' },
            { icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z', title: 'Pagos protegidos', desc: 'Tus pagos están 100% protegidos' },
            { icon: 'M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z', title: 'Soporte 24/7', desc: 'Estamos aquí para ayudarte siempre' },
            { icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', title: 'Confianza y transparencia', desc: 'Políticas claras para una mejor experiencia' },
          ].map(item => (
            <div key={item.title} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="1.5" style={{ flexShrink: 0, marginTop: '2px' }}><path d={item.icon}/></svg>
              <div>
                <p style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fff', margin: '0 0 0.25rem' }}>{item.title}</p>
                <p style={{ fontSize: '0.75rem', color: '#666', margin: 0, lineHeight: 1.5 }}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}

function SectionHeader({ numero, titulo }: { numero: string; titulo: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
      <div style={{ width: '32px', height: '32px', background: '#D4AF37', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0B0B0B' }}>{numero}</span>
      </div>
      <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#f0f0f0', margin: 0 }}>{titulo}</h2>
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
  return <div style={{ width: '100%', height: '1px', background: '#1a1a1a', margin: '2rem 0' }} />
}