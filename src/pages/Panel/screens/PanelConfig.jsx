import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Truck, Users, ShieldCheck, Plus, Trash2, Lock, Search } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { getCatalogo } from '../panelService';

// Configuración (port de /configuracion + /auditoria fusionados). SOLO admin.
// Pestañas: Transportistas y Vendedores (catálogos maestros) + Auditoría
// (registro de actividad). Datos de ejemplo; al conectar, va a Supabase.
const SEED_TRANSP = [
  { nombre: 'Transportes Andes', activo: true }, { nombre: 'LogiSur', activo: true },
  { nombre: 'RápidoExpress', activo: true }, { nombre: 'CargoNorte', activo: false },
];
const SEED_VEND = [
  { nombre: 'M. González', activo: true }, { nombre: 'P. Rojas', activo: true },
  { nombre: 'C. Díaz', activo: true }, { nombre: 'A. Muñoz', activo: false },
];
const AUDIT_OPS = [
  { fecha: '2026-07-15 09:12:04', operador: 'M. González', accion: 'create', canal: 'PTM', nv: '97140', campos: 'estado, transportista', ok: true },
  { fecha: '2026-07-15 08:55:31', operador: 'P. Rojas', accion: 'update', canal: 'Orange', nv: '88450', campos: 'fecha_despacho', ok: true },
  { fecha: '2026-07-14 18:40:12', operador: 'C. Díaz', accion: 'bulkUpdate', canal: 'Farmapack', nv: '—', campos: '12 filas', ok: true },
  { fecha: '2026-07-14 17:22:09', operador: 'A. Muñoz', accion: 'update-conflict', canal: 'PTM', nv: '97108', campos: 'estado', ok: false },
];
const AUDIT_ACC = [
  { fecha: '2026-07-15 09:00:11', operador: 'M. González', evento: 'LOGIN_SUCCESS', ip: '190.44.12.8' },
  { fecha: '2026-07-15 08:30:44', operador: 'P. Rojas', evento: 'LOGIN_SUCCESS', ip: '190.44.12.9' },
  { fecha: '2026-07-14 22:10:03', operador: '—', evento: 'LOGIN_FAIL', ip: '201.220.5.3' },
  { fecha: '2026-07-14 20:05:59', operador: 'C. Díaz', evento: 'SESSION_EXPIRED', ip: '190.44.12.7' },
];
const ACC_COLOR = { create: 'bg-emerald-100 text-emerald-700', update: 'bg-blue-100 text-blue-700', bulkUpdate: 'bg-violet-100 text-violet-700', 'update-conflict': 'bg-red-100 text-red-700', delete: 'bg-rose-100 text-rose-700' };
const EV_COLOR = { LOGIN_SUCCESS: 'bg-emerald-100 text-emerald-700', LOGOUT: 'bg-slate-100 text-slate-600', LOGIN_FAIL: 'bg-red-100 text-red-700', SESSION_EXPIRED: 'bg-amber-100 text-amber-700' };

