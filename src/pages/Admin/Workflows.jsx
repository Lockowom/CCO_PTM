import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { Workflow as WorkflowIcon, Plus, X, Trash2, Pencil, ArrowRight, Circle, CheckCircle2, Flag, History, GitBranch, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  listarDefiniciones, listarEstados, listarTransiciones, listarHistorial, listarPermisos,
  guardarDefinicion, eliminarDefinicion, guardarEstado, eliminarEstado, guardarTransicion, eliminarTransicion,
} from '../../services/workflowService';

const fmt = (ts) => { if (!ts) return '—'; const d = new Date(ts); return isNaN(d) ? '—' : d.toLocaleString('es-CL', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' }); };

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
      <div onClick={(e) => e.stopPropagation()} className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-5">
        <div className="flex items-center justify-between mb-3"><h3 className="text-[15px] font-black text-slate-800">{title}</h3><button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={18} /></button></div>
        {children}
      </div>
    </div>
  );
}
const inp = 'w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-orange-400';
const lbl = 'text-[11px] font-bold text-slate-500 uppercase tracking-wide';

export default function Workflows() {
  const { hasPermission, user } = useAuth();
  const puede = hasPermission('manage_workflows') || user?.rol === 'ADMIN' || user?.es_admin_delegado;

  const [defs, setDefs] = useState([]);
  const [sel, setSel] = useState(null);
  const [estados, setEstados] = useState([]);
  const [trans, setTrans] = useState([]);
  const [hist, setHist] = useState([]);
  const [permisos, setPermisos] = useState([]);
  const [tab, setTab] = useState('estados');
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // {tipo, data}

  const cargarDefs = useCallback(async () => {
    setLoading(true);
    const d = await listarDefiniciones();
    setDefs(d); setLoading(false);
    setSel((prev) => prev && d.find((x) => x.codigo === prev) ? prev : (d[0]?.codigo || null));
  }, []);
  useEffect(() => { cargarDefs(); listarPermisos().then(setPermisos); }, [cargarDefs]);

  const cargarDetalle = useCallback(async (wf) => {
    if (!wf) { setEstados([]); setTrans([]); setHist([]); return; }
    const [e, t, h] = await Promise.all([listarEstados(wf), listarTransiciones(wf), listarHistorial(wf)]);
    setEstados(e); setTrans(t); setHist(h);
  }, []);
  useEffect(() => { cargarDetalle(sel); }, [sel, cargarDetalle]);

  const estadoMap = useMemo(() => Object.fromEntries(estados.map((e) => [e.codigo, e])), [estados]);
  const defActual = defs.find((d) => d.codigo === sel);

  const run = async (fn, ok) => { const r = await fn; if (r?.ok) { toast.success(ok); return true; } toast.error(r?.error || 'Error'); return false; };

  // ── Acciones ──
  const saveDef = async (form) => { if (await run(guardarDefinicion(form), 'Proceso guardado')) { setModal(null); await cargarDefs(); setSel(form.codigo); } };
  const delDef = async (codigo) => { if (!window.confirm(`¿Eliminar el proceso ${codigo} y todos sus estados/transiciones?`)) return; if (await run(eliminarDefinicion(codigo), 'Proceso eliminado')) { setSel(null); await cargarDefs(); } };
  const saveEstado = async (form) => { if (await run(guardarEstado({ ...form, workflow: sel }), 'Estado guardado')) { setModal(null); cargarDetalle(sel); } };
  const delEstado = async (cod) => { if (!window.confirm(`¿Eliminar el estado ${cod}?`)) return; if (await run(eliminarEstado(sel, cod), 'Estado eliminado')) cargarDetalle(sel); };
  const saveTrans = async (form) => { if (await run(guardarTransicion({ ...form, workflow: sel }), 'Transición guardada')) { setModal(null); cargarDetalle(sel); } };
  const delTrans = async (id) => { if (!window.confirm('¿Eliminar la transición?')) return; if (await run(eliminarTransicion(id), 'Transición eliminada')) cargarDetalle(sel); };

  return (
    <div className="anim-fade-up space-y-5 max-w-6xl mx-auto pb-16">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 text-white grid place-items-center shadow-lg shadow-orange-500/20"><WorkflowIcon size={22} /></div>
          <div>
            <h1 className="text-xl font-black text-slate-800 leading-tight">Workflows</h1>
            <p className="text-[13px] text-slate-500">Procesos como datos: estados, transiciones y permisos. Sin programar.</p>
          </div>
        </div>
        {puede && <button onClick={() => setModal({ tipo: 'def', data: {} })} className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-orange-500 text-white text-sm font-bold hover:bg-orange-600 shadow-sm shadow-orange-500/30"><Plus size={16} /> Nuevo proceso</button>}
      </div>

      <div className="lg:flex lg:gap-4 lg:items-start">
        {/* Lista de procesos */}
        <div className="lg:w-64 shrink-0 mb-4 lg:mb-0">
          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
            {loading ? <div className="py-10 text-center text-slate-400 text-sm">Cargando…</div> : defs.length === 0 ? (
              <div className="py-10 text-center text-slate-400 text-sm px-4">Sin procesos aún.</div>
            ) : (
              <div className="divide-y divide-slate-100">
                {defs.map((d) => {
                  const activo = d.codigo === sel;
                  return (
                    <button key={d.codigo} onClick={() => setSel(d.codigo)} className={`w-full text-left px-4 py-3 transition-colors ${activo ? 'bg-orange-50' : 'hover:bg-slate-50'}`}>
                      <div className="flex items-center gap-2">
                        <GitBranch size={14} className={activo ? 'text-orange-500' : 'text-slate-400'} />
                        <span className="font-black text-[13px] text-slate-800">{d.codigo}</span>
                        {!d.activo && <span className="text-[9px] font-bold text-slate-400 bg-slate-100 rounded px-1.5 py-0.5">inactivo</span>}
                      </div>
                      <div className="text-[12px] text-slate-500 truncate mt-0.5 ml-6">{d.nombre}</div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Detalle del proceso */}
        <div className="min-w-0 flex-1">
          {!defActual ? (
            <div className="rounded-2xl border border-slate-200 bg-white py-20 text-center text-slate-400 text-sm">Selecciona un proceso.</div>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2"><span className="text-[15px] font-black text-slate-900">{defActual.codigo}</span><span className="text-[13px] text-slate-500">{defActual.nombre}</span></div>
                  {defActual.descripcion && <p className="text-[12px] text-slate-400 mt-0.5">{defActual.descripcion}</p>}
                </div>
                {puede && (
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => setModal({ tipo: 'def', data: defActual })} className="w-8 h-8 rounded-lg hover:bg-slate-100 grid place-items-center text-slate-400"><Pencil size={15} /></button>
                    <button onClick={() => delDef(defActual.codigo)} className="w-8 h-8 rounded-lg hover:bg-red-50 grid place-items-center text-red-400"><Trash2 size={15} /></button>
                  </div>
                )}
              </div>

              {/* Tabs */}
              <div className="flex gap-1 px-3 pt-3">
                {[['estados', `Estados (${estados.length})`], ['transiciones', `Transiciones (${trans.length})`], ['historial', `Historial (${hist.length})`]].map(([k, l]) => (
                  <button key={k} onClick={() => setTab(k)} className={`px-3 py-1.5 rounded-lg text-[12px] font-bold transition-colors ${tab === k ? 'bg-orange-100 text-orange-700' : 'text-slate-500 hover:bg-slate-50'}`}>{l}</button>
                ))}
              </div>

              <div className="p-4">
                {tab === 'estados' && (
                  <div className="space-y-2">
                    {puede && <button onClick={() => setModal({ tipo: 'estado', data: {} })} className="text-[12px] font-bold text-orange-600 hover:text-orange-700 inline-flex items-center gap-1"><Plus size={13} /> Agregar estado</button>}
                    {estados.length === 0 ? <p className="text-slate-400 text-sm py-6 text-center">Sin estados. {puede && 'Agrega el primero (marca uno como inicial).'}</p> : (
                      <div className="space-y-1.5">
                        {estados.map((e) => (
                          <div key={e.codigo} className="flex items-center gap-3 px-3 py-2 rounded-xl border border-slate-100 bg-slate-50/60">
                            <span className="w-3 h-3 rounded-full shrink-0" style={{ background: e.color || '#cbd5e1' }} />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2"><span className="font-bold text-[13px] text-slate-800">{e.etiqueta}</span><span className="text-[10px] font-mono text-slate-400">{e.codigo}</span></div>
                            </div>
                            {e.es_inicial && <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 rounded px-1.5 py-0.5 inline-flex items-center gap-1"><Circle size={8} /> INICIAL</span>}
                            {e.es_final && <span className="text-[9px] font-black text-slate-600 bg-slate-100 rounded px-1.5 py-0.5 inline-flex items-center gap-1"><Flag size={9} /> FINAL</span>}
                            {puede && <div className="flex items-center gap-0.5 shrink-0">
                              <button onClick={() => setModal({ tipo: 'estado', data: e })} className="w-7 h-7 rounded-lg hover:bg-white grid place-items-center text-slate-400"><Pencil size={13} /></button>
                              <button onClick={() => delEstado(e.codigo)} className="w-7 h-7 rounded-lg hover:bg-red-50 grid place-items-center text-red-400"><Trash2 size={13} /></button>
                            </div>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {tab === 'transiciones' && (
                  <div className="space-y-2">
                    {puede && <button onClick={() => setModal({ tipo: 'trans', data: {} })} className="text-[12px] font-bold text-orange-600 hover:text-orange-700 inline-flex items-center gap-1"><Plus size={13} /> Agregar transición</button>}
                    {trans.length === 0 ? <p className="text-slate-400 text-sm py-6 text-center">Sin transiciones.</p> : (
                      <div className="space-y-1.5">
                        {trans.map((t) => (
                          <div key={t.id} className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-100 bg-slate-50/60 text-[12px]">
                            <span className="inline-flex items-center gap-1.5 min-w-0">
                              <span className="w-2 h-2 rounded-full" style={{ background: estadoMap[t.desde]?.color || '#e2e8f0' }} />
                              <span className="font-semibold text-slate-600 truncate">{t.desde ? (estadoMap[t.desde]?.etiqueta || t.desde) : '● inicio'}</span>
                            </span>
                            <span className="inline-flex items-center gap-1 text-slate-400 shrink-0"><ArrowRight size={13} /><span className="font-mono text-[10px] bg-white border border-slate-200 rounded px-1.5 py-0.5 text-slate-500">{t.accion}</span></span>
                            <span className="inline-flex items-center gap-1.5 min-w-0">
                              <span className="w-2 h-2 rounded-full" style={{ background: estadoMap[t.hasta]?.color || '#cbd5e1' }} />
                              <span className="font-bold text-slate-800 truncate">{estadoMap[t.hasta]?.etiqueta || t.hasta}</span>
                            </span>
                            {t.permiso_id && <span className="ml-auto shrink-0 inline-flex items-center gap-1 text-[10px] font-bold text-slate-500 bg-white border border-slate-200 rounded px-1.5 py-0.5"><ShieldCheck size={10} />{t.permiso_id}</span>}
                            {puede && <div className={`flex items-center gap-0.5 shrink-0 ${t.permiso_id ? '' : 'ml-auto'}`}>
                              <button onClick={() => setModal({ tipo: 'trans', data: t })} className="w-7 h-7 rounded-lg hover:bg-white grid place-items-center text-slate-400"><Pencil size={13} /></button>
                              <button onClick={() => delTrans(t.id)} className="w-7 h-7 rounded-lg hover:bg-red-50 grid place-items-center text-red-400"><Trash2 size={13} /></button>
                            </div>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {tab === 'historial' && (
                  hist.length === 0 ? <p className="text-slate-400 text-sm py-6 text-center">Sin transiciones ejecutadas todavía. El historial se llena cuando los procesos usan <code className="text-[11px]">wf_transicionar</code>.</p> : (
                    <div className="space-y-1.5">
                      {hist.map((h) => (
                        <div key={h.id} className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-100 text-[12px]">
                          <History size={13} className="text-slate-300 shrink-0" />
                          <span className="font-mono text-[10px] text-slate-400">{h.entidad_id}</span>
                          <span className="text-slate-500 truncate">{h.desde || '(inicio)'} <ArrowRight size={10} className="inline" /> <b className="text-slate-700">{h.hasta}</b></span>
                          <span className="ml-auto text-[10px] text-slate-400 shrink-0">{h.actor || '—'} · {fmt(h.creado_en)}</span>
                        </div>
                      ))}
                    </div>
                  )
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modales */}
      {modal?.tipo === 'def' && <DefModal data={modal.data} onClose={() => setModal(null)} onSave={saveDef} />}
      {modal?.tipo === 'estado' && <EstadoModal data={modal.data} onClose={() => setModal(null)} onSave={saveEstado} />}
      {modal?.tipo === 'trans' && <TransModal data={modal.data} estados={estados} permisos={permisos} onClose={() => setModal(null)} onSave={saveTrans} />}
    </div>
  );
}

function DefModal({ data, onClose, onSave }) {
  const edit = !!data.codigo;
  const [f, setF] = useState({ codigo: data.codigo || '', nombre: data.nombre || '', descripcion: data.descripcion || '', activo: data.activo !== false, orden: data.orden || 0 });
  return (
    <Modal title={edit ? `Editar proceso ${data.codigo}` : 'Nuevo proceso'} onClose={onClose}>
      <div className="space-y-3">
        <label className="block"><span className={lbl}>Código</span><input disabled={edit} value={f.codigo} onChange={(e) => setF({ ...f, codigo: e.target.value.toUpperCase().replace(/\s/g, '_') })} placeholder="DEVOLUCION" className={`${inp} mt-1 ${edit ? 'bg-slate-50 text-slate-400' : ''}`} /></label>
        <label className="block"><span className={lbl}>Nombre</span><input value={f.nombre} onChange={(e) => setF({ ...f, nombre: e.target.value })} placeholder="Devoluciones" className={`${inp} mt-1`} /></label>
        <label className="block"><span className={lbl}>Descripción</span><input value={f.descripcion} onChange={(e) => setF({ ...f, descripcion: e.target.value })} className={`${inp} mt-1`} /></label>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-[13px] text-slate-600"><input type="checkbox" checked={f.activo} onChange={(e) => setF({ ...f, activo: e.target.checked })} /> Activo</label>
          <label className="flex items-center gap-2 text-[13px] text-slate-600 ml-auto">Orden <input type="number" value={f.orden} onChange={(e) => setF({ ...f, orden: e.target.value })} className="w-20 border border-slate-200 rounded-lg px-2 py-1 text-sm" /></label>
        </div>
        <button onClick={() => f.codigo && f.nombre ? onSave(f) : toast.error('Código y nombre son obligatorios')} className="w-full py-2.5 rounded-xl bg-orange-500 text-white text-sm font-bold hover:bg-orange-600">Guardar</button>
      </div>
    </Modal>
  );
}

function EstadoModal({ data, onClose, onSave }) {
  const edit = !!data.codigo;
  const [f, setF] = useState({ codigo: data.codigo || '', etiqueta: data.etiqueta || '', es_inicial: !!data.es_inicial, es_final: !!data.es_final, orden: data.orden || 0, color: data.color || '#64748b' });
  return (
    <Modal title={edit ? `Editar estado ${data.codigo}` : 'Nuevo estado'} onClose={onClose}>
      <div className="space-y-3">
        <label className="block"><span className={lbl}>Código</span><input disabled={edit} value={f.codigo} onChange={(e) => setF({ ...f, codigo: e.target.value })} placeholder="en_revision" className={`${inp} mt-1 ${edit ? 'bg-slate-50 text-slate-400' : ''}`} /></label>
        <label className="block"><span className={lbl}>Etiqueta</span><input value={f.etiqueta} onChange={(e) => setF({ ...f, etiqueta: e.target.value })} placeholder="En Revisión" className={`${inp} mt-1`} /></label>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-[13px] text-slate-600"><input type="checkbox" checked={f.es_inicial} onChange={(e) => setF({ ...f, es_inicial: e.target.checked })} /> Inicial</label>
          <label className="flex items-center gap-2 text-[13px] text-slate-600"><input type="checkbox" checked={f.es_final} onChange={(e) => setF({ ...f, es_final: e.target.checked })} /> Final</label>
          <label className="flex items-center gap-2 text-[13px] text-slate-600 ml-auto"><span className={lbl}>Color</span><input type="color" value={f.color} onChange={(e) => setF({ ...f, color: e.target.value })} className="w-9 h-9 rounded border border-slate-200 p-0.5" /></label>
        </div>
        <label className="flex items-center gap-2 text-[13px] text-slate-600">Orden <input type="number" value={f.orden} onChange={(e) => setF({ ...f, orden: e.target.value })} className="w-20 border border-slate-200 rounded-lg px-2 py-1 text-sm" /></label>
        <button onClick={() => f.codigo && f.etiqueta ? onSave(f) : toast.error('Código y etiqueta son obligatorios')} className="w-full py-2.5 rounded-xl bg-orange-500 text-white text-sm font-bold hover:bg-orange-600">Guardar</button>
      </div>
    </Modal>
  );
}

function TransModal({ data, estados, permisos, onClose, onSave }) {
  const edit = !!data.id;
  const [f, setF] = useState({ id: data.id || '', desde: data.desde || '', hasta: data.hasta || '', accion: data.accion || '', permiso_id: data.permiso_id || '', orden: data.orden || 0 });
  return (
    <Modal title={edit ? 'Editar transición' : 'Nueva transición'} onClose={onClose}>
      <div className="space-y-3">
        <label className="block"><span className={lbl}>Desde (vacío = creación)</span>
          <select value={f.desde} onChange={(e) => setF({ ...f, desde: e.target.value })} className={`${inp} mt-1`}><option value="">● inicio (creación)</option>{estados.map((e) => <option key={e.codigo} value={e.codigo}>{e.etiqueta}</option>)}</select>
        </label>
        <label className="block"><span className={lbl}>Hasta</span>
          <select value={f.hasta} onChange={(e) => setF({ ...f, hasta: e.target.value })} className={`${inp} mt-1`}><option value="">—</option>{estados.map((e) => <option key={e.codigo} value={e.codigo}>{e.etiqueta}</option>)}</select>
        </label>
        <label className="block"><span className={lbl}>Acción</span><input value={f.accion} onChange={(e) => setF({ ...f, accion: e.target.value.trim() })} placeholder="avanzar / asignar / cancelar" className={`${inp} mt-1`} /></label>
        <label className="block"><span className={lbl}>Permiso requerido (opcional)</span>
          <select value={f.permiso_id} onChange={(e) => setF({ ...f, permiso_id: e.target.value })} className={`${inp} mt-1`}><option value="">— sin permiso específico —</option>{permisos.map((p) => <option key={p.id} value={p.id}>{p.id} · {p.nombre}</option>)}</select>
        </label>
        <label className="flex items-center gap-2 text-[13px] text-slate-600">Orden <input type="number" value={f.orden} onChange={(e) => setF({ ...f, orden: e.target.value })} className="w-20 border border-slate-200 rounded-lg px-2 py-1 text-sm" /></label>
        <button onClick={() => f.hasta && f.accion ? onSave(f) : toast.error('Hasta y acción son obligatorios')} className="w-full py-2.5 rounded-xl bg-orange-500 text-white text-sm font-bold hover:bg-orange-600">Guardar</button>
      </div>
    </Modal>
  );
}
