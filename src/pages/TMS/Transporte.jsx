import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { Truck, RefreshCw, Plus, X, MapPin, PackageCheck, AlertTriangle, Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  ESTADOS, ESTADO_META, SIGUIENTE, TIPOS_INCIDENCIA,
  listarOrdenes, listarVehiculos, listarConductores, listarIncidencias,
  crearOrdenDesdeNV, asignarOrden, transicionOrden, crearIncidencia, resolverIncidencia,
} from '../../services/tmsService';
import PodCapture from './PodCapture';

const fmt = (ts) => { if (!ts) return '—'; const d = new Date(ts); return isNaN(d) ? '—' : d.toLocaleString('es-CL', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }); };

function EstadoChip({ id, small }) {
  const m = ESTADO_META[id] || { label: id, color: '#64748b', bg: '#f1f5f9', text: '#475569' };
  return <span className={`inline-flex items-center gap-1.5 rounded-full font-bold ${small ? 'text-[10px] px-2 py-0.5' : 'text-[11px] px-2.5 py-1'}`} style={{ background: m.bg, color: m.text }}><span className="w-2 h-2 rounded-full" style={{ background: m.color }} />{m.label}</span>;
}

export default function Transporte() {
  const { user, hasPermission } = useAuth();
  const puede = hasPermission('manage_tms') || hasPermission('manage_panel') || user?.rol === 'ADMIN' || user?.es_admin_delegado;

  const [ordenes, setOrdenes] = useState([]);
  const [vehiculos, setVehiculos] = useState([]);
  const [conductores, setConductores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('todos');
  const [q, setQ] = useState('');
  const [sel, setSel] = useState(null);
  const [nueva, setNueva] = useState(false);

  const cargar = useCallback(() => {
    setLoading(true);
    listarOrdenes().then((r) => { setOrdenes(r); setLoading(false); }).catch(() => { setOrdenes([]); setLoading(false); });
  }, []);
  useEffect(() => { cargar(); listarVehiculos().then(setVehiculos); listarConductores().then(setConductores); }, [cargar]);

  const resumen = useMemo(() => { const m = {}; ordenes.forEach((o) => { m[o.estado] = (m[o.estado] || 0) + 1; }); return m; }, [ordenes]);
  const term = q.trim().toLowerCase();
  const visibles = useMemo(() => ordenes.filter((o) => (filtro === 'todos' || o.estado === filtro)
    && (!term || [o.folio, o.nv, o.cliente].filter(Boolean).some((v) => String(v).toLowerCase().includes(term)))), [ordenes, filtro, term]);

  const onUpd = () => { cargar(); };

  return (
    <div className="anim-fade-up space-y-5 max-w-6xl mx-auto pb-16">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2"><Truck className="text-orange-500" /> TMS · Torre de Control</h1>
          <p className="text-sm text-slate-500 mt-0.5">Órdenes de transporte propio · asignación, ruta y prueba de entrega</p>
        </div>
        <div className="flex items-center gap-2">
          {puede && <button onClick={() => setNueva(true)} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-orange-500 text-white text-sm font-bold hover:bg-orange-600"><Plus size={16} /> Nueva orden</button>}
          <button onClick={cargar} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50"><RefreshCw size={15} /> Actualizar</button>
        </div>
      </div>

      {/* KPIs por estado */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2.5">
        {ESTADOS.filter((e) => e.id !== 'cancelado').map((e) => (
          <button key={e.id} onClick={() => setFiltro(filtro === e.id ? 'todos' : e.id)}
            className={`rounded-2xl border p-3 text-left transition-all ${filtro === e.id ? 'ring-2 ring-orange-300' : ''}`} style={{ background: e.bg, borderColor: `${e.color}33` }}>
            <div className="text-xl font-black" style={{ color: e.text }}>{resumen[e.id] || 0}</div>
            <div className="text-[10px] font-bold leading-tight" style={{ color: e.text }}>{e.label}</div>
          </button>
        ))}
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar folio, N.V. o cliente…" className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-orange-400 bg-white" />
      </div>

      {loading ? (
        <div className="py-16 text-center text-slate-400">Cargando órdenes…</div>
      ) : visibles.length === 0 ? (
        <div className="py-16 text-center text-slate-400 text-sm">{ordenes.length === 0 ? 'Aún no hay órdenes de transporte. Crea una desde una N.V.' : 'Sin órdenes para este filtro.'}</div>
      ) : (
        <div className="space-y-2">
          {visibles.map((o) => (
            <button key={o.id} onClick={() => setSel(o)} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-slate-200 bg-white hover:border-orange-300 text-left transition-all">
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2 flex-wrap"><span className="text-[14px] font-black text-slate-800">{o.folio || `#${o.id}`}</span><span className="text-[11px] font-mono text-slate-400">N.V. {o.nv || '—'}</span></span>
                <span className="block text-[12px] text-slate-500 truncate mt-0.5">{o.cliente || '—'}{o.vehiculo?.patente ? ` · 🚚 ${o.vehiculo.patente}` : ''}</span>
              </span>
              <EstadoChip id={o.estado} />
            </button>
          ))}
        </div>
      )}

      {sel && <OrdenDrawer orden={sel} puede={puede} vehiculos={vehiculos} conductores={conductores} onClose={() => setSel(null)} onUpd={onUpd} />}
      {nueva && <NuevaOrdenModal onClose={() => setNueva(false)} onCreada={() => { setNueva(false); cargar(); }} />}
    </div>
  );
}

function NuevaOrdenModal({ onClose, onCreada }) {
  const [nv, setNv] = useState(''); const [busy, setBusy] = useState(false);
  const crear = async () => {
    setBusy(true); const res = await crearOrdenDesdeNV(nv); setBusy(false);
    if (res.ok) { toast.success(res.existia ? `Ya existía la orden ${res.folio}` : `Orden ${res.folio} creada`); onCreada(); }
    else toast.error(res.error || 'No se pudo crear');
  };
  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
      <div onClick={(e) => e.stopPropagation()} className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl p-5">
        <div className="flex items-center justify-between mb-3"><h3 className="text-[15px] font-black text-slate-800">Nueva orden de transporte</h3><button onClick={onClose} className="text-slate-400"><X size={18} /></button></div>
        <p className="text-[13px] text-slate-500 mb-3">Ingresa el N° de la N.V. (con Transporte Propio) para crear su orden.</p>
        <input autoFocus value={nv} onChange={(e) => setNv(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && crear()} placeholder="N° de N.V." className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-orange-400 mb-3" />
        <button onClick={crear} disabled={busy || !nv.trim()} className="w-full py-2.5 rounded-xl bg-orange-500 text-white text-sm font-bold hover:bg-orange-600 disabled:opacity-50">{busy ? 'Creando…' : 'Crear orden'}</button>
      </div>
    </div>
  );
}

function OrdenDrawer({ orden, puede, vehiculos, conductores, onClose, onUpd }) {
  const [o, setO] = useState(orden);
  const [incidencias, setIncidencias] = useState([]);
  const [asig, setAsig] = useState({ vehiculo_id: orden.vehiculo_id || '', conductor_id: orden.conductor_id || '', fecha_programada: orden.fecha_programada || '', hora_programada: orden.hora_programada || '' });
  const [inc, setInc] = useState({ tipo: TIPOS_INCIDENCIA[0], detalle: '' });
  const [busy, setBusy] = useState(false);

  const recargarInc = useCallback(() => { listarIncidencias(orden.id).then(setIncidencias); }, [orden.id]);
  useEffect(() => { recargarInc(); }, [recargarInc]);

  const refrescar = (nuevoEstado) => { setO((p) => ({ ...p, estado: nuevoEstado })); onUpd(); };
  const run = async (fn, okMsg) => { setBusy(true); const res = await fn(); setBusy(false); if (res.ok) { toast.success(okMsg); return res; } toast.error(res.error || 'Error'); return null; };

  const onAsignar = async () => { const r = await run(() => asignarOrden(o.id, asig), 'Asignado'); if (r) refrescar(r.estado); };
  const onAvanzar = async (to) => { const r = await run(() => transicionOrden(o.id, to), 'Estado actualizado'); if (r) refrescar(r.estado); };
  const onIncidencia = async () => { const r = await run(() => crearIncidencia(o.id, inc.tipo, inc.detalle), 'Incidencia registrada'); if (r) { setInc({ tipo: TIPOS_INCIDENCIA[0], detalle: '' }); recargarInc(); } };
  const onResolver = async (id, resol) => { const r = await run(() => resolverIncidencia(id, resol), 'Incidencia resuelta'); if (r) { recargarInc(); if (resol.startsWith('Reprog')) refrescar('programado'); } };

  const sig = SIGUIENTE[o.estado];
  const vehLabel = vehiculos.find((v) => v.id === Number(asig.vehiculo_id));

  return (
    <div className="fixed inset-0 z-[120] flex justify-end" onClick={onClose}>
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
      <div onClick={(e) => e.stopPropagation()} className="relative w-full max-w-md bg-white h-full flex flex-col shadow-2xl anim-fade-up">
        <div className="shrink-0 bg-white border-b border-slate-200 px-5 py-4 flex items-center justify-between">
          <div><div className="flex items-center gap-2"><span className="text-[16px] font-black text-slate-900">{o.folio || `#${o.id}`}</span><span className="text-[11px] font-mono text-slate-400">N.V. {o.nv || '—'}</span></div><div className="mt-1"><EstadoChip id={o.estado} /></div></div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400"><X size={18} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <section className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
            <div className="grid grid-cols-2 gap-2.5 text-[13px]">
              <div><div className="text-[10px] uppercase text-slate-400 font-bold">Cliente</div>{o.cliente || '—'}</div>
              <div><div className="text-[10px] uppercase text-slate-400 font-bold">Vehículo</div>{o.vehiculo?.patente || (vehLabel ? vehLabel.patente : '—')}</div>
              <div><div className="text-[10px] uppercase text-slate-400 font-bold">Programada</div>{o.fecha_programada || '—'} {o.hora_programada || ''}</div>
              <div><div className="text-[10px] uppercase text-slate-400 font-bold">En Ruta</div>{fmt(o.fecha_en_ruta)}</div>
            </div>
          </section>

          {!puede ? (
            <div className="text-xs text-slate-400 bg-slate-50 rounded-xl px-4 py-3">Solo lectura · necesitas <b>manage_tms</b> para gestionar.</div>
          ) : (
            <>
              {/* Asignación (pendiente) */}
              {o.estado === 'pendiente_asignacion' && (
                <section className="bg-white rounded-2xl border-l-4 border-l-orange-400 border border-slate-200 p-4">
                  <h3 className="text-[11px] font-black text-slate-500 uppercase mb-3">Asignar vehículo y chofer</h3>
                  <div className="grid grid-cols-1 gap-2.5">
                    <label className="text-[11px] font-bold text-slate-500">Vehículo<select value={asig.vehiculo_id} onChange={(e) => setAsig({ ...asig, vehiculo_id: e.target.value })} className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"><option value="">—</option>{vehiculos.map((v) => <option key={v.id} value={v.id}>{v.patente} · {v.tipo}</option>)}</select></label>
                    <label className="text-[11px] font-bold text-slate-500">Chofer<select value={asig.conductor_id} onChange={(e) => setAsig({ ...asig, conductor_id: e.target.value })} className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"><option value="">—</option>{conductores.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}</select></label>
                    <div className="grid grid-cols-2 gap-2">
                      <label className="text-[11px] font-bold text-slate-500">Fecha<input type="date" value={asig.fecha_programada} onChange={(e) => setAsig({ ...asig, fecha_programada: e.target.value })} className="mt-1 w-full border border-slate-200 rounded-lg px-2 py-2 text-sm" /></label>
                      <label className="text-[11px] font-bold text-slate-500">Hora<input type="time" value={asig.hora_programada} onChange={(e) => setAsig({ ...asig, hora_programada: e.target.value })} className="mt-1 w-full border border-slate-200 rounded-lg px-2 py-2 text-sm" /></label>
                    </div>
                    <button onClick={onAsignar} disabled={busy} className="mt-1 py-2.5 rounded-xl bg-orange-500 text-white text-sm font-bold hover:bg-orange-600 disabled:opacity-50">Asignar y programar</button>
                  </div>
                </section>
              )}

              {/* Avanzar estado */}
              {sig && (
                <button onClick={() => onAvanzar(sig.to)} disabled={busy} className="w-full py-3 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 disabled:opacity-50 inline-flex items-center justify-center gap-2"><Truck size={16} /> {sig.label}</button>
              )}

              {/* POD (en ruta) — foto + firma + GPS */}
              {o.estado === 'en_ruta' && (
                <section className="bg-white rounded-2xl border-l-4 border-l-emerald-400 border border-slate-200 p-4">
                  <h3 className="text-[11px] font-black text-slate-500 uppercase mb-3 flex items-center gap-1.5"><PackageCheck size={14} className="text-emerald-500" /> Prueba de entrega (POD)</h3>
                  <PodCapture ordenId={o.id} onDone={() => refrescar('entregado')} />
                </section>
              )}

              {/* Incidencias */}
              {['despachado', 'en_ruta', 'programado'].includes(o.estado) && (
                <section className="bg-white rounded-2xl border border-slate-200 p-4">
                  <h3 className="text-[11px] font-black text-slate-500 uppercase mb-3 flex items-center gap-1.5"><AlertTriangle size={14} className="text-amber-500" /> Registrar incidencia</h3>
                  <div className="flex gap-2 mb-2"><select value={inc.tipo} onChange={(e) => setInc({ ...inc, tipo: e.target.value })} className="border border-slate-200 rounded-lg px-2 py-2 text-sm">{TIPOS_INCIDENCIA.map((t) => <option key={t}>{t}</option>)}</select><input value={inc.detalle} onChange={(e) => setInc({ ...inc, detalle: e.target.value })} placeholder="Detalle (opcional)" className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm" /></div>
                  <button onClick={onIncidencia} disabled={busy} className="w-full py-2 rounded-lg border border-amber-300 text-amber-700 text-sm font-bold hover:bg-amber-50 disabled:opacity-50">Registrar</button>
                </section>
              )}

              {o.estado !== 'cerrado' && o.estado !== 'cancelado' && o.estado !== 'entregado' && (
                <button onClick={() => onAvanzar('cancelado')} disabled={busy} className="w-full py-2 rounded-xl border border-red-200 text-red-600 text-sm font-semibold hover:bg-red-50">Cancelar orden</button>
              )}
            </>
          )}

          {/* Lista de incidencias */}
          {incidencias.length > 0 && (
            <section>
              <h3 className="text-[11px] font-black text-slate-500 uppercase mb-2">Incidencias</h3>
              <div className="space-y-1.5">
                {incidencias.map((i) => (
                  <div key={i.id} className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-[12px]">
                    <div className="flex items-center justify-between"><span className="font-bold text-slate-700">{i.tipo}</span><span className={`text-[10px] font-black ${i.estado === 'abierta' ? 'text-amber-600' : 'text-emerald-600'}`}>{i.estado}</span></div>
                    {i.detalle && <div className="text-slate-500">{i.detalle}</div>}
                    {puede && i.estado === 'abierta' && (
                      <div className="flex gap-2 mt-1.5"><button onClick={() => onResolver(i.id, 'Reprogramar')} className="text-[11px] font-bold text-blue-600">↻ Reprogramar</button><button onClick={() => onResolver(i.id, 'Resuelta')} className="text-[11px] font-bold text-emerald-600">✓ Resolver</button></div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
