import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET ?? "dms-cron-2026"}`) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const { data: pendingOrders } = await supabase
      .from("orders")
      .select("id, guide_uploaded_at, confirmed_by_buyer_at, status")
      .eq("payment_status", "approved")
      .eq("status", "shipped")
      .is("confirmed_by_buyer_at", null)
      .lte("guide_uploaded_at", sevenDaysAgo);

    let autoConfirmed = 0;
    let countdownStarted = 0;

    for (const order of pendingOrders ?? []) {
      const autoReleaseDate = new Date(now.getTime() + 48 * 60 * 60 * 1000).toISOString();
      await supabase.from("orders").update({
        confirmed_by_buyer_at: now.toISOString(),
        status: "delivered",
        auto_release_date: autoReleaseDate,
        release_countdown_started_at: now.toISOString(),
        payment_release_status: "countdown_active",
      }).eq("id", order.id);
      autoConfirmed++;
    }

    const { data: countdownOrders } = await supabase
      .from("orders")
      .select("id, confirmed_by_buyer_at, auto_release_date")
      .eq("payment_status", "approved")
      .eq("status", "delivered")
      .is("payout_released_at", null)
      .is("release_countdown_started_at", null)
      .not("confirmed_by_buyer_at", "is", null);

    for (const order of countdownOrders ?? []) {
      const autoReleaseDate = new Date(
        new Date(order.confirmed_by_buyer_at).getTime() + 48 * 60 * 60 * 1000
      ).toISOString();
      await supabase.from("orders").update({
        auto_release_date: autoReleaseDate,
        release_countdown_started_at: now.toISOString(),
        payment_release_status: "countdown_active",
      }).eq("id", order.id);
      countdownStarted++;
    }

    const { data: readyOrders } = await supabase
      .from("orders")
      .select("id, auto_release_date")
      .eq("payment_status", "approved")
      .eq("payment_release_status", "countdown_active")
      .is("payout_released_at", null)
      .lte("auto_release_date", now.toISOString());

    let markedReady = 0;
    for (const order of readyOrders ?? []) {
      await supabase.from("orders").update({
        payment_release_status: "ready_to_release",
      }).eq("id", order.id);
      markedReady++;
    }

    return NextResponse.json({
      success: true,
      autoConfirmed,
      countdownStarted,
      markedReady,
    });
  } catch (error) {
    console.error("Error auto-release:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
