import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Workflow as WorkflowIcon, ZoomIn, ZoomOut, Maximize2, Search, X } from 'lucide-react';
import flujo from '../../data/flujoMaestro.json';

// Colores por tipo (alineados a la identidad CCO / modelador).
const TYPE = {
  inicio:   { fill: '#ecfdf5', border: '#10b981', text: '#047857', pill: true },
  fin:      { fill: '#fff7ed', border: '#f97316', text: '#c2410c', pill: true },
  tarea:    { fill: '#ffffff', border: '#2f6f9f', text: '#1e3a4f', pill: false },
  decision: { fill: '#fffbeb', border: '#d97706', text: '#92400e', pill: false, diamond: true },
};

const PAD = 120;

export default function FlujoMaestro() {
  const nodes = flujo.nodes || [];
  const edges = flujo.edges || [];

  // Normaliza coordenadas (hay negativas) a un lienzo con padding.
  const { N, byId, W, H } = useMemo(() => {
    const minX = Math.min(...nodes.map((n) => n.x));
    const minY = Math.min(...nodes.map((n) => n.y));
    const maxX = Math.max(...nodes.map((n) => n.x + n.w));
    const maxY = Math.max(...nodes.map((n) => n.y + n.h));
    const N = nodes.map((n) => ({ ...n, X: n.x - minX + PAD, Y: n.y - minY + PAD }));
    const byId = Object.fromEntries(N.map((n) => [n.id, n]));
    return { N, byId, W: maxX - minX + PAD * 2, H: maxY - minY + PAD * 2 };
  }, [nodes]);

  const wrapRef = useRef(null);
  const [view, setView] = useState({ s: 0.6, x: 0, y: 0 });
  const [q, setQ] = useState('');
  const drag = useRef(null);

  const fit = useCallback(() => {
    const el = wrapRef.current; if (!el) return;
    const cw = el.clientWidth, ch = el.clientHeight;
    const s = Math.min(cw / W, ch / H) * 0.92;
    setView({ s, x: (cw - W * s) / 2, y: (ch - H * s) / 2 });
  }, [W, H]);
  useEffect(() => { fit(); }, [fit]);

  const onWheel = (e) => {
    e.preventDefault();
    const el = wrapRef.current; const r = el.getBoundingClientRect();
    const mx = e.clientX - r.left, my = e.clientY - r.top;
    setView((v) => {
      const ns = Math.min(2.5, Math.max(0.12, v.s * (e.deltaY < 0 ? 1.12 : 0.89)));
      const k = ns / v.s;
      return { s: ns, x: mx - (mx - v.x) * k, y: my - (my - v.y) * k };
    });
  };
  const onDown = (e) => { if (e.target.closest('[data-node]')) return; drag.current = { x: e.clientX, y: e.clientY }; };
  const onMove = (e) => {
    if (!drag.current) return;
    const dx = e.clientX - drag.current.x, dy = e.clientY - drag.current.y;
    drag.current = { x: e.clientX, y: e.clientY };
    setView((v) => ({ ...v, x: v.x + dx, y: v.y + dy }));
  };
  const onUp = () => { drag.current = null; };

  // Punto en el borde del nodo hacia (tx,ty).
  const border = (n, tx, ty) => {
    const cx = n.X + n.w / 2, cy = n.Y + n.h / 2, dx = tx - cx, dy = ty - cy;
    if (!dx && !dy) return { x: cx, y: cy };
    const hw = n.w / 2, hh = n.h / 2;
    const t = Math.min(dx ? hw / Math.abs(dx) : Infinity, dy ? hh / Math.abs(dy) : Infinity);
    return { x: cx + dx * t, y: cy + dy * t };
  };

  const term = q.trim().toLowerCase();
  const match = (n) => term && n.label.toLowerCase().includes(term);

  return (
    <div className="anim-fade-up max-w-[1400px] mx-auto pb-6">
      <div className="flex items-start justify-between gap-3 flex-wrap mb-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 text-white grid place-items-center shadow-lg shadow-orange-500/20"><WorkflowIcon size={22} /></div>
          <div>
            <h1 className="text-xl font-black text-slate-800 leading-tight">Mapa de Procesos (Flujo Maestro)</h1>
            <p className="text-[13px] text-slate-500">Vista ejecutiva de todo CCO · {N.length} nodos · {edges.length} conexiones · solo lectura</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={15} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Resaltar…" className="pl-8 pr-7 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-orange-400 w-40" />
            {q && <button onClick={() => setQ('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400"><X size={14} /></button>}
          </div>
          <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl px-1 py-1">
            <button onClick={() => setView((v) => ({ ...v, s: Math.max(0.12, v.s * 0.89) }))} className="w-8 h-8 rounded-lg hover:bg-slate-100 grid place-items-center text-slate-500"><ZoomOut size={16} /></button>
            <span className="text-[11px] font-mono text-slate-400 w-10 text-center">{Math.round(view.s * 100)}%</span>
            <button onClick={() => setView((v) => ({ ...v, s: Math.min(2.5, v.s * 1.12) }))} className="w-8 h-8 rounded-lg hover:bg-slate-100 grid place-items-center text-slate-500"><ZoomIn size={16} /></button>
            <button onClick={fit} title="Ajustar" className="w-8 h-8 rounded-lg hover:bg-slate-100 grid place-items-center text-slate-500"><Maximize2 size={15} /></button>
          </div>
        </div>
      </div>

      <div
        ref={wrapRef}
        onWheel={onWheel} onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerLeave={onUp}
        className="relative overflow-hidden rounded-2xl border border-slate-200 bg-[radial-gradient(theme(colors.slate.200)_1px,transparent_1px)] [background-size:22px_22px] bg-white cursor-grab active:cursor-grabbing select-none"
        style={{ height: 'calc(100vh - 210px)', minHeight: 460, touchAction: 'none' }}
      >
        <div className="absolute top-0 left-0" style={{ transform: `translate(${view.x}px,${view.y}px) scale(${view.s})`, transformOrigin: '0 0' }}>
          <svg width={W} height={H} className="absolute top-0 left-0" style={{ overflow: 'visible' }}>
            <defs>
              <marker id="fm-arrow" markerWidth="9" markerHeight="9" refX="7" refY="3" orient="auto"><path d="M0,0 L7,3 L0,6 Z" fill="#94a3b8" /></marker>
            </defs>
            {edges.map((e) => {
              const a = byId[e.from], b = byId[e.to]; if (!a || !b) return null;
              const bc = { x: b.X + b.w / 2, y: b.Y + b.h / 2 }, ac = { x: a.X + a.w / 2, y: a.Y + a.h / 2 };
              const p1 = border(a, bc.x, bc.y), p2 = border(b, ac.x, ac.y);
              const mx = (p1.x + p2.x) / 2, my = (p1.y + p2.y) / 2;
              return (
                <g key={e.id}>
                  <path d={`M ${p1.x} ${p1.y} L ${p2.x} ${p2.y}`} stroke="#b6c2d1" strokeWidth="1.6" fill="none" markerEnd="url(#fm-arrow)" />
                  {e.label && (
                    <g>
                      <rect x={mx - e.label.length * 3.2 - 4} y={my - 8} width={e.label.length * 6.4 + 8} height={16} rx={4} fill="#ffffff" stroke="#e2e8f0" />
                      <text x={mx} y={my + 3} textAnchor="middle" fontSize="10" fontFamily="ui-monospace,monospace" fill="#64748b">{e.label}</text>
                    </g>
                  )}
                </g>
              );
            })}
          </svg>

          {N.map((n) => {
            const t = TYPE[n.type] || TYPE.tarea;
            const hot = match(n);
            return (
              <div key={n.id} data-node
                className="absolute flex items-center justify-center text-center px-2 font-semibold leading-tight shadow-sm"
                style={{
                  left: n.X, top: n.Y, width: n.w, height: n.h,
                  background: t.fill, color: t.text,
                  border: `2px solid ${hot ? '#f97316' : t.border}`,
                  borderRadius: t.pill ? 999 : (t.diamond ? 10 : 12),
                  fontSize: 12, whiteSpace: 'pre-line',
                  boxShadow: hot ? '0 0 0 4px rgba(249,115,22,.25)' : undefined,
                }}>
                {t.diamond && <span style={{ position: 'absolute', top: -9, left: '50%', transform: 'translateX(-50%)', fontSize: 11, color: t.border, background: '#eef1f5', padding: '0 3px', borderRadius: 4 }}>◆</span>}
                {n.label}
              </div>
            );
          })}
        </div>

        {/* Leyenda */}
        <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur border border-slate-200 rounded-xl px-3 py-2 flex flex-wrap items-center gap-3 text-[10px] text-slate-500">
          <span className="inline-flex items-center gap-1"><span className="w-3 h-3 rounded-full border-2" style={{ borderColor: '#10b981', background: '#ecfdf5' }} /> Inicio</span>
          <span className="inline-flex items-center gap-1"><span className="w-3 h-3 rounded border-2" style={{ borderColor: '#2f6f9f' }} /> Tarea</span>
          <span className="inline-flex items-center gap-1"><span className="w-3 h-3 rounded border-2" style={{ borderColor: '#d97706', background: '#fffbeb' }} /> Decisión</span>
          <span className="inline-flex items-center gap-1"><span className="w-3 h-3 rounded-full border-2" style={{ borderColor: '#f97316', background: '#fff7ed' }} /> Fin</span>
          <span className="text-slate-300">·</span>
          <span className="italic">arrastra para mover · rueda para zoom</span>
        </div>
      </div>
    </div>
  );
}
