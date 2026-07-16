import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { toast } from 'sonner';
import {
  Save, Search, Loader2, Hash, Truck, ClipboardList, Sparkles, PackagePlus,
  RefreshCw, Trash2, X, Plus, Layers, Pencil,
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import PanelModal from '../PanelModal';
import {
  CANALES, VARIOS_TIPOS, ESTADOS_SELECCIONABLES, ESTADOS_ACTIVOS, TIPOS_DESPACHO, colorFor,
  listaActivas, opciones, lookup, guardar, eliminar, cambiarEstado,
  listarConsolidados, guardarConsolidado, eliminarConsolidado, buscarNvBasico,
} from '../ingresar/ingresarService';

const hoy = () => new Date().toLocaleDateString('en-CA');
const clp = (v) => (v == null || v === '' ? '—' : Number(v).toLocaleString('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }));

function SectionHead({ n, icon: Icon, title }) {
  return (
    <div className="flex items-center gap-2.5 mb-4">
      <div className="w-8 h-8 rounded-xl border bg-orange-50 border-orange-100 text-orange-600 flex items-center justify-center shrink-0"><Icon size={15} /></div>
      <div className="flex items-baseline gap-2">
        <span className="text-[10px] font-black text-slate-300">{n}</span>
        <h2 className="text-[12px] font-black text-slate-600 uppercase tracking-wider">{title}</h2>
      </div>
    </div>
  );
}
function Badge({ estado }) {
  return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-black text-white" style={{ backgroundColor: colorFor(estado) }}>{estado}</span>;
}

// ── Modal de detalle / edición de una N.V. ──────────────────────────────────
function DetalleModal({ item, puedeEscribir, onClose, onSaved, onDeleted }) {
  const [d, setD] = useState(null);
  const [f, setF] = useState({});
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const set = (patch) => setF((p) => ({ ...p, ...patch }));

  useEffect(() => {
    let on = true;
    lookup(item.canal, item.nv).then((r) => {
      if (!on) return;
      const data = r.found ? r.data : {};
      setD(data);
      setF({
        estado: data.estado || item.estado, urgente: data.urgente === true,
        transportista: data.transportista || '', tipoDespacho: data.tipo_despacho || '',
        fechaCompromiso: data.fecha_compromiso || '', fechaDespacho: data.fecha_despacho ? String(data.fecha_despacho).slice(0, 10) : '',
        fechaFacturacion: data.fecha_facturacion ? String(data.fecha_facturacion).slice(0, 10) : '', fechaAprobacionReal: data.fecha_aprobacion_real ? String(data.fecha_aprobacion_real).slice(0, 10) : '',
        factura: data.factura || '', guia: data.guia || '', bultos: data.bultos ?? '', valorFactura: data.valor_factura ?? '', numeroEnvio: data.numero_envio || '',
      });
    });
    return () => { on = false; };
  }, [item]);

  const onGuardar = async () => {
    setSaving(true);
    const res = await guardar({ id: item.id, ...f });
    setSaving(false);
    if (res.ok) { toast.success(`N.V. ${item.nv} actualizada`); onSaved?.({ ...item, estado: f.estado, transportista: f.transportista, urgente: f.urgente }); onClose(); }
    else toast.error(res.error || 'No se pudo guardar');
  };
  const onEliminar = async () => {
    if (!window.confirm(`¿Eliminar la N.V. ${item.nv}? Esta acción no se puede deshacer.`)) return;
    setDeleting(true);
    const res = await eliminar(item.id);
    setDeleting(false);
    if (res.ok) { toast.success(`N.V. ${item.nv} eliminada`); onDeleted?.(item); onClose(); }
    else toast.error(res.error || 'No se pudo eliminar');
  };

  return (
    <PanelModal titulo={`N.V. ${item.nv} · ${item.canal.toUpperCase()}`} onClose={onClose}>
      {!d ? (
        <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-orange-500" size={26} /></div>
      ) : (
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><div className="text-[10px] uppercase text-slate-400 font-black">Cliente</div><div className="font-bold text-slate-700">{d.cliente || '—'}</div></div>
            <div><div className="text-[10px] uppercase text-slate-400 font-black">Vendedor</div><div className="font-bold text-slate-700">{d.vendedor || '—'}</div></div>
            <div><div className="text-[10px] uppercase text-slate-400 font-black">División</div><div className="font-bold text-slate-700">{d.division || '—'}</div></div>
            <div><div className="text-[10px] uppercase text-slate-400 font-black">Valor N.V.</div><div className="font-bold text-slate-700">{clp(d.valor_nv)}</div></div>
          </div>

          {!puedeEscribir ? (
            <div className="text-xs text-slate-400 bg-slate-50 rounded-lg px-3 py-2">Solo lectura · necesitas el permiso <b>manage_panel</b> para editar.</div>
          ) : (
            <>
              <div className="border-t border-slate-100 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="field-label">Estado</label>
                  <select value={f.estado} onChange={(e) => set({ estado: e.target.value })} className="field-input">
                    {ESTADOS_SELECCIONABLES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="field-label">Transportista</label>
                  <input className="field-input" value={f.transportista} onChange={(e) => set({ transportista: e.target.value })} />
                </div>
                <div>
                  <label className="field-label">Tipo Despacho</label>
                  <select value={f.tipoDespacho} onChange={(e) => set({ tipoDespacho: e.target.value })} className="field-input">
                    <option value="">— Seleccionar —</option>
                    {TIPOS_DESPACHO.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div><label className="field-label">Fecha Despacho</label><input type="date" className="field-input" value={f.fechaDespacho} onChange={(e) => set({ fechaDespacho: e.target.value })} /></div>
                <div><label className="field-label">Fecha Facturación</label><input type="date" className="field-input" value={f.fechaFacturacion} onChange={(e) => set({ fechaFacturacion: e.target.value })} /></div>
                <div><label className="field-label">Fecha Aprob. Real</label><input type="date" className="field-input" value={f.fechaAprobacionReal} onChange={(e) => set({ fechaAprobacionReal: e.target.value })} /></div>
                <div><label className="field-label">Factura</label><input className="field-input" value={f.factura} onChange={(e) => set({ factura: e.target.value })} /></div>
                <div><label className="field-label">Guía</label><input className="field-input" value={f.guia} onChange={(e) => set({ guia: e.target.value })} /></div>
                <div><label className="field-label">Bultos</label><input type="number" className="field-input" value={f.bultos} onChange={(e) => set({ bultos: e.target.value })} /></div>
                <div><label className="field-label">N° Envío</label><input className="field-input" value={f.numeroEnvio} onChange={(e) => set({ numeroEnvio: e.target.value })} /></div>
              </div>
              <button type="button" onClick={() => set({ urgente: !f.urgente })}
                className={`w-full flex items-center justify-between rounded-xl px-4 py-2.5 border-2 transition-all ${f.urgente ? 'bg-red-50 border-red-400' : 'bg-slate-50 border-slate-200'}`}>
                <span className="flex items-center gap-2 text-sm font-black"><span>🚨</span> NV Urgente</span>
                <span className={`relative w-11 h-6 rounded-full ${f.urgente ? 'bg-red-500' : 'bg-slate-300'}`}><span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${f.urgente ? 'translate-x-5' : ''}`} /></span>
              </button>
              <div className="flex items-center justify-between gap-2 pt-1">
                <button onClick={onEliminar} disabled={deleting} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-red-600 bg-red-50 hover:bg-red-100 text-sm font-bold disabled:opacity-50">
                  {deleting ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />} Eliminar
                </button>
                <button onClick={onGuardar} disabled={saving} className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-orange-500 text-white text-sm font-black hover:bg-orange-600 disabled:opacity-50">
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Guardar
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </PanelModal>
  );
}

// ── Pestaña Buscar (lista de N.V. activas) ──────────────────────────────────
function TabBuscar({ puedeEscribir }) {
  const [lista, setLista] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('Todos');
  const [q, setQ] = useState('');
  const [sel, setSel] = useState(null);

  const cargar = useCallback(() => {
    setLoading(true);
    listaActivas().then((rows) => { setLista(rows); setLoading(false); }).catch(() => { setLista([]); setLoading(false); });
  }, []);
  useEffect(() => { cargar(); }, [cargar]);

  const filtrada = useMemo(() => {
    const term = q.trim().toLowerCase();
    return lista.filter((r) => (filtro === 'Todos' || r.estado === filtro)
      && (!term || [r.nv, r.cliente, r.vendedor, r.guia, r.factura, r.transportista].filter(Boolean).some((v) => String(v).toLowerCase().includes(term))));
  }, [lista, filtro, q]);

  const conteo = useMemo(() => {
    const m = {};
    lista.forEach((r) => { m[r.estado] = (m[r.estado] || 0) + 1; });
    return m;
  }, [lista]);

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-3">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filtrar por NV, cliente, vendedor, guía…" className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 text-sm outline-none" />
          </div>
          <button onClick={cargar} className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-orange-100 text-slate-600 text-xs font-bold"><RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Recargar</button>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {['Todos', ...ESTADOS_ACTIVOS].map((e) => (
            <button key={e} onClick={() => setFiltro(e)}
              className={`px-2.5 py-1 rounded-full text-xs font-bold border transition-all ${filtro === e ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-slate-600 border-slate-200 hover:border-orange-300'}`}>
              {e === 'Todos' ? `Todos (${lista.length})` : `${e} (${conteo[e] || 0})`}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="py-16 flex justify-center"><Loader2 className="animate-spin text-orange-500" size={30} /></div>
      ) : filtrada.length === 0 ? (
        <div className="text-center py-16 text-slate-400 text-sm">Sin N.V. activas para este filtro.</div>
      ) : (
        <div className="space-y-2">
          {filtrada.map((r) => (
            <button key={r.key} onClick={() => setSel(r)}
              className={`w-full text-left bg-white rounded-xl border shadow-sm hover:shadow-md transition px-4 py-3 flex items-center gap-3 ${r.urgente ? 'border-red-200 ring-1 ring-red-100' : 'border-slate-200'}`}
              style={{ borderLeft: `4px solid ${colorFor(r.estado)}` }}>
              <Badge estado={r.estado} />
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[11px] font-bold text-slate-400 uppercase">{r.canal}</span>
                <span className="font-black text-slate-800 text-sm">{r.nv}</span>
              </div>
              <div className="hidden sm:flex flex-col min-w-0 flex-1">
                <span className="text-sm text-slate-700 font-bold truncate">{r.cliente || '—'}</span>
                <span className="text-xs text-slate-400 truncate">{[r.vendedor, r.transportista].filter((x) => x && x !== '—').join(' · ') || ' '}</span>
              </div>
              {r.fechaCompromiso && <span className="text-xs text-slate-400 whitespace-nowrap hidden md:inline">📅 {r.fechaCompromiso}</span>}
              {r.urgente && <span className="text-[11px] font-black text-red-600 animate-pulse">🚨</span>}
              <Pencil size={15} className="text-slate-300 shrink-0" />
            </button>
          ))}
        </div>
      )}

      {sel && (
        <DetalleModal item={sel} puedeEscribir={puedeEscribir}
          onClose={() => setSel(null)}
          onSaved={(upd) => setLista((ls) => ls.map((x) => (x.key === upd.key ? { ...x, ...upd } : x)))}
          onDeleted={(del) => setLista((ls) => ls.filter((x) => x.key !== del.key))} />
      )}
    </div>
  );
}

// ── Pestaña Ingresar (formulario alta/edición) ──────────────────────────────
const FORM0 = {
  canal: 'ptm', nv: '', mode: 'idle', lookup: null,
  variosTipo: '', variosCliente: '', variosVendedor: '', variosDivision: '', variosCcosto: '',
  estado: '', urgente: false, tipoDespacho: '', transportista: '',
  fechaCompromiso: '', fechaAprobacion: '', fechaAprobacionReal: '', fechaFacturacion: '', fechaDespacho: '',
  factura: '', guia: '', bultos: '', valorFactura: '', numeroEnvio: '',
};
function TabIngresar() {
  const [f, setF] = useState(FORM0);
  const set = (patch) => setF((p) => ({ ...p, ...patch }));
  const [lookupLoading, setLookupLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [estadoOpen, setEstadoOpen] = useState(false);
  const [estadoQuery, setEstadoQuery] = useState('');
  const estadoRef = useRef(null);

  useEffect(() => {
    const onClick = (e) => { if (estadoRef.current && !estadoRef.current.contains(e.target)) setEstadoOpen(false); };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);
  const estadoFiltered = useMemo(() => ESTADOS_SELECCIONABLES.filter((e) => e.toLowerCase().includes(estadoQuery.toLowerCase())), [estadoQuery]);

  const buscar = () => {
    const nv = f.nv.trim(); if (!nv) return;
    setLookupLoading(true);
    lookup(f.canal, nv).then((r) => {
      if (r.found) set({ mode: 'update', lookup: { found: true, row: r.row, data: r.data }, estado: r.data.estado || '', transportista: r.data.transportista || '', tipoDespacho: r.data.tipo_despacho || '', fechaCompromiso: r.data.fecha_compromiso || '', fechaAprobacion: r.data.fecha_aprobacion ? String(r.data.fecha_aprobacion).slice(0, 10) : '', factura: r.data.factura || '', guia: r.data.guia || '', bultos: r.data.bultos ?? '', numeroEnvio: r.data.numero_envio || '', urgente: r.data.urgente === true });
      else set({ mode: 'create', lookup: { found: false, autoFill: r.autoFill }, fechaAprobacion: hoy() });
      setLookupLoading(false);
    });
  };
  const onGuardar = () => {
    if (f.mode === 'idle') return toast.error('Busca una N.V. primero');
    if (!f.estado) return toast.error('Falta el Estado');
    setSaving(true);
    guardar({ ...f }).then((res) => {
      setSaving(false);
      if (res.ok) { toast.success(`N.V. ${f.nv} ${f.mode === 'update' ? 'actualizada' : 'creada'}`); setF(FORM0); }
      else toast.error(res.error || 'No se pudo guardar');
    });
  };

  const af = f.lookup?.found ? f.lookup.data : f.lookup?.autoFill;
  const cells = af ? [{ l: 'Cliente', v: af.cliente }, { l: 'Vendedor', v: af.vendedor }, { l: 'C. Costo', v: af.ccosto }, { l: 'División', v: af.division }].filter((x) => x.v) : [];

  return (
    <div className="space-y-4 max-w-3xl mx-auto pb-24">
      <section className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <SectionHead n="01" icon={Hash} title="Identificación" />
        <label className="field-label">Canal</label>
        <div className="mb-4 flex flex-wrap items-center gap-1 bg-slate-100 rounded-2xl p-1 w-fit">
          {CANALES.map((c) => (
            <button key={c.value} type="button" onClick={() => set({ canal: c.value, lookup: null, mode: 'idle' })}
              className={`px-4 py-1.5 rounded-xl text-xs font-black transition-colors ${f.canal === c.value ? 'bg-orange-500 text-white shadow' : 'text-slate-500 hover:text-orange-600 hover:bg-white'}`}>{c.label}</button>
          ))}
        </div>
        <label className="field-label">N° Nota de Venta</label>
        <div className="flex gap-2">
          <input type="text" value={f.nv} placeholder="Ej: 97125" className="field-input"
            onChange={(e) => { const v = e.target.value; set(!v.trim() ? { nv: v, mode: 'idle', lookup: null } : { nv: v }); }}
            onKeyDown={(e) => e.key === 'Enter' && buscar()} />
          <button onClick={buscar} disabled={lookupLoading || !f.nv.trim()} className="px-5 rounded-xl bg-slate-900 text-white text-sm font-black active:scale-95 disabled:opacity-40 flex items-center gap-1.5">
            {lookupLoading ? <Loader2 size={15} className="animate-spin" /> : <Search size={15} />} Buscar
          </button>
        </div>
        {f.lookup && (
          <div className="mt-4">
            <div className={`flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-[13px] font-bold ${f.lookup.found ? 'bg-blue-50 text-blue-700' : 'bg-emerald-50 text-emerald-700'}`}>
              <span>{f.lookup.found ? '✎' : '✨'}</span>
              {f.lookup.found ? <span>NV encontrada · <b>actualizar</b></span> : <span>NV nueva · <b>crear</b></span>}
            </div>
            {cells.length > 0 && (
              <div className="mt-2.5 grid grid-cols-2 gap-2">
                {cells.map((x) => (<div key={x.l} className="bg-slate-50 rounded-lg px-3 py-2"><div className="text-[10px] uppercase tracking-wide text-slate-400 font-black">{x.l}</div><div className="text-[13px] text-slate-700 font-bold truncate">{x.v}</div></div>))}
              </div>
            )}
          </div>
        )}
      </section>

      {f.mode === 'idle' && (
        <div className="bg-gradient-to-br from-orange-50 to-amber-50/50 border border-orange-100 rounded-2xl px-6 py-8 text-center">
          <div className="w-14 h-14 rounded-2xl bg-white border border-orange-100 flex items-center justify-center text-orange-500 mx-auto mb-3 shadow-sm"><Sparkles size={26} /></div>
          <p className="text-sm font-black text-slate-700">Busca una N.V. para comenzar</p>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">Escribe el número y presiona <b>Buscar</b>: si existe, la actualizas; si no, se crea.</p>
        </div>
      )}

      {f.canal === 'varios' && f.mode === 'create' && (
        <section className="bg-white rounded-2xl border border-orange-200 p-5 shadow-sm">
          <SectionHead n="02" icon={PackagePlus} title={`${f.variosTipo || 'Varios'} — Datos manuales`} />
          <label className="field-label">Tipo *</label>
          <div className="flex flex-wrap gap-2 mb-4">
            {VARIOS_TIPOS.map((t) => (<button key={t} type="button" onClick={() => set({ variosTipo: t })} className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${f.variosTipo === t ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-slate-600 border-slate-200 hover:border-orange-300'}`}>{t}</button>))}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2"><label className="field-label">Cliente *</label><input className="field-input" value={f.variosCliente} onChange={(e) => set({ variosCliente: e.target.value })} /></div>
            <div><label className="field-label">Vendedor *</label><input className="field-input" value={f.variosVendedor} onChange={(e) => set({ variosVendedor: e.target.value })} /></div>
            <div><label className="field-label">División</label><input className="field-input" value={f.variosDivision} onChange={(e) => set({ variosDivision: e.target.value })} /></div>
            <div><label className="field-label">Centro Costo</label><input className="field-input" value={f.variosCcosto} onChange={(e) => set({ variosCcosto: e.target.value })} /></div>
          </div>
        </section>
      )}

      {f.mode !== 'idle' && (
        <>
          <section className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <SectionHead n={f.canal === 'varios' ? '03' : '02'} icon={Truck} title="Logística" />
            <label className="field-label">Estado *</label>
            <div className="relative mb-5" ref={estadoRef}>
              <button type="button" onClick={() => { setEstadoOpen((v) => !v); setEstadoQuery(''); }} className="field-input flex items-center justify-between text-left">
                <span className="inline-flex items-center gap-2.5 min-w-0"><span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: colorFor(f.estado) }} /><span className="text-slate-800 font-bold truncate">{f.estado || 'Seleccionar estado'}</span></span>
                <span className={`text-slate-300 text-xs transition-transform ${estadoOpen ? 'rotate-180' : ''}`}>▼</span>
              </button>
              {estadoOpen && (
                <div className="absolute z-30 mt-2 w-full bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden">
                  <div className="p-2 border-b border-slate-100"><input autoFocus value={estadoQuery} onChange={(e) => setEstadoQuery(e.target.value)} placeholder="Buscar estado…" className="field-input py-2 text-sm" /></div>
                  <div className="max-h-60 overflow-y-auto py-1">
                    {estadoFiltered.map((c) => (<button key={c} type="button" onClick={() => { set({ estado: c }); setEstadoOpen(false); }} className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 text-left text-sm ${f.estado === c ? 'bg-orange-50' : 'hover:bg-slate-50'}`}><span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: colorFor(c) }} /><span className={f.estado === c ? 'font-black text-slate-900' : 'text-slate-700'}>{c}</span></button>))}
                  </div>
                </div>
              )}
            </div>
            <button type="button" onClick={() => set({ urgente: !f.urgente })} className={`w-full flex items-center justify-between gap-3 rounded-xl px-4 py-3.5 mb-3.5 border-2 ${f.urgente ? 'bg-red-50 border-red-400' : 'bg-slate-50 border-slate-200'}`}>
              <span className="flex items-center gap-2.5"><span className={`text-xl ${f.urgente ? 'scale-110' : 'opacity-40 grayscale'}`}>🚨</span><span className="flex flex-col items-start"><span className={`text-sm font-black ${f.urgente ? 'text-red-600' : 'text-slate-700'}`}>NV Urgente</span><span className="text-[11px] text-slate-400">Se destaca en el panel TV</span></span></span>
              <span className={`relative w-12 h-6 rounded-full shrink-0 ${f.urgente ? 'bg-red-500' : 'bg-slate-300'}`}><span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${f.urgente ? 'translate-x-6' : ''}`} /></span>
            </button>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div><label className="field-label">Tipo Despacho</label><select value={f.tipoDespacho} onChange={(e) => set({ tipoDespacho: e.target.value })} className="field-input"><option value="">— Seleccionar —</option>{TIPOS_DESPACHO.map((t) => <option key={t} value={t}>{t}</option>)}</select></div>
              <div><label className="field-label">Transportista</label><input className="field-input" value={f.transportista} onChange={(e) => set({ transportista: e.target.value })} /></div>
              <div><label className="field-label">Fecha Aprobación Real</label><input type="date" value={f.fechaAprobacionReal} onChange={(e) => set({ fechaAprobacionReal: e.target.value })} className="field-input" /></div>
              <div><label className="field-label">Fecha Facturación</label><input type="date" value={f.fechaFacturacion} onChange={(e) => set({ fechaFacturacion: e.target.value })} className="field-input" /></div>
              <div><label className="field-label">Fecha Despacho</label><input type="date" value={f.fechaDespacho} onChange={(e) => set({ fechaDespacho: e.target.value })} className="field-input" /></div>
            </div>
          </section>
          <details className="group bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <summary className="flex items-center justify-between px-5 py-4 cursor-pointer list-none select-none hover:bg-slate-50/60"><span className="flex items-center gap-2.5"><span className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 text-slate-500 flex items-center justify-center"><ClipboardList size={15} /></span><h2 className="text-[12px] font-black text-slate-600 uppercase tracking-wider">Datos adicionales <span className="text-slate-300 normal-case font-bold">· opcional</span></h2></span><span className="text-slate-300 text-xs transition-transform group-open:rotate-180">▼</span></summary>
            <div className="px-5 pb-5 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div><label className="field-label">Facturas</label><input className="field-input" value={f.factura} onChange={(e) => set({ factura: e.target.value })} /></div>
              <div><label className="field-label">Guía</label><input className="field-input" value={f.guia} onChange={(e) => set({ guia: e.target.value })} /></div>
              <div><label className="field-label">Bultos</label><input type="number" className="field-input" value={f.bultos} onChange={(e) => set({ bultos: e.target.value })} /></div>
              <div><label className="field-label">Valor Factura</label><input inputMode="numeric" className="field-input" value={f.valorFactura} onChange={(e) => set({ valorFactura: e.target.value.replace(/[^0-9.]/g, '') })} /></div>
              <div><label className="field-label">N° de Envío</label><input className="field-input" value={f.numeroEnvio} onChange={(e) => set({ numeroEnvio: e.target.value })} /></div>
            </div>
          </details>
        </>
      )}

      {f.mode !== 'idle' && (
        <div className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur border-t border-slate-200 px-4 py-3">
          <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
            <span className="text-xs text-slate-400">Canal <b className="text-slate-600 uppercase">{f.canal}</b> · N° <b className="text-slate-600">{f.nv || '—'}</b></span>
            <button onClick={onGuardar} disabled={saving} className="px-6 py-2.5 rounded-xl bg-orange-500 text-white font-black text-sm hover:bg-orange-600 disabled:opacity-50 flex items-center gap-2">{saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}{f.mode === 'update' ? 'Actualizar N.V.' : 'Crear N.V.'}</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Pestaña Consolidados ────────────────────────────────────────────────────
function TabConsolidados() {
  const [lista, setLista] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nueva, setNueva] = useState({ fecha_comprometida: '', observacion: '', nvs: [] });
  const [nvInput, setNvInput] = useState('');
  const [addLoading, setAddLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();

  const cargar = useCallback(() => { setLoading(true); listarConsolidados().then((r) => { setLista(r); setLoading(false); }).catch(() => setLoading(false)); }, []);
  useEffect(() => { cargar(); }, [cargar]);

  const agregarNv = async () => {
    const t = nvInput.trim(); if (!t) return;
    setAddLoading(true);
    const r = await buscarNvBasico(t);
    setAddLoading(false);
    if (!r) return toast.error(`N.V. ${t} no encontrada`);
    if (nueva.nvs.some((x) => x.nv === r.nv && x.canal === r.canal)) return toast.error('Ya está en la lista');
    setNueva((p) => ({ ...p, nvs: [...p.nvs, r] }));
    setNvInput('');
  };
  const guardarCons = async () => {
    if (nueva.nvs.length === 0) return toast.error('Agrega al menos una N.V.');
    setSaving(true);
    const res = await guardarConsolidado({ ...nueva, created_by: user?.nombre || null });
    setSaving(false);
    if (res.ok) { toast.success(`Consolidado ${res.ticket} creado`); setNueva({ fecha_comprometida: '', observacion: '', nvs: [] }); cargar(); }
    else toast.error(res.error || 'No se pudo guardar');
  };
  const borrar = async (c) => {
    if (!window.confirm(`¿Eliminar el consolidado ${c.ticket}?`)) return;
    const res = await eliminarConsolidado(c.id);
    if (res.ok) { toast.success('Consolidado eliminado'); cargar(); } else toast.error(res.error || 'Error');
  };

  return (
    <div className="space-y-4 max-w-3xl mx-auto">
      <section className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <SectionHead n="01" icon={Layers} title="Nuevo consolidado" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-3">
          <div><label className="field-label">Fecha comprometida</label><input type="date" className="field-input" value={nueva.fecha_comprometida} onChange={(e) => setNueva((p) => ({ ...p, fecha_comprometida: e.target.value }))} /></div>
          <div><label className="field-label">Observación</label><input className="field-input" value={nueva.observacion} onChange={(e) => setNueva((p) => ({ ...p, observacion: e.target.value }))} /></div>
        </div>
        <label className="field-label">Agregar N.V.</label>
        <div className="flex gap-2">
          <input value={nvInput} onChange={(e) => setNvInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && agregarNv()} placeholder="N° de N.V." className="field-input" />
          <button onClick={agregarNv} disabled={addLoading} className="px-4 rounded-xl bg-slate-900 text-white text-sm font-black flex items-center gap-1.5 disabled:opacity-40">{addLoading ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}</button>
        </div>
        {nueva.nvs.length > 0 && (
          <div className="mt-3 space-y-1.5">
            {nueva.nvs.map((n) => (
              <div key={`${n.canal}:${n.nv}`} className="flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-1.5 text-sm">
                <span className="font-bold text-slate-700">{n.nv}</span><span className="text-[11px] uppercase text-slate-400">{n.canal}</span>
                <span className="text-slate-500 truncate flex-1">{n.cliente || '—'}</span>
                <button onClick={() => setNueva((p) => ({ ...p, nvs: p.nvs.filter((x) => !(x.nv === n.nv && x.canal === n.canal)) }))} className="text-slate-400 hover:text-red-500"><X size={14} /></button>
              </div>
            ))}
          </div>
        )}
        <button onClick={guardarCons} disabled={saving} className="mt-4 w-full px-5 py-2.5 rounded-xl bg-orange-500 text-white font-black text-sm hover:bg-orange-600 disabled:opacity-50 flex items-center justify-center gap-2">{saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Crear consolidado</button>
      </section>

      <section>
        <h3 className="text-sm font-black text-slate-600 mb-2">Consolidados ({lista.length})</h3>
        {loading ? <div className="py-8 flex justify-center"><Loader2 className="animate-spin text-orange-500" size={24} /></div>
          : lista.length === 0 ? <p className="text-sm text-slate-400 text-center py-8">Sin consolidados.</p>
          : (
            <div className="space-y-2">
              {lista.map((c) => (
                <div key={c.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2"><span className="font-black text-slate-800">{c.ticket}</span><span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 font-bold">{c.estado}</span>{c.fecha_comprometida && <span className="text-xs text-slate-400">📅 {c.fecha_comprometida}</span>}</div>
                    <button onClick={() => borrar(c)} className="text-slate-300 hover:text-red-500"><Trash2 size={15} /></button>
                  </div>
                  {c.observacion && <p className="text-xs text-slate-500 mt-1">{c.observacion}</p>}
                  <div className="mt-2 flex flex-wrap gap-1.5">{c.nvs.map((n) => <span key={n.id} className="text-[11px] font-bold bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 text-slate-600">{n.nv}</span>)}</div>
                </div>
              ))}
            </div>
          )}
      </section>
    </div>
  );
}

// ── Módulo ───────────────────────────────────────────────────────────────────
export default function PanelIngresar() {
  const { hasPermission } = useAuth();
  const puedeEscribir = hasPermission('manage_panel');
  const [tab, setTab] = useState('buscar');
  const TABS = [
    { v: 'buscar', label: 'Buscar' },
    { v: 'ingresar', label: 'Ingresar' },
    ...(puedeEscribir ? [{ v: 'consolidados', label: 'Consolidados' }] : []),
  ];

  return (
    <div className="anim-fade-up space-y-4">
      <div className="flex items-center gap-1 bg-slate-100 rounded-2xl p-1 w-fit">
        {TABS.map((t) => (
          <button key={t.v} onClick={() => setTab(t.v)}
            className={`px-4 py-1.5 rounded-xl text-sm font-black transition-colors ${tab === t.v ? 'bg-white text-orange-600 shadow' : 'text-slate-500 hover:text-orange-600'}`}>{t.label}</button>
        ))}
      </div>
      {tab === 'buscar' && <TabBuscar puedeEscribir={puedeEscribir} />}
      {tab === 'ingresar' && <TabIngresar />}
      {tab === 'consolidados' && puedeEscribir && <TabConsolidados />}
    </div>
  );
}
