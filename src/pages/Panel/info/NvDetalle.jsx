import { useEffect, useMemo, useState } from "react";
import { evaluateFormula } from '../formulaEngine';
import { calcFechaCompromiso, soloFecha } from '../dash/dashHelpers';
import { fetchAuditByNv } from '../dash/dashData';

// ============================================================
//  NvDetalle — vista rica de una NV (Hero + KPIs + Timeline + Activity)
//  Solo presentación: reusa el motor de fórmulas para prioridad/riesgo/horas.
// ============================================================

const HITOS = [
  { key: "fecha_aprobacion", label: "N.V Creada en Sistema" },
  { key: "fecha_registro_nv", label: "Registrada en Base de Datos" },
  { key: "fecha_en_proceso", label: "En Proceso" },
  { key: "fecha_shipping", label: "Shipping" },
  { key: "fecha_en_ruta", label: "En Ruta" },
  { key: "fecha_entregado", label: "Entregado" },
];

function fmtFechaHora(v) {
  if (!v) return "—";
  const d = new Date(typeof v === "string" && v.length === 10 ? v + "T12:00:00" : v);
  if (isNaN(d.getTime())) return String(v);
  return d.toLocaleDateString("es-CL", { day: "2-digit", month: "short" }).replace(".", "");
}
function fmtValor(v) {
  if (v == null || v === "") return "—";
  const n = Number(v);
  return isNaN(n) ? String(v) : "$" + n.toLocaleString("es-CL");
}

// Colores de badge por valor (semáforo) — consistente con el Builder.
function badgeColors(v) {
  const s = String(v).toUpperCase();
  if (["CRITICA", "FAIL", "TRUE", "RIESGO", "RISK", "VENCIDA"].includes(s)) return { bg: "#fef2f2", fg: "#b91c1c", dot: "#ef4444" };
  if (["ALTA", "PEND", "MEDIA"].includes(s)) return { bg: "#fffbeb", fg: "#b45309", dot: "#f59e0b" };
  if (["OK", "NORMAL", "FALSE", "FINALIZADA"].includes(s)) return { bg: "#f0fdf4", fg: "#15803d", dot: "#22c55e" };
  return { bg: "#eff6ff", fg: "#1d4ed8", dot: "#3b82f6" };
}

