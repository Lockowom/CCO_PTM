import React, { useEffect, useState } from 'react';
import { Search, MapPin, Box, Layers, RefreshCw, AlertCircle } from 'lucide-react';
import { supabase } from '../../supabase';

const LocationsQuery = () => {
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [stats, setStats] = useState({ total: 0, ocupadas: 0, vacias: 0 });
  const [pasillo, setPasillo] = useState('ALL');
  const [estado, setEstado] = useState('ALL');
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      setLoading(true);
      setError(null);

      // Intentar cargar desde wms_ubicaciones directamente (tabla de productos en ubicaciones)
      const { data: ubicaciones, error: e1 } = await supabase
        .from('wms_ubicaciones')
        .select('*')
        .limit(10000);

      if (e1) {
        console.error('Error cargando ubicaciones:', e1);
        setError('Error cargando datos: ' + e1.message);
        return;
      }

      // Agrupar productos por ubicación
      const mapCantidad = {};
      const detalles = {};
      const pasillosSet = new Set();

      if (ubicaciones && ubicaciones.length > 0) {
        ubicaciones.forEach(u => {
          const ub = u.ubicacion || 'SIN_UBICACION';
          const cant = u.cantidad || 1;
          
          mapCantidad[ub] = (mapCantidad[ub] || 0) + cant;
          
          if (!detalles[ub]) detalles[ub] = [];
          detalles[ub].push(u);
          
          // Extraer pasillo de la ubicación (ej: A-01-01 -> A)
          const pasillo = ub.split('-')[0];
          if (pasillo) pasillosSet.add(pasillo);
        });

        const merged = Object.keys(mapCantidad).map((ub) => {
          const pasillo = ub.split('-')[0] || 'GENERAL';
          const columna = ub.split('-')[1] || '0';
          const nivel = ub.split('-')[2] || '0';
          
          return {
            ubicacion: ub,
            pasillo,
            columna,
            nivel,
            estado: mapCantidad[ub] > 0 ? 'OCUPADO' : 'DISPONIBLE',
            cantidad: mapCantidad[ub],
            tieneProductos: mapCantidad[ub] > 0,
            detalles: detalles[ub] || []
          };
        });

        const ocupadas = merged.filter(r => r.tieneProductos).length;
        setRows(merged.sort((a, b) => a.ubicacion.localeCompare(b.ubicacion)));
        setStats({ total: merged.length, ocupadas, vacias: merged.length - ocupadas });
      } else {
        setRows([]);
        setStats({ total: 0, ocupadas: 0, vacias: 0 });
      }
    } catch (err) {
      console.error('Error en fetchAll:', err);
      setError('Error cargando ubicaciones: ' + err.message);
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
        (d.codigo_producto || '').toLowerCase().includes(txt) ||
        (d.serie || '').toLowerCase().includes(txt) ||
        (d.partida || '').toLowerCase().includes(txt) ||
        (d.descripcion || '').toLowerCase().includes(txt)
      );
    return passPasillo && passEstado && passText;
  });

  const pasillosDisponibles = Array.from(new Set(rows.map(r => r.pasillo))).sort();

  return (
    <div className="space-y-6">
      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle size={20} className="text-red-600" />
          <div>
            <p className="font-bold text-red-900">Error cargando datos</p>
            <p className="text-sm text-red-700">{error}</p>
          </div>
          <button 
            onClick={fetchAll} 
            className="ml-auto px-4 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-slate-900">Consulta de Ubicaciones</h2>
          <p className="text-slate-500 text-sm mt-1">Búsqueda por ubicación, código y filtros</p>
        </div>
        <div className="flex gap-2">
          <div className="flex items-center bg-white border-2 border-slate-200 rounded-lg px-3">
            <Search size={18} className="text-slate-400 mr-2" />
            <input
              className="h-10 outline-none text-sm font-medium flex-1"
              placeholder="Buscar ubicación o código (ej: A-01-01, SKU-100)"
              value={search}
              onChange={(e)=>setSearch(e.target.value)}
            />
          </div>
          <button onClick={fetchAll} disabled={loading} className="px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:from-orange-400 disabled:to-orange-400 text-white rounded-lg font-bold flex items-center gap-2 transition-all shadow-lg">
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''}/> Actualizar
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border-2 border-slate-200 p-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="text-slate-400 text-xs font-bold uppercase tracking-wider">Total Ubicaciones</div>
          <div className="text-3xl font-black text-slate-900 mt-2">{stats.total}</div>
        </div>
        <div className="bg-white rounded-lg border-2 border-orange-200 p-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="text-orange-600 text-xs font-bold uppercase tracking-wider">Con Productos</div>
          <div className="text-3xl font-black text-orange-600 mt-2">{stats.ocupadas}</div>
        </div>
        <div className="bg-white rounded-lg border-2 border-slate-200 p-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="text-slate-400 text-xs font-bold uppercase tracking-wider">Vacías</div>
          <div className="text-3xl font-black text-slate-900 mt-2">{stats.vacias}</div>
        </div>
        <div className="bg-white rounded-lg border-2 border-blue-200 p-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="text-blue-600 text-xs font-bold uppercase tracking-wider">Filtradas</div>
          <div className="text-3xl font-black text-blue-600 mt-2">{filtered.length}</div>
        </div>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-xl border-2 border-slate-200 shadow-md overflow-hidden">
        <div className="p-4 border-b-2 border-slate-200 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white">
          <div className="flex items-center gap-2">
            <Layers size={20} className="text-orange-600" />
            <span className="font-black text-slate-900 text-lg">Filtros Avanzados</span>
          </div>
          <div className="flex gap-2 flex-wrap items-center">
            <select className="border-2 border-slate-200 rounded-lg px-3 py-2 text-sm font-medium bg-white hover:border-orange-300 transition-colors focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20" value={pasillo} onChange={e=>setPasillo(e.target.value)}>
              <option value="ALL">Todos los pasillos</option>
              {pasillosDisponibles.map(p => <option key={p} value={p}>Pasillo {p}</option>)}
            </select>
            <select className="border-2 border-slate-200 rounded-lg px-3 py-2 text-sm font-medium bg-white hover:border-orange-300 transition-colors focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20" value={estado} onChange={e=>setEstado(e.target.value)}>
              <option value="ALL">Todos los estados</option>
              <option value="DISPONIBLE">Disponible</option>
              <option value="OCUPADO">Ocupado</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-slate-500 flex items-center justify-center gap-3">
              <RefreshCw size={20} className="animate-spin" />
              <span className="font-medium">Cargando ubicaciones...</span>
            </div>
          ) : rows.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              <Box size={32} className="mx-auto mb-2 opacity-50" />
              <p>No hay ubicaciones registradas</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gradient-to-r from-slate-100 to-slate-50 text-slate-700 text-xs uppercase font-bold tracking-wider">
                  <th className="text-left p-3">Ubicación</th>
                  <th className="text-center p-3">Pasillo</th>
                  <th className="text-center p-3">Col.</th>
                  <th className="text-center p-3">Nivel</th>
                  <th className="text-center p-3">Estado</th>
                  <th className="text-center p-3">Cantidad</th>
                  <th className="text-left p-3">Productos</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filtered.map(r => (
                  <tr key={r.ubicacion} className="hover:bg-orange-50 transition-colors">
                    <td className="p-3 font-mono font-bold flex items-center gap-2"><MapPin size={16} className="text-orange-500"/>{r.ubicacion}</td>
                    <td className="p-3 text-center font-medium text-slate-600">{r.pasillo}</td>
                    <td className="p-3 text-center text-slate-600">{r.columna}</td>
                    <td className="p-3 text-center text-slate-600">{r.nivel}</td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${r.tieneProductos ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-600'}`}>
                        {r.estado}
                      </span>
                    </td>
                    <td className="p-3 text-center font-black text-slate-900">{r.cantidad}</td>
                    <td className="p-3">
                      {r.detalles.length === 0 ? (
                        <span className="text-slate-400 text-xs italic">Sin productos</span>
                      ) : (
                        <div className="flex flex-wrap gap-1.5">
                          {r.detalles.slice(0, 3).map((d, idx) => (
                            <span key={idx} className="px-2 py-1 rounded-md bg-blue-100 text-blue-700 border border-blue-200 text-xs font-medium whitespace-nowrap">
                              <Box size={12} className="inline mr-1"/>
                              {d.codigo || d.codigo_producto || 'SKU'} {d.cantidad ? `(${d.cantidad})` : ''}
                            </span>
                          ))}
                          {r.detalles.length > 3 && (
                            <span className="text-xs text-slate-500 font-medium px-2 py-1">+{r.detalles.length - 3}</span>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default LocationsQuery;
