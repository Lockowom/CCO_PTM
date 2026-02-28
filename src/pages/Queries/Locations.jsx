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
    <div className="space-y-8">
      {/* Header Moderno */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 page-header">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-200">
              <MapPin className="text-white" size={24} />
            </div>
            Gestión de Ubicaciones
          </h1>
          <p className="text-slate-500 text-lg mt-2 ml-1">Control de inventario por posición</p>
        </div>
        
        {/* Stats Rápidos */}
        {results.length > 0 && (
           <div className="flex gap-4">
              <div className="bg-white px-4 py-2 rounded-xl border border-slate-100 shadow-sm">
                <p className="text-xs text-slate-400 font-bold uppercase">Resultados</p>
                <p className="text-xl font-black text-slate-800">{results.length}</p>
              </div>
              <div className="bg-white px-4 py-2 rounded-xl border border-slate-100 shadow-sm">
                <p className="text-xs text-slate-400 font-bold uppercase">Total Items</p>
                <p className="text-xl font-black text-indigo-600">
                  {results.reduce((acc, curr) => acc + (parseInt(curr.cantidad) || 0), 0)}
                </p>
              </div>
           </div>
        )}
      </div>

      {/* Barra de Búsqueda Flotante */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-lg shadow-slate-100/50 flex flex-col md:flex-row gap-2 items-center filters-bar sticky top-4 z-30 backdrop-blur-xl bg-white/90">
        <div className="flex-1 relative w-full group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
          <form onSubmit={handleSearch} className="w-full">
            <input 
              type="text"
              placeholder="Buscar por código, ubicación o descripción..."
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border-transparent rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all placeholder-slate-400 font-medium uppercase"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
            />
          </form>
        </div>
        <button 
          onClick={handleSearch}
          disabled={loading}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-indigo-200 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 w-full md:w-auto justify-center"
        >
          {loading ? <RefreshCw className="animate-spin" size={20} /> : <Search size={20} />}
          Buscar
        </button>
      </div>

      {/* Resultados Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Box size={20} className="text-indigo-600" />
            </div>
          </div>
          <p className="text-slate-400 font-medium animate-pulse">Buscando en almacén...</p>
        </div>
      ) : !searched ? (
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <div className="bg-slate-50 p-8 rounded-full border border-slate-100 mb-6">
            <Layers size={64} className="text-slate-300" />
          </div>
          <h3 className="text-xl font-bold text-slate-600">Sistema WMS</h3>
          <p className="text-slate-400 mt-2 max-w-md">
            Ingresa un código de producto o una posición de rack para gestionar el inventario.
          </p>
        </div>
      ) : results.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
          <div className="bg-white p-6 rounded-full shadow-sm mb-4">
            <AlertCircle size={48} className="text-slate-300" />
          </div>
          <h3 className="text-xl font-bold text-slate-600">No se encontraron resultados</h3>
          <p className="text-slate-400 mt-1">Verifique el código o la ubicación ingresada</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {results.map(row => (
            <div key={row.id} className={`group bg-white rounded-3xl border shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden relative ${
              editingId === row.id ? 'ring-2 ring-indigo-500 border-indigo-500' : 'border-slate-200'
            }`}>
              {/* Header Card */}
              <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-start">
                <div>
                   {editingId === row.id ? (
                     <input 
                       type="text" 
                       value={editLocation} 
                       onChange={(e) => setEditLocation(e.target.value)}
                       className="w-full bg-white border-2 border-indigo-500 rounded-lg px-2 py-1 font-mono font-black text-indigo-700 text-lg uppercase outline-none"
                       autoFocus
                     />
                   ) : (
                     <div className="flex items-center gap-2 font-mono font-black text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100 w-fit">
                       <MapPin size={16} />
                       {row.ubicacion}
                     </div>
                   )}
                </div>
                <div className="flex gap-1">
                   {editingId === row.id ? (
                     <>
                       <button onClick={() => saveEdit(row.id)} className="p-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors shadow-sm">
                         <Check size={18} />
                       </button>
                       <button onClick={cancelEdit} className="p-2 bg-slate-200 text-slate-600 rounded-lg hover:bg-slate-300 transition-colors">
                         <X size={18} />
                       </button>
                     </>
                   ) : (
                     <>
                       <button onClick={() => startEdit(row)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                         <Edit size={18} />
                       </button>
                       <button onClick={() => handleDelete(row.id, row.ubicacion, row.codigo)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
                         <Trash2 size={18} />
                       </button>
                     </>
                   )}
                </div>
              </div>

              {/* Body Card */}
              <div className="p-5 space-y-4">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Producto</p>
                  <p className="font-mono font-bold text-slate-800 text-lg">{row.codigo}</p>
                  <p className="text-sm text-slate-600 font-medium line-clamp-2 leading-tight mt-1">{row.descripcion}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Cantidad</p>
                    {editingId === row.id ? (
                      <input 
                        type="number" 
                        value={editQuantity} 
                        onChange={(e) => setEditQuantity(e.target.value)}
                        className="w-full bg-white border-2 border-indigo-500 rounded px-1 py-0.5 font-bold text-slate-800 outline-none mt-1"
                      />
                    ) : (
                      <p className="text-2xl font-black text-slate-800">{row.cantidad}</p>
                    )}
                  </div>
                  <div className="space-y-1">
                     <div>
                       <p className="text-[10px] font-bold text-slate-400 uppercase">Talla</p>
                       <p className="font-bold text-slate-700 text-sm">{row.talla || '-'}</p>
                     </div>
                     <div>
                       <p className="text-[10px] font-bold text-slate-400 uppercase">Color</p>
                       <p className="font-bold text-slate-700 text-sm">{row.color || '-'}</p>
                     </div>
                  </div>
                </div>
              </div>
              
              {/* Footer Decoration */}
              <div className="h-1 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LocationsQuery;
