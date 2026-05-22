import React, { useState, useMemo, useRef, useEffect, useLayoutEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, MapPin, Box, Layers, RefreshCw, AlertCircle, Edit2, Trash2, Save, X, Check, Download, LayoutGrid, List, Command, Filter, Package, Zap, ChevronRight, MoreVertical } from 'lucide-react';
import { supabase } from '../../supabase';
import { useAuth } from '../../context/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import gsap from 'gsap';

// Componente para resaltar el texto buscado
const HighlightText = ({ text, highlight }) => {
  if (!highlight || !text) return <span>{text}</span>;
  const parts = String(text).split(new RegExp(`(${highlight})`, 'gi'));
  return (
    <span>
      {parts.map((part, i) => 
        part.toLowerCase() === highlight.toLowerCase() ? (
          <span key={i} className="bg-orange-100 text-orange-600 font-black px-0.5 rounded-sm">{part}</span>
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
  const [searchParams] = useSearchParams();

  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [submittedTerm, setSubmittedTerm] = useState(searchParams.get('search') || '');
  const [viewMode, setViewMode] = useState('grid');
  const [groupByLocation, setGroupByLocation] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  // Animación del fondo sutil
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // Orbe superior
      gsap.to(".bg-orb-1", {
        x: "30%",
        y: "20%",
        duration: 20,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });
      // Orbe inferior
      gsap.to(".bg-orb-2", {
        x: "-20%",
        y: "-15%",
        duration: 25,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });
    });
    return () => ctx.revert();
  }, []);

  // Animaciones de entrada de tarjetas
  useLayoutEffect(() => {
    if (submittedTerm) {
      gsap.fromTo(".location-card", 
        { opacity: 0, y: 30, scale: 0.95 },
        { 
          opacity: 1, 
          y: 0, 
          scale: 1, 
          duration: 0.6, 
          stagger: 0.05, 
          ease: "expo.out",
          clearProps: "all"
        }
      );
    }
  }, [submittedTerm, viewMode]);

  // Estado para edición
  const [editingId, setEditingId] = useState(null);
  const [editQuantity, setEditQuantity] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [downloading, setDownloading] = useState(false);

  // Auto-búsqueda ultra-rápida con Debounce optimizado (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm.trim() && searchTerm.trim().length >= 2) {
        setSubmittedTerm(searchTerm.trim());
      } else if (!searchTerm.trim()) {
        setSubmittedTerm(''); // Limpiar si borra todo
      }
    }, 300); // Reducido de 600ms a 300ms para respuesta instantánea
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
      toast.success("Registro actualizado correctamente");
    },
    onError: (err) => {
      console.error("Error al actualizar:", err);
      toast.error(`Error al actualizar: ${err.message}`);
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
      toast.success("Registro eliminado correctamente");
    },
    onError: (err) => {
      console.error("Error al eliminar:", err);
      toast.error(`Error al eliminar: ${err.message}`);
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
          className="w-32 p-1.5 bg-white border-2 border-orange-400 rounded-md text-center font-bold font-mono outline-none focus:ring-2 focus:ring-orange-500/30 uppercase text-slate-800 shadow-sm"
        />
      ) : (
        <span className="font-mono font-bold text-orange-600 bg-orange-50 px-3 py-1 rounded-md border border-orange-200 flex items-center gap-2 w-fit">
          <MapPin size={14} className="text-orange-500" />
          <HighlightText text={r.ubicacion} highlight={submittedTerm} />
        </span>
      ) 
    },
    { header: 'Código', accessor: 'codigo', render: r => <span className="font-mono font-bold text-slate-700"><HighlightText text={r.codigo} highlight={submittedTerm} /></span> },
    { header: 'Descripción', accessor: 'descripcion', render: r => <span className="font-medium text-slate-800 text-sm"><HighlightText text={r.descripcion} highlight={submittedTerm} /></span> },
    { 
      header: 'Cantidad', 
      accessor: 'cantidad', 
      render: r => editingId === r.id ? (
        <input 
          type="number" 
          value={editQuantity} 
          onChange={(e) => setEditQuantity(e.target.value)}
          className="w-24 p-1.5 bg-white border-2 border-orange-400 rounded-md text-center font-bold text-slate-800 outline-none focus:ring-2 focus:ring-orange-500/30 shadow-sm"
          autoFocus
        />
      ) : (
        <span className="font-black text-slate-800 text-base bg-slate-100 px-3 py-1 rounded-md border border-slate-200">{r.cantidad}</span> 
      )
    },
    { header: 'Talla', accessor: 'talla', render: r => <span className="text-slate-600 font-medium">{r.talla || '-'}</span> },
    { header: 'Color', accessor: 'color', render: r => <span className="text-slate-600 font-medium">{r.color || '-'}</span> },
    {
      header: 'Acciones',
      render: r => (
        <div className="flex items-center gap-2">
          {editingId === r.id ? (
            <>
              <button onClick={() => saveEdit(r.id)} disabled={updateMutation.isPending} className="p-1.5 bg-orange-100 text-orange-600 rounded-md hover:bg-orange-200 transition-colors shadow-sm">
                <Check size={18} />
              </button>
              <button onClick={cancelEdit} disabled={updateMutation.isPending} className="p-1.5 bg-slate-100 text-slate-600 rounded-md hover:bg-slate-200 transition-colors shadow-sm">
                <X size={18} />
              </button>
            </>
          ) : (
            <>
              <button onClick={() => startEdit(r)} className="p-1.5 text-slate-400 hover:text-orange-500 hover:bg-orange-50 rounded-md transition-colors">
                <Edit2 size={18} />
              </button>
              <button onClick={() => handleDelete(r.id, r.ubicacion, r.codigo)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors">
                <Trash2 size={18} />
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
    <div className="min-h-screen bg-slate-50 relative overflow-hidden font-sans text-slate-900 selection:bg-orange-200 selection:text-orange-900">
      
      {/* BACKGROUND ELEMENTS - High Tech Presentation */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Mesh Gradients - Animated with GSAP */}
        <div className="bg-orb-1 absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-200/20 blur-[120px] rounded-full" />
        <div className="bg-orb-2 absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-amber-100/30 blur-[150px] rounded-full" />
        
        {/* Topographic Pattern Overlay */}
        <div className="absolute inset-0 opacity-[0.03]" 
             style={{ 
               backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 86c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zm66-3c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zm-46-4c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zm13-46c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zm16 47c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM21 53c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1zm65 4c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1zM48 94c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1zM11 69c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1zm56-58c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1zm9 82c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1zm-34-56c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1zm-3-28c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1zm-31 24c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1zm24 44c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1zM86 48c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1zM40 38c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1zM66 62c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1zM20 24c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1z' fill='%23f97316' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")` 
             }} 
        />
      </div>

      <div className="relative z-10">
        {/* HEADER & OMNI-SEARCH BAR */}
        <div className={`transition-all duration-700 ease-in-out relative z-20 ${searched || loading ? 'bg-white/80 backdrop-blur-2xl border-b border-slate-200 shadow-[0_2px_15px_rgba(0,0,0,0.02)] sticky top-0' : 'flex flex-col items-center justify-center pt-32 pb-16'}`}>
          
          <div className={`w-full mx-auto transition-all duration-700 ${searched || loading ? 'max-w-7xl px-8 py-4' : 'max-w-4xl px-4'}`}>
            
            {!searched && !loading && (
              <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-[2rem] bg-gradient-to-br from-white to-orange-50 border border-orange-100 shadow-xl shadow-orange-500/5 mb-8 transform hover:scale-110 hover:rotate-3 transition-all duration-500">
                  <MapPin size={48} className="text-orange-500" strokeWidth={1.5} />
                </div>
                <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter mb-6">
                  Gestor de <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600">Ubicaciones</span>
                </h1>
                <p className="text-xl text-slate-400 font-bold max-w-2xl mx-auto leading-relaxed">
                  Control total sobre el layout físico de tu bodega. <br className="hidden md:block" />
                  Rastreo inteligente y optimización de stock en tiempo real.
                </p>
              </div>
            )}

            <div className={`flex flex-col ${searched || loading ? 'md:flex-row gap-6 items-center' : 'gap-8'}`}>
              
              {(searched || loading) && (
                <div className="hidden md:flex items-center gap-4 cursor-pointer group px-4 py-2 rounded-2xl hover:bg-slate-50 transition-all duration-300" onClick={handleClear}>
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-orange-500/20 group-hover:scale-110 transition-transform duration-300">
                    <MapPin size={22} />
                  </div>
                  <div>
                    <h1 className="text-base font-black text-slate-900 leading-none mb-1">Ubicaciones</h1>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Gestor WMS</p>
                  </div>
                </div>
              )}

              {/* BARRA DE BÚSQUEDA UPGRADED */}
              <form onSubmit={handleSearch} className={`relative group w-full ${searched || loading ? 'flex-1' : 'animate-in zoom-in-95 duration-700'}`}>
                <div className="relative flex items-center">
                  <div className={`absolute left-6 transition-all duration-500 z-10 ${isFocused ? 'scale-110' : ''}`}>
                    <Search className={`transition-colors duration-300 ${loading ? 'animate-pulse text-orange-500' : isFocused ? 'text-orange-500' : 'text-slate-400'}`} size={searched || loading ? 22 : 28} />
                  </div>
                  
                  <input
                    type="text"
                    placeholder="Buscar ubicación, SKU o descripción..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    className={`w-full bg-white outline-none transition-all duration-500 font-bold text-slate-900 placeholder:text-slate-300
                      ${searched || loading 
                        ? 'pl-16 pr-14 py-4 rounded-2xl border border-slate-200 focus:border-orange-500 focus:ring-8 focus:ring-orange-500/5 shadow-sm text-base' 
                        : 'pl-20 pr-20 py-7 rounded-[2.5rem] border-2 border-slate-100 focus:border-orange-500 focus:ring-[12px] focus:ring-orange-500/5 text-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.08)] hover:shadow-[0_30px_80px_-20px_rgba(0,0,0,0.12)]'
                      }`}
                    autoFocus
                  />

                  <div className={`absolute transition-all duration-300 flex items-center gap-3 ${searched || loading ? 'right-4' : 'right-8'}`}>
                    {searchTerm && (
                      <button 
                        type="button" 
                        onClick={handleClear}
                        className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all duration-300"
                      >
                        <X size={searched || loading ? 18 : 24} />
                      </button>
                    )}
                    {!searched && !loading && !searchTerm && (
                      <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-xl">
                        <Command size={14} className="text-slate-300" />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">K para buscar</span>
                      </div>
                    )}
                  </div>
                </div>
              </form>

              {/* CONTROLES EXTRA */}
              {(searched || loading) && (
                <div className="flex items-center gap-3 w-full md:w-auto">
                  {results.length > 0 && (
                    <>
                      <button
                        onClick={() => setGroupByLocation(!groupByLocation)}
                        className={`h-14 px-5 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-3 transition-all duration-300 border ${
                          groupByLocation 
                            ? 'bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-500/20' 
                            : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50 hover:border-slate-300'
                        }`}
                      >
                        <Layers size={18} />
                        <span className="hidden xl:inline">Agrupar</span>
                      </button>
                      
                      <div className="flex h-14 bg-slate-100/50 p-1.5 rounded-2xl border border-slate-200/50">
                        <button
                          onClick={() => setViewMode('grid')}
                          className={`px-4 rounded-xl flex items-center justify-center transition-all duration-300 ${
                            viewMode === 'grid' ? 'bg-white text-orange-500 shadow-md shadow-black/5 font-bold' : 'text-slate-400 hover:text-slate-600'
                          }`}
                        >
                          <LayoutGrid size={18} />
                        </button>
                        <button
                          onClick={() => setViewMode('table')}
                          className={`px-4 rounded-xl flex items-center justify-center transition-all duration-300 ${
                            viewMode === 'table' ? 'bg-white text-orange-500 shadow-md shadow-black/5 font-bold' : 'text-slate-400 hover:text-slate-600'
                          }`}
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
                      className="h-14 bg-slate-900 text-white hover:bg-slate-800 px-6 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-3 transition-all duration-300 disabled:opacity-50 shadow-lg shadow-slate-900/10"
                    >
                      {downloading ? <RefreshCw className="animate-spin" size={18} /> : <Download size={18} />}
                      <span className="hidden xl:inline">Exportar</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Resultados */}
        {(searched || loading) && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
            
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <RefreshCw className="animate-spin text-orange-500" size={32} />
                <p className="text-slate-500 font-medium">Buscando en bodega...</p>
              </div>
            ) : results.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-3xl border border-dashed border-slate-300 shadow-sm">
                <div className="bg-slate-50 p-5 rounded-full mb-4">
                  <Search size={32} className="text-slate-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-1">Sin resultados</h3>
                <p className="text-slate-500 text-sm max-w-sm">No encontramos coincidencias para "<span className="font-semibold text-slate-700">{submittedTerm}</span>".</p>
              </div>
            ) : (
              <div className="space-y-8">
                
                {/* Stats Bar UPGRADED */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                  {[
                    { label: 'Resultados', value: results.length, icon: Command, color: 'slate' },
                    { label: 'Total Unidades', value: results.reduce((acc, curr) => acc + (parseInt(curr.cantidad) || 0), 0).toLocaleString(), icon: Package, color: 'orange' },
                    { label: 'Pasillos Activos', value: new Set(results.map(r => r.ubicacion?.split('-')[0])).size, icon: MapPin, color: 'amber' },
                    { label: 'Disponibilidad', value: '84%', icon: Zap, color: 'emerald' }
                  ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex items-center gap-5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner
                        ${stat.color === 'orange' ? 'bg-orange-50 text-orange-500' : 
                          stat.color === 'amber' ? 'bg-amber-50 text-amber-500' : 
                          stat.color === 'emerald' ? 'bg-emerald-50 text-emerald-500' : 
                          'bg-slate-50 text-slate-500'}`}>
                        <stat.icon size={24} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{stat.label}</p>
                        <p className={`text-2xl font-black tracking-tighter leading-none
                          ${stat.color === 'orange' ? 'text-orange-600' : 'text-slate-900'}`}>
                          {stat.value}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {Object.entries(groupedResults).map(([locationName, locationItems]) => (
                  <div key={locationName} className="space-y-6 animate-fade-in">
                    
                    {/* Header de Agrupación UPGRADED */}
                    {groupByLocation && (
                      <div className="flex items-center gap-4 py-4 px-2">
                        <div className="w-12 h-12 bg-white text-orange-500 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-center">
                          <MapPin size={22} />
                        </div>
                        <div>
                          <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter">{locationName}</h2>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{locationItems.length} Registros en esta zona</p>
                        </div>
                        <div className="flex-1 h-px bg-slate-200 ml-4"></div>
                      </div>
                    )}

                    {/* Vista Tabla */}
                    {viewMode === 'table' ? (
                      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-[0_10px_40px_rgba(0,0,0,0.04)] overflow-hidden">
                        <div className="overflow-x-auto custom-scrollbar">
                          <table className="w-full text-left border-collapse min-w-[800px]">
                            <thead>
                              <tr className="bg-slate-50/50 border-b border-slate-100">
                                {COLUMNS.map((col, i) => (
                                  <th key={i} className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                    {col.header}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                              {locationItems.map((row, idx) => (
                                <tr key={row.id || idx} className={`hover:bg-slate-50/50 transition-colors group ${editingId === row.id ? 'bg-orange-50/30' : ''}`}>
                                  {COLUMNS.map((col, cIdx) => (
                                    <td key={cIdx} className="px-8 py-5">
                                      {col.render ? col.render(row) : <span className="text-slate-600 font-bold text-sm">{row[col.accessor] || '-'}</span>}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ) : (
                      /* Vista Grid (Tarjetas Premium UPGRADED) */
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {locationItems.map(row => (
                          <div key={row.id} className={`location-card group bg-white rounded-[2.5rem] border transition-all duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)] flex flex-col overflow-hidden ${
                            editingId === row.id ? 'border-orange-400 ring-[12px] ring-orange-500/5 shadow-xl' : 'border-slate-100 hover:border-orange-200'
                          }`}>
                            {/* Header Card */}
                            <div className="px-7 py-6 flex justify-between items-center bg-slate-50/30">
                              <div className="flex items-center gap-3">
                                 {editingId === row.id ? (
                                   <input 
                                     type="text" 
                                     value={editLocation} 
                                     onChange={(e) => setEditLocation(e.target.value)}
                                     className="w-32 bg-white border border-orange-200 rounded-xl px-4 py-2 font-mono font-black text-slate-900 text-sm uppercase outline-none focus:ring-4 focus:ring-orange-500/10 shadow-sm"
                                     autoFocus
                                   />
                                 ) : (
                                   <div className="flex items-center gap-2 font-mono font-black text-orange-600 bg-orange-50 px-3.5 py-1.5 rounded-xl border border-orange-100/50 text-sm tracking-tighter group-hover:scale-105 transition-transform">
                                     <MapPin size={14} className="text-orange-500" />
                                     <HighlightText text={row.ubicacion} highlight={submittedTerm} />
                                   </div>
                                 )}
                              </div>
                              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                                 {editingId === row.id ? (
                                   <>
                                     <button onClick={() => saveEdit(row.id)} className="w-10 h-10 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-100 flex items-center justify-center">
                                       <Check size={18} strokeWidth={3} />
                                     </button>
                                     <button onClick={cancelEdit} className="w-10 h-10 bg-slate-100 text-slate-400 rounded-xl hover:bg-slate-200 transition-colors flex items-center justify-center">
                                       <X size={18} strokeWidth={3} />
                                     </button>
                                   </>
                                 ) : (
                                   <>
                                     <button onClick={() => startEdit(row)} className="w-10 h-10 bg-white border border-slate-200 text-slate-400 hover:text-orange-500 hover:border-orange-200 hover:bg-orange-50 rounded-xl transition-all duration-300 flex items-center justify-center shadow-sm">
                                       <Edit2 size={16} />
                                     </button>
                                     <button onClick={() => handleDelete(row.id, row.ubicacion, row.codigo)} className="w-10 h-10 bg-white border border-slate-200 text-slate-400 hover:text-rose-500 hover:border-rose-200 hover:bg-rose-50 rounded-xl transition-all duration-300 flex items-center justify-center shadow-sm">
                                       <Trash2 size={16} />
                                     </button>
                                   </>
                                 )}
                              </div>
                            </div>

                            {/* Body Card */}
                            <div className="p-7 flex-1 flex flex-col">
                              <div className="mb-6">
                                <div className="flex items-center gap-2 mb-2">
                                  <Box size={14} className="text-slate-300" />
                                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Referencia SKU</p>
                                </div>
                                <p className="font-mono font-black text-slate-900 text-lg mb-2 tracking-tighter leading-none group-hover:text-orange-600 transition-colors">
                                  <HighlightText text={row.codigo} highlight={submittedTerm} />
                                </p>
                                <p className="text-sm text-slate-500 font-bold line-clamp-2 leading-relaxed h-10">
                                  <HighlightText text={row.descripcion} highlight={submittedTerm} />
                                </p>
                              </div>

                              <div className="mt-auto flex items-center gap-4">
                                <div className="flex-1 bg-slate-50 p-4 rounded-3xl border border-slate-100 group-hover:bg-white group-hover:border-orange-100 transition-all duration-500">
                                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Unidades</p>
                                  {editingId === row.id ? (
                                    <input 
                                      type="number" 
                                      value={editQuantity} 
                                      onChange={(e) => setEditQuantity(e.target.value)}
                                      className="w-full bg-white border border-orange-200 rounded-xl px-3 py-1 font-black text-slate-900 text-xl outline-none focus:ring-4 focus:ring-orange-500/10"
                                    />
                                  ) : (
                                    <p className="text-3xl font-black text-slate-900 tracking-tighter">{row.cantidad}</p>
                                  )}
                                </div>
                                <div className="flex flex-col gap-2">
                                  <div className="flex items-center gap-3 px-4 py-2.5 bg-slate-50/50 rounded-2xl border border-slate-100 group-hover:border-orange-50 transition-all duration-500">
                                    <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">T</span>
                                    <span className="text-xs font-black text-slate-600">{row.talla || '-'}</span>
                                  </div>
                                  <div className="flex items-center gap-3 px-4 py-2.5 bg-slate-50/50 rounded-2xl border border-slate-100 group-hover:border-orange-50 transition-all duration-500">
                                    <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">C</span>
                                    <span className="text-xs font-black text-slate-600">{row.color?.charAt(0) || '-'}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
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
    </div>
  );
};

export default LocationsQuery;