import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { ScrollText, Plus, Power, PowerOff, Pencil, X, FlaskConical, Check, Lock, ChevronDown, ChevronRight } from 'lucide-react';
import { listarPolicies, guardarPolicy, togglePolicy, probarEditarNV, catalogoScope } from '../../services/iamService';

const inp = 'w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-orange-400 bg-white';
const lbl = 'text-[11px] font-bold text-slate-500 uppercase tracking-wide';

const PLANTILLA = JSON.stringify({
  all: [
    { any: [
      { attr: 'ctx.sin_limite_centro', op: 'eq', value: true },
      { attr: 'row.centro_costo', op: 'in', value: 'ctx.centros_costo' },
    ] },
    { attr: 'row.estado', op: 'nin', value: ['DESPACHADO', 'ENTREGADO'] },
  ],
}, null, 2);

function PolicyModal({ data, onClose, onSave }) {
  const edit = !!data.codigo;
  const [f, setF] = useState({
    codigo: data.codigo || '', recurso: data.recurso || 'nv', accion: data.accion || 'editar',
    descripcion: data.descripcion || '', activo: data.activo !== false,
    condicion: JSON.stringify(data.condicion || {}, null, 2),
  });

  const submit = () => {
    let cond;
    try { cond = JSON.parse(f.condicion || '{}'); }
    catch { toast.error('La condición no es JSON válido'); return; }
    if (!f.codigo || !f.recurso || !f.accion) { toast.error('Código, recurso y acción son obligatorios'); return; }
    onSave({ ...f, condicion: cond });
  };

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
      <div onClick={(e) => e.stopPropagation()} className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl p-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-3"><h3 className="text-[15px] font-black text-slate-800">{edit ? `Editar política ${data.codigo}` : 'Nueva política'}</h3><button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={18} /></button></div>
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            <label className="block col-span-1"><span className={lbl}>Recurso</span><input value={f.recurso} onChange={(e) => setF({ ...f, recurso: e.target.value.trim() })} className={`${inp} mt-1`} /></label>
            <label className="block col-span-1"><span className={lbl}>Acción</span><input value={f.accion} onChange={(e) => setF({ ...f, accion: e.target.value.trim() })} className={`${inp} mt-1`} /></label>
            <label className="block col-span-1"><span className={lbl}>Activa</span><select value={f.activo ? '1' : '0'} onChange={(e) => setF({ ...f, activo: e.target.value === '1' })} className={`${inp} mt-1`}><option value="1">Sí</option><option value="0">No</option></select></label>
          </div>
          <label className="block"><span className={lbl}>Código</span><input disabled={edit} value={f.codigo} onChange={(e) => setF({ ...f, codigo: e.target.value.trim() })} placeholder="nv_editar_ambito" className={`${inp} mt-1 ${edit ? 'bg-slate-50 text-slate-400' : ''}`} /></label>
          <label className="block"><span className={lbl}>Descripción</span><input value={f.descripcion} onChange={(e) => setF({ ...f, descripcion: e.target.value })} className={`${inp} mt-1`} /></label>
          <label className="block">
            <div className="flex items-center justify-between"><span className={lbl}>Condición (JSON DSL)</span>
              <button onClick={() => setF({ ...f, condicion: PLANTILLA })} className="text-[11px] font-bold text-orange-600 hover:text-orange-700">Insertar plantilla</button></div>
            <textarea value={f.condicion} onChange={(e) => setF({ ...f, condicion: e.target.value })} rows={10} className={`${inp} mt-1 font-mono text-[12px] resize-y`} />
          </label>
          <p className="text-[11px] text-slate-400">Combinadores: <code>all</code> / <code>any</code> / <code>not</code>. Hoja: <code>{'{attr, op, value}'}</code>. Ops: eq, neq, in, nin, contains, gt/lt/gte/lte, is_null, not_null. Referencias: <code>ctx.*</code> y <code>row.*</code>.</p>
          <button onClick={submit} className="w-full py-2.5 rounded-xl bg-orange-500 text-white text-sm font-bold hover:bg-orange-600">Guardar política</button>
        </div>
      </div>
    </div>
  );
}