function Catalogo({ items, setItems, singular }) {
  const [nuevo, setNuevo] = useState('');
  const add = () => { const n = nuevo.trim(); if (!n) return; if (items.some((x) => x.nombre.toLowerCase() === n.toLowerCase())) return toast.info('Ya existe'); setItems((xs) => [...xs, { nombre: n, activo: true }]); setNuevo(''); };
  return (
    <div className="max-w-xl">
      <div className="flex gap-2 mb-4">
        <input className="field-input" value={nuevo} onChange={(e) => setNuevo(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && add()} placeholder={`Nuevo ${singular}…`} />
        <button onClick={add} className="px-4 rounded-xl bg-orange-500 text-white text-xs font-black hover:bg-orange-600 inline-flex items-center gap-1.5"><Plus size={14} /> Añadir</button>
      </div>
      <div className="space-y-1.5">
        {items.map((x, i) => (
          <div key={x.nombre} className="flex items-center gap-3 rounded-xl border border-slate-200 px-3 py-2">
            <button onClick={() => setItems((xs) => xs.map((y, j) => (j === i ? { ...y, activo: !y.activo } : y)))}
              className={`relative w-10 h-5 rounded-full transition-colors shrink-0 ${x.activo ? 'bg-emerald-500' : 'bg-slate-300'}`}>
              <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${x.activo ? 'translate-x-5' : ''}`} />
            </button>
            <span className={`flex-1 text-sm font-bold ${x.activo ? 'text-slate-700' : 'text-slate-400 line-through'}`}>{x.nombre}</span>
            <span className={`text-[10px] font-black uppercase ${x.activo ? 'text-emerald-600' : 'text-slate-400'}`}>{x.activo ? 'Activo' : 'Inactivo'}</span>
            <button onClick={() => setItems((xs) => xs.filter((_, j) => j !== i))} className="p-1.5 rounded-lg text-red-400 hover:bg-red-50"><Trash2 size={14} /></button>
          </div>
        ))}
      </div>
    </div>
  );
}

function Auditoria() {
  const [sub, setSub] = useState('operaciones');
  const [q, setQ] = useState('');
  const ql = q.trim().toLowerCase();
  const ops = AUDIT_OPS.filter((r) => !ql || [r.operador, r.nv, r.canal, r.accion].some((v) => String(v).toLowerCase().includes(ql)));
  const acc = AUDIT_ACC.filter((r) => !ql || [r.operador, r.evento, r.ip].some((v) => String(v).toLowerCase().includes(ql)));
  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="flex gap-1 p-1 bg-slate-100 rounded-xl">
          {[['operaciones', 'Operaciones'], ['accesos', 'Accesos']].map(([t, l]) => (
            <button key={t} onClick={() => setSub(t)} className={`px-3 py-1.5 rounded-lg text-xs font-black ${sub === t ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-500'}`}>{l}</button>
          ))}
        </div>
        <div className="relative flex-1 min-w-[160px] max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filtrar…" className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-orange-400 outline-none" />
        </div>
      </div>
      <div className="bg-white rounded-2xl border border-slate-200 overflow-x-auto">
        {sub === 'operaciones' ? (
          <table className="w-full text-xs">
            <thead><tr className="bg-slate-50 text-slate-400 text-left uppercase text-[10px]">
              <th className="px-3 py-2">Fecha/Hora</th><th className="px-3 py-2">Operador</th><th className="px-3 py-2">Acción</th><th className="px-3 py-2">Canal</th><th className="px-3 py-2">NV</th><th className="px-3 py-2">Campos</th><th className="px-3 py-2">OK</th>
            </tr></thead>
            <tbody>
              {ops.map((r, i) => (
                <tr key={i} className="border-t border-slate-100">
                  <td className="px-3 py-2 font-mono text-slate-500">{r.fecha}</td><td className="px-3 py-2 font-bold text-slate-700">{r.operador}</td>
                  <td className="px-3 py-2"><span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${ACC_COLOR[r.accion] || 'bg-slate-100 text-slate-600'}`}>{r.accion}</span></td>
                  <td className="px-3 py-2">{r.canal}</td><td className="px-3 py-2 font-mono">{r.nv}</td><td className="px-3 py-2 text-slate-500">{r.campos}</td>
                  <td className="px-3 py-2">{r.ok ? '✓' : <span className="text-red-500">✕</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table className="w-full text-xs">
            <thead><tr className="bg-slate-50 text-slate-400 text-left uppercase text-[10px]">
              <th className="px-3 py-2">Fecha/Hora</th><th className="px-3 py-2">Operador</th><th className="px-3 py-2">Evento</th><th className="px-3 py-2">IP</th>
            </tr></thead>
            <tbody>
              {acc.map((r, i) => (
                <tr key={i} className="border-t border-slate-100">
                  <td className="px-3 py-2 font-mono text-slate-500">{r.fecha}</td><td className="px-3 py-2 font-bold text-slate-700">{r.operador}</td>
                  <td className="px-3 py-2"><span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${EV_COLOR[r.evento] || 'bg-slate-100 text-slate-600'}`}>{r.evento}</span></td>
                  <td className="px-3 py-2 font-mono text-slate-500">{r.ip}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <p className="text-[11px] text-slate-400 mt-2">Registro de todo lo que ocurre en el sistema · datos de ejemplo</p>
    </div>
  );
}

export default function PanelConfig() {
  const { user } = useAuth();
  const isAdmin = user?.rol === 'ADMIN' || user?.es_admin_delegado;
  const [tab, setTab] = useState('transportistas');
  const [transp, setTransp] = useState(SEED_TRANSP);
  const [vend, setVend] = useState(SEED_VEND);

  // Catálogos desde el servicio (punto único de conexión).
  useEffect(() => {
    if (!isAdmin) return;
    getCatalogo('transportistas').then((x) => x?.length && setTransp(x));
    getCatalogo('vendedores').then((x) => x?.length && setVend(x));
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <div className="anim-fade-up max-w-md mx-auto text-center py-16">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-4"><Lock size={30} /></div>
        <h2 className="text-lg font-black text-slate-800">Acceso solo para administradores</h2>
        <p className="text-sm text-slate-500 mt-1">Esta sección (catálogos y auditoría) requiere permisos de administrador.</p>
      </div>
    );
  }

  const TABS = [
    { id: 'transportistas', label: 'Transportistas', icon: Truck },
    { id: 'vendedores', label: 'Vendedores', icon: Users },
    { id: 'auditoria', label: 'Auditoría', icon: ShieldCheck },
  ];

  return (
    <div className="anim-fade-up space-y-4">
      <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1 w-fit">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setTab(id)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-black inline-flex items-center gap-1.5 ${tab === id ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-500'}`}>
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        {tab === 'transportistas' && <Catalogo items={transp} setItems={setTransp} singular="transportista" />}
        {tab === 'vendedores' && <Catalogo items={vend} setItems={setVend} singular="vendedor" />}
        {tab === 'auditoria' && <Auditoria />}
      </div>
    </div>
  );
}
