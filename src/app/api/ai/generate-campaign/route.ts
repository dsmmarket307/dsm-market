import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { objective, audience, tone, productName } = await req.json();

    if (!objective || !audience || !tone || !productName) {
      return NextResponse.json(
        { error: "Faltan campos requeridos" },
        { status: 400 }
      );
    }

    const prompt = `Eres un experto en email marketing. Crea una campana de email profesional en espanol.

Producto/Servicio: ${productName}
Objetivo: ${objective}
Audiencia: ${audience}
Tono: ${tone}

Responde UNICAMENTE con un JSON valido con esta estructura exacta (sin markdown, sin explicaciones):
{
  "subject": "asunto del email",
  "preview": "texto de preview (max 90 caracteres)",
  "body": "cuerpo del email en HTML limpio usando solo etiquetas p, h2, ul, li, strong, a",
  "cta": "texto del boton de llamada a la accion"
}`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 1500,
    });

    const raw = completion.choices[0]?.message?.content ?? "";
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({ error: "La IA no devolvio JSON valido" }, { status: 500 });
    }

    const campaign = JSON.parse(jsonMatch[0]);
    return NextResponse.json({ success: true, campaign });
  } catch (error) {
    console.error("Error generando campana:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
