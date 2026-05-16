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
        'dropi-integration-key': token,
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
    const body = await req.json()
    const topic = body.topic || body.type
    const resourceId = body.id || body.data?.id

    if (topic !== 'payment' || !resourceId) {
      return NextResponse.json({ ok: true })
    }

    const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${resourceId}`, {
      headers: { Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}` },
    })

    if (!mpRes.ok) return NextResponse.json({ ok: true }, { status: 200 })
    const payment = await mpRes.json()
    if (payment.status !== 'approved') return NextResponse.json({ ok: true })

    const admin = getAdmin()

    const { data: order } = await admin
      .from('orders')
      .select('*')
      .eq('preference_id', payment.preference_id)
      .single()

    if (order) {
      await admin.from('orders').update({
        status: 'paid',
        payment_id: String(payment.id),
        payment_status: payment.status,
        paid_at: new Date().toISOString(),
      }).eq('id', order.id)

      if (order.product_id) {
        const { data: product } = await admin
          .from('products')
          .select('id, name, es_dropi, codigo_dropi, price')
          .eq('id', order.product_id)
          .single()

        if (product?.es_dropi && product?.codigo_dropi) {
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
            notas: dropiResponse ? JSON.stringify(dropiResponse) : 'Pedido creado',
          })
        }
      }
    } else {
      const subtotal = payment.metadata?.subtotal || payment.transaction_amount || 0
      const platformFee = payment.metadata?.platform_fee || Math.round(subtotal * 0.05)
      await admin.from('orders').insert({
        payment_id: String(payment.id),
        preference_id: payment.preference_id,
        payment_status: payment.status,
        status: 'paid',
        total_amount: payment.transaction_amount,
        platform_fee: platformFee,
        seller_earnings: subtotal - platformFee,
        paid_at: new Date().toISOString(),
        buyer_email: payment.payer?.email || null,
      })
    }

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ ok: true })
}