"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { SEGMENT_LABELS, Segment } from "@/lib/marketing/segments-client";
import { useTheme } from "@/lib/theme-context";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const THEMES = {
  dark:  { bg: "#0f0f0f", bg2: "#1a1a1a", bg3: "#111111", text: "#ffffff", text2: "#888888", text3: "#aaaaaa", border: "rgba(212,175,55,0.12)", borderSub: "rgba(255,255,255,0.05)", gold: "#D4AF37", input: "#111111", inputBorder: "rgba(255,255,255,0.08)", inputText: "#ffffff" },
  light: { bg: "#f5f5f5", bg2: "#ffffff",  bg3: "#e8e8e8", text: "#111111", text2: "#666666", text3: "#444444", border: "rgba(0,0,0,0.1)",         borderSub: "rgba(0,0,0,0.06)",         gold: "#B8960C", input: "#ffffff", inputBorder: "rgba(0,0,0,0.15)",    inputText: "#111111" },
}

type Step = "form" | "preview" | "sending" | "done";

type Product = {
  id: string;
  name: string;
  price: number;
  category: string;
  slug: string;
  imageUrl?: string;
};

type Campaign = {
  subject: string;
  preview: string;
  headline: string;
  body: string;
  cta: string;
  product: {
    id: string;
    name: string;
    price: string;
    category: string;
    imageUrl: string | null;
    productUrl: string;
  };
};

