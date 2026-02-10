import React, { useState, useEffect } from 'react';
import { Package, Search, Filter, AlertTriangle } from 'lucide-react';

const API_URL = 'https://cco-ptm.onrender.com/api';

const Stock = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchStock();
  }, []);

  const fetchStock = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/inventario`);
      const data = await res.json();
      setItems(data);
    } catch (error) {
      console.error("Error cargando inventario:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = items.filter(item => 
    item.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.codigo_producto?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Inventario / Stock</h2>
          <p className="text-slate-500 text-sm">Control de existencias y lotes</p>
        </div>
        <div className="flex gap-3">
            <div className="bg-white border rounded-lg flex items-center px-3 py-2 shadow-sm">
                <Search size={18} className="text-slate-400 mr-2" />
                <input 
                    type="text" 
                    placeholder="Buscar producto..." 
                    className="outline-none text-sm w-64"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </div>
            <button className="bg-white border hover:bg-slate-50 text-slate-600 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm">
                <Filter size={16} />
                Filtros
            </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase text-xs tracking-wider">
              <tr>
                <th className="px-6 py-4 font-medium">Código</th>
                <th className="px-6 py-4 font-medium">Producto</th>
                <th className="px-6 py-4 font-medium">Lote / Serie</th>
                <th className="px-6 py-4 font-medium text-right">Cantidad</th>
                <th className="px-6 py-4 font-medium text-right">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-slate-400">
                        Cargando inventario...
                    </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-slate-400">
                        No se encontraron productos
                    </td>
                </tr>
              ) : (
                filteredItems.map((item, index) => (
                    <tr key={index} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">{item.codigo_producto}</td>
                    <td className="px-6 py-4 text-slate-600 font-medium">{item.descripcion}</td>
                    <td className="px-6 py-4 text-slate-500">
                        <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-mono border border-slate-200">
                            {item.lote || item.partida || 'S/L'}
                        </span>
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-slate-800">
                        {item.cantidad || 0}
                    </td>
                    <td className="px-6 py-4 text-right">
                        <span className="text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full text-xs font-medium border border-emerald-100">
                            Disponible
                        </span>
                    </td>
                    </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Stock;
