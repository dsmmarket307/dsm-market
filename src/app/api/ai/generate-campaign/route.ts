import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { createClient } from "@supabase/supabase-js";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { productId, segment, tone, objective } = await req.json();

    if (!productId || !segment || !tone || !objective) {
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 });
    }

    const { data: product, error: productError } = await supabase
      .from("products")
      .select("id, name, description, price, category, slug, badge")
      .eq("id", productId)
      .single();

    if (productError || !product) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
    }

    const { data: images } = await supabase
      .from("product_images")
      .select("url")
      .eq("product_id", productId)
      .order("position", { ascending: true })
      .limit(1);

    const imageUrl = images?.[0]?.url ?? null;
    const productUrl = `https://dsm-market.vercel.app/producto/$productId`;
    const price = new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(product.price);

    const prompt = `Eres un experto en email marketing para ecommerce latinoamericano. 
Crea el copy de una campana de email profesional en espanol para el siguiente producto:

Producto: ${product.name}
Categoria: ${product.category}
Precio: ${price}
Descripcion: ${product.description ?? "Sin descripcion"}
Audiencia: ${segment}
Objetivo: ${objective}
Tono: ${tone}

Responde UNICAMENTE con JSON valido sin markdown:
{
  "subject": "asunto atractivo max 60 caracteres",
  "preview": "texto preview max 90 caracteres",
  "headline": "titulo principal del email max 50 caracteres",
  "body": "2 parrafos de copy persuasivo en texto plano",
  "cta": "texto del boton max 25 caracteres"
}`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 800,
    });

    const raw = completion.choices[0]?.message?.content ?? "";
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({ error: "La IA no devolvio JSON valido" }, { status: 500 });
    }

    const copy = JSON.parse(jsonMatch[0]);

    return NextResponse.json({
      success: true,
      campaign: {
        ...copy,
        product: {
          id: product.id,
          name: product.name,
          price,
          category: product.category,
          imageUrl,
          productUrl,
        },
      },
    });
  } catch (error) {
    console.error("Error generando campana:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

