import React, { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Trash2, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';

const Cleanup = () => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);
  
  const [options, setOptions] = useState({
    cleanNV: false,
    cleanPartidas: false,
    cleanSeries: false,
    cleanFarmapack: false
  });

  const handleCheckboxChange = (e) => {
    setOptions({
      ...options,
      [e.target.name]: e.target.checked
    });
  };

  const handleCleanup = async () => {
    // Doble confirmación
    if (!window.confirm("⚠️ ADVERTENCIA CRÍTICA ⚠️\n\nEstás a punto de ELIMINAR PERMANENTEMENTE datos operativos.\nEsta acción NO SE PUEDE DESHACER.\n\n¿Estás absolutamente seguro de continuar?")) {
      return;
    }

    // Segunda confirmación por si acaso
    const confirmText = prompt("Para confirmar, escribe 'BORRAR' en mayúsculas:");
    if (confirmText !== 'BORRAR') {
      alert("Acción cancelada.");
      return;
    }

    setLoading(true);
    setStatus(null);

    try {
      // Llamada al RPC seguro
      const { data, error } = await supabase.rpc('clean_operational_data', {
        p_clean_nv: options.cleanNV,
        p_clean_partidas: options.cleanPartidas,
        p_clean_series: options.cleanSeries,
        p_clean_farmapack: options.cleanFarmapack
      });

      if (error) throw error;

      setStatus({ type: 'success', message: data || 'Limpieza realizada con éxito.' });
      
      // Resetear opciones
      setOptions({
        cleanNV: false,
        cleanPartidas: false,
        cleanSeries: false,
        cleanFarmapack: false
      });

    } catch (error) {
      console.error("Error cleaning data:", error);
      setStatus({ type: 'error', message: "Error al limpiar datos: " + error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
        <div className="flex items-start">
          <AlertTriangle className="text-red-500 mr-3 flex-shrink-0" size={24} />
          <div>
            <h3 className="text-red-800 font-bold text-lg">Zona de Peligro: Limpieza de Datos</h3>
            <p className="text-red-700 text-sm mt-1">
              Esta herramienta permite eliminar masivamente registros de las tablas operativas. 
              Úsala con extrema precaución, idealmente solo para reiniciar entornos de prueba o limpiezas anuales.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h4 className="text-slate-800 font-bold mb-4 flex items-center gap-2">
          <Trash2 size={20} className="text-slate-500" /> Selecciona qué datos eliminar
        </h4>

        <div className="space-y-4 mb-8">
          <label className="flex items-center p-3 border rounded-lg hover:bg-slate-50 cursor-pointer transition-colors">
            <input 
              type="checkbox" 
              name="cleanNV"
              checked={options.cleanNV}
              onChange={handleCheckboxChange}
              className="w-5 h-5 text-red-600 rounded focus:ring-red-500 border-gray-300"
            />
            <div className="ml-3">
              <span className="block text-sm font-bold text-slate-700">Notas de Venta + Entregas TMS</span>
              <span className="block text-xs text-slate-500">Elimina N.V. Diarias y sus entregas asociadas en el planificador.</span>
            </div>
          </label>

          <label className="flex items-center p-3 border rounded-lg hover:bg-slate-50 cursor-pointer transition-colors">
            <input 
              type="checkbox" 
              name="cleanPartidas"
              checked={options.cleanPartidas}
              onChange={handleCheckboxChange}
              className="w-5 h-5 text-red-600 rounded focus:ring-red-500 border-gray-300"
            />
            <div className="ml-3">
              <span className="block text-sm font-bold text-slate-700">Partidas</span>
              <span className="block text-xs text-slate-500">Elimina el detalle de partidas/líneas de venta.</span>
            </div>
          </label>

          <label className="flex items-center p-3 border rounded-lg hover:bg-slate-50 cursor-pointer transition-colors">
            <input 
              type="checkbox" 
              name="cleanSeries"
              checked={options.cleanSeries}
              onChange={handleCheckboxChange}
              className="w-5 h-5 text-red-600 rounded focus:ring-red-500 border-gray-300"
            />
            <div className="ml-3">
              <span className="block text-sm font-bold text-slate-700">Series</span>
              <span className="block text-xs text-slate-500">Elimina el registro de series de productos.</span>
            </div>
          </label>

          <label className="flex items-center p-3 border rounded-lg hover:bg-slate-50 cursor-pointer transition-colors">
            <input 
              type="checkbox" 
              name="cleanFarmapack"
              checked={options.cleanFarmapack}
              onChange={handleCheckboxChange}
              className="w-5 h-5 text-red-600 rounded focus:ring-red-500 border-gray-300"
            />
            <div className="ml-3">
              <span className="block text-sm font-bold text-slate-700">Farmapack</span>
              <span className="block text-xs text-slate-500">Elimina datos de integración Farmapack.</span>
            </div>
          </label>
        </div>

        <button
          onClick={handleCleanup}
          disabled={loading || !Object.values(options).some(Boolean)}
          className="w-full py-3 bg-red-600 hover:bg-red-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg shadow-red-200 transition-all flex items-center justify-center gap-2"
        >
          {loading ? <RefreshCw className="animate-spin" /> : <Trash2 />}
          {loading ? 'Eliminando...' : 'Ejecutar Limpieza'}
        </button>

        {status && (
          <div className={`mt-4 p-4 rounded-lg flex items-center gap-2 ${status.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {status.type === 'success' ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
            <span>{status.message}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cleanup;
