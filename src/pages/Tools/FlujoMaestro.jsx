import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Workflow as WorkflowIcon, ZoomIn, ZoomOut, Maximize2, Search, X, Save, Pencil, Trash2, Link2, Square, Diamond, Circle, CircleDot, ExternalLink, RotateCcw, Download, Upload, SlidersHorizontal } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import seedMaestro from '../../data/flujoMaestro.json';
import d1 from '../../data/diagramas/1-master-data.json';
import d2 from '../../data/diagramas/2-warehouse-wms.json';
import d3 from '../../data/diagramas/3-operaciones.json';
import d4 from '../../data/diagramas/4-tms.json';
import d5 from '../../data/diagramas/5-postventa.json';
import { obtenerFlujo, guardarFlujo } from '../../services/flujoService';

const TYPE = {
  inicio:   { fill: '#ecfdf5', border: '#10b981', text: '#047857', pill: true,  dim: [128, 46] },
  fin:      { fill: '#fff7ed', border: '#f97316', text: '#c2410c', pill: true,  dim: [128, 46] },
  tarea:    { fill: '#ffffff', border: '#2f6f9f', text: '#1e3a4f', pill: false, dim: [152, 54] },
  decision: { fill: '#fffbeb', border: '#d97706', text: '#92400e', pill: false, diamond: true, dim: [164, 58] },
};
const DIAGRAMS = [
  { codigo: 'maestro',       titulo: 'Flujo Maestro',    seed: seedMaestro },
  { codigo: 'master-data',   titulo: 'Master Data',      seed: d1 },
  { codigo: 'warehouse-wms', titulo: 'Warehouse (WMS)',  seed: d2 },
  { codigo: 'operaciones',   titulo: 'Operaciones',      seed: d3 },
  { codigo: 'tms',           titulo: 'TMS',              seed: d4 },
  { codigo: 'postventa',     titulo: 'Postventa',        seed: d5 },
];
const LINKS = [
  [/registro n\.?v|ingresar/i, '/panel/ingresar'], [/consulta n\.?v/i, '/panel/info'],
  [/panel ptm|dashboard/i, '/panel'], [/modo tv|^tv$/i, '/panel/tv'],
  [/tms|transporte|orden transporte|pod|ruta|chofer|veh[ií]culo/i, '/tms/control'],
  [/post ?venta|servicio tecnico|ticket/i, '/postventa/tickets'], [/conteo/i, '/inventory/conteo'],
  [/analisis codigos/i, '/inventory/analisis'], [/carteles/i, '/inventory/carteles'],
  [/traspaso|ajustes/i, '/inventory/traspasos'], [/carga masiva|subida n\.?v/i, '/inbound/data-import'],
  [/recepci[oó]n/i, '/inbound/reception'], [/cubicaje/i, '/inbound/cubing'],
  [/ubicaciones|layaout|mapa calor/i, '/queries/heatmap'], [/calidad|dictamen|monitoreo/i, '/quality/monitoreo'],
];
const linkFor = (label) => (LINKS.find(([re]) => re.test(label || '')) || [])[1] || null;

