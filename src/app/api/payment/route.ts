import { NextRequest, NextResponse } from 'next/server'
import { MercadoPagoConfig, Preference } from 'mercadopago'
import { createClient } from '@supabase/supabase-js'

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN!,
})

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { items, shipping_cost = 0 } = body

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'No hay productos' }, { status: 400 })
    }

    const subtotal = items.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0)
    const platform_fee = Math.round(subtotal * 0.05)
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

    const preference = new Preference(client)
    const result = await preference.create({
      body: {
        items: items.map((item: any) => ({
          id: item.id,
          title: item.name,
          quantity: Number(item.quantity),
          unit_price: Number(item.price),
          currency_id: 'COP',
        })),
        back_urls: {
          success: siteUrl + '/checkout/success',
          failure: siteUrl + '/checkout/failure',
          pending: siteUrl + '/checkout/pending',
        },
        notification_url: siteUrl + '/api/webhooks/mercadopago',
        metadata: { platform_fee, subtotal, shipping_cost },
      },
    })

    try {
      const admin = getAdmin()
      const item = items[0]
      const { data: product } = await admin
        .from('products')
        .select('id, seller_id, price')
        .eq('id', item.id)
        .single()

      await admin.from('orders').insert({
        preference_id: result.id,
        product_id: item.id,
        quantity: item.quantity,
        total_price: subtotal,
        platform_fee,
        seller_earnings: subtotal - platform_fee,
        status: 'pending',
        payment_method: 'mercadopago',
        seller_id: product?.seller_id || null,
        payment_status: 'pending',
      })
    } catch (dbError) {
      console.error('Error creando orden:', dbError)
    }

    return NextResponse.json({
      init_point: result.init_point,
      preference_id: result.id,
      platform_fee,
      subtotal,
      total: subtotal + shipping_cost,
    })
  } catch (error: any) {
    console.error('MP Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
