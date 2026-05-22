import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const admin = createAdmin(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { section } = await req.json()

    const { data: orders } = await admin.from('orders').select('*')
    const { data: products } = await admin.from('products').select('category, status, created_at')
    const { data: profiles } = await admin.from('profiles').select('role, created_at')

    const totalVentas = orders?.reduce((a, o) => a + Number(o.total_amount ?? 0), 0) ?? 0
    const comisiones = orders?.reduce((a, o) => a + Number(o.platform_fee ?? 0), 0) ?? 0
    const vendedores = profiles?.filter(p => p.role === 'seller').length ?? 0
    const compradores = profiles?.filter(p => p.role === 'buyer').length ?? 0
    const totalOrdenes = orders?.length ?? 0

    const now = new Date()
    const semana = orders?.filter(o => (now.getTime() - new Date(o.created_at).getTime()) < 7 * 24 * 60 * 60 * 1000) ?? []
    const ventasSemana = semana.reduce((a, o) => a + Number(o.total_amount ?? 0), 0)
    const usuariosNuevosSemana = profiles?.filter(p => (now.getTime() - new Date(p.created_at).getTime()) < 7 * 24 * 60 * 60 * 1000).length ?? 0

    const catCount: any = {}
    products?.forEach(p => { catCount[p.category] = (catCount[p.category] ?? 0) + 1 })
    const topCats = Object.entries(catCount).sort((a: any, b: any) => b[1] - a[1]).slice(0, 3).map(([k]) => k).join(', ')

    const mes = new Date().toLocaleString('es-CO', { month: 'long', year: 'numeric' })

    const prompts: any = {
      metas: `Eres un experto en crecimiento de marketplaces colombianos. Genera metas especificas para ${mes} basadas en estos datos reales:
- Ventas totales: $${totalVentas.toLocaleString('es-CO')} COP
- Comisiones: $${comisiones.toLocaleString('es-CO')} COP
- Vendedores: ${vendedores}
- Compradores: ${compradores}
- Ordenes: ${totalOrdenes}
- Ventas esta semana: $${ventasSemana.toLocaleString('es-CO')} COP
- Usuarios nuevos semana: ${usuariosNuevosSemana}
- Top categorias: ${topCats}

Genera exactamente en este formato sin asteriscos ni markdown:
METAS DEL MES
1. [meta especifica con numero]
2. [meta especifica con numero]
3. [meta especifica con numero]
4. [meta especifica con numero]
5. [meta especifica con numero]`,

      estrategias: `Eres experto en marketing digital para marketplaces colombianos. Crea un plan de accion semanal basado en:
- Top categorias: ${topCats}
- Vendedores activos: ${vendedores}
- Compradores: ${compradores}
- Crecimiento semanal: $${ventasSemana.toLocaleString('es-CO')} COP

Genera exactamente en este formato sin asteriscos ni markdown:
SEMANA 1
[accion 1]
[accion 2]
[accion 3]

SEMANA 2
[accion 1]
[accion 2]
[accion 3]

SEMANA 3
[accion 1]
[accion 2]
[accion 3]

SEMANA 4
[accion 1]
[accion 2]
[accion 3]`,

      contenido: `Eres experto en contenido digital para marketplaces colombianos. Crea un calendario de contenido semanal basado en las categorias: ${topCats}.

Genera exactamente en este formato sin asteriscos ni markdown:
LUNES
Plataforma: [red social]
Tema: [idea de contenido especifica]

MIERCOLES
Plataforma: [red social]
Tema: [idea de contenido especifica]

VIERNES
Plataforma: [red social]
Tema: [idea de contenido especifica]

SABADO
Plataforma: [red social]
Tema: [idea de contenido especifica]`,

      marketing: `Eres experto en copywriting y marketing digital colombiano. Genera material de marketing listo para usar basado en las categorias: ${topCats}.

Genera exactamente en este formato sin asteriscos ni markdown:
SLOGAN PRINCIPAL
[slogan corto y poderoso]

COPY REDES SOCIALES
[texto para publicacion lista para copiar]

HASHTAGS
[10 hashtags relevantes separados por espacio]

TITULO CAMPANA
[titulo atractivo para campana]

CTA PRINCIPAL
[llamado a la accion directo]`,

      proyecciones: `Eres analista financiero de marketplaces colombianos. Genera proyecciones de crecimiento basadas en datos reales:
- Vendedores actuales: ${vendedores}
- Compradores actuales: ${compradores}
- Comisiones actuales: $${comisiones.toLocaleString('es-CO')} COP
- Ventas totales: $${totalVentas.toLocaleString('es-CO')} COP

Genera exactamente en este formato sin asteriscos ni markdown:
PROYECCION 6 MESES
Vendedores estimados: [numero]
Compradores estimados: [numero]
Comisiones estimadas: [monto en COP]

PROYECCION 1 ANO
Vendedores estimados: [numero]
Compradores estimados: [numero]
Comisiones estimadas: [monto en COP]

PROYECCION 2 ANOS
Vendedores estimados: [numero]
Compradores estimados: [numero]
Comisiones estimadas: [monto en COP]

ESCENARIO OPTIMISTA
[descripcion breve]

RECOMENDACION CLAVE
[una accion critica para lograr estas proyecciones]`,
    }

    const prompt = prompts[section] ?? prompts.metas

    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 600,
        messages: [{ role: 'user', content: prompt }]
      })
    })

    const groqData = await groqRes.json()
    const resultado = groqData.choices?.[0]?.message?.content ?? 'No se pudo generar el contenido.'

    return NextResponse.json({
      resultado,
      metrics: { totalVentas, comisiones, vendedores, compradores, totalOrdenes, ventasSemana, usuariosNuevosSemana, topCats }
    })
  } catch (error) {
    console.error('ai-business error:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