function PolicyRow({ p, onToggle, onEdit }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="text-[13px]">
      <div className="flex items-center gap-2.5 px-4 py-2.5">
        <button onClick={() => setOpen((o) => !o)} aria-label={open ? 'Contraer condición' : 'Ver condición'} aria-expanded={open} className="text-slate-400 shrink-0">{open ? <ChevronDown size={15} /> : <ChevronRight size={15} />}</button>
        <span className={`w-2 h-2 rounded-full shrink-0 ${p.activo ? 'bg-emerald-500' : 'bg-slate-300'}`} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2"><span className="font-black text-slate-800">{p.codigo}</span><span className="text-[10px] font-mono text-slate-400 bg-slate-100 rounded px-1.5 py-0.5">{p.recurso}·{p.accion}</span>{p.es_sistema && <span className="text-[9px] font-bold text-slate-400 bg-slate-100 rounded px-1 py-0.5">sistema</span>}</div>
          <div className="text-[11px] text-slate-400 truncate">{p.descripcion}</div>
        </div>
        <button onClick={() => onToggle(p)} title={p.activo ? 'Desactivar' : 'Activar'} className={`w-8 h-8 rounded-lg grid place-items-center shrink-0 ${p.activo ? 'text-emerald-500 hover:bg-emerald-50' : 'text-slate-400 hover:bg-slate-100'}`}>{p.activo ? <Power size={15} /> : <PowerOff size={15} />}</button>
        <button onClick={() => onEdit(p)} className="w-8 h-8 rounded-lg hover:bg-slate-100 grid place-items-center text-slate-400 shrink-0"><Pencil size={14} /></button>
      </div>
      {open && (
        <pre className="mx-4 mb-3 ml-11 rounded-xl border border-slate-100 bg-slate-50/60 p-3 text-[11px] font-mono text-slate-600 overflow-x-auto">{JSON.stringify(p.condicion, null, 2)}</pre>
      )}
    </div>
  );
}

