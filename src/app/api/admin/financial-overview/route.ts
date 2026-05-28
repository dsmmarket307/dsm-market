import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0).toISOString();

    // Ventas hoy
    const { data: todayOrders } = await supabase
      .from("orders")
      .select("total_price, platform_fee")
      .eq("payment_status", "approved")
      .gte("paid_at", startOfDay);

    // Ventas este mes
    const { data: monthOrders } = await supabase
      .from("orders")
      .select("total_price, platform_fee, seller_earnings, created_at")
      .eq("payment_status", "approved")
      .gte("paid_at", startOfMonth);

    // Ventas mes pasado
    const { data: lastMonthOrders } = await supabase
      .from("orders")
      .select("total_price")
      .eq("payment_status", "approved")
      .gte("paid_at", startOfLastMonth)
      .lte("paid_at", endOfLastMonth);

    // Suscripciones activas
    const { data: activeSubs } = await supabase
      .from("subscriptions")
      .select("plan_type, billing_cycle")
      .eq("status", "active");

    // Ingresos suscripciones este mes
    const { data: subPayments } = await supabase
      .from("transactions")
      .select("amount, plan")
      .eq("payment_status", "approved")
      .gte("created_at", startOfMonth);

    // Egresos este mes
    const { data: expenses } = await supabase
      .from("financial_expenses")
      .select("amount, category")
      .gte("date", startOfMonth.split("T")[0]);

    // Ordenes por mes (ultimos 6 meses)
    const { data: allOrders } = await supabase
      .from("orders")
      .select("total_price, platform_fee, paid_at")
      .eq("payment_status", "approved")
      .gte("paid_at", new Date(now.getFullYear(), now.getMonth() - 5, 1).toISOString());

    // Calculos
    const ingresosHoy = todayOrders?.reduce((s, o) => s + Number(o.platform_fee ?? 0), 0) ?? 0;
    const ventasMes = monthOrders?.reduce((s, o) => s + Number(o.total_price ?? 0), 0) ?? 0;
    const comisionesMes = monthOrders?.reduce((s, o) => s + Number(o.platform_fee ?? 0), 0) ?? 0;
    const ventasLastMonth = lastMonthOrders?.reduce((s, o) => s + Number(o.total_price ?? 0), 0) ?? 0;
    const crecimiento = ventasLastMonth > 0 ? ((ventasMes - ventasLastMonth) / ventasLastMonth) * 100 : 0;
    const ingresosSubs = subPayments?.reduce((s, t) => s + Number(t.amount ?? 0), 0) ?? 0;
    const egresosMes = expenses?.reduce((s, e) => s + Number(e.amount ?? 0), 0) ?? 0;
    const utilidadNeta = comisionesMes + ingresosSubs - egresosMes;

    // Grafica ultimos 6 meses
    const monthNames = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
    const chartData: any[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const label = monthNames[d.getMonth()];
      const ventas = allOrders
        ?.filter((o) => o.paid_at?.startsWith(key))
        .reduce((s, o) => s + Number(o.total_price ?? 0), 0) ?? 0;
      const comisiones = allOrders
        ?.filter((o) => o.paid_at?.startsWith(key))
        .reduce((s, o) => s + Number(o.platform_fee ?? 0), 0) ?? 0;
      chartData.push({ mes: label, ventas, comisiones });
    }

    // Suscripciones por plan
    const subsByPlan: Record<string, number> = {};
    activeSubs?.forEach((s) => {
      const key = s.plan_type ?? "basico";
      subsByPlan[key] = (subsByPlan[key] ?? 0) + 1;
    });

    return NextResponse.json({
      success: true,
      data: {
        ingresosHoy,
        ventasMes,
        comisionesMes,
        ingresosSubs,
        egresosMes,
        utilidadNeta,
        crecimiento: Math.round(crecimiento * 10) / 10,
        totalSubsActivas: activeSubs?.length ?? 0,
        subsByPlan,
        chartData,
        totalOrdenesMes: monthOrders?.length ?? 0,
      },
    });
  } catch (error) {
    console.error("Error financial overview:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
