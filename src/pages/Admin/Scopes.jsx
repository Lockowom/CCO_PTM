import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { Target, Plus, Trash2, ShieldCheck, User as UserIcon, Layers, Info, Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { catalogoScope, listarAsignaciones, asignarScope, revocarAsignacion } from '../../services/iamService';

// Ejes de ámbito disponibles. La realidad operativa de PTM: centro_costo es el
// único multivaluado real (tms_operaciones); bodega queda listo para el futuro.
const EJES = [
  { id: 'centro_costo', label: 'Centro de costo' },
  { id: 'bodega', label: 'Bodega' },
];

const fmt = (ts) => { if (!ts) return null; const d = new Date(ts); return isNaN(d) ? null : d.toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: '2-digit' }); };
const inp = 'w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-orange-400 bg-white';
const lbl = 'text-[11px] font-bold text-slate-500 uppercase tracking-wide';

export default function Scopes() {
  const { hasPermission, user } = useAuth();
  const puede = hasPermission('manage_roles') || user?.rol === 'ADMIN' || user?.es_admin_delegado;

  const [cat, setCat] = useState({ usuarios: [], roles: [], centros_costo: [] });
  const [asigs, setAsigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [f, setF] = useState({ userId: '', role: '', scopeType: 'centro_costo', scopeCode: '', expires: '' });
  const [guardando, setGuardando] = useState(false);

  const cargar = useCallback(async () => {
    setLoading(true);
    try {
      const [c, a] = await Promise.all([catalogoScope(), listarAsignaciones()]);
      setCat(c); setAsigs(a);
    } catch (e) {
      toast.error(e.message || 'No se pudo cargar');
    } finally { setLoading(false); }
  }, []);
  useEffect(() => { cargar(); }, [cargar]);

  const valoresEje = useMemo(
    () => (f.scopeType === 'centro_costo' ? cat.centros_costo || [] : []),
    [f.scopeType, cat.centros_costo]
  );

  const submit = async () => {
    if (!f.userId || !f.role || !f.scopeCode) { toast.error('Usuario, rol y código de ámbito son obligatorios'); return; }
    setGuardando(true);
    const r = await asignarScope(f.userId, f.role, f.scopeType, f.scopeCode, f.expires || null);
    setGuardando(false);
    if (r?.ok) { toast.success(r.accion === 'actualizado' ? 'Asignación actualizada' : 'Ámbito asignado'); setF({ ...f, scopeCode: '', expires: '' }); cargar(); }
    else toast.error(r?.error || 'Error al asignar');
  };

  const quitar = async (id) => {
    if (!window.confirm('¿Revocar esta asignación con ámbito?')) return;
    const r = await revocarAsignacion(id);
    if (r?.ok) { toast.success('Revocada'); setAsigs((xs) => xs.filter((x) => x.id !== id)); }
    else toast.error(r?.error || 'Error');
  };

  const ejeLabel = (id) => EJES.find((e) => e.id === id)?.label || id;

  return (
    <div className="space-y-4">
      {/* Explicación de semántica */}
      <div className="rounded-2xl border border-sky-100 bg-sky-50/60 px-4 py-3 flex gap-3">
        <Info size={18} className="text-sky-500 shrink-0 mt-0.5" />
        <p className="text-[12.5px] text-slate-600 leading-relaxed">
          Un <b>ámbito</b> otorga un rol <b>solo sobre ciertos datos</b> (p. ej. el centro de costo <span className="font-mono">150</span>).
          El permiso hace <b>visible</b> el módulo, y el <b>filtrado por dato</b> se aplica donde el módulo adopte
          <span className="font-mono"> can_on_scope</span> / <span className="font-mono">mis_scopes</span>. El rol
          <b> global</b> del usuario se gestiona en la pestaña <b>Usuarios</b>; aquí se agregan grants <b>acotados</b>.
        </p>
      </div>

      {/* Alta */}
      {puede && (
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-2 mb-3">
            <Plus size={15} className="text-orange-500" />
            <h3 className="text-[12px] font-black text-slate-600 uppercase tracking-wide">Otorgar rol con ámbito</h3>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <label className="block"><span className={lbl}>Usuario</span>
              <select value={f.userId} onChange={(e) => setF({ ...f, userId: e.target.value })} className={`${inp} mt-1`}>
                <option value="">—</option>
                {cat.usuarios.map((u) => <option key={u.id} value={u.id}>{u.nombre} · {u.correo}</option>)}
              </select>
            </label>
            <label className="block"><span className={lbl}>Rol</span>
              <select value={f.role} onChange={(e) => setF({ ...f, role: e.target.value })} className={`${inp} mt-1`}>
                <option value="">—</option>
                {cat.roles.map((r) => <option key={r.codigo} value={r.codigo}>{r.codigo} · {r.nombre}</option>)}
              </select>
            </label>
            <label className="block"><span className={lbl}>Eje</span>
              <select value={f.scopeType} onChange={(e) => setF({ ...f, scopeType: e.target.value, scopeCode: '' })} className={`${inp} mt-1`}>
                {EJES.map((e) => <option key={e.id} value={e.id}>{e.label}</option>)}
              </select>
            </label>
            <label className="block"><span className={lbl}>Código de ámbito</span>
              {valoresEje.length > 0 ? (
                <select value={f.scopeCode} onChange={(e) => setF({ ...f, scopeCode: e.target.value })} className={`${inp} mt-1`}>
                  <option value="">—</option>
                  {valoresEje.map((v) => <option key={v} value={v}>{v}</option>)}
                </select>
              ) : (
                <input value={f.scopeCode} onChange={(e) => setF({ ...f, scopeCode: e.target.value.trim() })} placeholder="código" className={`${inp} mt-1`} />
              )}
            </label>
            <label className="block"><span className={lbl}>Expira (opcional)</span>
              <input type="date" value={f.expires} onChange={(e) => setF({ ...f, expires: e.target.value })} className={`${inp} mt-1`} />
            </label>
          </div>
          <div className="mt-3 flex justify-end">
            <button onClick={submit} disabled={guardando}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-500 text-white text-sm font-bold hover:bg-orange-600 disabled:opacity-50">
              <Plus size={16} /> {guardando ? 'Asignando…' : 'Asignar ámbito'}
            </button>
          </div>
        </div>
      )}

      {/* Lista de asignaciones con ámbito */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
        <div className="px-4 py-2.5 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
          <Layers size={12} /> Asignaciones con ámbito ({asigs.length})
        </div>
        {loading ? (
          <div className="py-12 text-center text-slate-400 text-sm">Cargando…</div>
        ) : asigs.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-sm px-4">
            Sin asignaciones acotadas. Todos operan con su rol global.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {asigs.map((a) => (
              <div key={a.id} className="flex items-center gap-3 px-4 py-2.5 text-[13px]">
                <UserIcon size={15} className="text-slate-300 shrink-0" />
                <div className="min-w-0">
                  <div className="font-bold text-slate-800 truncate">{a.usuario || '—'}</div>
                  <div className="text-[11px] text-slate-400 truncate">{a.correo}</div>
                </div>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 shrink-0">
                  <ShieldCheck size={11} className="text-orange-500" />{a.role}
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg px-2 py-1 shrink-0">
                  <Target size={11} />{ejeLabel(a.scope_type)}: <span className="font-mono">{a.scope_code}</span>
                </span>
                {fmt(a.expires_at) && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-600 bg-amber-50 rounded px-1.5 py-0.5 shrink-0">
                    <Clock size={10} /> expira {fmt(a.expires_at)}
                  </span>
                )}
                {puede && (
                  <button onClick={() => quitar(a.id)} className="ml-auto w-8 h-8 rounded-lg hover:bg-red-50 grid place-items-center text-red-400 shrink-0">
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