export default function FlujoMaestro() {
  const nav = useNavigate();
  const { hasPermission, user } = useAuth();
  const puedeEditar = hasPermission('manage_workflows') || user?.rol === 'ADMIN' || user?.es_admin_delegado;

  const [codigo, setCodigo] = useState('maestro');
  const [model, setModel] = useState({ nodes: [], edges: [] });
  const [titulo, setTitulo] = useState('Flujo Maestro CCO');
  const [dirty, setDirty] = useState(false);
  const [edit, setEdit] = useState(false);
  const [q, setQ] = useState('');
  const [sel, setSel] = useState(null);
  const [connectFrom, setConnectFrom] = useState(null);
  const [info, setInfo] = useState(null);

  const wrapRef = useRef(null);
  const fileRef = useRef(null);
  const [view, setView] = useState({ s: 0.55, x: 0, y: 0 });
  const seqRef = useRef(1);
  const drag = useRef(null);
  const pan = useRef(null);

  const setNodes = (fn) => setModel((m) => ({ ...m, nodes: fn(m.nodes) }));
  const mark = () => setDirty(true);
  const seedSeq = (mdl) => { let mx = 0; [...(mdl.nodes || []), ...(mdl.edges || [])].forEach((o) => { const k = parseInt(String(o.id).replace(/\D/g, ''), 10) || 0; if (k > mx) mx = k; }); seqRef.current = mx + 1; };
  const uid = (p) => p + (seqRef.current++);
  const byId = useMemo(() => Object.fromEntries(model.nodes.map((n) => [n.id, n])), [model.nodes]);

  const fitNodes = useCallback((nodes) => {
    const el = wrapRef.current; if (!el || !nodes.length) return;
    const minX = Math.min(...nodes.map((n) => n.x)), minY = Math.min(...nodes.map((n) => n.y));
    const maxX = Math.max(...nodes.map((n) => n.x + n.w)), maxY = Math.max(...nodes.map((n) => n.y + n.h));
    const W = maxX - minX, H = maxY - minY, cw = el.clientWidth, ch = el.clientHeight;
    const s = Math.min(cw / W, ch / H) * 0.9;
    setView({ s, x: -minX * s + (cw - W * s) / 2, y: -minY * s + (ch - H * s) / 2 });
  }, []);
  const fit = () => fitNodes(model.nodes);

  const cargar = useCallback(async (cod) => {
    const d = DIAGRAMS.find((x) => x.codigo === cod);
    let mdl = null, tit = null;
    try { const row = await obtenerFlujo(cod); if (row?.modelo?.nodes) { mdl = row.modelo; tit = row.titulo; } } catch { /* seed */ }
    if (!mdl) { mdl = { nodes: d.seed.nodes, edges: d.seed.edges }; tit = d.seed._meta?.titulo || d.titulo; }
    setModel({ nodes: mdl.nodes.map((n) => ({ ...n })), edges: mdl.edges.map((e) => ({ ...e })) });
    setTitulo(tit || d.titulo); seedSeq(mdl); setDirty(false); setSel(null); setInfo(null); setConnectFrom(null);
    requestAnimationFrame(() => fitNodes(mdl.nodes));
  }, [fitNodes]);
  useEffect(() => { cargar('maestro'); }, [cargar]);

  const cambiarDiagrama = (cod) => {
    if (cod === codigo) return;
    if (dirty && !window.confirm('Tienes cambios sin guardar. ¿Cambiar de diagrama y descartarlos?')) return;
    setCodigo(cod); cargar(cod);
  };

  const onWheel = (e) => {
    e.preventDefault(); const r = wrapRef.current.getBoundingClientRect(); const mx = e.clientX - r.left, my = e.clientY - r.top;
    setView((v) => { const ns = Math.min(2.5, Math.max(0.1, v.s * (e.deltaY < 0 ? 1.12 : 0.89))); const k = ns / v.s; return { s: ns, x: mx - (mx - v.x) * k, y: my - (my - v.y) * k }; });
  };
  const onBgDown = (e) => { if (e.target.closest('[data-node]') || e.target.closest('[data-elabel]')) return; setSel(null); setInfo(null); pan.current = { x: e.clientX, y: e.clientY }; };
  const onMove = (e) => {
    if (drag.current) { const dx = (e.clientX - drag.current.px) / view.s, dy = (e.clientY - drag.current.py) / view.s; drag.current.px = e.clientX; drag.current.py = e.clientY; drag.current.moved = true; setNodes((ns) => ns.map((n) => n.id === drag.current.id ? { ...n, x: n.x + dx, y: n.y + dy } : n)); return; }
    if (pan.current) { const dx = e.clientX - pan.current.x, dy = e.clientY - pan.current.y; pan.current = { x: e.clientX, y: e.clientY }; setView((v) => ({ ...v, x: v.x + dx, y: v.y + dy })); }
  };
  const onUp = () => { if (drag.current?.moved) mark(); drag.current = null; pan.current = null; };

  const onNodeDown = (e, n) => { e.stopPropagation(); if (connectFrom !== null) return; setSel({ kind: 'node', id: n.id }); if (edit) drag.current = { id: n.id, px: e.clientX, py: e.clientY, moved: false }; };
  const onNodeClick = (e, n) => {
    e.stopPropagation();
    if (connectFrom !== null) {
      if (connectFrom === '') { setConnectFrom(n.id); return; }
      if (connectFrom !== n.id) { setModel((m) => ({ ...m, edges: [...m.edges, { id: uid('e'), from: connectFrom, to: n.id, label: '' }] })); mark(); }
      setConnectFrom(''); return;
    }
    if (!edit) setInfo(n);
  };
  const onNodeDouble = (e, n) => { e.stopPropagation(); if (!edit) return; const t = window.prompt('Etiqueta del nodo:', n.label); if (t == null) return; patchNode(n.id, { label: t }); };

  const patchNode = (id, patch) => { setNodes((ns) => ns.map((x) => x.id === id ? { ...x, ...patch } : x)); mark(); };
  const patchEdge = (id, patch) => { setModel((m) => ({ ...m, edges: m.edges.map((e) => e.id === id ? { ...e, ...patch } : e) })); mark(); };
  const addNode = (type) => {
    const el = wrapRef.current; const cx = (el.clientWidth / 2 - view.x) / view.s, cy = (el.clientHeight / 2 - view.y) / view.s; const d = TYPE[type].dim;
    const n = { id: uid('n'), type, label: type === 'decision' ? '¿Decisión?' : 'Nuevo', x: Math.round(cx - d[0] / 2), y: Math.round(cy - d[1] / 2), w: d[0], h: d[1] };
    setModel((m) => ({ ...m, nodes: [...m.nodes, n] })); setSel({ kind: 'node', id: n.id }); mark();
  };
  const delSel = useCallback(() => {
    if (!sel) return;
    if (sel.kind === 'node') setModel((m) => ({ nodes: m.nodes.filter((n) => n.id !== sel.id), edges: m.edges.filter((e) => e.from !== sel.id && e.to !== sel.id) }));
    else setModel((m) => ({ ...m, edges: m.edges.filter((e) => e.id !== sel.id) }));
    setSel(null); mark();
  }, [sel]);
  useEffect(() => { const h = (e) => { if (!edit) return; if ((e.key === 'Delete' || e.key === 'Backspace') && sel && !/input|textarea|select/i.test(e.target.tagName)) { e.preventDefault(); delSel(); } }; window.addEventListener('keydown', h); return () => window.removeEventListener('keydown', h); }, [edit, sel, delSel]);

  const guardar = async () => { const r = await guardarFlujo(codigo, titulo, model); if (r?.ok) { toast.success('Diagrama guardado'); setDirty(false); } else toast.error(r?.error || 'No se pudo guardar'); };
  const exportar = () => {
    const blob = new Blob([JSON.stringify({ _meta: { titulo, codigo }, nodes: model.nodes, edges: model.edges }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `flujo-${codigo}.json`; a.click(); URL.revokeObjectURL(url);
  };
  const importar = (e) => {
    const f = e.target.files?.[0]; if (!f) return; const rd = new FileReader();
    rd.onload = () => { try { const j = JSON.parse(rd.result); if (!Array.isArray(j.nodes) || !Array.isArray(j.edges)) throw 0; setModel({ nodes: j.nodes.map((n) => ({ ...n })), edges: j.edges.map((x) => ({ ...x })) }); seedSeq(j); mark(); requestAnimationFrame(() => fitNodes(j.nodes)); toast.success('Importado — recuerda Guardar'); } catch { toast.error('JSON inválido (se espera {nodes, edges})'); } };
    rd.readAsText(f); e.target.value = '';
  };

  const border = (n, tx, ty) => { const cx = n.x + n.w / 2, cy = n.y + n.h / 2, dx = tx - cx, dy = ty - cy; if (!dx && !dy) return { x: cx, y: cy }; const hw = n.w / 2, hh = n.h / 2; const t = Math.min(dx ? hw / Math.abs(dx) : Infinity, dy ? hh / Math.abs(dy) : Infinity); return { x: cx + dx * t, y: cy + dy * t }; };
  const term = q.trim().toLowerCase();
  const jump = info && linkFor(info.label);
  const selNode = sel?.kind === 'node' ? byId[sel.id] : null;
  const selEdge = sel?.kind === 'edge' ? model.edges.find((e) => e.id === sel.id) : null;
  const TB = [['tarea', Square], ['decision', Diamond], ['inicio', Circle], ['fin', CircleDot]];

  return (
    <div className="anim-fade-up max-w-[1400px] mx-auto pb-6">
      <div className="flex items-start justify-between gap-3 flex-wrap mb-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 text-white grid place-items-center shadow-lg shadow-orange-500/20"><WorkflowIcon size={22} /></div>
          <div>
            <h1 className="text-xl font-black text-slate-800 leading-tight">Mapa de Procesos {dirty && <span className="text-orange-500 text-sm align-middle">• sin guardar</span>}</h1>
            <p className="text-[13px] text-slate-500">{model.nodes.length} nodos · {model.edges.length} conexiones · {edit ? 'edición' : 'vista'}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <select value={codigo} onChange={(e) => cambiarDiagrama(e.target.value)} className="py-2 px-3 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 bg-white outline-none focus:border-orange-400">
            {DIAGRAMS.map((d) => <option key={d.codigo} value={d.codigo}>{d.titulo}</option>)}
          </select>
          <div className="relative">
            <Search size={15} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Resaltar…" className="pl-8 pr-7 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-orange-400 w-32" />
            {q && <button onClick={() => setQ('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400"><X size={14} /></button>}
          </div>
          <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl px-1 py-1">
            <button onClick={() => setView((v) => ({ ...v, s: Math.max(0.1, v.s * 0.89) }))} className="w-8 h-8 rounded-lg hover:bg-slate-100 grid place-items-center text-slate-500"><ZoomOut size={16} /></button>
            <span className="text-[11px] font-mono text-slate-400 w-9 text-center">{Math.round(view.s * 100)}%</span>
            <button onClick={() => setView((v) => ({ ...v, s: Math.min(2.5, v.s * 1.12) }))} className="w-8 h-8 rounded-lg hover:bg-slate-100 grid place-items-center text-slate-500"><ZoomIn size={16} /></button>
            <button onClick={fit} title="Ajustar" className="w-8 h-8 rounded-lg hover:bg-slate-100 grid place-items-center text-slate-500"><Maximize2 size={15} /></button>
          </div>
          {puedeEditar && <button onClick={() => { setEdit((v) => !v); setConnectFrom(null); setSel(null); setInfo(null); }} className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold transition-colors ${edit ? 'bg-slate-800 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}><Pencil size={15} /> {edit ? 'Salir' : 'Editar'}</button>}
        </div>
      </div>

      {edit && (
        <div className="flex items-center gap-1.5 flex-wrap mb-2 bg-white border border-slate-200 rounded-xl px-2 py-1.5">
          <span className="text-[10px] font-black text-slate-400 uppercase mr-1">Agregar</span>
          {TB.map(([t, Icon]) => <button key={t} onClick={() => addNode(t)} className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg text-[12px] font-bold text-slate-600 hover:bg-slate-100"><Icon size={13} /> {t[0].toUpperCase() + t.slice(1)}</button>)}
          <span className="w-px h-5 bg-slate-200 mx-1" />
          <button onClick={() => { setConnectFrom(connectFrom === null ? '' : null); setSel(null); }} className={`inline-flex items-center gap-1 px-2 py-1.5 rounded-lg text-[12px] font-bold ${connectFrom !== null ? 'bg-orange-500 text-white' : 'text-slate-600 hover:bg-slate-100'}`}><Link2 size={13} /> Conectar</button>
          <button onClick={delSel} disabled={!sel} className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg text-[12px] font-bold text-red-600 hover:bg-red-50 disabled:opacity-40"><Trash2 size={13} /> Borrar</button>
          <span className="w-px h-5 bg-slate-200 mx-1" />
          <button onClick={exportar} className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg text-[12px] font-bold text-slate-500 hover:bg-slate-100"><Download size={13} /> Exportar</button>
          <button onClick={() => fileRef.current?.click()} className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg text-[12px] font-bold text-slate-500 hover:bg-slate-100"><Upload size={13} /> Importar</button>
          <input ref={fileRef} type="file" accept="application/json,.json" onChange={importar} className="hidden" />
          <button onClick={() => cargar(codigo)} className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg text-[12px] font-bold text-slate-500 hover:bg-slate-100"><RotateCcw size={13} /> Recargar</button>
          <button onClick={guardar} disabled={!dirty} className="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-bold bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-40"><Save size={14} /> Guardar</button>
        </div>
      )}

      <div ref={wrapRef} onWheel={onWheel} onPointerDown={onBgDown} onPointerMove={onMove} onPointerUp={onUp} onPointerLeave={onUp}
        className={`relative overflow-hidden rounded-2xl border border-slate-200 bg-[radial-gradient(theme(colors.slate.200)_1px,transparent_1px)] [background-size:22px_22px] bg-white select-none ${connectFrom !== null ? 'cursor-crosshair' : 'cursor-grab active:cursor-grabbing'}`}
        style={{ height: 'calc(100vh - 230px)', minHeight: 460, touchAction: 'none' }}>
        <div className="absolute top-0 left-0" style={{ transform: `translate(${view.x}px,${view.y}px) scale(${view.s})`, transformOrigin: '0 0' }}>
          <svg className="absolute top-0 left-0" width="1" height="1" style={{ overflow: 'visible' }}>
            <defs><marker id="fm-arrow" markerWidth="9" markerHeight="9" refX="7" refY="3" orient="auto"><path d="M0,0 L7,3 L0,6 Z" fill="#94a3b8" /></marker></defs>
            {model.edges.map((e) => {
              const a = byId[e.from], b = byId[e.to]; if (!a || !b) return null;
              const p1 = border(a, b.x + b.w / 2, b.y + b.h / 2), p2 = border(b, a.x + a.w / 2, a.y + a.h / 2);
              const mx = (p1.x + p2.x) / 2, my = (p1.y + p2.y) / 2; const on = sel?.kind === 'edge' && sel.id === e.id;
              return (
                <g key={e.id}>
                  <path d={`M ${p1.x} ${p1.y} L ${p2.x} ${p2.y}`} stroke={on ? '#f97316' : '#b6c2d1'} strokeWidth={on ? 2.4 : 1.6} fill="none" markerEnd="url(#fm-arrow)" />
                  <path d={`M ${p1.x} ${p1.y} L ${p2.x} ${p2.y}`} stroke="transparent" strokeWidth="14" fill="none" style={{ cursor: edit ? 'pointer' : 'default', pointerEvents: 'stroke' }} onPointerDown={(ev) => { ev.stopPropagation(); if (edit) setSel({ kind: 'edge', id: e.id }); }} />
                  {e.label && (<g data-elabel onPointerDown={(ev) => { ev.stopPropagation(); if (edit) setSel({ kind: 'edge', id: e.id }); }} style={{ cursor: edit ? 'pointer' : 'default' }}>
                    <rect x={mx - e.label.length * 3.2 - 4} y={my - 8} width={e.label.length * 6.4 + 8} height={16} rx={4} fill="#fff" stroke={on ? '#f97316' : '#e2e8f0'} />
                    <text x={mx} y={my + 3} textAnchor="middle" fontSize="10" fontFamily="ui-monospace,monospace" fill="#64748b">{e.label}</text>
                  </g>)}
                </g>
              );
            })}
          </svg>
          {model.nodes.map((n) => {
            const t = TYPE[n.type] || TYPE.tarea; const hot = term && n.label.toLowerCase().includes(term);
            const on = sel?.kind === 'node' && sel.id === n.id; const src = connectFrom === n.id; const bc = n.color || t.border;
            return (
              <div key={n.id} data-node onPointerDown={(e) => onNodeDown(e, n)} onClick={(e) => onNodeClick(e, n)} onDoubleClick={(e) => onNodeDouble(e, n)}
                className="absolute flex items-center justify-center text-center px-2 font-semibold leading-tight shadow-sm"
                style={{ left: n.x, top: n.y, width: n.w, height: n.h, background: t.fill, color: t.text,
                  border: `2px solid ${hot || on || src ? '#f97316' : bc}`, borderRadius: t.pill ? 999 : 12, fontSize: 12, whiteSpace: 'pre-line',
                  cursor: edit ? (connectFrom !== null ? 'crosshair' : 'grab') : (linkFor(n.label) ? 'pointer' : 'default'), boxShadow: (hot || on || src) ? '0 0 0 4px rgba(249,115,22,.25)' : undefined }}>
                {t.diamond && <span style={{ position: 'absolute', top: -9, left: '50%', transform: 'translateX(-50%)', fontSize: 11, color: bc, background: '#eef1f5', padding: '0 3px', borderRadius: 4 }}>◆</span>}
                {n.label}
              </div>
            );
          })}
        </div>

        {/* Panel de propiedades (edición) */}
        {edit && (selNode || selEdge) && (
          <div className="absolute top-3 right-3 w-60 bg-white border border-slate-200 rounded-xl shadow-lg p-3 space-y-2.5">
            <div className="flex items-center justify-between"><span className="text-[10px] font-black text-slate-400 uppercase inline-flex items-center gap-1"><SlidersHorizontal size={12} /> Propiedades</span><button onClick={() => setSel(null)} className="text-slate-400"><X size={14} /></button></div>
            {selNode && <>
              <label className="block"><span className="text-[10px] font-bold text-slate-500 uppercase">Etiqueta</span><textarea rows={2} value={selNode.label} onChange={(e) => patchNode(selNode.id, { label: e.target.value })} className="mt-1 w-full border border-slate-200 rounded-lg px-2 py-1.5 text-[13px] outline-none focus:border-orange-400 resize-none" /></label>
              <label className="block"><span className="text-[10px] font-bold text-slate-500 uppercase">Tipo</span>
                <select value={selNode.type} onChange={(e) => { const nt = e.target.value; patchNode(selNode.id, { type: nt, w: TYPE[nt].dim[0], h: TYPE[nt].dim[1], color: undefined }); }} className="mt-1 w-full border border-slate-200 rounded-lg px-2 py-1.5 text-[13px] outline-none focus:border-orange-400">
                  <option value="tarea">Tarea</option><option value="decision">Decisión</option><option value="inicio">Inicio</option><option value="fin">Fin</option>
                </select>
              </label>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Color</span>
                <input type="color" value={selNode.color || TYPE[selNode.type].border} onChange={(e) => patchNode(selNode.id, { color: e.target.value })} className="w-8 h-8 rounded border border-slate-200 p-0.5" />
                {selNode.color && <button onClick={() => patchNode(selNode.id, { color: undefined })} className="text-[11px] font-bold text-slate-400 hover:text-slate-600">reset</button>}
                <button onClick={delSel} className="ml-auto inline-flex items-center gap-1 text-[11px] font-bold text-red-500 hover:text-red-600"><Trash2 size={12} /> Borrar</button>
              </div>
            </>}
            {selEdge && <>
              <label className="block"><span className="text-[10px] font-bold text-slate-500 uppercase">Etiqueta de la conexión</span><input value={selEdge.label || ''} onChange={(e) => patchEdge(selEdge.id, { label: e.target.value })} placeholder="(sin etiqueta)" className="mt-1 w-full border border-slate-200 rounded-lg px-2 py-1.5 text-[13px] outline-none focus:border-orange-400" /></label>
              <div className="text-[11px] text-slate-400">{byId[selEdge.from]?.label} → {byId[selEdge.to]?.label}</div>
              <button onClick={delSel} className="inline-flex items-center gap-1 text-[11px] font-bold text-red-500 hover:text-red-600"><Trash2 size={12} /> Borrar conexión</button>
            </>}
          </div>
        )}

        {/* Ficha de nodo (vista) */}
        {info && !edit && (
          <div className="absolute bottom-3 right-3 w-64 bg-white border border-slate-200 rounded-xl shadow-lg p-3">
            <div className="flex items-start justify-between gap-2"><span className="text-[10px] font-black text-slate-400 uppercase">{info.type}</span><button onClick={() => setInfo(null)} className="text-slate-400"><X size={14} /></button></div>
            <p className="text-[14px] font-black text-slate-800 mt-0.5 whitespace-pre-line">{info.label}</p>
            {jump ? <button onClick={() => nav(jump)} className="mt-2 w-full inline-flex items-center justify-center gap-1.5 py-2 rounded-lg bg-orange-500 text-white text-[12px] font-bold hover:bg-orange-600"><ExternalLink size={13} /> Ir al módulo</button>
                  : <p className="text-[11px] text-slate-400 mt-2">Sin módulo asociado directo.</p>}
          </div>
        )}

        <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur border border-slate-200 rounded-xl px-3 py-2 flex flex-wrap items-center gap-3 text-[10px] text-slate-500">
          <span className="inline-flex items-center gap-1"><span className="w-3 h-3 rounded-full border-2" style={{ borderColor: '#10b981', background: '#ecfdf5' }} /> Inicio</span>
          <span className="inline-flex items-center gap-1"><span className="w-3 h-3 rounded border-2" style={{ borderColor: '#2f6f9f' }} /> Tarea</span>
          <span className="inline-flex items-center gap-1"><span className="w-3 h-3 rounded border-2" style={{ borderColor: '#d97706', background: '#fffbeb' }} /> Decisión</span>
          <span className="inline-flex items-center gap-1"><span className="w-3 h-3 rounded-full border-2" style={{ borderColor: '#f97316', background: '#fff7ed' }} /> Fin</span>
          {edit ? <span className="italic">{connectFrom !== null ? (connectFrom === '' ? 'toca ORIGEN' : 'toca DESTINO') : 'arrastra · doble clic renombra · Supr borra'}</span>
                : <span className="italic">clic en un nodo para ver / ir</span>}
        </div>
      </div>
    </div>
  );
}