function Badge({ texto, big }) {
  const c = badgeColors(texto);
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-bold ${big ? "px-3 py-1 text-[13px]" : "px-2 py-0.5 text-[11px]"}`}
      style={{ background: c.bg, color: c.fg }}
    >
      <span className="rounded-full" style={{ background: c.dot, width: big ? 8 : 6, height: big ? 8 : 6 }} />
      {texto}
    </span>
  );
}

function Kpi({ valor, label, tono = "slate" }) {
  const tonos = {
    slate: "text-slate-800", red: "text-red-600", amber: "text-amber-600", green: "text-emerald-600",
  };
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-center">
      <div className={`text-xl font-bold tabular-nums ${tonos[tono]}`}>{valor}</div>
      <div className="text-[10px] uppercase tracking-wide text-slate-400 mt-0.5">{label}</div>
    </div>
  );
}

export default function NvDetalle({ r, est, color, nv, canal, children }) {
  const [audit, setAudit] = useState([]);
  const [verCampos, setVerCampos] = useState(false);
  const [auditCargado, setAuditCargado] = useState(false);

  // Fila para el motor: alias + fecha_compromiso derivada si falta.
  const evalRow = useMemo(() => {
    const fc = soloFecha(r.fecha_compromiso) || calcFechaCompromiso(soloFecha(r.fecha_aprobacion), soloFecha(r.fecha_aprobacion_real));
    return { ...r, fecha_compromiso: fc || null, fecha_entrega: r.fecha_entregado, fecha_creacion: r.fecha_registro_nv };
  }, [r]);

  const ev = (f) => evaluateFormula(f, evalRow).value;
  // ¿NV finalizada? (entregada / recibida) → las métricas "restantes/vencida"
  // NO aplican; en su lugar mostramos si llegó a tiempo (OTIF).
  const estLower = String(est).toLowerCase();
  const finalizada = estLower.includes("recibido") || estLower.includes("entregad");
  const prioridad = ev("PRIORIDAD_OPERACIONAL(fecha_compromiso, estado)");
  const lead = ev("DATEDIFF(fecha_aprobacion, fecha_entrega)");
  const esUrgente = r.urgente === true || String(r.urgente) === "true";

  // --- Métricas ACTIVAS (solo si NO finalizada) ---
  const horas = finalizada ? null : ev("HOURS_DIFF(NOW(), fecha_compromiso)");
  const dias = finalizada ? null : ev("DATEDIFF(NOW(), fecha_compromiso)");
  const enRiesgo = !finalizada && ev("RIESGO_OTIF(fecha_compromiso, estado)") === true;
  const vencida = !finalizada && typeof horas === "number" && horas < 0;

  // --- Métricas FINALIZADA (OTIF / desfase) ---
  // entrega efectiva: entregado → en ruta → despacho (lo que haya).
  const entregaEf = r.fecha_entregado || r.fecha_en_ruta || r.fecha_despacho || null;
  const desfase = finalizada && entregaEf && evalRow.fecha_compromiso
    ? evaluateFormula("DATEDIFF(fecha_compromiso, entrega)", { ...evalRow, entrega: entregaEf }).value
    : null; // >0 = entregó tarde
  const aTiempo = desfase == null ? null : desfase <= 0;

  useEffect(() => {
    let alive = true;
    setAuditCargado(false);
    fetchAuditByNv(nv)
      .then((a) => { if (alive) setAudit(a); })
      .catch(() => { if (alive) setAudit([]); })
      .finally(() => { if (alive) setAuditCargado(true); });
    return () => { alive = false; };
  }, [nv]);

  // Timeline: último hito con fecha = "actual"; los siguientes, pendientes.
  const ultimoConFecha = HITOS.reduce((acc, h, i) => (r[h.key] ? i : acc), -1);

  return (
    <div className="anim-fade-up px-4 py-4 bg-gradient-to-b from-slate-50 to-white border-t border-slate-100">
      {/* ===== Hero Card ===== */}
      <div
        className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
        style={{ background: `linear-gradient(135deg, ${color}0d 0%, #ffffff 60%)` }}
      >
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-medium text-slate-400 uppercase">{canal}</span>
              <h2 className="text-lg font-bold text-slate-900">NV {nv}</h2>
            </div>
            <p className="text-sm text-slate-600 mt-0.5 truncate">{r.cliente || "—"}</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-end">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[13px] font-bold text-white" style={{ background: color }}>
              {est}
            </span>
            {/* Activas: prioridad / vencida / riesgo. Finalizadas: resultado OTIF. */}
            {!finalizada && prioridad && prioridad !== "FINALIZADA" && prioridad !== "NORMAL" && <Badge texto={prioridad} big />}
            {!finalizada && vencida && <Badge texto="VENCIDA" big />}
            {!finalizada && enRiesgo && !vencida && <Badge texto="RIESGO OTIF" big />}
            {finalizada && aTiempo === true && <Badge texto="A TIEMPO" big />}
            {finalizada && aTiempo === false && <Badge texto={`TARDE +${desfase}d`} big />}
            {esUrgente && <Badge texto="🚨 URGENTE" big />}
          </div>
        </div>

        {/* Datos clave */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-2 mt-4 text-[13px]">
          <Dato icon="🚚" label="Transportista" value={r.transportista || "—"} />
          <Dato icon="📦" label="Bultos" value={r.bultos ?? "—"} />
          <Dato icon="💰" label="Valor factura" value={fmtValor(r.valor_factura)} />
          <Dato icon="📅" label="Compromiso" value={fmtFechaHora(evalRow.fecha_compromiso)} />
        </div>
      </div>

      {/* ===== Mini KPIs (según estado) ===== */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-3">
        {finalizada ? (
          <>
            <Kpi
              valor={aTiempo == null ? "—" : aTiempo ? "A tiempo" : "Tarde"}
              label="OTIF (puntualidad)"
              tono={aTiempo == null ? "slate" : aTiempo ? "green" : "red"}
            />
            <Kpi
              valor={desfase == null ? "—" : desfase <= 0 ? `${desfase}d` : `+${desfase}d`}
              label="Desfase vs compromiso"
              tono={desfase != null && desfase > 0 ? "red" : "green"}
            />
            <Kpi valor={lead == null ? "—" : `${lead}d`} label="Lead time" />
            <Kpi valor="FINALIZADA" label="Estado" tono="green" />
          </>
        ) : (
          <>
            <Kpi
              valor={horas == null ? "—" : `${Math.round(Math.abs(horas))}h`}
              label={vencida ? "Vencida hace" : "Restantes"}
              tono={vencida ? "red" : typeof horas === "number" && horas < 24 ? "amber" : "green"}
            />
            <Kpi valor={dias == null ? "—" : `${dias}d`} label="Días compromiso" tono={typeof dias === "number" && dias < 0 ? "red" : "slate"} />
            <Kpi valor={lead == null ? "—" : `${lead}d`} label="Lead time" />
            <Kpi valor={prioridad || "—"} label="Prioridad" tono={prioridad === "CRITICA" ? "red" : prioridad === "ALTA" ? "amber" : "slate"} />
          </>
        )}
      </div>

      {/* ===== Timeline horizontal ===== */}
      <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4 overflow-x-auto">
        <div className="flex items-start min-w-[560px]">
          {HITOS.map((h, i) => {
            const fecha = r[h.key];
            // Finalizada: todos los hitos completados (recorrió el flujo aunque
            // falten timestamps intermedios), sin "actual" ámbar.
            const done = finalizada || !!fecha;
            const current = !finalizada && i === ultimoConFecha;
            const dotColor = current ? "#f59e0b" : done ? "#22c55e" : "#cbd5e1";
            const lineDone = finalizada || i < ultimoConFecha;
            return (
              <div key={h.key} className="flex-1 flex flex-col items-center relative">
                {/* línea hacia el siguiente */}
                {i < HITOS.length - 1 && (
                  <span className="absolute top-[7px] left-1/2 w-full h-0.5" style={{ background: lineDone ? "#22c55e" : "#e2e8f0" }} />
                )}
                <span className="relative z-10 rounded-full" style={{ width: 14, height: 14, background: dotColor, boxShadow: current ? "0 0 0 4px #f59e0b22" : "none" }} />
                <span className={`text-[10px] mt-1.5 font-medium ${done ? "text-slate-700" : "text-slate-300"}`}>{h.label}</span>
                <span className="text-[9px] text-slate-400">{fecha ? fmtFechaHora(fecha) : ""}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ===== Activity Feed ===== */}
      <div className="mt-3 rounded-xl border border-slate-200 bg-white p-4">
        <h3 className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">Actividad</h3>
        {!auditCargado ? (
          <p className="text-[12px] text-slate-300">Cargando…</p>
        ) : audit.length === 0 ? (
          <p className="text-[12px] text-slate-400">Sin actividad registrada para esta NV.</p>
        ) : (
          <ul className="space-y-2" role="list" aria-label="Historial de actividad de la NV">
            {audit.map((e) => {
              const verbo = e.accion === "create" ? "creó" : e.accion === "update" ? "editó" : e.accion === "bulkUpdate" ? "actualizó" : e.accion;
              const hora = new Date(e.timestamp).toLocaleString("es-CL", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
              return (
                <li key={e.id} className="flex items-start gap-2.5 text-[12px]">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold shrink-0 mt-0.5">
                    {String(e.operador || "?").charAt(0).toUpperCase()}
                  </span>
                  <div className="min-w-0">
                    <span className="text-slate-700"><b>{e.operador}</b> {verbo}{e.campos ? <span className="text-slate-400"> · {e.campos}</span> : ""}</span>
                    <div className="text-[10px] text-slate-400">{hora}{e.exito === false ? " · falló" : ""}</div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* ===== Campos completos (colapsable) ===== */}
      {children && (
        <>
          <button
            onClick={() => setVerCampos((v) => !v)}
            className="mt-3 text-[12px] text-blue-600 hover:text-blue-800 font-medium"
          >
            {verCampos ? "▲ Ocultar todos los campos" : "▼ Ver todos los campos"}
          </button>
          {verCampos && <div className="mt-3 anim-fade-up">{children}</div>}
        </>
      )}
    </div>
  );
}

function Dato({ icon, label, value }) {
  return (
    <div className="flex items-center gap-2 min-w-0">
      <span className="text-base shrink-0">{icon}</span>
      <div className="min-w-0">
        <div className="text-[10px] text-slate-400 uppercase tracking-wide">{label}</div>
        <div className="text-[13px] font-medium text-slate-700 truncate">{String(value)}</div>
      </div>
    </div>
  );
}
