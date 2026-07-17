/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useMemo, useState } from "react";
import {
  fetchCalculatedFields, saveCalculatedField, deleteCalculatedField,
  fetchOperacionesSample, fetchDashboards,
} from "../builderService";
import { evaluateFormula, validarFormula, extractFields } from "../../formulaEngine";
import { useAuth } from "../../../../context/AuthContext";

// Busca en qué widgets/dashboards se usa un campo (análisis de impacto).
function buscarImpacto(field, dashboards) {
  const f = field.toLowerCase();
  const hits = [];
  const usaCampo = (cfg) => {
    if (!cfg) return false;
    const keys = ["valueField", "whereField", "labelField", "xField", "rowField", "colField", "comparisonField", "trendField"];
    for (const k of keys) if (cfg[k] && String(cfg[k]).toLowerCase() === f) return true;
    if (Array.isArray(cfg.columns) && cfg.columns.some((c) => String(c.key).toLowerCase() === f)) return true;
    if (Array.isArray(cfg.yFields) && cfg.yFields.some((y) => String(y.key).toLowerCase() === f)) return true;
    return false;
  };
  for (const d of dashboards) {
    const pages = d.config?.pages || (d.config?.widgets ? [{ name: "Hoja 1", widgets: d.config.widgets }] : []);
    for (const p of pages) {
      for (const w of (p.widgets || [])) {
        if (w.dataSource === "operaciones" && usaCampo(w.config)) {
          hits.push(`${d.name} › ${w.title || w.type}`);
        }
      }
    }
  }
  return hits;
}

const TIPOS = [
  { value: "texto", label: "Texto" },
  { value: "numero", label: "Número" },
  { value: "fecha", label: "Fecha" },
  { value: "badge", label: "Badge (semáforo)" },
];

// Snippets de funciones controladas (guían al usuario; evitan el "Excel en blanco").
const SNIPPETS = [
  { label: "Horas restantes", insert: "HOURS_DIFF(NOW(), fecha_compromiso)", hint: "horas hasta el compromiso" },
  { label: "Prioridad", insert: "PRIORIDAD_OPERACIONAL(fecha_compromiso, estado)", hint: "CRITICA/ALTA/MEDIA/NORMAL" },
  { label: "Riesgo OTIF", insert: "RIESGO_OTIF(fecha_compromiso, estado)", hint: "true si <24h y no entregado" },
  { label: "OTIF status", insert: "OTIF_STATUS(fecha_entrega, fecha_compromiso, estado)", hint: "OK/FAIL/RISK/PEND" },
  { label: "Antigüedad NV", insert: "NV_ANTIGUEDAD(fecha_creacion)", hint: "horas desde creación" },
  { label: "Lead time", insert: "DATEDIFF(fecha_aprobacion, fecha_entrega)", hint: "días aprobación→entrega" },
  { label: "Días hábiles", insert: "BUSINESS_DAYS(fecha_aprobacion, fecha_compromiso)", hint: "días hábiles entre fechas" },
  { label: "IF / condición", insert: 'IF(estado = "Entregado", "ok", "pendiente")', hint: "condición" },
];

// Render de badge por valor (semáforo).
function badgeColor(v) {
  const s = String(v).toUpperCase();
  if (["CRITICA", "FAIL", "TRUE", "RIESGO", "RISK"].includes(s)) return { bg: "#fef2f2", fg: "#b91c1c", dot: "#ef4444" };
  if (["ALTA", "PEND", "MEDIA"].includes(s)) return { bg: "#fffbeb", fg: "#b45309", dot: "#f59e0b" };
  if (["OK", "NORMAL", "FALSE", "FINALIZADA"].includes(s)) return { bg: "#f0fdf4", fg: "#15803d", dot: "#22c55e" };
  return { bg: "#f3f4f6", fg: "#374151", dot: "#9ca3af" };
}

const EMPTY = { nombre: "", formula: "", tipo: "texto", descripcion: "", activo: true };

