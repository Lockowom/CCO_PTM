import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { Package, Plus, Minus, Mail, RefreshCw, Search, Settings2, X, Copy, Send } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  listarInsumos, setCantidad, guardarInsumo, semaforo, SEMAFORO_META,
  CATEGORIAS, CATEGORIA_LABEL, armarCorreoSolicitud,
} from '../../services/insumosService';

const LS_DEST = 'insumos_destinatario';

export default function Insumos() {
  const { user, hasPermission } = useAuth();
  const puedeGestionar = hasPermission('manage_insumos') || hasPermission('manage_inventory') || user?.rol === 'ADMIN' || user?.es_admin_delegado;

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [soloReponer, setSoloReponer] = useState(false);
  const [sel, setSel] = useState(() => new Set());
  const [modal, setModal] = useState(false);

  const cargar = useCallback(() => {
    setLoading(true);
    listarInsumos().then((rows) => { setItems(rows); setLoading(false); }).catch(() => { setItems([]); setLoading(false); });
  }, []);
  useEffect(() => { cargar(); }, [cargar]);

  const resumen = useMemo(() => {
    const r = { ok: 0, bajo: 0, critico: 0 };
    items.forEach((i) => { r[semaforo(i)]++; });
    return r;
  }, [items]);

  const term = q.trim().toLowerCase();
  const visibles = useMemo(() => items.filter((i) => {
    const s = semaforo(i);
    if (soloReponer && s === 'ok') return false;
    if (term && ![i.nombre, i.codigo_ptm, i.medida].filter(Boolean).some((v) => String(v).toLowerCase().includes(term))) return false;
    return true;
  }), [items, soloReponer, term]);

  const porCategoria = useMemo(() => {
    const map = {};
    CATEGORIAS.forEach((c) => { map[c] = []; });
    visibles.forEach((i) => { (map[i.categoria] || (map[i.categoria] = [])).push(i); });
    return map;
  }, [visibles]);

  const aplicarCantidad = async (item, nueva) => {
    const val = Math.max(0, Number(nueva) || 0);
    setItems((xs) => xs.map((x) => (x.id === item.id ? { ...x, cantidad: val } : x)));  // optimista
    const res = await setCantidad(item.id, val);
    if (!res.ok) { toast.error(res.error || 'No se pudo actualizar'); cargar(); }
  };

  const toggleSel = (id) => setSel((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const seleccionarPorReponer = () => setSel(new Set(items.filter((i) => semaforo(i) !== 'ok').map((i) => i.id)));

  const seleccionados = items.filter((i) => sel.has(i.id));

  return (
    <div className="anim-fade-up space-y-5 max-w-6xl mx-auto pb-24">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2"><Package className="text-orange-500" /> Panel de Insumos</h1>
          <p className="text-sm text-slate-500 mt-0.5">Stock de insumos de embalaje y despacho · semáforo de reposición</p>
        </div>
        <button onClick={cargar} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50">
          <RefreshCw size={15} /> Actualizar
        </button>
      </div>

      {/* Resumen semáforo */}
      <div className="grid grid-cols-3 gap-3">
        {[['ok', resumen.ok], ['bajo', resumen.bajo], ['critico', resumen.critico]].map(([k, n]) => {
          const m = SEMAFORO_META[k];
          return (
            <div key={k} className="rounded-2xl border p-4 flex items-center gap-3" style={{ background: m.bg, borderColor: `${m.color}33` }}>
              <span className="text-2xl">{m.dot}</span>
              <div><div className="text-2xl font-black" style={{ color: m.text }}>{n}</div><div className="text-[12px] font-semibold" style={{ color: m.text }}>{m.label}</div></div>
            </div>
          );
        })}
      </div>

      {/* Controles */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[180px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar insumo, medida o código…" className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-orange-400 bg-white" />
        </div>
        <button onClick={() => setSoloReponer((v) => !v)} className={`px-3 py-2.5 rounded-xl text-sm font-bold border transition-colors ${soloReponer ? 'bg-amber-500 text-white border-amber-500' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}>
          Solo por reponer
        </button>
        <button onClick={seleccionarPorReponer} className="px-3 py-2.5 rounded-xl text-sm font-bold border border-slate-200 bg-white text-slate-600 hover:bg-slate-50">
          Seleccionar por reponer
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400">Cargando insumos…</div>
      ) : (
        CATEGORIAS.filter((c) => (porCategoria[c] || []).length > 0).map((cat) => (
          <section key={cat}>
            <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-wider mb-2">{CATEGORIA_LABEL[cat] || cat}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {porCategoria[cat].map((i) => (
                <InsumoCard key={i.id} item={i} selected={sel.has(i.id)} onToggle={() => toggleSel(i.id)}
                  puedeGestionar={puedeGestionar} onCantidad={(v) => aplicarCantidad(i, v)} onSaved={cargar} />
              ))}
            </div>
          </section>
        ))
      )}

      {!loading && visibles.length === 0 && (
        <div className="py-16 text-center text-slate-400 text-sm">Sin insumos que coincidan con el filtro.</div>
      )}

      {/* Barra de solicitud */}
      {sel.size > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 shadow-[0_-4px_16px_rgba(15,23,42,0.08)]">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
            <span className="text-sm font-semibold text-slate-700">{sel.size} insumo{sel.size !== 1 ? 's' : ''} seleccionado{sel.size !== 1 ? 's' : ''}</span>
            <div className="flex items-center gap-2">
              <button onClick={() => setSel(new Set())} className="px-3 py-2 rounded-xl text-sm font-semibold text-slate-500 hover:bg-slate-100">Limpiar</button>
              <button onClick={() => setModal(true)} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-500 text-white text-sm font-bold hover:bg-orange-600">
                <Mail size={16} /> Solicitar por correo
              </button>
            </div>
          </div>
        </div>
      )}

      {modal && <SolicitudModal items={seleccionados} solicitante={user?.nombre || ''} onClose={() => setModal(false)} />}
    </div>
  );
}

// ── Tarjeta de insumo ───────────────────────────────────────────────────────
function InsumoCard({ item, selected, onToggle, puedeGestionar, onCantidad, onSaved }) {
  const s = semaforo(item);
  const m = SEMAFORO_META[s];
  const [editCant, setEditCant] = useState(String(item.cantidad));
  const [cfg, setCfg] = useState(false);
  const [bajo, setBajo] = useState(String(item.umbral_bajo));
  const [crit, setCrit] = useState(String(item.umbral_critico));
  useEffect(() => { setEditCant(String(item.cantidad)); }, [item.cantidad]);

  const commit = (v) => { const n = Math.max(0, Number(v) || 0); setEditCant(String(n)); if (n !== item.cantidad) onCantidad(n); };
  const guardarUmbrales = async () => {
    const res = await guardarInsumo({ id: item.id, umbral_bajo: bajo, umbral_critico: crit });
    if (res.ok) { toast.success('Umbrales actualizados'); setCfg(false); onSaved?.(); }
    else toast.error(res.error || 'No se pudo guardar');
  };

  return (
    <div className={`rounded-2xl border-2 bg-white p-4 transition-shadow ${selected ? 'ring-2 ring-orange-300' : ''}`} style={{ borderColor: `${m.color}55` }}>
      <div className="flex items-start justify-between gap-2">
        <label className="flex items-start gap-2 min-w-0 cursor-pointer">
          <input type="checkbox" checked={selected} onChange={onToggle} className="mt-1 w-4 h-4 accent-orange-500 shrink-0" />
          <span className="min-w-0">
            <span className="block text-[14px] font-black text-slate-800 leading-tight truncate" title={item.nombre}>{item.nombre}</span>
            {(item.medida || item.codigo_ptm) && (
              <span className="block text-[11px] text-slate-400 mt-0.5 truncate">{item.medida || ''}{item.medida && item.codigo_ptm ? ' · ' : ''}{item.codigo_ptm || ''}</span>
            )}
          </span>
        </label>
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black shrink-0" style={{ background: m.bg, color: m.text }}>
          <span className="w-2 h-2 rounded-full" style={{ background: m.color }} /> {m.label}
        </span>
      </div>

      <div className="mt-3 flex items-center justify-between gap-2">
        {puedeGestionar ? (
          <div className="flex items-center gap-1">
            <button onClick={() => commit(item.cantidad - 1)} className="w-8 h-8 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 flex items-center justify-center"><Minus size={15} /></button>
            <input value={editCant} onChange={(e) => setEditCant(e.target.value.replace(/[^0-9.]/g, ''))}
              onBlur={(e) => commit(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
              className="w-16 text-center text-xl font-black text-slate-800 border border-slate-200 rounded-lg py-1 outline-none focus:border-orange-400" />
            <button onClick={() => commit(item.cantidad + 1)} className="w-8 h-8 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 flex items-center justify-center"><Plus size={15} /></button>
          </div>
        ) : (
          <div className="text-2xl font-black text-slate-800">{item.cantidad}</div>
        )}
        <div className="text-right">
          <div className="text-[11px] text-slate-400">{item.unidad}</div>
          {puedeGestionar && (
            <button onClick={() => setCfg((v) => !v)} className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-orange-500 mt-0.5"><Settings2 size={12} /> umbrales</button>
          )}
        </div>
      </div>

      {/* Barra visual de nivel vs umbrales */}
      <div className="mt-2 h-1.5 rounded-full bg-slate-100 overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(100, item.umbral_bajo > 0 ? (item.cantidad / (item.umbral_bajo * 2)) * 100 : (item.cantidad > 0 ? 100 : 0))}%`, background: m.color }} />
      </div>
      <div className="mt-1 text-[10px] text-slate-400">Bajo ≤ {item.umbral_bajo} · Crítico ≤ {item.umbral_critico}</div>

      {cfg && (
        <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2">
          <label className="text-[11px] font-bold text-slate-500">Umbral bajo
            <input value={bajo} onChange={(e) => setBajo(e.target.value.replace(/[^0-9.]/g, ''))} className="mt-1 w-full border border-slate-200 rounded-lg px-2 py-1 text-sm outline-none focus:border-orange-400" />
          </label>
          <label className="text-[11px] font-bold text-slate-500">Umbral crítico
            <input value={crit} onChange={(e) => setCrit(e.target.value.replace(/[^0-9.]/g, ''))} className="mt-1 w-full border border-slate-200 rounded-lg px-2 py-1 text-sm outline-none focus:border-orange-400" />
          </label>
          <div className="col-span-2 flex justify-end gap-2 mt-1">
            <button onClick={() => setCfg(false)} className="px-3 py-1.5 rounded-lg text-xs text-slate-500 hover:bg-slate-100">Cancelar</button>
            <button onClick={guardarUmbrales} className="px-3 py-1.5 rounded-lg bg-orange-500 text-white text-xs font-bold hover:bg-orange-600">Guardar</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Modal de solicitud por correo ───────────────────────────────────────────
function SolicitudModal({ items, solicitante, onClose }) {
  const [dest, setDest] = useState(() => localStorage.getItem(LS_DEST) || '');
  const [pedir, setPedir] = useState(() => Object.fromEntries(items.map((i) => [i.id, ''])));
  const conPedir = items.map((i) => ({ ...i, pedir: pedir[i.id] }));
  const { asunto, cuerpo } = armarCorreoSolicitud(conPedir, { solicitante });

  const abrirCorreo = () => {
    localStorage.setItem(LS_DEST, dest.trim());
    const url = `mailto:${encodeURIComponent(dest.trim())}?subject=${encodeURIComponent(asunto)}&body=${encodeURIComponent(cuerpo)}`;
    window.location.href = url;
  };
  const copiar = async () => {
    try { await navigator.clipboard.writeText(`${asunto}\n\n${cuerpo}`); toast.success('Copiado al portapapeles'); }
    catch { toast.error('No se pudo copiar'); }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
      <div onClick={(e) => e.stopPropagation()} className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h3 className="text-[15px] font-black text-slate-800 flex items-center gap-2"><Mail size={18} className="text-orange-500" /> Solicitud de insumos</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400"><X size={18} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <label className="block">
            <span className="text-[12px] font-bold text-slate-500">Correo del destinatario (compras / bodega)</span>
            <input value={dest} onChange={(e) => setDest(e.target.value)} placeholder="ej: compras@ptm.cl" className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-orange-400" />
          </label>
          <div>
            <span className="text-[12px] font-bold text-slate-500">Insumos a solicitar</span>
            <div className="mt-1.5 space-y-1.5">
              {conPedir.map((i) => {
                const m = SEMAFORO_META[semaforo(i)];
                return (
                  <div key={i.id} className="flex items-center gap-2 rounded-xl border border-slate-100 px-3 py-2">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ background: m.color }} />
                    <span className="flex-1 min-w-0"><span className="block text-[13px] font-semibold text-slate-700 truncate">{i.nombre}</span><span className="text-[11px] text-slate-400">quedan {i.cantidad} {i.unidad}</span></span>
                    <input value={pedir[i.id]} onChange={(e) => setPedir((p) => ({ ...p, [i.id]: e.target.value.replace(/[^0-9.]/g, '') }))}
                      placeholder="pedir" className="w-20 text-center border border-slate-200 rounded-lg px-2 py-1 text-sm outline-none focus:border-orange-400" />
                  </div>
                );
              })}
            </div>
          </div>
          <div>
            <span className="text-[12px] font-bold text-slate-500">Vista previa</span>
            <pre className="mt-1 whitespace-pre-wrap text-[12px] text-slate-600 bg-slate-50 border border-slate-100 rounded-xl p-3 max-h-40 overflow-y-auto">{cuerpo}</pre>
          </div>
        </div>
        <div className="px-5 py-4 border-t border-slate-100 flex items-center justify-between gap-2">
          <button onClick={copiar} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50"><Copy size={15} /> Copiar</button>
          <button onClick={abrirCorreo} disabled={!dest.trim()} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-500 text-white text-sm font-bold hover:bg-orange-600 disabled:opacity-50"><Send size={15} /> Abrir en correo</button>
        </div>
      </div>
    </div>
  );
}
