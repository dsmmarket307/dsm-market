import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createClient as createAdmin } from "@supabase/supabase-js"

function getAdmin() {
  return createAdmin(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const uid = searchParams.get("uid")
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ alerts: [] })
    const admin = getAdmin()
    const { data: alerts } = await admin
      .from("alerts")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(10)
    return NextResponse.json({ alerts: alerts ?? [] })
  } catch {
    return NextResponse.json({ alerts: [] })
  }
}

export async function POST() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    const admin = getAdmin()
    const role = user.user_metadata?.role ?? "buyer"
    const newAlerts: any[] = []

    if (role === "seller") {
      const { data: products } = await admin
        .from("products")
        .select("id, name, stock, vendidos, created_at")
        .eq("seller_id", user.id)
        .eq("status", "approved")

      for (const p of products ?? []) {
        if (p.stock !== null && p.stock <= 3 && p.stock > 0) {
          newAlerts.push({ user_id: user.id, type: "stock_low", title: "Pocas unidades disponibles", message: "Tu producto " + p.name + " tiene solo " + p.stock + " unidad(es). Considera reponer inventario." })
        }
        const diasPublicado = Math.floor((Date.now() - new Date(p.created_at).getTime()) / (1000 * 60 * 60 * 24))
        if (diasPublicado >= 7 && (!p.vendidos || p.vendidos === 0)) {
          newAlerts.push({ user_id: user.id, type: "no_sales", title: "Producto sin ventas", message: p.name + " lleva " + diasPublicado + " dias publicado sin ventas. Considera mejorar el precio o la descripcion." })
        }
        if (p.vendidos && p.vendidos >= 10) {
          newAlerts.push({ user_id: user.id, type: "selling_fast", title: "Producto popular", message: "Tu producto " + p.name + " ha tenido " + p.vendidos + " ventas. Va muy bien." })
        }
      }

      const { data: topCat } = await admin
        .from("orders")
        .select("products(category)")
        .order("created_at", { ascending: false })
        .limit(50)

      if (topCat && topCat.length > 0) {
        const catCount: Record<string, number> = {}
        topCat.forEach((o: any) => {
          const prod = o.products as any
          const cat = Array.isArray(prod) ? prod[0]?.category : prod?.category
          if (cat) catCount[cat] = (catCount[cat] ?? 0) + 1
        })
        const entries = Object.entries(catCount).sort((a, b) => b[1] - a[1])
        if (entries.length > 0) {
          newAlerts.push({ user_id: user.id, type: "trending", title: "Categoria en tendencia", message: "La categoria " + entries[0][0] + " esta siendo muy demandada." })
        }
      }
    }

    if (role === "buyer") {
      const { data: popular } = await admin.from("products").select("name, vendidos, stock").eq("status", "approved").gte("vendidos", 5).gt("stock", 0).order("vendidos", { ascending: false }).limit(1)
      if (popular && popular.length > 0) {
        newAlerts.push({ user_id: user.id, type: "popular_product", title: "Producto popular disponible", message: popular[0].name + " tiene alta demanda. Compralo antes de que se agote." })
      }
      const { data: lowStock } = await admin.from("products").select("name, stock").eq("status", "approved").lte("stock", 3).gt("stock", 0).limit(1)
      if (lowStock && lowStock.length > 0) {
        newAlerts.push({ user_id: user.id, type: "almost_out", title: "Producto casi agotado", message: lowStock[0].name + " tiene solo " + lowStock[0].stock + " unidad(es). Compra pronto." })
      }
    }

    const today = new Date().toISOString().split("T")[0]
    const { data: existing } = await admin.from("alerts").select("type").eq("user_id", userId).gte("created_at", today)
    const existingTypes = new Set(existing?.map((a: any) => a.type) ?? [])
    const toInsert = newAlerts.filter(a => !existingTypes.has(a.type))
    if (toInsert.length > 0) await admin.from("alerts").insert(toInsert)

    return NextResponse.json({ generated: toInsert.length })
  } catch {
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    const { id } = await request.json()
    const admin = getAdmin()
    await admin.from("alerts").update({ is_read: true }).eq("id", id).eq("user_id", userId)
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}
