"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

const categories = [
  "Todas","Ropa deportiva","Bisuteria","Juguetes","Mascotas","Moda",
  "Tecnologia","Cocina","Belleza","Salud","Hogar","Natural home",
  "Deportes","Bebe","Aseo","Bienestar","Herramientas","Pinateria",
  "Navidad","Halloween","Libros","Papeleria","Vehiculos","Otros"
]

const priceRanges = [
  { label: "Todos los precios", min: 0, max: Infinity },
  { label: "Menos de $50.000",  min: 0,      max: 50000 },
  { label: "$50.000 - $150.000",min: 50000,  max: 150000 },
  { label: "$150.000 - $500.000",min:150000, max: 500000 },
  { label: "Más de $500.000",   min: 500000, max: Infinity },
]

function Stars({ rating }: { rating: number }) {
  return (
    <div style={{display:"flex",gap:2,alignItems:"center"}}>
      {[1,2,3,4,5].map(s => (
        <svg key={s} width="13" height="13" viewBox="0 0 24 24" fill={s <= rating ? "#D4AF37" : "#e0e0e0"}>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      ))}
      <span style={{fontSize:11,color:"#aaa",marginLeft:3,fontFamily:"'Poppins',sans-serif"}}>({rating}.0)</span>
    </div>
  )
}

