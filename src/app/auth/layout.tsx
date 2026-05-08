export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex">

      {/* Panel izquierdo decorativo */}
      <div
        className="hidden lg:flex lg:w-[45%] flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: '#fff', borderRight: '1px solid #f0f0f0' }}
      >
        <div
          className="absolute top-0 right-0 w-px h-full opacity-20"
          style={{ background: 'linear-gradient(180deg, transparent, #C9A84C 30%, #C9A84C 70%, transparent)' }}
        />
        <div
          className="absolute bottom-0 left-12 right-12 h-px opacity-20"
          style={{ background: 'linear-gradient(90deg, transparent, #C9A84C, transparent)' }}
        />

        <div className="absolute top-12 right-12 opacity-10">
          <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
            <rect x="0" y="0" width="40" height="1" fill="#C9A84C" />
            <rect x="0" y="0" width="1" height="40" fill="#C9A84C" />
            <rect x="40" y="80" width="40" height="1" fill="#C9A84C" />
            <rect x="79" y="40" width="1" height="40" fill="#C9A84C" />
          </svg>
        </div>
        <div className="absolute bottom-12 left-12 opacity-10 rotate-180">
          <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
            <rect x="0" y="0" width="40" height="1" fill="#C9A84C" />
            <rect x="0" y="0" width="1" height="40" fill="#C9A84C" />
            <rect x="40" y="80" width="40" height="1" fill="#C9A84C" />
            <rect x="79" y="40" width="1" height="40" fill="#C9A84C" />
          </svg>
        </div>

        {/* Logo */}
        <div>
          <p className="font-display text-5xl font-light tracking-widest" style={{ color: '#C9A84C' }}>
            DMS
          </p>
          <p className="text-xs tracking-[0.3em] uppercase mt-1" style={{ color: '#999' }}>
            Market
          </p>
        </div>

        {/* Frase central */}
        <div>
          <div className="mb-8">
            <div className="w-8 h-px mb-6" style={{ background: '#C9A84C' }} />
            <p className="font-display text-3xl font-light leading-relaxed" style={{ color: '#111' }}>
              La plataforma donde
              <br />
              <em style={{ color: '#C9A84C' }}>el comercio</em> se
              <br />
              vuelve arte.
            </p>
          </div>
          <p className="text-sm leading-relaxed" style={{ color: '#888' }}>
            Conectamos compradores y vendedores con la precision y elegancia que su negocio merece.
          </p>

          <div style={{ marginTop: '2.5rem', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {['Pagos protegidos con escrow', 'Vendedores verificados', 'Soporte Colombia'].map(item => (
              <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#C9A84C', flexShrink: 0 }} />
                <span style={{ fontSize: '0.8rem', color: '#666' }}>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div>
          <p className="text-xs tracking-[0.2em] uppercase" style={{ color: '#bbb' }}>
            2025 DMS Market
          </p>
        </div>
      </div>

      {/* Panel derecho - formulario */}
      <div
        className="flex-1 flex items-center justify-center px-6 py-12"
        style={{ background: '#fff' }}
      >
        <div className="w-full max-w-[420px]">
          <div className="lg:hidden text-center mb-10">
            <p className="font-display text-4xl font-light tracking-widest" style={{ color: '#C9A84C' }}>
              DMS
            </p>
            <p className="text-xs tracking-[0.3em] uppercase mt-1" style={{ color: '#999' }}>
              Market
            </p>
          </div>

          {children}
        </div>
      </div>

    </div>
  )
}