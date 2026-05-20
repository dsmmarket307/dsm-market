import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

    const { type } = await req.json()
    const role = user.user_metadata?.role

    let metrics: any = {}

    if (type === 'vendor') {
      const { data: orders } = await supabase.from('orders').select('*').eq('seller_id', user.id)
      const { data: products } = await supabase.from('products').select('id, name, category, price, status').eq('seller_id', user.id)
      const totalVentas = orders?.filter(o => o.status !== 'cancelled').reduce((a, o) => a + Number(o.seller_earnings), 0) ?? 0
      const totalOrdenes = orders?.length ?? 0
      const productosAprobados = products?.filter(p => p.status === 'approved').length ?? 0
      const categorias = [...new Set(products?.map(p => p.category))].join(', ')
      metrics = { totalVentas, totalOrdenes, productosAprobados, totalProductos: products?.length ?? 0, categorias }
    }

    if (type === 'admin' && role === 'admin') {
      const { data: orders } = await supabase.from('orders').select('*')
      const { data: products } = await supabase.from('products').select('category, status')
      const { data: profiles } = await supabase.from('profiles').select('role, created_at')
      const totalVentas = orders?.reduce((a, o) => a + Number(o.total_amount ?? 0), 0) ?? 0
      const totalOrdenes = orders?.length ?? 0
      const vendedores = profiles?.filter(p => p.role === 'seller').length ?? 0
      const compradores = profiles?.filter(p => p.role === 'buyer').length ?? 0
      const productosAprobados = products?.filter(p => p.status === 'approved').length ?? 0
      const cats = products?.map(p => p.category) ?? []
      const catCount: any = {}
      cats.forEach(c => { catCount[c] = (catCount[c] ?? 0) + 1 })
      const topCategorias = Object.entries(catCount).sort((a: any, b: any) => b[1] - a[1]).slice(0, 3).map(([k]) => k).join(', ')
      metrics = { totalVentas, totalOrdenes, vendedores, compradores, productosAprobados, topCategorias }
    }

    const prompt = type === 'vendor'
      ? `Eres analista de un marketplace colombiano. Genera un reporte profesional para un vendedor con estos datos: Ventas totales: $${metrics.totalVentas?.toLocaleString('es-CO')} COP, Ordenes: ${metrics.totalOrdenes}, Productos aprobados: ${metrics.productosAprobados} de ${metrics.totalProductos}, Categorias: ${metrics.categorias}. El reporte debe tener: resumen ejecutivo, analisis de rendimiento, recomendaciones practicas. Maximo 4 parrafos. Sin asteriscos. En espanol.`
      : `Eres analista de un marketplace colombiano. Genera un reporte ejecutivo con estos datos: Ventas totales: $${metrics.totalVentas?.toLocaleString('es-CO')} COP, Ordenes: ${metrics.totalOrdenes}, Vendedores: ${metrics.vendedores}, Compradores: ${metrics.compradores}, Productos aprobados: ${metrics.productosAprobados}, Top categorias: ${metrics.topCategorias}. El reporte debe tener: resumen del marketplace, analisis de categorias, estado general, recomendaciones. Maximo 4 parrafos. Sin asteriscos. En espanol.`

    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.GROQ_API_KEY}` },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 500,
        messages: [{ role: 'user', content: prompt }]
      })
    })

    const groqData = await groqRes.json()
    const reporte = groqData.choices?.[0]?.message?.content ?? 'No se pudo generar el reporte.'

    return NextResponse.json({ reporte, metrics })
  } catch (error) {
    console.error('Report error:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
