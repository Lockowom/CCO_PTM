import React, { useState, useMemo, useRef } from 'react';
import { Search, MapPin, Box, Layers, RefreshCw, AlertCircle, Edit, Trash2, Save, X, Check, Download, LayoutGrid, List } from 'lucide-react';
import { supabase } from '../../supabase';
import { useAuth } from '../../context/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

const LocationsQuery = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const containerRef = useRef(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [submittedTerm, setSubmittedTerm] = useState('');
  const [searched, setSearched] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [groupByLocation, setGroupByLocation] = useState(false);

  // Estado para edición
  const [editingId, setEditingId] = useState(null);
  const [editQuantity, setEditQuantity] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [downloading, setDownloading] = useState(false);

  useGSAP(() => {
    gsap.from(containerRef.current, {
      y: 20,
      opacity: 0,
      duration: 0.4,
      ease: 'power3.out',
      clearProps: 'all'
    });
  }, { scope: containerRef });

  // TanStack Query para Búsqueda
  const { data: results = [], isLoading: loading } = useQuery({
    queryKey: ['locations', submittedTerm],
    queryFn: async () => {
      const term = `%${submittedTerm.trim()}%`;
      const { data, error } = await supabase
        .from('wms_ubicaciones')
        .select('*')
        .or(`codigo.ilike.${term},descripcion.ilike.${term},ubicacion.ilike.${term}`)
        .order('ubicacion', { ascending: true })
        .limit(100);

      if (error) throw error;
      return data || [];
    },
    enabled: !!submittedTerm,
  });

  // TanStack Mutation para Actualizar
  const updateMutation = useMutation({
    mutationFn: async ({ id, cantidad, ubicacion }) => {
      const { error } = await supabase
        .from('wms_ubicaciones')
        .update({ cantidad, ubicacion })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['locations', submittedTerm]);
      setEditingId(null);
      toast.success("✅ Registro actualizado correctamente", {
        style: { background: '#1e293b', border: '1px solid #10b981', color: '#f8fafc' }
      });
    },
    onError: (err) => {
      console.error("Error al actualizar:", err);
      toast.error(`❌ Error al actualizar: ${err.message}`, {
        style: { background: '#1e293b', border: '1px solid #ef4444', color: '#f8fafc' }
      });
    }
  });

  // TanStack Mutation para Eliminar
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase
        .from('wms_ubicaciones')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['locations', submittedTerm]);
      toast.success("🗑️ Registro eliminado correctamente", {
        style: { background: '#1e293b', border: '1px solid #10b981', color: '#f8fafc' }
      });
    },
    onError: (err) => {
      console.error("Error al eliminar:", err);
      toast.error(`❌ Error al eliminar: ${err.message}`, {
        style: { background: '#1e293b', border: '1px solid #ef4444', color: '#f8fafc' }
      });
    }
  });

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

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    if (!searchTerm.trim()) return;

    setSearched(true);
    setEditingId(null);
    setSubmittedTerm(searchTerm);
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
  const saveEdit = (id) => {
    if (!editQuantity || isNaN(editQuantity) || Number(editQuantity) < 0) {
      toast.error("Por favor ingrese una cantidad válida", {
        style: { background: '#1e293b', border: '1px solid #f97316', color: '#f8fafc' }
      });
      return;
    }
    
    if (!editLocation || !editLocation.trim()) {
      toast.error("La ubicación no puede estar vacía", {
        style: { background: '#1e293b', border: '1px solid #f97316', color: '#f8fafc' }
      });
      return;
    }

    updateMutation.mutate({ id, cantidad: Number(editQuantity), ubicacion: editLocation.toUpperCase().trim() });
  };

  // Eliminar registro
  const handleDelete = (id, ubicacion, codigo) => {
    if (!window.confirm(`¿Estás seguro de eliminar el producto ${codigo} de la ubicación ${ubicacion}?`)) {
      return;
    }

    deleteMutation.mutate(id);
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
                disabled={updateMutation.isPending}
                className="p-1.5 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                title="Guardar"
              >
                <Check size={16} />
              </button>
              <button 
                onClick={cancelEdit}
                disabled={updateMutation.isPending}
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
    <div ref={containerRef} className="space-y-6 relative min-h-screen pb-12 bg-wms-dark text-slate-300 p-6">
      {/* Background Decorativo Sutil */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden flex justify-center z-0">
        <div className="absolute top-[-10%] w-[800px] h-[400px] bg-wms-neon/5 blur-[100px] rounded-full"></div>
      </div>

      {/* Panel de Control Principal (Header + Búsqueda) */}
      <div className="bg-wms-panel/80 backdrop-blur-xl rounded-3xl border border-wms-border shadow-2xl relative z-10 overflow-hidden">
        {/* Decorative Top Line */}
        <div className="h-1 w-full bg-gradient-to-r from-wms-neon via-emerald-500 to-wms-neon"></div>
        
        <div className="p-6 md:p-8">
          {/* Fila 1: Título y Stats */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div className="flex items-center gap-4">
              <div className="bg-wms-neon/10 p-3.5 rounded-2xl border border-wms-neon/20 text-wms-neon shadow-neon-green">
                <MapPin size={28} strokeWidth={2.5} />
              </div>
              <div>
                <h1 className="text-3xl font-black text-white tracking-tight">
                  Ubicaciones <span className="text-wms-neon">Productos</span>
                </h1>
                <p className="text-slate-400 font-medium mt-1">Control de inventario por posición en almacén</p>
              </div>
            </div>

            {/* Stats Rápidos */}
            {results.length > 0 && (
              <div className="flex items-center gap-6 bg-slate-900/50 px-6 py-3 rounded-2xl border border-wms-border">
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-0.5">Resultados</p>
                  <p className="text-2xl font-black text-white leading-none">{results.length}</p>
                </div>
                <div className="w-px h-10 bg-wms-border"></div>
                <div>
                  <p className="text-[10px] text-wms-neon font-bold uppercase tracking-widest mb-0.5">Total Unidades</p>
                  <p className="text-2xl font-black text-wms-neon leading-none">
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
                <Search className="text-slate-400 group-focus-within:text-wms-neon transition-colors" size={22} />
              </div>
              <form onSubmit={handleSearch} className="w-full">
                <input 
                  type="text"
                  placeholder="Buscar por código, ubicación o descripción..."
                  className="w-full pl-14 pr-4 py-4 bg-slate-900/50 border-2 border-wms-border rounded-2xl outline-none focus:bg-slate-900 focus:border-wms-neon focus:ring-4 focus:ring-wms-neon/10 transition-all placeholder-slate-500 font-mono uppercase text-lg text-white shadow-inner group-focus-within:shadow-none"
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
                        ? 'bg-wms-neon/10 border-wms-neon/30 text-wms-neon shadow-sm' 
                        : 'bg-slate-900/50 border-wms-border text-slate-400 hover:border-slate-600 hover:text-white'
                    }`}
                  >
                    <Layers size={20} />
                    <span className="hidden sm:inline">Agrupar Pasillos</span>
                  </button>
                  
                  <div className="flex bg-slate-900/50 p-1.5 rounded-2xl border border-wms-border">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2.5 rounded-xl flex items-center gap-2 transition-all ${
                        viewMode === 'grid' ? 'bg-wms-panel text-wms-neon shadow-sm font-bold border border-wms-border' : 'text-slate-500 hover:text-slate-300'
                      }`}
                      title="Vista Cuadrícula"
                    >
                      <LayoutGrid size={20} />
                    </button>
                    <button
                      onClick={() => setViewMode('table')}
                      className={`p-2.5 rounded-xl flex items-center gap-2 transition-all ${
                        viewMode === 'table' ? 'bg-wms-panel text-wms-neon shadow-sm font-bold border border-wms-border' : 'text-slate-500 hover:text-slate-300'
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
                  className="bg-slate-900/50 text-emerald-400 hover:bg-emerald-500/10 border-2 border-emerald-500/20 px-5 py-4 rounded-2xl font-bold flex items-center gap-2 transition-all disabled:opacity-50"
                  title="Descargar base completa"
                >
                  {downloading ? <RefreshCw className="animate-spin" size={20} /> : <Download size={20} />}
                  <span className="hidden sm:inline">Exportar</span>
                </button>
              )}

              <button 
                onClick={handleSearch}
                disabled={loading || !searchTerm.trim()}
                className="bg-wms-neon hover:bg-emerald-400 text-slate-900 px-8 py-4 rounded-2xl font-black flex items-center justify-center gap-2 transition-all shadow-neon-green disabled:opacity-50 disabled:hover:bg-wms-neon flex-1 md:flex-none"
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
          <div className="w-12 h-12 border-4 border-wms-border border-t-wms-neon rounded-full animate-spin"></div>
          <p className="text-slate-400 font-medium animate-pulse">Consultando posiciones...</p>
        </div>
      ) : !searched ? (
        <div className="flex flex-col items-center justify-center py-20 text-center relative z-10">
          <div className="w-24 h-24 bg-slate-900/50 rounded-full flex items-center justify-center mb-6 border-4 border-wms-border shadow-sm">
            <Box size={32} className="text-slate-500" />
          </div>
          <h3 className="text-2xl font-black text-white mb-2 tracking-tight">Listo para buscar</h3>
          <p className="text-slate-400 max-w-md text-lg">
            Ingresa un código de producto, lote o posición exacta para visualizar su inventario.
          </p>
        </div>
      ) : results.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-center bg-wms-panel/50 rounded-3xl border-2 border-dashed border-wms-border">
          <div className="bg-slate-900/80 p-6 rounded-full shadow-sm mb-4 border border-wms-border">
            <AlertCircle size={48} className="text-wms-alert" />
          </div>
          <h3 className="text-xl font-bold text-white">No se encontraron resultados</h3>
          <p className="text-slate-400 mt-1">Verifique el código o la ubicación ingresada</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedResults).map(([locationName, locationItems]) => (
            <div key={locationName} className="space-y-4">
              
              {/* Header de Agrupación (Solo si está activo) */}
              {groupByLocation && (
                <div className="flex items-center gap-4 py-2 border-b-2 border-wms-neon/20">
                  <div className="bg-wms-neon/10 text-wms-neon p-2 rounded-xl border border-wms-neon/20">
                    <MapPin size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-white uppercase tracking-wide">{locationName}</h2>
                    <p className="text-sm text-slate-400 font-bold">{locationItems.length} productos en esta ubicación</p>
                  </div>
                </div>
              )}

              {/* Vista Tabla */}
              {viewMode === 'table' ? (
                <div className="bg-wms-panel/80 backdrop-blur-xl rounded-2xl border border-wms-border shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-900/80 border-b border-wms-border">
                          {COLUMNS.map((col, i) => (
                            <th key={i} className="px-4 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">
                              {col.header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-wms-border">
                        {locationItems.map((row, idx) => (
                          <tr key={row.id || idx} className="hover:bg-slate-800/50 transition-colors">
                            {COLUMNS.map((col, cIdx) => (
                              <td key={cIdx} className="px-4 py-3 whitespace-nowrap">
                                {col.render ? col.render(row) : <span className="text-slate-300 text-sm">{row[col.accessor] || '-'}</span>}
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
                    <div key={row.id} className={`group bg-wms-panel/80 backdrop-blur-md rounded-3xl border shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden relative ${
                      editingId === row.id ? 'ring-2 ring-wms-alert border-wms-alert' : 'border-wms-border'
                    }`}>
                      {/* Header Card */}
                      <div className="p-5 border-b border-wms-border bg-slate-900/50 flex justify-between items-start">
                        <div>
                           {editingId === row.id ? (
                             <input 
                               type="text" 
                               value={editLocation} 
                               onChange={(e) => setEditLocation(e.target.value)}
                               className="w-full bg-slate-900 border-2 border-wms-alert rounded-lg px-2 py-1 font-mono font-black text-wms-alert text-lg uppercase outline-none"
                               autoFocus
                             />
                           ) : (
                             <div className="flex items-center gap-2 font-mono font-black text-wms-neon bg-wms-neon/10 px-3 py-1.5 rounded-lg border border-wms-neon/20 w-fit">
                               <MapPin size={16} />
                               {row.ubicacion}
                             </div>
                           )}
                        </div>
                        <div className="flex gap-1">
                           {editingId === row.id ? (
                             <>
                               <button onClick={() => saveEdit(row.id)} className="p-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg hover:bg-emerald-500/30 transition-colors shadow-sm">
                                 <Check size={18} />
                               </button>
                               <button onClick={cancelEdit} className="p-2 bg-slate-800 text-slate-400 border border-wms-border rounded-lg hover:bg-slate-700 transition-colors">
                                 <X size={18} />
                               </button>
                             </>
                           ) : (
                             <>
                               <button onClick={() => startEdit(row)} className="p-2 text-slate-400 hover:text-wms-alert hover:bg-wms-alert/10 rounded-lg transition-colors">
                                 <Edit size={18} />
                               </button>
                               <button onClick={() => handleDelete(row.id, row.ubicacion, row.codigo)} className="p-2 text-slate-400 hover:text-wms-danger hover:bg-wms-danger/10 rounded-lg transition-colors">
                                 <Trash2 size={18} />
                               </button>
                             </>
                           )}
                        </div>
                      </div>

                      {/* Body Card */}
                      <div className="p-5 space-y-4">
                        <div>
                          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Producto</p>
                          <p className="font-mono font-bold text-white text-lg">{row.codigo}</p>
                          <p className="text-sm text-slate-400 font-medium line-clamp-2 leading-tight mt-1">{row.descripcion}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-2">
                          <div className="bg-slate-900/50 p-3 rounded-xl border border-wms-border">
                            <p className="text-[10px] font-bold text-slate-500 uppercase">Cantidad</p>
                            {editingId === row.id ? (
                              <input 
                                type="number" 
                                value={editQuantity} 
                                onChange={(e) => setEditQuantity(e.target.value)}
                                className="w-full bg-slate-900 border-2 border-wms-alert rounded px-1 py-0.5 font-bold text-white outline-none mt-1"
                              />
                            ) : (
                              <p className="text-2xl font-black text-white">{row.cantidad}</p>
                            )}
                          </div>
                          <div className="space-y-1">
                             <div>
                               <p className="text-[10px] font-bold text-slate-500 uppercase">Talla</p>
                               <p className="font-bold text-slate-300 text-sm">{row.talla || '-'}</p>
                             </div>
                             <div>
                               <p className="text-[10px] font-bold text-slate-500 uppercase">Color</p>
                               <p className="font-bold text-slate-300 text-sm">{row.color || '-'}</p>
                             </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Footer Decoration */}
                      <div className="h-1 w-full bg-gradient-to-r from-wms-neon via-emerald-500 to-wms-neon opacity-0 group-hover:opacity-100 transition-opacity shadow-neon-green"></div>
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
