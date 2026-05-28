import { NextRequest, NextResponse } from "next/server";
import { releasePayout } from "@/lib/actions/orders";

export async function POST(req: NextRequest) {
  try {
    const { orderId } = await req.json();
    if (!orderId) return NextResponse.json({ error: "Falta orderId" }, { status: 400 });
    const result = await releasePayout(orderId);
    if (result?.error) return NextResponse.json({ error: result.error }, { status: 400 });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error liberando pago:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
