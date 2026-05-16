import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { producto } = await request.json()
  if (!producto) return NextResponse.json({ error: 'Producto requerido' }, { status: 400 })

  try {
    const { error } = await supabase.from('products').insert({
      name: producto.name,
      description: producto.description ?? '',
      price: producto.price ?? 0,
      original_price: producto.price ?? 0,
      category: producto.category ?? 'Otros',
      status: 'pending',
      es_dropi: true,
      codigo_dropi: String(producto.id),
      envio_gratis: true,
      stock: producto.stock ?? 0,
      seller_id: user.id,
    })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Error importando producto' }, { status: 500 })
  }
}