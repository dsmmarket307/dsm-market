export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex">

      <div
        className="hidden lg:flex lg:w-[45%] flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: '#0B0B0B', borderRight: '1px solid rgba(212,175,55,0.15)' }}
      >
        <div className="absolute top-0 right-0 w-px h-full opacity-20"
          style={{ background: 'linear-gradient(180deg, transparent, #D4AF37 30%, #D4AF37 70%, transparent)' }} />
        <div className="absolute bottom-0 left-12 right-12 h-px opacity-20"
          style={{ background: 'linear-gradient(90deg, transparent, #D4AF37, transparent)' }} />

        <div className="absolute top-12 right-12 opacity-10">
          <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
            <rect x="0" y="0" width="40" height="1" fill="#D4AF37" />
            <rect x="0" y="0" width="1" height="40" fill="#D4AF37" />
            <rect x="40" y="80" width="40" height="1" fill="#D4AF37" />
            <rect x="79" y="40" width="1" height="40" fill="#D4AF37" />
          </svg>
        </div>
        <div className="absolute bottom-12 left-12 opacity-10 rotate-180">
          <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
            <rect x="0" y="0" width="40" height="1" fill="#D4AF37" />
            <rect x="0" y="0" width="1" height="40" fill="#D4AF37" />
            <rect x="40" y="80" width="40" height="1" fill="#D4AF37" />
            <rect x="79" y="40" width="1" height="40" fill="#D4AF37" />
          </svg>
        </div>

        <div>
          <p className="font-display text-5xl font-light tracking-widest" style={{ color: '#D4AF37' }}>DMS</p>
          <p className="text-xs tracking-[0.3em] uppercase mt-1" style={{ color: '#666' }}>Market</p>
        </div>

        <div>
          <div className="mb-8">
            <div className="w-8 h-px mb-6" style={{ background: '#D4AF37' }} />
            <p className="font-display text-3xl font-light leading-relaxed" style={{ color: '#fff' }}>
              La plataforma donde
              <br />
              <em style={{ color: '#D4AF37' }}>el comercio</em> se
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
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#D4AF37', flexShrink: 0 }} />
                <span style={{ fontSize: '0.8rem', color: '#888' }}>{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs tracking-[0.2em] uppercase" style={{ color: '#444' }}>2025 DMS Market</p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-12" style={{ background: '#0f0f0f' }}>
        <div className="w-full max-w-[420px]">
          <div className="lg:hidden text-center mb-10">
            <p className="font-display text-4xl font-light tracking-widest" style={{ color: '#D4AF37' }}>DMS</p>
            <p className="text-xs tracking-[0.3em] uppercase mt-1" style={{ color: '#666' }}>Market</p>
          </div>
          {children}
        </div>
      </div>

    </div>
  )
}
