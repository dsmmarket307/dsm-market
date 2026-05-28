import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { orderId } = await req.json();
    if (!orderId) return NextResponse.json({ error: "Falta orderId" }, { status: 400 });

    const { data: order, error: orderError } = await admin
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (orderError || !order) return NextResponse.json({ error: "Orden no encontrada" }, { status: 404 });

    const { error } = await admin
      .from("orders")
      .update({ status: "released", payout_released_at: new Date().toISOString() })
      .eq("id", orderId);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    await admin.from("payouts").insert({
      seller_id: order.seller_id,
      order_id: orderId,
      amount: order.seller_earnings,
      platform_fee: order.platform_fee,
      status: "released",
      released_at: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error liberando pago:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
