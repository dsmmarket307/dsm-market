import { createClient } from '@/lib/supabase/client'
import { NextRequest, NextResponse } from 'next/server'

const PRODUCT_KEYWORDS = ['busco', 'producto', 'comprar', 'precio', 'vendo', 'quiero', 'tenis', 'camisa', 'celular', 'zapato', 'ropa', 'barato', 'economico', 'oferta', 'catalogo', 'tienda']

function isProductQuery(message: string) {
  const lower = message.toLowerCase()
  return PRODUCT_KEYWORDS.some(k => lower.includes(k))
}

export async function POST(req: NextRequest) {
  try {
    const { message, isLoggedIn } = await req.json()
    if (!message) return NextResponse.json({ error: 'Mensaje requerido' }, { status: 400 })

    const supabase = createClient()
    let products: any[] = []

    if (isProductQuery(message)) {
      const keywords = message.toLowerCase().split(' ').filter((w: string) => w.length > 3)
      let query = supabase
        .from('products')
        .select('id, name, price, description, category')
        .limit(3)
      if (keywords.length > 0) {
        query = query.or(keywords.map((k: string) => `name.ilike.%${k}%,description.ilike.%${k}%,category.ilike.%${k}%`).join(','))
      }
      const { data } = await query
      products = data ?? []
    }

    const productContext = products.length > 0
      ? products.map((p: any) =>
          `- ${p.name} | Precio: $${Number(p.price).toLocaleString('es-CO')} COP | Categoria: ${p.category ?? 'General'} | URL: /producto/detalle?id=${p.id}`
        ).join('\n')
      : ''

    const systemPrompt = isLoggedIn
      ? `Eres el Asistente DMS de DMS Market, un marketplace colombiano. El usuario esta registrado. Ayudale con busqueda de productos, como comprar, como vender, pagos, envios y soporte. Responde en espanol, amigable y conciso. No inventes productos.`
      : `Eres el Asistente DMS de DMS Market, un marketplace colombiano. Ayuda con busqueda de productos y preguntas basicas. Si pregunta sobre compras o ventas invitale a registrarse en /auth/register. Responde en espanol, amigable y conciso. No inventes productos.`

    const userContent = productContext
      ? `El cliente pregunta: "${message}"\n\nProductos disponibles:\n${productContext}\n\nResponde de forma natural.`
      : `El cliente pregunta: "${message}"\n\nResponde de forma natural y concisa.`

    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 400,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userContent },
        ],
      }),
    })

    const groqData = await groqRes.json()

    if (!groqRes.ok) {
      console.error('GROQ ERROR:', groqData)
      return NextResponse.json({ reply: 'Servicio de IA no disponible. Intenta de nuevo.', products })
    }

    const reply = groqData.choices?.[0]?.message?.content ?? 'Lo siento, intenta de nuevo.'
    return NextResponse.json({ reply, products })
  } catch (error) {
    console.error('Chat error:', error)
    return NextResponse.json({ reply: 'Hubo un error. Intenta de nuevo.' }, { status: 500 })
  }
}
