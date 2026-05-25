import { notFound } from "next/navigation"
import { createClient } from "@supabase/supabase-js"

export default async function ServiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: service } = await supabase
    .from("services")
    .select("*")
    .eq("id", id)
    .single()

  if (!service) notFound()

  const { data: related } = await supabase
    .from("services")
    .select("id, business_name, category, price, service_image_url, avg_rating, review_count")
    .eq("status", "approved")
    .eq("category", service.category)
    .neq("id", id)
    .limit(4)

  const waUrl = `https://wa.me/57${(service.whatsapp || service.phone || "").replace(/\D/g, "")}?text=${encodeURIComponent("Hola, vi tu servicio en DMS Market: " + service.business_name + ". Me gustaria obtener mas informacion.")}`

  const rating = service.avg_rating ?? 4.9
  const reviewCount = service.review_count ?? 0
  const saleCount = service.sale_count ?? 0
  const isPremium = service.plan_type === "premium"
  const isPro = service.plan_type === "pro"
  const planLabel = isPremium ? "Premium Partner" : isPro ? "Pro" : "Verificado"
  const imageUrl = service.service_image_url || "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&q=80"

  const benefits = [
    "Compra y venta de propiedades",
    "Inversion inmobiliaria",
    "Avaluos y asesoria",
    "Gestion de proyectos",
    "Consultoria personalizada",
  ]

  const stars = (n: number) => Array.from({ length: 5 }, (_, i) => i < Math.floor(n) ? "★" : "☆").join("")

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .detail-root { font-family: 'DM Sans', sans-serif; background: #F7F7F8; min-height: 100vh; color: #111; }
        .detail-topbar { background: #fff; border-bottom: 1px solid #E8E8E8; padding: 12px 0; }
        .detail-topbar-inner { max-width: 1200px; margin: 0 auto; padding: 0 24px; display: flex; align-items: center; gap: 8px; font-size: 0.82rem; color: #888; }
        .detail-topbar-inner a { color: #D4AF37; text-decoration: none; font-weight: 500; display: flex; align-items: center; gap: 4px; }
        .bc-sep { color: #ccc; }
        .detail-hero { background: #fff; border-bottom: 1px solid #E8E8E8; padding: 28px 0 0; }
        .detail-hero-inner { max-width: 1200px; margin: 0 auto; padding: 0 24px; }
        .detail-badges-row { display: flex; align-items: center; gap: 10px; margin-bottom: 14px; flex-wrap: wrap; }
        .badge { display: inline-flex; align-items: center; gap: 6px; padding: 4px 12px; border-radius: 20px; font-size: 0.75rem; font-weight: 600; }
        .badge-premium { background: linear-gradient(135deg,#D4AF37,#F5D978); color: #7a5c00; }
        .badge-pro { background: #EFF6FF; color: #1d4ed8; border: 1px solid #BFDBFE; }
        .badge-verified { background: #F0FDF4; color: #15803d; border: 1px solid #BBF7D0; }
        .badge-category { background: #F3F4F6; color: #374151; border: 1px solid #E5E7EB; }
        .detail-title { font-family: 'Sora', sans-serif; font-size: clamp(1.6rem,3vw,2.2rem); font-weight: 700; color: #0D0D0D; line-height: 1.25; margin-bottom: 10px; letter-spacing: -0.02em; }
        .detail-subtitle { font-size: 1rem; color: #555; line-height: 1.6; margin-bottom: 16px; max-width: 700px; }
        .detail-meta-row { display: flex; align-items: center; gap: 20px; flex-wrap: wrap; font-size: 0.875rem; color: #555; padding-bottom: 20px; }
        .meta-item { display: flex; align-items: center; gap: 6px; }
        .meta-stars { color: #F59E0B; }
        .meta-rating { font-weight: 700; color: #111; }
        .meta-reviews { color: #888; }
        .meta-divider { width: 1px; height: 14px; background: #E0E0E0; }
        .detail-body { max-width: 1200px; margin: 0 auto; padding: 32px 24px; display: grid; grid-template-columns: 1fr 340px; gap: 32px; align-items: start; }
        @media (max-width: 900px) { .detail-body { grid-template-columns: 1fr; } .detail-sidebar { position: static !important; } }
        .detail-left { display: flex; flex-direction: column; gap: 24px; }
        .card { background: #fff; border-radius: 16px; border: 1px solid #EBEBEB; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.04); }
        .card-pad { padding: 28px; }
        .detail-image-wrap { width: 100%; aspect-ratio: 16/9; overflow: hidden; border-radius: 16px; border: 1px solid #EBEBEB; position: relative; background: #f0f0f0; }
        .detail-image-wrap img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform 0.5s ease; }
        .detail-image-wrap:hover img { transform: scale(1.03); }
        .image-plan-badge { position: absolute; top: 16px; left: 16px; padding: 6px 14px; border-radius: 20px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; display: flex; align-items: center; gap: 6px; }
        .tabs-row { display: flex; border-bottom: 1px solid #EBEBEB; padding: 0 28px; overflow-x: auto; scrollbar-width: none; }
        .tab-btn { padding: 14px 16px; font-size: 0.875rem; font-weight: 500; color: #888; border: none; background: none; cursor: pointer; border-bottom: 2px solid transparent; white-space: nowrap; font-family: 'DM Sans', sans-serif; }
        .tab-btn.active { color: #D4AF37; border-bottom-color: #D4AF37; font-weight: 600; }
        .section-title { font-family: 'Sora', sans-serif; font-size: 1.1rem; font-weight: 700; color: #0D0D0D; margin-bottom: 16px; }
        .desc-text { font-size: 0.95rem; color: #444; line-height: 1.75; margin-bottom: 20px; }
        .spec-title { font-weight: 600; color: #111; font-size: 0.95rem; margin-bottom: 12px; }
        .benefit-list { display: flex; flex-direction: column; gap: 10px; }
        .benefit-item { display: flex; align-items: center; gap: 10px; font-size: 0.9rem; color: #333; }
        .benefit-icon { width: 20px; height: 20px; background: #FFF8E1; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; color: #D4AF37; }
        .commitment-box { background: #FAFAFA; border: 1px solid #F0F0F0; border-radius: 12px; padding: 18px 20px; display: flex; gap: 14px; align-items: flex-start; margin-top: 20px; }
        .commitment-icon { width: 36px; height: 36px; background: linear-gradient(135deg,#D4AF37,#F5D978); border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; color: #7a5c00; }
        .commitment-text { font-size: 0.875rem; color: #555; line-height: 1.6; }
        .trust-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        @media (max-width: 600px) { .trust-grid { grid-template-columns: 1fr; } }
        .trust-item { display: flex; align-items: center; gap: 12px; padding: 14px 16px; background: #FAFAFA; border-radius: 12px; border: 1px solid #F0F0F0; }
        .trust-icon { width: 38px; height: 38px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .trust-label { font-size: 0.85rem; font-weight: 600; color: #111; }
        .trust-desc { font-size: 0.78rem; color: #888; margin-top: 2px; }
        .related-grid { display: grid; grid-template-columns: repeat(auto-fill,minmax(180px,1fr)); gap: 16px; }
        .related-card { background: #fff; border-radius: 12px; border: 1px solid #EBEBEB; overflow: hidden; text-decoration: none; color: inherit; transition: transform 0.2s, box-shadow 0.2s; display: block; }
        .related-card:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(0,0,0,0.08); }
        .related-img { width: 100%; aspect-ratio: 4/3; object-fit: cover; display: block; background: #f0f0f0; }
        .related-info { padding: 12px; }
        .related-name { font-size: 0.82rem; font-weight: 600; color: #111; line-height: 1.4; margin-bottom: 6px; }
        .related-rating { font-size: 0.78rem; color: #F59E0B; }
        .related-price { font-size: 0.82rem; font-weight: 700; color: #111; margin-top: 4px; }
        .detail-sidebar { position: sticky; top: 24px; display: flex; flex-direction: column; gap: 16px; }
        .sidebar-card { background: #fff; border-radius: 16px; border: 1px solid #EBEBEB; box-shadow: 0 2px 12px rgba(0,0,0,0.06); overflow: hidden; }
        .sidebar-price-section { padding: 24px 24px 20px; border-bottom: 1px solid #F0F0F0; }
        .price-label { font-size: 0.75rem; color: #888; font-weight: 500; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 8px; }
        .price-value { font-family: 'Sora', sans-serif; font-size: 1.8rem; font-weight: 800; color: #0D0D0D; letter-spacing: -0.03em; line-height: 1; }
        .price-note { display: flex; align-items: center; gap: 6px; margin-top: 10px; font-size: 0.78rem; color: #888; background: #F9F9F9; border: 1px solid #F0F0F0; border-radius: 8px; padding: 8px 12px; }
        .sidebar-actions { padding: 20px 24px; display: flex; flex-direction: column; gap: 10px; }
        .btn-whatsapp { display: flex; align-items: center; justify-content: center; gap: 10px; padding: 14px 20px; background: linear-gradient(135deg,#25D366,#128C7E); color: #fff; border-radius: 12px; font-size: 0.95rem; font-weight: 700; text-decoration: none; transition: transform 0.2s, box-shadow 0.2s; box-shadow: 0 4px 14px rgba(37,211,102,0.3); font-family: 'DM Sans', sans-serif; }
        .btn-whatsapp:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(37,211,102,0.4); }
        .btn-quote { display: flex; align-items: center; justify-content: center; gap: 8px; padding: 13px 20px; background: #fff; color: #111; border: 1.5px solid #E0E0E0; border-radius: 12px; font-size: 0.9rem; font-weight: 600; cursor: pointer; transition: all 0.2s; font-family: 'DM Sans', sans-serif; width: 100%; }
        .btn-quote:hover { border-color: #D4AF37; color: #D4AF37; background: #FFFBF0; }
        .btn-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .btn-small { display: flex; align-items: center; justify-content: center; gap: 6px; padding: 10px 14px; background: #F7F7F8; color: #555; border: 1.5px solid #E8E8E8; border-radius: 10px; font-size: 0.82rem; font-weight: 500; cursor: pointer; transition: all 0.2s; font-family: 'DM Sans', sans-serif; width: 100%; }
        .btn-small:hover { background: #F0F0F0; color: #111; }
        .provider-section { padding: 20px 24px; border-top: 1px solid #F0F0F0; }
        .provider-header { font-size: 0.75rem; color: #888; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 14px; display: flex; align-items: center; gap: 6px; }
        .provider-dot { width: 8px; height: 8px; background: #22c55e; border-radius: 50%; display: inline-block; }
        .provider-row { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
        .provider-avatar { width: 48px; height: 48px; border-radius: 12px; background: linear-gradient(135deg,#D4AF37,#F5D978); display: flex; align-items: center; justify-content: center; font-size: 1.2rem; font-weight: 700; color: #7a5c00; flex-shrink: 0; overflow: hidden; }
        .provider-avatar img { width: 100%; height: 100%; object-fit: cover; }
        .provider-name { font-weight: 700; font-size: 0.9rem; color: #111; margin-bottom: 3px; }
        .provider-stars { font-size: 0.8rem; color: #F59E0B; }
        .provider-stats { display: flex; flex-direction: column; gap: 10px; }
        .stat-row { display: flex; justify-content: space-between; align-items: center; font-size: 0.83rem; }
        .stat-label { color: #888; display: flex; align-items: center; gap: 6px; }
        .stat-value { font-weight: 600; color: #111; }
        .btn-profile { display: flex; align-items: center; justify-content: center; padding: 11px 20px; border: 1.5px solid #E0E0E0; border-radius: 10px; font-size: 0.85rem; font-weight: 600; color: #555; cursor: pointer; transition: all 0.2s; margin-top: 16px; background: #fff; width: 100%; font-family: 'DM Sans', sans-serif; }
        .btn-profile:hover { border-color: #D4AF37; color: #D4AF37; }
        .trust-sidebar { padding: 20px 24px; border-top: 1px solid #F0F0F0; }
        .trust-sidebar-title { font-size: 0.875rem; font-weight: 700; color: #111; margin-bottom: 14px; }
        .trust-sidebar-list { display: flex; flex-direction: column; gap: 10px; }
        .trust-sidebar-item { display: flex; align-items: center; gap: 10px; font-size: 0.82rem; color: #555; }
        .icon-svg { display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
      `}</style>

      <div className="detail-root">

        <div className="detail-topbar">
          <div className="detail-topbar-inner">
            <a href="/servicios">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
              Volver
            </a>
            <span className="bc-sep">›</span>
            <span>Servicios</span>
            <span className="bc-sep">›</span>
            <span>{service.category}</span>
            <span className="bc-sep">›</span>
            <span style={{ color: "#111", fontWeight: 500 }}>{service.business_name}</span>
          </div>
        </div>

        <div className="detail-hero">
          <div className="detail-hero-inner">
            <div className="detail-badges-row">
              {isPremium && (
                <span className="badge badge-premium">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                  {planLabel}
                </span>
              )}
              {isPro && !isPremium && (
                <span className="badge badge-pro">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                  {planLabel}
                </span>
              )}
              {!isPremium && !isPro && (
                <span className="badge badge-verified">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>
                  {planLabel}
                </span>
              )}
              <span className="badge badge-category">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
                {service.category}
              </span>
            </div>

            <h1 className="detail-title">{service.business_name}</h1>
            <p className="detail-subtitle">{service.description?.slice(0, 160)}{service.description?.length > 160 ? "..." : ""}</p>

            <div className="detail-meta-row">
              {reviewCount > 0 && (
                <>
                  <div className="meta-item">
                    <span className="meta-stars">{stars(rating)}</span>
                    <span className="meta-rating">{Number(rating).toFixed(1)}</span>
                    <span className="meta-reviews">({reviewCount} resenas)</span>
                  </div>
                  <div className="meta-divider" />
                </>
              )}
              <div className="meta-item">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                <span>Proveedor verificado</span>
              </div>
              {saleCount > 0 && (
                <>
                  <div className="meta-divider" />
                  <div className="meta-item">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2"><path d="M20 6L9 17l-5-5"/></svg>
                    <span>{saleCount} proyectos completados</span>
                  </div>
                </>
              )}
              <div className="meta-divider" />
              <div className="meta-item">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                <span>{service.city}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="detail-body">
          <div className="detail-left">

            <div className="detail-image-wrap">
              <img src={imageUrl} alt={service.business_name} onError={(e: any) => { e.target.src = "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&q=80" }} />
              {(isPremium || isPro) && (
                <div className="image-plan-badge" style={{ background: isPremium ? "linear-gradient(135deg,#D4AF37,#F5D978)" : "#3b82f6", color: isPremium ? "#7a5c00" : "#fff" }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                  {isPremium ? "Premium" : "Pro"}
                </div>
              )}
            </div>

            <div className="card">
              <div className="tabs-row">
                <button className="tab-btn active">Descripcion</button>
                <button className="tab-btn">Que incluye</button>
                <button className="tab-btn">Beneficios</button>
                {reviewCount > 0 && <button className="tab-btn">Resenas ({reviewCount})</button>}
              </div>
              <div className="card-pad">
                <p className="section-title">Descripcion del servicio</p>
                <p className="desc-text">{service.description || "Este proveedor ofrece servicios de alta calidad. Contactanos para conocer mas detalles."}</p>
                <p className="spec-title">Especialistas en:</p>
                <div className="benefit-list">
                  {benefits.map((b, i) => (
                    <div key={i} className="benefit-item">
                      <div className="benefit-icon">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg>
                      </div>
                      <span>{b}</span>
                    </div>
                  ))}
                </div>
                <div className="commitment-box">
                  <div className="commitment-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                  </div>
                  <p className="commitment-text">Nuestro compromiso es brindarte seguridad, transparencia y las mejores oportunidades con acompanamiento personalizado y atencion confiable.</p>
                </div>
              </div>
            </div>

            <div className="card card-pad">
              <p className="section-title">Por que elegir DMS Market?</p>
              <div className="trust-grid">
                {[
                  { svg: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>, bg: "#EFF6FF", label: "Pago seguro", desc: "Transacciones protegidas" },
                  { svg: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#15803d" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>, bg: "#F0FDF4", label: "Proveedores verificados", desc: "Revisados por nuestro equipo" },
                  { svg: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#b45309" strokeWidth="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>, bg: "#FFFBEB", label: "Calidad garantizada", desc: "Satisfaccion asegurada" },
                  { svg: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>, bg: "#FDF4FF", label: "Soporte 24/7", desc: "Siempre disponibles" },
                ].map((t, i) => (
                  <div key={i} className="trust-item">
                    <div className="trust-icon" style={{ background: t.bg }}>{t.svg}</div>
                    <div><div className="trust-label">{t.label}</div><div className="trust-desc">{t.desc}</div></div>
                  </div>
                ))}
              </div>
            </div>

            {related && related.length > 0 && (
              <div className="card card-pad">
                <p className="section-title">Servicios relacionados</p>
                <div className="related-grid">
                  {related.map((r: any) => (
                    <a key={r.id} href={`/servicios/${r.id}`} className="related-card">
                      <img className="related-img" src={r.service_image_url || "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&q=70"} alt={r.business_name} onError={(e: any) => { e.target.src = "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&q=70" }} />
                      <div className="related-info">
                        <div className="related-name">{r.business_name}</div>
                        {r.avg_rating && <div className="related-rating">{"★".repeat(Math.floor(r.avg_rating))} {Number(r.avg_rating).toFixed(1)}</div>}
                        {r.price && <div className="related-price">Desde {r.price}</div>}
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="detail-sidebar">
            <div className="sidebar-card">
              <div className="sidebar-price-section">
                <div className="price-label">Precio del servicio</div>
                <div className="price-value">{service.price || "Consultar"}</div>
                <div className="price-note">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
                  <span>Precio estimado segun el alcance del proyecto</span>
                </div>
              </div>

              <div className="sidebar-actions">
                <a href={waUrl} target="_blank" rel="noopener noreferrer" className="btn-whatsapp">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.556 4.116 1.528 5.845L.057 23.428a.5.5 0 0 0 .515.572l5.736-1.505A11.945 11.945 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.96 0-3.8-.538-5.373-1.47l-.385-.228-3.985 1.046 1.065-3.888-.251-.4A9.956 9.956 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg>
                  Contactar por WhatsApp
                </a>
                <button className="btn-quote">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                  Solicitar cotizacion
                </button>
                <div className="btn-row">
                  <button className="btn-small">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                    Guardar
                  </button>
                  <button className="btn-small">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
                    Compartir
                  </button>
                </div>
              </div>

              <div className="provider-section">
                <div className="provider-header">
                  <span className="provider-dot" />
                  Proveedor verificado
                </div>
                <div className="provider-row">
                  <div className="provider-avatar">
                    {service.avatar_url ? <img src={service.avatar_url} alt={service.business_name} /> : service.business_name?.[0]?.toUpperCase() || "P"}
                  </div>
                  <div>
                    <div className="provider-name">{service.business_name}</div>
                    <div className="provider-stars">{"★".repeat(Math.floor(rating))} {Number(rating).toFixed(1)} ({reviewCount} resenas)</div>
                  </div>
                </div>
                <div className="provider-stats">
                  {[
                    { icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>, label: "Tiempo de respuesta", value: "1 hora" },
                    { icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>, label: "Miembro desde", value: new Date(service.created_at).toLocaleDateString("es-CO", { month: "short", year: "numeric" }) },
                    { icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>, label: "Proyectos completados", value: saleCount > 0 ? saleCount : "—" },
                    { icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>, label: "Satisfaccion del cliente", value: "98%" },
                  ].map((s, i) => (
                    <div key={i} className="stat-row">
                      <span className="stat-label">{s.icon}{s.label}</span>
                      <span className="stat-value">{s.value}</span>
                    </div>
                  ))}
                </div>
                <button className="btn-profile">Ver perfil del proveedor</button>
              </div>

              <div className="trust-sidebar">
                <div className="trust-sidebar-title">Pago seguro garantizado</div>
                <div className="trust-sidebar-list">
                  {[
                    { icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>, text: "Tu pago esta protegido con DMS Market" },
                    { icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>, text: "Proveedores verificados" },
                    { icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>, text: "Soporte 24/7" },
                    { icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>, text: "Garantia de satisfaccion" },
                  ].map((t, i) => (
                    <div key={i} className="trust-sidebar-item">
                      {t.icon}
                      <span>{t.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
