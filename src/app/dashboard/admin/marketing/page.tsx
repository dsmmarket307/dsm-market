"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type CampaignDraft = {
  subject: string;
  preview: string;
  body: string;
  cta: string;
};

type Step = "form" | "preview" | "send" | "done";

export default function MarketingPage() {
  const [step, setStep] = useState<Step>("form");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    productName: "",
    objective: "",
    audience: "",
    tone: "profesional",
  });

  const [draft, setDraft] = useState<CampaignDraft | null>(null);
  const [recipients, setRecipients] = useState("");
  const [sendResult, setSendResult] = useState<{ sentCount: number; failCount: number } | null>(null);

  const handleGenerate = async () => {
    setError("");
    if (!form.productName || !form.objective || !form.audience) {
      setError("Completa todos los campos antes de continuar.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/ai/generate-campaign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al generar");
      setDraft(data.campaign);
      setStep("preview");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!draft) return;
    const { data, error: dbError } = await supabase.from("email_campaigns").insert({
      name: form.productName,
      subject: draft.subject,
      preview_text: draft.preview,
      body_html: draft.body,
      cta_text: draft.cta,
      audience: form.audience,
      tone: form.tone,
      objective: form.objective,
      status: "draft",
      created_at: new Date().toISOString(),
    }).select().single();

    if (dbError) { setError("Error guardando borrador: " + dbError.message); return; }
    return data?.id as string;
  };

  const handleSend = async () => {
    setError("");
    const emailList = recipients
      .split(/[\n,;]+/)
      .map((e) => e.trim())
      .filter((e) => e.includes("@"));

    if (!emailList.length) {
      setError("Ingresa al menos un email valido.");
      return;
    }
    setLoading(true);
    try {
      const campaignId = await handleSaveDraft();
      if (!campaignId) throw new Error("No se pudo guardar la campana.");

      const res = await fetch("/api/email/send-campaign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaignId,
          subject: draft!.subject,
          body: draft!.body,
          cta: draft!.cta,
          recipients: emailList,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al enviar");
      setSendResult({ sentCount: data.sentCount, failCount: data.failCount });
      setStep("done");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0f0f0f", padding: "32px 24px", fontFamily: "'Poppins', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <div style={{ maxWidth: 680, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ color: "#D4AF37", fontSize: 24, fontWeight: 700, margin: 0, letterSpacing: "-0.5px" }}>Marketing IA</h1>
          <p style={{ color: "#666", marginTop: 6, fontSize: 14 }}>Genera y envia campanas de email con inteligencia artificial</p>
        </div>

        {/* Stepper */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 32 }}>
          {[
            { id: "form", label: "Configurar" },
            { id: "preview", label: "Revisar" },
            { id: "send", label: "Enviar" },
            { id: "done", label: "Listo" },
          ].map((s, i) => {
            const steps = ["form", "preview", "send", "done"];
            const current = steps.indexOf(step);
            const idx = steps.indexOf(s.id);
            const active = idx === current;
            const done = idx < current;
            return (
              <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "6px 14px", borderRadius: 999, fontSize: 12, fontWeight: 600,
                  background: active ? "#D4AF37" : done ? "rgba(212,175,55,0.15)" : "rgba(255,255,255,0.05)",
                  color: active ? "#0B0B0B" : done ? "#D4AF37" : "#555",
                  border: `1px solid ${active ? "#D4AF37" : done ? "rgba(212,175,55,0.3)" : "rgba(255,255,255,0.08)"}`,
                  transition: "all 0.2s"
                }}>
                  {done ? (
                    <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ) : <span>{i + 1}</span>}
                  {s.label}
                </div>
                {i < 3 && <div style={{ height: 1, width: 20, background: done ? "rgba(212,175,55,0.3)" : "rgba(255,255,255,0.08)" }} />}
              </div>
            );
          })}
        </div>

        {/* Error */}
        {error && (
          <div style={{ marginBottom: 16, padding: "12px 16px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 10, color: "#f87171", fontSize: 13, display: "flex", alignItems: "center", gap: 8 }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {error}
          </div>
        )}

        {/* STEP 1 */}
        {step === "form" && (
          <div style={{ background: "#1a1a1a", borderRadius: 16, border: "1px solid rgba(212,175,55,0.12)", padding: 28 }}>
            <h2 style={{ color: "#fff", fontSize: 15, fontWeight: 600, margin: "0 0 20px" }}>Datos de la campana</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {[
                { key: "productName", label: "Producto o servicio", placeholder: "ej. DMS Market Premium" },
                { key: "objective",   label: "Objetivo de la campana", placeholder: "ej. Aumentar ventas del plan anual" },
                { key: "audience",    label: "Audiencia objetivo", placeholder: "ej. Comerciantes de Colombia entre 25-45 anos" },
              ].map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label style={{ display: "block", color: "#888", fontSize: 12, fontWeight: 500, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.5px" }}>{label}</label>
                  <input
                    style={{ width: "100%", background: "#111", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: "10px 14px", color: "#fff", fontSize: 14, outline: "none", boxSizing: "border-box", transition: "border 0.2s" }}
                    placeholder={placeholder}
                    value={(form as any)[key]}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    onFocus={(e) => e.target.style.borderColor = "#D4AF37"}
                    onBlur={(e) => e.target.style.borderColor = "rgba(255,255,255,0.08)"}
                  />
                </div>
              ))}
              <div>
                <label style={{ display: "block", color: "#888", fontSize: 12, fontWeight: 500, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.5px" }}>Tono del mensaje</label>
                <select
                  style={{ width: "100%", background: "#111", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: "10px 14px", color: "#fff", fontSize: 14, outline: "none", boxSizing: "border-box" }}
                  value={form.tone}
                  onChange={(e) => setForm({ ...form, tone: e.target.value })}
                >
                  <option value="profesional">Profesional</option>
                  <option value="amigable">Amigable y cercano</option>
                  <option value="urgente">Urgente / Oferta limitada</option>
                  <option value="educativo">Educativo / Informativo</option>
                  <option value="inspirador">Inspirador</option>
                </select>
              </div>
            </div>
            <button
              onClick={handleGenerate}
              disabled={loading}
              style={{ marginTop: 24, width: "100%", background: loading ? "#333" : "#D4AF37", color: "#0B0B0B", border: "none", borderRadius: 10, padding: "13px 0", fontSize: 14, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "all 0.2s" }}
            >
              {loading ? (
                <>
                  <svg style={{ animation: "spin 1s linear infinite" }} width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.3"/>
                    <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                  </svg>
                  Generando con IA...
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
                  </svg>
                  Generar campana con IA
                </>
              )}
            </button>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {/* STEP 2 */}
        {step === "preview" && draft && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ background: "#1a1a1a", borderRadius: 16, border: "1px solid rgba(212,175,55,0.12)", padding: 28 }}>
              <h2 style={{ color: "#fff", fontSize: 15, fontWeight: 600, margin: "0 0 20px" }}>Vista previa</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {[
                  { label: "Asunto", value: draft.subject },
                  { label: "Preview", value: draft.preview },
                  { label: "CTA", value: draft.cta },
                ].map(({ label, value }) => (
                  <div key={label} style={{ background: "#111", borderRadius: 10, padding: "12px 16px", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <span style={{ color: "#555", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: 500 }}>{label}</span>
                    <p style={{ color: "#e2e8f0", fontSize: 14, margin: "4px 0 0", fontWeight: label === "Asunto" ? 600 : 400 }}>{value}</p>
                  </div>
                ))}
                <div style={{ background: "#111", borderRadius: 10, padding: "16px", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <span style={{ color: "#555", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: 500 }}>Cuerpo</span>
                  <div style={{ color: "#cbd5e1", fontSize: 14, marginTop: 8, lineHeight: 1.7 }} dangerouslySetInnerHTML={{ __html: draft.body }} />
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={() => { setStep("form"); setDraft(null); }} style={{ flex: 1, background: "transparent", border: "1px solid rgba(255,255,255,0.1)", color: "#aaa", borderRadius: 10, padding: "12px 0", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
                Regenerar
              </button>
              <button onClick={() => setStep("send")} style={{ flex: 1, background: "#D4AF37", color: "#0B0B0B", border: "none", borderRadius: 10, padding: "12px 0", fontSize: 14, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                  <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13"/>
                </svg>
                Continuar al envio
              </button>
            </div>
          </div>
        )}

        {/* STEP 3 */}
        {step === "send" && draft && (
          <div style={{ background: "#1a1a1a", borderRadius: 16, border: "1px solid rgba(212,175,55,0.12)", padding: 28 }}>
            <h2 style={{ color: "#fff", fontSize: 15, fontWeight: 600, margin: "0 0 6px" }}>Destinatarios</h2>
            <p style={{ color: "#666", fontSize: 13, margin: "0 0 16px" }}>Pega los emails separados por coma, punto y coma o salto de linea.</p>
            <textarea
              style={{ width: "100%", background: "#111", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: "12px 14px", color: "#fff", fontSize: 14, outline: "none", resize: "none", boxSizing: "border-box", minHeight: 140, fontFamily: "monospace" }}
              placeholder={"cliente1@email.com\ncliente2@email.com"}
              value={recipients}
              onChange={(e) => setRecipients(e.target.value)}
            />
            <p style={{ color: "#555", fontSize: 12, margin: "6px 0 16px" }}>
              {recipients.split(/[\n,;]+/).filter((e) => e.trim().includes("@")).length} emails validos detectados
            </p>
            <div style={{ background: "rgba(212,175,55,0.06)", border: "1px solid rgba(212,175,55,0.2)", borderRadius: 10, padding: "12px 16px", marginBottom: 20, fontSize: 13, color: "#D4AF37" }}>
              Plan gratuito de Resend: solo envia a emails verificados en tu cuenta. Verifica tu dominio en resend.com para envios sin restriccion.
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={() => setStep("preview")} style={{ flex: 1, background: "transparent", border: "1px solid rgba(255,255,255,0.1)", color: "#aaa", borderRadius: 10, padding: "12px 0", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
                Volver
              </button>
              <button onClick={handleSend} disabled={loading} style={{ flex: 1, background: loading ? "#333" : "#16a34a", color: "#fff", border: "none", borderRadius: 10, padding: "12px 0", fontSize: 14, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                {loading ? "Enviando..." : (
                  <>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                      <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13"/>
                    </svg>
                    Enviar campana
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* STEP 4 */}
        {step === "done" && sendResult && (
          <div style={{ background: "#1a1a1a", borderRadius: 16, border: "1px solid rgba(212,175,55,0.12)", padding: 40, textAlign: "center" }}>
            <div style={{ width: 56, height: 56, background: "rgba(22,163,74,0.15)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2">
                <path d="M5 13l4 4L19 7"/>
              </svg>
            </div>
            <h2 style={{ color: "#fff", fontSize: 20, fontWeight: 700, margin: "0 0 8px" }}>Campana enviada</h2>
            <p style={{ color: "#666", fontSize: 14, margin: "0 0 28px" }}>La campana fue procesada y registrada en Supabase.</p>
            <div style={{ display: "flex", gap: 16, justifyContent: "center", marginBottom: 28 }}>
              <div style={{ background: "#111", borderRadius: 12, padding: "16px 28px", border: "1px solid rgba(22,163,74,0.2)" }}>
                <div style={{ color: "#16a34a", fontSize: 28, fontWeight: 700 }}>{sendResult.sentCount}</div>
                <div style={{ color: "#666", fontSize: 12, marginTop: 4 }}>Enviados</div>
              </div>
              <div style={{ background: "#111", borderRadius: 12, padding: "16px 28px", border: "1px solid rgba(239,68,68,0.2)" }}>
                <div style={{ color: "#ef4444", fontSize: 28, fontWeight: 700 }}>{sendResult.failCount}</div>
                <div style={{ color: "#666", fontSize: 12, marginTop: 4 }}>Fallidos</div>
              </div>
            </div>
            <button
              onClick={() => { setStep("form"); setForm({ productName: "", objective: "", audience: "", tone: "profesional" }); setDraft(null); setRecipients(""); setSendResult(null); }}
              style={{ background: "#D4AF37", color: "#0B0B0B", border: "none", borderRadius: 10, padding: "12px 28px", fontSize: 14, fontWeight: 700, cursor: "pointer" }}
            >
              Nueva campana
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