export default function Politicas() {
  const [pols, setPols] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  // Probador
  const [nvId, setNvId] = useState('');
  const [uid, setUid] = useState('');
  const [usuarios, setUsuarios] = useState([]);
  const [verdicto, setVerdicto] = useState(null);
  const [probando, setProbando] = useState(false);

  const cargar = useCallback(async () => {
    setLoading(true);
    try { setPols(await listarPolicies()); } catch (e) { toast.error(e.message || 'No autorizado'); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { cargar(); catalogoScope().then((c) => setUsuarios(c.usuarios || [])).catch(() => {}); }, [cargar]);

  const guardar = async (form) => {
    const r = await guardarPolicy(form);
    if (r?.ok) { toast.success('Política guardada'); setModal(null); cargar(); }
    else toast.error(r?.error || 'Error');
  };
  const toggle = async (p) => {
    const r = await togglePolicy(p.id, !p.activo);
    if (r?.ok) { setPols((xs) => xs.map((x) => x.id === p.id ? { ...x, activo: !p.activo } : x)); }
    else toast.error(r?.error || 'Error');
  };

  const probar = async () => {
    if (!nvId) { toast.error('Ingresa el ID de una N.V. (tms_operaciones.id)'); return; }
    setProbando(true); setVerdicto(null);
    try { setVerdicto(await probarEditarNV(Number(nvId), uid || null)); }
    catch (e) { toast.error(e.message || 'Error'); }
    finally { setProbando(false); }
  };

  const ctx = verdicto?.contexto;

  return (
    <div className="space-y-4">
      {/* Lista de políticas */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wide flex items-center gap-1.5"><ScrollText size={12} /> Políticas condicionales ({pols.length})</span>
          <button onClick={() => setModal({})} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-500 text-white text-[12px] font-bold hover:bg-orange-600"><Plus size={14} /> Nueva</button>
        </div>
        {loading ? <div className="py-12 text-center text-slate-400 text-sm">Cargando…</div>
          : pols.length === 0 ? <div className="py-12 text-center text-slate-400 text-sm">Sin políticas.</div>
          : <div className="divide-y divide-slate-100">{pols.map((p) => <PolicyRow key={p.id} p={p} onToggle={toggle} onEdit={(x) => setModal(x)} />)}</div>}
      </div>

      {/* Probador (ejemplo N.V.) */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3">
        <div className="flex items-center gap-2"><FlaskConical size={16} className="text-orange-500" /><h3 className="text-[12px] font-black text-slate-600 uppercase tracking-wide">Probador — ¿puede editar una N.V.?</h3></div>
        <div className="flex flex-wrap items-end gap-2">
          <label className="block"><span className={lbl}>ID de N.V. (tms_operaciones.id)</span>
            <input value={nvId} onChange={(e) => setNvId(e.target.value.replace(/\D/g, ''))} inputMode="numeric" placeholder="1234" className={`${inp} mt-1 w-40`} /></label>
          <label className="block"><span className={lbl}>Como usuario</span>
            <select value={uid} onChange={(e) => setUid(e.target.value)} className={`${inp} mt-1 w-56`}>
              <option value="">— yo (admin) —</option>
              {usuarios.map((u) => <option key={u.id} value={u.id}>{u.nombre}</option>)}
            </select></label>
          <button onClick={probar} disabled={probando} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 text-white text-sm font-bold hover:bg-slate-900 disabled:opacity-50">
            <FlaskConical size={15} /> {probando ? 'Evaluando…' : 'Evaluar'}
          </button>
        </div>

        {verdicto && (
          verdicto.error ? <p className="text-red-500 text-[13px] font-semibold">{verdicto.error}</p> : (
            <div className={`rounded-xl border p-3 ${verdicto.permitida ? 'border-emerald-200 bg-emerald-50/60' : 'border-red-200 bg-red-50/60'}`}>
              <div className="flex items-center gap-2 font-black text-[14px] mb-2">
                {verdicto.permitida ? <><Check size={17} className="text-emerald-600" /><span className="text-emerald-700">PERMITIDO</span></> : <><Lock size={16} className="text-red-500" /><span className="text-red-600">DENEGADO</span></>}
              </div>
              <div className="grid sm:grid-cols-2 gap-3 text-[12px]">
                <div>
                  <p className="font-bold text-slate-500 mb-1">N.V.</p>
                  <ul className="text-slate-600 space-y-0.5">
                    <li>Centro de costo: <b className="font-mono">{verdicto.nv?.centro_costo || '—'}</b></li>
                    <li>Estado: <b>{verdicto.nv?.estado || '—'}</b></li>
                    <li>Vendedor: {verdicto.nv?.vendedor || '—'}</li>
                  </ul>
                </div>
                <div>
                  <p className="font-bold text-slate-500 mb-1">Contexto del usuario</p>
                  <ul className="text-slate-600 space-y-0.5">
                    <li>Rol: <b>{ctx?.rol || '—'}</b>{ctx?.es_admin && <span className="ml-1 text-[10px] font-bold text-orange-600">admin</span>}</li>
                    <li>Sin límite de centro: <b>{ctx?.sin_limite_centro ? 'sí' : 'no'}</b></li>
                    <li>Centros: <span className="font-mono">{(ctx?.centros_costo || []).join(', ') || '(ninguno)'}</span></li>
                  </ul>
                </div>
              </div>
            </div>
          )
        )}
      </div>

      {modal && <PolicyModal data={modal} onClose={() => setModal(null)} onSave={guardar} />}
    </div>
  );
}
