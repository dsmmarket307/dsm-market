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
      const { data: payouts } = await supabase.from('payouts').select('amount, status').eq('seller_id', user.id)

      const ordersActivas = orders?.filter(o => o.status !== 'cancelled') ?? []
      const totalVentas = ordersActivas.reduce((a, o) => a + Number(o.seller_earnings ?? 0), 0)
      const totalOrdenes = orders?.length ?? 0
      const ordenesEntregadas = orders?.filter(o => o.status === 'delivered').length ?? 0
      const ordenesCanceladas = orders?.filter(o => o.status === 'cancelled').length ?? 0
      const saldoPendiente = payouts?.filter(p => p.status === 'held').reduce((a, p) => a + Number(p.amount), 0) ?? 0
      const saldoLiberado = payouts?.filter(p => p.status === 'released').reduce((a, p) => a + Number(p.amount), 0) ?? 0
      const productosAprobados = products?.filter(p => p.status === 'approved').length ?? 0
      const ticketPromedio = totalOrdenes > 0 ? Math.round(totalVentas / totalOrdenes) : 0
      const tasaConversion = totalOrdenes > 0 ? Math.round((ordenesEntregadas / totalOrdenes) * 100) : 0

      const catCount: any = {}
      products?.forEach(p => { catCount[p.category] = (catCount[p.category] ?? 0) + 1 })
      const topCategorias = Object.entries(catCount).sort((a: any, b: any) => b[1] - a[1]).slice(0, 3)

      const now = new Date()
      const semanaActual = ordersActivas.filter(o => {
        const d = new Date(o.created_at)
        return (now.getTime() - d.getTime()) < 7 * 24 * 60 * 60 * 1000
      })
      const ventasSemana = semanaActual.reduce((a, o) => a + Number(o.seller_earnings ?? 0), 0)
      const ordenesSemana = semanaActual.length

      metrics = {
        totalVentas, totalOrdenes, ordenesEntregadas, ordenesCanceladas,
        saldoPendiente, saldoLiberado, productosAprobados,
        totalProductos: products?.length ?? 0, ticketPromedio, tasaConversion,
        topCategorias, ventasSemana, ordenesSemana,
        comisionPlataforma: Math.round(totalVentas * 0.1),
        ingresosNetos: Math.round(totalVentas * 0.9)
      }
    }

    if (type === 'admin' && role === 'admin') {
      const { data: orders } = await supabase.from('orders').select('*')
      const { data: products } = await supabase.from('products').select('category, status, price, created_at')
      const { data: profiles } = await supabase.from('profiles').select('role, created_at')

      const totalVentas = orders?.reduce((a, o) => a + Number(o.total_amount ?? 0), 0) ?? 0
      const totalOrdenes = orders?.length ?? 0
      const comisiones = orders?.reduce((a, o) => a + Number(o.platform_fee ?? 0), 0) ?? 0
      const vendedores = profiles?.filter(p => p.role === 'seller').length ?? 0
      const compradores = profiles?.filter(p => p.role === 'buyer').length ?? 0
      const productosAprobados = products?.filter(p => p.status === 'approved').length ?? 0

      const now = new Date()
      const usuariosNuevosSemana = profiles?.filter(p => {
        const d = new Date(p.created_at)
        return (now.getTime() - d.getTime()) < 7 * 24 * 60 * 60 * 1000
      }).length ?? 0

      const catCount: any = {}
      products?.forEach(p => { catCount[p.category] = (catCount[p.category] ?? 0) + 1 })
      const topCategorias = Object.entries(catCount).sort((a: any, b: any) => b[1] - a[1]).slice(0, 5)

      const ventasSemana = orders?.filter(o => {
        const d = new Date(o.created_at)
        return (now.getTime() - d.getTime()) < 7 * 24 * 60 * 60 * 1000
      }).reduce((a, o) => a + Number(o.total_amount ?? 0), 0) ?? 0

      metrics = {
        totalVentas, totalOrdenes, comisiones, vendedores, compradores,
        productosAprobados, totalProductos: products?.length ?? 0,
        usuariosNuevosSemana, topCategorias, ventasSemana,
        ticketPromedio: totalOrdenes > 0 ? Math.round(totalVentas / totalOrdenes) : 0
      }
    }

    const prompt = type === 'vendor'
      ? `Eres un experto en crecimiento de ecommerce con 20 anos de experiencia. Analiza estos datos de un vendedor en DMS Market Colombia y genera un reporte ejecutivo completo en espanol:

DATOS:
- Ventas totales: $${metrics.totalVentas?.toLocaleString('es-CO')} COP
- Ingresos netos (90%): $${metrics.ingresosNetos?.toLocaleString('es-CO')} COP
- Comision plataforma (10%): $${metrics.comisionPlataforma?.toLocaleString('es-CO')} COP
- Ordenes totales: ${metrics.totalOrdenes}
- Ordenes entregadas: ${metrics.ordenesEntregadas}
- Ordenes canceladas: ${metrics.ordenesCanceladas}
- Tasa de conversion: ${metrics.tasaConversion}%
- Ticket promedio: $${metrics.ticketPromedio?.toLocaleString('es-CO')} COP
- Ventas esta semana: $${metrics.ventasSemana?.toLocaleString('es-CO')} COP
- Ordenes esta semana: ${metrics.ordenesSemana}
- Productos aprobados: ${metrics.productosAprobados} de ${metrics.totalProductos}
- Saldo pendiente de pago: $${metrics.saldoPendiente?.toLocaleString('es-CO')} COP
- Saldo liberado: $${metrics.saldoLiberado?.toLocaleString('es-CO')} COP

Genera el reporte con estas secciones exactas:
1. RESUMEN EJECUTIVO (2 oraciones)
2. ANALISIS DE RENDIMIENTO (fortalezas y debilidades)
3. CONTABILIDAD (ingresos brutos, netos, comisiones, proyeccion mensual)
4. ESTRATEGIA DE CRECIMIENTO (3 acciones concretas)
5. TAREAS SEMANALES (5 tareas especificas con dia sugerido)
6. META DEL MES (una meta concreta y alcanzable)

Sin asteriscos. Sin markdown. Usa numeros y datos reales. Maximo 400 palabras.`
      : `Eres un experto en crecimiento de marketplaces con 20 anos de experiencia. Analiza estos datos de DMS Market Colombia:

DATOS:
- Ventas totales: $${metrics.totalVentas?.toLocaleString('es-CO')} COP
- Ventas esta semana: $${metrics.ventasSemana?.toLocaleString('es-CO')} COP
- Comisiones ganadas: $${metrics.comisiones?.toLocaleString('es-CO')} COP
- Ordenes totales: ${metrics.totalOrdenes}
- Ticket promedio: $${metrics.ticketPromedio?.toLocaleString('es-CO')} COP
- Vendedores: ${metrics.vendedores}
- Compradores: ${metrics.compradores}
- Usuarios nuevos esta semana: ${metrics.usuariosNuevosSemana}
- Productos aprobados: ${metrics.productosAprobados} de ${metrics.totalProductos}

Genera el reporte con estas secciones exactas:
1. RESUMEN DEL MARKETPLACE (estado general en 2 oraciones)
2. ANALISIS DE CATEGORIAS (cuales tienen mas potencial)
3. CONTABILIDAD Y PROYECCIONES (ingresos actuales y proyeccion a 3 meses)
4. ESTRATEGIA DE CRECIMIENTO (3 acciones para crecer el marketplace)
5. TAREAS SEMANALES ADMIN (5 tareas especificas con dia sugerido)
6. META DEL MES (una meta concreta para el marketplace)

Sin asteriscos. Sin markdown. Usa numeros reales. Maximo 400 palabras.`

    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.GROQ_API_KEY}` },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 800,
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
