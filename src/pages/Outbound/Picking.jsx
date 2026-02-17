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

import { useAuth } from '../../context/AuthContext'; // Importar contexto de usuario

const Picking = () => {
  const { user } = useAuth(); // Obtener usuario real
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
  
  // Usuario simulado (ELIMINADO - Usar user del contexto)
  // const [usuario] = useState({ id: 'user-picking-001', nombre: 'Operador Picking' });
  
  const timerRef = useRef(null);
  const ocioRef = useRef(null);

  const [action, setAction] = useState(null); // 'COMPLETO', 'PARCIAL', 'SIN_STOCK'
  const [cantidadReal, setCantidadReal] = useState('');

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

      // AGRUPAR POR N.V.
      const grouped = {};
      (data || []).forEach(item => {
        const nvId = item.nv;
        if (!grouped[nvId]) {
          grouped[nvId] = {
            ...item,
            items: [],
            total_items: 0,
            total_cantidad: 0
          };
        }
        grouped[nvId].items.push(item);
        grouped[nvId].total_items++;
        grouped[nvId].total_cantidad += parseInt(item.cantidad) || 0;
      });

      setNvData(Object.values(grouped));
      
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
    // Verificar si ya está asignada a otro usuario
    if (nv.usuario_asignado && nv.usuario_asignado !== user.id) {
      alert(`⚠️ Esta N.V. ya está siendo procesada por: ${nv.usuario_nombre}`);
      return;
    }

    setNvActiva(nv);
    setTiempoInicio(Date.now());
    setTiempoTranscurrido(0);
    setTiempoOcio(0);
    setEnPausa(false);
    setVista('picking');
    
    // Cambiar estado y ASIGNAR USUARIO
    const updateData = {
      estado: 'Pendiente Picking',
      usuario_asignado: user.id,
      usuario_nombre: user.nombre
    };

    // Si ya estaba aprobada, cambiar estado, si no solo asignar
    await supabase
      .from('tms_nv_diarias')
      .update(updateData)
      .eq('nv', nv.nv);
    
    // Registrar inicio en mediciones
    await supabase.from('tms_mediciones_tiempos').insert({
      nv: nv.nv,
      proceso: 'PICKING',
      usuario_id: user.id,
      usuario_nombre: user.nombre,
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
  const finalizarPicking = async (tipoAccion) => {
    if (!nvActiva) return;
    
    // Validar cantidad si es parcial
    if (tipoAccion === 'PARCIAL' && (!cantidadReal || parseInt(cantidadReal) <= 0)) {
      alert('Debes ingresar la cantidad real pickeada');
      return;
    }

    const cantidadPickeada = tipoAccion === 'COMPLETO' 
      ? nvActiva.total_cantidad 
      : tipoAccion === 'PARCIAL' 
        ? parseInt(cantidadReal) 
        : 0;
    
    // Determinar nuevo estado según acción
    const nuevoEstado = tipoAccion === 'SIN_STOCK' ? 'QUIEBRE_STOCK' : 'PACKING';

    try {
      // Actualizar N.V. y LIBERAR ASIGNACIÓN (para que packing la tome)
      await supabase
        .from('tms_nv_diarias')
        .update({ 
          estado: nuevoEstado,
          cantidad_real: cantidadPickeada,
          picking_status: tipoAccion,
          usuario_asignado: null, // Liberar para el siguiente proceso
          usuario_nombre: null
        })
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
      setAction(null);
      setCantidadReal('');
      
      await fetchData();
    } catch (error) {
      console.error('Error:', error);
      alert('Error al finalizar picking');
    }
  };

  // Cancelar
  const cancelarPicking = async () => {
    if (nvActiva) {
      // Registrar abandono
      await supabase
        .from('tms_mediciones_tiempos')
        .update({ estado: 'ABANDONADO', updated_at: new Date().toISOString() })
        .eq('nv', nvActiva.nv)
        .eq('proceso', 'PICKING')
        .eq('estado', 'EN_PROCESO');

      // Liberar N.V.
      await supabase
        .from('tms_nv_diarias')
        .update({ 
          estado: 'Aprobada', // Volver a estado anterior
          usuario_asignado: null,
          usuario_nombre: null
        })
        .eq('nv', nvActiva.nv);
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
    // Buscar en los items
    nv.items?.some(i => 
      i.codigo_producto?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.descripcion_producto?.toLowerCase().includes(searchTerm.toLowerCase())
    )
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
            <p className="text-sm font-bold text-emerald-700 truncate">{user?.nombre || 'Desconocido'}</p>
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
                  <th className="px-4 py-3 text-left font-medium">Asignado</th>
                  <th className="px-4 py-3 text-right font-medium">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="px-4 py-12 text-center">
                      <RefreshCw className="animate-spin mx-auto text-cyan-500" size={24} />
                    </td>
                  </tr>
                ) : nvFiltradas.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-4 py-12 text-center text-slate-400">
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
                        {nv.total_items > 1 ? (
                          <div className="flex items-center gap-1">
                            <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded text-xs font-bold">
                              {nv.total_items} items
                            </span>
                            <span className="text-xs text-slate-400 truncate max-w-[100px]">
                              {nv.descripcion_producto} ...
                            </span>
                          </div>
                        ) : (
                          <>
                            <p className="font-mono text-xs text-slate-600">{nv.codigo_producto}</p>
                            <p className="text-xs text-slate-400 truncate max-w-[150px]">{nv.descripcion_producto}</p>
                          </>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right font-bold">
                        {nv.total_items > 1 ? (
                           <span>{nv.total_cantidad} <span className="text-[10px] font-normal text-slate-400">Total</span></span>
                        ) : (
                           <span>{nv.cantidad} <span className="text-slate-400 font-normal text-xs">{nv.unidad}</span></span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                          nv.estado === 'Aprobada' 
                            ? 'bg-amber-100 text-amber-700' 
                            : 'bg-cyan-100 text-cyan-700'
                        }`}>
                          {nv.estado === 'Aprobada' ? 'Aprobada' : 'En Picking'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                         {nv.usuario_nombre ? (
                           <span className="flex items-center gap-1 text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg w-fit">
                             <User size={12} /> {nv.usuario_nombre}
                           </span>
                         ) : (
                           <span className="text-xs text-slate-400 italic">Sin asignar</span>
                         )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {(!nv.usuario_asignado || nv.usuario_asignado === user.id) ? (
                          <button
                            onClick={() => iniciarPicking(nv)}
                            className="bg-cyan-600 hover:bg-cyan-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 ml-auto"
                          >
                            <Play size={14} /> {nv.usuario_asignado === user.id ? 'Continuar' : 'Iniciar'}
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400 flex items-center justify-end gap-1">
                            <Users size={12} /> Ocupado
                          </span>
                        )}
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
            <p className="font-bold">{user?.nombre}</p>
          </div>
        </div>
        
        <div className="text-center">
          <p className="text-white/70 text-sm mb-1">Picking N.V.</p>
          <h1 className="text-4xl font-black mb-4">#{nvActiva?.nv}</h1>
          
          <div className="flex justify-center gap-8 opacity-0 pointer-events-none h-0 overflow-hidden">
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
          
          {/* Mensaje de estado */}
          <div className="text-center mb-6">
            <span className="bg-white/20 text-white px-4 py-2 rounded-full text-sm font-bold animate-pulse">
              ⏱️ Proceso de picking en curso...
            </span>
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
          </div>

          {/* Botones de Acción */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
            {/* 1. Pickeo Completo */}
            <button
              onClick={() => finalizarPicking('COMPLETO')}
              className="bg-emerald-500 hover:bg-emerald-600 text-white p-4 rounded-xl flex flex-col items-center gap-2 transition-all shadow-lg hover:scale-105"
            >
              <div className="bg-white/20 p-2 rounded-full">
                <CheckCircle size={32} />
              </div>
              <span className="font-bold text-lg">Pickeo Completo</span>
              <span className="text-xs text-emerald-100">
                {nvActiva?.total_items > 1 ? `Todos los ${nvActiva?.total_items} items` : `Cantidad: ${nvActiva?.cantidad}`}
              </span>
            </button>

            {/* 2. Pickeo Parcial */}
            <div className="relative group">
              <button
                onClick={() => setAction(action === 'PARCIAL' ? null : 'PARCIAL')}
                className={`w-full h-full ${action === 'PARCIAL' ? 'bg-blue-600' : 'bg-blue-500 hover:bg-blue-600'} text-white p-4 rounded-xl flex flex-col items-center gap-2 transition-all shadow-lg hover:scale-105`}
              >
                <div className="bg-white/20 p-2 rounded-full">
                  <Box size={32} />
                </div>
                <span className="font-bold text-lg">Pickeo Parcial</span>
                <span className="text-xs text-blue-100">Falta Stock / Dañado</span>
              </button>
              
              {/* Popup para ingresar cantidad parcial */}
              {action === 'PARCIAL' && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl p-4 z-10 animate-in fade-in slide-in-from-top-2">
                  <label className="block text-xs font-bold text-slate-500 mb-1 text-left">Cantidad Real</label>
                  <input 
                    type="number" 
                    value={cantidadReal}
                    onChange={(e) => setCantidadReal(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2 text-slate-800 font-bold text-center mb-3"
                    placeholder="0"
                    autoFocus
                  />
                  <button 
                    onClick={() => finalizarPicking('PARCIAL')}
                    className="w-full bg-blue-600 text-white py-2 rounded-lg font-bold text-sm hover:bg-blue-700"
                  >
                    Confirmar
                  </button>
                </div>
              )}
            </div>

            {/* 3. Sin Stock */}
            <button
              onClick={() => {
                if(confirm('¿Seguro que quieres marcar como SIN STOCK?')) finalizarPicking('SIN_STOCK');
              }}
              className="bg-red-500 hover:bg-red-600 text-white p-4 rounded-xl flex flex-col items-center gap-2 transition-all shadow-lg hover:scale-105"
            >
              <div className="bg-white/20 p-2 rounded-full">
                <AlertCircle size={32} />
              </div>
              <span className="font-bold text-lg">Sin Stock</span>
              <span className="text-xs text-red-100">No hay producto</span>
            </button>
          </div>
          
          {enPausa && (
            <div className="mt-4 bg-amber-500/30 border border-amber-400 rounded-lg px-4 py-2 inline-flex items-center gap-2">
              <AlertCircle size={16} />
              <span className="text-sm">Proceso Pausado</span>
            </div>
          )}
        </div>
      </div>

      {/* Detalle */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Package size={18} className="text-cyan-500" /> Productos a Recolectar ({nvActiva?.total_items || 1})
          </h3>
          
          <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
            {(nvActiva?.items || [nvActiva]).map((item, idx) => (
              <div key={idx} className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="bg-cyan-100 p-3 rounded-lg">
                  <p className="text-xs text-cyan-700 font-bold font-mono">{item.codigo_producto}</p>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-slate-700 font-medium">{item.descripcion_producto}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black text-emerald-600">{item.cantidad}</p>
                  <p className="text-[10px] text-emerald-700 font-bold">{item.unidad || 'UNI'}</p>
                </div>
              </div>
            ))}
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
