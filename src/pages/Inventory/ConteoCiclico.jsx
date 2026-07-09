import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import {
  RotateCcw, Plus, Lock, Unlock, Download, Search, Package, Boxes,
  ClipboardCheck, Layers, Calculator, X, Trash2, QrCode, ExternalLink,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';
import { exportToExcel } from '../../lib/exportExcel';
import {
  useSesionesConteo, useCrearSesion, useCerrarSesion,
  useConciliacion, useAjusteErp, resumenAnalisis,
  useBloques, useBloque, useCrearBloque, useEditarBloque,
  useAgregarBloqueItem, useEliminarBloqueItem, useRegistrarAuditoria,
  useProyecciones, useGuardarProyeccion, useEliminarProyeccion,
  estadoConteoMeta,
} from '../../services/conteoService';

const money = (v) => (Number(v) || 0).toLocaleString('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 });
const n = (v) => (Number(v) || 0).toLocaleString('es-CL');
const chip = (estado) => {
  const map = {
    CUADRADO: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    FALTA: 'bg-rose-100 text-rose-700 border-rose-200',
    SOBRA: 'bg-amber-100 text-amber-700 border-amber-200',
    NO_CONTADO: 'bg-slate-100 text-slate-500 border-slate-200',
    PARTIDA_NUEVA: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  };
  return map[estado] || 'bg-slate-100 text-slate-600 border-slate-200';
};

const TABS = [
  { id: 'sesiones', label: 'Sesiones', icon: Layers },
  { id: 'conciliacion', label: 'Conciliación', icon: ClipboardCheck },
  { id: 'ajuste', label: 'Ajuste ERP', icon: Download },
  { id: 'bloques', label: 'Bloques / QR', icon: Boxes },
  { id: 'proyeccion', label: 'Proyección', icon: Calculator },
];

export default function ConteoCiclico() {
  const { user } = useAuth();
  const [tab, setTab] = useState('sesiones');
  const [sesionId, setSesionId] = useState('');
  const { data: sesiones = [] } = useSesionesConteo();
  const isAdmin = user?.rol === 'ADMIN' || user?.es_admin_delegado;

  return (
    <div className="min-h-screen bg-slate-50 p-3 sm:p-6 space-y-4 sm:space-y-6 text-slate-700">
      {/* Header */}
      <div className="relative overflow-hidden bg-white rounded-2xl sm:rounded-[2rem] border border-slate-200 shadow-sm px-5 sm:px-7 py-4 sm:py-5 flex flex-wrap items-center justify-between gap-4">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-orange-500 via-amber-400 to-orange-500" />
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-orange-50 border border-orange-100 rounded-2xl flex items-center justify-center text-orange-600 shrink-0">
            <RotateCcw size={22} />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight">Conteo <span className="text-orange-600">Cíclico</span></h1>
            <p className="text-xs sm:text-sm text-slate-500">Conteos físicos, conciliación y ajuste para el ERP · reusa el stock de CCO</p>
          </div>
        </div>
        <select value={sesionId} onChange={(e) => setSesionId(e.target.value)}
          className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 bg-white">
          <option value="">Todas las sesiones</option>
          {sesiones.map((s) => <option key={s.id} value={s.id}>{s.nombre}{s.estado !== 'abierta' ? ' (cerrada)' : ''}</option>)}
        </select>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setTab(id)}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-black border flex items-center gap-1.5 transition-colors ${tab === id ? 'bg-orange-600 text-white border-orange-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}>
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      {tab === 'sesiones' && <TabSesiones sesiones={sesiones} isAdmin={isAdmin} onOpen={(id) => { setSesionId(id); setTab('conciliacion'); }} />}
      {tab === 'conciliacion' && <TabConciliacion sesionId={sesionId} isAdmin={isAdmin} />}
      {tab === 'ajuste' && <TabAjuste sesionId={sesionId} />}
      {tab === 'bloques' && <TabBloques />}
      {tab === 'proyeccion' && <TabProyeccion />}
    </div>
  );
}

// ─── Sesiones ────────────────────────────────────────────────────────────────
function TabSesiones({ sesiones, isAdmin, onOpen }) {
  const crear = useCrearSesion();
  const cerrar = useCerrarSesion();
  const nueva = async () => {
    const nombre = (window.prompt('Nombre de la sesión de conteo:') || '').trim();
    if (!nombre) return;
    try { await crear.mutateAsync({ nombre }); toast.success('Sesión creada'); }
    catch (e) { toast.error(e.message); }
  };
  const toggle = async (s) => {
    try { await cerrar.mutateAsync({ id: s.id, reabrir: s.estado !== 'abierta' }); toast.success(s.estado === 'abierta' ? 'Sesión cerrada' : 'Sesión reabierta'); }
    catch (e) { toast.error(e.message); }
  };
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-black text-slate-900 flex items-center gap-2"><Layers size={18} className="text-orange-500" /> Sesiones de conteo</h2>
        <button onClick={nueva} className="px-4 py-2 rounded-xl bg-orange-600 text-white text-sm font-black flex items-center gap-1.5 hover:bg-orange-700"><Plus size={15} /> Nueva</button>
      </div>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {sesiones.length === 0 && <div className="text-slate-400 text-sm col-span-full">No hay sesiones todavía.</div>}
        {sesiones.map((s) => (
          <div key={s.id} className={`rounded-2xl border p-4 flex flex-col gap-2 ${s.estado === 'abierta' ? 'border-orange-200 bg-orange-50/40' : 'border-slate-200 bg-slate-50'}`}>
            <div className="flex items-center justify-between gap-2">
              <span className="font-black text-slate-900 truncate">{s.nombre}</span>
              <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${s.estado === 'abierta' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-slate-200 text-slate-500 border-slate-300'}`}>{s.estado}</span>
            </div>
            <div className="text-[11px] text-slate-500">{s.creado_por_nombre || '—'}{s.semana ? ` · semana ${s.semana}` : ''}</div>
            <div className="flex gap-2 mt-1">
              <button onClick={() => onOpen(s.id)} className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-xs font-black hover:bg-white flex items-center justify-center gap-1"><ClipboardCheck size={13} /> Reportes</button>
              {isAdmin && (
                <button onClick={() => toggle(s)} className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-xs font-black hover:bg-white flex items-center gap-1">
                  {s.estado === 'abierta' ? <><Lock size={13} /> Cerrar</> : <><Unlock size={13} /> Reabrir</>}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Conciliación ────────────────────────────────────────────────────────────
function TabConciliacion({ sesionId }) {
  const { data: rows = [], isLoading } = useConciliacion(sesionId);
  const r = resumenAnalisis(rows);
  const exportar = () => exportToExcel({
    filename: 'conciliacion_conteo',
    sheets: [{ name: 'Conciliación', rows: rows.map((x) => ({
      SKU: x.codigo_producto, Descripción: x.descripcion, UM: x.unidad_medida,
      Contado: x.contado, Sistema: x.sistema, Diferencia: x.diferencia,
      'Costo unit.': x.costo_unitario, 'Impacto ($)': x.impacto, Estado: x.estado,
    })) }],
  });
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Kpi label="SKUs contados" value={n(r.total)} />
        <Kpi label="Exactitud" value={`${r.exactitud}%`} tone={r.exactitud >= 95 ? 'good' : 'warn'} />
        <Kpi label="Impacto neto" value={money(r.impacto)} tone={r.impacto < 0 ? 'bad' : 'good'} />
        <Kpi label="Faltante valorizado" value={money(r.faltante)} tone="bad" />
      </div>
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-4">
          <h2 className="font-black text-slate-900 flex items-center gap-2"><ClipboardCheck size={18} className="text-orange-500" /> Conciliación</h2>
          <button onClick={exportar} disabled={!rows.length} className="px-3 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-black flex items-center gap-1.5 hover:bg-slate-50 disabled:opacity-40"><Download size={14} /> Excel</button>
        </div>
        <TablaReporte isLoading={isLoading} rows={rows} cols={[
          ['codigo_producto', 'SKU', 'mono'], ['descripcion', 'Descripción'], ['contado', 'Contado', 'num'],
          ['sistema', 'Sistema', 'num'], ['diferencia', 'Dif.', 'dif'], ['impacto', 'Impacto', 'money'], ['estado', 'Estado', 'estado'],
        ]} />
      </div>
    </div>
  );
}

// ─── Ajuste ERP ──────────────────────────────────────────────────────────────
function TabAjuste({ sesionId }) {
  const { data: rows = [], isLoading } = useAjusteErp(sesionId);
  const exportar = () => exportToExcel({
    filename: 'ajuste_erp',
    sheets: [{ name: 'Ajuste ERP', rows: rows.map((x) => ({
      SKU: x.codigo_producto, Descripción: x.descripcion, Partida: x.partida,
      Contado: x.contado, Sistema: x.sistema, Ajuste: x.diferencia, 'Impacto ($)': x.impacto, Estado: x.estado,
    })) }],
  });
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between p-4">
        <h2 className="font-black text-slate-900 flex items-center gap-2"><Download size={18} className="text-orange-500" /> Ajuste para el ERP (por SKU + partida)</h2>
        <button onClick={exportar} disabled={!rows.length} className="px-3 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-black flex items-center gap-1.5 hover:bg-slate-50 disabled:opacity-40"><Download size={14} /> Excel</button>
      </div>
      <TablaReporte isLoading={isLoading} rows={rows} cols={[
        ['codigo_producto', 'SKU', 'mono'], ['descripcion', 'Descripción'], ['partida', 'Partida', 'mono'],
        ['contado', 'Contado', 'num'], ['sistema', 'Sistema', 'num'], ['diferencia', 'Ajuste', 'dif'], ['estado', 'Estado', 'estado'],
      ]} />
    </div>
  );
}

// ─── Bloques + QR ────────────────────────────────────────────────────────────
function TabBloques() {
  const [q, setQ] = useState('');
  const [abierto, setAbierto] = useState(null); // codigo del bloque abierto
  const { data: bloques = [], isLoading } = useBloques(q);
  const crear = useCrearBloque();
  const nuevo = async () => {
    const bodega = (window.prompt('Bodega del bloque:') || '').trim();
    if (!bodega) return;
    const nombre = (window.prompt('Nombre/descripción del bloque (opcional):') || '').trim();
    try { const b = await crear.mutateAsync({ bodega, nombre }); toast.success(`Bloque ${b.codigo} creado`); setAbierto(b.codigo); }
    catch (e) { toast.error(e.message); }
  };
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6">
      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
        <h2 className="font-black text-slate-900 flex items-center gap-2"><Boxes size={18} className="text-orange-500" /> Bloques / pallets</h2>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-2.5 text-slate-400" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar código/bodega…" className="pl-8 pr-3 py-2 rounded-xl border border-slate-200 text-sm w-48" />
          </div>
          <button onClick={nuevo} className="px-4 py-2 rounded-xl bg-orange-600 text-white text-sm font-black flex items-center gap-1.5 hover:bg-orange-700"><Plus size={15} /> Nuevo</button>
        </div>
      </div>
      {isLoading && <div className="text-slate-400 text-sm">Cargando…</div>}
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {bloques.map((b) => (
          <button key={b.id} onClick={() => setAbierto(b.codigo)} className="text-left rounded-2xl border border-slate-200 p-4 hover:border-orange-300 hover:bg-orange-50/30 transition-colors">
            <div className="flex items-center justify-between">
              <span className="font-mono font-black text-slate-800 text-sm">{b.codigo}</span>
              <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${b.estado === 'activo' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-slate-200 text-slate-500 border-slate-300'}`}>{b.estado}</span>
            </div>
            <div className="text-xs text-slate-500 mt-1 truncate">{b.bodega}{b.nombre ? ` · ${b.nombre}` : ''}</div>
          </button>
        ))}
        {!isLoading && bloques.length === 0 && <div className="text-slate-400 text-sm col-span-full">Sin bloques.</div>}
      </div>
      {abierto && <BloqueModal codigo={abierto} onClose={() => setAbierto(null)} />}
    </div>
  );
}

function BloqueModal({ codigo, onClose }) {
  const { data: b, isLoading } = useBloque(codigo);
  const agregar = useAgregarBloqueItem();
  const elimItem = useEliminarBloqueItem();
  const editar = useEditarBloque();
  const auditar = useRegistrarAuditoria();
  const [form, setForm] = useState({ codigo: '', cantidad: '', partida: '', serie: '' });
  const [qr, setQr] = useState('');

  useEffect(() => {
    const url = `${window.location.origin}/inventory/bloque/${codigo}`;
    QRCode.toDataURL(url, { width: 220, margin: 1 }).then(setQr).catch(() => setQr(''));
  }, [codigo]);

  const add = async () => {
    if (!form.codigo || form.cantidad === '') { toast.error('SKU y cantidad'); return; }
    try {
      await agregar.mutateAsync({ bloqueId: b.id, codigoBloque: codigo, codigo: form.codigo.toUpperCase(), cantidad: Number(form.cantidad), partida: form.partida, serie: form.serie });
      setForm({ codigo: '', cantidad: '', partida: '', serie: '' }); toast.success('Ítem agregado');
    } catch (e) { toast.error(e.message); }
  };
  const auditarBloque = async () => {
    // Auditoría: valida las cantidades esperadas (esperada = lo asignado; contada = prompt).
    const items = [];
    for (const it of (b.items || [])) {
      const c = window.prompt(`Contado para ${it.codigo_producto}${it.partida ? ' / ' + it.partida : ''} (esperado ${it.cantidad}):`, String(it.cantidad));
      if (c === null) return;
      items.push({ codigo_producto: it.codigo_producto, descripcion: it.descripcion, unidad_medida: it.unidad_medida, partida: it.partida, serie: it.serie, esperada: Number(it.cantidad) || 0, contada: Number(c) || 0 });
    }
    try { const a = await auditar.mutateAsync({ bloqueId: b.id, codigoBloque: codigo, items }); toast[a.estado === 'cuadrado' ? 'success' : 'info'](`Auditoría ${a.estado} (${a.items_dif} con diferencia)`); }
    catch (e) { toast.error(e.message); }
  };
  const cerrarBloque = async () => {
    try { await editar.mutateAsync({ id: b.id, estado: b.estado === 'activo' ? 'cerrado' : 'activo' }); }
    catch (e) { toast.error(e.message); }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <span className="font-mono font-black text-slate-900">{codigo}</span>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700"><X size={20} /></button>
        </div>
        {isLoading || !b ? <div className="p-6 text-slate-400">Cargando…</div> : (
          <div className="p-4 space-y-4">
            <div className="flex flex-wrap gap-4 items-center">
              {qr && <img src={qr} alt="QR" className="w-32 h-32 rounded-lg border border-slate-200" />}
              <div className="text-sm space-y-1">
                <div><b>Bodega:</b> {b.bodega}</div>
                <div><b>Estado:</b> {b.estado}</div>
                <a href={`/inventory/bloque/${codigo}`} target="_blank" rel="noopener noreferrer" className="text-orange-600 font-bold flex items-center gap-1 text-xs"><ExternalLink size={12} /> Abrir página del bloque</a>
                <div className="flex gap-2 pt-1">
                  <button onClick={cerrarBloque} className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-black hover:bg-slate-50">{b.estado === 'activo' ? 'Cerrar bloque' : 'Reabrir'}</button>
                  <button onClick={auditarBloque} disabled={!b.items?.length} className="px-3 py-1.5 rounded-lg bg-orange-600 text-white text-xs font-black disabled:opacity-40 flex items-center gap-1"><ClipboardCheck size={13} /> Auditar</button>
                </div>
              </div>
            </div>

            {b.estado === 'activo' && (
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 items-end bg-slate-50 rounded-xl p-3">
                <input value={form.codigo} onChange={(e) => setForm({ ...form, codigo: e.target.value })} placeholder="SKU" className="px-2 py-1.5 rounded-lg border border-slate-200 text-sm col-span-2" />
                <input value={form.partida} onChange={(e) => setForm({ ...form, partida: e.target.value })} placeholder="Partida" className="px-2 py-1.5 rounded-lg border border-slate-200 text-sm" />
                <input value={form.cantidad} onChange={(e) => setForm({ ...form, cantidad: e.target.value })} type="number" placeholder="Cant." className="px-2 py-1.5 rounded-lg border border-slate-200 text-sm" />
                <button onClick={add} className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-sm font-black">+ Ítem</button>
              </div>
            )}

            <div className="border border-slate-100 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-[10px] uppercase text-slate-400"><tr><th className="text-left px-3 py-2">SKU</th><th className="text-left px-3 py-2">Partida</th><th className="text-right px-3 py-2">Cant.</th><th></th></tr></thead>
                <tbody>
                  {(b.items || []).map((it) => (
                    <tr key={it.id} className="border-t border-slate-50">
                      <td className="px-3 py-2 font-mono text-xs">{it.codigo_producto}</td>
                      <td className="px-3 py-2 text-xs text-slate-500">{it.partida || '—'}</td>
                      <td className="px-3 py-2 text-right font-bold">{n(it.cantidad)}</td>
                      <td className="px-3 py-2 text-right">{b.estado === 'activo' && <button onClick={() => elimItem.mutate({ id: it.id, codigoBloque: codigo })} className="text-slate-400 hover:text-rose-500"><Trash2 size={13} /></button>}</td>
                    </tr>
                  ))}
                  {(b.items || []).length === 0 && <tr><td colSpan={4} className="px-3 py-4 text-slate-400 text-center text-xs">Sin ítems.</td></tr>}
                </tbody>
              </table>
            </div>

            {(b.auditorias || []).length > 0 && (
              <div className="text-xs text-slate-500">
                <div className="font-black text-slate-600 mb-1">Auditorías</div>
                {b.auditorias.map((a) => (
                  <div key={a.id} className="flex items-center gap-2 py-0.5">
                    <span className={`px-2 py-0.5 rounded-full border text-[10px] font-black ${a.estado === 'cuadrado' ? chip('CUADRADO') : chip('FALTA')}`}>{a.estado}</span>
                    <span>{a.auditor_nombre} · {a.items_ok}/{a.items_total} OK · esperado {n(a.esperado_total)} / contado {n(a.contado_total)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Proyección de palletizado ───────────────────────────────────────────────
function TabProyeccion() {
  const { data: rows = [] } = useProyecciones();
  const guardar = useGuardarProyeccion();
  const eliminar = useEliminarProyeccion();
  const [f, setF] = useState({ prod: '', cantOc: '', cantXBx: '', pie: '', altura: '' });
  const add = async () => {
    if (!f.prod) { toast.error('Producto'); return; }
    try { await guardar.mutateAsync({ prod: f.prod, cantOc: Number(f.cantOc) || 0, cantXBx: Number(f.cantXBx) || 0, pie: Number(f.pie) || 0, altura: Number(f.altura) || 0 }); setF({ prod: '', cantOc: '', cantXBx: '', pie: '', altura: '' }); }
    catch (e) { toast.error(e.message); }
  };
  const cajas = (r) => r.cant_bx > 0 ? r.cant_bx : (r.cant_x_bx > 0 ? Math.ceil((r.cant_oc || 0) / r.cant_x_bx) : 0);
  const pallets = (r) => r.pie > 0 ? Math.ceil(cajas(r) / r.pie) : 0;
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6 space-y-4">
      <h2 className="font-black text-slate-900 flex items-center gap-2"><Calculator size={18} className="text-orange-500" /> Proyección de palletizado</h2>
      <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 items-end bg-slate-50 rounded-xl p-3">
        <input value={f.prod} onChange={(e) => setF({ ...f, prod: e.target.value })} placeholder="Producto" className="px-2 py-1.5 rounded-lg border border-slate-200 text-sm col-span-2" />
        <input value={f.cantOc} onChange={(e) => setF({ ...f, cantOc: e.target.value })} type="number" placeholder="Cant. OC" className="px-2 py-1.5 rounded-lg border border-slate-200 text-sm" />
        <input value={f.cantXBx} onChange={(e) => setF({ ...f, cantXBx: e.target.value })} type="number" placeholder="U x caja" className="px-2 py-1.5 rounded-lg border border-slate-200 text-sm" />
        <input value={f.pie} onChange={(e) => setF({ ...f, pie: e.target.value })} type="number" placeholder="Cajas x pallet" className="px-2 py-1.5 rounded-lg border border-slate-200 text-sm" />
        <button onClick={add} className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-sm font-black">+ Agregar</button>
      </div>
      <div className="border border-slate-100 rounded-xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-[10px] uppercase text-slate-400"><tr><th className="text-left px-3 py-2">Producto</th><th className="text-right px-3 py-2">OC</th><th className="text-right px-3 py-2">Cajas</th><th className="text-right px-3 py-2">Pallets</th><th></th></tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-slate-50">
                <td className="px-3 py-2">{r.prod}</td>
                <td className="px-3 py-2 text-right">{n(r.cant_oc)}</td>
                <td className="px-3 py-2 text-right font-bold">{n(cajas(r))}</td>
                <td className="px-3 py-2 text-right font-black text-orange-600">{n(pallets(r))}</td>
                <td className="px-3 py-2 text-right"><button onClick={() => eliminar.mutate({ id: r.id })} className="text-slate-400 hover:text-rose-500"><Trash2 size={13} /></button></td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={5} className="px-3 py-4 text-center text-slate-400 text-xs">Sin proyecciones.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Helpers UI ──────────────────────────────────────────────────────────────
function Kpi({ label, value, tone }) {
  const t = tone === 'good' ? 'text-emerald-600' : tone === 'bad' ? 'text-rose-600' : tone === 'warn' ? 'text-amber-600' : 'text-slate-900';
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
      <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</div>
      <div className={`text-xl font-black mt-1 ${t}`}>{value}</div>
    </div>
  );
}

function TablaReporte({ isLoading, rows, cols }) {
  if (isLoading) return <div className="p-6 text-slate-400 text-sm">Cargando…</div>;
  if (!rows.length) return <div className="p-6 text-slate-400 text-sm">No hay conteos para mostrar.</div>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-[10px] uppercase text-slate-400">
          <tr>{cols.map(([k, label]) => <th key={k} className={`px-3 py-2 ${['num', 'dif', 'money'].includes(cols.find((c) => c[0] === k)[2]) ? 'text-right' : 'text-left'}`}>{label}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-t border-slate-50 hover:bg-orange-50/30">
              {cols.map(([k, , type]) => {
                const v = row[k];
                if (type === 'estado') return <td key={k} className="px-3 py-2"><span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${chip(v)}`}>{v}</span></td>;
                if (type === 'money') return <td key={k} className={`px-3 py-2 text-right font-bold ${Number(v) < 0 ? 'text-rose-600' : 'text-slate-700'}`}>{money(v)}</td>;
                if (type === 'dif') return <td key={k} className={`px-3 py-2 text-right font-black ${Number(v) < 0 ? 'text-rose-600' : Number(v) > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>{Number(v) > 0 ? '+' : ''}{n(v)}</td>;
                if (type === 'num') return <td key={k} className="px-3 py-2 text-right">{n(v)}</td>;
                if (type === 'mono') return <td key={k} className="px-3 py-2 font-mono text-xs">{v}</td>;
                return <td key={k} className="px-3 py-2 text-slate-600 max-w-xs truncate">{v}</td>;
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
