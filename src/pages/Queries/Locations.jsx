import React, { useState, useEffect, useMemo } from 'react';
import { Search, MapPin, Box, Layers, RefreshCw, AlertCircle, Edit, Trash2, Save, X, Check, Download, LayoutGrid, List } from 'lucide-react';
import { supabase } from '../../supabase';
import { useAuth } from '../../context/AuthContext'; // Importar AuthContext

const LocationsQuery = () => {
  const { user } = useAuth(); // Obtener usuario para verificar permisos
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [viewMode, setViewMode] = useState('grid'); // 'grid' o 'table'
  const [groupByLocation, setGroupByLocation] = useState(false); // Nuevo filtro de agrupación

  // Estado para edición
  const [editingId, setEditingId] = useState(null);
  const [editQuantity, setEditQuantity] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState(false);

  // Función para exportar ubicaciones a CSV (Solo Admin)
  const handleDownloadExcel = async () => {
    try {
      setDownloading(true);
      
      let allData = [];
      let page = 0;
      let hasMore = true;
      const pageSize = 1000;

      // Obtener todos los datos usando paginación basada en rangos (range)
      while (hasMore) {
        const from = page * pageSize;
        const to = from + pageSize - 1;

        const { data, error } = await supabase
          .from('wms_ubicaciones')
          .select('*')
          .order('id', { ascending: true })
          .range(from, to);

        if (error) throw error;

        if (data && data.length > 0) {
          allData = [...allData, ...data];
          
          if (data.length < pageSize) {
            hasMore = false; // Se trajeron todos
          } else {
            page++; // Ir a la siguiente página
          }
        } else {
          hasMore = false;
        }
      }

      if (allData.length === 0) {
        alert('No hay datos para descargar.');
        return;
      }

      // Ordenar al final en memoria por ubicación para que se vea bien en el Excel
      allData.sort((a, b) => (a.ubicacion || '').localeCompare(b.ubicacion || ''));

      // Preparar contenido CSV
      // Truco para Excel: Para evitar que borre los ceros a la izquierda (ej: 0060400305 -> 60400305),
      // se envuelve el valor en ="0060400305".
      const headers = ['UBICACION', 'CODIGO', 'DESCRIPCION', 'CANTIDAD', 'TALLA', 'COLOR', 'SERIE', 'PARTIDA', 'LOTE'];
      const csvContent = [
        headers.join(';'), // Cabeceras
        ...allData.map(row => {
          return [
            `"${row.ubicacion || ''}"`,
            `="${row.codigo || ''}"`, // El =" " fuerza a Excel a tratarlo como texto puro
            `"${(row.descripcion || '').replace(/"/g, '""')}"`,
            row.cantidad || 0,
            `="${row.talla || ''}"`,
            `"${row.color || ''}"`,
            `="${row.serie || ''}"`,
            `="${row.partida || ''}"`,
            `="${row.lote || ''}"`
          ].join(';');
        })
      ].join('\n');

      // Crear y descargar archivo
      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' }); // \uFEFF añade BOM para Excel
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `WMS_Ubicaciones_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (err) {
      console.error('Error al descargar excel:', err);
      alert('Error al descargar el archivo: ' + err.message);
    } finally {
      setDownloading(false);
    }
  };

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

  // Agrupación de datos por ubicación
  const groupedResults = useMemo(() => {
    if (!groupByLocation) return { 'Todas': results };
    
    return results.reduce((acc, curr) => {
      const loc = curr.ubicacion || 'SIN UBICACIÓN';
      if (!acc[loc]) acc[loc] = [];
      acc[loc].push(curr);
      return acc;
    }, {});
  }, [results, groupByLocation]);

  return (
    <div className="space-y-6 relative min-h-screen pb-12">
      {/* Background Decorativo Sutil */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden flex justify-center z-0">
        <div className="absolute top-[-10%] w-[800px] h-[400px] bg-orange-500/5 blur-[100px] rounded-full"></div>
      </div>

      {/* Panel de Control Principal (Header + Búsqueda) */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm relative z-10 overflow-hidden">
        {/* Decorative Top Line */}
        <div className="h-1 w-full bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-400"></div>
        
        <div className="p-6 md:p-8">
          {/* Fila 1: Título y Stats */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div className="flex items-center gap-4">
              <div className="bg-orange-50 p-3.5 rounded-2xl border border-orange-100 text-orange-600">
                <MapPin size={28} strokeWidth={2.5} />
              </div>
              <div>
                <h1 className="text-3xl font-black text-slate-800 tracking-tight">
                  Ubicaciones <span className="text-orange-500">Productos</span>
                </h1>
                <p className="text-slate-500 font-medium mt-1">Control de inventario por posición en almacén</p>
              </div>
            </div>

            {/* Stats Rápidos */}
            {results.length > 0 && (
              <div className="flex items-center gap-6 bg-slate-50 px-6 py-3 rounded-2xl border border-slate-100">
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-0.5">Resultados</p>
                  <p className="text-2xl font-black text-slate-800 leading-none">{results.length}</p>
                </div>
                <div className="w-px h-10 bg-slate-200"></div>
                <div>
                  <p className="text-[10px] text-orange-500 font-bold uppercase tracking-widest mb-0.5">Total Unidades</p>
                  <p className="text-2xl font-black text-orange-600 leading-none">
                    {results.reduce((acc, curr) => acc + (parseInt(curr.cantidad) || 0), 0)}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Fila 2: Buscador Integrado y Acciones */}
          <div className="flex flex-col xl:flex-row gap-4 items-center">
            <div className="flex-1 relative w-full group">
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                <Search className="text-slate-400 group-focus-within:text-orange-500 transition-colors" size={22} />
              </div>
              <form onSubmit={handleSearch} className="w-full">
                <input 
                  type="text"
                  placeholder="Buscar por código, ubicación o descripción..."
                  className="w-full pl-14 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all placeholder-slate-400 font-mono uppercase text-lg text-slate-800 shadow-inner group-focus-within:shadow-none"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  autoFocus
                />
              </form>
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
              {results.length > 0 && (
                <>
                  <button
                    onClick={() => setGroupByLocation(!groupByLocation)}
                    className={`px-5 py-4 rounded-2xl font-bold flex items-center gap-2 transition-all border-2 ${
                      groupByLocation 
                        ? 'bg-orange-50 border-orange-200 text-orange-700 shadow-sm' 
                        : 'bg-white border-slate-100 text-slate-600 hover:border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <Layers size={20} />
                    <span className="hidden sm:inline">Agrupar Pasillos</span>
                  </button>
                  
                  <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2.5 rounded-xl flex items-center gap-2 transition-all ${
                        viewMode === 'grid' ? 'bg-white text-orange-600 shadow-sm font-bold' : 'text-slate-500 hover:text-slate-700'
                      }`}
                      title="Vista Cuadrícula"
                    >
                      <LayoutGrid size={20} />
                    </button>
                    <button
                      onClick={() => setViewMode('table')}
                      className={`p-2.5 rounded-xl flex items-center gap-2 transition-all ${
                        viewMode === 'table' ? 'bg-white text-orange-600 shadow-sm font-bold' : 'text-slate-500 hover:text-slate-700'
                      }`}
                      title="Vista Tabla"
                    >
                      <List size={20} />
                    </button>
                  </div>
                </>
              )}

              {user?.rol === 'ADMIN' && (
                <button 
                  onClick={handleDownloadExcel}
                  disabled={downloading}
                  className="bg-white text-emerald-600 hover:bg-emerald-50 border-2 border-emerald-100 px-5 py-4 rounded-2xl font-bold flex items-center gap-2 transition-all disabled:opacity-50"
                  title="Descargar base completa"
                >
                  {downloading ? <RefreshCw className="animate-spin" size={20} /> : <Download size={20} />}
                  <span className="hidden sm:inline">Exportar</span>
                </button>
              )}

              <button 
                onClick={handleSearch}
                disabled={loading || !searchTerm.trim()}
                className="bg-slate-900 hover:bg-orange-600 text-white px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-orange-500/25 disabled:opacity-50 disabled:hover:bg-slate-900 flex-1 md:flex-none"
              >
                {loading ? <RefreshCw className="animate-spin" size={20} /> : <Search size={20} />}
                Buscar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Resultados Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4 relative z-10">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-orange-500 rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium animate-pulse">Consultando posiciones...</p>
        </div>
      ) : !searched ? (
        <div className="flex flex-col items-center justify-center py-20 text-center relative z-10">
          <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6 border-4 border-white shadow-sm">
            <Box size={32} className="text-slate-300" />
          </div>
          <h3 className="text-2xl font-black text-slate-800 mb-2 tracking-tight">Listo para buscar</h3>
          <p className="text-slate-500 max-w-md text-lg">
            Ingresa un código de producto, lote o posición exacta para visualizar su inventario.
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
        <div className="space-y-8">
          {Object.entries(groupedResults).map(([locationName, locationItems]) => (
            <div key={locationName} className="space-y-4">
              
              {/* Header de Agrupación (Solo si está activo) */}
              {groupByLocation && (
                <div className="flex items-center gap-4 py-2 border-b-2 border-orange-100">
                  <div className="bg-orange-100 text-orange-700 p-2 rounded-xl">
                    <MapPin size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-800 uppercase tracking-wide">{locationName}</h2>
                    <p className="text-sm text-slate-500 font-bold">{locationItems.length} productos en esta ubicación</p>
                  </div>
                </div>
              )}

              {/* Vista Tabla */}
              {viewMode === 'table' ? (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                          {COLUMNS.map((col, i) => (
                            <th key={i} className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
                              {col.header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {locationItems.map((row, idx) => (
                          <tr key={row.id || idx} className="hover:bg-slate-50/50 transition-colors">
                            {COLUMNS.map((col, cIdx) => (
                              <td key={cIdx} className="px-4 py-3 whitespace-nowrap">
                                {col.render ? col.render(row) : <span className="text-slate-600 text-sm">{row[col.accessor] || '-'}</span>}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                /* Vista Grid (Tarjetas Originales) */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {locationItems.map(row => (
                    <div key={row.id} className={`group bg-white rounded-3xl border shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden relative ${
                      editingId === row.id ? 'ring-2 ring-orange-500 border-orange-500' : 'border-slate-200'
                    }`}>
                      {/* Header Card */}
                      <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-start">
                        <div>
                           {editingId === row.id ? (
                             <input 
                               type="text" 
                               value={editLocation} 
                               onChange={(e) => setEditLocation(e.target.value)}
                               className="w-full bg-white border-2 border-orange-500 rounded-lg px-2 py-1 font-mono font-black text-orange-700 text-lg uppercase outline-none"
                               autoFocus
                             />
                           ) : (
                             <div className="flex items-center gap-2 font-mono font-black text-orange-600 bg-orange-50 px-3 py-1.5 rounded-lg border border-orange-100 w-fit">
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
                               <button onClick={() => startEdit(row)} className="p-2 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors">
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
                                className="w-full bg-white border-2 border-orange-500 rounded px-1 py-0.5 font-bold text-slate-800 outline-none mt-1"
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
                      <div className="h-1 w-full bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LocationsQuery;
