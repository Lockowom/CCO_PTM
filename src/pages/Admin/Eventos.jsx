import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Zap, Bell, SlidersHorizontal, Inbox, RefreshCw, Plus, X, Pencil, Trash2, Send, Check, CheckCheck, Radio } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { listarEventos, listarReglas, guardarRegla, eliminarRegla, listarBandeja, misNotificaciones, marcarLeida, marcarTodasLeidas, despacharPush } from '../../services/eventosService';

const fmt = (ts) => { if (!ts) return '—'; const d = new Date(ts); return isNaN(d) ? '—' : d.toLocaleString('es-CL', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }); };
const AGG = { OT: '#06b6d4', TICKET_PV: '#7c3aed', NV: '#f59e0b', CALIDAD: '#ef4444', CONTEO: '#10b981' };
const CANAL = { 'in-app': { l: 'In-app', c: '#2563eb' }, push: { l: 'Push', c: '#7c3aed' }, correo: { l: 'Correo', c: '#0891b2' } };
const inp = 'w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-orange-400';
const lbl = 'text-[11px] font-bold text-slate-500 uppercase tracking-wide';

export default function Eventos() {
  const { hasPermission, user } = useAuth();
  const puede = hasPermission('manage_eventos') || user?.rol === 'ADMIN' || user?.es_admin_delegado;

  const [tab, setTab] = useState('mis');
  const [eventos, setEventos] = useState([]);
  const [reglas, setReglas] = useState([]);
  const [bandeja, setBandeja] = useState([]);
  const [mias, setMias] = useState([]);
  const [modal, setModal] = useState(null);
  const [aggF, setAggF] = useState('todos');
  const [busy, setBusy] = useState(false);

  const cargar = useCallback(async () => {
    const [e, r, b, m] = await Promise.all([listarEventos({ agregado: aggF }), listarReglas(), listarBandeja({}), misNotificaciones()]);
    setEventos(e); setReglas(r); setBandeja(b); setMias(m);
  }, [aggF]);
  useEffect(() => { cargar(); }, [cargar]);

  const run = async (fn, ok) => { const res = await fn; if (res?.ok) { toast.success(ok); return true; } toast.error(res?.error || 'Error'); return false; };
  const saveRegla = async (f) => { if (await run(guardarRegla(f), 'Regla guardada')) { setModal(null); cargar(); } };
  const delRegla = async (id) => { if (!window.confirm('¿Eliminar la regla?')) return; if (await run(eliminarRegla(id), 'Regla eliminada')) cargar(); };
  const toggleRegla = async (r) => { if (await run(guardarRegla({ ...r, activo: !r.activo }), 'Actualizada')) cargar(); };
  const leer = async (id) => { await marcarLeida(id); setMias((m) => m.filter((x) => x.id !== id)); };
  const leerTodas = async () => { await marcarTodasLeidas(); setMias([]); toast.success('Marcadas como leídas'); };
  const enviarPush = async () => { setBusy(true); const r = await despacharPush(); setBusy(false); if (r.ok) { toast.success(`Push enviados: ${r.enviados}/${r.total || 0}`); cargar(); } else toast.error('No se pudo despachar'); };

  const pendientesPush = useMemo(() => bandeja.filter((n) => n.canal === 'push' && n.estado === 'pendiente').length, [bandeja]);
  const TABS = [['mis', `Mis notificaciones${mias.length ? ` (${mias.length})` : ''}`, Bell], ['stream', 'Stream de eventos', Radio], ['reglas', `Reglas (${reglas.length})`, SlidersHorizontal], ['bandeja', 'Bandeja de salida', Inbox]];

  return (
    <div className="anim-fade-up space-y-4 max-w-[1200px] mx-auto pb-16">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 text-white grid place-items-center shadow-lg shadow-orange-500/20"><Zap size={22} /></div>
          <div><h1 className="text-xl font-black text-slate-800 leading-tight">Eventos y Notificaciones</h1><p className="text-[13px] text-slate-500">Motor de eventos del sistema · reglas · entrega in-app y push (Capgo/FCM)</p></div>
        </div>
        <button onClick={cargar} className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-600 hover:bg-slate-50"><RefreshCw size={15} /> Actualizar</button>
      </div>

      <div className="flex gap-1 flex-wrap">
        {TABS.map(([k, l, Icon]) => (
          <button key={k} onClick={() => setTab(k)} className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-[13px] font-bold transition-colors ${tab === k ? 'bg-orange-100 text-orange-700' : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'}`}><Icon size={14} /> {l}</button>
        ))}
      </div>

      {/* MIS NOTIFICACIONES */}
      {tab === 'mis' && (
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
          <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between">
            <span className="text-[11px] font-black text-slate-400 uppercase">Sin leer ({mias.length})</span>
            {mias.length > 0 && <button onClick={leerTodas} className="text-[12px] font-bold text-orange-600 hover:text-orange-700 inline-flex items-center gap-1"><CheckCheck size={14} /> Marcar todas</button>}
          </div>
          {mias.length === 0 ? <div className="py-14 text-center text-slate-400 text-sm">No tienes notificaciones sin leer.</div> : (
            <div className="divide-y divide-slate-100">
              {mias.map((n) => (
                <div key={n.id} className="flex items-start gap-3 px-4 py-3 hover:bg-slate-50">
                  <span className="w-2 h-2 rounded-full bg-orange-500 mt-1.5 shrink-0" />
                  <div className="min-w-0 flex-1"><div className="font-bold text-[13px] text-slate-800">{n.titulo}</div><div className="text-[12px] text-slate-500">{n.mensaje}</div><div className="text-[10px] text-slate-400 mt-0.5">{fmt(n.creado_en)}</div></div>
                  <button onClick={() => leer(n.id)} title="Marcar leída" className="w-8 h-8 rounded-lg hover:bg-white grid place-items-center text-slate-400 shrink-0"><Check size={16} /></button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* STREAM DE EVENTOS */}
      {tab === 'stream' && (
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
          <div className="px-4 py-2.5 border-b border-slate-100 flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-black text-slate-400 uppercase mr-1">Filtrar</span>
            {['todos', 'OT', 'TICKET_PV', 'NV', 'CALIDAD', 'CONTEO'].map((a) => (
              <button key={a} onClick={() => setAggF(a)} className={`text-[11px] font-bold px-2 py-1 rounded-lg ${aggF === a ? 'bg-orange-100 text-orange-700' : 'text-slate-500 hover:bg-slate-100'}`}>{a}</button>
            ))}
          </div>
          {eventos.length === 0 ? <div className="py-14 text-center text-slate-400 text-sm">Aún no hay eventos. Se generan al operar los procesos (crear/mover órdenes, tickets, N.V., etc.).</div> : (
            <div className="divide-y divide-slate-100 max-h-[60vh] overflow-y-auto">
              {eventos.map((e) => (
                <div key={e.id} className="flex items-center gap-3 px-4 py-2.5 text-[12px]">
                  <span className="text-[10px] font-black text-white rounded px-1.5 py-0.5 shrink-0" style={{ background: AGG[e.agregado] || '#64748b' }}>{e.agregado}</span>
                  <span className="font-mono font-bold text-slate-700">{e.nombre}</span>
                  <span className="text-slate-400 font-mono text-[11px]">{e.agregado_id}</span>
                  {e.payload?.hasta && <span className="text-slate-500">{e.payload.desde || '(inicio)'} → <b>{e.payload.hasta}</b></span>}
                  <span className="ml-auto text-[10px] text-slate-400 shrink-0">{e.actor || '—'} · {fmt(e.creado_en)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* REGLAS */}
      {tab === 'reglas' && (
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
          <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between">
            <span className="text-[11px] font-black text-slate-400 uppercase">Reglas de notificación</span>
            {puede && <button onClick={() => setModal({})} className="text-[12px] font-bold text-orange-600 hover:text-orange-700 inline-flex items-center gap-1"><Plus size={14} /> Nueva regla</button>}
          </div>
          {reglas.length === 0 ? <div className="py-14 text-center text-slate-400 text-sm">Sin reglas.</div> : (
            <div className="divide-y divide-slate-100">
              {reglas.map((r) => {
                const c = CANAL[r.canal] || { l: r.canal, c: '#64748b' };
                return (
                  <div key={r.id} className="flex items-center gap-3 px-4 py-3">
                    <button onClick={() => puede && toggleRegla(r)} disabled={!puede} className={`w-9 h-5 rounded-full shrink-0 relative transition-colors ${r.activo ? 'bg-emerald-400' : 'bg-slate-200'}`}><span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${r.activo ? 'left-4' : 'left-0.5'}`} /></button>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap"><span className="font-bold text-[13px] text-slate-800">{r.nombre}</span><span className="text-[9px] font-black text-white rounded px-1.5 py-0.5" style={{ background: c.c }}>{c.l}</span>{r.destinatario_rol && <span className="text-[10px] font-mono text-slate-400">→ {r.destinatario_rol}</span>}</div>
                      <div className="text-[11px] font-mono text-slate-400 truncate">{r.evento_patron}</div>
                      <div className="text-[11px] text-slate-500 truncate">“{r.titulo_tpl}” · {r.mensaje_tpl}</div>
                    </div>
                    {puede && <div className="flex items-center gap-0.5 shrink-0">
                      <button onClick={() => setModal(r)} className="w-8 h-8 rounded-lg hover:bg-slate-100 grid place-items-center text-slate-400"><Pencil size={14} /></button>
                      <button onClick={() => delRegla(r.id)} className="w-8 h-8 rounded-lg hover:bg-red-50 grid place-items-center text-red-400"><Trash2 size={14} /></button>
                    </div>}
                  </div>
                );
              })}
            </div>
          )}
          <div className="px-4 py-2 border-t border-slate-100 text-[10px] text-slate-400">Patrón = regex POSIX contra el nombre del evento (ej. <code>^OT\.registrar_pod$</code>). Placeholders en plantillas: <code>{'{agregado} {id} {desde} {hasta} {actor}'}</code>.</div>
        </div>
      )}

      {/* BANDEJA DE SALIDA */}
      {tab === 'bandeja' && (
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
          <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between gap-2 flex-wrap">
            <span className="text-[11px] font-black text-slate-400 uppercase">Notificaciones generadas</span>
            {puede && <button onClick={enviarPush} disabled={busy || !pendientesPush} className="text-[12px] font-bold text-white bg-orange-500 hover:bg-orange-600 disabled:opacity-40 rounded-lg px-3 py-1.5 inline-flex items-center gap-1.5"><Send size={13} /> {busy ? 'Enviando…' : `Enviar push pendientes${pendientesPush ? ` (${pendientesPush})` : ''}`}</button>}
          </div>
          {bandeja.length === 0 ? <div className="py-14 text-center text-slate-400 text-sm">Sin notificaciones generadas todavía.</div> : (
            <div className="divide-y divide-slate-100 max-h-[60vh] overflow-y-auto">
              {bandeja.map((n) => {
                const c = CANAL[n.canal] || { l: n.canal, c: '#64748b' };
                const est = n.estado === 'pendiente' ? 'text-amber-600 bg-amber-50' : n.estado === 'leido' ? 'text-slate-500 bg-slate-100' : n.estado === 'enviado' ? 'text-emerald-600 bg-emerald-50' : 'text-red-600 bg-red-50';
                return (
                  <div key={n.id} className="flex items-center gap-3 px-4 py-2.5 text-[12px]">
                    <span className="text-[9px] font-black text-white rounded px-1.5 py-0.5 shrink-0" style={{ background: c.c }}>{c.l}</span>
                    <div className="min-w-0 flex-1"><span className="font-bold text-slate-700">{n.titulo}</span> <span className="text-slate-500">{n.mensaje}</span></div>
                    {n.destinatario_rol && <span className="text-[10px] font-mono text-slate-400 shrink-0">{n.destinatario_rol}</span>}
                    <span className={`text-[9px] font-black rounded px-1.5 py-0.5 shrink-0 ${est}`}>{n.estado}</span>
                    <span className="text-[10px] text-slate-400 shrink-0 w-20 text-right">{fmt(n.creado_en)}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {modal && <ReglaModal data={modal} onClose={() => setModal(null)} onSave={saveRegla} />}
    </div>
  );
}

function ReglaModal({ data, onClose, onSave }) {
  const edit = !!data.id;
  const [f, setF] = useState({ id: data.id || '', nombre: data.nombre || '', evento_patron: data.evento_patron || '', canal: data.canal || 'in-app', destinatario_rol: data.destinatario_rol || 'ADMIN', titulo_tpl: data.titulo_tpl || '{agregado} {id}', mensaje_tpl: data.mensaje_tpl || '{agregado} {id}: {desde} → {hasta}', activo: data.activo !== false, orden: data.orden || 0 });
  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
      <div onClick={(e) => e.stopPropagation()} className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-5 max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-3"><h3 className="text-[15px] font-black text-slate-800">{edit ? 'Editar regla' : 'Nueva regla'}</h3><button onClick={onClose} className="text-slate-400"><X size={18} /></button></div>
        <div className="space-y-3">
          <label className="block"><span className={lbl}>Nombre</span><input value={f.nombre} onChange={(e) => setF({ ...f, nombre: e.target.value })} className={`${inp} mt-1`} placeholder="Entrega registrada" /></label>
          <label className="block"><span className={lbl}>Patrón de evento (regex)</span><input value={f.evento_patron} onChange={(e) => setF({ ...f, evento_patron: e.target.value })} className={`${inp} mt-1 font-mono text-[13px]`} placeholder="^OT\.registrar_pod$" /></label>
          <div className="grid grid-cols-2 gap-2">
            <label className="block"><span className={lbl}>Canal</span><select value={f.canal} onChange={(e) => setF({ ...f, canal: e.target.value })} className={`${inp} mt-1`}><option value="in-app">In-app</option><option value="push">Push (Capgo/FCM)</option><option value="correo">Correo</option></select></label>
            <label className="block"><span className={lbl}>Rol destino</span><input value={f.destinatario_rol} onChange={(e) => setF({ ...f, destinatario_rol: e.target.value })} className={`${inp} mt-1`} placeholder="ADMIN" /></label>
          </div>
          <label className="block"><span className={lbl}>Título (plantilla)</span><input value={f.titulo_tpl} onChange={(e) => setF({ ...f, titulo_tpl: e.target.value })} className={`${inp} mt-1`} /></label>
          <label className="block"><span className={lbl}>Mensaje (plantilla)</span><textarea rows={2} value={f.mensaje_tpl} onChange={(e) => setF({ ...f, mensaje_tpl: e.target.value })} className={`${inp} mt-1 resize-none`} /></label>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-[13px] text-slate-600"><input type="checkbox" checked={f.activo} onChange={(e) => setF({ ...f, activo: e.target.checked })} /> Activa</label>
            <label className="flex items-center gap-2 text-[13px] text-slate-600 ml-auto">Orden <input type="number" value={f.orden} onChange={(e) => setF({ ...f, orden: e.target.value })} className="w-20 border border-slate-200 rounded-lg px-2 py-1 text-sm" /></label>
          </div>
          <div className="text-[10px] text-slate-400">Placeholders: <code>{'{agregado} {id} {desde} {hasta} {actor}'}</code></div>
          <button onClick={() => f.nombre && f.evento_patron ? onSave(f) : toast.error('Nombre y patrón son obligatorios')} className="w-full py-2.5 rounded-xl bg-orange-500 text-white text-sm font-bold hover:bg-orange-600">Guardar</button>
        </div>
      </div>
    </div>
  );
}
