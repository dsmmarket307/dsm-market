import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";
import { getEmailsBySegment, Segment } from "@/lib/marketing/segments";

const resend = new Resend(process.env.RESEND_API_KEY);
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function buildEmail(campaign: any): string {
  const { headline, body, cta, product, subject } = campaign;
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background:#f0f0f0;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f0f0;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e0e0e0;">

        <!-- HEADER -->
        <tr>
          <td style="background:#0B0B0B;padding:20px 32px;text-align:center;">
            <span style="color:#D4AF37;font-size:22px;font-weight:700;letter-spacing:3px;">DMS MARKET</span>
          </td>
        </tr>

        <!-- IMAGEN PRODUCTO -->
        ${product.imageUrl ? `
        <tr>
          <td style="padding:0;background:#f8f8f8;text-align:center;">
            <img src="${product.imageUrl}" alt="${product.name}" width="600"
              style="width:100%;max-height:350px;object-fit:contain;display:block;background:#f8f8f8;"/>
          </td>
        </tr>` : ""}

        <!-- BADGE CATEGORIA -->
        <tr>
          <td style="padding:24px 32px 0;">
            <span style="background:#fff3cd;color:#b8860b;font-size:11px;font-weight:700;padding:4px 14px;border-radius:999px;letter-spacing:1px;text-transform:uppercase;">${product.category}</span>
          </td>
        </tr>

        <!-- HEADLINE -->
        <tr>
          <td style="padding:12px 32px 0;">
            <h1 style="color:#111111;font-size:24px;font-weight:700;margin:0;line-height:1.3;">${headline}</h1>
          </td>
        </tr>

        <!-- NOMBRE PRODUCTO -->
        <tr>
          <td style="padding:8px 32px 0;">
            <p style="color:#b8860b;font-size:15px;font-weight:600;margin:0;">${product.name}</p>
          </td>
        </tr>

        <!-- DIVIDER -->
        <tr>
          <td style="padding:16px 32px 0;">
            <div style="height:1px;background:#eeeeee;"></div>
          </td>
        </tr>

        <!-- BODY COPY -->
        <tr>
          <td style="padding:16px 32px 0;">
            <p style="color:#555555;font-size:15px;line-height:1.7;margin:0;">${body.replace(/\n/g, "<br/>")}</p>
          </td>
        </tr>

        <!-- PRECIO -->
        <tr>
          <td style="padding:24px 32px 0;">
            <div style="background:#f9f9f9;border:2px solid #D4AF37;border-radius:10px;padding:16px 20px;display:inline-block;">
              <span style="color:#888;font-size:11px;display:block;margin-bottom:4px;text-transform:uppercase;letter-spacing:1px;">Precio</span>
              <span style="color:#0B0B0B;font-size:28px;font-weight:700;">${product.price}</span>
            </div>
          </td>
        </tr>

        <!-- CTA -->
        <tr>
          <td style="padding:24px 32px 32px;" align="center">
            <a href="${product.productUrl}"
              style="display:inline-block;background:#D4AF37;color:#0B0B0B;font-size:16px;font-weight:700;padding:16px 48px;border-radius:8px;text-decoration:none;letter-spacing:0.5px;">
              ${cta}
            </a>
            <p style="margin:14px 0 0;">
              <a href="${product.productUrl}" style="color:#aaaaaa;font-size:11px;word-break:break-all;">${product.productUrl}</a>
            </p>
          </td>
        </tr>

        <!-- FOOTER -->
        <tr>
          <td style="background:#f8f8f8;padding:20px 32px;border-top:1px solid #eeeeee;text-align:center;">
            <p style="color:#aaaaaa;font-size:12px;margin:0;">DMS Market &bull; Pereira, Colombia</p>
            <p style="margin:6px 0 0;"><a href="#" style="color:#cccccc;font-size:11px;">Cancelar suscripcion</a></p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export async function POST(req: NextRequest) {
  try {
    const { segment, campaign } = await req.json();

    if (!segment || !campaign) {
      return NextResponse.json({ error: "Faltan campos: segment, campaign" }, { status: 400 });
    }

    const recipients = await getEmailsBySegment(segment as Segment);
    if (!recipients.length) {
      return NextResponse.json({ error: "No se encontraron emails para este segmento" }, { status: 400 });
    }

    const { data: saved, error: dbError } = await supabase
      .from("email_campaigns")
      .insert({
        title: campaign.product.name,
        subject: campaign.subject,
        content: campaign.body,
        audience: segment,
        status: "sending",
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (dbError || !saved) {
      return NextResponse.json({ error: "Error guardando campana" }, { status: 500 });
    }

    const html = buildEmail(campaign);
    let sentCount = 0;
    let failCount = 0;

    for (const email of recipients) {
      try {
        const { error } = await resend.emails.send({
          from: "DMS Market <onboarding@resend.dev>",
          to: [email],
          subject: campaign.subject,
          html,
        });

        const status = error ? "failed" : "sent";
        if (!error) sentCount++; else failCount++;

        await supabase.from("email_logs").insert({
          campaign_id: saved.id,
          email,
          status,
          sent_at: new Date().toISOString(),
        });
      } catch {
        failCount++;
        await supabase.from("email_logs").insert({
          campaign_id: saved.id,
          email,
          status: "failed",
          sent_at: new Date().toISOString(),
        });
      }
    }

    await supabase
      .from("email_campaigns")
      .update({ status: "sent", sent_count: sentCount })
      .eq("id", saved.id);

    return NextResponse.json({ success: true, sentCount, failCount, total: recipients.length });
  } catch (error) {
    console.error("Error enviando campana:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
