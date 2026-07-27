import { useEffect, useMemo, useState, useCallback } from 'react';
import { toast } from 'sonner';
import {
  Workflow as WorkflowIcon,
  Plus,
  X,
  Trash2,
  Pencil,
  ArrowRight,
  Circle,
  Flag,
  History,
  GitBranch,
  ShieldCheck,
  Layers,
  Share2,
  Lock,
  CheckCircle2,
  PlayCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  listarDefiniciones,
  listarEstados,
  listarTransiciones,
  listarHistorial,
  listarPermisos,
  guardarDefinicion,
  eliminarDefinicion,
  guardarEstado,
  eliminarEstado,
  guardarTransicion,
  eliminarTransicion,
  accionesDisponibles
} from '../../services/workflowService';

const fmt = (ts) => {
  if (!ts) return '—';
  const d = new Date(ts);
  return isNaN(d)
    ? '—'
    : d.toLocaleString('es-CL', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
};

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-5"
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[15px] font-black text-slate-800">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
const inp =
  'w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-orange-400';
const lbl = 'text-[11px] font-bold text-slate-500 uppercase tracking-wide';

// ── Diagrama de la máquina de estados (SVG + nodos) ─────────────────────────
const NW = 158,
  NH = 60,
  GAP = 104,
  STEP = NW + GAP,
  PADX = 78,
  LVL = 46;

function assignLevels(arcs) {
  const sorted = [...arcs].sort((a, b) => Math.min(a.a, a.b) - Math.min(b.a, b.b));
  const lastRight = [];
  const out = {};
  for (const arc of sorted) {
    const lo = Math.min(arc.a, arc.b),
      hi = Math.max(arc.a, arc.b);
    let lvl = 0;
    while (lvl < lastRight.length && lastRight[lvl] >= lo) lvl++;
    lastRight[lvl] = hi === lo ? hi + 0.5 : hi;
    out[arc.key] = lvl + 1;
  }
  return out;
}

function WorkflowDiagram({ estados, trans, onEditEstado, onEditTrans, puede }) {
  const S = useMemo(
    () => [...estados].sort((a, b) => a.orden - b.orden || a.codigo.localeCompare(b.codigo)),
    [estados]
  );
  const idx = useMemo(() => Object.fromEntries(S.map((s, i) => [s.codigo, i])), [S]);

  const geo = useMemo(() => {
    const above = [],
      below = [],
      straight = [],
      creation = [];
    trans.forEach((t) => {
      const hi = idx[t.hasta];
      if (hi == null) return;
      if (t.desde == null || t.desde === '') {
        creation.push({ ...t, hi });
        return;
      }
      const di = idx[t.desde];
      if (di == null) return;
      if (hi === di) above.push({ ...t, di, hi, self: true, key: 'a' + t.id });
      else if (hi === di + 1) straight.push({ ...t, di, hi, key: 's' + t.id });
      else if (hi > di + 1) above.push({ ...t, di, hi, key: 'a' + t.id });
      else below.push({ ...t, di, hi, key: 'b' + t.id });
    });
    const aLv = assignLevels(above.map((x) => ({ key: x.key, a: x.di, b: x.hi })));
    const bLv = assignLevels(below.map((x) => ({ key: x.key, a: x.di, b: x.hi })));
    const maxA = Math.max(0, ...Object.values(aLv));
    const maxB = Math.max(0, ...Object.values(bLv));
    const laneY = 34 + maxA * LVL + NH / 2 + 18;
    const height = laneY + NH / 2 + 18 + maxB * LVL + 44;
    const width = PADX * 2 + Math.max(1, S.length) * STEP - GAP + 20;
    const nodeX = (i) => PADX + i * STEP;
    const cx = (i) => nodeX(i) + NW / 2;
    return { above, below, straight, creation, aLv, bLv, laneY, height, width, nodeX, cx };
  }, [S, trans, idx]);

  const { laneY, height, width, nodeX, cx } = geo;
  const topY = laneY - NH / 2,
    botY = laneY + NH / 2;

  const arcPath = (a, up) => {
    const x1 = cx(a.di),
      x2 = cx(a.hi);
    const lvl = up ? geo.aLv[a.key] : geo.bLv[a.key];
    const peak = up ? topY - lvl * LVL : botY + lvl * LVL;
    if (a.self) {
      const off = 34;
      return {
        d: `M ${x1 - off} ${topY} C ${x1 - off} ${peak}, ${x1 + off} ${peak}, ${x1 + off} ${topY}`,
        lx: x1,
        ly: peak - 2
      };
    }
    const y0 = up ? topY : botY;
    return {
      d: `M ${x1} ${y0} C ${x1} ${peak}, ${x2} ${peak}, ${x2} ${y0}`,
      lx: (x1 + x2) / 2,
      ly: peak + (up ? -2 : 2)
    };
  };

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-[radial-gradient(theme(colors.slate.200)_1px,transparent_1px)] [background-size:20px_20px] bg-white p-2">
      <div className="relative" style={{ width, height, minWidth: '100%' }}>
        <svg
          className="absolute inset-0"
          width={width}
          height={height}
          style={{ overflow: 'visible' }}
        >
          <defs>
            <marker
              id="wf-arrow"
              markerWidth="10"
              markerHeight="10"
              refX="7"
              refY="3"
              orient="auto"
            >
              <path d="M0,0 L7,3 L0,6 Z" fill="#94a3b8" />
            </marker>
            <marker
              id="wf-arrow-start"
              markerWidth="10"
              markerHeight="10"
              refX="7"
              refY="3"
              orient="auto"
            >
              <path d="M0,0 L7,3 L0,6 Z" fill="#10b981" />
            </marker>
          </defs>
          {/* creación */}
          {geo.creation.map((t) => (
            <g key={'c' + t.id}>
              <circle cx={PADX - 34} cy={laneY} r="7" fill="#10b981" />
              <path
                d={`M ${PADX - 27} ${laneY} L ${nodeX(t.hi)} ${laneY}`}
                stroke="#10b981"
                strokeWidth="2"
                fill="none"
                markerEnd="url(#wf-arrow-start)"
                strokeDasharray="4 3"
              />
            </g>
          ))}
          {/* rectas (adyacentes) */}
          {geo.straight.map((t) => (
            <path
              key={t.key}
              d={`M ${nodeX(t.di) + NW} ${laneY} L ${nodeX(t.hi)} ${laneY}`}
              stroke="#94a3b8"
              strokeWidth="2"
              fill="none"
              markerEnd="url(#wf-arrow)"
            />
          ))}
          {/* arcos superiores (saltos / self) */}
          {geo.above.map((t) => {
            const p = arcPath(t, true);
            return (
              <path
                key={t.key}
                d={p.d}
                stroke="#cbd5e1"
                strokeWidth="2"
                fill="none"
                markerEnd="url(#wf-arrow)"
              />
            );
          })}
          {/* arcos inferiores (retrocesos) */}
          {geo.below.map((t) => {
            const p = arcPath(t, false);
            return (
              <path
                key={t.key}
                d={p.d}
                stroke="#fca5a5"
                strokeWidth="2"
                fill="none"
                markerEnd="url(#wf-arrow)"
              />
            );
          })}
        </svg>

        {/* etiquetas de acción (clic para editar) */}
        {[
          ...geo.straight.map((t) => ({
            t,
            lx: (nodeX(t.di) + NW + nodeX(t.hi)) / 2,
            ly: laneY - 13
          })),
          ...geo.above.map((t) => {
            const p = arcPath(t, true);
            return { t, lx: p.lx, ly: p.ly - 8 };
          }),
          ...geo.below.map((t) => {
            const p = arcPath(t, false);
            return { t, lx: p.lx, ly: p.ly + 8 };
          })
        ].map(({ t, lx, ly }) => (
          <button
            key={'lb' + t.key}
            onClick={() => puede && onEditTrans(t)}
            disabled={!puede}
            className="absolute -translate-x-1/2 -translate-y-1/2 text-[10px] font-mono font-bold text-slate-600 bg-white border border-slate-200 rounded px-1.5 py-0.5 shadow-sm hover:border-orange-300 hover:text-orange-600 transition-colors"
            style={{ left: lx, top: ly }}
          >
            {t.accion}
          </button>
        ))}

        {/* nodos de estado */}
        {S.map((s, i) => (
          <button
            key={s.codigo}
            onClick={() => puede && onEditEstado(s)}
            disabled={!puede}
            className="absolute rounded-xl border-2 bg-white shadow-sm hover:shadow-md transition-shadow text-left px-3 py-2 flex flex-col justify-center group"
            style={{
              left: nodeX(i),
              top: laneY - NH / 2,
              width: NW,
              height: NH,
              borderColor: s.color || '#cbd5e1'
            }}
          >
            <div className="flex items-center gap-1.5">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ background: s.color || '#cbd5e1' }}
              />
              <span className="font-black text-[13px] text-slate-800 truncate">{s.etiqueta}</span>
              {puede && (
                <Pencil
                  size={11}
                  className="ml-auto text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity"
                />
              )}
            </div>
            <div className="flex items-center gap-1 mt-1 ml-4">
              {s.es_inicial && (
                <span className="text-[8px] font-black text-emerald-600 bg-emerald-50 rounded px-1 py-px inline-flex items-center gap-0.5">
                  <Circle size={7} /> INICIAL
                </span>
              )}
              {s.es_final && (
                <span className="text-[8px] font-black text-slate-500 bg-slate-100 rounded px-1 py-px inline-flex items-center gap-0.5">
                  <Flag size={7} /> FINAL
                </span>
              )}
              {!s.es_inicial && !s.es_final && (
                <span className="text-[9px] font-mono text-slate-300 truncate">{s.codigo}</span>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Simulador de permisos (Fase 3 · Workflow Permissions) ──────────────────
// Desde un estado, muestra qué acciones puede ejecutar EL USUARIO EN SESIÓN,
// evaluado en el servidor por authz.can_transition (mismo gate que wf_transicionar).
function SimuladorPermisos({ workflow, estados }) {
  const [desde, setDesde] = useState('');
  const [acciones, setAcciones] = useState([]);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    setDesde('');
    setAcciones([]);
  }, [workflow]);
  useEffect(() => {
    let vivo = true;
    setCargando(true);
    accionesDisponibles(workflow, desde || null)
      .then((a) => {
        if (vivo) setAcciones(a);
      })
      .catch(() => {
        if (vivo) setAcciones([]);
      })
      .finally(() => {
        if (vivo) setCargando(false);
      });
    return () => {
      vivo = false;
    };
  }, [workflow, desde]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4">
      <div className="flex items-center gap-2 mb-3">
        <PlayCircle size={15} className="text-orange-500" />
        <h3 className="text-[12px] font-black text-slate-600 uppercase tracking-wide">
          Simulador de permisos
        </h3>
        <span className="text-[11px] text-slate-400 font-medium">
          — qué acciones puedes ejecutar tú
        </span>
      </div>
      <div className="flex items-center gap-2 mb-3">
        <span className={lbl}>Desde</span>
        <select
          value={desde}
          onChange={(e) => setDesde(e.target.value)}
          className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-orange-400"
        >
          <option value="">● inicio (creación)</option>
          {estados.map((e) => (
            <option key={e.codigo} value={e.codigo}>
              {e.etiqueta}
            </option>
          ))}
        </select>
      </div>
      {cargando ? (
        <p className="text-slate-400 text-[13px] py-3">Evaluando…</p>
      ) : acciones.length === 0 ? (
        <p className="text-slate-400 text-[13px] py-3">No hay acciones desde este estado.</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {acciones.map((a) => (
            <div
              key={a.id}
              className={`inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 text-[12px] ${a.permitida ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 bg-slate-50'}`}
            >
              {a.permitida ? (
                <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
              ) : (
                <Lock size={13} className="text-slate-400 shrink-0" />
              )}
              <span
                className={`font-mono font-bold ${a.permitida ? 'text-emerald-700' : 'text-slate-500'}`}
              >
                {a.accion}
              </span>
              <ArrowRight size={11} className="text-slate-300" />
              <span className="font-semibold text-slate-600">{a.hasta_etiqueta}</span>
              {a.permiso_id && (
                <span
                  className={`inline-flex items-center gap-1 text-[10px] font-bold rounded px-1.5 py-0.5 ml-1 ${a.permitida ? 'text-emerald-600 bg-white' : 'text-slate-400 bg-white border border-slate-200'}`}
                >
                  <ShieldCheck size={9} />
                  {a.permiso_id}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Workflows() {
  const { hasPermission, user } = useAuth();
  const puede =
    hasPermission('manage_workflows') || user?.rol === 'ADMIN' || user?.es_admin_delegado;

  const [defs, setDefs] = useState([]);
  const [sel, setSel] = useState(null);
  const [estados, setEstados] = useState([]);
  const [trans, setTrans] = useState([]);
  const [hist, setHist] = useState([]);
  const [permisos, setPermisos] = useState([]);
  const [tab, setTab] = useState('estados');
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);

  const cargarDefs = useCallback(async () => {
    setLoading(true);
    const d = await listarDefiniciones();
    setDefs(d);
    setLoading(false);
    setSel((prev) => (prev && d.find((x) => x.codigo === prev) ? prev : d[0]?.codigo || null));
  }, []);
  useEffect(() => {
    cargarDefs();
    listarPermisos().then(setPermisos);
  }, [cargarDefs]);

  const cargarDetalle = useCallback(async (wf) => {
    if (!wf) {
      setEstados([]);
      setTrans([]);
      setHist([]);
      return;
    }
    const [e, t, h] = await Promise.all([
      listarEstados(wf),
      listarTransiciones(wf),
      listarHistorial(wf)
    ]);
    setEstados(e);
    setTrans(t);
    setHist(h);
  }, []);
  useEffect(() => {
    cargarDetalle(sel);
  }, [sel, cargarDetalle]);

  const estadoMap = useMemo(() => Object.fromEntries(estados.map((e) => [e.codigo, e])), [estados]);
  const defActual = defs.find((d) => d.codigo === sel);
  const totales = useMemo(() => defs.reduce((a) => a, 0), [defs]);

  const run = async (fn, ok) => {
    const r = await fn;
    if (r?.ok) {
      toast.success(ok);
      return true;
    }
    toast.error(r?.error || 'Error');
    return false;
  };
  const saveDef = async (form) => {
    if (await run(guardarDefinicion(form), 'Proceso guardado')) {
      setModal(null);
      await cargarDefs();
      setSel(form.codigo);
    }
  };
  const delDef = async (codigo) => {
    if (!window.confirm(`¿Eliminar el proceso ${codigo} y todos sus estados/transiciones?`)) return;
    if (await run(eliminarDefinicion(codigo), 'Proceso eliminado')) {
      setSel(null);
      await cargarDefs();
    }
  };
  const saveEstado = async (form) => {
    if (await run(guardarEstado({ ...form, workflow: sel }), 'Estado guardado')) {
      setModal(null);
      cargarDetalle(sel);
    }
  };
  const delEstado = async (cod) => {
    if (!window.confirm(`¿Eliminar el estado ${cod}?`)) return;
    if (await run(eliminarEstado(sel, cod), 'Estado eliminado')) cargarDetalle(sel);
  };
  const saveTrans = async (form) => {
    if (await run(guardarTransicion({ ...form, workflow: sel }), 'Transición guardada')) {
      setModal(null);
      cargarDetalle(sel);
    }
  };
  const delTrans = async (id) => {
    if (!window.confirm('¿Eliminar la transición?')) return;
    if (await run(eliminarTransicion(id), 'Transición eliminada')) cargarDetalle(sel);
  };

  return (
    <div className="anim-fade-up space-y-4 max-w-[1400px] mx-auto pb-16">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 text-white grid place-items-center shadow-lg shadow-orange-500/20">
            <WorkflowIcon size={22} />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-800 leading-tight">Workflows</h1>
            <p className="text-[13px] text-slate-500">
              Procesos como datos: estados, transiciones y permisos. Sin programar.
            </p>
          </div>
        </div>
        {puede && (
          <button
            onClick={() => setModal({ tipo: 'def', data: {} })}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-orange-500 text-white text-sm font-bold hover:bg-orange-600 shadow-sm shadow-orange-500/30"
          >
            <Plus size={16} /> Nuevo proceso
          </button>
        )}
      </div>

      <div className="lg:flex lg:gap-4 lg:items-start">
        {/* Rail de procesos */}
        <div className="lg:w-60 shrink-0 mb-4 lg:mb-0">
          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
            <div className="px-4 py-2.5 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
              <Layers size={12} /> Procesos ({defs.length})
            </div>
            {loading ? (
              <div className="py-10 text-center text-slate-400 text-sm">Cargando…</div>
            ) : defs.length === 0 ? (
              <div className="py-10 text-center text-slate-400 text-sm px-4">Sin procesos aún.</div>
            ) : (
              <div className="divide-y divide-slate-100">
                {defs.map((d) => {
                  const activo = d.codigo === sel;
                  return (
                    <button
                      key={d.codigo}
                      onClick={() => setSel(d.codigo)}
                      className={`w-full text-left px-4 py-3 transition-colors border-l-[3px] ${activo ? 'bg-orange-50 border-l-orange-500' : 'border-l-transparent hover:bg-slate-50'}`}
                    >
                      <div className="flex items-center gap-2">
                        <GitBranch
                          size={14}
                          className={activo ? 'text-orange-500' : 'text-slate-400'}
                        />
                        <span className="font-black text-[13px] text-slate-800">{d.codigo}</span>
                        {!d.activo && (
                          <span className="text-[9px] font-bold text-slate-400 bg-slate-100 rounded px-1.5 py-0.5">
                            inactivo
                          </span>
                        )}
                      </div>
                      <div className="text-[12px] text-slate-500 truncate mt-0.5 ml-6">
                        {d.nombre}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Panel principal */}
        <div className="min-w-0 flex-1 space-y-4">
          {!defActual ? (
            <div className="rounded-2xl border border-slate-200 bg-white py-24 text-center text-slate-400 text-sm">
              Selecciona un proceso.
            </div>
          ) : (
            <>
              {/* Cabecera del proceso */}
              <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[16px] font-black text-slate-900">
                      {defActual.codigo}
                    </span>
                    <span className="text-[13px] text-slate-500">{defActual.nombre}</span>
                  </div>
                  {defActual.descripcion && (
                    <p className="text-[12px] text-slate-400 mt-0.5">{defActual.descripcion}</p>
                  )}
                  <div className="flex items-center gap-3 mt-2 text-[11px] font-bold text-slate-400">
                    <span className="inline-flex items-center gap-1">
                      <Circle size={11} /> {estados.length} estados
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Share2 size={11} /> {trans.length} transiciones
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <History size={11} /> {hist.length} en historial
                    </span>
                  </div>
                </div>
                {puede && (
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => setModal({ tipo: 'def', data: defActual })}
                      className="w-8 h-8 rounded-lg hover:bg-slate-100 grid place-items-center text-slate-400"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() => delDef(defActual.codigo)}
                      className="w-8 h-8 rounded-lg hover:bg-red-50 grid place-items-center text-red-400"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                )}
              </div>

              {/* Diagrama de la máquina de estados */}
              <div>
                <div className="flex items-center justify-between mb-2 px-1">
                  <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
                    <Share2 size={13} /> Máquina de estados
                  </h3>
                  {puede && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setModal({ tipo: 'estado', data: {} })}
                        className="text-[11px] font-bold text-orange-600 hover:text-orange-700 inline-flex items-center gap-1"
                      >
                        <Plus size={12} /> Estado
                      </button>
                      <button
                        onClick={() => setModal({ tipo: 'trans', data: {} })}
                        className="text-[11px] font-bold text-orange-600 hover:text-orange-700 inline-flex items-center gap-1"
                      >
                        <Plus size={12} /> Transición
                      </button>
                    </div>
                  )}
                </div>
                {estados.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-white py-16 text-center">
                    <p className="text-slate-500 text-sm font-semibold">
                      Este proceso aún no tiene estados
                    </p>
                    {puede && (
                      <p className="text-slate-400 text-[12px] mt-0.5">
                        Agrega el primero (márcalo como inicial) para dibujar la máquina.
                      </p>
                    )}
                  </div>
                ) : (
                  <WorkflowDiagram
                    estados={estados}
                    trans={trans}
                    puede={puede}
                    onEditEstado={(s) => setModal({ tipo: 'estado', data: s })}
                    onEditTrans={(t) => setModal({ tipo: 'trans', data: t })}
                  />
                )}
                <div className="flex items-center gap-4 mt-2 px-1 text-[10px] text-slate-400">
                  <span className="inline-flex items-center gap-1">
                    <span className="w-4 h-px bg-slate-400 inline-block" /> avance
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <span className="w-4 h-px bg-slate-300 inline-block" /> salto
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <span className="w-4 h-px bg-red-300 inline-block" /> retroceso/cancelar
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> creación
                  </span>
                  {puede && (
                    <span className="ml-auto italic">clic en un nodo o etiqueta para editar</span>
                  )}
                </div>
              </div>

              {/* Simulador de permisos (Workflow Permissions) */}
              {estados.length > 0 && <SimuladorPermisos workflow={sel} estados={estados} />}

              {/* Listas editables */}
              <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
                <div className="flex gap-1 px-3 pt-3">
                  {[
                    ['estados', `Estados (${estados.length})`],
                    ['transiciones', `Transiciones (${trans.length})`],
                    ['historial', `Historial (${hist.length})`]
                  ].map(([k, l]) => (
                    <button
                      key={k}
                      onClick={() => setTab(k)}
                      className={`px-3 py-1.5 rounded-lg text-[12px] font-bold transition-colors ${tab === k ? 'bg-orange-100 text-orange-700' : 'text-slate-500 hover:bg-slate-50'}`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
                <div className="p-4">
                  {tab === 'estados' &&
                    (estados.length === 0 ? (
                      <p className="text-slate-400 text-sm py-6 text-center">Sin estados.</p>
                    ) : (
                      <div className="grid sm:grid-cols-2 gap-1.5">
                        {[...estados]
                          .sort((a, b) => a.orden - b.orden)
                          .map((e) => (
                            <div
                              key={e.codigo}
                              className="flex items-center gap-3 px-3 py-2 rounded-xl border border-slate-100 bg-slate-50/60"
                            >
                              <span
                                className="w-3 h-3 rounded-full shrink-0"
                                style={{ background: e.color || '#cbd5e1' }}
                              />
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-[13px] text-slate-800 truncate">
                                    {e.etiqueta}
                                  </span>
                                  <span className="text-[10px] font-mono text-slate-400">
                                    {e.codigo}
                                  </span>
                                </div>
                              </div>
                              {e.es_inicial && (
                                <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 rounded px-1.5 py-0.5">
                                  INICIAL
                                </span>
                              )}
                              {e.es_final && (
                                <span className="text-[9px] font-black text-slate-600 bg-slate-100 rounded px-1.5 py-0.5">
                                  FINAL
                                </span>
                              )}
                              {puede && (
                                <div className="flex items-center gap-0.5 shrink-0">
                                  <button
                                    onClick={() => setModal({ tipo: 'estado', data: e })}
                                    className="w-7 h-7 rounded-lg hover:bg-white grid place-items-center text-slate-400"
                                  >
                                    <Pencil size={13} />
                                  </button>
                                  <button
                                    onClick={() => delEstado(e.codigo)}
                                    className="w-7 h-7 rounded-lg hover:bg-red-50 grid place-items-center text-red-400"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                </div>
                              )}
                            </div>
                          ))}
                      </div>
                    ))}
                  {tab === 'transiciones' &&
                    (trans.length === 0 ? (
                      <p className="text-slate-400 text-sm py-6 text-center">Sin transiciones.</p>
                    ) : (
                      <div className="grid sm:grid-cols-2 gap-1.5">
                        {trans.map((t) => (
                          <div
                            key={t.id}
                            className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-100 bg-slate-50/60 text-[12px]"
                          >
                            <span className="inline-flex items-center gap-1.5 min-w-0">
                              <span
                                className="w-2 h-2 rounded-full"
                                style={{ background: estadoMap[t.desde]?.color || '#e2e8f0' }}
                              />
                              <span className="font-semibold text-slate-600 truncate">
                                {t.desde ? estadoMap[t.desde]?.etiqueta || t.desde : '● inicio'}
                              </span>
                            </span>
                            <span className="inline-flex items-center gap-1 text-slate-400 shrink-0">
                              <ArrowRight size={12} />
                              <span className="font-mono text-[10px] bg-white border border-slate-200 rounded px-1.5 py-0.5 text-slate-500">
                                {t.accion}
                              </span>
                            </span>
                            <span className="inline-flex items-center gap-1.5 min-w-0">
                              <span
                                className="w-2 h-2 rounded-full"
                                style={{ background: estadoMap[t.hasta]?.color || '#cbd5e1' }}
                              />
                              <span className="font-bold text-slate-800 truncate">
                                {estadoMap[t.hasta]?.etiqueta || t.hasta}
                              </span>
                            </span>
                            {t.permiso_id && (
                              <span className="ml-auto shrink-0 inline-flex items-center gap-1 text-[10px] font-bold text-slate-500 bg-white border border-slate-200 rounded px-1.5 py-0.5">
                                <ShieldCheck size={10} />
                                {t.permiso_id}
                              </span>
                            )}
                            {puede && (
                              <div
                                className={`flex items-center gap-0.5 shrink-0 ${t.permiso_id ? '' : 'ml-auto'}`}
                              >
                                <button
                                  onClick={() => setModal({ tipo: 'trans', data: t })}
                                  className="w-7 h-7 rounded-lg hover:bg-white grid place-items-center text-slate-400"
                                >
                                  <Pencil size={13} />
                                </button>
                                <button
                                  onClick={() => delTrans(t.id)}
                                  className="w-7 h-7 rounded-lg hover:bg-red-50 grid place-items-center text-red-400"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ))}
                  {tab === 'historial' &&
                    (hist.length === 0 ? (
                      <p className="text-slate-400 text-sm py-6 text-center">
                        Sin transiciones ejecutadas todavía. El historial se llena al operar los
                        procesos.
                      </p>
                    ) : (
                      <div className="space-y-1.5">
                        {hist.map((h) => (
                          <div
                            key={h.id}
                            className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-100 text-[12px]"
                          >
                            <History size={13} className="text-slate-300 shrink-0" />
                            <span className="font-mono text-[10px] text-slate-400 truncate max-w-[120px]">
                              {h.entidad_id}
                            </span>
                            <span className="text-slate-500 truncate">
                              {h.desde || '(inicio)'} <ArrowRight size={10} className="inline" />{' '}
                              <b className="text-slate-700">{h.hasta}</b>
                            </span>
                            {h.nota === 'off-model' && (
                              <span className="text-[9px] font-black text-amber-600 bg-amber-50 rounded px-1.5 py-0.5">
                                off-model
                              </span>
                            )}
                            <span className="ml-auto text-[10px] text-slate-400 shrink-0">
                              {h.actor || '—'} · {fmt(h.creado_en)}
                            </span>
                          </div>
                        ))}
                      </div>
                    ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {modal?.tipo === 'def' && (
        <DefModal data={modal.data} onClose={() => setModal(null)} onSave={saveDef} />
      )}
      {modal?.tipo === 'estado' && (
        <EstadoModal data={modal.data} onClose={() => setModal(null)} onSave={saveEstado} />
      )}
      {modal?.tipo === 'trans' && (
        <TransModal
          data={modal.data}
          estados={estados}
          permisos={permisos}
          onClose={() => setModal(null)}
          onSave={saveTrans}
        />
      )}
    </div>
  );
}

function DefModal({ data, onClose, onSave }) {
  const edit = !!data.codigo;
  const [f, setF] = useState({
    codigo: data.codigo || '',
    nombre: data.nombre || '',
    descripcion: data.descripcion || '',
    activo: data.activo !== false,
    orden: data.orden || 0
  });
  return (
    <Modal title={edit ? `Editar proceso ${data.codigo}` : 'Nuevo proceso'} onClose={onClose}>
      <div className="space-y-3">
        <label className="block">
          <span className={lbl}>Código</span>
          <input
            disabled={edit}
            value={f.codigo}
            onChange={(e) =>
              setF({ ...f, codigo: e.target.value.toUpperCase().replace(/\s/g, '_') })
            }
            placeholder="DEVOLUCION"
            className={`${inp} mt-1 ${edit ? 'bg-slate-50 text-slate-400' : ''}`}
          />
        </label>
        <label className="block">
          <span className={lbl}>Nombre</span>
          <input
            value={f.nombre}
            onChange={(e) => setF({ ...f, nombre: e.target.value })}
            placeholder="Devoluciones"
            className={`${inp} mt-1`}
          />
        </label>
        <label className="block">
          <span className={lbl}>Descripción</span>
          <input
            value={f.descripcion}
            onChange={(e) => setF({ ...f, descripcion: e.target.value })}
            className={`${inp} mt-1`}
          />
        </label>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-[13px] text-slate-600">
            <input
              type="checkbox"
              checked={f.activo}
              onChange={(e) => setF({ ...f, activo: e.target.checked })}
            />{' '}
            Activo
          </label>
          <label className="flex items-center gap-2 text-[13px] text-slate-600 ml-auto">
            Orden{' '}
            <input
              type="number"
              value={f.orden}
              onChange={(e) => setF({ ...f, orden: e.target.value })}
              className="w-20 border border-slate-200 rounded-lg px-2 py-1 text-sm"
            />
          </label>
        </div>
        <button
          onClick={() =>
            f.codigo && f.nombre ? onSave(f) : toast.error('Código y nombre son obligatorios')
          }
          className="w-full py-2.5 rounded-xl bg-orange-500 text-white text-sm font-bold hover:bg-orange-600"
        >
          Guardar
        </button>
      </div>
    </Modal>
  );
}

function EstadoModal({ data, onClose, onSave }) {
  const edit = !!data.codigo;
  const [f, setF] = useState({
    codigo: data.codigo || '',
    etiqueta: data.etiqueta || '',
    es_inicial: !!data.es_inicial,
    es_final: !!data.es_final,
    orden: data.orden || 0,
    color: data.color || '#64748b'
  });
  return (
    <Modal title={edit ? `Editar estado ${data.codigo}` : 'Nuevo estado'} onClose={onClose}>
      <div className="space-y-3">
        <label className="block">
          <span className={lbl}>Código</span>
          <input
            disabled={edit}
            value={f.codigo}
            onChange={(e) => setF({ ...f, codigo: e.target.value })}
            placeholder="en_revision"
            className={`${inp} mt-1 ${edit ? 'bg-slate-50 text-slate-400' : ''}`}
          />
        </label>
        <label className="block">
          <span className={lbl}>Etiqueta</span>
          <input
            value={f.etiqueta}
            onChange={(e) => setF({ ...f, etiqueta: e.target.value })}
            placeholder="En Revisión"
            className={`${inp} mt-1`}
          />
        </label>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-[13px] text-slate-600">
            <input
              type="checkbox"
              checked={f.es_inicial}
              onChange={(e) => setF({ ...f, es_inicial: e.target.checked })}
            />{' '}
            Inicial
          </label>
          <label className="flex items-center gap-2 text-[13px] text-slate-600">
            <input
              type="checkbox"
              checked={f.es_final}
              onChange={(e) => setF({ ...f, es_final: e.target.checked })}
            />{' '}
            Final
          </label>
          <label className="flex items-center gap-2 text-[13px] text-slate-600 ml-auto">
            <span className={lbl}>Color</span>
            <input
              type="color"
              value={f.color}
              onChange={(e) => setF({ ...f, color: e.target.value })}
              className="w-9 h-9 rounded border border-slate-200 p-0.5"
            />
          </label>
        </div>
        <label className="flex items-center gap-2 text-[13px] text-slate-600">
          Orden{' '}
          <input
            type="number"
            value={f.orden}
            onChange={(e) => setF({ ...f, orden: e.target.value })}
            className="w-20 border border-slate-200 rounded-lg px-2 py-1 text-sm"
          />
        </label>
        <button
          onClick={() =>
            f.codigo && f.etiqueta ? onSave(f) : toast.error('Código y etiqueta son obligatorios')
          }
          className="w-full py-2.5 rounded-xl bg-orange-500 text-white text-sm font-bold hover:bg-orange-600"
        >
          Guardar
        </button>
      </div>
    </Modal>
  );
}

function TransModal({ data, estados, permisos, onClose, onSave }) {
  const edit = !!data.id;
  const [f, setF] = useState({
    id: data.id || '',
    desde: data.desde || '',
    hasta: data.hasta || '',
    accion: data.accion || '',
    permiso_id: data.permiso_id || '',
    orden: data.orden || 0
  });
  return (
    <Modal title={edit ? 'Editar transición' : 'Nueva transición'} onClose={onClose}>
      <div className="space-y-3">
        <label className="block">
          <span className={lbl}>Desde (vacío = creación)</span>
          <select
            value={f.desde}
            onChange={(e) => setF({ ...f, desde: e.target.value })}
            className={`${inp} mt-1`}
          >
            <option value="">● inicio (creación)</option>
            {estados.map((e) => (
              <option key={e.codigo} value={e.codigo}>
                {e.etiqueta}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className={lbl}>Hasta</span>
          <select
            value={f.hasta}
            onChange={(e) => setF({ ...f, hasta: e.target.value })}
            className={`${inp} mt-1`}
          >
            <option value="">—</option>
            {estados.map((e) => (
              <option key={e.codigo} value={e.codigo}>
                {e.etiqueta}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className={lbl}>Acción</span>
          <input
            value={f.accion}
            onChange={(e) => setF({ ...f, accion: e.target.value.trim() })}
            placeholder="avanzar / asignar / cancelar"
            className={`${inp} mt-1`}
          />
        </label>
        <label className="block">
          <span className={lbl}>Permiso requerido (opcional)</span>
          <select
            value={f.permiso_id}
            onChange={(e) => setF({ ...f, permiso_id: e.target.value })}
            className={`${inp} mt-1`}
          >
            <option value="">— sin permiso específico —</option>
            {permisos.map((p) => (
              <option key={p.id} value={p.id}>
                {p.id} · {p.nombre}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2 text-[13px] text-slate-600">
          Orden{' '}
          <input
            type="number"
            value={f.orden}
            onChange={(e) => setF({ ...f, orden: e.target.value })}
            className="w-20 border border-slate-200 rounded-lg px-2 py-1 text-sm"
          />
        </label>
        <button
          onClick={() =>
            f.hasta && f.accion ? onSave(f) : toast.error('Hasta y acción son obligatorios')
          }
          className="w-full py-2.5 rounded-xl bg-orange-500 text-white text-sm font-bold hover:bg-orange-600"
        >
          Guardar
        </button>
      </div>
    </Modal>
  );
}
