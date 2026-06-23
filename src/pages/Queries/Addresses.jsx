import React, { useState } from 'react';
import { Search, MapPin, Phone, Building, Loader2, Pencil, X, Save, Truck, Trash2, Check, Download } from 'lucide-react';
import { supabase } from '../../supabase';
import { withTimeout } from '../../lib/supabaseQuery';
import { exportToExcel } from '../../lib/exportExcel';
import { toast } from 'sonner';

// Campos editables del modal (clave en BD → etiqueta visible).
const EDIT_FIELDS = [
  { key: 'razon_social', label: 'Razón Social', full: true },
  { key: 'nombre',       label: 'Nombre / Fantasía', full: true },
  { key: 'rut',          label: 'RUT' },
  { key: 'transporte',   label: 'Transporte' },
  { key: 'direccion',    label: 'Dirección', full: true },
  { key: 'comuna',       label: 'Comuna' },
  { key: 'ciudad',       label: 'Ciudad' },
  { key: 'region',       label: 'Región' },
  { key: 'telefono_1',   label: 'Teléfono' },
];

const Addresses = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);
  const [searchTime, setSearchTime] = useState(0);

  // Edición
  const [editing, setEditing] = useState(null); // registro en edición (copia)
  const [saving, setSaving] = useState(false);

  // Eliminación (confirmación de 2 pasos)
  const [confirmId, setConfirmId] = useState(null); // id de fila pendiente de confirmar
  const [deletingId, setDeletingId] = useState(null);
  const [modalConfirm, setModalConfirm] = useState(false); // confirmación dentro del modal

  // Exportación de la matriz completa
  const [exporting, setExporting] = useState(false);
  const [exportMsg, setExportMsg] = useState('');

  // Descarga TODA la tabla tms_direcciones a Excel, paginando de a 1000
  // (Supabase corta a ~1000 filas por request).
  const descargarMatriz = async () => {
    setExporting(true);
    setExportMsg('Preparando…');
    try {
      const PAGE = 1000;
      let from = 0;
      const all = [];
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { data, error } = await withTimeout(
          supabase
            .from('tms_direcciones')
            .select('razon_social, nombre, rut, transporte, direccion, comuna, ciudad, region, telefono_1, latitud, longitud')
            .order('razon_social', { ascending: true })
            .range(from, from + PAGE - 1),
          { ms: 20000, label: 'descarga de matriz' }
        );
        if (error) throw error;
        if (!data || data.length === 0) break;
        all.push(...data);
        setExportMsg(`${all.length} registros…`);
        if (data.length < PAGE) break;
        from += PAGE;
      }
      if (all.length === 0) { toast.warning('No hay registros para exportar'); return; }

      const rows = all.map((r) => ({
        Razon_Social: r.razon_social || '', Nombre: r.nombre || '', RUT: r.rut || '',
        Transporte: r.transporte || '', Direccion: r.direccion || '',
        Comuna: r.comuna || '', Ciudad: r.ciudad || '', Region: r.region || '',
        Telefono: r.telefono_1 || '', Latitud: r.latitud ?? '', Longitud: r.longitud ?? '',
      }));
      exportToExcel({ filename: 'Maestro_Direcciones', sheets: [{ name: 'Direcciones', rows }] });
      toast.success(`Matriz descargada: ${all.length} registros`);
    } catch (err) {
      toast.error('No se pudo descargar: ' + err.message);
    } finally {
      setExporting(false);
      setExportMsg('');
    }
  };

  const handleSearch = async () => {
    if (!searchTerm || searchTerm.trim().length < 2) {
      toast.warning('Ingrese al menos 2 caracteres');
      return;
    }

    setLoading(true);
    const startTime = performance.now();

    try {
      // Una sola RPC rankeada en el servidor (RUT exacto > prefijo > similitud).
      const { data, error } = await withTimeout(
        supabase.rpc('buscar_direcciones', { p_query: searchTerm.trim(), p_limit: 100 }),
        { ms: 12000, label: 'búsqueda de direcciones' }
      );
      if (error) throw error;
      setResults(data || []);
      setSearched(true);
    } catch (err) {
      toast.error('Error en la búsqueda: ' + err.message);
    } finally {
      setSearchTime((performance.now() - startTime) / 1000);
      setLoading(false);
    }
  };

  const openEdit = (item) => { setModalConfirm(false); setEditing({ ...item }); };
  const closeEdit = () => { if (!saving) { setEditing(null); setModalConfirm(false); } };
  const setField = (key, value) => setEditing(prev => ({ ...prev, [key]: value }));

  // Elimina un registro por id (lo usa tanto la fila como el modal).
  const deleteRow = async (id) => {
    setDeletingId(id);
    try {
      const { error } = await withTimeout(
        supabase.from('tms_direcciones').delete().eq('id', id),
        { ms: 12000, label: 'eliminar dirección' }
      );
      if (error) throw error;
      setResults(prev => prev.filter(r => r.id !== id));
      toast.success('Registro eliminado');
      if (editing?.id === id) { setEditing(null); setModalConfirm(false); }
    } catch (err) {
      toast.error('No se pudo eliminar: ' + err.message);
    } finally {
      setDeletingId(null);
      setConfirmId(null);
    }
  };

  const saveEdit = async () => {
    if (!editing) return;
    if (!editing.razon_social || !editing.razon_social.trim()) {
      toast.warning('La Razón Social no puede quedar vacía');
      return;
    }
    setSaving(true);
    try {
      const patch = {};
      EDIT_FIELDS.forEach(({ key }) => {
        const v = editing[key];
        patch[key] = typeof v === 'string' ? (v.trim() || null) : (v ?? null);
      });
      patch.updated_at = new Date().toISOString();

      const { error } = await withTimeout(
        supabase.from('tms_direcciones').update(patch).eq('id', editing.id),
        { ms: 12000, label: 'guardar dirección' }
      );
      if (error) throw error;

      // Refleja el cambio en la tabla sin re-buscar.
      setResults(prev => prev.map(r => (r.id === editing.id ? { ...r, ...patch } : r)));
      toast.success('Registro actualizado');
      setEditing(null);
    } catch (err) {
      toast.error('No se pudo guardar: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-0">
      {/* Header Corporativo */}
      <div className="flex flex-wrap justify-between items-end gap-3">
        <div>
          <h2 className="text-lg sm:text-2xl font-bold text-slate-800">Maestro de Direcciones</h2>
          <p className="text-slate-500 text-xs sm:text-sm">Consulta, edición y limpieza de clientes y puntos de entrega</p>
        </div>
        <button
          onClick={descargarMatriz}
          disabled={exporting}
          title="Descargar toda la matriz a Excel"
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-60 text-sm"
        >
          {exporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
          {exporting ? (exportMsg || 'Descargando…') : 'Descargar matriz'}
        </button>
      </div>

      {/* Área de Trabajo */}
      <div className="bg-slate-50 min-h-[calc(100vh-200px)] rounded-xl border border-slate-200 p-3 sm:p-6 md:p-10">

        {/* Buscador Flotante Centrado */}
        <div className="max-w-3xl mx-auto mb-8">
          <div className="bg-white rounded-xl shadow-lg shadow-slate-200/50 flex items-center p-1.5 sm:p-2 border border-slate-100 transition-all focus-within:ring-4 focus-within:ring-indigo-100 focus-within:border-indigo-300">
            <div className="pl-2 sm:pl-4 pr-2 sm:pr-3 text-slate-500">
              <Search size={20} className="sm:hidden" />
              <Search size={24} className="hidden sm:block" />
            </div>
            <input
              type="text"
              className="flex-1 h-10 sm:h-12 outline-none text-sm sm:text-lg text-slate-700 placeholder:text-slate-500"
              placeholder="Buscar por RUT, Razón Social, Dirección..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              autoFocus
            />
            <button
              onClick={handleSearch}
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-3 sm:px-6 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-70 text-sm sm:text-base"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : 'BUSCAR'}
            </button>
          </div>
        </div>

        {/* Resultados */}
        <div className="max-w-6xl mx-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-500 animate-pulse">
              <Loader2 size={48} className="animate-spin mb-4 text-indigo-400" />
              <p>Buscando en servidor...</p>
            </div>
          ) : searched ? (
            results.length > 0 ? (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="text-xs font-bold text-slate-500 uppercase px-2">
                  Encontrados {results.length} resultados en {searchTime.toFixed(2)}s
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[820px]">
                      <thead className="bg-slate-50 border-b border-slate-100">
                        <tr>
                          <th className="px-2 sm:px-4 py-3 text-xs font-bold text-slate-500 uppercase w-1/4">Razón Social / Nombre</th>
                          <th className="px-2 sm:px-4 py-3 text-xs font-bold text-slate-500 uppercase w-32">RUT</th>
                          <th className="px-2 sm:px-4 py-3 text-xs font-bold text-slate-500 uppercase">Ubicación</th>
                          <th className="px-2 sm:px-4 py-3 text-xs font-bold text-slate-500 uppercase">Dirección</th>
                          <th className="px-2 sm:px-4 py-3 text-xs font-bold text-slate-500 uppercase">Transporte</th>
                          <th className="px-2 sm:px-4 py-3 text-xs font-bold text-slate-500 uppercase">Teléfono</th>
                          <th className="px-2 sm:px-4 py-3 text-xs font-bold text-slate-500 uppercase w-24 text-center">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {results.map((item) => (
                          <tr key={item.id} className="hover:bg-slate-50 transition-colors group">
                            <td className="px-2 sm:px-4 py-3 align-top">
                              <div className="font-bold text-slate-800 text-sm">{item.razon_social}</div>
                              {item.nombre && item.nombre !== item.razon_social && (
                                <div className="text-xs text-slate-500 mt-1">{item.nombre}</div>
                              )}
                            </td>
                            <td className="px-2 sm:px-4 py-3 align-top">
                              <span className="font-mono text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded border border-slate-200 block text-center">
                                {item.rut || '-'}
                              </span>
                            </td>
                            <td className="px-2 sm:px-4 py-3 align-top">
                              <div className="text-sm text-slate-700 font-medium">{item.comuna}</div>
                              <div className="text-xs text-slate-500 mt-0.5">{item.ciudad}, {item.region}</div>
                            </td>
                            <td className="px-2 sm:px-4 py-3 align-top">
                              <div className="flex items-start gap-2 text-sm text-slate-600">
                                <MapPin size={16} className="text-slate-500 mt-0.5 flex-shrink-0" />
                                <span>{item.direccion}</span>
                              </div>
                            </td>
                            <td className="px-2 sm:px-4 py-3 align-top">
                              {item.transporte ? (
                                <div className="flex items-center gap-2 text-sm text-slate-700">
                                  <Truck size={15} className="text-emerald-500 flex-shrink-0" />
                                  <span className="font-medium">{item.transporte}</span>
                                </div>
                              ) : (
                                <span className="text-xs text-slate-300 italic">—</span>
                              )}
                            </td>
                            <td className="px-2 sm:px-4 py-3 align-top space-y-1">
                              {item.telefono_1 && (
                                <div className="flex items-center gap-2 text-xs text-slate-600">
                                  <Phone size={14} /> {item.telefono_1}
                                </div>
                              )}
                            </td>
                            <td className="px-2 sm:px-4 py-3 align-top">
                              <div className="flex items-center justify-center gap-1">
                                {confirmId === item.id ? (
                                  <>
                                    <button
                                      onClick={() => deleteRow(item.id)}
                                      disabled={deletingId === item.id}
                                      title="Confirmar eliminación"
                                      className="p-2 rounded-lg text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-60"
                                    >
                                      {deletingId === item.id ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                                    </button>
                                    <button
                                      onClick={() => setConfirmId(null)}
                                      title="Cancelar"
                                      className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                                    >
                                      <X size={16} />
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <button
                                      onClick={() => openEdit(item)}
                                      title="Editar registro"
                                      className="p-2 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                                    >
                                      <Pencil size={16} />
                                    </button>
                                    <button
                                      onClick={() => { setConfirmId(item.id); }}
                                      title="Eliminar registro"
                                      className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-16 text-slate-500">
                <Search size={48} className="mx-auto mb-4 opacity-20" />
                <h3 className="text-lg font-bold text-slate-600 mb-1">Sin coincidencias</h3>
                <p>No se encontraron registros en la base de datos.</p>
              </div>
            )
          ) : (
            <div className="text-center py-20 text-slate-500">
              <Building size={48} className="mx-auto mb-4 opacity-10" />
              <h3 className="text-lg font-bold text-slate-500 mb-1">Búsqueda Corporativa</h3>
              <p>Ingresa RUT, Nombre o Dirección y presiona Enter.</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Modal de edición ── */}
      {editing && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4"
          onClick={closeEdit}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 sticky top-0 bg-white rounded-t-2xl">
              <div>
                <h3 className="text-lg font-black text-slate-800">Editar registro</h3>
                <p className="text-xs text-slate-400">{editing.razon_social || '—'}</p>
              </div>
              <button onClick={closeEdit} disabled={saving}
                className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-50">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {EDIT_FIELDS.map(({ key, label, full }) => (
                <div key={key} className={full ? 'sm:col-span-2' : ''}>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</label>
                  <input
                    value={editing[key] ?? ''}
                    onChange={(e) => setField(key, e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 text-sm font-medium outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                    placeholder={label}
                  />
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-slate-100 sticky bottom-0 bg-white rounded-b-2xl">
              {/* Eliminar (2 pasos) a la izquierda */}
              {modalConfirm ? (
                <button onClick={() => deleteRow(editing.id)} disabled={deletingId === editing.id}
                  className="px-4 py-2.5 rounded-xl bg-rose-600 text-white font-black text-sm flex items-center gap-2 hover:bg-rose-700 disabled:opacity-60">
                  {deletingId === editing.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />} ¿Confirmar?
                </button>
              ) : (
                <button onClick={() => setModalConfirm(true)} disabled={saving}
                  className="px-4 py-2.5 rounded-xl border border-rose-200 text-rose-600 font-bold text-sm flex items-center gap-2 hover:bg-rose-50 disabled:opacity-50">
                  <Trash2 size={16} /> Eliminar
                </button>
              )}
              <div className="flex gap-3">
                <button onClick={closeEdit} disabled={saving}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 disabled:opacity-50">
                  Cancelar
                </button>
                <button onClick={saveEdit} disabled={saving}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-black text-sm flex items-center gap-2 hover:bg-indigo-700 disabled:opacity-50">
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Guardar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Addresses;
