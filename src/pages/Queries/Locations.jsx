import React, { useEffect, useState } from 'react';
import { Search, MapPin, Box, Layers, RefreshCw } from 'lucide-react';
import { supabase } from '../../supabase';

const LocationsQuery = () => {
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [stats, setStats] = useState({ total: 0, ocupadas: 0, vacias: 0 });
  const [pasillo, setPasillo] = useState('ALL');
  const [estado, setEstado] = useState('ALL');

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const { data: layout, error: e1 } = await supabase
        .from('wms_layout')
        .select('*');
      if (e1) throw e1;
      const { data: ubicaciones, error: e2 } = await supabase
        .from('wms_ubicaciones')
        .select('ubicacion,codigo,descripcion,cantidad,talla,color,serie,partida,fecha_vencimiento');
      if (e2) throw e2;
      const mapCantidad = {};
      const detalles = {};
      ubicaciones?.forEach(u => {
        mapCantidad[u.ubicacion] = (mapCantidad[u.ubicacion] || 0) + (u.cantidad || 0);
        if (!detalles[u.ubicacion]) detalles[u.ubicacion] = [];
        detalles[u.ubicacion].push(u);
      });
      const merged = (layout || []).map(l => ({
        ...l,
        cantidad: mapCantidad[l.ubicacion] || 0,
        tieneProductos: (mapCantidad[l.ubicacion] || 0) > 0,
        detalles: detalles[l.ubicacion] || []
      }));
      const ocupadas = merged.filter(r => r.tieneProductos).length;
      setRows(merged);
      setStats({ total: merged.length, ocupadas, vacias: merged.length - ocupadas });
    } catch (err) {
      console.error('Error cargando ubicaciones:', err);
      alert('Error cargando ubicaciones: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const filtered = rows.filter(r => {
    const passPasillo = pasillo === 'ALL' || r.pasillo === pasillo;
    const passEstado = estado === 'ALL' || r.estado === estado;
    const txt = search.trim().toLowerCase();
    const passText = !txt 
      || r.ubicacion.toLowerCase().includes(txt) 
      || r.detalles.some(d => 
        (d.codigo || '').toLowerCase().includes(txt) ||
        (d.serie || '').toLowerCase().includes(txt) ||
        (d.partida || '').toLowerCase().includes(txt)
      );
    return passPasillo && passEstado && passText;
  });

  const pasillosDisponibles = Array.from(new Set(rows.map(r => r.pasillo))).sort();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Consulta de Ubicaciones</h2>
          <p className="text-slate-500 text-sm">Búsqueda por ubicación, código y filtros</p>
        </div>
        <div className="flex gap-2">
          <div className="flex items-center bg-white border rounded-lg px-3">
            <Search size={18} className="text-slate-400 mr-2" />
            <input
              className="h-10 outline-none text-sm"
              placeholder="Buscar ubicación o código (ej: C2-01-01, SKU-100)"
              value={search}
              onChange={(e)=>setSearch(e.target.value)}
            />
          </div>
          <button onClick={fetchAll} className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 flex items-center gap-2">
            <RefreshCw size={16}/> Actualizar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border p-4 shadow-sm">
          <div className="text-slate-400 text-xs">Total Ubicaciones</div>
          <div className="text-2xl font-extrabold">{stats.total}</div>
        </div>
        <div className="bg-white rounded-xl border p-4 shadow-sm">
          <div className="text-slate-400 text-xs">Con Productos</div>
          <div className="text-2xl font-extrabold text-indigo-600">{stats.ocupadas}</div>
        </div>
        <div className="bg-white rounded-xl border p-4 shadow-sm">
          <div className="text-slate-400 text-xs">Vacías</div>
          <div className="text-2xl font-extrabold">{stats.vacias}</div>
        </div>
        <div className="bg-white rounded-xl border p-4 shadow-sm">
          <div className="text-slate-400 text-xs">Filtradas</div>
          <div className="text-2xl font-extrabold">{filtered.length}</div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border shadow-sm">
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers size={18} className="text-indigo-600" />
            <span className="font-extrabold text-slate-800">Filtros</span>
          </div>
          <div className="flex gap-2 flex-wrap">
            <select className="border rounded-lg px-3 py-2 text-sm" value={pasillo} onChange={e=>setPasillo(e.target.value)}>
              <option value="ALL">Todos los pasillos</option>
              {pasillosDisponibles.map(p => <option key={p} value={p}>Pasillo {p}</option>)}
            </select>
            <select className="border rounded-lg px-3 py-2 text-sm" value={estado} onChange={e=>setEstado(e.target.value)}>
              <option value="ALL">Todos los estados</option>
              <option value="DISPONIBLE">Disponible</option>
              <option value="OCUPADO">Ocupado</option>
              <option value="NO DISPONIBLE">No disponible</option>
            </select>
          </div>
        </div>

        <div className="p-4">
          {loading ? (
            <div className="text-slate-400">Cargando...</div>
          ) : (
            <div className="overflow-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-slate-500 text-xs uppercase">
                    <th className="text-left p-2">Ubicación</th>
                    <th className="text-left p-2">Pasillo</th>
                    <th className="text-center p-2">Columna</th>
                    <th className="text-center p-2">Nivel</th>
                    <th className="text-center p-2">Estado</th>
                    <th className="text-center p-2">Cantidad</th>
                    <th className="text-left p-2">Detalles</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filtered.map(r => (
                    <tr key={r.ubicacion}>
                      <td className="p-2 font-mono flex items-center gap-2"><MapPin size={14} className="text-indigo-600"/>{r.ubicacion}</td>
                      <td className="p-2">{r.pasillo}</td>
                      <td className="p-2 text-center">{r.columna}</td>
                      <td className="p-2 text-center">{r.nivel}</td>
                      <td className="p-2 text-center">{r.estado}</td>
                      <td className="p-2 text-center font-bold">{r.cantidad}</td>
                      <td className="p-2">
                        {r.detalles.length === 0 ? (
                          <span className="text-slate-400 text-xs">Sin registros</span>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {r.detalles.slice(0, 4).map(d => (
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
                            {r.detalles.length > 4 && (
                              <span className="text-xs text-slate-500">+{r.detalles.length - 4} más</span>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LocationsQuery;
