import React, { useState, useEffect } from 'react';
import { 
  Package, Search, Filter, AlertTriangle, 
  ArrowUpRight, ArrowDownLeft, Move, Download, RefreshCw 
} from 'lucide-react';
import { supabase } from '../../supabase';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Stock = () => {
  const [activeTab, setActiveTab] = useState('products'); // products | movements
  const [items, setItems] = useState([]);
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({
    totalItems: 0,
    lowStock: 0,
    outOfStock: 0,
    totalValue: 0
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // 1. Obtener Inventario Consolidado (Partidas + Series + Farmapack)
      // Por simplicidad, uniremos las tablas principales
      const [partidas, series, farmapack] = await Promise.all([
        supabase.from('tms_partidas').select('*'),
        supabase.from('tms_series').select('*'),
        supabase.from('tms_farmapack').select('*')
      ]);

      // Unificar datos
      const allItems = [
        ...(partidas.data || []).map(i => ({ ...i, tipo: 'PARTIDA', cantidad: i.cantidad_actual || i.disponible })),
        ...(series.data || []).map(i => ({ ...i, tipo: 'SERIE', cantidad: i.disponible })),
        ...(farmapack.data || []).map(i => ({ ...i, tipo: 'FARMAPACK', cantidad: i.cantidad || i.disponible }))
      ];

      setItems(allItems);

      // Calcular estadísticas
      const total = allItems.reduce((sum, i) => sum + (Number(i.cantidad) || 0), 0);
      const low = allItems.filter(i => (Number(i.cantidad) || 0) > 0 && (Number(i.cantidad) || 0) <= 10).length;
      const out = allItems.filter(i => (Number(i.cantidad) || 0) <= 0).length;

      setStats({
        totalItems: total,
        lowStock: low,
        outOfStock: out,
        totalValue: allItems.length
      });

      // 2. Obtener Movimientos (Simulados o desde tabla historial si existe)
      // Si no existe tabla de movimientos unificada, usaremos datos dummy por ahora para el gráfico
      // En una implementación real, se consultaría 'tms_movimientos'
      
    } catch (error) {
      console.error("Error cargando inventario:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = items.filter(item => 
    (item.producto || item.descripcion || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.codigo_producto || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.ubicacion || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Configuración del Gráfico
  const chartData = {
    labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
    datasets: [
      {
        label: 'Entradas',
        data: [12, 19, 3, 5, 2, 3, 10],
        backgroundColor: 'rgba(16, 185, 129, 0.5)',
        borderColor: 'rgb(16, 185, 129)',
        borderWidth: 1,
      },
      {
        label: 'Salidas',
        data: [2, 3, 20, 5, 1, 4, 7],
        backgroundColor: 'rgba(239, 68, 68, 0.5)',
        borderColor: 'rgb(239, 68, 68)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: false },
    },
    scales: {
      y: { beginAtZero: true }
    }
  };

  return (
    <div className="space-y-6 min-h-screen bg-slate-50/50 p-6">
      {/* Header & KPIs */}
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Inventario General</h2>
            <p className="text-slate-500 text-sm mt-1">Gestión consolidada de existencias</p>
          </div>
          <div className="flex gap-2">
            <button className="bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-slate-50 transition-colors">
              <Download size={16} /> Exportar
            </button>
            <button 
              onClick={fetchData}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Actualizar
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Unidades</span>
              <Package size={18} className="text-blue-500" />
            </div>
            <div className="text-2xl font-black text-slate-800">{stats.totalItems.toLocaleString()}</div>
            <div className="text-xs text-green-500 font-medium mt-1 flex items-center gap-1">
              <ArrowUpRight size={12} /> +12% vs mes anterior
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Refs. Activas</span>
              <Filter size={18} className="text-indigo-500" />
            </div>
            <div className="text-2xl font-black text-slate-800">{stats.totalValue.toLocaleString()}</div>
            <div className="text-xs text-slate-400 font-medium mt-1">SKUs únicos en almacén</div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Stock Bajo</span>
              <AlertTriangle size={18} className="text-amber-500" />
            </div>
            <div className="text-2xl font-black text-slate-800">{stats.lowStock}</div>
            <div className="text-xs text-amber-600 font-medium mt-1">Requiere reabastecimiento</div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Agotados</span>
              <AlertTriangle size={18} className="text-red-500" />
            </div>
            <div className="text-2xl font-black text-slate-800">{stats.outOfStock}</div>
            <div className="text-xs text-red-600 font-medium mt-1">Sin stock disponible</div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="border-b border-slate-100 flex">
          <button
            onClick={() => setActiveTab('products')}
            className={`px-6 py-4 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'products' 
                ? 'border-blue-500 text-blue-600 bg-blue-50/50' 
                : 'border-transparent text-slate-500 hover:bg-slate-50'
            }`}
          >
            <Package size={18} /> Productos
          </button>
          <button
            onClick={() => setActiveTab('movements')}
            className={`px-6 py-4 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'movements' 
                ? 'border-blue-500 text-blue-600 bg-blue-50/50' 
                : 'border-transparent text-slate-500 hover:bg-slate-50'
            }`}
          >
            <Move size={18} /> Movimientos
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'products' && (
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="flex gap-4 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input
                    type="text"
                    placeholder="Buscar por código, descripción o ubicación..."
                    className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                  />
                </div>
                <button className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg font-medium hover:bg-slate-200 transition-colors flex items-center gap-2">
                  <Filter size={18} /> Filtros Avanzados
                </button>
              </div>

              {/* Table */}
              <div className="overflow-x-auto rounded-lg border border-slate-200">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-bold tracking-wider">
                    <tr>
                      <th className="px-6 py-4">Código</th>
                      <th className="px-6 py-4">Producto</th>
                      <th className="px-6 py-4">Lote / Serie</th>
                      <th className="px-6 py-4">Ubicación</th>
                      <th className="px-6 py-4 text-right">Cantidad</th>
                      <th className="px-6 py-4 text-center">Estado</th>
                      <th className="px-6 py-4 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {loading ? (
                      <tr><td colSpan="7" className="p-8 text-center text-slate-400">Cargando datos...</td></tr>
                    ) : filteredItems.length === 0 ? (
                      <tr><td colSpan="7" className="p-8 text-center text-slate-400">No se encontraron productos</td></tr>
                    ) : (
                      filteredItems.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 font-mono font-bold text-slate-700">{item.codigo_producto}</td>
                          <td className="px-6 py-4 font-medium text-slate-800 whitespace-normal" title={item.producto || item.descripcion}>
                            {item.producto || item.descripcion}
                          </td>
                          <td className="px-6 py-4">
                            <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-mono border border-slate-200">
                              {item.lote || item.serie || item.partida || 'N/A'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-slate-500 font-mono text-xs">
                            {item.ubicacion || item.ubicacion_actual || '-'}
                          </td>
                          <td className="px-6 py-4 text-right font-black text-slate-800 text-base">
                            {item.cantidad}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                              (item.cantidad > 10) 
                                ? 'bg-green-100 text-green-700' 
                                : (item.cantidad > 0) 
                                  ? 'bg-amber-100 text-amber-700' 
                                  : 'bg-red-100 text-red-700'
                            }`}>
                              {(item.cantidad > 10) ? 'NORMAL' : (item.cantidad > 0) ? 'BAJO' : 'AGOTADO'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button className="text-blue-600 hover:text-blue-800 font-medium text-xs hover:underline">
                              Editar
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'movements' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="font-bold text-slate-700 mb-4">Actividad Reciente</h3>
                <div className="h-64">
                  <Bar data={chartData} options={chartOptions} />
                </div>
              </div>
              
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <h3 className="font-bold text-slate-700 mb-4">Últimos Movimientos</h3>
                <div className="space-y-3">
                  {[1,2,3,4,5].map((_, i) => (
                    <div key={i} className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${i % 2 === 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                          {i % 2 === 0 ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-800">PROD-00{i}</div>
                          <div className="text-[10px] text-slate-500">Hace {i * 10} min</div>
                        </div>
                      </div>
                      <div className="text-sm font-bold text-slate-700">
                        {i % 2 === 0 ? '+50' : '-12'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Stock;