import React, { useEffect, useState } from 'react';
import { FolderOpen, Plus, Lock, Unlock, Trash2, Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../../supabase';
import { useAuth } from '../../context/AuthContext';
import { fechaLocal, getSesionActiva, setSesionActiva } from '../../components/inventory/ui';

export default function Sesiones() {
  const { user, hasPermission } = useAuth();
  const puedeGestionar = hasPermission?.('manage_inventory') ?? true;
  const [sesiones, setSesiones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activa, setActivaState] = useState(getSesionActiva());
  const [nombre, setNombre] = useState('');
  const [tipo, setTipo] = useState('ciclico');
  const [semana, setSemana] = useState('');
  const [creando, setCreando] = useState(false);

  const cargar = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('wms_cc_sesiones').select('*').order('created_at', { ascending: false });
    if (error) { toast.error('No se pudieron cargar las sesiones'); setLoading(false); return; }
    // conteos por sesión
    const { data: counts } = await supabase.from('wms_cc_conteos').select('sesion_id, codigo_producto');
    const porSesion = {};
    (counts || []).forEach((c) => {
      const s = (porSesion[c.sesion_id] = porSesion[c.sesion_id] || { total: 0, skus: new Set() });
      s.total += 1; s.skus.add(c.codigo_producto);
    });
    setSesiones((data || []).map((s) => ({ ...s, total_conteos: porSesion[s.id]?.total || 0, skus: porSesion[s.id]?.skus.size || 0 })));
    setLoading(false);
  };
  useEffect(() => { cargar(); /* eslint-disable-next-line */ }, []);

  const usar = (id) => { setSesionActiva(id); setActivaState(id); toast.success('Sesión activa cambiada'); };

  const crear = async () => {
    if (!nombre.trim()) return toast.error('Poné un nombre');
    setCreando(true);
    const { data, error } = await supabase.from('wms_cc_sesiones').insert({
      nombre: nombre.trim(), tipo, semana: semana ? Number(semana) : null,
      creado_por: user?.id || null, creado_por_nombre: user?.nombre || null,
    }).select().single();
    setCreando(false);
    if (error) return toast.error('No se pudo crear');
    toast.success('Sesión creada'); setNombre(''); setSemana('');
    usar(data.id); cargar();
  };

  const cambiarEstado = async (s) => {
    const nuevo = s.estado === 'abierta' ? 'cerrada' : 'abierta';
    const { error } = await supabase.from('wms_cc_sesiones').update({ estado: nuevo, closed_at: nuevo === 'cerrada' ? new Date().toISOString() : null }).eq('id', s.id);
    if (error) return toast.error('No se pudo cambiar');
    toast.success(`Sesión ${nuevo}`); cargar();
  };

  const eliminar = async (s) => {
    if (!confirm(`¿Eliminar la sesión "${s.nombre}" y todos sus conteos?`)) return;
    const { error } = await supabase.from('wms_cc_sesiones').delete().eq('id', s.id);
    if (error) return toast.error('No se pudo eliminar');
    if (activa === s.id) { setSesionActiva(''); setActivaState(''); }
    toast.success('Sesión eliminada'); cargar();
  };

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-100 grid place-items-center text-indigo-600"><FolderOpen size={22} /></div>
        <div><h1 className="text-lg font-black text-slate-900">Sesiones de conteo</h1><p className="text-xs text-slate-500">Campañas de conteo cíclico</p></div>
      </div>

      {puedeGestionar && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3 shadow-sm">
          <h2 className="font-black text-slate-700 text-sm">Nueva sesión</h2>
          <input className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm" placeholder="Nombre (ej: Conteo cíclico semana 27)" value={nombre} onChange={(e) => setNombre(e.target.value)} />
          <div className="grid grid-cols-2 gap-3">
            <select className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm" value={tipo} onChange={(e) => setTipo(e.target.value)}>
              <option value="ciclico">Cíclico</option><option value="total">Inventario total</option><option value="ubicacion">Por ubicación</option>
            </select>
            <input className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm" type="number" placeholder="Semana (opcional)" value={semana} onChange={(e) => setSemana(e.target.value)} />
          </div>
          <button onClick={crear} disabled={creando} className="w-full py-2.5 rounded-xl bg-indigo-600 text-white font-black flex items-center justify-center gap-2 hover:bg-indigo-700 disabled:opacity-50">{creando ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />} Crear sesión</button>
        </div>
      )}

      {loading ? <div className="grid place-items-center py-10"><Loader2 className="animate-spin text-indigo-500" size={30} /></div> :
        sesiones.length === 0 ? <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center text-slate-400">Todavía no hay sesiones.</div> :
        <div className="space-y-3">
          {sesiones.map((s) => (
            <div key={s.id} className={'bg-white rounded-2xl border p-4 shadow-sm ' + (activa === s.id ? 'border-indigo-400 ring-1 ring-indigo-200' : 'border-slate-200')}>
              <div className="flex items-center gap-2">
                <span className="font-black text-slate-800 truncate">{s.nombre}</span>
                <span className={'text-[10px] font-bold px-2 py-0.5 rounded-full ' + (s.estado === 'abierta' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600')}>{s.estado === 'abierta' ? 'Abierta' : 'Cerrada'}</span>
                {activa === s.id && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 flex items-center gap-1"><CheckCircle2 size={11} /> Activa</span>}
              </div>
              <div className="mt-1 text-xs text-slate-400">{s.tipo}{s.semana ? ` · semana ${s.semana}` : ''} · {s.creado_por_nombre || ''} · {fechaLocal(s.created_at)}</div>
              <div className="mt-2 flex gap-3 text-sm text-slate-600"><span>📋 {s.total_conteos} conteos</span><span>🏷️ {s.skus} SKUs</span></div>
              <div className="mt-3 flex flex-wrap gap-2">
                <button disabled={s.estado === 'cerrada'} onClick={() => usar(s.id)} className={'px-3 py-2 rounded-xl text-xs font-black disabled:opacity-40 ' + (activa === s.id ? 'bg-indigo-600 text-white' : 'border border-slate-200 text-slate-600')}>{activa === s.id ? '✓ Activa' : 'Usar'}</button>
                {puedeGestionar && <button onClick={() => cambiarEstado(s)} className="px-3 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-black flex items-center gap-1.5">{s.estado === 'abierta' ? <><Lock size={13} /> Cerrar</> : <><Unlock size={13} /> Reabrir</>}</button>}
                {puedeGestionar && <button onClick={() => eliminar(s)} className="px-3 py-2 rounded-xl border border-slate-200 text-rose-600 text-xs font-black flex items-center gap-1.5"><Trash2 size={13} /> Eliminar</button>}
              </div>
            </div>
          ))}
        </div>}
    </div>
  );
}
