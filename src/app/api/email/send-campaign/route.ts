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
  const { headline, body, cta, product } = campaign;
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>${campaign.subject}</title>
</head>
<body style="margin:0;padding:0;background:#111;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#111;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#1a1a1a;border-radius:12px;overflow:hidden;border:1px solid rgba(212,175,55,0.2);">

        <!-- HEADER -->
        <tr>
          <td style="background:#0B0B0B;padding:20px 32px;border-bottom:1px solid rgba(212,175,55,0.15);">
            <span style="color:#D4AF37;font-size:20px;font-weight:700;letter-spacing:2px;">DMS MARKET</span>
          </td>
        </tr>

        <!-- IMAGEN PRODUCTO -->
        ${product.imageUrl ? `
        <tr>
          <td style="padding:0;">
            <img src="${product.imageUrl}" alt="${product.name}" width="600"
              style="width:100%;max-height:320px;object-fit:cover;display:block;"/>
          </td>
        </tr>` : ""}

        <!-- BADGE CATEGORIA -->
        <tr>
          <td style="padding:24px 32px 0;">
            <span style="background:rgba(212,175,55,0.12);color:#D4AF37;font-size:11px;font-weight:600;padding:4px 12px;border-radius:999px;letter-spacing:1px;text-transform:uppercase;">${product.category}</span>
          </td>
        </tr>

        <!-- HEADLINE -->
        <tr>
          <td style="padding:12px 32px 0;">
            <h1 style="color:#fff;font-size:26px;font-weight:700;margin:0;line-height:1.3;">${headline}</h1>
          </td>
        </tr>

        <!-- NOMBRE PRODUCTO -->
        <tr>
          <td style="padding:8px 32px 0;">
            <p style="color:#D4AF37;font-size:15px;font-weight:600;margin:0;">${product.name}</p>
          </td>
        </tr>

        <!-- BODY COPY -->
        <tr>
          <td style="padding:16px 32px 0;">
            <p style="color:#aaa;font-size:15px;line-height:1.7;margin:0;">${body.replace(/\n/g, "<br/>")}</p>
          </td>
        </tr>

        <!-- PRECIO -->
        <tr>
          <td style="padding:20px 32px 0;">
            <div style="background:#0B0B0B;border:1px solid rgba(212,175,55,0.2);border-radius:10px;padding:16px 20px;display:inline-block;">
              <span style="color:#888;font-size:12px;display:block;margin-bottom:4px;">PRECIO</span>
              <span style="color:#D4AF37;font-size:28px;font-weight:700;">${product.price}</span>
            </div>
          </td>
        </tr>

        <!-- CTA -->
        <tr>
          <td style="padding:24px 32px 32px;" align="center">
            <a href="${product.productUrl}"
              style="display:inline-block;background:#D4AF37;color:#0B0B0B;font-size:15px;font-weight:700;padding:14px 40px;border-radius:8px;text-decoration:none;letter-spacing:0.5px;">
              ${cta}
            </a>
            <p style="margin:12px 0 0;">
              <a href="${product.productUrl}" style="color:#555;font-size:12px;">${product.productUrl}</a>
            </p>
          </td>
        </tr>

        <!-- FOOTER -->
        <tr>
          <td style="background:#0B0B0B;padding:16px 32px;border-top:1px solid rgba(212,175,55,0.1);text-align:center;">
            <p style="color:#444;font-size:12px;margin:0;">DMS Market &bull; Pereira, Colombia</p>
            <p style="margin:6px 0 0;"><a href="#" style="color:#555;font-size:11px;">Cancelar suscripcion</a></p>
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
