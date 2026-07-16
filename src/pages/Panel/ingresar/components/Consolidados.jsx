import { useCallback, useEffect, useState } from "react";
import {
  listarConsolidados, guardarConsolidado, eliminarConsolidado, buscarNvBasico,
} from "../ingresarService";
import { ACCENT } from "../ingresarService";

// ============================================================
//  Consolidados — NVs con fecha de despacho manual (comercial).
//  Quedan EXCLUIDAS de los indicadores de 48hrs. Solo Nilo + Admin.
// ============================================================

function ticketAbreviado(c) {
  const nvs = c.nvs.map((n) => n.nv).join(" · ");
  const f = c.fecha_comprometida ? ` · Compromiso ${c.fecha_comprometida}` : " · sin fecha";
  return `${c.ticket} · NV ${nvs || "—"}${f}`;
}

// Construye el payload completo para `guardar_consolidado` a partir de un
// consolidado existente. El RPC reemplaza el set completo de NVs, así que
// cada operación (fecha/estado/agregar/quitar NV) re-envía el consolidado
// entero con `over` sobreescribiendo los campos que cambian.
function payloadDe(c, over = {}) {
  const base = {
    id: c.id,
    fecha_comprometida: c.fecha_comprometida || null,
    estado: c.estado,
    observacion: c.observacion || null,
    nvs: c.nvs.map((n) => ({ nv: n.nv, canal: n.canal, cliente: n.cliente })),
  };
  return { ...base, ...over };
}