function Heart({ productId }: { productId: string }) {
  const [on, setOn] = useState(false)
  return (
    <button onClick={e => { e.stopPropagation(); setOn(!on) }}
      style={{position:"absolute",top:10,right:10,width:32,height:32,borderRadius:"50%",background:"rgba(255,255,255,.92)",border:"none",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",boxShadow:"0 2px 8px rgba(0,0,0,.12)",transition:"all .2s",zIndex:2}}>
      <svg width="15" height="15" viewBox="0 0 24 24" fill={on ? "#ef4444" : "none"} stroke={on ? "#ef4444" : "#999"} strokeWidth="2">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
      </svg>
    </button>
  )
}

const benefits = [
  { title:"Compra segura",          desc:"Protegemos tu información y tu dinero",    icon:<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg> },
  { title:"Vendedores verificados", desc:"Trabajamos con los mejores vendedores",    icon:<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> },
  { title:"Envíos rápidos",         desc:"Recibe tus productos a tiempo",            icon:<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 5v3h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg> },
  { title:"Soporte 24/7",           desc:"Estamos para ayudarte siempre",            icon:<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.37a16 16 0 0 0 6.29 6.29l1.16-.94a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg> },
]

export default function BuyerProductsPage() {
  const router = useRouter()
  const [products, setProducts]   = useState<any[]>([])
  const [images,   setImages]     = useState<any[]>([])
  const [loading,  setLoading]    = useState(true)
  const [search,   setSearch]     = useState("")
  const [category, setCategory]   = useState("Todas")
  const [priceRange,setPriceRange]= useState(0)

  useEffect(() => {
    fetch("/api/products")
      .then(r => r.json())
      .then(data => { setProducts(data.products ?? []); setImages(data.images ?? []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const range = priceRanges[priceRange]
  const filtered = products.filter(p => {
    const ms = p.name.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase())
    const mc = category === "Todas" || p.category === category
    const pr = Number(p.price); const mp = pr >= range.min && pr <= range.max
    return ms && mc && mp
  })
  const getImg = (id: string) => images.find(i => i.product_id === id)?.url

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');
    .pp-root{background:#F5F5F5;min-height:100vh;font-family:'Poppins',sans-serif;}
    .pp-header{background:#0B0B0B;border-bottom:1px solid rgba(212,175,55,.12);padding:14px 32px;position:sticky;top:0;z-index:50;}
    .pp-search-wrap{max-width:1100px;margin:0 auto;display:flex;gap:12px;align-items:center;flex-wrap:wrap;}
    .pp-search-group{flex:1;min-width:220px;display:flex;border-radius:10px;overflow:hidden;border:1px solid rgba(212,175,55,.2);}
    .pp-input{flex:1;padding:10px 16px;background:#151515;border:none;color:#fff;font-size:13.5px;font-family:'Poppins',sans-serif;outline:none;}
    .pp-input::placeholder{color:#555;}
    .pp-btn{padding:10px 20px;background:#D4AF37;color:#0B0B0B;border:none;font-size:13px;font-weight:700;cursor:pointer;font-family:'Poppins',sans-serif;transition:background .2s;}
    .pp-btn:hover{background:#e8c84a;}
    .pp-select{padding:10px 14px;background:#151515;border:1px solid rgba(212,175,55,.2);color:#ccc;font-size:13px;font-family:'Poppins',sans-serif;outline:none;border-radius:10px;cursor:pointer;min-width:160px;transition:border-color .2s;}
    .pp-select:hover{border-color:rgba(212,175,55,.4);}
    .pp-main{max-width:1100px;margin:0 auto;padding:32px 32px 0;}
    .pp-title{font-size:1.2rem;font-weight:700;color:#111;margin:0 0 24px;font-family:'Poppins',sans-serif;}
    .pp-title span{color:#D4AF37;}
    .pp-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:20px;}
    .pp-card{background:#fff;border-radius:16px;overflow:hidden;border:1px solid rgba(0,0,0,.06);cursor:pointer;transition:transform .22s,box-shadow .22s;display:flex;flex-direction:column;box-shadow:0 2px 8px rgba(0,0,0,.05);}
    .pp-card:hover{transform:translateY(-5px);box-shadow:0 14px 36px rgba(0,0,0,.11);}
    .pp-img-wrap{position:relative;padding-bottom:100%;background:#f3f3f3;overflow:hidden;}
    .pp-img{position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;transition:transform .4s;}
    .pp-card:hover .pp-img{transform:scale(1.05);}
    .pp-badge-hot{position:absolute;top:10px;left:10px;background:#D4AF37;color:#0B0B0B;font-size:10px;font-weight:700;padding:3px 10px;border-radius:999px;z-index:1;font-family:'Poppins',sans-serif;}
    .pp-badge-offer{position:absolute;top:10px;left:10px;background:#EF4444;color:#fff;font-size:10px;font-weight:700;padding:3px 10px;border-radius:999px;z-index:1;font-family:'Poppins',sans-serif;}
    .pp-badge-pct{position:absolute;top:10px;right:10px;background:#EF4444;color:#fff;font-size:10px;font-weight:700;padding:3px 10px;border-radius:999px;z-index:1;font-family:'Poppins',sans-serif;}
    .pp-badge-used{position:absolute;bottom:10px;left:10px;background:rgba(0,0,0,.55);color:#fff;font-size:10px;padding:2px 8px;border-radius:999px;z-index:1;}
    .pp-body{padding:14px;display:flex;flex-direction:column;flex:1;}
    .pp-cat{font-size:10px;color:#D4AF37;text-transform:uppercase;font-weight:700;letter-spacing:1px;margin-bottom:4px;}
    .pp-name{font-size:14px;color:#111;font-weight:500;line-height:1.4;min-height:39px;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;margin-bottom:8px;}
    .pp-orig{font-size:12px;color:#bbb;text-decoration:line-through;}
    .pp-price{font-size:1.1rem;font-weight:700;color:#111;margin:2px 0 8px;}
    .pp-add{width:100%;padding:10px;background:#D4AF37;color:#0B0B0B;border:none;cursor:pointer;font-size:12.5px;font-weight:700;text-transform:uppercase;border-radius:10px;letter-spacing:.5px;margin-top:auto;font-family:'Poppins',sans-serif;display:flex;align-items:center;justify-content:center;gap:6px;transition:all .2s;}
    .pp-add:hover{background:#e8c84a;box-shadow:0 4px 18px rgba(212,175,55,.35);transform:translateY(-1px);}
    .pp-empty{text-align:center;padding:64px 32px;color:#888;font-family:'Poppins',sans-serif;}
    .pp-loading{text-align:center;padding:64px;color:#888;font-size:14px;font-family:'Poppins',sans-serif;}
    .pp-benefits{max-width:1100px;margin:40px auto 0;display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px;padding:0 32px 40px;}
    .pp-ben{background:#fff;border-radius:14px;padding:20px 16px;display:flex;align-items:flex-start;gap:14px;border:1px solid rgba(0,0,0,.05);box-shadow:0 2px 8px rgba(0,0,0,.04);transition:box-shadow .2s;}
    .pp-ben:hover{box-shadow:0 6px 22px rgba(212,175,55,.12);}
    .pp-ben-ico{width:46px;height:46px;background:rgba(212,175,55,.08);border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
    .pp-ben-title{font-size:13.5px;font-weight:600;color:#111;margin:0 0 3px;font-family:'Poppins',sans-serif;}
    .pp-ben-desc{font-size:12px;color:#888;line-height:1.4;margin:0;font-family:'Poppins',sans-serif;}
    @media(max-width:768px){
      .pp-header{padding:12px 16px;top:56px;}
      .pp-main{padding:20px 16px 0;}
      .pp-benefits{padding:0 16px 32px;}
      .pp-grid{grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:14px;}
    }
  `

  return (
    <>
      <style>{css}</style>
      <div className="pp-root">

        {/* HEADER */}
        <div className="pp-header">
          <div className="pp-search-wrap">
            <div className="pp-search-group">
              <input className="pp-input" value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar productos..." />
              <button className="pp-btn">Buscar</button>
            </div>
            <select className="pp-select" value={category} onChange={e => setCategory(e.target.value)}>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select className="pp-select" value={priceRange} onChange={e => setPriceRange(Number(e.target.value))}>
              {priceRanges.map((r,i) => <option key={i} value={i}>{r.label}</option>)}
            </select>
          </div>
        </div>

        {/* PRODUCTOS */}
        <div className="pp-main">
          <h2 className="pp-title">
            {search || category !== "Todas" || priceRange !== 0
              ? <><span>{filtered.length}</span> resultados encontrados</>
              : <>Productos <span>disponibles</span></>}
          </h2>

          {loading ? (
            <div className="pp-loading">Cargando productos...</div>
          ) : filtered.length === 0 ? (
            <div className="pp-empty">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.25">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <p style={{marginTop:12,fontSize:14}}>No se encontraron productos.</p>
            </div>
          ) : (
            <div className="pp-grid">
              {filtered.map(product => {
                const img = getImg(product.id)
                const rating = product.rating ?? 4
                const hasDisc = product.original_price && Number(product.original_price) > Number(product.price)
                const pct = hasDisc ? Math.round((1 - Number(product.price)/Number(product.original_price))*100) : 0

                return (
                  <div key={product.id} className="pp-card" onClick={() => router.push("/producto/"+product.id)}>
                    <div className="pp-img-wrap">
                      {img
                        ? <img className="pp-img" src={img} alt={product.name} />
                        : <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ddd" strokeWidth="1.25">
                              <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                            </svg>
                          </div>
                      }
                      {hasDisc
                        ? <><div className="pp-badge-offer">Oferta</div><div className="pp-badge-pct">-{pct}%</div></>
                        : product.badge === "Lo más vendido"
                          ? <div className="pp-badge-hot">Lo más vendido</div>
                          : product.badge
                            ? <div className="pp-badge-offer">{product.badge}</div>
                            : null
                      }
                      {product.condition === "used" && <div className="pp-badge-used">Usado</div>}
                      <Heart productId={product.id} />
                    </div>
                    <div className="pp-body">
                      <p className="pp-cat">{product.category}</p>
                      <p className="pp-name">{product.name}</p>
                      {hasDisc && <p className="pp-orig">${Number(product.original_price).toLocaleString("es-CO")}</p>}
                      <p className="pp-price">${Number(product.price).toLocaleString("es-CO")}</p>
                      <div style={{marginBottom:12}}><Stars rating={rating} /></div>
                      <button className="pp-add" onClick={e => { e.stopPropagation(); router.push("/producto/"+product.id) }}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                          <line x1="3" y1="6" x2="21" y2="6"/>
                          <path d="M16 10a4 4 0 0 1-8 0"/>
                        </svg>
                        Agregar al carrito
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* BENEFICIOS */}
        <div className="pp-benefits">
          {benefits.map((b,i) => (
            <div key={i} className="pp-ben">
              <div className="pp-ben-ico">{b.icon}</div>
              <div>
                <p className="pp-ben-title">{b.title}</p>
                <p className="pp-ben-desc">{b.desc}</p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </>
  )
}