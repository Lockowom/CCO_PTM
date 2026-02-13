import React, { useEffect, useState } from 'react';
import { Search, MapPin, Box, Layers, RefreshCw } from 'lucide-react';
import { supabase } from '../../supabase';

const LocationsSheet = () => {
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [stats, setStats] = useState({ totalUbicaciones: 0, conProductos: 0 });

  useEffect(() => {
    fetchData();

    // Habilitar Realtime
    const subscription = supabase
      .channel('public:wms_ubicaciones')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'wms_ubicaciones' }, (payload) => {
        // Al recibir cambio, recargamos la data (estrategia simple para consistencia total)
        fetchData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
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
      setRows(arr.sort((a, b) => a.ubicacion.localeCompare(b.ubicacion)));
      setStats({ totalUbicaciones: arr.length, conProductos });
    } catch (e) {
      alert('Error cargando ubicaciones (sheet): ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const filtered = rows.filter(r => {
    const txt = search.trim().toLowerCase();
    if (!txt) return true;
    const matchUb = (r.ubicacion || '').toLowerCase().includes(txt);
    const matchDet = r.detalles.some(d =>
      (d.codigo || '').toLowerCase().includes(txt) ||
      (d.serie || '').toLowerCase().includes(txt) ||
      (d.partida || '').toLowerCase().includes(txt)
    );
    return matchUb || matchDet;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Ubicaciones (Sheet)</h2>
          <p className="text-slate-500 text-sm">Vista directa de wms_ubicaciones sin mezclar con layout</p>
        </div>
        <div className="flex gap-2">
          <div className="flex items-center bg-white border rounded-lg px-3">
            <Search size={18} className="text-slate-400 mr-2" />
            <input
              className="h-10 outline-none text-sm"
              placeholder="Buscar ubicación/código/serie/partida"
              value={search}
              onChange={e=>setSearch(e.target.value)}
            />
          </div>
          <button onClick={fetchData} className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 flex items-center gap-2">
            <RefreshCw size={16}/> Actualizar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border p-4 shadow-sm">
          <div className="text-slate-400 text-xs">Total Ubicaciones</div>
          <div className="text-2xl font-extrabold">{stats.totalUbicaciones}</div>
        </div>
        <div className="bg-white rounded-xl border p-4 shadow-sm">
          <div className="text-slate-400 text-xs">Con Productos</div>
          <div className="text-2xl font-extrabold text-indigo-600">{stats.conProductos}</div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border shadow-sm">
        <div className="p-4 border-b flex items-center gap-2">
          <Layers size={18} className="text-indigo-600" />
          <span className="font-extrabold text-slate-800">Ubicaciones</span>
        </div>
        <div className="p-4">
          {loading ? (
            <div className="text-slate-400">Cargando...</div>
          ) : (
            <div className="space-y-4">
              {filtered.map(r => (
                <div key={r.ubicacion} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MapPin size={16} className="text-indigo-600" />
                      <span className="font-mono font-bold">{r.ubicacion}</span>
                    </div>
                    <div className="text-sm text-slate-500">Total: <span className="font-bold">{r.total}</span></div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {r.detalles.slice(0, 12).map(d => (
                      <span key={`${r.ubicacion}-${d.codigo}-${d.serie}-${d.partida}`} className="px-2 py-1 rounded bg-slate-100 text-slate-700 border text-xs">
                        <Box size={12} className="inline mr-1"/>
                        {d.codigo}
                        {d.serie ? ` · SN ${d.serie}` : ''}
                        {d.partida ? ` · Lote ${d.partida}` : ''}
                        {d.talla ? ` · ${d.talla}` : ''}
                        {d.color ? ` · ${d.color}` : ''}
                        {d.cantidad !== undefined ? ` · ${d.cantidad}` : ''}
                        {d.fecha_vencimiento ? ` · Vence ${new Date(d.fecha_vencimiento).toLocaleDateString()}` : ''}
                      </span>
                    ))}
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