export default function Consolidados({ operador }) {
  const [lista, setLista] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  // --- Nuevo consolidado ---
  const [creando, setCreando] = useState(false);
  const [nvInput, setNvInput] = useState("");
  const [buscando, setBuscando] = useState(false);
  const [nvsPend, setNvsPend] = useState([]);
  const [fechaNueva, setFechaNueva] = useState("");
  const [obsNueva, setObsNueva] = useState("");
  const [guardando, setGuardando] = useState(false);

  const cargar = useCallback(async () => {
    setLoading(true); setError("");
    try {
      setLista(await listarConsolidados());
    } catch (e) {
      setError(e?.message || "Error al cargar consolidados");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const flash = (m) => { setToast(m); setTimeout(() => setToast(""), 3000); };

  // --- Validar y agregar NV a la lista pendiente (nuevo consolidado) ---
  const agregarNvPend = async () => {
    const t = nvInput.trim();
    if (!t) return;
    if (nvsPend.some((n) => n.nv === t)) { flash(`La NV ${t} ya está en la lista`); return; }
    setBuscando(true);
    try {
      const r = await buscarNvBasico(t);
      if (!r) { flash(`NV ${t} no existe en la base`); return; }
      setNvsPend((prev) => [...prev, { nv: r.nv, canal: r.canal, cliente: r.cliente }]);
      setNvInput("");
    } finally { setBuscando(false); }
  };

  const crear = async () => {
    if (nvsPend.length === 0) { flash("Agrega al menos una NV"); return; }
    setGuardando(true);
    const res = await guardarConsolidado({
      fecha_comprometida: fechaNueva || null,
      observacion: obsNueva || null,
      created_by: operador || null,
      nvs: nvsPend,
    });
    setGuardando(false);
    if (!res.ok) { flash(res.error || "Error al crear"); return; }
    flash(`✓ ${res.ticket || "Consolidado"} creado`);
    setNvsPend([]); setFechaNueva(""); setObsNueva(""); setCreando(false);
    cargar();
  };

  // --- Acciones sobre un consolidado existente ---
  const setFecha = async (c, fecha) => {
    const res = await guardarConsolidado(payloadDe(c, { fecha_comprometida: fecha || null }));
    if (!res.ok) { flash(res.error || "Error"); return; }
    setLista((prev) => prev.map((x) => x.id === c.id ? { ...x, fecha_comprometida: fecha || null } : x));
  };

  const toggleEstado = async (c) => {
    const nuevo = c.estado === "cerrado" ? "abierto" : "cerrado";
    const res = await guardarConsolidado(payloadDe(c, { estado: nuevo }));
    if (!res.ok) { flash(res.error || "Error"); return; }
    setLista((prev) => prev.map((x) => x.id === c.id ? { ...x, estado: nuevo } : x));
  };

  const eliminar = async (c) => {
    if (!confirm(`¿Eliminar ${c.ticket}? Las NVs volverán a medirse con las 48 hrs.`)) return;
    const res = await eliminarConsolidado(c.id);
    if (!res.ok) { flash(res.error || "Error"); return; }
    flash(`${c.ticket} eliminado`);
    setLista((prev) => prev.filter((x) => x.id !== c.id));
  };

  const quitarNv = async (c, nvId) => {
    const nvsRestantes = c.nvs.filter((n) => n.id !== nvId).map((n) => ({ nv: n.nv, canal: n.canal, cliente: n.cliente }));
    const res = await guardarConsolidado(payloadDe(c, { nvs: nvsRestantes }));
    if (!res.ok) { flash(res.error || "Error"); return; }
    setLista((prev) => prev.map((x) => x.id === c.id ? { ...x, nvs: x.nvs.filter((n) => n.id !== nvId) } : x));
  };

  const agregarNvExistente = async (c, nv, limpiar) => {
    const t = nv.trim();
    if (!t) return;
    const r = await buscarNvBasico(t);
    if (!r) { flash(`NV ${t} no existe`); return; }
    const nvsNuevas = [
      ...c.nvs.map((n) => ({ nv: n.nv, canal: n.canal, cliente: n.cliente })),
      { nv: r.nv, canal: r.canal, cliente: r.cliente },
    ];
    const res = await guardarConsolidado(payloadDe(c, { nvs: nvsNuevas }));
    if (!res.ok) { flash(res.error || "Error"); return; }
    limpiar();
    cargar();
  };

  return (
    <div className="anim-fade-up">
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-lg bg-gray-900 text-white text-[13px] shadow-lg">{toast}</div>
      )}

      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-bold text-gray-800">Consolidados</h2>
          <p className="text-[12px] text-gray-500">NVs con fecha de despacho manual (comercial). No se miden con las 48 hrs ni afectan los indicadores.</p>
        </div>
        {!creando && (
          <button onClick={() => setCreando(true)}
            className="px-3 py-2 rounded-lg text-white text-[13px] font-semibold" style={{ background: ACCENT }}>
            + Nuevo consolidado
          </button>
        )}
      </div>

      {/* Form nuevo */}
      {creando && (
        <div className="mb-5 rounded-xl border border-orange-200 bg-orange-50/40 p-4">
          <p className="text-[13px] font-semibold text-gray-800 mb-3">Nuevo consolidado</p>
          <div className="flex flex-wrap gap-2 mb-3">
            <input value={nvInput} onChange={(e) => setNvInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); agregarNvPend(); } }}
              placeholder="N° NV (ej. 5646)" className="inp flex-1 min-w-[160px]" />
            <button onClick={agregarNvPend} disabled={buscando}
              className="px-3 py-2 rounded-lg bg-gray-800 text-white text-[13px] font-medium disabled:opacity-50">
              {buscando ? "Validando…" : "Agregar NV"}
            </button>
          </div>
          {nvsPend.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {nvsPend.map((n) => (
                <span key={n.nv} className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-white border border-gray-200 text-[12px]">
                  <b>{n.nv}</b> <span className="text-gray-400">{n.cliente || n.canal}</span>
                  <button onClick={() => setNvsPend((p) => p.filter((x) => x.nv !== n.nv))} className="text-gray-400 hover:text-red-600">×</button>
                </span>
              ))}
            </div>
          )}
          <div className="flex flex-wrap gap-3 items-end">
            <label className="flex flex-col gap-1">
              <span className="text-[10px] uppercase tracking-wide text-gray-400 font-semibold">Fecha comprometida</span>
              <input type="date" value={fechaNueva} onChange={(e) => setFechaNueva(e.target.value)} className="inp" />
            </label>
            <label className="flex flex-col gap-1 flex-1 min-w-[180px]">
              <span className="text-[10px] uppercase tracking-wide text-gray-400 font-semibold">Observación (opcional)</span>
              <input value={obsNueva} onChange={(e) => setObsNueva(e.target.value)} className="inp" placeholder="Nota…" />
            </label>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={crear} disabled={guardando || nvsPend.length === 0}
              className="px-4 py-2 rounded-lg text-white text-[13px] font-semibold disabled:opacity-50" style={{ background: ACCENT }}>
              {guardando ? "Creando…" : "Crear consolidado"}
            </button>
            <button onClick={() => { setCreando(false); setNvsPend([]); setFechaNueva(""); setObsNueva(""); setNvInput(""); }}
              className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 text-[13px]">Cancelar</button>
          </div>
        </div>
      )}

      {error && <p className="text-[13px] text-red-600 mb-3">{error}</p>}
      {loading ? (
        <p className="text-[13px] text-gray-400 py-8 text-center">Cargando…</p>
      ) : lista.length === 0 ? (
        <p className="text-[13px] text-gray-400 py-8 text-center">Aún no hay consolidados.</p>
      ) : (
        <div className="space-y-3">
          {lista.map((c) => (
            <ConsolidadoCard key={c.id} c={c} onSetFecha={setFecha} onToggle={toggleEstado}
              onEliminar={eliminar} onQuitarNv={quitarNv} onAddNv={agregarNvExistente} />
          ))}
        </div>
      )}

      <style>{`
        .inp { height: 2.25rem; padding: 0 0.55rem; font-size: 13px; border: 1px solid #e5e7eb; border-radius: 0.5rem; outline: none; background: white; }
        .inp:focus { box-shadow: 0 0 0 2px #fed7aa; }
      `}</style>
    </div>
  );
}

