import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import { ResponsiveContainer, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, Tooltip } from 'recharts';
import { Plus, Trash2, Settings2, Save, X, Blocks, Calculator, LayoutGrid } from 'lucide-react';
import PanelModal from '../PanelModal';
import { MOCK_WEEKLY, MOCK_LEADTIME, MOCK_ESTADO_TABLE, MOCK_RANK_TRANSP, ESTADO_COLOR, MOCK_NVS } from '../mock';
import { evaluateFormula, validarFormula, extractFields, FUNCIONES_DISPONIBLES } from '../formulaEngine';

// Fila de ejemplo (una N.V.) + métricas agregadas, sobre la que se evalúan los
// campos calculados en vivo. Al conectar datos reales, se evalúa sobre cada fila.
const SAMPLE_ROW = { ...MOCK_NVS[0], total: 1284, entregadas: 942, evaluables: 214, despachadas: 187 };
const fmtVal = (v) => (v == null ? '—' : v instanceof Date ? v.toISOString().slice(0, 10) : typeof v === 'number' ? (Math.round(v * 100) / 100).toLocaleString('es-CL') : String(v));

// Builder (port de /builder): constructor de widgets. Catálogo (tipo → fuente),
// lienzo con los widgets renderizados de verdad, panel de configuración por
// widget y campos calculados. Layout persistido en localStorage. Datos de ejemplo.
const LS_KEY = 'panel_builder_layout';
const WIDGET_TYPES = [
  { type: 'kpi', label: 'KPI', icon: '▣', description: 'Un número destacado' },
  { type: 'bar-chart', label: 'Barras', icon: '▮', description: 'Comparar categorías' },
  { type: 'line-chart', label: 'Línea', icon: '╱', description: 'Tendencia en el tiempo' },
  { type: 'donut-chart', label: 'Dona', icon: '◕', description: 'Proporción por estado' },
  { type: 'table', label: 'Tabla', icon: '▤', description: 'Filas y columnas' },
  { type: 'stat-list', label: 'Lista / Ranking', icon: '≣', description: 'Top por valor' },
  { type: 'gauge', label: 'Medidor', icon: '◔', description: 'Nivel vs meta' },
  { type: 'text', label: 'Texto', icon: 'T', description: 'Nota o título' },
  { type: 'divider', label: 'Separador', icon: '—', description: 'Divide secciones' },
];
const DATA_SOURCES = [
  { key: 'nv', label: 'Notas de Venta', type: 'list' },
  { key: 'estados', label: 'Estados', type: 'list' },
  { key: 'transportistas', label: 'Transportistas', type: 'list' },
  { key: 'kpis', label: 'KPIs operacionales', type: 'single' },
];
const uid = () => 'w' + Math.random().toString(36).slice(2, 8);
const DEFAULT = [
  { id: 'w1', type: 'kpi', title: 'NV Activas', source: 'kpis', color: '#f97316', span: 1, valor: '342', sub: '+6% vs mes anterior' },
  { id: 'w2', type: 'bar-chart', title: 'Creadas vs entregadas', source: 'nv', color: '#f97316', span: 2 },
  { id: 'w3', type: 'gauge', title: 'OTIF', source: 'kpis', color: '#10b981', span: 1, pct: 88 },
  { id: 'w4', type: 'stat-list', title: 'Top transportistas', source: 'transportistas', color: '#2563eb', span: 2 },
  { id: 'w5', type: 'donut-chart', title: 'Distribución estados', source: 'estados', color: '#f97316', span: 2 },
];

