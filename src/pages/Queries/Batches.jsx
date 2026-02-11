import React, { useState } from 'react';
import { Search, Barcode, Box, Calendar, MapPin, Scale, Package, Layers } from 'lucide-react';
import { supabase } from '../../supabase';

const Batches = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    partidas: [],
    series: [],
    farmapack: [],
    peso: null,
    ubicaciones: []
  });
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    setLoading(true);
    setSearched(true);
    
    const newData = {
      partidas: [],
      series: [],
      farmapack: [],
      peso: { unitario: 0, total: 0 },
      ubicaciones: []
    };

    try {
      const term = `%${searchTerm}%`;

      // 1. PARTIDAS (Todas las columnas)
      const { data: partidas } = await supabase
        .from('tms_partidas')
        .select('*')
        .or(`codigo_producto.ilike.${term},producto.ilike.${term}`);
      
      if (partidas) newData.partidas = partidas;

      // 2. SERIES (Todas las columnas)
      const { data: series } = await supabase
        .from('tms_series')
        .select('*')
        .or(`codigo_producto.ilike.${term},producto.ilike.${term},serie.ilike.${term}`);
      
      if (series) newData.series = series;

      // 3. FARMAPACK (Todas las columnas)
      const { data: farmapack } = await supabase
        .from('tms_farmapack')
        .select('*')
        .or(`codigo_producto.ilike.${term},producto.ilike.${term},lote.ilike.${term}`);
      
      if (farmapack) newData.farmapack = farmapack;

      // 4. UBICACIONES (Desde tabla real)
      const { data: ubicaciones } = await supabase
        .from('tms_ubicaciones_historial')
        .select('*')
        .or(`codigo_producto.ilike.${term},descripcion.ilike.${term},serie.ilike.${term}`)
        .order('fecha_registro', { ascending: false })
        .limit(20);

      if (ubicaciones) newData.ubicaciones = ubicaciones.map(u => ({ nombre: u.ubicacion }));

      // 5. PESO (Desde tabla real)
      const { data: pesos } = await supabase
        .from('tms_pesos')
        .select('*')
        .or(`codigo_producto.ilike.${term},descripcion.ilike.${term}`)
        .single(); // Asumimos un solo registro maestro por producto

      if (pesos) {
         newData.peso = { 
             unitario: pesos.peso_unitario, 
             total: 'Calc...' // Podríamos multiplicar por stock si quisiéramos
         };
      } else {
         newData.peso = { unitario: 'N/A', total: 'N/A' };
      }

      setData(newData);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Componente de Tarjeta Expandida (Tabla)
  const DetailCard = ({ title, icon: Icon, color, children, count }) => (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
      <div className={`p-3 border-b border-slate-100 ${color} bg-opacity-10 flex justify-between items-center`}>
        <h3 className={`font-bold text-sm flex items-center gap-2 ${color.replace('bg-', 'text-').replace('bg-opacity-10', '')}`}>
          <Icon size={18} /> {title}
        </h3>
        {count !== undefined && (
          <span className="bg-white px-2 py-0.5 rounded text-xs font-bold shadow-sm text-slate-600">
            {count}
          </span>
        )}
      </div>
      <div className="flex-1 overflow-auto p-0">
        {children}
      </div>
    </div>
  );

  // Fila de Detalle Genérica
  const DetailRow = ({ label, value, highlight = false }) => (
    <div className="flex justify-between text-xs py-1 border-b border-slate-50 last:border-0">
        <span className="text-slate-500 font-medium">{label}:</span>
        <span className={`font-bold ${highlight ? 'text-indigo-600' : 'text-slate-700'}`}>{value || '-'}</span>
    </div>
  );

  return (
    <div className="space-y-6 h-[calc(100vh-100px)] flex flex-col">
      <div className="flex-shrink-0">
        <h2 className="text-2xl font-bold text-slate-800">Consulta Maestra</h2>
        <p className="text-slate-500 text-sm">Vista detallada por Código o Descripción</p>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex-shrink-0">
        <form onSubmit={handleSearch} className="relative flex gap-2">
            <div className="relative flex-1">
                <Search className="absolute left-4 top-3 text-slate-400" size={20} />
                <input 
                    type="text" 
                    placeholder="Ingrese Código o Descripción del Producto..." 
                    className="w-full pl-12 pr-4 py-2.5 rounded-lg border border-slate-200 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    autoFocus
                />
            </div>
            <button 
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg font-bold transition-colors"
                disabled={loading}
            >
                {loading ? '...' : 'Buscar'}
            </button>
        </form>
      </div>

      {searched && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 flex-1 overflow-hidden min-h-0 pb-4">
            
            {/* 1. PARTIDAS */}
            <DetailCard title="PARTIDAS" icon={Layers} color="bg-blue-500" count={data.partidas.length}>
                <div className="p-2 space-y-2">
                    {data.partidas.length > 0 ? data.partidas.map((p, i) => (
                        <div key={i} className="bg-slate-50 p-2 rounded border border-slate-100">
                            <p className="font-bold text-xs text-blue-800 mb-1 truncate" title={p.producto}>{p.producto}</p>
                            <DetailRow label="Código" value={p.codigo_producto} />
                            <DetailRow label="U. Medida" value={p.unidad_medida} />
                            <DetailRow label="Partida" value={p.partida} />
                            <DetailRow label="Vencimiento" value={p.fecha_venc ? new Date(p.fecha_venc).toLocaleDateString() : '-'} />
                            <DetailRow label="Disponible" value={p.disponible} highlight />
                            <DetailRow label="Reserva" value={p.reserva} />
                            <DetailRow label="Stock Total" value={p.stock_total} />
                        </div>
                    )) : <p className="text-center text-xs text-slate-400 py-4">Sin datos</p>}
                </div>
            </DetailCard>

            {/* 2. SERIES */}
            <DetailCard title="SERIES" icon={Barcode} color="bg-indigo-500" count={data.series.length}>
                <div className="p-2 space-y-2">
                    {data.series.length > 0 ? data.series.map((s, i) => (
                        <div key={i} className="bg-slate-50 p-2 rounded border border-slate-100">
                            <div className="flex justify-between mb-1">
                                <span className="bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded text-[10px] font-bold">SN: {s.serie}</span>
                            </div>
                            <DetailRow label="Código" value={s.codigo_producto} />
                            <DetailRow label="Ubicación" value={s.ubicacion_actual} />
                            <DetailRow label="Estado" value={s.estado} highlight />
                            <DetailRow label="Disponible" value={s.disponible} />
                            <DetailRow label="Reserva" value={s.reserva} />
                        </div>
                    )) : <p className="text-center text-xs text-slate-400 py-4">Sin datos</p>}
                </div>
            </DetailCard>

            {/* 3. FARMAPACK */}
            <DetailCard title="FARMAPACK" icon={Package} color="bg-emerald-500" count={data.farmapack.length}>
                <div className="p-2 space-y-2">
                    {data.farmapack.length > 0 ? data.farmapack.map((f, i) => (
                        <div key={i} className="bg-slate-50 p-2 rounded border border-slate-100">
                            <div className="flex justify-between mb-1">
                                <span className="bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded text-[10px] font-bold">Lote: {f.lote}</span>
                            </div>
                            <DetailRow label="Código" value={f.codigo_producto} />
                            <DetailRow label="Vencimiento" value={f.fecha_venc ? new Date(f.fecha_venc).toLocaleDateString() : '-'} />
                            <DetailRow label="Calidad" value={f.estado_calidad} />
                            <DetailRow label="Disponible" value={f.disponible} highlight />
                            <DetailRow label="Stock Total" value={f.stock_total} />
                        </div>
                    )) : <p className="text-center text-xs text-slate-400 py-4">Sin datos</p>}
                </div>
            </DetailCard>

            {/* 4. PESO */}
            <DetailCard title="PESO" icon={Scale} color="bg-amber-500">
                <div className="p-4 flex flex-col items-center justify-center h-full text-slate-500">
                    <p className="text-xs uppercase font-bold mb-2">Peso Unitario</p>
                    <p className="text-3xl font-black text-amber-600">{data.peso?.unitario || '-'}</p>
                    <p className="text-[10px]">kg</p>
                    
                    <div className="w-full h-px bg-slate-200 my-4"></div>
                    
                    <p className="text-xs uppercase font-bold mb-2">Peso Total</p>
                    <p className="text-xl font-bold text-slate-700">{data.peso?.total || '-'}</p>
                    <p className="text-[10px]">kg</p>
                </div>
            </DetailCard>

            {/* 5. UBICACIONES */}
            <DetailCard title="UBICACIONES" icon={MapPin} color="bg-rose-500" count={data.ubicaciones.length}>
                <div className="p-2 space-y-2">
                    {data.ubicaciones.length > 0 ? data.ubicaciones.map((u, i) => (
                        <div key={i} className="flex items-center gap-2 p-2 bg-rose-50 rounded border border-rose-100 text-rose-800 font-bold text-sm">
                            <MapPin size={16} />
                            <span>{u.nombre}</span>
                        </div>
                    )) : <p className="text-center text-xs text-slate-400 py-4">Sin datos</p>}
                </div>
            </DetailCard>

        </div>
      )}
    </div>
  );
};

export default Batches;
