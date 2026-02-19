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
  const [itemsPickingStatus, setItemsPickingStatus] = useState({}); // Estado local de cada ítem { id: { status: 'COMPLETO' | 'PARCIAL' | 'SIN_STOCK', cantidad: 0 } }
  const [tiempoInicio, setTiempoInicio] = useState(null);
  const [tiempoTranscurrido, setTiempoTranscurrido] = useState(0);
  const [enPausa, setEnPausa] = useState(false);
  const [tiempoOcio, setTiempoOcio] = useState(0);
  const [pausaInicio, setPausaInicio] = useState(null);
  
  // Usuario simulado (ELIMINADO - Usar user del contexto)
  // const [usuario] = useState({ id: 'user-picking-001', nombre: 'Operador Picking' });
  
  const timerRef = useRef(null);
  const ocioRef = useRef(null);
  const lastHiddenTime = useRef(null); // Para tracking silencioso

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
            total_cantidad: 0,
            usuario_asignado: item.usuario_asignado, // Tomar del primer registro
            usuario_nombre: item.usuario_nombre
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

  // Timer de trabajo - Tracking Silencioso
  useEffect(() => {
    let intervalId = null;

    const handleVisibilityChange = () => {
      // 1. Pantalla se apaga / App minimizada
      if (document.hidden && !enPausa && tiempoInicio) {
        lastHiddenTime.current = Date.now();
        console.log("App en segundo plano: Iniciando contador silencioso de inactividad.");
      } 
      // 2. Pantalla se enciende / App vuelve a primer plano
      else if (!document.hidden && lastHiddenTime.current && !enPausa) {
        const now = Date.now();
        const diffSeconds = Math.floor((now - lastHiddenTime.current) / 1000);
        
        if (diffSeconds > 0) {
          // Sumar silenciosamente al tiempo de ocio
          setTiempoOcio(prev => prev + diffSeconds);
          console.log(`App activa: Agregados ${diffSeconds}s a tiempo de ocio (silencioso).`);
        }
        lastHiddenTime.current = null;
      }
    };

    // Escuchar eventos de visibilidad
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Lógica del timer visual (aunque esté oculto, mantiene el estado actualizado)
    if (tiempoInicio && !enPausa) {
      intervalId = setInterval(() => {
        // Recalcular basado en la diferencia real de tiempo, descontando ocio acumulado
        const now = Date.now();
        // Si hay un tiempo oculto en curso, lo restamos dinámicamente para que el timer no salte
        let currentHidden = 0;
        if (document.hidden && lastHiddenTime.current) {
             currentHidden = Math.floor((now - lastHiddenTime.current) / 1000);
        }
        
        const diffSeconds = Math.floor((now - tiempoInicio) / 1000) - (tiempoOcio + currentHidden);
        setTiempoTranscurrido(diffSeconds > 0 ? diffSeconds : 0);
      }, 1000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
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
    // Inicializar estado de items
    const initialStatus = {};
    (nv.items || [nv]).forEach(item => {
      initialStatus[item.id] = { status: null, cantidad: '' };
    });
    setItemsPickingStatus(initialStatus);

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

  // Manejar cambio en item individual
  const handleItemStatusChange = (itemId, status, cantidad = '') => {
    setItemsPickingStatus(prev => ({
      ...prev,
      [itemId]: { ...prev[itemId], status, cantidad }
    }));
  };

  // Finalizar picking
  const finalizarPicking = async () => {
    if (!nvActiva) return;
    
    // Validar que todos los items tengan acción
    const items = nvActiva.items || [nvActiva];
    const missingAction = items.some(item => !itemsPickingStatus[item.id]?.status);
    
    if (missingAction) {
      alert('Debes indicar el estado (Completo, Parcial o Sin Stock) para cada producto.');
      return;
    }

    // Validar cantidades parciales
    const invalidPartial = items.some(item => {
      const state = itemsPickingStatus[item.id];
      return state.status === 'PARCIAL' && (!state.cantidad || parseInt(state.cantidad) <= 0);
    });

    if (invalidPartial) {
      alert('Debes ingresar una cantidad válida para los productos con picking parcial.');
      return;
    }

    try {
      // 1. Determinar el nuevo estado global de la N.V.
      // Si TODOS los items están en 'SIN_STOCK', el estado es 'QUIEBRE_STOCK'
      // Si al menos UNO tiene stock (COMPLETO o PARCIAL), el estado es 'PACKING'
      const hasStock = items.some(item => {
         const status = itemsPickingStatus[item.id]?.status;
         return status === 'COMPLETO' || status === 'PARCIAL';
      });
      
      const nuevoEstadoGlobal = hasStock ? 'PACKING' : 'QUIEBRE_STOCK';

      // 2. Actualizar cada ítem individualmente
      const updates = items.map(async (item) => {
        const state = itemsPickingStatus[item.id];
        let qtyReal = 0;

        if (state.status === 'COMPLETO') {
          qtyReal = item.cantidad;
        } else if (state.status === 'PARCIAL') {
          qtyReal = parseInt(state.cantidad);
        } else {
          qtyReal = 0; // SIN_STOCK
        }

        // Actualizamos el estado de la fila al nuevo estado global
        return supabase
          .from('tms_nv_diarias')
          .update({ 
            estado: nuevoEstadoGlobal, 
            cantidad_real: qtyReal,
            picking_status: state.status,
            usuario_asignado: null, 
            usuario_nombre: null
          })
          .eq('id', item.id);
      });

      // Esperar a que TODAS las actualizaciones terminen
      const results = await Promise.all(updates);
      
      // Verificar errores en las actualizaciones
      const errors = results.filter(r => r.error);
      if (errors.length > 0) {
        console.error("Detalle de errores de actualización:", errors);
        const firstErrorMsg = errors[0].error?.message || JSON.stringify(errors[0].error);
        throw new Error(`Falló la actualización de ${errors.length} ítems. Detalle: ${firstErrorMsg}`);
      }
      
      // Actualizar medición
      const { error: errorMedicion } = await supabase
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

      if (errorMedicion) console.error('Error actualizando medición:', errorMedicion);
      
      // Reset y recargar
      setNvActiva(null);
      setItemsPickingStatus({});
      setTiempoInicio(null);
      setTiempoTranscurrido(0);
      setTiempoOcio(0);
      setEnPausa(false);
      setVista('lista');
      setAction(null);
      setCantidadReal('');
      
      await fetchData();
      alert('Picking finalizado correctamente. La N.V. ha pasado a ' + nuevoEstadoGlobal);

    } catch (error) {
      console.error('Error crítico al finalizar picking:', error);
      alert('Error al finalizar picking: ' + error.message);
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
          
          {/* Mensaje de estado (Discreto) */}
          <div className="text-center mb-6">
            <span className="text-white/40 text-xs font-mono">
              Proceso ID: {nvActiva?.nv}
            </span>
          </div>
          
          <div className="flex justify-center gap-4 mt-6 opacity-0 pointer-events-none h-0">
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

          {/* Lista de Items con Acciones Individuales */}
          <div className="max-w-4xl mx-auto space-y-4">
            {(nvActiva?.items || [nvActiva]).map((item) => {
              const status = itemsPickingStatus[item.id]?.status;
              const cantidad = itemsPickingStatus[item.id]?.cantidad;

              return (
                <div key={item.id} className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                  <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    {/* Info Producto */}
                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="bg-white/20 text-white px-2 py-0.5 rounded text-xs font-mono font-bold">
                          {item.codigo_producto}
                        </span>
                        <span className="text-white/60 text-xs">{item.unidad}</span>
                      </div>
                      <p className="font-bold text-lg">{item.descripcion_producto}</p>
                      <p className="text-white/80 text-sm mt-1">
                        Solicitado: <span className="font-bold text-amber-300 text-xl">{item.cantidad}</span>
                      </p>
                    </div>

                    {/* Acciones */}
                    <div className="flex items-center gap-2">
                      {/* Completo */}
                      <button
                        onClick={() => handleItemStatusChange(item.id, 'COMPLETO')}
                        className={`p-3 rounded-lg flex flex-col items-center gap-1 transition-all w-24 ${
                          status === 'COMPLETO' 
                            ? 'bg-emerald-500 text-white ring-2 ring-white' 
                            : 'bg-white/10 text-white/70 hover:bg-emerald-500/50'
                        }`}
                      >
                        <CheckCircle size={20} />
                        <span className="text-[10px] font-bold">COMPLETO</span>
                      </button>

                      {/* Parcial */}
                      <div className="relative">
                        <button
                          onClick={() => handleItemStatusChange(item.id, 'PARCIAL')}
                          className={`p-3 rounded-lg flex flex-col items-center gap-1 transition-all w-24 ${
                            status === 'PARCIAL' 
                              ? 'bg-blue-500 text-white ring-2 ring-white' 
                              : 'bg-white/10 text-white/70 hover:bg-blue-500/50'
                          }`}
                        >
                          <Box size={20} />
                          <span className="text-[10px] font-bold">PARCIAL</span>
                        </button>
                        
                        {status === 'PARCIAL' && (
                          <div className="absolute top-full left-0 right-0 mt-2 bg-white p-2 rounded-lg shadow-xl z-10">
                            <input
                              type="number"
                              value={cantidad}
                              onChange={(e) => handleItemStatusChange(item.id, 'PARCIAL', e.target.value)}
                              className="w-full text-slate-800 font-bold text-center border rounded p-1"
                              placeholder="Cant."
                              autoFocus
                            />
                          </div>
                        )}
                      </div>

                      {/* Sin Stock */}
                      <button
                        onClick={() => handleItemStatusChange(item.id, 'SIN_STOCK')}
                        className={`p-3 rounded-lg flex flex-col items-center gap-1 transition-all w-24 ${
                          status === 'SIN_STOCK' 
                            ? 'bg-red-500 text-white ring-2 ring-white' 
                            : 'bg-white/10 text-white/70 hover:bg-red-500/50'
                        }`}
                      >
                        <AlertCircle size={20} />
                        <span className="text-[10px] font-bold">SIN STOCK</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Botón Finalizar Global */}
          <div className="mt-8">
            <button
              onClick={finalizarPicking}
              className="bg-white text-indigo-600 px-8 py-3 rounded-xl font-black text-lg shadow-xl hover:bg-indigo-50 hover:scale-105 transition-all flex items-center gap-2 mx-auto"
            >
              <CheckCircle size={24} />
              FINALIZAR PICKING
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
