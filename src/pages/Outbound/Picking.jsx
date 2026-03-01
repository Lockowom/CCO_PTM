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
  MapPin,
  Truck
} from 'lucide-react';
import { supabase } from '../../supabase';
import { InventoryService } from '../../services/inventoryService';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';

const Picking = () => {
  const { user } = useAuth();
  const [vista, setVista] = useState('lista'); // 'lista' o 'picking'
  const [nvData, setNvData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Picking activo
  const [nvActiva, setNvActiva] = useState(null);
  const [itemsPickingStatus, setItemsPickingStatus] = useState({}); 
  const [tiempoInicio, setTiempoInicio] = useState(null);
  const [tiempoTranscurrido, setTiempoTranscurrido] = useState(0);
  const [enPausa, setEnPausa] = useState(false);
  const [tiempoOcio, setTiempoOcio] = useState(0);
  const [pausaInicio, setPausaInicio] = useState(null);
  
  const timerRef = useRef(null);
  const ocioRef = useRef(null);
  const lastHiddenTime = useRef(null);

  const [stats, setStats] = useState({
    pendientes: 0,
    enProceso: 0,
    completadasHoy: 0
  });

  // Cargar N.V.
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
            usuario_asignado: item.usuario_asignado,
            usuario_nombre: item.usuario_nombre
          };
        }
        grouped[nvId].items.push(item);
        grouped[nvId].total_items++;
        grouped[nvId].total_cantidad += parseInt(item.cantidad) || 0;
      });

      const uniqueNVs = Object.values(grouped);
      setNvData(uniqueNVs);

      // Cargar Stats de Hoy
      const today = new Date().toISOString().split('T')[0];
      const { count: completados } = await supabase
        .from('tms_mediciones_tiempos')
        .select('*', { count: 'exact', head: true })
        .eq('proceso', 'PICKING')
        .eq('estado', 'COMPLETADO')
        .gte('fin_at', `${today}T00:00:00`);

      setStats({
        pendientes: uniqueNVs.length,
        enProceso: uniqueNVs.filter(n => n.estado === 'Pendiente Picking').length,
        completadasHoy: completados || 0
      });
      
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error cargando datos de picking');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    
    const channelNV = supabase
      .channel('picking_realtime_nv')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tms_nv_diarias' }, () => fetchData())
      .subscribe();

    return () => {
      supabase.removeChannel(channelNV);
      if (timerRef.current) clearInterval(timerRef.current);
      if (ocioRef.current) clearInterval(ocioRef.current);
    };
  }, [fetchData]);

  // Timer de trabajo - Tracking Silencioso
  useEffect(() => {
    let intervalId = null;

    const handleVisibilityChange = () => {
      if (document.hidden && !enPausa && tiempoInicio) {
        lastHiddenTime.current = Date.now();
      } else if (!document.hidden && lastHiddenTime.current && !enPausa) {
        const now = Date.now();
        const diffSeconds = Math.floor((now - lastHiddenTime.current) / 1000);
        if (diffSeconds > 0) {
          setTiempoOcio(prev => prev + diffSeconds);
          toast.info(`Regresaste: ${diffSeconds}s agregados a tiempo inactivo`);
        }
        lastHiddenTime.current = null;
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    if (tiempoInicio && !enPausa) {
      intervalId = setInterval(() => {
        const now = Date.now();
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

  // Timer de ocio (Pausa explícita)
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
    if (nv.usuario_asignado && nv.usuario_asignado !== user.id) {
      toast.warning(`⚠️ Esta N.V. ya está asignada a ${nv.usuario_nombre}`);
      return;
    }

    setNvActiva(nv);
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
    await supabase
      .from('tms_nv_diarias')
      .update({
        estado: 'Pendiente Picking',
        usuario_asignado: user.id,
        usuario_nombre: user.nombre
      })
      .eq('nv', nv.nv);
    
    // Registrar inicio medición
    await supabase.from('tms_mediciones_tiempos').insert({
      nv: nv.nv,
      proceso: 'PICKING',
      usuario_id: user.id,
      usuario_nombre: user.nombre,
      inicio_at: new Date().toISOString(),
      estado: 'EN_PROCESO'
    });

    toast.success(`Picking iniciado: NV #${nv.nv}`);
  };

  const togglePausa = () => {
    if (!enPausa) {
      setPausaInicio(Date.now());
      toast.warning('Proceso Pausado');
    } else {
      setPausaInicio(null);
      toast.success('Proceso Reanudado');
    }
    setEnPausa(!enPausa);
  };

  const handleItemStatusChange = (itemId, status, cantidad = '') => {
    setItemsPickingStatus(prev => ({
      ...prev,
      [itemId]: { ...prev[itemId], status, cantidad }
    }));
  };

  const finalizarPicking = async () => {
    if (!nvActiva) return;
    
    const items = nvActiva.items || [nvActiva];
    const missingAction = items.some(item => !itemsPickingStatus[item.id]?.status);
    
    if (missingAction) {
      toast.error('Debes indicar el estado para cada producto');
      return;
    }

    const invalidPartial = items.some(item => {
      const state = itemsPickingStatus[item.id];
      return state.status === 'PARCIAL' && (!state.cantidad || parseInt(state.cantidad) <= 0);
    });

    if (invalidPartial) {
      toast.error('Ingresa una cantidad válida para items parciales');
      return;
    }

    if (!confirm('¿Confirmar finalización de picking y movimientos de stock?')) return;

    try {
      toast.loading('Procesando movimientos de stock...');

      // 1. Determinar estado global
      const hasStock = items.some(item => {
         const status = itemsPickingStatus[item.id]?.status;
         return status === 'COMPLETO' || status === 'PARCIAL';
      });
      
      const hasWaiting = items.some(item => itemsPickingStatus[item.id]?.status === 'ESPERA');
      
      let nuevoEstadoGlobal = hasStock ? 'PACKING' : 'QUIEBRE_STOCK';
      if (hasWaiting) nuevoEstadoGlobal = 'Pendiente Picking';

      // 2. Ejecutar Movimientos (Transaccional)
      const updates = items.map(async (item) => {
        const state = itemsPickingStatus[item.id];
        let qtyReal = 0;
        let itemStatus = state.status;

        if (state.status === 'COMPLETO') {
          qtyReal = item.cantidad;
          await InventoryService.moveStock({
            sku: item.codigo_producto,
            batch: 'PICKING-BATCH',
            fromLoc: 'PICKING-ZONA',
            toLoc: 'PACKING-STATION', 
            qty: item.cantidad,
            userId: user.id,
            reason: `PICKING NV: ${nvActiva.nv}`
          });
        } else if (state.status === 'PARCIAL') {
          qtyReal = parseInt(state.cantidad);
          await InventoryService.moveStock({
            sku: item.codigo_producto,
            batch: 'PICKING-BATCH',
            fromLoc: 'PICKING-ZONA',
            toLoc: 'PACKING-STATION',
            qty: qtyReal,
            userId: user.id,
            reason: `PICKING PARCIAL NV: ${nvActiva.nv}`
          });
        } else if (state.status === 'ESPERA') {
          qtyReal = 0;
          itemStatus = null;
        }

        return supabase
          .from('tms_nv_diarias')
          .update({ 
            estado: nuevoEstadoGlobal, 
            cantidad_real: qtyReal,
            picking_status: itemStatus,
            usuario_asignado: null, 
            usuario_nombre: null
          })
          .eq('id', item.id);
      });

      await Promise.all(updates);
      
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
      toast.dismiss();
      setNvActiva(null);
      setItemsPickingStatus({});
      setVista('lista');
      await fetchData();
      toast.success(`Picking finalizado. N.V. enviada a ${nuevoEstadoGlobal}`);

    } catch (error) {
      toast.dismiss();
      console.error('Error crítico:', error);
      toast.error('Error al finalizar: ' + error.message);
    }
  };

  const cancelarPicking = async () => {
    if (!confirm('¿Seguro que deseas cancelar? Se registrará como abandono.')) return;

    if (nvActiva) {
      await supabase
        .from('tms_mediciones_tiempos')
        .update({ estado: 'ABANDONADO', updated_at: new Date().toISOString() })
        .eq('nv', nvActiva.nv)
        .eq('proceso', 'PICKING')
        .eq('estado', 'EN_PROCESO');

      await supabase
        .from('tms_nv_diarias')
        .update({ 
          estado: 'Aprobada',
          usuario_asignado: null,
          usuario_nombre: null
        })
        .eq('nv', nvActiva.nv);
    }
    
    setNvActiva(null);
    setVista('lista');
    toast.info('Picking cancelado');
  };

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const nvFiltradas = nvData.filter(nv =>
    nv.nv?.toString().includes(searchTerm) ||
    nv.cliente?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ==================== VISTA: LISTA ====================
  if (vista === 'lista') {
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        {/* Header */}
        <div className="flex justify-between items-end">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-200">
              <Hand className="text-white" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">Picking</h2>
              <p className="text-slate-500 text-sm font-medium">Recolección de productos para empaque</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="bg-white border-2 border-slate-100 rounded-xl flex items-center px-3 py-2 shadow-sm focus-within:border-cyan-400 transition-colors">
              <Search size={18} className="text-slate-400 mr-2" />
              <input 
                type="text" 
                placeholder="Buscar N.V., cliente..." 
                className="outline-none text-sm w-48 font-medium text-slate-600 placeholder:text-slate-400"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <button 
              onClick={fetchData}
              disabled={loading}
              className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 shadow-md shadow-cyan-200 transition-all active:scale-95"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center justify-between group hover:border-indigo-200 transition-all">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Pendientes</p>
              <h3 className="text-3xl font-black text-slate-800">{stats.pendientes}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
              <FileText size={24} />
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center justify-between group hover:border-cyan-200 transition-all">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">En Proceso</p>
              <h3 className="text-3xl font-black text-cyan-600">{stats.enProceso}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-cyan-50 flex items-center justify-center text-cyan-600 group-hover:scale-110 transition-transform">
              <Hand size={24} />
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center justify-between group hover:border-emerald-200 transition-all">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Completados Hoy</p>
              <h3 className="text-3xl font-black text-emerald-600">{stats.completadasHoy}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
              <CheckCircle size={24} />
            </div>
          </div>
        </div>

        {/* Tabla de N.V. */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <LayoutGrid size={18} className="text-cyan-600" />
              Cola de Trabajo
            </h3>
            <span className="text-xs font-bold bg-slate-200 text-slate-600 px-2 py-1 rounded-md">{nvFiltradas.length} órdenes</span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 uppercase text-xs">
                <tr>
                  <th className="px-6 py-4 text-left font-bold tracking-wider">N.V.</th>
                  <th className="px-6 py-4 text-left font-bold tracking-wider">Cliente</th>
                  <th className="px-6 py-4 text-left font-bold tracking-wider">Detalle</th>
                  <th className="px-6 py-4 text-center font-bold tracking-wider">Estado</th>
                  <th className="px-6 py-4 text-left font-bold tracking-wider">Operador</th>
                  <th className="px-6 py-4 text-right font-bold tracking-wider">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <RefreshCw className="animate-spin text-cyan-500" size={24} />
                        <span className="text-xs font-medium text-slate-400">Cargando órdenes...</span>
                      </div>
                    </td>
                  </tr>
                ) : nvFiltradas.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-slate-400">
                      <Package size={32} className="mx-auto mb-2 opacity-40" />
                      <p>No hay N.V. pendientes de picking</p>
                    </td>
                  </tr>
                ) : (
                  nvFiltradas.map((nv, index) => (
                    <tr key={index} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-4 font-black text-slate-700">
                        <div className="flex items-center gap-2">
                          <FileText size={16} className="text-slate-400" />
                          #{nv.nv}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-700">{nv.cliente}</p>
                        <p className="text-xs text-slate-400 font-medium flex items-center gap-1">
                          <User size={10} /> {nv.vendedor || 'Vendedor Web'}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="bg-indigo-100 text-indigo-700 px-2.5 py-1 rounded-md text-xs font-bold border border-indigo-200">
                            {nv.total_items} items
                          </span>
                          <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-1 rounded">
                            Total: {nv.total_cantidad}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wide border ${
                          nv.estado === 'Aprobada' 
                            ? 'bg-amber-50 text-amber-600 border-amber-200' 
                            : 'bg-cyan-50 text-cyan-600 border-cyan-200'
                        }`}>
                          {nv.estado === 'Aprobada' ? 'PENDIENTE' : 'EN PROCESO'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                         {nv.usuario_nombre ? (
                           <div className="flex items-center gap-2">
                             <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">
                               {nv.usuario_nombre.charAt(0)}
                             </div>
                             <span className="text-xs font-medium text-slate-600">
                               {nv.usuario_nombre}
                             </span>
                           </div>
                         ) : (
                           <span className="text-xs text-slate-400 italic font-medium px-2 py-1 rounded-md bg-slate-100">Sin asignar</span>
                         )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {(!nv.usuario_asignado || nv.usuario_asignado === user.id) ? (
                          <button
                            onClick={() => iniciarPicking(nv)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 ml-auto shadow-sm transition-all active:scale-95 ${
                              nv.usuario_asignado === user.id
                                ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-200'
                                : 'bg-white border-2 border-slate-200 hover:border-cyan-500 hover:text-cyan-600 text-slate-600'
                            }`}
                          >
                            <Play size={14} fill={nv.usuario_asignado === user.id ? "currentColor" : "none"} /> 
                            {nv.usuario_asignado === user.id ? 'CONTINUAR' : 'INICIAR'}
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400 flex items-center justify-end gap-1 opacity-60 cursor-not-allowed">
                            <Users size={14} /> Ocupado
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
    <div className="space-y-6 animate-in zoom-in-95 duration-300">
      {/* Header con timer */}
      <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-2xl relative overflow-hidden border border-slate-700">
        {/* Background Pattern */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
        
        <div className="flex justify-between items-start mb-8 relative z-10">
          <button 
            onClick={cancelarPicking} 
            className="flex items-center gap-2 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg transition-colors text-xs font-bold uppercase tracking-wide"
          >
            <ArrowLeft size={16} /> Cancelar / Salir
          </button>
          <div className="text-right">
            <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/30">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-xs font-bold">EN VIVO</span>
            </div>
          </div>
        </div>
        
        <div className="text-center relative z-10">
          <p className="text-slate-400 text-sm mb-2 font-medium tracking-wide uppercase">Picking Nota de Venta</p>
          <h1 className="text-5xl md:text-6xl font-black mb-8 tracking-tighter text-white">
            #{nvActiva?.nv}
          </h1>
          
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
        </div>
      </div>

      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna Izquierda: Lista de Items */}
        <div className="lg:col-span-2 space-y-4">
            <div className="flex justify-between items-center px-2">
                <h3 className="font-bold text-slate-700 flex items-center gap-2">
                    <Box size={20} className="text-cyan-600" />
                    Productos ({nvActiva?.total_items})
                </h3>
            </div>

            {(nvActiva?.items || [nvActiva]).map((item) => {
              const status = itemsPickingStatus[item.id]?.status;
              const cantidad = itemsPickingStatus[item.id]?.cantidad;
              const isComplete = status === 'COMPLETO';

              return (
                <div key={item.id} className={`bg-white rounded-2xl p-5 border-2 transition-all shadow-sm group ${
                  isComplete 
                    ? 'border-emerald-500 bg-emerald-50/30' 
                    : status === 'SIN_STOCK' 
                      ? 'border-rose-200 bg-rose-50' 
                      : 'border-slate-100 hover:border-cyan-200'
                }`}>
                  <div className="flex flex-col sm:flex-row gap-4 justify-between">
                    {/* Info Producto */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="bg-slate-800 text-white px-2 py-0.5 rounded text-xs font-mono font-bold">
                          {item.codigo_producto}
                        </span>
                        <span className="text-slate-400 text-xs font-medium uppercase">{item.unidad || 'UNI'}</span>
                      </div>
                      <p className="font-bold text-slate-800 text-lg leading-tight mb-2">{item.descripcion_producto}</p>
                      
                      <div className="flex items-center gap-4 text-sm text-slate-500">
                         <div className="flex items-center gap-1">
                            <MapPin size={14} className="text-cyan-500" />
                            <span className="font-medium text-slate-700">Pasillo A-04</span> {/* Simulado */}
                         </div>
                         <div className="flex items-center gap-1">
                            <Box size={14} className="text-indigo-500" />
                            <span className="font-medium text-slate-700">Lote: 23091</span> {/* Simulado */}
                         </div>
                      </div>
                    </div>

                    {/* Controles de Acción */}
                    <div className="flex flex-col items-end gap-3 min-w-[140px]">
                        <div className="text-right">
                             <span className="text-xs font-bold text-slate-400 uppercase">Solicitado</span>
                             <p className="text-3xl font-black text-slate-800">{item.cantidad}</p>
                        </div>

                        <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
                             <button
                               onClick={() => handleItemStatusChange(item.id, 'COMPLETO', item.cantidad)}
                               title="Completo"
                               className={`p-2 rounded-md transition-all ${
                                 status === 'COMPLETO' ? 'bg-emerald-500 text-white shadow-md' : 'text-slate-400 hover:bg-white hover:text-emerald-500'
                               }`}
                             >
                               <CheckCircle size={20} />
                             </button>
                             
                             <button
                               onClick={() => handleItemStatusChange(item.id, 'PARCIAL')}
                               title="Parcial"
                               className={`p-2 rounded-md transition-all ${
                                 status === 'PARCIAL' ? 'bg-blue-500 text-white shadow-md' : 'text-slate-400 hover:bg-white hover:text-blue-500'
                               }`}
                             >
                               <Box size={20} />
                             </button>

                             <button
                               onClick={() => handleItemStatusChange(item.id, 'SIN_STOCK')}
                               title="Sin Stock"
                               className={`p-2 rounded-md transition-all ${
                                 status === 'SIN_STOCK' ? 'bg-rose-500 text-white shadow-md' : 'text-slate-400 hover:bg-white hover:text-rose-500'
                               }`}
                             >
                               <AlertCircle size={20} />
                             </button>
                        </div>
                        
                        {/* Input Condicional para Parcial */}
                        {status === 'PARCIAL' && (
                             <div className="animate-in slide-in-from-top-2 fade-in">
                                 <input 
                                    type="number" 
                                    placeholder="Cant. Real"
                                    className="w-full border-2 border-blue-400 rounded-lg px-2 py-1 text-center font-bold text-blue-700 outline-none focus:ring-2 focus:ring-blue-200"
                                    value={cantidad}
                                    onChange={(e) => handleItemStatusChange(item.id, 'PARCIAL', e.target.value)}
                                    autoFocus
                                 />
                             </div>
                        )}
                    </div>
                  </div>
                </div>
              );
            })}

            <div className="pt-6">
                <button
                  onClick={finalizarPicking}
                  className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-lg shadow-xl hover:bg-slate-800 hover:scale-[1.02] transition-all flex items-center justify-center gap-3"
                >
                  <CheckCircle size={24} className="text-emerald-400" />
                  CONFIRMAR PICKING
                </button>
            </div>
        </div>

        {/* Columna Derecha: Resumen Cliente */}
        <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm sticky top-6">
                <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2 border-b pb-4">
                    <User size={20} className="text-indigo-500" />
                    Datos del Cliente
                </h3>
                
                <div className="space-y-5">
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Cliente Final</p>
                        <p className="font-bold text-slate-800 text-lg leading-tight">{nvActiva?.cliente}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Vendedor</p>
                            <p className="font-medium text-slate-600 text-sm">{nvActiva?.vendedor || '-'}</p>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Fecha Emisión</p>
                            <p className="font-medium text-slate-600 text-sm">{nvActiva?.fecha_emision || '-'}</p>
                        </div>
                    </div>

                    <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                        <div className="flex items-start gap-3">
                            <Truck className="text-indigo-600 mt-1" size={20} />
                            <div>
                                <p className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-1">Ruta de Despacho</p>
                                <p className="font-bold text-indigo-900">Ruta Norte - Mañana</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Picking;