function WidgetPreview({ w }) {
  switch (w.type) {
    case 'kpi':
      return (
        <div className="flex flex-col justify-center h-full">
          <p className="text-3xl font-black" style={{ color: w.color }}>{w.valor || '1.284'}</p>
          <p className="text-[11px] text-slate-400 mt-1">{w.sub || 'Subtítulo'}</p>
        </div>
      );
    case 'bar-chart':
      return (
        <ResponsiveContainer width="100%" height={140}>
          <BarChart data={MOCK_WEEKLY}><XAxis dataKey="semana" tick={{ fontSize: 10 }} /><YAxis hide /><Tooltip />
            <Bar dataKey="creadas" fill={w.color} radius={[3, 3, 0, 0]} /><Bar dataKey="entregadas" fill="#10b981" radius={[3, 3, 0, 0]} /></BarChart>
        </ResponsiveContainer>
      );
    case 'line-chart':
      return (
        <ResponsiveContainer width="100%" height={140}>
          <LineChart data={MOCK_LEADTIME}><XAxis dataKey="semana" tick={{ fontSize: 10 }} /><YAxis hide /><Tooltip />
            <Line type="monotone" dataKey="dias" stroke={w.color} strokeWidth={2} /></LineChart>
        </ResponsiveContainer>
      );
    case 'donut-chart':
      return (
        <ResponsiveContainer width="100%" height={150}>
          <PieChart>
            <Pie data={MOCK_ESTADO_TABLE.slice(0, 5)} dataKey="count" nameKey="estado" innerRadius={35} outerRadius={60} paddingAngle={2}>
              {MOCK_ESTADO_TABLE.slice(0, 5).map((e, i) => <Cell key={i} fill={Object.values(ESTADO_COLOR)[i] || '#f97316'} />)}
            </Pie><Tooltip />
          </PieChart>
        </ResponsiveContainer>
      );
    case 'table':
      return (
        <table className="w-full text-xs"><tbody>
          {MOCK_ESTADO_TABLE.slice(0, 5).map((r) => (
            <tr key={r.estado} className="border-b border-slate-100"><td className="py-1.5">{r.estado}</td><td className="text-right font-bold">{r.count}</td></tr>
          ))}
        </tbody></table>
      );
    case 'stat-list':
      return (
        <ul className="space-y-1.5">
          {MOCK_RANK_TRANSP.map((t, i) => (
            <li key={t.nombre} className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5"><b className="text-slate-300">{i + 1}</b>{t.nombre}</span>
              <b style={{ color: w.color }}>{t.entregas}</b>
            </li>
          ))}
        </ul>
      );
    case 'gauge': {
      const pct = w.pct ?? 75;
      return (
        <div className="flex flex-col items-center justify-center h-full">
          <div className="relative w-24 h-24">
            <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
              <circle cx="18" cy="18" r="15.5" fill="none" stroke="#e2e8f0" strokeWidth="4" />
              <circle cx="18" cy="18" r="15.5" fill="none" stroke={w.color} strokeWidth="4" strokeLinecap="round"
                strokeDasharray={`${pct} ${100 - pct}`} pathLength="100" />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-lg font-black" style={{ color: w.color }}>{pct}%</span>
          </div>
        </div>
      );
    }
    case 'text':
      return <p className="text-sm text-slate-600 leading-snug">{w.content || 'Escribe una nota o título aquí…'}</p>;
    case 'divider':
      return <div className="border-t-2 border-dashed border-slate-200 my-2" />;
    default:
      return <div className="text-xs text-slate-400 italic">Vista previa de {w.type}</div>;
  }
}

// Catálogo (2 pasos: tipo → fuente).
function Catalogo({ onAdd, onClose }) {
  const [step, setStep] = useState('type');
  const [type, setType] = useState(null);
  return (
    <PanelModal titulo={step === 'type' ? 'Elegir tipo de widget' : 'Elegir fuente de datos'} onClose={onClose} maxWidth="max-w-lg">
      {step === 'type' ? (
        <div className="p-4 grid grid-cols-2 gap-3">
          {WIDGET_TYPES.map((wt) => (
            <button key={wt.type} onClick={() => { setType(wt.type); setStep('source'); }}
              className="text-left p-4 rounded-xl border border-slate-200 hover:border-orange-400 hover:bg-orange-50/50 transition-all">
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-600 mb-2">{wt.icon}</div>
              <div className="text-sm font-black text-slate-800">{wt.label}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">{wt.description}</div>
            </button>
          ))}
        </div>
      ) : (
        <div className="p-4 space-y-2">
          <button onClick={() => setStep('type')} className="text-xs text-orange-600 hover:text-orange-800 mb-1">← Volver a tipos</button>
          {DATA_SOURCES.map((ds) => (
            <button key={ds.key} onClick={() => { onAdd(type, ds.key); onClose(); }}
              className="w-full text-left p-3 rounded-xl border border-slate-200 hover:border-orange-400 hover:bg-orange-50/50 transition-all">
              <div className="text-sm font-black text-slate-800">{ds.label}</div>
              <div className="text-[10px] text-slate-400">{ds.type === 'single' ? 'Valor único' : 'Lista'}</div>
            </button>
          ))}
        </div>
      )}
    </PanelModal>
  );
}

