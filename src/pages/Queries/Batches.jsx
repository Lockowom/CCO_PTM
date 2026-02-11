import React, { useState } from 'react';
import { Search, Barcode, Box, Package, Layers, Scale, MapPin } from 'lucide-react';
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
    
    const term = `%${searchTerm.trim()}%`;
    const newData = { partidas: [], series: [], farmapack: [], peso: { unitario: '-', total: '-' }, ubicaciones: [] };

    try {
      // Función de búsqueda universal robusta
      // Busca en 'codigo_producto' Y 'producto' (o 'descripcion')
      const searchGeneric = async (table, cols) => {
        try {
            // Intentar búsqueda compuesta
            let query = supabase.from(table).select('*').limit(50);
            
            // Construir filtro OR manualmente para asegurar que cubra ambas columnas
            // Sintaxis: columna.ilike.valor,columna2.ilike.valor
            const orFilter = cols.map(c => `${c}.ilike.${term}`).join(',');
            query = query.or(orFilter);
            
            const { data, error } = await query;
            if (error) throw error;
            return data || [];
        } catch (err) {
            console.warn(`Fallback search for ${table}:`, err.message);
            // Fallback: buscar solo por código si la descripción falla
            const { data } = await supabase.from(table).select('*').ilike(cols[0], term).limit(50);
            return data || [];
        }
      };

      // 1. PARTIDAS
      newData.partidas = await searchGeneric('tms_partidas', ['codigo_producto', 'producto']);

      // 2. SERIES
      newData.series = await searchGeneric('tms_series', ['codigo_producto', 'producto', 'serie']);

      // 3. FARMAPACK
      newData.farmapack = await searchGeneric('tms_farmapack', ['codigo_producto', 'producto', 'lote']);

      // 4. UBICACIONES
      const ubiData = await searchGeneric('tms_ubicaciones_historial', ['codigo_producto', 'descripcion']);
      newData.ubicaciones = ubiData;

      // 5. PESO
      const pesoData = await searchGeneric('tms_pesos', ['codigo_producto', 'descripcion']);
      if (pesoData.length > 0) {
          newData.peso = {
              unitario: pesoData[0].peso_unitario || '-',
              total: pesoData[0].peso_unitario ? (pesoData[0].peso_unitario * (newData.partidas[0]?.stock_total || 0)).toFixed(2) : '-'
          };
      }

      setData(newData);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Componente de Panel Estilo "Legacy/Data"
  const DataPanel = ({ title, icon: Icon, color, count, children }) => (
    <div className="flex flex-col h-full border border-slate-300 rounded bg-white shadow-sm overflow-hidden">
      {/* Encabezado Sólido */}
      <div className={`px-3 py-2 ${color} text-white flex justify-between items-center`}>
        <h3 className="font-bold text-sm uppercase flex items-center gap-2">
          <Icon size={16} /> {title}
        </h3>
        <span className="bg-white/20 px-2 py-0.5 rounded text-xs font-mono">
          {count !== undefined ? count : ''}
        </span>
      </div>
      {/* Cuerpo con Scroll */}
      <div className="flex-1 overflow-y-auto p-0 bg-slate-50">
        {children}
      </div>
    </div>
  );

  // Fila de Datos Compacta
  const DataRow = ({ label, value, isHeader = false }) => (
    <div className={`flex justify-between text-xs py-1 px-2 border-b border-slate-200 ${isHeader ? 'bg-slate-100 font-bold' : ''}`}>
      <span className="text-slate-600">{label}</span>
      <span className="text-slate-900 font-medium text-right truncate max-w-[60%]">{value}</span>
    </div>
  );

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col space-y-4">
      {/* Header & Search */}
      <div className="flex-shrink-0 bg-white p-4 rounded border border-slate-200 shadow-sm">
        <h2 className="text-xl font-bold text-slate-800 mb-2">Consulta Maestra</h2>
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
            <input 
              type="text" 
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none uppercase font-mono"
              placeholder="BUSCAR POR CÓDIGO O DESCRIPCIÓN..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              autoFocus
            />
          </div>
          <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-bold transition-colors">
            BUSCAR
          </button>
        </form>
      </div>

      {/* Grid de Resultados */}
      {searched && (
        <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          
          {/* 1. PARTIDAS */}
          <DataPanel title="Partidas" icon={Layers} color="bg-blue-600" count={data.partidas.length}>
            {data.partidas.length > 0 ? data.partidas.map((p, i) => (
              <div key={i} className="mb-2 bg-white border-b border-slate-200 last:border-0">
                <div className="p-2 bg-blue-50 text-blue-900 font-bold text-xs truncate" title={p.producto || p.descripcion}>
                  {p.producto || p.descripcion}
                </div>
                <DataRow label="CÓDIGO" value={p.codigo_producto} />
                <DataRow label="U.MEDIDA" value={p.unidad_medida} />
                <DataRow label="PARTIDA" value={p.partida} />
                <DataRow label="VENCIMIENTO" value={p.fecha_venc} />
                <DataRow label="DISPONIBLE" value={p.disponible} />
                <DataRow label="STOCK TOTAL" value={p.stock_total} />
              </div>
            )) : <div className="p-4 text-center text-xs text-slate-400">Sin datos</div>}
          </DataPanel>

          {/* 2. SERIES */}
          <DataPanel title="Series" icon={Barcode} color="bg-indigo-600" count={data.series.length}>
            {data.series.length > 0 ? data.series.map((s, i) => (
              <div key={i} className="mb-2 bg-white border-b border-slate-200 last:border-0">
                <div className="p-2 bg-indigo-50 text-indigo-900 font-bold text-xs truncate" title={s.producto}>
                  {s.producto || '-'}
                </div>
                <div className="px-2 pt-1 flex justify-between items-center">
                  <span className="font-mono font-bold text-xs text-slate-700">SN: {s.serie}</span>
                  <span className="bg-white px-1 rounded border border-indigo-200 text-[10px] text-indigo-600">{s.estado}</span>
                </div>
                <DataRow label="CÓDIGO" value={s.codigo_producto} />
                <DataRow label="UBICACIÓN" value={s.ubicacion_actual} />
                <DataRow label="DISPONIBLE" value={s.disponible} />
              </div>
            )) : <div className="p-4 text-center text-xs text-slate-400">Sin datos</div>}
          </DataPanel>

          {/* 3. FARMAPACK */}
          <DataPanel title="Farmapack" icon={Package} color="bg-emerald-600" count={data.farmapack.length}>
            {data.farmapack.length > 0 ? data.farmapack.map((f, i) => (
              <div key={i} className="mb-2 bg-white border-b border-slate-200 last:border-0">
                <div className="p-2 bg-emerald-50 text-emerald-900 font-bold text-xs truncate" title={f.producto}>
                  {f.producto || '-'}
                </div>
                <div className="px-2 pt-1 font-mono font-bold text-xs text-slate-700">
                  LOTE: {f.lote}
                </div>
                <DataRow label="CÓDIGO" value={f.codigo_producto} />
                <DataRow label="VENCIMIENTO" value={f.fecha_venc} />
                <DataRow label="CALIDAD" value={f.estado_calidad} />
                <DataRow label="DISPONIBLE" value={f.disponible} />
              </div>
            )) : <div className="p-4 text-center text-xs text-slate-400">Sin datos</div>}
          </DataPanel>

          {/* 4. PESO */}
          <DataPanel title="Peso" icon={Scale} color="bg-amber-600">
            <div className="p-4 flex flex-col items-center justify-center h-full text-slate-600">
              <div className="text-center mb-6">
                <p className="text-xs font-bold uppercase mb-1">Peso Unitario</p>
                <p className="text-3xl font-black text-slate-800">{data.peso?.unitario}</p>
                <p className="text-[10px]">KG</p>
              </div>
              <div className="w-full border-t border-slate-200 my-2"></div>
              <div className="text-center mt-4">
                <p className="text-xs font-bold uppercase mb-1">Peso Total (Est.)</p>
                <p className="text-xl font-bold text-slate-800">{data.peso?.total}</p>
                <p className="text-[10px]">KG</p>
              </div>
            </div>
          </DataPanel>

          {/* 5. UBICACIONES */}
          <DataPanel title="Ubicaciones" icon={MapPin} color="bg-rose-600" count={data.ubicaciones.length}>
            {data.ubicaciones.length > 0 ? data.ubicaciones.map((u, i) => (
              <div key={i} className="p-2 border-b border-slate-200 bg-white hover:bg-rose-50 transition-colors">
                <div className="flex items-center gap-2 font-mono font-bold text-sm text-rose-700">
                  <MapPin size={14} /> {u.ubicacion}
                </div>
                <div className="text-[10px] text-slate-500 mt-1 pl-6">
                  {u.codigo_producto} - {u.cantidad} UN
                </div>
                <div className="text-[10px] text-slate-400 pl-6">
                  {new Date(u.fecha_registro).toLocaleDateString()}
                </div>
              </div>
            )) : <div className="p-4 text-center text-xs text-slate-400">Sin datos</div>}
          </DataPanel>

        </div>
      )}
    </div>
  );
};

export default Batches;
