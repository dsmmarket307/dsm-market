import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";

const resend = new Resend(process.env.RESEND_API_KEY);
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { campaignId, subject, body, cta, recipients } = await req.json();

    if (!campaignId || !subject || !body || !recipients?.length) {
      return NextResponse.json(
        { error: "Faltan campos: campaignId, subject, body, recipients" },
        { status: 400 }
      );
    }

    const htmlEmail = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
          <tr>
            <td style="background:#0B0B0B;padding:28px 40px;">
              <span style="color:#D4AF37;font-size:22px;font-weight:bold;letter-spacing:1px;">DMS Market</span>
            </td>
          </tr>
          <tr>
            <td style="padding:40px;color:#1e293b;font-size:16px;line-height:1.7;">
              ${body}
              ${cta ? `<p style="margin-top:32px;"><a href="#" style="display:inline-block;background:#0B0B0B;color:#D4AF37;padding:14px 28px;border-radius:6px;text-decoration:none;font-size:15px;font-weight:600;">${cta}</a></p>` : ""}
            </td>
          </tr>
          <tr>
            <td style="background:#f8fafc;padding:20px 40px;text-align:center;color:#94a3b8;font-size:13px;">
              DMS Market &bull; Pereira, Colombia &bull;
              <a href="#" style="color:#64748b;">Cancelar suscripcion</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    const results = [];
    let sentCount = 0;
    let failCount = 0;

    for (const email of recipients) {
      try {
        const { data, error } = await resend.emails.send({
          from: "DMS Market <onboarding@resend.dev>",
          to: [email],
          subject,
          html: htmlEmail,
        });

        const status = error ? "failed" : "sent";
        if (!error) sentCount++;
        else failCount++;

        await supabase.from("email_logs").insert({
          campaign_id: campaignId,
          recipient_email: email,
          status,
          resend_id: data?.id ?? null,
          error_message: error?.message ?? null,
          sent_at: new Date().toISOString(),
        });

        results.push({ email, status, id: data?.id });
      } catch (err: any) {
        failCount++;
        await supabase.from("email_logs").insert({
          campaign_id: campaignId,
          recipient_email: email,
          status: "failed",
          error_message: err.message,
          sent_at: new Date().toISOString(),
        });
        results.push({ email, status: "failed" });
      }
    }

    await supabase
      .from("email_campaigns")
      .update({ status: "sent", sent_at: new Date().toISOString(), sent_count: sentCount })
      .eq("id", campaignId);

    return NextResponse.json({ success: true, sentCount, failCount, results });
  } catch (error) {
    console.error("Error enviando campana:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
