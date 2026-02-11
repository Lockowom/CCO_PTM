import React, { useState, useEffect } from 'react';
import { Search, MapPin, Phone, Mail, Truck, Building, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '../../supabase';

const Addresses = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);
  const [searchTime, setSearchTime] = useState(0);

  const handleSearch = async () => {
    if (!searchTerm || searchTerm.length < 2) {
      alert("Ingrese al menos 2 caracteres");
      return;
    }

    setLoading(true);
    const startTime = performance.now();
    
    try {
      // Búsqueda en múltiples columnas usando 'ilike' (case insensitive)
      // Nota: Supabase postgrest no tiene un 'OR' global simple para todas las columnas sin sintaxis específica,
      // pero podemos usar el filtro .or()
      
      const { data, error } = await supabase
        .from('tms_direcciones')
        .select('*')
        .or(`razon_social.ilike.%${searchTerm}%,nombre_fantasia.ilike.%${searchTerm}%,rut.ilike.%${searchTerm}%,direccion.ilike.%${searchTerm}%`)
        .limit(50);

      if (error) throw error;

      setResults(data || []);
      setSearched(true);
      
    } catch (err) {
      console.error("Error buscando direcciones:", err);
      alert("Error en la búsqueda: " + err.message);
    } finally {
      const endTime = performance.now();
      setSearchTime((endTime - startTime) / 1000);
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Corporativo */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Maestro de Direcciones</h2>
          <p className="text-slate-500 text-sm">Consulta corporativa de clientes y puntos de entrega</p>
        </div>
      </div>

      {/* Área de Trabajo */}
      <div className="bg-slate-50 min-h-[calc(100vh-200px)] rounded-xl border border-slate-200 p-6 md:p-10">
        
        {/* Buscador Flotante Centrado */}
        <div className="max-w-3xl mx-auto mb-8">
          <div className="bg-white rounded-xl shadow-lg shadow-slate-200/50 flex items-center p-2 border border-slate-100 transition-all focus-within:ring-4 focus-within:ring-indigo-100 focus-within:border-indigo-300">
            <div className="pl-4 pr-3 text-slate-400">
              <Search size={24} />
            </div>
            <input 
              type="text" 
              className="flex-1 h-12 outline-none text-lg text-slate-700 placeholder:text-slate-400"
              placeholder="Buscar por RUT, Razón Social o Dirección..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              autoFocus
            />
            <button 
              onClick={handleSearch}
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-70"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : 'BUSCAR'}
            </button>
          </div>
        </div>

        {/* Resultados */}
        <div className="max-w-5xl mx-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 animate-pulse">
              <Loader2 size={48} className="animate-spin mb-4 text-indigo-400" />
              <p>Buscando en servidor...</p>
            </div>
          ) : searched ? (
            results.length > 0 ? (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="text-xs font-bold text-slate-400 uppercase px-2">
                  Encontrados {results.length} resultados en {searchTime.toFixed(2)}s
                </div>
                
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 border-b border-slate-100">
                      <tr>
                        <th className="p-4 text-xs font-bold text-slate-500 uppercase w-1/3">Cliente / Razón Social</th>
                        <th className="p-4 text-xs font-bold text-slate-500 uppercase w-32">RUT</th>
                        <th className="p-4 text-xs font-bold text-slate-500 uppercase">Ubicación</th>
                        <th className="p-4 text-xs font-bold text-slate-500 uppercase">Dirección Exacta</th>
                        <th className="p-4 text-xs font-bold text-slate-500 uppercase">Contacto</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {results.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50 transition-colors group">
                          <td className="p-4 align-top">
                            <div className="font-bold text-slate-800 text-sm">{item.razon_social}</div>
                            {item.nombre_fantasia && item.nombre_fantasia !== item.razon_social && (
                              <div className="text-xs text-slate-500 mt-1">{item.nombre_fantasia}</div>
                            )}
                            {item.tipo_transporte && (
                              <span className="inline-block mt-2 px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold rounded-full">
                                {item.tipo_transporte}
                              </span>
                            )}
                          </td>
                          <td className="p-4 align-top">
                            <span className="font-mono text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded border border-slate-200 block text-center">
                              {item.rut || '-'}
                            </span>
                          </td>
                          <td className="p-4 align-top">
                            <div className="text-sm text-slate-700 font-medium">{item.comuna}</div>
                            <div className="text-xs text-slate-500 mt-0.5">{item.ciudad}, {item.region}</div>
                          </td>
                          <td className="p-4 align-top">
                            <div className="flex items-start gap-2 text-sm text-slate-600">
                              <MapPin size={16} className="text-slate-400 mt-0.5 flex-shrink-0" />
                              <span>
                                {item.direccion} {item.numero_direccion ? '#' + item.numero_direccion : ''}
                              </span>
                            </div>
                          </td>
                          <td className="p-4 align-top space-y-1">
                            {item.email && (
                              <div className="flex items-center gap-2 text-xs text-indigo-600 hover:underline cursor-pointer">
                                <Mail size={14} /> {item.email}
                              </div>
                            )}
                            {item.telefono_1 && (
                              <div className="flex items-center gap-2 text-xs text-slate-600">
                                <Phone size={14} /> {item.telefono_1}
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="text-center py-16 text-slate-400">
                <Search size={48} className="mx-auto mb-4 opacity-20" />
                <h3 className="text-lg font-bold text-slate-600 mb-1">Sin coincidencias</h3>
                <p>No se encontraron registros en la base de datos.</p>
              </div>
            )
          ) : (
            <div className="text-center py-20 text-slate-400">
              <Building size={48} className="mx-auto mb-4 opacity-10" />
              <h3 className="text-lg font-bold text-slate-500 mb-1">Búsqueda Corporativa</h3>
              <p>Ingresa RUT, Nombre o Dirección y presiona Enter.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Addresses;
