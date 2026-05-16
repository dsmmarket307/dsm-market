"use client"
import { useState } from "react"
import { logout } from "@/lib/actions/auth"
import Link from "next/link"
import { usePathname } from "next/navigation"

const roleLabels: any = { buyer: "Comprador", seller: "Vendedor", admin: "Administrador", provider: "Proveedor" }
const LOGO = "https://awbepztacmvurjylfoas.supabase.co/storage/v1/object/public/assets/ChatGPT_Image_3_may_2026__21_13_12-removebg-preview.png"

function Icon({ type }: { type: string }) {
  const s = { width: 18, height: 18, viewBox: "0 0 24 24", fill: "none" as const, stroke: "currentColor", strokeWidth: 1.75, strokeLinecap: "round" as const, strokeLinejoin: "round" as const }
  const icons: any = {
    home:       <svg {...s}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
    store:      <svg {...s}><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>,
    orders:     <svg {...s}><rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 5v3h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>,
    dispute:    <svg {...s}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
    vendors:    <svg {...s}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    products:   <svg {...s}><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>,
    crm:        <svg {...s}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
    newproduct: <svg {...s}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
    provider:   <svg {...s}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>,
  }
  return icons[type] ?? icons.home
}

export default function DashboardNav({ role, name, email }: any) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  const navItems = role === "admin" ? [
    { href: "/dashboard/admin",          label: "Inicio",         icon: "home" },
    { href: "/dashboard/admin/vendors",  label: "Vendedores",     icon: "vendors" },
    { href: "/dashboard/admin/products", label: "Productos",      icon: "products" },
    { href: "/dashboard/admin/orders",   label: "Ordenes y Pagos",icon: "orders" },
    { href: "/dashboard/admin/disputes", label: "Disputas",       icon: "dispute" },
    { href: "/crm",                      label: "CRM Dropi",      icon: "crm" },
  ] : role === "seller" ? [
    { href: "/dashboard/vendor",                label: "Inicio",         icon: "home" },
    { href: "/dashboard/vendor/orders",          label: "Mis Ordenes",    icon: "orders" },
    { href: "/dashboard/vendor/products/new",    label: "Nuevo producto", icon: "newproduct" },
    { href: "/dashboard/vendor/disputes",        label: "Disputas",       icon: "dispute" },
  ] : role === "provider" ? [
    { href: "/dashboard/provider",         label: "Inicio",      icon: "home" },
    { href: "/dashboard/provider/servicio",label: "Mi servicio", icon: "provider" },
  ] : [
    { href: "/dashboard/buyer",          label: "Inicio",        icon: "home" },
    { href: "/dashboard/buyer/products", label: "Tienda",        icon: "store" },
    { href: "/dashboard/buyer/disputes", label: "Abrir disputa", icon: "dispute" },
  ]

  const initials = name?.charAt(0)?.toUpperCase() ?? "U"
  const display  = name || email

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');
    .dms-link{display:flex;align-items:center;gap:12px;padding:10px 14px;border-radius:10px;text-decoration:none;color:#777;font-size:13.5px;font-weight:400;font-family:'Poppins',sans-serif;transition:all .2s;position:relative;}
    .dms-link:hover{color:#D4AF37;background:rgba(212,175,55,.08);}
    .dms-link.on{color:#D4AF37;background:rgba(212,175,55,.12);font-weight:600;}
    .dms-link.on::before{content:'';position:absolute;left:0;top:20%;height:60%;width:3px;background:#D4AF37;border-radius:0 3px 3px 0;}
    .dms-out{display:flex;align-items:center;gap:12px;padding:10px 14px;border-radius:10px;background:transparent;border:1px solid rgba(212,175,55,.2);color:#666;font-size:13px;cursor:pointer;width:100%;font-family:'Poppins',sans-serif;transition:all .2s;}
    .dms-out:hover{border-color:#D4AF37;color:#D4AF37;background:rgba(212,175,55,.06);}
    .dms-div{height:1px;background:rgba(255,255,255,.05);margin:6px 14px;}
    @media(max-width:768px){.dms-desk{display:none!important;}.dms-mob-bar{display:flex!important;}}
    @media(min-width:769px){.dms-mob-bar{display:none!important;}.dms-mob-menu{display:none!important;}}
  `

  const UserBlock = () => (
    <div style={{display:"flex",alignItems:"center",gap:10,padding:"14px 16px",background:"rgba(212,175,55,.06)",borderRadius:12,border:"1px solid rgba(212,175,55,.12)"}}>
      <div style={{width:38,height:38,borderRadius:"50%",background:"linear-gradient(135deg,#D4AF37,#f0d060)",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:16,color:"#0B0B0B",flexShrink:0}}>{initials}</div>
      <div style={{overflow:"hidden"}}>
        <p style={{color:"#fff",fontWeight:600,fontSize:13,margin:0,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",fontFamily:"'Poppins',sans-serif"}}>{display}</p>
        <span style={{fontSize:11,color:"#D4AF37",background:"rgba(212,175,55,.12)",padding:"1px 8px",borderRadius:999,display:"inline-block",marginTop:2,fontFamily:"'Poppins',sans-serif"}}>{roleLabels[role] ?? "Usuario"}</span>
      </div>
    </div>
  )

  const LogoutBtn = () => (
    <form action={logout}>
      <button type="submit" className="dms-out">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
          <polyline points="16 17 21 12 16 7"/>
          <line x1="21" y1="12" x2="9" y2="12"/>
        </svg>
        Cerrar sesión
      </button>
    </form>
  )

  return (
    <>
      <style>{css}</style>

      {/* DESKTOP SIDEBAR */}
      <aside className="dms-desk" style={{width:240,background:"#0B0B0B",borderRight:"1px solid rgba(212,175,55,.08)",display:"flex",flexDirection:"column",minHeight:"100vh",position:"sticky",top:0,flexShrink:0}}>
        <div style={{padding:"24px 20px 16px",borderBottom:"1px solid rgba(212,175,55,.08)"}}>
          <img src={LOGO} alt="DMS Market" style={{width:110,objectFit:"contain"}} />
        </div>
        <div style={{padding:12}}>
          <UserBlock />
        </div>
        <div className="dms-div" />
        <nav style={{flex:1,padding:"6px 10px",display:"flex",flexDirection:"column",gap:2}}>
          {navItems.map(item => (
            <Link key={item.href} href={item.href} className={`dms-link${pathname === item.href ? " on" : ""}`}>
              <Icon type={item.icon} />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="dms-div" />
        <div style={{padding:10}}>
          <LogoutBtn />
        </div>
      </aside>

      {/* MOBILE TOPBAR */}
      <div className="dms-mob-bar" style={{position:"fixed",top:0,left:0,right:0,height:56,background:"#0B0B0B",borderBottom:"1px solid rgba(212,175,55,.15)",zIndex:100,alignItems:"center",justifyContent:"space-between",padding:"0 16px"}}>
        <img src={LOGO} alt="DMS Market" style={{height:32,objectFit:"contain"}} />
        <button onClick={() => setOpen(!open)} style={{background:"rgba(212,175,55,.1)",border:"1px solid rgba(212,175,55,.2)",cursor:"pointer",color:"#D4AF37",padding:"6px 10px",borderRadius:8,fontSize:18,lineHeight:1}}>
          {open ? "✕" : "☰"}
        </button>
      </div>

      {/* MOBILE MENU */}
      {open && (
        <div className="dms-mob-menu" style={{position:"fixed",top:56,left:0,right:0,bottom:0,background:"#0B0B0B",zIndex:99,overflowY:"auto"}}>
          <div style={{padding:12,borderBottom:"1px solid rgba(212,175,55,.08)"}}>
            <UserBlock />
          </div>
          <nav style={{padding:"6px 10px",display:"flex",flexDirection:"column",gap:2}}>
            {navItems.map(item => (
              <Link key={item.href} href={item.href} className="dms-link" onClick={() => setOpen(false)}>
                <Icon type={item.icon} />
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
          <div style={{padding:10,borderTop:"1px solid rgba(212,175,55,.08)"}}>
            <LogoutBtn />
          </div>
        </div>
      )}
    </>
  )
}