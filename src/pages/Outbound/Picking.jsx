import React, { useState, useEffect, useRef } from 'react';
import {
  Hand, Package, User, Clock, CheckCircle, Play, Pause, RefreshCw, Search, Timer, Users, FileText, ArrowLeft, Box, LayoutGrid, AlertCircle, MapPin, Truck, Hourglass
} from 'lucide-react';
import { supabase } from '../../supabase';
import { InventoryService } from '../../services/inventoryService';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

const Picking = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [vista, setVista] = useState('lista'); 
  const [searchTerm, setSearchTerm] = useState('');

  const [nvActiva, setNvActiva] = useState(null);
  const [itemsPickingStatus, setItemsPickingStatus] = useState({});
  const [tiempoInicio, setTiempoInicio] = useState(null);
  const [tiempoTranscurrido, setTiempoTranscurrido] = useState(0);
  const [enPausa, setEnPausa] = useState(false);
  const [tiempoOcio, setTiempoOcio] = useState(0);
  const [pausaInicio, setPausaInicio] = useState(null);
  const [productLocations, setProductLocations] = useState({}); 

  const timerRef = useRef(null);
  const ocioRef = useRef(null);
  const lastHiddenTime = useRef(null);
  const containerRef = useRef(null);

  useGSAP(() => {
    gsap.from(containerRef.current, {
      y: 20,
      opacity: 0,
      duration: 0.4,
      ease: 'power3.out',
      clearProps: 'all'
    });
  }, { scope: containerRef });

  const { data: { nvData = [], stats = { pendientes: 0, enProceso: 0, completadasHoy: 0 } } = {}, isLoading: loading, refetch } = useQuery({
    queryKey: ['picking_data'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tms_nv_diarias')
        .select('*')
        .in('estado', ['Pendiente Picking', 'Aprobada'])
        .order('fecha_emision', { ascending: true });

      if (error) throw error;

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

      const today = new Date().toISOString().split('T')[0];
      const { count: completados } = await supabase
        .from('tms_mediciones_tiempos')
        .select('*', { count: 'exact', head: true })
        .eq('proceso', 'PICKING')
        .eq('estado', 'COMPLETADO')
        .gte('fin_at', `${today}T00:00:00`);

      return {
        nvData: uniqueNVs,
        stats: {
          pendientes: uniqueNVs.length,
          enProceso: uniqueNVs.filter(n => n.estado === 'Pendiente Picking').length,
          completadasHoy: completados || 0
        }
      };
    }
  });

  useEffect(() => {
    const channelNV = supabase
      .channel('picking_realtime_nv')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tms_nv_diarias' }, () => queryClient.invalidateQueries(['picking_data']))
      .subscribe();

    return () => {
      supabase.removeChannel(channelNV);
      if (timerRef.current) clearInterval(timerRef.current);
      if (ocioRef.current) clearInterval(ocioRef.current);
    };
  }, [queryClient]);

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

  const iniciarPicking = async (nv) => {
    if (nv.usuario_asignado && nv.usuario_asignado !== user.id) {
      toast.warning(`⚠️ Esta N.V. ya está asignada a ${nv.usuario_nombre}`);
      return;
    }

    setNvActiva(nv);
    const initialStatus = {};
    const codigosProducto = [];

    (nv.items || [nv]).forEach(item => {
      initialStatus[item.id] = {
        status: item.picking_status || null,
        cantidad: item.picking_status === 'COMPLETO' ? item.cantidad : (item.cantidad_real || ''),
        locked: ['COMPLETO', 'PARCIAL', 'SIN_STOCK'].includes(item.picking_status) 
      };
      if (item.codigo_producto && !codigosProducto.includes(item.codigo_producto)) {
        codigosProducto.push(item.codigo_producto);
      }
    });
    setItemsPickingStatus(initialStatus);

    if (codigosProducto.length > 0) {
      try {
        const { data: ubicacionesResult, error } = await supabase
          .from('wms_ubicaciones')
          .select('codigo, ubicacion')
          .in('codigo', codigosProducto);

        if (!error && ubicacionesResult) {
          const locMap = {};
          ubicacionesResult.forEach(u => {
            if (!locMap[u.codigo]) locMap[u.codigo] = [];
            if (!locMap[u.codigo].includes(u.ubicacion)) {
              locMap[u.codigo].push(u.ubicacion);
            }
          });
          setProductLocations(locMap);
        }
      } catch (err) {
        console.error("Error cargando ubicaciones:", err);
        setProductLocations({});
      }
    } else {
      setProductLocations({});
    }

    setTiempoInicio(Date.now());
    setTiempoTranscurrido(0);
    setTiempoOcio(0);
    setEnPausa(false);
    setVista('picking');

    await supabase
      .from('tms_nv_diarias')
      .update({
        estado: 'Pendiente Picking',
        usuario_asignado: user.id,
        usuario_nombre: user.nombre
      })
      .eq('nv', nv.nv);

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

  const finalizarMutation = useMutation({
    mutationFn: async () => {
      const items = nvActiva.items || [nvActiva];
      
      const hasStock = items.some(item => {
        const status = itemsPickingStatus[item.id]?.status;
        return status === 'COMPLETO' || status === 'PARCIAL';
      });

      const hasWaiting = items.some(item => {
        const status = itemsPickingStatus[item.id]?.status;
        return status === 'ESPERA' || !status;
      });

      let nuevoEstadoGlobal = hasStock ? 'PACKING' : 'QUIEBRE_STOCK';
      if (hasWaiting) nuevoEstadoGlobal = 'Pendiente Picking';

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
          itemStatus = 'ESPERA'; 
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

      return nuevoEstadoGlobal;
    },
    onSuccess: (nuevoEstadoGlobal) => {
      setNvActiva(null);
      setItemsPickingStatus({});
      setVista('lista');
      queryClient.invalidateQueries(['picking_data']);
      toast.success(`Picking finalizado. N.V. enviada a ${nuevoEstadoGlobal}`);
    },
    onError: (error) => {
      console.error('Error crítico:', error);
      toast.error('Error al finalizar: ' + error.message);
    }
  });

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
    toast.loading('Procesando movimientos de stock...');
    finalizarMutation.mutate();
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

  const nvFiltradas = React.useMemo(() => {
    return nvData.filter(nv =>
      nv.nv?.toString().includes(searchTerm) ||
      nv.cliente?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [nvData, searchTerm]);

  if (vista === 'lista') {
    return (
      <div ref={containerRef} className="space-y-6 bg-wms-dark min-h-screen text-slate-300 p-6">
        <div className="flex justify-between items-end relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-wms-panel border border-wms-border rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.2)]">
              <Hand className="text-wms-neon" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight">Picking</h2>
              <p className="text-slate-400 text-sm font-medium">Recolección de productos para empaque</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="bg-wms-panel border border-wms-border rounded-xl flex items-center px-3 py-2 shadow-sm focus-within:border-wms-neon transition-colors">
              <Search size={18} className="text-slate-400 mr-2" />
              <input
                type="text"
                placeholder="Buscar N.V., cliente..."
                className="outline-none text-sm w-48 font-medium text-white placeholder:text-slate-500 bg-transparent"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    if (nvFiltradas.length === 1) {
                      iniciarPicking(nvFiltradas[0]);
                      setSearchTerm('');
                    } else if (searchTerm) {
                      refetch();
                    }
                  }
                }}
              />
            </div>
            <button
              onClick={() => refetch()}
              disabled={loading}
              className="bg-wms-panel border border-wms-border hover:border-wms-neon hover:text-wms-neon text-slate-300 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 shadow-sm transition-all"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
          <div className="bg-wms-panel/80 backdrop-blur-xl rounded-2xl p-5 border border-wms-border shadow-2xl flex items-center justify-between group hover:border-indigo-400/50 transition-all">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Pendientes</p>
              <h3 className="text-3xl font-black text-white">{stats.pendientes}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform border border-indigo-500/30">
              <FileText size={24} />
            </div>
          </div>

          <div className="bg-wms-panel/80 backdrop-blur-xl rounded-2xl p-5 border border-wms-border shadow-2xl flex items-center justify-between group hover:border-cyan-400/50 transition-all">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">En Proceso</p>
              <h3 className="text-3xl font-black text-cyan-400">{stats.enProceso}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform border border-cyan-500/30">
              <Hand size={24} />
            </div>
          </div>

          <div className="bg-wms-panel/80 backdrop-blur-xl rounded-2xl p-5 border border-wms-border shadow-2xl flex items-center justify-between group hover:border-emerald-400/50 transition-all">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Completados Hoy</p>
              <h3 className="text-3xl font-black text-emerald-400">{stats.completadasHoy}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform border border-emerald-500/30">
              <CheckCircle size={24} />
            </div>
          </div>
        </div>

        <div className="bg-wms-panel/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-wms-border overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-wms-neon/5 rounded-full blur-3xl pointer-events-none"></div>
          <div className="p-4 border-b border-wms-border bg-wms-dark/50 flex justify-between items-center relative z-10">
            <h3 className="font-bold text-white flex items-center gap-2">
              <LayoutGrid size={18} className="text-wms-neon" />
              Cola de Trabajo
            </h3>
            <span className="text-xs font-bold bg-wms-dark text-slate-300 px-2 py-1 rounded-md border border-wms-border">{nvFiltradas.length} órdenes</span>
          </div>

          <div className="overflow-x-auto relative z-10">
            <table className="w-full text-sm">
              <thead className="bg-wms-dark text-slate-400 uppercase text-xs">
                <tr>
                  <th className="px-6 py-4 text-left font-bold tracking-wider">N.V.</th>
                  <th className="px-6 py-4 text-left font-bold tracking-wider">Cliente</th>
                  <th className="px-6 py-4 text-left font-bold tracking-wider">Detalle</th>
                  <th className="px-6 py-4 text-center font-bold tracking-wider">Estado</th>
                  <th className="px-6 py-4 text-left font-bold tracking-wider">Operador</th>
                  <th className="px-6 py-4 text-right font-bold tracking-wider">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-wms-border">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <RefreshCw className="animate-spin text-wms-neon" size={24} />
                        <span className="text-xs font-medium text-slate-400">Cargando órdenes...</span>
                      </div>
                    </td>
                  </tr>
                ) : nvFiltradas.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                      <Package size={32} className="mx-auto mb-2 opacity-40" />
                      <p>No hay N.V. pendientes de picking</p>
                    </td>
                  </tr>
                ) : (
                  nvFiltradas.map((nv, index) => (
                    <tr key={index} className="hover:bg-wms-dark/50 transition-colors group">
                      <td className="px-6 py-4 font-black text-white">
                        <div className="flex items-center gap-2">
                          <FileText size={16} className="text-slate-500" />
                          #{nv.nv}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-white">{nv.cliente}</p>
                        <p className="text-xs text-slate-400 font-medium flex items-center gap-1">
                          <User size={10} /> {nv.vendedor || 'Vendedor Web'}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="bg-indigo-500/20 text-indigo-400 px-2.5 py-1 rounded-md text-xs font-bold border border-indigo-500/30">
                            {nv.total_items} items
                          </span>
                          <span className="text-xs font-mono text-slate-400 bg-wms-dark px-2 py-1 rounded border border-wms-border">
                            Total: {nv.total_cantidad}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wide border ${nv.estado === 'Aprobada'
                          ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                          : 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
                          }`}>
                          {nv.estado === 'Aprobada' ? 'PENDIENTE' : 'EN PROCESO'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {nv.usuario_nombre ? (
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center text-xs font-bold">
                              {nv.usuario_nombre.charAt(0)}
                            </div>
                            <span className="text-xs font-medium text-slate-300">
                              {nv.usuario_nombre}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-500 italic font-medium px-2 py-1 rounded-md bg-wms-dark border border-wms-border">Sin asignar</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {(!nv.usuario_asignado || nv.usuario_asignado === user.id) ? (
                          <button
                            onClick={() => iniciarPicking(nv)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 ml-auto shadow-sm transition-all active:scale-95 ${nv.usuario_asignado === user.id
                              ? 'bg-wms-neon hover:bg-emerald-400 text-wms-dark shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                              : 'bg-wms-dark border border-wms-border hover:border-wms-neon hover:text-wms-neon text-slate-300'
                              }`}
                          >
                            <Play size={14} fill={nv.usuario_asignado === user.id ? "currentColor" : "none"} />
                            {nv.usuario_asignado === user.id ? 'CONTINUAR' : 'INICIAR'}
                          </button>
                        ) : (
                          <span className="text-xs text-slate-500 flex items-center justify-end gap-1 opacity-60 cursor-not-allowed">
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

  return (
    <div ref={containerRef} className="space-y-6 bg-wms-dark min-h-screen text-slate-300 p-6">
      <div className="bg-wms-panel/80 backdrop-blur-xl rounded-3xl p-6 text-white shadow-2xl relative overflow-hidden border border-wms-border">
        <div className="absolute top-0 right-0 w-64 h-64 bg-wms-neon/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

        <div className="flex justify-between items-start mb-8 relative z-10">
          <button
            onClick={cancelarPicking}
            className="flex items-center gap-2 text-slate-400 hover:text-white bg-wms-dark hover:bg-slate-800 border border-wms-border px-3 py-1.5 rounded-lg transition-colors text-xs font-bold uppercase tracking-wide"
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
        </div>
      </div>

      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center px-2">
            <h3 className="font-bold text-white flex items-center gap-2">
              <Box size={20} className="text-wms-neon" />
              Productos ({nvActiva?.total_items})
            </h3>
          </div>

          {(nvActiva?.items || [nvActiva]).map((item) => {
            const status = itemsPickingStatus[item.id]?.status;
            const cantidad = itemsPickingStatus[item.id]?.cantidad;
            const isLocked = itemsPickingStatus[item.id]?.locked; 
            const isComplete = status === 'COMPLETO' || status === 'PARCIAL';

            return (
              <div key={item.id} className={`bg-wms-panel/80 backdrop-blur-xl rounded-2xl p-5 border transition-all shadow-xl group ${isComplete
                ? 'border-wms-neon bg-emerald-900/10'
                : status === 'ESPERA'
                  ? 'border-amber-500/50 bg-amber-900/10'
                  : status === 'SIN_STOCK'
                    ? 'border-wms-danger/50 bg-rose-900/10'
                    : 'border-wms-border hover:border-indigo-500/50'
                }`}>
                <div className="flex flex-col sm:flex-row gap-4 justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-wms-dark text-wms-neon border border-wms-neon/30 px-2 py-0.5 rounded text-xs font-mono font-bold">
                        {item.codigo_producto}
                      </span>
                      <span className="text-slate-500 text-xs font-medium uppercase">{item.unidad || 'UNI'}</span>
                    </div>
                    <p className="font-bold text-white text-lg leading-tight mb-2">{item.descripcion_producto}</p>

                    <div className="flex items-center gap-4 text-sm text-slate-400 flex-wrap">
                      {productLocations[item.codigo_producto] && productLocations[item.codigo_producto].length > 0 ? (
                        productLocations[item.codigo_producto].map((loc, idx) => (
                          <div key={idx} className="flex items-center gap-1 bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded border border-cyan-500/30">
                            <MapPin size={12} className="text-cyan-400" />
                            <span className="font-bold text-xs">{loc}</span>
                          </div>
                        ))
                      ) : (
                        <div className="flex items-center gap-1 text-slate-500">
                          <MapPin size={14} />
                          <span className="font-medium text-xs">Sin ubicación en WMS</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1 text-indigo-400 bg-indigo-500/20 px-2 py-0.5 rounded border border-indigo-500/30">
                        <Box size={12} />
                        <span className="font-bold text-xs">Cant: {item.cantidad}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-3 min-w-[140px]">
                    <div className="text-right">
                      <span className="text-xs font-bold text-slate-500 uppercase">Solicitado</span>
                      <p className="text-3xl font-black text-white">{item.cantidad}</p>
                    </div>

                    <div className="flex gap-1 bg-wms-dark border border-wms-border p-1 rounded-lg">
                      <button
                        onClick={() => !isLocked && handleItemStatusChange(item.id, 'COMPLETO', item.cantidad)}
                        title="Completo"
                        disabled={isLocked}
                        className={`p-2 rounded-md transition-all ${status === 'COMPLETO' ? 'bg-wms-neon text-wms-dark shadow-[0_0_10px_rgba(16,185,129,0.4)]' : 'text-slate-500 hover:bg-wms-panel hover:text-wms-neon'
                          } ${isLocked ? 'cursor-not-allowed opacity-50' : ''}`}
                      >
                        <CheckCircle size={20} />
                      </button>

                      <button
                        onClick={() => !isLocked && handleItemStatusChange(item.id, 'PARCIAL')}
                        title="Parcial"
                        disabled={isLocked}
                        className={`p-2 rounded-md transition-all ${status === 'PARCIAL' ? 'bg-blue-500 text-white shadow-[0_0_10px_rgba(59,130,246,0.4)]' : 'text-slate-500 hover:bg-wms-panel hover:text-blue-400'
                          } ${isLocked ? 'cursor-not-allowed opacity-50' : ''}`}
                      >
                        <Box size={20} />
                      </button>

                      <button
                        onClick={() => !isLocked && handleItemStatusChange(item.id, 'ESPERA')}
                        title="Dejar en Espera para otro Picker"
                        disabled={isLocked}
                        className={`p-2 rounded-md transition-all ${status === 'ESPERA' ? 'bg-amber-500 text-white shadow-[0_0_10px_rgba(245,158,11,0.4)]' : 'text-slate-500 hover:bg-wms-panel hover:text-amber-400'
                          } ${isLocked ? 'cursor-not-allowed opacity-50' : ''}`}
                      >
                        <Hourglass size={20} />
                      </button>

                      <button
                        onClick={() => !isLocked && handleItemStatusChange(item.id, 'SIN_STOCK')}
                        title="Sin Stock"
                        disabled={isLocked}
                        className={`p-2 rounded-md transition-all ${status === 'SIN_STOCK' ? 'bg-wms-danger text-white shadow-[0_0_10px_rgba(239,68,68,0.4)]' : 'text-slate-500 hover:bg-wms-panel hover:text-wms-danger'
                          } ${isLocked ? 'cursor-not-allowed opacity-50' : ''}`}
                      >
                        <AlertCircle size={20} />
                      </button>
                    </div>

                    {isLocked && (
                      <div className="text-[10px] font-bold text-indigo-400 bg-indigo-500/20 border border-indigo-500/30 px-2 py-0.5 rounded uppercase mt-1">
                        Ya procesado
                      </div>
                    )}

                    {status === 'PARCIAL' && !isLocked && (
                      <div className="animate-in slide-in-from-top-2 fade-in">
                        <input
                          type="number"
                          placeholder="Cant. Real"
                          className="w-full bg-wms-dark border-2 border-blue-500/50 rounded-lg px-2 py-1 text-center font-bold text-blue-400 outline-none focus:border-blue-400"
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
              disabled={finalizarMutation.isPending}
              className="w-full bg-wms-neon text-wms-dark py-4 rounded-2xl font-black text-lg shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:scale-[1.02] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              <CheckCircle size={24} />
              CONFIRMAR PICKING
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-wms-panel/80 backdrop-blur-xl rounded-2xl p-6 border border-wms-border shadow-2xl sticky top-6">
            <h3 className="font-bold text-white mb-6 flex items-center gap-2 border-b border-wms-border pb-4">
              <User size={20} className="text-indigo-400" />
              Datos del Cliente
            </h3>

            <div className="space-y-5">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Cliente Final</p>
                <p className="font-bold text-white text-lg leading-tight">{nvActiva?.cliente}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Vendedor</p>
                  <p className="font-medium text-slate-300 text-sm">{nvActiva?.vendedor || '-'}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Fecha Emisión</p>
                  <p className="font-medium text-slate-300 text-sm">{nvActiva?.fecha_emision || '-'}</p>
                </div>
              </div>

              <div className="bg-indigo-500/10 p-4 rounded-xl border border-indigo-500/20">
                <div className="flex items-start gap-3">
                  <Truck className="text-indigo-400 mt-1" size={20} />
                  <div>
                    <p className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-1">Ruta de Despacho</p>
                    <p className="font-bold text-indigo-300">Ruta Norte - Mañana</p>
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