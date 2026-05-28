"use client";

import { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

type FinancialData = {
  ingresosHoy: number;
  ventasMes: number;
  comisionesMes: number;
  ingresosSubs: number;
  egresosMes: number;
  utilidadNeta: number;
  crecimiento: number;
  totalSubsActivas: number;
  subsByPlan: Record<string, number>;
  chartData: { mes: string; ventas: number; comisiones: number }[];
  totalOrdenesMes: number;
};

const fmt = (n: number) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(n);

export default function FinanzasPage() {
  const [data, setData] = useState<FinancialData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/financial-overview")
      .then((r) => r.json())
      .then((r) => { if (r.success) setData(r.data); else setError(r.error); })
      .catch(() => setError("Error cargando datos"))
      .finally(() => setLoading(false));
  }, []);

  const card = (label: string, value: string, sub?: string, color?: string) => (
    <div style={{ background: "#1a1a1a", borderRadius: 14, border: "1px solid rgba(212,175,55,0.12)", padding: "20px 24px", flex: 1, minWidth: 180 }}>
      <p style={{ color: "#666", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.8px", margin: "0 0 8px" }}>{label}</p>
      <p style={{ color: color ?? "#fff", fontSize: 24, fontWeight: 700, margin: "0 0 4px", letterSpacing: "-0.5px" }}>{value}</p>
      {sub && <p style={{ color: "#555", fontSize: 12, margin: 0 }}>{sub}</p>}
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#0f0f0f", padding: "32px 24px", fontFamily: "'Poppins',sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: 32, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h1 style={{ color: "#D4AF37", fontSize: 22, fontWeight: 700, margin: 0 }}>Centro Financiero</h1>
            <p style={{ color: "#555", fontSize: 13, margin: "6px 0 0" }}>Resumen en tiempo real de DMS Market</p>
          </div>
          <button
            onClick={() => { setLoading(true); fetch("/api/admin/financial-overview").then(r => r.json()).then(r => { if (r.success) setData(r.data); }).finally(() => setLoading(false)); }}
            style={{ background: "rgba(212,175,55,0.1)", border: "1px solid rgba(212,175,55,0.2)", color: "#D4AF37", borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
          >
            Actualizar
          </button>
        </div>

        {error && (
          <div style={{ marginBottom: 20, padding: "12px 16px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 10, color: "#f87171", fontSize: 13 }}>
            {error}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: "center", padding: 80 }}>
            <div style={{ color: "#D4AF37", fontSize: 14 }}>Cargando datos financieros...</div>
          </div>
        ) : data ? (
          <>
            {/* Cards fila 1 */}
            <div style={{ display: "flex", gap: 14, marginBottom: 14, flexWrap: "wrap" }}>
              {card("Ingresos Hoy", fmt(data.ingresosHoy), "Comisiones del dia", "#D4AF37")}
              {card("Ventas del Mes", fmt(data.ventasMes), `${data.totalOrdenesMes} ordenes`)}
              {card("Comisiones Mes", fmt(data.comisionesMes), "Ganancia marketplace")}
              {card("Suscripciones", fmt(data.ingresosSubs), `${data.totalSubsActivas} activas`)}
            </div>

            {/* Cards fila 2 */}
            <div style={{ display: "flex", gap: 14, marginBottom: 28, flexWrap: "wrap" }}>
              {card("Egresos Mes", fmt(data.egresosMes), "Gastos registrados", "#f87171")}
              {card("Utilidad Neta", fmt(data.utilidadNeta), "Comisiones + Subs - Egresos", data.utilidadNeta >= 0 ? "#4ade80" : "#f87171")}
              {card("Crecimiento", `${data.crecimiento > 0 ? "+" : ""}${data.crecimiento}%`, "vs mes anterior", data.crecimiento >= 0 ? "#4ade80" : "#f87171")}
              <div style={{ background: "#1a1a1a", borderRadius: 14, border: "1px solid rgba(212,175,55,0.12)", padding: "20px 24px", flex: 1, minWidth: 180 }}>
                <p style={{ color: "#666", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.8px", margin: "0 0 8px" }}>Planes Activos</p>
                {Object.entries(data.subsByPlan).map(([plan, count]) => (
                  <div key={plan} style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ color: "#aaa", fontSize: 13, textTransform: "capitalize" }}>{plan}</span>
                    <span style={{ color: "#D4AF37", fontSize: 13, fontWeight: 600 }}>{count}</span>
                  </div>
                ))}
                {!Object.keys(data.subsByPlan).length && <p style={{ color: "#555", fontSize: 13, margin: 0 }}>Sin datos</p>}
              </div>
            </div>

            {/* Grafica ventas */}
            <div style={{ background: "#1a1a1a", borderRadius: 14, border: "1px solid rgba(212,175,55,0.12)", padding: 24, marginBottom: 14 }}>
              <h2 style={{ color: "#fff", fontSize: 14, fontWeight: 600, margin: "0 0 20px" }}>Ventas ultimos 6 meses</h2>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={data.chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="mes" tick={{ fill: "#666", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#666", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                  <Tooltip
                    contentStyle={{ background: "#1a1a1a", border: "1px solid rgba(212,175,55,0.2)", borderRadius: 8, color: "#fff", fontSize: 12 }}
                    formatter={(value: any) => [fmt(value)]}
                  />
                  <Bar dataKey="ventas" fill="rgba(212,175,55,0.6)" radius={[4,4,0,0]} name="Ventas" />
                  <Bar dataKey="comisiones" fill="#D4AF37" radius={[4,4,0,0]} name="Comisiones" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Grafica lineas */}
            <div style={{ background: "#1a1a1a", borderRadius: 14, border: "1px solid rgba(212,175,55,0.12)", padding: 24 }}>
              <h2 style={{ color: "#fff", fontSize: 14, fontWeight: 600, margin: "0 0 20px" }}>Tendencia comisiones</h2>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={data.chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="mes" tick={{ fill: "#666", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#666", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                  <Tooltip
                    contentStyle={{ background: "#1a1a1a", border: "1px solid rgba(212,175,55,0.2)", borderRadius: 8, color: "#fff", fontSize: 12 }}
                    formatter={(value: any) => [fmt(value)]}
                  />
                  <Line type="monotone" dataKey="comisiones" stroke="#D4AF37" strokeWidth={2} dot={{ fill: "#D4AF37", r: 4 }} name="Comisiones" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
