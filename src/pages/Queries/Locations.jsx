import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Search, MapPin, Box, Layers, RefreshCw, AlertCircle, Edit, Trash2, Save, X, Check, Download, LayoutGrid, List, Command, Filter } from 'lucide-react';
import { supabase } from '../../supabase';
import { useAuth } from '../../context/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

// Componente para resaltar el texto buscado
const HighlightText = ({ text, highlight }) => {
  if (!highlight || !text) return <span>{text}</span>;
  const parts = String(text).split(new RegExp(`(${highlight})`, 'gi'));
  return (
    <span>
      {parts.map((part, i) => 
        part.toLowerCase() === highlight.toLowerCase() ? (
          <span key={i} className="bg-wms-neon/40 text-emerald-200 font-black px-1 rounded-md shadow-[0_0_8px_rgba(16,185,129,0.4)]">{part}</span>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </span>
  );
};

const LocationsQuery = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const containerRef = useRef(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [submittedTerm, setSubmittedTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [groupByLocation, setGroupByLocation] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  // Estado para edición
  const [editingId, setEditingId] = useState(null);
  const [editQuantity, setEditQuantity] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [downloading, setDownloading] = useState(false);

  useGSAP(() => {
    gsap.from(containerRef.current, {
      y: 30,
      opacity: 0,
      duration: 0.6,
      ease: 'power4.out',
      clearProps: 'all'
    });
  }, { scope: containerRef });

  // Auto-búsqueda con Debounce (600ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm.trim() && searchTerm.trim().length >= 2) {
        setSubmittedTerm(searchTerm.trim());
      } else if (!searchTerm.trim()) {
        setSubmittedTerm(''); // Limpiar si borra todo
      }
    }, 600);
    return () => clearTimeout(timer);
  }, [searchTerm]);

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

  const searched = !!submittedTerm;

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
      toast.success("Registro actualizado correctamente", {
        icon: '✅',
        style: { background: '#1e293b', border: '1px solid #10b981', color: '#f8fafc' }
      });
    },
    onError: (err) => {
      console.error("Error al actualizar:", err);
      toast.error(`Error al actualizar: ${err.message}`, {
        icon: '❌',
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
      toast.success("Registro eliminado correctamente", {
        icon: '🗑️',
        style: { background: '#1e293b', border: '1px solid #10b981', color: '#f8fafc' }
      });
    },
    onError: (err) => {
      console.error("Error al eliminar:", err);
      toast.error(`Error al eliminar: ${err.message}`, {
        icon: '❌',
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
            hasMore = false;
          } else {
            page++;
          }
        } else {
          hasMore = false;
        }
      }

      if (allData.length === 0) {
        toast.error('No hay datos para descargar.');
        return;
      }

      allData.sort((a, b) => (a.ubicacion || '').localeCompare(b.ubicacion || ''));

      const headers = ['UBICACION', 'CODIGO', 'DESCRIPCION', 'CANTIDAD', 'TALLA', 'COLOR', 'SERIE', 'PARTIDA', 'LOTE'];
      const csvContent = [
        headers.join(';'),
        ...allData.map(row => {
          return [
            `"${row.ubicacion || ''}"`,
            `="${row.codigo || ''}"`,
            `"${(row.descripcion || '').replace(/"/g, '""')}"`,
            row.cantidad || 0,
            `="${row.talla || ''}"`,
            `="${row.color || ''}"`,
            `="${row.serie || ''}"`,
            `="${row.partida || ''}"`,
            `="${row.lote || ''}"`
          ].join(';');
        })
      ].join('\n');

      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `WMS_Ubicaciones_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (err) {
      console.error('Error al descargar excel:', err);
      toast.error('Error al descargar el archivo: ' + err.message);
    } finally {
      setDownloading(false);
    }
  };

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    if (!searchTerm.trim()) return;
    setEditingId(null);
    setSubmittedTerm(searchTerm.trim());
  };

  const handleClear = () => {
    setSearchTerm('');
    setSubmittedTerm('');
    setEditingId(null);
  };

  const startEdit = (row) => {
    setEditingId(row.id);
    setEditQuantity(row.cantidad);
    setEditLocation(row.ubicacion);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditQuantity('');
    setEditLocation('');
  };

  const saveEdit = (id) => {
    if (!editQuantity || isNaN(editQuantity) || Number(editQuantity) < 0) {
      toast.error("Por favor ingrese una cantidad válida");
      return;
    }
    if (!editLocation || !editLocation.trim()) {
      toast.error("La ubicación no puede estar vacía");
      return;
    }
    updateMutation.mutate({ id, cantidad: Number(editQuantity), ubicacion: editLocation.toUpperCase().trim() });
  };

  const handleDelete = (id, ubicacion, codigo) => {
    if (!window.confirm(`¿Estás seguro de eliminar el producto ${codigo} de la ubicación ${ubicacion}?`)) {
      return;
    }
    deleteMutation.mutate(id);
  };

  const COLUMNS = [
    { 
      header: 'Ubicación', 
      accessor: 'ubicacion', 
      render: r => editingId === r.id ? (
        <input 
          type="text" 
          value={editLocation} 
          onChange={(e) => setEditLocation(e.target.value)}
          className="w-32 p-1 bg-slate-900 border-2 border-emerald-400 rounded text-center font-bold font-mono outline-none focus:ring-2 focus:ring-emerald-500/30 uppercase text-emerald-400"
        />
      ) : (
        <span className="font-mono font-black text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/20 flex items-center gap-2 w-fit shadow-[0_0_10px_rgba(16,185,129,0.1)]">
          <MapPin size={14}/>
          <HighlightText text={r.ubicacion} highlight={submittedTerm} />
        </span>
      ) 
    },
    { header: 'Código', accessor: 'codigo', render: r => <span className="font-mono font-bold text-slate-300"><HighlightText text={r.codigo} highlight={submittedTerm} /></span> },
    { header: 'Descripción', accessor: 'descripcion', render: r => <span className="font-bold text-white text-xs sm:text-sm"><HighlightText text={r.descripcion} highlight={submittedTerm} /></span> },
    { 
      header: 'Cantidad', 
      accessor: 'cantidad', 
      render: r => editingId === r.id ? (
        <input 
          type="number" 
          value={editQuantity} 
          onChange={(e) => setEditQuantity(e.target.value)}
          className="w-20 p-1 bg-slate-900 border-2 border-emerald-400 rounded text-center font-bold text-white outline-none focus:ring-2 focus:ring-emerald-500/30"
          autoFocus
        />
      ) : (
        <span className="font-black text-white text-lg bg-slate-800/80 px-3 py-1 rounded shadow-inner">{r.cantidad}</span> 
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
              <button onClick={() => saveEdit(r.id)} disabled={updateMutation.isPending} className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/30 transition-colors shadow-sm">
                <Check size={16} />
              </button>
              <button onClick={cancelEdit} disabled={updateMutation.isPending} className="p-1.5 bg-slate-800 text-slate-400 rounded-lg hover:bg-slate-700 transition-colors border border-slate-700">
                <X size={16} />
              </button>
            </>
          ) : (
            <>
              <button onClick={() => startEdit(r)} className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors">
                <Edit size={16} />
              </button>
              <button onClick={() => handleDelete(r.id, r.ubicacion, r.codigo)} className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors">
                <Trash2 size={16} />
              </button>
            </>
          )}
        </div>
      )
    }
  ];

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
    <div ref={containerRef} className="space-y-6 relative min-h-screen pb-12 bg-wms-dark text-slate-300 p-4 md:p-6 overflow-hidden">
      
      {/* Background Decorativo Inmersivo */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden flex justify-center z-0">
        <div className={`absolute top-[-10%] w-[800px] h-[400px] bg-wms-neon/10 blur-[120px] rounded-full transition-opacity duration-1000 ${isFocused ? 'opacity-100' : 'opacity-40'}`}></div>
        <div className={`absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-emerald-500/5 blur-[120px] rounded-full transition-opacity duration-1000 ${isFocused ? 'opacity-100' : 'opacity-30'}`}></div>
      </div>

      {/* HEADER & OMNI-SEARCH BAR */}
      <div className={`transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] z-10 relative ${searched || loading ? 'bg-wms-panel/90 backdrop-blur-2xl rounded-3xl border border-wms-border shadow-2xl overflow-hidden' : 'flex-1 flex flex-col items-center justify-center mt-10 md:mt-20'}`}>
        
        {/* Decorative Top Line para cuando está en modo barra */}
        {(searched || loading) && (
          <div className="h-1 w-full bg-gradient-to-r from-wms-neon via-emerald-400 to-wms-neon shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
        )}

        <div className={`w-full mx-auto ${searched || loading ? 'max-w-full p-6' : 'max-w-4xl'}`}>
          
          {!searched && !loading && (
            <div className="text-center mb-12 animate-in slide-in-from-bottom-8 fade-in duration-700">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-[2rem] bg-gradient-to-br from-wms-panel to-slate-900 border border-wms-border shadow-[0_0_30px_rgba(16,185,129,0.15)] mb-8 transform hover:scale-105 transition-transform">
                <MapPin size={48} className="text-wms-neon drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]" strokeWidth={1.5} />
              </div>
              <h1 className="text-5xl md:text-6xl font-black text-white tracking-tight mb-4 leading-tight">
                Rastreador de <span className="text-transparent bg-clip-text bg-gradient-to-r from-wms-neon to-emerald-400">Ubicaciones</span>
              </h1>
              <p className="text-lg text-slate-400 font-medium max-w-2xl mx-auto">
                Audita el inventario por pasillo, estante o posición exacta. Resultados instantáneos en toda la bodega.
              </p>
            </div>
          )}

          <div className={`flex flex-col ${searched || loading ? 'xl:flex-row gap-6 items-center' : 'gap-8'}`}>
            
            {(searched || loading) && (
              <div className="hidden lg:flex items-center gap-4 min-w-max group cursor-pointer bg-slate-900/50 p-2 pr-6 rounded-2xl border border-wms-border hover:border-wms-neon/50 transition-colors" onClick={handleClear}>
                <div className="p-2.5 bg-wms-dark border border-wms-border rounded-xl text-wms-neon shadow-sm group-hover:scale-105 group-hover:shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all">
                  <MapPin size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">Rastreador</p>
                  <h1 className="text-sm font-black text-white leading-none group-hover:text-wms-neon transition-colors">Ubicaciones</h1>
                </div>
              </div>
            )}

            {/* BARRA DE BÚSQUEDA */}
            <form onSubmit={handleSearch} className={`relative group w-full ${searched || loading ? 'flex-1' : 'animate-in slide-in-from-bottom-10 fade-in duration-700 delay-100'}`}>
              <div className="relative flex items-center">
                <Search className={`absolute left-6 transition-all duration-500 z-10 ${isFocused ? 'text-wms-neon scale-110 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]' : (searched || loading ? 'text-slate-400' : 'text-wms-neon/70')}`} size={searched || loading ? 20 : 28} />
                
                <input
                  type="text"
                  placeholder="Escanea o escribe Ubicación, Código o Descripción..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  className={`w-full bg-slate-900/60 backdrop-blur-md border-2 outline-none transition-all duration-500 font-mono uppercase text-white placeholder:text-slate-500 placeholder:font-sans placeholder:normal-case placeholder:tracking-normal tracking-wider
                    ${searched || loading 
                      ? 'pl-14 pr-14 py-3.5 rounded-2xl border-wms-border focus:border-wms-neon focus:ring-4 focus:ring-wms-neon/10 text-base shadow-inner' 
                      : 'pl-16 pr-16 py-7 rounded-[2rem] border-wms-border focus:border-wms-neon focus:ring-[8px] focus:ring-wms-neon/15 text-2xl shadow-2xl focus:bg-slate-900/90'
                    }`}
                  autoFocus
                />

                {searchTerm && (
                  <button 
                    type="button"
                    onClick={handleClear}
                    className={`absolute transition-all duration-300 hover:scale-110 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-full p-1.5
                      ${searched || loading ? 'right-4' : 'right-6'}
                    `}
                  >
                    <X size={searched || loading ? 16 : 20} />
                  </button>
                )}
              </div>
            </form>

            {/* CONTROLES EXTRA CUANDO HAY BÚSQUEDA */}
            {(searched || loading) && (
              <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto animate-in fade-in slide-in-from-right-4 duration-500">
                {results.length > 0 && (
                  <>
                    <button
                      onClick={() => setGroupByLocation(!groupByLocation)}
                      className={`px-4 py-3 rounded-xl font-bold flex items-center gap-2 transition-all border-2 ${
                        groupByLocation 
                          ? 'bg-wms-neon/10 border-wms-neon/30 text-wms-neon shadow-[0_0_10px_rgba(16,185,129,0.15)]' 
                          : 'bg-slate-900/50 border-slate-700 text-slate-400 hover:border-slate-500 hover:text-white'
                      }`}
                    >
                      <Layers size={18} />
                      <span className="hidden sm:inline">Agrupar Pasillos</span>
                    </button>
                    
                    <div className="flex bg-slate-900/50 p-1 rounded-xl border border-slate-700 shadow-inner">
                      <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2.5 rounded-lg flex items-center gap-2 transition-all ${
                          viewMode === 'grid' ? 'bg-wms-panel text-wms-neon shadow-sm font-bold border border-slate-700' : 'text-slate-500 hover:text-slate-300'
                        }`}
                        title="Vista Cuadrícula"
                      >
                        <LayoutGrid size={18} />
                      </button>
                      <button
                        onClick={() => setViewMode('table')}
                        className={`p-2.5 rounded-lg flex items-center gap-2 transition-all ${
                          viewMode === 'table' ? 'bg-wms-panel text-wms-neon shadow-sm font-bold border border-slate-700' : 'text-slate-500 hover:text-slate-300'
                        }`}
                        title="Vista Tabla"
                      >
                        <List size={18} />
                      </button>
                    </div>
                  </>
                )}

                {user?.rol === 'ADMIN' && (
                  <button 
                    onClick={handleDownloadExcel}
                    disabled={downloading}
                    className="bg-slate-900/80 text-emerald-400 hover:bg-emerald-500/10 border border-emerald-500/30 px-4 py-3 rounded-xl font-bold flex items-center gap-2 transition-all disabled:opacity-50 hover:shadow-[0_0_10px_rgba(16,185,129,0.2)]"
                    title="Descargar base completa"
                  >
                    {downloading ? <RefreshCw className="animate-spin" size={18} /> : <Download size={18} />}
                    <span className="hidden sm:inline">Exportar</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Resultados */}
      {(searched || loading) && (
        <div className="animate-in fade-in duration-500 pt-4">
          
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 space-y-6 relative z-10">
              <div className="relative w-20 h-20">
                <div className="absolute inset-0 border-4 border-slate-800 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-wms-neon rounded-full border-t-transparent animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <MapPin size={24} className="text-wms-neon animate-pulse" />
                </div>
              </div>
              <p className="text-wms-neon font-bold tracking-widest uppercase text-sm animate-pulse">Consultando Posiciones...</p>
            </div>
          ) : results.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 text-center bg-wms-panel/40 backdrop-blur-md rounded-3xl border border-dashed border-slate-700 shadow-inner relative z-10">
              <div className="bg-slate-800/80 p-6 rounded-2xl shadow-lg mb-5 border border-slate-700">
                <Search size={40} className="text-slate-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">No se encontraron resultados</h3>
              <p className="text-slate-400 text-sm max-w-sm">El término <span className="text-wms-neon font-mono">"{submittedTerm}"</span> no coincide con ninguna ubicación o producto.</p>
            </div>
          ) : (
            <div className="space-y-8 relative z-10">
              
              {/* Stats Bar */}
              <div className="flex flex-wrap items-center gap-4 bg-wms-panel/60 backdrop-blur-md p-4 rounded-2xl border border-wms-border">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-wms-neon/10 rounded-lg text-wms-neon">
                    <Command size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none mb-1">Resultados</p>
                    <p className="text-xl font-black text-white leading-none">{results.length}</p>
                  </div>
                </div>
                <div className="w-px h-10 bg-slate-700 hidden sm:block mx-2"></div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
                    <Box size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none mb-1">Total Unidades</p>
                    <p className="text-xl font-black text-emerald-400 leading-none">
                      {results.reduce((acc, curr) => acc + (parseInt(curr.cantidad) || 0), 0)}
                    </p>
                  </div>
                </div>
              </div>

              {Object.entries(groupedResults).map(([locationName, locationItems]) => (
                <div key={locationName} className="space-y-5 animate-in fade-in slide-in-from-bottom-4">
                  
                  {/* Header de Agrupación (Solo si está activo) */}
                  {groupByLocation && (
                    <div className="flex items-center gap-4 py-3 border-b-2 border-slate-800">
                      <div className="bg-slate-800 text-wms-neon p-2.5 rounded-xl border border-slate-700 shadow-sm">
                        <MapPin size={24} />
                      </div>
                      <div>
                        <h2 className="text-2xl font-black text-white uppercase tracking-wide">{locationName}</h2>
                        <p className="text-sm text-slate-400 font-medium">{locationItems.length} productos en esta posición</p>
                      </div>
                    </div>
                  )}

                  {/* Vista Tabla */}
                  {viewMode === 'table' ? (
                    <div className="bg-wms-panel/80 backdrop-blur-xl rounded-2xl border border-wms-border shadow-2xl overflow-hidden">
                      <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-slate-900/90 border-b border-wms-border">
                              {COLUMNS.map((col, i) => (
                                <th key={i} className="px-5 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">
                                  {col.header}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-wms-border">
                            {locationItems.map((row, idx) => (
                              <tr key={row.id || idx} className={`hover:bg-slate-800/60 transition-colors group ${editingId === row.id ? 'bg-slate-800/80' : ''}`}>
                                {COLUMNS.map((col, cIdx) => (
                                  <td key={cIdx} className="px-5 py-4 whitespace-nowrap">
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
                    /* Vista Grid (Tarjetas Premium) */
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {locationItems.map(row => (
                        <div key={row.id} className={`group bg-wms-panel/80 backdrop-blur-xl rounded-[2rem] border shadow-lg hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 overflow-hidden relative ${
                          editingId === row.id ? 'ring-2 ring-emerald-500 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.2)]' : 'border-slate-700 hover:border-slate-500'
                        }`}>
                          {/* Header Card */}
                          <div className="p-5 border-b border-slate-800 bg-slate-900/60 flex justify-between items-start">
                            <div>
                               {editingId === row.id ? (
                                 <input 
                                   type="text" 
                                   value={editLocation} 
                                   onChange={(e) => setEditLocation(e.target.value)}
                                   className="w-full bg-slate-900 border-2 border-emerald-500 rounded-xl px-3 py-1.5 font-mono font-black text-emerald-400 text-lg uppercase outline-none focus:ring-4 focus:ring-emerald-500/20"
                                   autoFocus
                                 />
                               ) : (
                                 <div className="flex items-center gap-2 font-mono font-black text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20 w-fit shadow-[0_0_10px_rgba(16,185,129,0.1)] group-hover:shadow-[0_0_15px_rgba(16,185,129,0.2)] transition-shadow">
                                   <MapPin size={16} />
                                   <HighlightText text={row.ubicacion} highlight={submittedTerm} />
                                 </div>
                               )}
                            </div>
                            <div className="flex gap-2">
                               {editingId === row.id ? (
                                 <>
                                   <button onClick={() => saveEdit(row.id)} className="p-2 bg-emerald-500 text-slate-900 rounded-lg hover:bg-emerald-400 transition-colors shadow-md">
                                     <Check size={18} strokeWidth={3} />
                                   </button>
                                   <button onClick={cancelEdit} className="p-2 bg-slate-800 text-slate-300 border border-slate-600 rounded-lg hover:bg-slate-700 transition-colors">
                                     <X size={18} />
                                   </button>
                                 </>
                               ) : (
                                 <>
                                   <button onClick={() => startEdit(row)} className="p-2 text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors">
                                     <Edit size={18} />
                                   </button>
                                   <button onClick={() => handleDelete(row.id, row.ubicacion, row.codigo)} className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors">
                                     <Trash2 size={18} />
                                   </button>
                                 </>
                               )}
                            </div>
                          </div>

                          {/* Body Card */}
                          <div className="p-6 space-y-5">
                            <div>
                              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Producto</p>
                              <p className="font-mono font-bold text-white text-xl mb-1"><HighlightText text={row.codigo} highlight={submittedTerm} /></p>
                              <p className="text-sm text-slate-400 font-medium line-clamp-2 leading-snug"><HighlightText text={row.descripcion} highlight={submittedTerm} /></p>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-2">
                              <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 shadow-inner">
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Cantidad</p>
                                {editingId === row.id ? (
                                  <input 
                                    type="number" 
                                    value={editQuantity} 
                                    onChange={(e) => setEditQuantity(e.target.value)}
                                    className="w-full bg-slate-900 border-2 border-emerald-500 rounded-xl px-2 py-1 font-black text-white text-xl outline-none focus:ring-4 focus:ring-emerald-500/20 mt-1"
                                  />
                                ) : (
                                  <p className="text-3xl font-black text-white">{row.cantidad}</p>
                                )}
                              </div>
                              <div className="flex flex-col justify-center space-y-3 bg-slate-900/30 p-3 rounded-2xl border border-slate-800/50">
                                 <div>
                                   <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">Talla</p>
                                   <p className="font-bold text-slate-300 text-sm">{row.talla || '-'}</p>
                                 </div>
                                 <div className="w-full h-px bg-slate-800"></div>
                                 <div>
                                   <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">Color</p>
                                   <p className="font-bold text-slate-300 text-sm">{row.color || '-'}</p>
                                 </div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Footer Decoration */}
                          <div className="h-1.5 w-full bg-gradient-to-r from-wms-neon via-emerald-400 to-wms-neon opacity-0 group-hover:opacity-100 transition-opacity shadow-[0_0_15px_rgba(16,185,129,0.5)] absolute bottom-0 left-0"></div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LocationsQuery;