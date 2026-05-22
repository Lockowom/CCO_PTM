import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { Search, MapPin, Box, Layers, RefreshCw, Activity } from 'lucide-react';
import { supabase } from '../../supabase';

const LocationsSheet = () => {
  const containerRef = useRef();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');

  useGSAP(() => {
    gsap.from(containerRef.current, {
      y: 20,
      opacity: 0,
      duration: 0.4,
      ease: 'power3.out',
      clearProps: 'all'
    });
  }, { scope: containerRef });

  useEffect(() => {
    const subscription = supabase
      .channel('public:wms_ubicaciones')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'wms_ubicaciones' }, () => {
        queryClient.invalidateQueries(['locations_sheet']);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [queryClient]);

  const { data: locationsData = { rows: [], stats: { totalUbicaciones: 0, conProductos: 0 } }, isLoading: loading } = useQuery({
    queryKey: ['locations_sheet'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('wms_ubicaciones')
        .select('ubicacion,codigo,descripcion,cantidad,talla,color,serie,partida,fecha_vencimiento')
        .limit(10000);
      
      if (error) throw error;
      
      const grouped = {};
      (data || []).forEach(d => {
        const u = d.ubicacion || '';
        if (!grouped[u]) grouped[u] = [];
        grouped[u].push(d);
      });
      
      const arr = Object.entries(grouped).map(([ubicacion, detalles]) => ({
        ubicacion,
        total: detalles.reduce((a, b) => a + (b.cantidad || 0), 0),
        detalles
      }));
      
      const conProductos = arr.filter(r => r.total > 0).length;
      
      return { 
        rows: arr.sort((a, b) => a.ubicacion.localeCompare(b.ubicacion)), 
        stats: { totalUbicaciones: arr.length, conProductos } 
      };
    }
  });

  const { rows, stats } = locationsData;

  const filtered = useMemo(() => {
    const txt = search.trim().toLowerCase();
    if (!txt) return rows;
    return rows.filter(r => {
      const matchUb = (r.ubicacion || '').toLowerCase().includes(txt);
      const matchDet = r.detalles.some(d =>
        (d.codigo || '').toLowerCase().includes(txt) ||
        (d.serie || '').toLowerCase().includes(txt) ||
        (d.partida || '').toLowerCase().includes(txt)
      );
      return matchUb || matchDet;
    });
  }, [rows, search]);

  return (
    <div ref={containerRef} className="space-y-6 min-h-screen bg-slate-50 text-slate-700 p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-slate-200 pb-4 relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl"></div>
        <div className="relative z-10">
          <h2 className="text-3xl font-black text-slate-900 flex items-center gap-3 tracking-tight">
            <div className="p-2 bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded-xl shadow-[0_0_15px_rgba(99,102,241,0.2)]">
              <Layers size={24} />
            </div>
            UBICACIONES (SHEET)
          </h2>
          <p className="text-slate-500 text-sm mt-1 font-medium ml-1">Vista directa de inventario sin agrupamiento por layout</p>
        </div>
        <div className="flex gap-3 relative z-10 w-full md:w-auto">
          <div className="flex-1 md:flex-none flex items-center bg-white border border-slate-200 rounded-xl px-3 focus-within:border-indigo-500/50 focus-within:ring-1 focus-within:ring-indigo-500/50 transition-all">
            <Search size={18} className="text-slate-500 mr-2" />
            <input
              className="h-11 bg-transparent outline-none text-sm text-slate-900 w-full placeholder-slate-500"
              placeholder="Buscar ubicación, código, serie..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <button 
            onClick={() => queryClient.invalidateQueries(['locations_sheet'])} 
            disabled={loading}
            className="px-4 py-2 bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded-xl font-bold hover:bg-indigo-500/30 flex items-center gap-2 transition-all disabled:opacity-50"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} /> 
            <span className="hidden sm:inline">Actualizar</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
        <div className="bg-white backdrop-blur-xl rounded-2xl border border-slate-200 p-5 shadow-2xl">
          <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Total Ubicaciones</div>
          <div className="text-3xl font-black text-slate-900">{stats.totalUbicaciones}</div>
        </div>
        <div className="bg-indigo-500/10 rounded-2xl border border-indigo-500/20 p-5 shadow-[0_0_15px_rgba(99,102,241,0.1)]">
          <div className="text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">Con Productos</div>
          <div className="text-3xl font-black text-indigo-300">{stats.conProductos}</div>
        </div>
      </div>

      <div className="bg-white backdrop-blur-xl rounded-2xl border border-slate-200 shadow-2xl relative z-10 overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex items-center gap-3 bg-slate-50/50">
          <div className="bg-wms-neon/20 p-1.5 rounded-lg border border-wms-neon/30">
            <Activity size={18} className="text-wms-neon" />
          </div>
          <span className="font-black text-slate-900 tracking-tight">Detalle de Inventario</span>
          <span className="ml-auto bg-slate-50 border border-slate-200 px-2 py-1 rounded-md text-xs font-bold text-slate-500">
            {filtered.length} posiciones
          </span>
        </div>
        <div className="p-6">
          {loading && !rows.length ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-500 gap-3">
              <div className="w-10 h-10 border-4 border-slate-200 border-t-indigo-400 rounded-full animate-spin"></div>
              <span>Cargando inventario...</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-500">
              <MapPin size={48} className="mb-3 opacity-50" />
              <p>No se encontraron ubicaciones que coincidan con la búsqueda.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filtered.map(r => (
                <div key={r.ubicacion} className="bg-slate-50/50 border border-slate-200 rounded-xl p-5 hover:border-slate-500 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1.5 rounded-lg">
                      <MapPin size={16} className="text-indigo-400" />
                      <span className="font-mono font-black text-indigo-300">{r.ubicacion}</span>
                    </div>
                    <div className="text-sm text-slate-500 bg-white px-3 py-1 rounded-lg border border-slate-200">
                      Total: <span className="font-black text-slate-900">{r.total}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {r.detalles.slice(0, 12).map(d => (
                      <span key={`${r.ubicacion}-${d.codigo}-${d.serie}-${d.partida}`} className="px-2.5 py-1.5 rounded-lg bg-white text-slate-700 border border-slate-200 text-xs font-medium flex items-center gap-1.5">
                        <Box size={12} className="text-slate-500"/>
                        <span className="font-bold text-slate-900 font-mono">{d.codigo}</span>
                        {d.serie ? <span className="text-amber-400 font-mono">SN {d.serie}</span> : ''}
                        {d.partida ? <span className="text-emerald-400 font-mono">L {d.partida}</span> : ''}
                        {d.talla ? <span className="text-slate-500">T {d.talla}</span> : ''}
                        {d.color ? <span className="text-slate-500">C {d.color}</span> : ''}
                        {d.cantidad !== undefined ? <span className="text-indigo-300 font-bold px-1 bg-indigo-500/20 rounded">Q {d.cantidad}</span> : ''}
                      </span>
                    ))}
                    {r.detalles.length > 12 && (
                      <span className="px-2.5 py-1.5 rounded-lg bg-slate-50 text-slate-500 border border-slate-200 text-xs font-bold">
                        +{r.detalles.length - 12} más...
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LocationsSheet;
