// Picking.jsx - Módulo de Picking con medición de tiempos
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Hand, 
  Package, 
  User, 
  Clock, 
  CheckCircle, 
  Play, 
  Pause, 
  RefreshCw, 
  Search,
  Timer,
  Users,
  FileText,
  ArrowLeft,
  Box,
  LayoutGrid,
  AlertCircle,
  MapPin
} from 'lucide-react';
import { supabase } from '../../supabase';

const Picking = () => {
  const [vista, setVista] = useState('lista'); // 'lista' o 'picking'
  const [nvData, setNvData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Picking activo
  const [nvActiva, setNvActiva] = useState(null);
  const [tiempoInicio, setTiempoInicio] = useState(null);
  const [tiempoTranscurrido, setTiempoTranscurrido] = useState(0);
  const [enPausa, setEnPausa] = useState(false);
  const [tiempoOcio, setTiempoOcio] = useState(0);
  const [pausaInicio, setPausaInicio] = useState(null);
  
  // Usuario simulado
  const [usuario] = useState({ id: 'user-picking-001', nombre: 'Operador Picking' });
  
  const timerRef = useRef(null);
  const ocioRef = useRef(null);

  // Cargar N.V. en estado "Pendiente Picking" o "Aprobada"
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('tms_nv_diarias')
        .select('*')
        .in('estado', ['Pendiente Picking', 'Aprobada'])
        .order('fecha_emision', { ascending: true });

      if (error) throw error;
      setNvData(data || []);
      
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    
    const channel = supabase
      .channel('picking_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tms_nv_diarias' }, () => {
        if (!nvActiva) fetchData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      if (timerRef.current) clearInterval(timerRef.current);
      if (ocioRef.current) clearInterval(ocioRef.current);
    };
  }, [fetchData, nvActiva]);

  // Timer de trabajo
  useEffect(() => {
    if (tiempoInicio && !enPausa) {
      timerRef.current = setInterval(() => {
        setTiempoTranscurrido(Math.floor((Date.now() - tiempoInicio) / 1000) - tiempoOcio);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [tiempoInicio, enPausa, tiempoOcio]);

  // Timer de ocio
  useEffect(() => {
    if (enPausa && pausaInicio) {
      ocioRef.current = setInterval(() => {
        setTiempoOcio(prev => prev + 1);
      }, 1000);
    } else {
      if (ocioRef.current) clearInterval(ocioRef.current);
    }
    return () => { if (ocioRef.current) clearInterval(ocioRef.current); };
  }, [enPausa, pausaInicio]);

  // Iniciar picking
  const iniciarPicking = async (nv) => {
    setNvActiva(nv);
    setTiempoInicio(Date.now());
    setTiempoTranscurrido(0);
    setTiempoOcio(0);
    setEnPausa(false);
    setVista('picking');
    
    // Cambiar estado a "Pendiente Picking" si está "Aprobada"
    if (nv.estado === 'Aprobada') {
      await supabase
        .from('tms_nv_diarias')
        .update({ estado: 'Pendiente Picking' })
        .eq('nv', nv.nv);
    }
    
    // Registrar inicio
    await supabase.from('tms_mediciones_tiempos').insert({
      nv: nv.nv,
      proceso: 'PICKING',
      usuario_id: usuario.id,
      usuario_nombre: usuario.nombre,
      inicio_at: new Date().toISOString(),
      estado: 'EN_PROCESO'
    });
  };

  // Pausar/Reanudar
  const togglePausa = () => {
    if (!enPausa) {
      setPausaInicio(Date.now());
    } else {
      setPausaInicio(null);
    }
    setEnPausa(!enPausa);
  };

  // Finalizar picking
  const finalizarPicking = async () => {
    if (!nvActiva) return;
    
    try {
      // Actualizar N.V. a PACKING
      await supabase
        .from('tms_nv_diarias')
        .update({ estado: 'PACKING' })
        .eq('nv', nvActiva.nv);
      
      // Actualizar medición
      await supabase
        .from('tms_mediciones_tiempos')
        .update({
          fin_at: new Date().toISOString(),
          tiempo_activo: tiempoTranscurrido,
          tiempo_ocio: tiempoOcio,
          estado: 'COMPLETADO',
          updated_at: new Date().toISOString()
        })
        .eq('nv', nvActiva.nv)
        .eq('proceso', 'PICKING')
        .eq('estado', 'EN_PROCESO');
      
      // Reset
      setNvActiva(null);
      setTiempoInicio(null);
      setTiempoTranscurrido(0);
      setTiempoOcio(0);
      setEnPausa(false);
      setVista('lista');
      
      await fetchData();
    } catch (error) {
      console.error('Error:', error);
      alert('Error al finalizar picking');
    }
  };

  // Cancelar
  const cancelarPicking = async () => {
    if (nvActiva) {
      await supabase
        .from('tms_mediciones_tiempos')
        .update({ estado: 'ABANDONADO', updated_at: new Date().toISOString() })
        .eq('nv', nvActiva.nv)
        .eq('proceso', 'PICKING')
        .eq('estado', 'EN_PROCESO');
    }
    
    setNvActiva(null);
    setTiempoInicio(null);
    setTiempoTranscurrido(0);
    setTiempoOcio(0);
    setEnPausa(false);
    setVista('lista');
  };

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Filtrar
  const nvFiltradas = nvData.filter(nv =>
    nv.nv?.toString().includes(searchTerm) ||
    nv.cliente?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    nv.codigo_producto?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Agrupar por estado
  const aprobadas = nvFiltradas.filter(n => n.estado === 'Aprobada');
  const enPicking = nvFiltradas.filter(n => n.estado === 'Pendiente Picking');

  // ==================== VISTA: LISTA ====================
  if (vista === 'lista') {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-end">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <Hand className="text-white" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Picking</h2>
              <p className="text-slate-500 text-sm">Recolección de productos para empaque</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="bg-white border rounded-lg flex items-center px-3 py-2 shadow-sm">
              <Search size={18} className="text-slate-400 mr-2" />
              <input 
                type="text" 
                placeholder="Buscar N.V., cliente..." 
                className="outline-none text-sm w-48"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <button 
              onClick={fetchData}
              disabled={loading}
              className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold uppercase mb-2">
              <FileText size={14} /> Total Pendiente
            </div>
            <p className="text-2xl font-bold text-slate-800">{nvData.length}</p>
          </div>
          <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
            <div className="flex items-center gap-2 text-amber-600 text-xs font-semibold uppercase mb-2">
              <Clock size={14} /> Aprobadas
            </div>
            <p className="text-2xl font-bold text-amber-600">{aprobadas.length}</p>
          </div>
          <div className="bg-cyan-50 rounded-xl p-4 border border-cyan-200">
            <div className="flex items-center gap-2 text-cyan-600 text-xs font-semibold uppercase mb-2">
              <Hand size={14} /> En Picking
            </div>
            <p className="text-2xl font-bold text-cyan-600">{enPicking.length}</p>
          </div>
          <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200">
            <div className="flex items-center gap-2 text-emerald-600 text-xs font-semibold uppercase mb-2">
              <Timer size={14} /> Operador
            </div>
            <p className="text-sm font-bold text-emerald-700">{usuario.nombre}</p>
          </div>
        </div>

        {/* Tabla de N.V. */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-gradient-to-r from-cyan-50 to-blue-50">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <LayoutGrid size={18} className="text-cyan-600" />
              Notas de Venta para Picking
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 uppercase text-xs">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">N.V.</th>
                  <th className="px-4 py-3 text-left font-medium">Cliente</th>
                  <th className="px-4 py-3 text-left font-medium">Producto</th>
                  <th className="px-4 py-3 text-right font-medium">Cantidad</th>
                  <th className="px-4 py-3 text-center font-medium">Estado</th>
                  <th className="px-4 py-3 text-right font-medium">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="px-4 py-12 text-center">
                      <RefreshCw className="animate-spin mx-auto text-cyan-500" size={24} />
                    </td>
                  </tr>
                ) : nvFiltradas.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-4 py-12 text-center text-slate-400">
                      <Package size={32} className="mx-auto mb-2 opacity-40" />
                      <p>No hay N.V. pendientes de picking</p>
                    </td>
                  </tr>
                ) : (
                  nvFiltradas.map((nv, index) => (
                    <tr key={index} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-bold text-cyan-600">#{nv.nv}</td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-700 truncate max-w-[150px]">{nv.cliente}</p>
                        <p className="text-xs text-slate-400">{nv.vendedor}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-mono text-xs text-slate-600">{nv.codigo_producto}</p>
                        <p className="text-xs text-slate-400 truncate max-w-[150px]">{nv.descripcion_producto}</p>
                      </td>
                      <td className="px-4 py-3 text-right font-bold">{nv.cantidad} <span className="text-slate-400 font-normal text-xs">{nv.unidad}</span></td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                          nv.estado === 'Aprobada' 
                            ? 'bg-amber-100 text-amber-700' 
                            : 'bg-cyan-100 text-cyan-700'
                        }`}>
                          {nv.estado === 'Aprobada' ? 'Aprobada' : 'En Picking'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => iniciarPicking(nv)}
                          className="bg-cyan-600 hover:bg-cyan-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 ml-auto"
                        >
                          <Play size={14} /> Iniciar
                        </button>
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
  }

  // ==================== VISTA: PICKING ACTIVO ====================
  return (
    <div className="space-y-6">
      {/* Header con timer */}
      <div className="bg-gradient-to-r from-cyan-600 to-blue-600 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex justify-between items-start mb-6">
          <button onClick={cancelarPicking} className="flex items-center gap-2 text-white/80 hover:text-white">
            <ArrowLeft size={20} /> Cancelar
          </button>
          <div className="text-right">
            <p className="text-white/70 text-sm">Operador</p>
            <p className="font-bold">{usuario.nombre}</p>
          </div>
        </div>
        
        <div className="text-center">
          <p className="text-white/70 text-sm mb-1">Picking N.V.</p>
          <h1 className="text-4xl font-black mb-4">#{nvActiva?.nv}</h1>
          
          <div className="flex justify-center gap-8">
            <div className="text-center">
              <div className={`text-5xl font-mono font-bold ${enPausa ? 'text-amber-300' : ''}`}>
                {formatTime(tiempoTranscurrido)}
              </div>
              <p className="text-white/70 text-sm mt-1">Tiempo Activo</p>
            </div>
            
            {tiempoOcio > 0 && (
              <div className="text-center">
                <div className="text-3xl font-mono font-bold text-red-300">
                  {formatTime(tiempoOcio)}
                </div>
                <p className="text-white/70 text-sm mt-1">Tiempo Ocio</p>
              </div>
            )}
          </div>
          
          <div className="flex justify-center gap-4 mt-6">
            <button
              onClick={togglePausa}
              className={`px-6 py-3 rounded-xl font-bold flex items-center gap-2 ${
                enPausa ? 'bg-amber-500 text-white' : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              {enPausa ? <Play size={20} /> : <Pause size={20} />}
              {enPausa ? 'Reanudar' : 'Pausar'}
            </button>
            
            <button
              onClick={finalizarPicking}
              className="px-6 py-3 bg-emerald-500 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-emerald-600 shadow-lg"
            >
              <CheckCircle size={20} /> Finalizar → Packing
            </button>
          </div>
          
          {enPausa && (
            <div className="mt-4 bg-amber-500/30 border border-amber-400 rounded-lg px-4 py-2 inline-flex items-center gap-2">
              <AlertCircle size={16} />
              <span className="text-sm">En pausa - Tiempo de ocio contando</span>
            </div>
          )}
        </div>
      </div>

      {/* Detalle */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Package size={18} className="text-cyan-500" /> Producto a Recolectar
          </h3>
          
          <div className="space-y-4">
            <div className="bg-cyan-50 rounded-xl p-4 border border-cyan-100">
              <p className="text-xs text-cyan-600 font-semibold uppercase">Código</p>
              <p className="text-xl font-mono font-bold text-cyan-700">{nvActiva?.codigo_producto}</p>
            </div>
            
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase">Descripción</p>
              <p className="text-slate-700">{nvActiva?.descripcion_producto}</p>
            </div>
            
            <div className="bg-emerald-50 rounded-lg p-4 text-center border border-emerald-100">
              <p className="text-4xl font-black text-emerald-600">{nvActiva?.cantidad}</p>
              <p className="text-sm text-emerald-700 font-medium">{nvActiva?.unidad || 'UNI'}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <User size={18} className="text-cyan-500" /> Cliente
          </h3>
          
          <div className="space-y-4">
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase">Cliente</p>
              <p className="text-lg font-bold text-slate-800">{nvActiva?.cliente}</p>
            </div>
            
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase">Vendedor</p>
              <p className="text-slate-700">{nvActiva?.vendedor || '-'}</p>
            </div>
            
            <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
              <p className="text-xs text-indigo-600 font-semibold uppercase mb-1">Siguiente Paso</p>
              <div className="flex items-center gap-2 text-indigo-700">
                <Box size={18} />
                <span className="font-bold">PACKING</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Picking;