export default function CamposCalculados({ editable, onClose }) {
  const [fields, setFields] = useState([]);
  const [sample, setSample] = useState([]);
  const [dashboards, setDashboards] = useState([]);
  const [sampleIdx, setSampleIdx] = useState(0);
  const [form, setForm] = useState({ ...EMPTY });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const { user } = useAuth();
  const operador = user?.nombre || "";

  const load = async () => {
    setLoading(true);
    const [fs, sm, db] = await Promise.all([fetchCalculatedFields(true), fetchOperacionesSample(25), fetchDashboards()]);
    setFields(fs);
    setSample(sm);
    setDashboards(db);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const sampleRow = sample[sampleIdx] || {};

  // Validación de sintaxis en vivo.
  const valid = useMemo(() => form.formula.trim() ? validarFormula(form.formula) : { ok: false, error: "" }, [form.formula]);

  // Gobernanza: campos conocidos = columnas reales de la NV + otros campos calculados.
  const knownFields = useMemo(() => {
    const s = new Set();
    Object.keys(sampleRow).forEach((k) => s.add(k.toLowerCase()));
    fields.forEach((cf) => { if (cf.id !== form.id) s.add(cf.nombre.toLowerCase()); });
    return s;
  }, [sampleRow, fields, form.id]);
  const referenced = useMemo(() => (valid.ok ? extractFields(form.formula) : []), [form.formula, valid.ok]);
  // Campos referenciados que NO existen (solo si tenemos una NV de muestra para conocer el esquema).
  const unknownFields = useMemo(
    () => (sample.length === 0 ? [] : referenced.filter((r) => !knownFields.has(r.toLowerCase()))),
    [referenced, knownFields, sample.length],
  );
  // Dependencias = campos calculados que esta fórmula referencia.
  const calcNames = useMemo(() => new Set(fields.map((c) => c.nombre.toLowerCase())), [fields]);
  const deps = useMemo(() => referenced.filter((r) => calcNames.has(r.toLowerCase())), [referenced, calcNames]);
  // Evaluación contra la NV seleccionada.
  const preview = useMemo(() => {
    if (!form.formula.trim() || !valid.ok) return null;
    return evaluateFormula(form.formula, sampleRow);
  }, [form.formula, valid.ok, sampleRow]);

  const insertSnippet = (txt) => setForm((f) => ({ ...f, formula: f.formula ? `${f.formula} ${txt}` : txt }));

  const editField = (cf) =>
    setForm({ id: cf.id, nombre: cf.nombre, formula: cf.formula, tipo: cf.tipo, descripcion: cf.descripcion || "", activo: cf.activo });

  const resetForm = () => { setForm({ ...EMPTY }); setError(""); };

  const handleSave = async () => {
    setError("");
    if (!valid.ok) { setError(valid.error || "Fórmula inválida"); return; }
    setSaving(true);
    const res = await saveCalculatedField({ ...form, created_by: operador });
    setSaving(false);
    if (!res.ok) { setError(res.error || "No se pudo guardar"); return; }
    resetForm();
    await load();
  };

  const handleDelete = async (cf) => {
    // Análisis de impacto: ¿qué widgets/dashboards usan este campo?
    const impacto = buscarImpacto(cf.nombre, dashboards);
    // ¿Otros campos calculados dependen de éste?
    const dependientes = fields
      .filter((o) => o.id !== cf.id && extractFields(o.formula).some((r) => r.toLowerCase() === cf.nombre.toLowerCase()))
      .map((o) => o.nombre);
    let msg = `¿Eliminar el campo calculado "${cf.nombre}"?`;
    if (impacto.length || dependientes.length) {
      msg += "\n\n⚠ Afectará:";
      dependientes.forEach((d) => { msg += `\n• Campo calculado: ${d}`; });
      impacto.forEach((h) => { msg += `\n• Widget: ${h}`; });
      msg += "\n\nEsos widgets/campos quedarán sin este dato.";
    }
    if (!confirm(msg)) return;
    await deleteCalculatedField(cf.id);
    if (form.id === cf.id) resetForm();
    await load();
  };

  return (
    <div className="fixed inset-0 z-[60] bg-slate-900/20 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
          <div>
            <h2 className="text-[15px] font-bold text-gray-900">Campos Calculados</h2>
            <p className="text-[11px] text-gray-400">Define métricas con fórmulas — se vuelven columnas disponibles para tus widgets.</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-gray-100 text-gray-400 text-lg">✕</button>
        </div>

        <div className="flex-1 overflow-auto grid grid-cols-1 md:grid-cols-[260px_1fr]">
          {/* Lista de campos */}
          <aside className="border-r border-gray-100 p-3 bg-gray-50/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">Campos ({fields.length})</span>
              {editable && <button onClick={resetForm} className="text-[11px] text-orange-600 font-medium hover:underline">+ Nuevo</button>}
            </div>
            {loading ? (
              <p className="text-[12px] text-gray-400 p-2">Cargando…</p>
            ) : fields.length === 0 ? (
              <p className="text-[12px] text-gray-400 p-2">Aún no hay campos. Crea el primero →</p>
            ) : (
              <ul className="space-y-1">
                {fields.map((cf) => (
                  <li key={cf.id}>
                    <button
                      onClick={() => editField(cf)}
                      className={`w-full text-left px-2.5 py-2 rounded-lg border text-[12px] transition-colors ${form.id === cf.id ? "border-orange-300 bg-orange-50" : "border-transparent hover:bg-white hover:border-gray-200"}`}
                    >
                      <div className="flex items-center gap-1.5">
                        <code className="font-semibold text-gray-800">{cf.nombre}</code>
                        {!cf.activo && <span className="text-[9px] text-gray-400">(inactivo)</span>}
                        <span className="ml-auto text-[9px] uppercase text-gray-400">{cf.tipo}</span>
                      </div>
                      {cf.descripcion && <div className="text-[10px] text-gray-400 truncate mt-0.5">{cf.descripcion}</div>}
                      {cf.created_by && <div className="text-[9px] text-gray-300 mt-0.5">por {cf.created_by}</div>}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </aside>

          {/* Editor */}
          <section className="p-5 space-y-4">
            {!editable && (
              <div className="text-[12px] text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
                Modo solo lectura. Necesitas rol supervisor o admin para editar campos calculados.
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-gray-500 mb-1">Nombre *</label>
                <input
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  placeholder="riesgo_otif"
                  disabled={!editable}
                  className="w-full h-9 px-2.5 text-[13px] font-mono rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-200"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-gray-500 mb-1">Tipo</label>
                <select
                  value={form.tipo}
                  onChange={(e) => setForm({ ...form, tipo: e.target.value })}
                  disabled={!editable}
                  className="w-full h-9 px-2 text-[13px] rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-200 bg-white"
                >
                  {TIPOS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-gray-500 mb-1">Descripción</label>
              <input
                value={form.descripcion}
                onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                placeholder="Detecta NV con riesgo de incumplir OTIF"
                disabled={!editable}
                className="w-full h-9 px-2.5 text-[13px] rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-200"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-gray-500 mb-1">Fórmula *</label>
              <textarea
                value={form.formula}
                onChange={(e) => setForm({ ...form, formula: e.target.value })}
                placeholder='IF(RIESGO_OTIF(fecha_compromiso, estado), "RIESGO", "OK")'
                disabled={!editable}
                rows={3}
                className="w-full px-2.5 py-2 text-[13px] font-mono rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-200 resize-y"
              />
              {/* Validación en vivo */}
              {form.formula.trim() && (
                valid.ok
                  ? <p className="text-[11px] text-emerald-600 mt-1">✓ Fórmula válida</p>
                  : <p className="text-[11px] text-red-600 mt-1">✕ {valid.error || "Fórmula inválida"}</p>
              )}
              {/* Gobernanza: campos inexistentes + dependencias */}
              {valid.ok && unknownFields.length > 0 && (
                <p className="text-[11px] text-amber-600 mt-1">⚠ Campo(s) no reconocido(s): <b>{unknownFields.join(", ")}</b> — revisa el nombre (devolverá vacío).</p>
              )}
              {valid.ok && deps.length > 0 && (
                <p className="text-[11px] text-violet-600 mt-1">⛓ Depende de: <b>{deps.join(", ")}</b></p>
              )}
              {/* Snippets */}
              {editable && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {SNIPPETS.map((s) => (
                    <button key={s.label} type="button" onClick={() => insertSnippet(s.insert)} title={s.hint}
                      className="px-2 py-1 rounded-md text-[10px] font-medium bg-gray-100 text-gray-600 hover:bg-orange-100 hover:text-orange-700">
                      + {s.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Preview */}
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">Vista previa</span>
                {sample.length > 0 && (
                  <select
                    value={sampleIdx}
                    onChange={(e) => setSampleIdx(Number(e.target.value))}
                    className="ml-auto h-7 px-2 text-[11px] rounded-md border border-gray-200 bg-white"
                  >
                    {sample.map((r, i) => <option key={i} value={i}>NV {r.nv} · {r.estado}</option>)}
                  </select>
                )}
              </div>
              {!form.formula.trim() ? (
                <p className="text-[12px] text-gray-400">Escribe una fórmula para ver el resultado.</p>
              ) : !valid.ok ? (
                <p className="text-[12px] text-red-500">Corrige la fórmula para previsualizar.</p>
              ) : preview && !preview.ok ? (
                <p className="text-[12px] text-red-500">Error: {preview.error}</p>
              ) : (
                <div className="flex items-center gap-2 text-[13px]">
                  <code className="text-gray-500">{form.nombre || "resultado"} =</code>
                  {form.tipo === "badge" ? (
                    (() => { const c = badgeColor(preview?.value); return (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[12px] font-semibold" style={{ background: c.bg, color: c.fg }}>
                        <span className="w-2 h-2 rounded-full" style={{ background: c.dot }} />
                        {String(preview?.value)}
                      </span>
                    ); })()
                  ) : (
                    <span className="font-semibold text-gray-900">{String(preview?.value)}</span>
                  )}
                </div>
              )}
            </div>

            {error && <p className="text-[12px] text-red-600">{error}</p>}

            {editable && (
              <div className="flex items-center justify-between pt-1">
                <div>
                  {form.id != null && (
                    <button onClick={() => handleDelete(fields.find((f) => f.id === form.id))} className="text-[12px] text-red-500 hover:text-red-700 font-medium">
                      Eliminar
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {form.id != null && <button onClick={resetForm} className="text-[12px] text-gray-500 hover:text-gray-900">Cancelar edición</button>}
                  <button
                    onClick={handleSave}
                    disabled={saving || !valid.ok || !form.nombre.trim()}
                    className="px-4 py-2 rounded-lg bg-orange-600 text-white text-[13px] font-semibold hover:bg-orange-700 disabled:opacity-40"
                  >
                    {saving ? "Guardando…" : form.id != null ? "Guardar cambios" : "Crear campo"}
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
