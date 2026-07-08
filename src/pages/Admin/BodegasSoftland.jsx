import React, { useState } from 'react';
import { toast } from 'sonner';
import { Warehouse, Plus, Loader2, Save, Trash2, X, Pencil } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  useBodegasSoftland, useGuardarBodegaSoftland, useEliminarBodegaSoftland,
} from '../../services/calidadService';

const VACIA = { codigo: '', nombre: '', estado: 'DISPONIBLE', es_destino_dictamen: false, activo: true, orden: 100 };

const BodegasSoftland = () => {
  const { user } = useAuth();
  const isAdmin = user?.rol === 'ADMIN' || user?.es_admin_delegado;
  const { data: bodegas = [], isLoading } = useBodegasSoftland();
  const guardar = useGuardarBodegaSoftland();
  const eliminar = useEliminarBodegaSoftland();
  const [edit, setEdit] = useState(null); // fila en edición (o VACIA para nueva)

  const abrirNueva = () => setEdit({ ...VACIA });
  const abrirEditar = (b) => setEdit({ ...b });

  const guardarFila = async () => {
    if (!edit.codigo.trim()) { toast.error('El código es obligatorio'); return; }
    if (!edit.nombre.trim()) { toast.error('El nombre es obligatorio'); return; }
    try {
      await guardar.mutateAsync({
        codigo: edit.codigo.trim(), nombre: edit.nombre.trim(), estado: edit.estado,
        esDestino: edit.es_destino_dictamen, activo: edit.activo, orden: Number(edit.orden) || 100,
      });
      toast.success('Bodega guardada'); setEdit(null);
    } catch (e) { toast.error(`No se pudo guardar: ${e.message}`); }
  };
  const borrar = async (b) => {
    if (!confirm(`¿Eliminar la bodega ${b.codigo} — ${b.nombre}?`)) return;
    try { await eliminar.mutateAsync(b.codigo); toast.success('Bodega eliminada'); }
    catch (e) { toast.error(`No se pudo eliminar: ${e.message}`); }
  };

  if (!isAdmin) {
    return <div className="p-8 text-center text-slate-400 font-bold">Solo un administrador puede gestionar las bodegas Softland.</div>;
  }

  return (
    <div className="h-full bg-slate-50 p-3 sm:p-6 min-h-screen">
      <div className="bg-white rounded-2xl sm:rounded-[2rem] border border-slate-200 shadow-sm p-5 sm:p-7 mb-5 flex flex-wrap items-center justify-between gap-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 via-sky-400 to-indigo-500" />
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600">
            <Warehouse size={30} strokeWidth={2.2} />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Bodegas <span className="text-indigo-600">Softland</span></h1>
            <p className="text-slate-500 font-bold text-sm">Códigos y estados del ERP usados como destino del dictamen de Calidad</p>
          </div>
        </div>
        <button onClick={abrirNueva}
          className="px-5 py-3 bg-indigo-600 text-white rounded-2xl font-black flex items-center gap-2 shadow-lg shadow-indigo-600/20 hover:bg-indigo-700">
          <Plus size={20} /> Nueva bodega
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-indigo-500" size={36} /></div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-[11px] font-black uppercase tracking-widest">
                  <th className="text-left px-4 py-3">Código</th>
                  <th className="text-left px-4 py-3">Nombre</th>
                  <th className="text-left px-4 py-3">Estado</th>
                  <th className="text-center px-4 py-3">Destino dictamen</th>
                  <th className="text-center px-4 py-3">Activa</th>
                  <th className="text-center px-4 py-3">Orden</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {bodegas.map(b => (
                  <tr key={b.codigo} className="hover:bg-slate-50/60">
                    <td className="px-4 py-3 font-mono font-black text-slate-800">{b.codigo}</td>
                    <td className="px-4 py-3 font-bold text-slate-700">{b.nombre}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-md border ${b.estado === 'TRANSITORIO' ? 'bg-amber-100 text-amber-700 border-amber-200' : 'bg-emerald-100 text-emerald-700 border-emerald-200'}`}>
                        {b.estado === 'TRANSITORIO' ? 'Transitorio' : 'Disponible'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">{b.es_destino_dictamen ? '✓' : '—'}</td>
                    <td className="px-4 py-3 text-center">{b.activo ? '✓' : '—'}</td>
                    <td className="px-4 py-3 text-center text-slate-400">{b.orden}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        <button onClick={() => abrirEditar(b)} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"><Pencil size={15} /></button>
                        <button onClick={() => borrar(b)} className="p-1.5 rounded-lg text-slate-300 hover:bg-rose-100 hover:text-rose-600"><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {bodegas.length === 0 && (
                  <tr><td colSpan={7} className="px-4 py-10 text-center text-slate-400">Sin bodegas cargadas.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {edit && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-3" onClick={() => setEdit(null)}>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h3 className="font-black text-slate-900">{bodegas.some(b => b.codigo === edit.codigo) ? `Editar bodega ${edit.codigo}` : 'Nueva bodega Softland'}</h3>
              <button onClick={() => setEdit(null)} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400"><X size={18} /></button>
            </div>
            <div className="p-5 grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Código *</label>
                <input value={edit.codigo} disabled={bodegas.some(b => b.codigo === edit.codigo)}
                  onChange={e => setEdit({ ...edit, codigo: e.target.value })} placeholder="Ej. 5"
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold outline-none focus:border-indigo-400 disabled:bg-slate-50" />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Orden</label>
                <input value={edit.orden} onChange={e => setEdit({ ...edit, orden: e.target.value.replace(/[^0-9]/g, '') })}
                  inputMode="numeric" className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-400" />
              </div>
              <div className="col-span-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nombre *</label>
                <input value={edit.nombre} onChange={e => setEdit({ ...edit, nombre: e.target.value })} placeholder="Ej. Transitorio / Servicio Técnico"
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-400" />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Estado</label>
                <select value={edit.estado} onChange={e => setEdit({ ...edit, estado: e.target.value })}
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold outline-none focus:border-indigo-400">
                  <option value="DISPONIBLE">Disponible</option>
                  <option value="TRANSITORIO">Transitorio</option>
                </select>
              </div>
              <div className="flex items-end gap-4 pb-1">
                <label className="flex items-center gap-2 text-sm font-bold text-slate-600">
                  <input type="checkbox" checked={edit.es_destino_dictamen} onChange={e => setEdit({ ...edit, es_destino_dictamen: e.target.checked })} /> Destino dictamen
                </label>
                <label className="flex items-center gap-2 text-sm font-bold text-slate-600">
                  <input type="checkbox" checked={edit.activo} onChange={e => setEdit({ ...edit, activo: e.target.checked })} /> Activa
                </label>
              </div>
            </div>
            <div className="p-4 border-t border-slate-100 flex justify-end gap-2">
              <button onClick={() => setEdit(null)} className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-black text-sm hover:bg-slate-50">Cancelar</button>
              <button onClick={guardarFila} disabled={guardar.isPending}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-black text-sm flex items-center gap-2 hover:bg-indigo-700 disabled:opacity-50">
                {guardar.isPending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BodegasSoftland;