export default function MarketingPage() {
  const { theme } = useTheme();
  const t = THEMES[theme];

  const [step, setStep] = useState<Step>("form");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  const [form, setForm] = useState({
    productId: "",
    segment: "all_buyers" as Segment,
    tone: "profesional",
    objective: "",
  });

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [sendResult, setSendResult] = useState<{ sentCount: number; failCount: number; total: number } | null>(null);

  useEffect(() => {
    async function loadProducts() {
      setLoadingProducts(true);
      const { data: prods } = await supabase
        .from("products")
        .select("id, name, price, category, slug")
        .eq("status", "approved")
        .order("created_at", { ascending: false })
        .limit(50);

      if (!prods?.length) { setLoadingProducts(false); return; }

      const ids = prods.map((p: any) => p.id);
      const { data: imgs } = await supabase
        .from("product_images")
        .select("product_id, url")
        .in("product_id", ids)
        .order("position", { ascending: true });

      const withImages = prods.map((p: any) => ({
        ...p,
        imageUrl: imgs?.find((i: any) => i.product_id === p.id)?.url ?? null,
      }));

      setProducts(withImages);
      setLoadingProducts(false);
    }
    loadProducts();
  }, []);

  const selectedProduct = products.find((p) => p.id === form.productId);

  const handleGenerate = async () => {
    setError("");
    if (!form.productId) { setError("Selecciona un producto."); return; }
    if (!form.objective)  { setError("Escribe el objetivo de la campana."); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/ai/generate-campaign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al generar");
      setCampaign(data.campaign);
      setStep("preview");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    setError("");
    setStep("sending");
    setLoading(true);
    try {
      const res = await fetch("/api/email/send-campaign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ segment: form.segment, campaign }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al enviar");
      setSendResult({ sentCount: data.sentCount, failCount: data.failCount, total: data.total });
      setStep("done");
    } catch (e: any) {
      setError(e.message);
      setStep("preview");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setStep("form");
    setForm({ productId: "", segment: "all_buyers", tone: "profesional", objective: "" });
    setCampaign(null);
    setSendResult(null);
    setError("");
  };

  const inputStyle = {
    width: "100%", background: t.input, border: `1px solid ${t.inputBorder}`,
    borderRadius: 8, padding: "10px 14px", color: t.inputText, fontSize: 14,
    outline: "none", boxSizing: "border-box" as const, fontFamily: "'Poppins',sans-serif",
  };

  const labelStyle = {
    display: "block", color: t.text2, fontSize: 11, fontWeight: 500,
    marginBottom: 6, textTransform: "uppercase" as const, letterSpacing: "0.5px",
  };

  const steps = ["form", "preview", "sending", "done"];

  return (
    <div style={{ minHeight: "100vh", background: t.bg, padding: "32px 24px", fontFamily: "'Poppins',sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <div style={{ maxWidth: 720, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: 28, paddingBottom: "1rem", borderBottom: `2px solid ${t.gold}` }}>
          <p style={{ fontSize: "0.7rem", letterSpacing: "0.2em", textTransform: "uppercase", color: t.gold, marginBottom: "0.25rem" }}>Administrador</p>
          <h1 style={{ color: t.gold, fontSize: 22, fontWeight: 700, margin: 0 }}>Marketing IA</h1>
          <p style={{ color: t.text2, marginTop: 6, fontSize: 13, margin: 0 }}>Campanas automaticas con productos reales y segmentacion inteligente</p>
        </div>

        {/* Stepper */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 28 }}>
          {["Configurar", "Preview", "Enviando", "Listo"].map((label, i) => {
            const current = steps.indexOf(step);
            const active = i === current;
            const done = i < current;
            return (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{
                  display: "flex", alignItems: "center", gap: 6, padding: "5px 12px",
                  borderRadius: 999, fontSize: 11, fontWeight: 600,
                  background: active ? t.gold : done ? `${t.gold}25` : theme === "dark" ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)",
                  color: active ? "#0B0B0B" : done ? t.gold : t.text2,
                  border: `1px solid ${active ? t.gold : done ? `${t.gold}40` : t.border}`,
                }}>
                  {done
                    ? <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    : <span>{i + 1}</span>}
                  {label}
                </div>
                {i < 3 && <div style={{ width: 16, height: 1, background: done ? `${t.gold}40` : t.border }} />}
              </div>
            );
          })}
        </div>

        {/* Error */}
        {error && (
          <div style={{ marginBottom: 16, padding: "12px 16px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 10, color: "#f87171", fontSize: 13 }}>
            {error}
          </div>
        )}

        {/* STEP 1: Formulario */}
        {step === "form" && (
          <div style={{ background: t.bg2, borderRadius: 16, border: `1px solid ${t.border}`, padding: 28 }}>
            <h2 style={{ color: t.text, fontSize: 15, fontWeight: 600, margin: "0 0 22px" }}>Configurar campana</h2>

            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <div>
                <label style={labelStyle}>Audiencia</label>
                <select style={inputStyle} value={form.segment} onChange={(e) => setForm({ ...form, segment: e.target.value as Segment })}>
                  {(Object.entries(SEGMENT_LABELS) as [Segment, string][]).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={labelStyle}>Producto</label>
                {loadingProducts ? (
                  <div style={{ color: t.text2, fontSize: 13, padding: "10px 0" }}>Cargando productos...</div>
                ) : (
                  <select style={inputStyle} value={form.productId} onChange={(e) => setForm({ ...form, productId: e.target.value })}>
                    <option value="">Selecciona un producto</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>{p.name} — {new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(p.price)}</option>
                    ))}
                  </select>
                )}
                {selectedProduct && (
                  <div style={{ marginTop: 10, display: "flex", gap: 12, alignItems: "center", background: t.bg3, borderRadius: 10, padding: "10px 14px", border: `1px solid ${t.border}` }}>
                    {selectedProduct.imageUrl
                      ? <img src={selectedProduct.imageUrl} alt={selectedProduct.name} style={{ width: 48, height: 48, objectFit: "cover", borderRadius: 6 }} />
                      : <div style={{ width: 48, height: 48, background: t.bg2, borderRadius: 6, border: `1px solid ${t.inputBorder}` }} />}
                    <div>
                      <p style={{ color: t.text, fontSize: 13, fontWeight: 600, margin: 0 }}>{selectedProduct.name}</p>
                      <p style={{ color: t.gold, fontSize: 12, margin: "2px 0 0" }}>{selectedProduct.category}</p>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label style={labelStyle}>Tono</label>
                <select style={inputStyle} value={form.tone} onChange={(e) => setForm({ ...form, tone: e.target.value })}>
                  <option value="profesional">Profesional</option>
                  <option value="amigable">Amigable y cercano</option>
                  <option value="urgente">Urgente / Oferta limitada</option>
                  <option value="educativo">Educativo / Informativo</option>
                  <option value="inspirador">Inspirador</option>
                </select>
              </div>

              <div>
                <label style={labelStyle}>Objetivo de la campana</label>
                <input
                  style={inputStyle}
                  placeholder="ej. Aumentar ventas antes del fin de semana"
                  value={form.objective}
                  onChange={(e) => setForm({ ...form, objective: e.target.value })}
                />
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading || loadingProducts}
              style={{ marginTop: 24, width: "100%", background: loading ? t.bg3 : t.gold, color: "#0B0B0B", border: "none", borderRadius: 10, padding: "13px 0", fontSize: 14, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
            >
              {loading ? "Generando con IA..." : "Generar campana con IA"}
            </button>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {/* STEP 2: Preview */}
        {step === "preview" && campaign && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ background: t.bg2, borderRadius: 16, border: `1px solid ${t.border}`, padding: 24 }}>
              <h2 style={{ color: t.text, fontSize: 15, fontWeight: 600, margin: "0 0 16px" }}>Copy generado por IA</h2>
              {[
                { label: "Asunto",   value: campaign.subject  },
                { label: "Preview",  value: campaign.preview  },
                { label: "Titular",  value: campaign.headline },
                { label: "CTA",      value: campaign.cta      },
              ].map(({ label, value }) => (
                <div key={label} style={{ marginBottom: 10, background: t.bg3, borderRadius: 8, padding: "10px 14px", border: `1px solid ${t.borderSub}` }}>
                  <span style={{ color: t.text2, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.5px" }}>{label}</span>
                  <p style={{ color: t.text, fontSize: 13, margin: "3px 0 0", fontWeight: label === "Asunto" ? 600 : 400 }}>{value}</p>
                </div>
              ))}
              <div style={{ background: t.bg3, borderRadius: 8, padding: "10px 14px", border: `1px solid ${t.borderSub}` }}>
                <span style={{ color: t.text2, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.5px" }}>Cuerpo</span>
                <p style={{ color: t.text3, fontSize: 13, margin: "3px 0 0", lineHeight: 1.6 }}>{campaign.body}</p>
              </div>
            </div>

            {/* Preview email — mantiene diseño oscuro fijo (es un email) */}
            <div style={{ background: t.bg2, borderRadius: 16, border: `1px solid ${t.border}`, overflow: "hidden" }}>
              <div style={{ padding: "16px 24px", borderBottom: `1px solid ${t.border}` }}>
                <h2 style={{ color: t.text, fontSize: 15, fontWeight: 600, margin: 0 }}>Preview del email</h2>
              </div>
              <div style={{ background: t.bg3, padding: 16 }}>
                <div style={{ background: "#1a1a1a", borderRadius: 10, border: "1px solid rgba(212,175,55,0.15)", overflow: "hidden" }}>
                  <div style={{ background: "#0B0B0B", padding: "14px 20px" }}>
                    <span style={{ color: "#D4AF37", fontWeight: 700, fontSize: 16, letterSpacing: 2 }}>DMS MARKET</span>
                  </div>
                  {campaign.product.imageUrl && (
                    <img src={campaign.product.imageUrl} alt={campaign.product.name} style={{ width: "100%", maxHeight: 200, objectFit: "cover", display: "block" }} />
                  )}
                  <div style={{ padding: "16px 20px" }}>
                    <span style={{ background: "rgba(212,175,55,0.12)", color: "#D4AF37", fontSize: 10, padding: "3px 10px", borderRadius: 999, letterSpacing: 1, textTransform: "uppercase" }}>{campaign.product.category}</span>
                    <h3 style={{ color: "#fff", fontSize: 18, fontWeight: 700, margin: "10px 0 4px" }}>{campaign.headline}</h3>
                    <p style={{ color: "#D4AF37", fontSize: 13, fontWeight: 600, margin: "0 0 10px" }}>{campaign.product.name}</p>
                    <p style={{ color: "#999", fontSize: 13, lineHeight: 1.6, margin: "0 0 16px" }}>{campaign.body.slice(0, 120)}...</p>
                    <div style={{ background: "#0B0B0B", borderRadius: 8, padding: "12px 16px", marginBottom: 16, display: "inline-block" }}>
                      <span style={{ color: "#D4AF37", fontSize: 22, fontWeight: 700 }}>{campaign.product.price}</span>
                    </div>
                    <div>
                      <span style={{ background: "#D4AF37", color: "#0B0B0B", padding: "10px 24px", borderRadius: 6, fontSize: 13, fontWeight: 700 }}>{campaign.cta}</span>
                    </div>
                  </div>
                  <div style={{ background: "#0B0B0B", padding: "12px 20px", textAlign: "center" }}>
                    <span style={{ color: "#444", fontSize: 11 }}>DMS Market &bull; Pereira, Colombia</span>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ background: `${t.gold}10`, border: `1px solid ${t.gold}25`, borderRadius: 10, padding: "12px 16px", fontSize: 13, color: t.gold }}>
              Se enviara a: <strong>{SEGMENT_LABELS[form.segment]}</strong>
            </div>

            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={() => { setStep("form"); setCampaign(null); }} style={{ flex: 1, background: "transparent", border: `1px solid ${t.inputBorder}`, color: t.text2, borderRadius: 10, padding: "12px 0", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
                Volver
              </button>
              <button onClick={handleSend} style={{ flex: 1, background: "#16a34a", color: "#fff", border: "none", borderRadius: 10, padding: "12px 0", fontSize: 14, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                  <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13"/>
                </svg>
                Enviar campana
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Enviando */}
        {step === "sending" && (
          <div style={{ background: t.bg2, borderRadius: 16, border: `1px solid ${t.border}`, padding: 48, textAlign: "center" }}>
            <svg style={{ animation: "spin 1s linear infinite", margin: "0 auto 20px", display: "block" }} width="40" height="40" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke={t.bg3} strokeWidth="3"/>
              <path d="M12 2a10 10 0 0 1 10 10" stroke={t.gold} strokeWidth="3" strokeLinecap="round"/>
            </svg>
            <h2 style={{ color: t.text, fontSize: 18, fontWeight: 600, margin: "0 0 8px" }}>Enviando campana...</h2>
            <p style={{ color: t.text2, fontSize: 13 }}>Esto puede tomar unos segundos segun el tamano del segmento.</p>
          </div>
        )}

        {/* STEP 4: Done */}
        {step === "done" && sendResult && (
          <div style={{ background: t.bg2, borderRadius: 16, border: `1px solid ${t.border}`, padding: 40, textAlign: "center" }}>
            <div style={{ width: 56, height: 56, background: "rgba(22,163,74,0.15)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2">
                <path d="M5 13l4 4L19 7"/>
              </svg>
            </div>
            <h2 style={{ color: t.text, fontSize: 20, fontWeight: 700, margin: "0 0 8px" }}>Campana enviada</h2>
            <p style={{ color: t.text2, fontSize: 13, margin: "0 0 24px" }}>Registrada en Supabase y enviada via Resend.</p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", marginBottom: 28 }}>
              <div style={{ background: t.bg3, borderRadius: 12, padding: "14px 24px", border: "1px solid rgba(22,163,74,0.2)" }}>
                <div style={{ color: "#16a34a", fontSize: 26, fontWeight: 700 }}>{sendResult.sentCount}</div>
                <div style={{ color: t.text2, fontSize: 11, marginTop: 4 }}>Enviados</div>
              </div>
              <div style={{ background: t.bg3, borderRadius: 12, padding: "14px 24px", border: `1px solid ${t.gold}25` }}>
                <div style={{ color: t.gold, fontSize: 26, fontWeight: 700 }}>{sendResult.total}</div>
                <div style={{ color: t.text2, fontSize: 11, marginTop: 4 }}>Total segmento</div>
              </div>
              {sendResult.failCount > 0 && (
                <div style={{ background: t.bg3, borderRadius: 12, padding: "14px 24px", border: "1px solid rgba(239,68,68,0.2)" }}>
                  <div style={{ color: "#ef4444", fontSize: 26, fontWeight: 700 }}>{sendResult.failCount}</div>
                  <div style={{ color: t.text2, fontSize: 11, marginTop: 4 }}>Fallidos</div>
                </div>
              )}
            </div>
            <button onClick={reset} style={{ background: t.gold, color: "#0B0B0B", border: "none", borderRadius: 10, padding: "12px 28px", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
              Nueva campana
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