export default function PanelBuilder() {
  const [widgets, setWidgets] = useState(DEFAULT);
  const [selId, setSelId] = useState(null);
  const [catalogo, setCatalogo] = useState(false);
  const [tab, setTab] = useState('diseno');
  const [calculados, setCalculados] = useState([{ nombre: 'Tasa entrega', formula: 'entregadas / total * 100' }]);
  const [nuevoCampo, setNuevoCampo] = useState({ nombre: '', formula: '' });

  useEffect(() => { try { const s = JSON.parse(localStorage.getItem(LS_KEY)); if (s?.widgets) { setWidgets(s.widgets); setCalculados(s.calculados || []); } } catch { /* ignore */ } }, []);

  const sel = widgets.find((w) => w.id === selId);
  const patch = (id, p) => setWidgets((ws) => ws.map((w) => (w.id === id ? { ...w, ...p } : w)));
  const addWidget = (type, source) => {
    const wt = WIDGET_TYPES.find((t) => t.type === type);
    const id = uid();
    setWidgets((ws) => [...ws, { id, type, title: wt?.label || 'Widget', source, color: '#f97316', span: type === 'kpi' || type === 'gauge' ? 1 : 2 }]);
    setSelId(id);
  };
  const removeWidget = (id) => { setWidgets((ws) => ws.filter((w) => w.id !== id)); if (selId === id) setSelId(null); };
  const guardar = () => { try { localStorage.setItem(LS_KEY, JSON.stringify({ widgets, calculados })); } catch { /* ignore */ } toast.success('Layout guardado (ejemplo)'); };
  // Vista previa en vivo de la fórmula que se escribe (motor real).
  const prev = useMemo(() => (nuevoCampo.formula.trim() ? evaluateFormula(nuevoCampo.formula, SAMPLE_ROW) : { ok: false }), [nuevoCampo.formula]);
  const refs = useMemo(() => (nuevoCampo.formula.trim() ? extractFields(nuevoCampo.formula) : []), [nuevoCampo.formula]);
  const addCampo = () => {
    if (!nuevoCampo.nombre.trim()) return;
    const v = validarFormula(nuevoCampo.formula);
    if (!v.ok) return toast.error(`Fórmula inválida: ${v.error}`);
    setCalculados((c) => [...c, nuevoCampo]);
    setNuevoCampo({ nombre: '', formula: '' });
  };

  return (
    <div className="anim-fade-up">
      {/* Barra de herramientas */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1">
          <button onClick={() => setTab('diseno')} className={`px-3 py-1.5 rounded-lg text-xs font-black inline-flex items-center gap-1.5 ${tab === 'diseno' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-500'}`}><LayoutGrid size={13} /> Diseño</button>
          <button onClick={() => setTab('calculados')} className={`px-3 py-1.5 rounded-lg text-xs font-black inline-flex items-center gap-1.5 ${tab === 'calculados' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-500'}`}><Calculator size={13} /> Campos calculados</button>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setCatalogo(true)} className="px-3 py-2 rounded-xl border border-orange-300 text-orange-700 text-xs font-black hover:bg-orange-50 inline-flex items-center gap-1.5"><Plus size={14} /> Agregar widget</button>
          <button onClick={guardar} className="px-4 py-2 rounded-xl bg-orange-500 text-white text-xs font-black hover:bg-orange-600 inline-flex items-center gap-1.5"><Save size={14} /> Guardar</button>
        </div>
      </div>

      {tab === 'diseno' ? (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4">
          {/* Lienzo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 auto-rows-min">
            {widgets.length === 0 && (
              <div className="col-span-full text-center py-16 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400">
                <Blocks size={30} className="mx-auto mb-2 text-slate-300" />
                Agrega tu primer widget con “Agregar widget”.
              </div>
            )}
            {widgets.map((w) => (
              <div key={w.id} onClick={() => setSelId(w.id)}
                className={`bg-white rounded-2xl border shadow-sm p-4 cursor-pointer transition-all ${selId === w.id ? 'border-orange-400 ring-2 ring-orange-100' : 'border-slate-200 hover:border-slate-300'} ${w.span === 3 ? 'lg:col-span-3 sm:col-span-2' : w.span === 2 ? 'lg:col-span-2 sm:col-span-2' : ''}`}>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-black text-slate-600 truncate">{w.title}</h4>
                  <div className="flex items-center gap-1">
                    <button onClick={(e) => { e.stopPropagation(); setSelId(w.id); }} className="p-1 rounded text-slate-400 hover:text-orange-600 hover:bg-orange-50"><Settings2 size={13} /></button>
                    <button onClick={(e) => { e.stopPropagation(); removeWidget(w.id); }} className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50"><Trash2 size={13} /></button>
                  </div>
                </div>
                <div className="min-h-[80px]"><WidgetPreview w={w} /></div>
              </div>
            ))}
          </div>

          {/* Panel de configuración */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 h-fit lg:sticky lg:top-4">
            <h3 className="text-sm font-black text-slate-700 mb-3 flex items-center gap-1.5"><Settings2 size={15} className="text-orange-500" /> Configuración</h3>
            {!sel ? (
              <p className="text-xs text-slate-400">Selecciona un widget del lienzo para configurarlo.</p>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="field-label">Título</label>
                  <input className="field-input" value={sel.title} onChange={(e) => patch(sel.id, { title: e.target.value })} />
                </div>
                <div>
                  <label className="field-label">Tipo</label>
                  <select className="field-input" value={sel.type} onChange={(e) => patch(sel.id, { type: e.target.value })}>
                    {WIDGET_TYPES.map((t) => <option key={t.type} value={t.type}>{t.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="field-label">Fuente de datos</label>
                  <select className="field-input" value={sel.source} onChange={(e) => patch(sel.id, { source: e.target.value })}>
                    {DATA_SOURCES.map((d) => <option key={d.key} value={d.key}>{d.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="field-label">Ancho</label>
                  <div className="flex gap-1">
                    {[{ v: 1, l: '1/3' }, { v: 2, l: '2/3' }, { v: 3, l: 'Completo' }].map((o) => (
                      <button key={o.v} onClick={() => patch(sel.id, { span: o.v })}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-black border ${sel.span === o.v ? 'bg-orange-500 text-white border-orange-500' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}>{o.l}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="field-label">Color</label>
                  <div className="flex gap-1.5">
                    {['#f97316', '#10b981', '#2563eb', '#7c3aed', '#e11d48', '#0891b2'].map((c) => (
                      <button key={c} onClick={() => patch(sel.id, { color: c })}
                        className={`w-7 h-7 rounded-lg border-2 ${sel.color === c ? 'border-slate-900' : 'border-transparent'}`} style={{ background: c }} />
                    ))}
                  </div>
                </div>
                {sel.type === 'text' && (
                  <div><label className="field-label">Contenido</label><textarea className="field-input min-h-[70px]" value={sel.content || ''} onChange={(e) => patch(sel.id, { content: e.target.value })} /></div>
                )}
                {(sel.type === 'kpi' || sel.type === 'gauge') && (
                  <div><label className="field-label">{sel.type === 'gauge' ? 'Porcentaje' : 'Valor'}</label>
                    <input className="field-input" value={sel.type === 'gauge' ? (sel.pct ?? '') : (sel.valor ?? '')}
                      onChange={(e) => patch(sel.id, sel.type === 'gauge' ? { pct: Number(e.target.value) || 0 } : { valor: e.target.value })} /></div>
                )}
                <button onClick={() => removeWidget(sel.id)} className="w-full py-2 rounded-xl border border-red-200 text-red-600 text-xs font-black hover:bg-red-50 inline-flex items-center justify-center gap-1.5"><Trash2 size={13} /> Eliminar widget</button>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Campos calculados — MOTOR REAL de fórmulas (formulaEngine) */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 max-w-3xl">
          <h3 className="text-sm font-black text-slate-700 mb-1 flex items-center gap-1.5"><Calculator size={15} className="text-orange-500" /> Campos calculados</h3>
          <p className="text-xs text-slate-400 mb-1">Métricas derivadas con fórmulas tipo Excel — se evalúan de verdad contra una N.V. de ejemplo (<b className="text-slate-500">{SAMPLE_ROW.nv}</b>).</p>
          <p className="text-[11px] text-slate-400 mb-4">Campos: <code className="bg-slate-100 px-1 rounded">total, entregadas, evaluables, despachadas, estado, fecha_compromiso, fecha_entregado…</code></p>

          <div className="space-y-2 mb-4">
            {calculados.map((c, i) => {
              const res = evaluateFormula(c.formula, SAMPLE_ROW);
              return (
                <div key={i} className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-black text-slate-700">{c.nombre}</div>
                    <code className="text-[11px] text-slate-500 break-all">{c.formula}</code>
                  </div>
                  <span className={`shrink-0 text-xs font-black px-2.5 py-1 rounded-lg ${res.ok ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
                    {res.ok ? `= ${fmtVal(res.value)}` : '⚠ error'}
                  </span>
                  <button onClick={() => setCalculados((cs) => cs.filter((_, j) => j !== i))} className="p-1.5 rounded-lg text-red-400 hover:bg-red-50"><Trash2 size={14} /></button>
                </div>
              );
            })}
            {calculados.length === 0 && <p className="text-xs text-slate-400">Aún no hay campos calculados.</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-[1fr_1.5fr_auto] gap-2 items-end">
            <div><label className="field-label">Nombre</label><input className="field-input" value={nuevoCampo.nombre} onChange={(e) => setNuevoCampo((n) => ({ ...n, nombre: e.target.value }))} placeholder="Ej: Fill rate" /></div>
            <div><label className="field-label">Fórmula</label><input className="field-input" value={nuevoCampo.formula} onChange={(e) => setNuevoCampo((n) => ({ ...n, formula: e.target.value }))} placeholder="ej: ROUND(despachadas / evaluables * 100, 1)" /></div>
            <button onClick={addCampo} disabled={!prev.ok || !nuevoCampo.nombre.trim()} className="px-4 py-2.5 rounded-xl bg-orange-500 text-white text-xs font-black hover:bg-orange-600 disabled:opacity-40 inline-flex items-center gap-1.5"><Plus size={14} /> Añadir</button>
          </div>
          {/* Vista previa en vivo de la fórmula que se está escribiendo */}
          {nuevoCampo.formula.trim() && (
            <div className={`mt-2 text-xs rounded-lg px-3 py-2 ${prev.ok ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
              {prev.ok
                ? <>Resultado con {SAMPLE_ROW.nv}: <b>{fmtVal(prev.value)}</b>{refs.length > 0 && <span className="text-emerald-600/70"> · usa: {refs.join(', ')}</span>}</>
                : <>⚠ {prev.error}</>}
            </div>
          )}

          {/* Funciones disponibles */}
          <div className="mt-4 pt-3 border-t border-slate-100">
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-wider mb-2">Funciones disponibles</p>
            <div className="flex flex-wrap gap-1.5">
              {FUNCIONES_DISPONIBLES.map((fn) => (
                <button key={fn} type="button" onClick={() => setNuevoCampo((n) => ({ ...n, formula: (n.formula || '') + fn + '(' }))}
                  className="text-[10px] font-mono font-bold px-2 py-1 rounded-md bg-slate-100 text-slate-600 hover:bg-orange-100 hover:text-orange-700">{fn}</button>
              ))}
            </div>
          </div>
        </div>
      )}

      {catalogo && <Catalogo onAdd={addWidget} onClose={() => setCatalogo(false)} />}
    </div>
  );
}
