import React, { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { UserCheck, Plus, X, Trash2, ArrowRight, CalendarClock, Circle } from 'lucide-react';
import { delegaciones as fetchDelegaciones, delegar, revocarDelegacion, catalogoScope } from '../../services/iamService';

const fmt = (ts) => { if (!ts) return '—'; const d = new Date(ts); return isNaN(d) ? '—' : d.toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: '2-digit' }); };
const inp = 'w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-orange-400 bg-white';
const lbl = 'text-[11px] font-bold text-slate-500 uppercase tracking-wide';

function DelegarModal({ usuarios, roles, onClose, onSave }) {
  const [f, setF] = useState({ delegador: '', delegado: '', role: '', desde: '', hasta: '', motivo: '' });
  const submit = () => {
    if (!f.delegador || !f.delegado || !f.hasta) { toast.error('Delegador, cobertura y fecha de término son obligatorios'); return; }
    if (f.delegador === f.delegado) { toast.error('El delegador y la cobertura deben ser distintos'); return; }
    onSave({
      delegador: f.delegador, delegado: f.delegado,
      role: f.role || null, motivo: f.motivo || null,
      desde: f.desde ? new Date(f.desde).toISOString() : null,
      hasta: new Date(f.hasta).toISOString(),
    });
  };
  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
      <div onClick={(e) => e.stopPropagation()} className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-5">
        <div className="flex items-center justify-between mb-3"><h3 className="text-[15px] font-black text-slate-800">Nueva delegación</h3><button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={18} /></button></div>
        <div className="space-y-3">
          <label className="block"><span className={lbl}>Delegador (presta permisos)</span>
            <select value={f.delegador} onChange={(e) => setF({ ...f, delegador: e.target.value })} className={`${inp} mt-1`}>
              <option value="">—</option>{usuarios.map((u) => <option key={u.id} value={u.id}>{u.nombre}</option>)}
            </select></label>
          <label className="block"><span className={lbl}>Cobertura (recibe permisos)</span>
            <select value={f.delegado} onChange={(e) => setF({ ...f, delegado: e.target.value })} className={`${inp} mt-1`}>
              <option value="">—</option>{usuarios.map((u) => <option key={u.id} value={u.id}>{u.nombre}</option>)}
            </select></label>
          <label className="block"><span className={lbl}>Rol específico (opcional)</span>
            <select value={f.role} onChange={(e) => setF({ ...f, role: e.target.value })} className={`${inp} mt-1`}>
              <option value="">Todos los roles del delegador</option>{roles.map((r) => <option key={r.codigo} value={r.codigo}>{r.codigo}</option>)}
            </select></label>
          <div className="grid grid-cols-2 gap-2">
            <label className="block"><span className={lbl}>Desde</span><input type="date" value={f.desde} onChange={(e) => setF({ ...f, desde: e.target.value })} className={`${inp} mt-1`} /></label>
            <label className="block"><span className={lbl}>Hasta</span><input type="date" value={f.hasta} onChange={(e) => setF({ ...f, hasta: e.target.value })} className={`${inp} mt-1`} /></label>
          </div>
          <label className="block"><span className={lbl}>Motivo</span><input value={f.motivo} onChange={(e) => setF({ ...f, motivo: e.target.value })} placeholder="Vacaciones, licencia…" className={`${inp} mt-1`} /></label>
          <button onClick={submit} className="w-full py-2.5 rounded-xl bg-orange-500 text-white text-sm font-bold hover:bg-orange-600">Crear delegación</button>
        </div>
      </div>
    </div>
  );
}

export default function Delegaciones() {
  const [rows, setRows] = useState([]);
  const [cat, setCat] = useState({ usuarios: [], roles: [] });
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);

  const cargar = useCallback(async () => {
    setLoading(true);
    try { setRows(await fetchDelegaciones(false)); } catch (e) { toast.error(e.message || 'No autorizado'); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { cargar(); catalogoScope().then(setCat).catch(() => {}); }, [cargar]);

  const crear = async (form) => {
    const r = await delegar(form);
    if (r?.ok) { toast.success('Delegación creada'); setModal(false); cargar(); }
    else toast.error(r?.error || 'Error');
  };
  const revocar = async (id) => {
    if (!window.confirm('¿Revocar esta delegación? La cobertura perderá los permisos de inmediato.')) return;
    const r = await revocarDelegacion(id);
    if (r?.ok) { toast.success('Revocada'); cargar(); } else toast.error(r?.error || 'Error');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-[13px] text-slate-500">Sustituciones: un delegador presta sus permisos a otro durante una ventana (vacaciones, licencias). Caducan solas.</p>
        <button onClick={() => setModal(true)} className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-orange-500 text-white text-sm font-bold hover:bg-orange-600"><Plus size={16} /> Nueva</button>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
        {loading ? <div className="py-12 text-center text-slate-400 text-sm">Cargando…</div>
          : rows.length === 0 ? <div className="py-12 text-center text-slate-400 text-sm">Sin delegaciones.</div>
          : <div className="divide-y divide-slate-100">
              {rows.map((d) => (
                <div key={d.id} className="flex items-center gap-3 px-4 py-2.5 text-[13px]">
                  <Circle size={9} className={`shrink-0 rounded-full ${d.vigente ? 'text-emerald-500 fill-emerald-500' : 'text-slate-300 fill-slate-300'}`} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap font-bold text-slate-800">
                      <span className="truncate">{d.delegador_nombre}</span>
                      <ArrowRight size={12} className="text-slate-300" />
                      <span className="truncate">{d.delegado_nombre}</span>
                      {d.role && <span className="text-[10px] font-mono text-slate-500 bg-slate-100 rounded px-1.5 py-0.5">{d.role}</span>}
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-1"><CalendarClock size={11} /> {fmt(d.desde)} → {fmt(d.hasta)}{d.motivo ? ` · ${d.motivo}` : ''}</div>
                  </div>
                  {d.vigente ? <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 rounded px-1.5 py-0.5 shrink-0">VIGENTE</span>
                    : d.activo ? <span className="text-[10px] font-bold text-slate-400 bg-slate-100 rounded px-1.5 py-0.5 shrink-0">programada/vencida</span>
                    : <span className="text-[10px] font-bold text-red-400 bg-red-50 rounded px-1.5 py-0.5 shrink-0">revocada</span>}
                  {d.activo && (
                    <button onClick={() => revocar(d.id)} className="w-8 h-8 rounded-lg hover:bg-red-50 grid place-items-center text-red-400 shrink-0"><Trash2 size={15} /></button>
                  )}
                </div>
              ))}
            </div>}
      </div>

      {modal && <DelegarModal usuarios={cat.usuarios} roles={cat.roles} onClose={() => setModal(false)} onSave={crear} />}
    </div>
  );
}