function ConsolidadoCard({ c, onSetFecha, onToggle, onEliminar, onQuitarNv, onAddNv }) {
  const [nuevoNv, setNuevoNv] = useState("");
  const cerrado = c.estado === "cerrado";
  return (
    <div className={`rounded-xl border p-4 ${cerrado ? "border-gray-200 bg-gray-50/60" : "border-gray-200 bg-white"}`}>
      <div className="flex items-center justify-between gap-2 flex-wrap mb-2">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded-lg text-white text-[12px] font-bold" style={{ background: cerrado ? "#6b7280" : ACCENT }}>{c.ticket}</span>
          <span className={`text-[11px] px-1.5 py-0.5 rounded-full font-semibold ${cerrado ? "bg-gray-200 text-gray-600" : "bg-emerald-100 text-emerald-700"}`}>{cerrado ? "Cerrado" : "Abierto"}</span>
          {c.created_by && <span className="text-[11px] text-gray-400">por {c.created_by}</span>}
        </div>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1 text-[11px] text-gray-500">
            Compromiso:
            <input type="date" defaultValue={c.fecha_comprometida || ""} onChange={(e) => onSetFecha(c, e.target.value)}
              className="h-8 px-2 text-[12px] border border-gray-200 rounded-lg" />
          </label>
          <button onClick={() => onToggle(c)} className="text-[12px] px-2 py-1 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50">
            {cerrado ? "Reabrir" : "Cerrar"}
          </button>
          <button onClick={() => onEliminar(c)} className="text-[12px] px-2 py-1 rounded-lg border border-red-200 text-red-600 hover:bg-red-50">Eliminar</button>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-2">
        {c.nvs.length === 0 ? (
          <span className="text-[12px] text-gray-400">Sin NVs</span>
        ) : c.nvs.map((n) => (
          <span key={n.id} className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-gray-50 border border-gray-200 text-[12px]">
            <b>{n.nv}</b> <span className="text-gray-400">{n.cliente || n.canal}</span>
            <button onClick={() => n.id && onQuitarNv(c, n.id)} className="text-gray-400 hover:text-red-600">×</button>
          </span>
        ))}
      </div>

      <div className="flex gap-2 items-center">
        <input value={nuevoNv} onChange={(e) => setNuevoNv(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); onAddNv(c, nuevoNv, () => setNuevoNv("")); } }}
          placeholder="+ Agregar NV" className="h-8 px-2 text-[12px] border border-gray-200 rounded-lg flex-1 max-w-[200px]" />
        <button onClick={() => onAddNv(c, nuevoNv, () => setNuevoNv(""))} className="text-[12px] px-2 py-1 rounded-lg bg-gray-800 text-white">Agregar</button>
      </div>

      <p className="mt-2 text-[11px] text-gray-400 font-mono select-all">{ticketAbreviado(c)}</p>
    </div>
  );
}
