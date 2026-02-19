import React, { useState, useEffect } from 'react';
import { Search, MapPin, Box, Layers, RefreshCw, AlertCircle, Edit, Trash2, Save, X, Check } from 'lucide-react';
import { supabase } from '../../supabase';
import { useAuth } from '../../context/AuthContext'; // Importar AuthContext

const LocationsQuery = () => {
  const { user } = useAuth(); // Obtener usuario para verificar permisos
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Estado para edición
  const [editingId, setEditingId] = useState(null);
  const [editQuantity, setEditQuantity] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!searchTerm.trim()) return;

    setLoading(true);
    setSearched(true);
    setEditingId(null); // Cancelar edición si se busca de nuevo
    
    const term = `%${searchTerm.trim()}%`;

    try {
      // Buscar en wms_ubicaciones por código o descripción
      const { data, error } = await supabase
        .from('wms_ubicaciones')
        .select('*')
        .or(`codigo.ilike.${term},descripcion.ilike.${term},ubicacion.ilike.${term}`)
        .order('ubicacion', { ascending: true })
        .limit(100);

      if (error) throw error;

      setResults(data || []);
      setLastUpdated(new Date());

    } catch (err) {
      console.error("Error en búsqueda de ubicaciones:", err);
    } finally {
      setLoading(false);
    }
  };

  // Iniciar edición
  const startEdit = (row) => {
    setEditingId(row.id);
    setEditQuantity(row.cantidad);
    setEditLocation(row.ubicacion);
  };

  // Cancelar edición
  const cancelEdit = () => {
    setEditingId(null);
    setEditQuantity('');
    setEditLocation('');
  };

  // Guardar cambios
  const saveEdit = async (id) => {
    if (!editQuantity || isNaN(editQuantity) || Number(editQuantity) < 0) {
      alert("Por favor ingrese una cantidad válida");
      return;
    }
    
    if (!editLocation || !editLocation.trim()) {
      alert("La ubicación no puede estar vacía");
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('wms_ubicaciones')
        .update({ 
            cantidad: Number(editQuantity),
            ubicacion: editLocation.toUpperCase().trim()
        })
        .eq('id', id);

      if (error) throw error;

      // Actualizar estado local
      setResults(prev => prev.map(r => r.id === id ? { 
          ...r, 
          cantidad: Number(editQuantity),
          ubicacion: editLocation.toUpperCase().trim()
      } : r));
      
      setEditingId(null);
      alert("✅ Registro actualizado correctamente");
    } catch (err) {
      console.error("Error al actualizar:", err);
      alert("❌ Error al actualizar: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  // Eliminar registro
  const handleDelete = async (id, ubicacion, codigo) => {
    if (!window.confirm(`¿Estás seguro de eliminar el producto ${codigo} de la ubicación ${ubicacion}?`)) {
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('wms_ubicaciones')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Eliminar del estado local
      setResults(prev => prev.filter(r => r.id !== id));
      alert("🗑️ Registro eliminado correctamente");
    } catch (err) {
      console.error("Error al eliminar:", err);
      alert("❌ Error al eliminar: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  // Configuración de columnas para la tabla de resultados
  const COLUMNS = [
    { 
      header: 'Ubicación', 
      accessor: 'ubicacion', 
      render: r => editingId === r.id ? (
        <input 
          type="text" 
          value={editLocation} 
          onChange={(e) => setEditLocation(e.target.value)}
          className="w-32 p-1 border-2 border-orange-400 rounded text-center font-bold font-mono outline-none focus:ring-2 focus:ring-orange-200 uppercase"
        />
      ) : (
        <span className="font-mono font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded border border-rose-100 flex items-center gap-2 w-fit"><MapPin size={14}/>{r.ubicacion}</span>
      ) 
    },
    { header: 'Código', accessor: 'codigo', render: r => <span className="font-mono font-bold text-slate-700">{r.codigo}</span> },
    { header: 'Descripción', accessor: 'descripcion', render: r => <span className="font-bold text-slate-800 text-xs sm:text-sm">{r.descripcion}</span> },
    { 
      header: 'Cantidad', 
      accessor: 'cantidad', 
      render: r => editingId === r.id ? (
        <input 
          type="number" 
          value={editQuantity} 
          onChange={(e) => setEditQuantity(e.target.value)}
          className="w-20 p-1 border-2 border-orange-400 rounded text-center font-bold outline-none focus:ring-2 focus:ring-orange-200"
          autoFocus
        />
      ) : (
        <span className="font-black text-slate-900 bg-slate-100 px-2 py-1 rounded">{r.cantidad}</span> 
      )
    },
    { header: 'Talla', accessor: 'talla', render: r => r.talla || '-' },
    { header: 'Color', accessor: 'color', render: r => r.color || '-' },
    {
      header: 'Acciones',
      render: r => (
        <div className="flex items-center gap-2">
          {editingId === r.id ? (
            <>
              <button 
                onClick={() => saveEdit(r.id)} 
                disabled={saving}
                className="p-1.5 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                title="Guardar"
              >
                <Check size={16} />
              </button>
              <button 
                onClick={cancelEdit}
                disabled={saving}
                className="p-1.5 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
                title="Cancelar"
              >
                <X size={16} />
              </button>
            </>
          ) : (
            <>
              <button 
                onClick={() => startEdit(r)}
                className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                title="Editar Cantidad"
              >
                <Edit size={16} />
              </button>
              <button 
                onClick={() => handleDelete(r.id, r.ubicacion, r.codigo)}
                className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                title="Eliminar Registro"
              >
                <Trash2 size={16} />
              </button>
            </>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="h-full flex flex-col bg-slate-50 font-sans">
      {/* 1. Header de Búsqueda */}
      <div className="bg-white border-b border-slate-200 p-4 shadow-sm z-10 sticky top-0">
        <div className="max-w-[1600px] mx-auto w-full">
          <div className="flex justify-between items-center mb-4">
             <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
               <div className="p-2 bg-slate-900 rounded-lg text-white shadow-md">
                 <MapPin size={24} />
               </div>
               GESTIÓN DE UBICACIONES
             </h1>
             {searched && (
               <div className="text-xs font-mono text-slate-400 flex items-center gap-1 bg-slate-100 px-2 py-1 rounded border border-slate-200">
                 <RefreshCw size={12} />
                 SYNC: {lastUpdated.toLocaleTimeString()}
               </div>
             )}
          </div>
          
          <form onSubmit={handleSearch} className="relative group">
            <input
              type="text"
              className="w-full pl-12 sm:pl-14 pr-32 py-3 sm:py-4 text-lg sm:text-xl bg-slate-50 border-2 border-slate-200 rounded-2xl focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all shadow-inner uppercase font-mono text-slate-800 placeholder:text-slate-400"
              placeholder="BUSCAR POR CÓDIGO, UBICACIÓN..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              autoFocus
            />
            <Search className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors" size={24} />
            <button 
              type="submit"
              disabled={loading}
              className="absolute right-2 sm:right-3 top-2 sm:top-3 bottom-2 sm:bottom-3 bg-slate-900 hover:bg-black text-white px-4 sm:px-8 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl active:scale-95 flex items-center gap-2 text-sm sm:text-base"
            >
              {loading ? <RefreshCw className="animate-spin" /> : 'BUSCAR'}
            </button>
          </form>
        </div>
      </div>

      {/* 2. Área de Contenido */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/50">
        <div className="max-w-[1600px] mx-auto w-full">
          {searched ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
               {results.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-slate-400 bg-slate-50/50 rounded-lg border border-slate-200 border-dashed backdrop-blur-sm">
                  <Search size={48} className="mb-4 opacity-20" />
                  <p className="font-medium">No se encontraron productos en ubicaciones con ese término</p>
                </div>
               ) : (
                <div className="overflow-hidden rounded-xl shadow-xl border border-slate-200 bg-white ring-1 ring-slate-900/5">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="text-xs text-white uppercase bg-slate-900">
                        <tr>
                          {COLUMNS.map((col, i) => (
                            <th key={i} className="px-4 py-4 font-bold whitespace-nowrap tracking-wider first:rounded-tl-lg last:rounded-tr-lg">
                              {col.header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {results.map((row, idx) => (
                          <tr key={idx} className={`hover:bg-orange-50 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'} ${editingId === row.id ? 'bg-orange-50 ring-2 ring-inset ring-orange-200' : ''}`}>
                            {COLUMNS.map((col, cIdx) => (
                              <td key={cIdx} className="px-4 py-3 whitespace-nowrap text-slate-700 align-middle">
                                {col.render ? col.render(row) : (row[col.accessor] || '-')}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="bg-slate-50 px-4 py-3 border-t border-slate-200 text-xs text-slate-500 font-medium flex justify-between items-center">
                    <span>Mostrando {results.length} resultados</span>
                    {saving && <span className="flex items-center gap-2 text-orange-600"><RefreshCw size={12} className="animate-spin"/> Guardando cambios...</span>}
                  </div>
                </div>
               )}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-300 mt-20 animate-in zoom-in duration-500">
              <div className="p-8 bg-white rounded-full shadow-lg mb-6 border border-slate-100 ring-4 ring-slate-50">
                <MapPin size={64} className="text-slate-200" />
              </div>
              <p className="text-xl font-bold text-slate-400">Ingrese código o ubicación para gestionar</p>
              <p className="text-sm text-slate-400 mt-2 bg-slate-200/50 px-3 py-1 rounded-full">Sistema de Gestión WMS</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LocationsQuery;
