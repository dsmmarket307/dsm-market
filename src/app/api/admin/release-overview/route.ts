import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    const { data: orders, error } = await supabase
      .from("orders")
      .select(`
        id, status, payment_status, total_price, platform_fee, seller_earnings,
        payout_released, payout_released_at, confirmed_by_buyer_at, guide_uploaded_at,
        auto_release_date, release_countdown_started_at, dispute_status,
        payment_release_status, created_at, paid_at, shipped_at,
        buyer_name, buyer_city,
        seller_id, product_id,
        tracking_number, shipping_company
      `)
      .eq("payment_status", "approved")
      .order("created_at", { ascending: false });

    if (error) throw error;

    const now = new Date();

    const enriched = orders?.map((o: any) => {
      let countdown = null;
      if (o.confirmed_by_buyer_at && !o.payout_released_at && o.dispute_status !== "open") {
        const releaseAt = o.auto_release_date
          ? new Date(o.auto_release_date)
          : new Date(new Date(o.confirmed_by_buyer_at).getTime() + 48 * 60 * 60 * 1000);
        const diff = releaseAt.getTime() - now.getTime();
        if (diff > 0) {
          const hours = Math.floor(diff / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          countdown = { hours, minutes, ready: false, releaseAt: releaseAt.toISOString() };
        } else {
          countdown = { hours: 0, minutes: 0, ready: true, releaseAt: releaseAt.toISOString() };
        }
      }
      return { ...o, countdown };
    }) ?? [];

    const dineroRetenido = enriched
      .filter((o) => !o.payout_released_at && o.dispute_status !== "open")
      .reduce((s, o) => s + Number(o.seller_earnings ?? 0), 0);

    const listosLiberar = enriched.filter((o) => o.countdown?.ready && !o.payout_released_at).length;
    const disputasAbiertas = enriched.filter((o) => o.dispute_status === "open").length;
    const countdownActivos = enriched.filter((o) => o.countdown && !o.countdown.ready).length;
    const sinGuia = enriched.filter((o) => !o.guide_uploaded_at && o.status === "paid").length;
    const sinConfirmar = enriched.filter((o) => o.status === "shipped" && !o.confirmed_by_buyer_at).length;

    return NextResponse.json({
      success: true,
      data: {
        orders: enriched,
        stats: { dineroRetenido, listosLiberar, disputasAbiertas, countdownActivos, sinGuia, sinConfirmar },
      },
    });
  } catch (error) {
    console.error("Error release overview:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
