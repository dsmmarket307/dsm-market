"use client"
export default function OrderSearch() {
  return (
    <div style={{marginBottom:"1.5rem",position:"relative"}}>
      <svg style={{position:"absolute",left:14,top:"50%",transform:"translateY(-50%)",color:"#888"}} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
      <input
        type="text"
        placeholder="Buscar por orden, producto o comprador..."
        style={{width:"100%",padding:"12px 16px 12px 44px",background:"#151515",border:"1px solid rgba(212,175,55,.15)",borderRadius:12,color:"#fff",fontSize:14,fontFamily:"'Poppins',sans-serif",outline:"none"}}
        onChange={(e) => {
          const q = e.target.value.toLowerCase()
          document.querySelectorAll(".vo-card").forEach((card: any) => {
            card.style.display = card.innerText.toLowerCase().includes(q) ? "block" : "none"
          })
        }}
      />
    </div>
  )
}
