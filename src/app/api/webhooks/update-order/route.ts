import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

async function crearPedidoDropi(order: any, product: any) {
  const token = process.env.DROPI_TOKEN
  if (!token || !product?.codigo_dropi) return null
  try {
    const body = {
      external_order_id: String(order.id),
      EnvioConCobro: false,
      amount: order.total_price,
      ciudad_destino: { cod_dane: order.buyer_city ?? '11001000' },
      customer: {
        names: order.buyer_name ?? '',
        lastnames: '',
        phone: order.buyer_phone ?? '',
        address: order.buyer_address ?? '',
      },
      products: [
        {
          id: parseInt(product.codigo_dropi),
          price: order.total_price,
          quantity: order.quantity ?? 1,
        },
      ],
    }
    const res = await fetch('https://app.dropi.co/api/v1/orders', {
      method: 'POST',
      headers: {
        'dropi-integracion-key': token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })
    const data = await res.json()
    return data
  } catch {
    return null
  }
}

export async function POST(req: NextRequest) {
  try {
    const { preference_id } = await req.json()
    if (!preference_id) return NextResponse.json({ error: 'No preference_id' }, { status: 400 })

    const admin = getAdmin()

    const { data: order } = await admin
      .from('orders')
      .select('*')
      .eq('preference_id', preference_id)
      .single()

    if (!order) return NextResponse.json({ error: 'Orden no encontrada' }, { status: 404 })

    await admin.from('orders').update({
      status: 'paid',
      payment_status: 'approved',
      paid_at: new Date().toISOString(),
    }).eq('preference_id', preference_id)

    if (order.product_id) {
      const { data: product } = await admin
        .from('products')
        .select('id, name, es_dropi, codigo_dropi, price')
        .eq('id', order.product_id)
        .single()

      if (product?.es_dropi && product?.codigo_dropi) {
        const { data: existing } = await admin
          .from('crm_pedidos')
          .select('id')
          .eq('order_id', String(order.id))
          .single()

        if (!existing) {
          const dropiResponse = await crearPedidoDropi(order, product)
          await admin.from('crm_pedidos').insert({
            codigo: 'DMS-' + Date.now().toString().slice(-6),
            order_id: String(order.id),
            cliente_nombre: order.buyer_name,
            cliente_email: order.buyer_email,
            cliente_telefono: order.buyer_phone,
            cliente_direccion: order.buyer_address,
            cliente_ciudad: order.buyer_city,
            producto_nombre: product.name,
            codigo_dropi: product.codigo_dropi,
            precio_proveedor: 0,
            precio_venta: order.total_price,
            estado: 'pendiente',
            notas: dropiResponse ? JSON.stringify(dropiResponse) : 'Sin respuesta de Dropi',
          })
        }
      }
    }

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
