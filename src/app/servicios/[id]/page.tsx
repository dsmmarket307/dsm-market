import { notFound } from "next/navigation"
import { createClient } from "@supabase/supabase-js"

export default async function ServiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase environment variables")
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  const { data: service, error } = await supabase
    .from("services")
    .select("*")
    .eq("id", id)
    .single()

  if (error || !service) notFound()

  const { data: related } = await supabase
    .from("services")
    .select("id, business_name, category, price, service_image_url, avg_rating, review_count")
    .eq("status", "approved")
    .eq("category", service.category)
    .neq("id", id)
    .limit(4)

  const waUrl = `https://wa.me/57${(service.whatsapp || service.phone || "").replace(/\D/g, "")}?text=${encodeURIComponent("Hola, vi tu servicio en DMS Market: " + service.business_name)}`

  const rating = service.avg_rating ?? 4.9
  const reviewCount = service.review_count ?? 0
  const saleCount = service.sale_count ?? 0
  const isPremium = service.plan_type === "premium"
  const isPro = service.plan_type === "pro"
  const planLabel = isPremium ? "Premium Partner" : isPro ? "Pro" : "Verificado"
  const imageUrl = service.service_image_url || "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1400&q=85"
  const memberSince = new Date(service.created_at).toLocaleDateString("es-CO", { month: "short", year: "numeric" })
  const benefits = [
    "Compra y venta de propiedades",
    "Inversión inmobiliaria",
    "Avalúos y asesoría",
    "Gestión de proyectos",
    "Consultoría personalizada",
  ]

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=Outfit:wght@300;400;500;600;700&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --gold: #C9A84C;
          --gold-light: #E8C97A;
          --gold-pale: #FBF5E6;
          --black: #0A0A0A;
          --ink: #1A1A2E;
          --slate: #4A5568;
          --muted: #8892A4;
          --border: #E8EAF0;
          --surface: #F8F9FC;
          --white: #FFFFFF;
          --green: #0F9D58;
          --green-pale: #E8F5E9;
          --blue-pale: #EEF2FF;
          --blue: #4361EE;
          --radius-sm: 8px;
          --radius-md: 14px;
          --radius-lg: 20px;
          --shadow-sm: 0 1px 4px rgba(0,0,0,0.06);
          --shadow-md: 0 4px 20px rgba(0,0,0,0.08);
          --shadow-lg: 0 12px 40px rgba(0,0,0,0.12);
          --shadow-gold: 0 6px 24px rgba(201,168,76,0.28);
        }

        .sd-root {
          font-family: 'Outfit', sans-serif;
          background: var(--surface);
          min-height: 100vh;
          color: var(--ink);
          -webkit-font-smoothing: antialiased;
        }

        .sd-nav {
          background: var(--white);
          border-bottom: 1px solid var(--border);
          padding: 13px 0;
        }
        .sd-nav-inner {
          max-width: 1240px;
          margin: 0 auto;
          padding: 0 28px;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.8rem;
          color: var(--muted);
          flex-wrap: wrap;
        }
        .sd-nav-inner a {
          color: var(--gold);
          text-decoration: none;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 5px;
          transition: opacity 0.2s;
        }
        .sd-nav-inner a:hover { opacity: 0.75; }
        .bc-sep { color: var(--border); font-size: 1rem; }
        .bc-cur { color: var(--ink); font-weight: 500; }

        .sd-hero {
          background: var(--white);
          border-bottom: 1px solid var(--border);
          padding: 32px 0 0;
        }
        .sd-hero-inner {
          max-width: 1240px;
          margin: 0 auto;
          padding: 0 28px;
        }
        .sd-badges {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 16px;
          flex-wrap: wrap;
        }
        .sd-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 4px 11px;
          border-radius: 100px;
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }
        .badge-gold {
          background: linear-gradient(135deg, var(--gold), var(--gold-light));
          color: #5c3d00;
          box-shadow: 0 2px 8px rgba(201,168,76,0.3);
        }
        .badge-pro {
          background: var(--blue-pale);
          color: var(--blue);
          border: 1px solid #C7D2FE;
        }
        .badge-ok {
          background: var(--green-pale);
          color: var(--green);
          border: 1px solid #A7D7C5;
        }
        .badge-cat {
          background: var(--surface);
          color: var(--slate);
          border: 1px solid var(--border);
        }

        .sd-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(1.7rem, 3.5vw, 2.5rem);
          font-weight: 800;
          color: var(--black);
          line-height: 1.15;
          margin-bottom: 12px;
          letter-spacing: -0.02em;
        }
        .sd-subtitle {
          font-size: 1rem;
          color: var(--slate);
          line-height: 1.7;
          margin-bottom: 20px;
          max-width: 680px;
          font-weight: 400;
        }
        .sd-meta {
          display: flex;
          align-items: center;
          gap: 20px;
          padding-bottom: 24px;
          flex-wrap: wrap;
          font-size: 0.855rem;
          color: var(--slate);
        }
        .sd-meta-item { display: flex; align-items: center; gap: 6px; }
        .sd-meta-stars { color: #F59E0B; letter-spacing: 1px; font-size: 0.85rem; }
        .sd-meta-score { font-weight: 700; color: var(--black); }
        .sd-meta-count { color: var(--muted); }
        .sd-divider { width: 1px; height: 16px; background: var(--border); }

        .sd-body {
          max-width: 1240px;
          margin: 0 auto;
          padding: 36px 28px;
          display: grid;
          grid-template-columns: 1fr 360px;
          gap: 28px;
          align-items: start;
        }
        @media (max-width: 960px) {
          .sd-body { grid-template-columns: 1fr; }
          .sd-sidebar { position: static !important; }
        }
        @media (max-width: 640px) {
          .sd-body { padding: 20px 16px; gap: 20px; }
          .sd-hero-inner { padding: 0 16px; }
          .sd-nav-inner { padding: 0 16px; }
        }

        .sd-left { display: flex; flex-direction: column; gap: 20px; }

        .sd-img-wrap {
          width: 100%;
          aspect-ratio: 16/9;
          border-radius: var(--radius-lg);
          overflow: hidden;
          position: relative;
          background: #e8e8e8;
          box-shadow: var(--shadow-md);
        }
        .sd-img-wrap img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }
        .sd-img-wrap:hover img { transform: scale(1.04); }
        .sd-img-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(10,10,10,0.35) 0%, transparent 50%);
          pointer-events: none;
        }
        .sd-img-badge {
          position: absolute;
          top: 18px;
          left: 18px;
          padding: 7px 16px;
          border-radius: 100px;
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          display: flex;
          align-items: center;
          gap: 6px;
          backdrop-filter: blur(8px);
        }
        .sd-img-badge-gold {
          background: linear-gradient(135deg, rgba(201,168,76,0.92), rgba(232,201,122,0.92));
          color: #4a2e00;
        }
        .sd-img-badge-blue {
          background: rgba(67,97,238,0.88);
          color: #fff;
        }
        .sd-img-loc {
          position: absolute;
          bottom: 18px;
          left: 18px;
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.8rem;
          font-weight: 600;
          color: #fff;
          background: rgba(10,10,10,0.55);
          backdrop-filter: blur(8px);
          padding: 6px 12px;
          border-radius: 100px;
        }

        .sd-card {
          background: var(--white);
          border-radius: var(--radius-lg);
          border: 1px solid var(--border);
          box-shadow: var(--shadow-sm);
          overflow: hidden;
        }
        .sd-card-body { padding: 28px; }

        .sd-sec-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.15rem;
          font-weight: 700;
          color: var(--black);
          margin-bottom: 18px;
          letter-spacing: -0.01em;
        }

        .sd-desc {
          font-size: 0.95rem;
          color: var(--slate);
          line-height: 1.8;
          margin-bottom: 24px;
        }
        .sd-spec-label {
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--muted);
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin-bottom: 14px;
        }
        .sd-benefits {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin-bottom: 22px;
        }
        @media (max-width: 540px) { .sd-benefits { grid-template-columns: 1fr; } }
        .sd-benefit {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 0.875rem;
          color: var(--ink);
          padding: 10px 14px;
          background: var(--gold-pale);
          border-radius: var(--radius-sm);
          border: 1px solid #f0e4c0;
          font-weight: 500;
        }
        .sd-benefit-dot {
          width: 7px;
          height: 7px;
          background: var(--gold);
          border-radius: 50%;
          flex-shrink: 0;
        }

        .sd-commit {
          background: linear-gradient(135deg, #FBF5E6, #FFF8EC);
          border: 1px solid #EDD87A44;
          border-radius: var(--radius-md);
          padding: 20px;
          display: flex;
          gap: 14px;
          align-items: flex-start;
        }
        .sd-commit-icon {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          background: linear-gradient(135deg, var(--gold), var(--gold-light));
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          color: #5c3d00;
          box-shadow: var(--shadow-gold);
        }
        .sd-commit-text {
          font-size: 0.875rem;
          color: var(--slate);
          line-height: 1.7;
        }
        .sd-commit-text strong { color: var(--black); font-weight: 600; }

        .sd-trust-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        @media (max-width: 540px) { .sd-trust-grid { grid-template-columns: 1fr; } }
        .sd-trust-item {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 16px 18px;
          background: var(--surface);
          border-radius: var(--radius-md);
          border: 1px solid var(--border);
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .sd-trust-item:hover {
          border-color: var(--gold-light);
          box-shadow: 0 3px 12px rgba(201,168,76,0.1);
        }
        .sd-trust-icon {
          width: 42px;
          height: 42px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .sd-trust-label { font-size: 0.85rem; font-weight: 700; color: var(--ink); }
        .sd-trust-desc { font-size: 0.76rem; color: var(--muted); margin-top: 2px; }

        .sd-related-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
          gap: 14px;
        }
        .sd-rel-card {
          background: var(--white);
          border-radius: var(--radius-md);
          border: 1px solid var(--border);
          overflow: hidden;
          text-decoration: none;
          color: inherit;
          display: block;
          transition: transform 0.25s, box-shadow 0.25s;
        }
        .sd-rel-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-lg);
        }
        .sd-rel-img {
          width: 100%;
          aspect-ratio: 4/3;
          object-fit: cover;
          display: block;
          background: var(--surface);
        }
        .sd-rel-info { padding: 12px 14px; }
        .sd-rel-name { font-size: 0.82rem; font-weight: 600; color: var(--ink); line-height: 1.4; margin-bottom: 6px; }
        .sd-rel-stars { font-size: 0.76rem; color: #F59E0B; }
        .sd-rel-price { font-size: 0.82rem; font-weight: 700; color: var(--gold); margin-top: 5px; }

        .sd-sidebar {
          position: sticky;
          top: 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .sd-sb-card {
          background: var(--white);
          border-radius: var(--radius-lg);
          border: 1px solid var(--border);
          box-shadow: var(--shadow-md);
          overflow: hidden;
        }

        .sd-price-section {
          padding: 26px 24px 22px;
          border-bottom: 1px solid var(--border);
          background: linear-gradient(160deg, #FEFEFE, var(--surface));
        }
        .sd-price-label {
          font-size: 0.72rem;
          font-weight: 700;
          color: var(--muted);
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-bottom: 8px;
        }
        .sd-price-value {
          font-family: 'Playfair Display', serif;
          font-size: 2.1rem;
          font-weight: 800;
          color: var(--black);
          letter-spacing: -0.03em;
          line-height: 1;
          margin-bottom: 4px;
        }
        .sd-price-note {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-top: 12px;
          font-size: 0.76rem;
          color: var(--muted);
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 8px 12px;
          font-weight: 500;
        }

        .sd-actions {
          padding: 20px 24px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          border-bottom: 1px solid var(--border);
        }
        .sd-btn-wa {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 15px 20px;
          background: linear-gradient(135deg, #25D366, #128C7E);
          color: #fff;
          border-radius: var(--radius-md);
          font-size: 0.95rem;
          font-weight: 700;
          text-decoration: none;
          transition: transform 0.2s, box-shadow 0.2s;
          box-shadow: 0 4px 18px rgba(37,211,102,0.35);
          font-family: 'Outfit', sans-serif;
          letter-spacing: 0.01em;
        }
        .sd-btn-wa:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 28px rgba(37,211,102,0.45);
        }
        .sd-btn-quote {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 13px 20px;
          background: var(--gold-pale);
          color: #7a4f00;
          border: 1.5px solid #e8c97a66;
          border-radius: var(--radius-md);
          font-size: 0.9rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
          font-family: 'Outfit', sans-serif;
          width: 100%;
        }
        .sd-btn-quote:hover {
          background: #f5e8c0;
          border-color: var(--gold);
          box-shadow: var(--shadow-gold);
        }
        .sd-btn-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }
        .sd-btn-sm {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 10px 14px;
          background: var(--surface);
          color: var(--slate);
          border: 1.5px solid var(--border);
          border-radius: var(--radius-sm);
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          font-family: 'Outfit', sans-serif;
          width: 100%;
        }
        .sd-btn-sm:hover {
          border-color: var(--gold-light);
          color: var(--gold);
        }

        .sd-prov-section {
          padding: 22px 24px;
          border-bottom: 1px solid var(--border);
        }
        .sd-prov-header {
          font-size: 0.72rem;
          font-weight: 700;
          color: var(--muted);
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .sd-online-dot {
          width: 7px;
          height: 7px;
          background: #22c55e;
          border-radius: 50%;
          box-shadow: 0 0 0 3px rgba(34,197,94,0.2);
          flex-shrink: 0;
        }
        .sd-prov-row {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 18px;
        }
        .sd-prov-avatar {
          width: 52px;
          height: 52px;
          border-radius: 14px;
          background: linear-gradient(135deg, var(--gold), var(--gold-light));
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.4rem;
          font-weight: 800;
          color: #5c3d00;
          flex-shrink: 0;
          overflow: hidden;
          font-family: 'Playfair Display', serif;
          box-shadow: var(--shadow-gold);
        }
        .sd-prov-avatar img { width: 100%; height: 100%; object-fit: cover; }
        .sd-prov-name { font-weight: 700; font-size: 0.95rem; color: var(--black); margin-bottom: 4px; }
        .sd-prov-stars { font-size: 0.8rem; color: #F59E0B; }
        .sd-stats { display: flex; flex-direction: column; gap: 11px; }
        .sd-stat-row { display: flex; justify-content: space-between; align-items: center; font-size: 0.83rem; }
        .sd-stat-label { color: var(--muted); display: flex; align-items: center; gap: 7px; font-weight: 500; }
        .sd-stat-value { font-weight: 700; color: var(--ink); }
        .sd-btn-profile {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 11px 20px;
          border: 1.5px solid var(--border);
          border-radius: var(--radius-md);
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--slate);
          cursor: pointer;
          transition: all 0.2s;
          margin-top: 18px;
          background: transparent;
          width: 100%;
          font-family: 'Outfit', sans-serif;
        }
        .sd-btn-profile:hover {
          border-color: var(--gold);
          color: var(--gold);
          background: var(--gold-pale);
        }

        .sd-trust-sidebar { padding: 20px 24px; }
        .sd-trust-sb-title { font-size: 0.82rem; font-weight: 700; color: var(--ink); margin-bottom: 14px; }
        .sd-trust-sb-list { display: flex; flex-direction: column; gap: 11px; }
        .sd-trust-sb-item {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 0.81rem;
          color: var(--slate);
          font-weight: 500;
        }
        .sd-trust-sb-item svg { flex-shrink: 0; color: var(--gold); }

        .sd-gold-line {
          height: 3px;
          background: linear-gradient(90deg, var(--gold), var(--gold-light), transparent);
          border-radius: 2px;
          margin-bottom: 20px;
          width: 60px;
        }
      `}</style>

      <div className="sd-root">

        <nav className="sd-nav">
          <div className="sd-nav-inner">
            <a href="/servicios">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M19 12H5M12 5l-7 7 7 7"/>
              </svg>
              Servicios
            </a>
            <span className="bc-sep">›</span>
            <span>{service.category}</span>
            <span className="bc-sep">›</span>
            <span className="bc-cur">{service.business_name}</span>
          </div>
        </nav>

        <div className="sd-hero">
          <div className="sd-hero-inner">
            <div className="sd-badges">
              {isPremium && (
                <span className="sd-badge badge-gold">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                  {planLabel}
                </span>
              )}
              {isPro && !isPremium && (
                <span className="sd-badge badge-pro">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                  </svg>
                  {planLabel}
                </span>
              )}
              {!isPremium && !isPro && (
                <span className="sd-badge badge-ok">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <path d="M20 6L9 17l-5-5"/>
                  </svg>
                  {planLabel}
                </span>
              )}
              <span className="sd-badge badge-cat">{service.category}</span>
            </div>

            <h1 className="sd-title">{service.business_name}</h1>
            <p className="sd-subtitle">
              {service.description?.slice(0, 180)}{service.description?.length > 180 ? "…" : ""}
            </p>

            <div className="sd-meta">
              {reviewCount > 0 && (
                <>
                  <div className="sd-meta-item">
                    <span className="sd-meta-stars">{"★".repeat(Math.floor(rating))}{"☆".repeat(5 - Math.floor(rating))}</span>
                    <span className="sd-meta-score">{Number(rating).toFixed(1)}</span>
                    <span className="sd-meta-count">({reviewCount} reseñas)</span>
                  </div>
                  <div className="sd-divider" />
                </>
              )}
              <div className="sd-meta-item">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{color:"var(--gold)"}}>
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
                Proveedor verificado
              </div>
              {saleCount > 0 && (
                <>
                  <div className="sd-divider" />
                  <div className="sd-meta-item">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{color:"var(--green)"}}>
                      <path d="M20 6L9 17l-5-5"/>
                    </svg>
                    {saleCount} proyectos completados
                  </div>
                </>
              )}
              {service.city && (
                <>
                  <div className="sd-divider" />
                  <div className="sd-meta-item">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{color:"var(--muted)"}}>
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                      <circle cx="12" cy="10" r="3"/>
                    </svg>
                    {service.city}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="sd-body">
          <div className="sd-left">

            <div className="sd-img-wrap">
              <img
                src={imageUrl}
                alt={service.business_name}
                onError={(e: any) => { e.target.src = "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1400&q=85" }}
              />
              <div className="sd-img-overlay" />
              {(isPremium || isPro) && (
                <div className={`sd-img-badge ${isPremium ? "sd-img-badge-gold" : "sd-img-badge-blue"}`}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                  {isPremium ? "Premium Partner" : "Pro"}
                </div>
              )}
              {service.city && (
                <div className="sd-img-loc">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                  {service.city}
                </div>
              )}
            </div>

            <div className="sd-card">
              <div className="sd-card-body">
                <div className="sd-gold-line" />
                <p className="sd-sec-title">Descripción del servicio</p>
                <p className="sd-desc">
                  {service.description || "Este proveedor ofrece servicios de alta calidad. Contáctanos para conocer más detalles."}
                </p>
                <p className="sd-spec-label">Especialistas en</p>
                <div className="sd-benefits">
                  {benefits.map((b, i) => (
                    <div key={i} className="sd-benefit">
                      <div className="sd-benefit-dot" />
                      {b}
                    </div>
                  ))}
                </div>
                <div className="sd-commit">
                  <div className="sd-commit-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    </svg>
                  </div>
                  <p className="sd-commit-text">
                    <strong>Nuestro compromiso:</strong> brindarte seguridad, transparencia y las mejores oportunidades
                    con acompañamiento personalizado y atención confiable en cada etapa del proceso.
                  </p>
                </div>
              </div>
            </div>

            <div className="sd-card">
              <div className="sd-card-body">
                <div className="sd-gold-line" />
                <p className="sd-sec-title">¿Por qué elegir DMS Market?</p>
                <div className="sd-trust-grid">
                  <div className="sd-trust-item">
                    <div className="sd-trust-icon" style={{background:"#EFF6FF"}}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2">
                        <rect x="3" y="11" width="18" height="11" rx="2"/>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                      </svg>
                    </div>
                    <div>
                      <div className="sd-trust-label">Pago seguro</div>
                      <div className="sd-trust-desc">Transacciones 100% protegidas</div>
                    </div>
                  </div>
                  <div className="sd-trust-item">
                    <div className="sd-trust-icon" style={{background:"var(--green-pale)"}}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                      </svg>
                    </div>
                    <div>
                      <div className="sd-trust-label">Verificados</div>
                      <div className="sd-trust-desc">Revisados por nuestro equipo</div>
                    </div>
                  </div>
                  <div className="sd-trust-item">
                    <div className="sd-trust-icon" style={{background:"var(--gold-pale)"}}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="2">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                    </div>
                    <div>
                      <div className="sd-trust-label">Calidad garantizada</div>
                      <div className="sd-trust-desc">Satisfacción asegurada</div>
                    </div>
                  </div>
                  <div className="sd-trust-item">
                    <div className="sd-trust-icon" style={{background:"#F3E8FF"}}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9333EA" strokeWidth="2">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                      </svg>
                    </div>
                    <div>
                      <div className="sd-trust-label">Soporte 24/7</div>
                      <div className="sd-trust-desc">Siempre disponibles para ti</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {related && related.length > 0 && (
              <div className="sd-card">
                <div className="sd-card-body">
                  <div className="sd-gold-line" />
                  <p className="sd-sec-title">Servicios relacionados</p>
                  <div className="sd-related-grid">
                    {related.map((r: any) => (
                      <a key={r.id} href={`/servicios/${r.id}`} className="sd-rel-card">
                        <img
                          className="sd-rel-img"
                          src={r.service_image_url || "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=400&q=70"}
                          alt={r.business_name}
                          onError={(e: any) => { e.target.src = "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=400&q=70" }}
                        />
                        <div className="sd-rel-info">
                          <div className="sd-rel-name">{r.business_name}</div>
                          {r.avg_rating && <div className="sd-rel-stars">{"★".repeat(Math.floor(r.avg_rating))} {Number(r.avg_rating).toFixed(1)}</div>}
                          {r.price && <div className="sd-rel-price">Desde {r.price}</div>}
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="sd-sidebar">
            <div className="sd-sb-card">

              <div className="sd-price-section">
                <div className="sd-price-label">Precio del servicio</div>
                <div className="sd-price-value">{service.price || "Consultar"}</div>
                <div className="sd-price-note">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
                  </svg>
                  Precio estimado según alcance del proyecto
                </div>
              </div>

              <div className="sd-actions">
                <a href={waUrl} target="_blank" rel="noopener noreferrer" className="sd-btn-wa">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.556 4.116 1.528 5.845L.057 23.428a.5.5 0 0 0 .515.572l5.736-1.505A11.945 11.945 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.96 0-3.8-.538-5.373-1.47l-.385-.228-3.985 1.046 1.065-3.888-.251-.4A9.956 9.956 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
                  </svg>
                  Contactar por WhatsApp
                </a>
                <button className="sd-btn-quote">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                  </svg>
                  Solicitar cotización
                </button>
                <div className="sd-btn-row">
                  <button className="sd-btn-sm">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                    Guardar
                  </button>
                  <button className="sd-btn-sm">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                    </svg>
                    Compartir
                  </button>
                </div>
              </div>

              <div className="sd-prov-section">
                <div className="sd-prov-header">
                  <span className="sd-online-dot" />
                  Proveedor verificado
                </div>
                <div className="sd-prov-row">
                  <div className="sd-prov-avatar">
                    {service.avatar_url
                      ? <img src={service.avatar_url} alt={service.business_name} />
                      : service.business_name?.[0]?.toUpperCase() || "P"
                    }
                  </div>
                  <div>
                    <div className="sd-prov-name">{service.business_name}</div>
                    <div className="sd-prov-stars">{"★".repeat(Math.floor(rating))} {Number(rating).toFixed(1)} ({reviewCount} reseñas)</div>
                  </div>
                </div>
                <div className="sd-stats">
                  <div className="sd-stat-row">
                    <span className="sd-stat-label">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
                      </svg>
                      Tiempo de respuesta
                    </span>
                    <span className="sd-stat-value">~1 hora</span>
                  </div>
                  <div className="sd-stat-row">
                    <span className="sd-stat-label">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="4" width="18" height="18" rx="2"/>
                        <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                      </svg>
                      Miembro desde
                    </span>
                    <span className="sd-stat-value">{memberSince}</span>
                  </div>
                  <div className="sd-stat-row">
                    <span className="sd-stat-label">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                      </svg>
                      Proyectos completados
                    </span>
                    <span className="sd-stat-value">{saleCount > 0 ? saleCount : "—"}</span>
                  </div>
                  <div className="sd-stat-row">
                    <span className="sd-stat-label">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                      Satisfacción del cliente
                    </span>
                    <span className="sd-stat-value">98%</span>
                  </div>
                </div>
                <button className="sd-btn-profile">Ver perfil del proveedor →</button>
              </div>

              <div className="sd-trust-sidebar">
                <div className="sd-trust-sb-title">Pago seguro garantizado</div>
                <div className="sd-trust-sb-list">
                  <div className="sd-trust-sb-item">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                    Tu pago está protegido con DMS Market
                  </div>
                  <div className="sd-trust-sb-item">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    </svg>
                    Proveedores verificados y revisados
                  </div>
                  <div className="sd-trust-sb-item">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                    </svg>
                    Soporte 24/7 siempre disponible
                  </div>
                  <div className="sd-trust-sb-item">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                    Garantía de satisfacción DMS
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  )
}