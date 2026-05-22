import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Package, User, Clock, CheckCircle, Play, Pause, RefreshCw, Search, Eye, ChevronRight, Timer, Users, FileText, ArrowLeft, Send, LayoutGrid, List, AlertCircle, RotateCcw
} from 'lucide-react';
import { supabase } from '../../supabase';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

const Packing = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [vista, setVista] = useState('clientes');
  const [searchTerm, setSearchTerm] = useState('');

  const [nvActiva, setNvActiva] = useState(null);
  const [tiempoInicio, setTiempoInicio] = useState(null);
  const [tiempoTranscurrido, setTiempoTranscurrido] = useState(0);
  const [enPausa, setEnPausa] = useState(false);
  const [tiempoOcio, setTiempoOcio] = useState(0);
  const [pausaInicio, setPausaInicio] = useState(null);

  const [showDevolverModal, setShowDevolverModal] = useState(false);
  const [motivoDevolucion, setMotivoDevolucion] = useState('');

  const [formData, setFormData] = useState({
    bultos: '',
    pallets: '',
    peso: '',
    peso_sobredimensionado: '',
    direccion: '',
    comuna: ''
  });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

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

  const { data: { nvData = [], clientesAgrupados = [], stats = { pendientes: 0, itemsPendientes: 0, completadosHoy: 0 } } = {}, isLoading: loading, refetch } = useQuery({
    queryKey: ['packing_data'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tms_nv_diarias')
        .select('*')
        .in('estado', ['PACKING', 'QUIEBRE_STOCK'])
        .order('cliente', { ascending: true });

      if (error) throw error;

      const nvGrouped = {};
      (data || []).forEach(item => {
        const nvId = item.nv;
        if (!nvGrouped[nvId]) {
          nvGrouped[nvId] = {
            ...item,
            items: [],
            total_items: 0,
            total_cantidad: 0,
            has_partial: false,
            has_stock_break: false
          };
        }
        nvGrouped[nvId].items.push(item);
        nvGrouped[nvId].total_items++;
        nvGrouped[nvId].total_cantidad += parseInt(item.cantidad) || 0;

        if (item.picking_status === 'PARCIAL') nvGrouped[nvId].has_partial = true;
        if (item.picking_status === 'SIN_STOCK' || item.estado === 'QUIEBRE_STOCK') nvGrouped[nvId].has_stock_break = true;
      });

      const uniqueNVs = Object.values(nvGrouped).filter(nv =>
        nv.items.some(i => i.estado === 'PACKING')
      );

      const groupedByClient = {};
      let totalItemsPendientes = 0;

      uniqueNVs.forEach(nv => {
        const cliente = nv.cliente || 'Sin Cliente';
        if (!groupedByClient[cliente]) {
          groupedByClient[cliente] = {
            cliente,
            nvList: [],
            totalBultos: 0,
            totalItems: 0
          };
        }
        groupedByClient[cliente].nvList.push(nv);
        groupedByClient[cliente].totalItems++;
        groupedByClient[cliente].totalBultos += nv.total_cantidad;
        totalItemsPendientes += nv.total_cantidad;
      });

      const today = new Date().toISOString().split('T')[0];
      const { count: completados } = await supabase
        .from('tms_mediciones_tiempos')
        .select('*', { count: 'exact', head: true })
        .eq('proceso', 'PACKING')
        .eq('estado', 'COMPLETADO')
        .gte('fin_at', `${today}T00:00:00`);

      return {
        nvData: uniqueNVs,
        clientesAgrupados: Object.values(groupedByClient),
        stats: {
          pendientes: uniqueNVs.length,
          itemsPendientes: totalItemsPendientes,
          completadosHoy: completados || 0
        }
      };
    }
  });

  useEffect(() => {
    const channelNV = supabase
      .channel('packing_realtime_nv')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tms_nv_diarias' }, () => queryClient.invalidateQueries(['packing_data']))
      .subscribe();

    const channelMetrics = supabase
      .channel('packing_realtime_metrics')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tms_mediciones_tiempos' }, () => queryClient.invalidateQueries(['packing_data']))
      .subscribe();

    return () => {
      supabase.removeChannel(channelNV);
      supabase.removeChannel(channelMetrics);
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

  const iniciarPacking = async (nv) => {
    if (nv.usuario_asignado && nv.usuario_asignado !== user.id) {
      toast.warning(`⚠️ Esta N.V. ya está siendo procesada por: ${nv.usuario_nombre}`);
      return;
    }

    setNvActiva(nv);
    setTiempoInicio(Date.now());
    setTiempoTranscurrido(0);
    setTiempoOcio(0);
    setEnPausa(false);
    setVista('packing');

    let direccion = nv.direccion_despacho || '';
    let comuna = nv.comuna || '';

    if (!direccion && nv.cliente) {
      try {
        const { data: addressData } = await supabase
          .from('tms_direcciones')
          .select('direccion, comuna')
          .ilike('razon_social', `%${nv.cliente}%`)
          .limit(1)
          .maybeSingle();

        if (addressData) {
          direccion = addressData.direccion;
          comuna = addressData.comuna;
        }
      } catch (err) {
        console.error('Error buscando dirección:', err);
      }
    }

    setFormData({
      bultos: '', pallets: '', peso: '', peso_sobredimensionado: '', direccion, comuna
    });

    await supabase.from('tms_nv_diarias').update({ usuario_asignado: user.id, usuario_nombre: user.nombre }).eq('nv', nv.nv);

    await supabase.from('tms_mediciones_tiempos').insert({
      nv: nv.nv,
      proceso: 'PACKING',
      usuario_id: user.id,
      usuario_nombre: user.nombre,
      inicio_at: new Date().toISOString(),
      estado: 'EN_PROCESO'
    });
  };

  const togglePausa = () => {
    if (!enPausa) setPausaInicio(Date.now());
    else setPausaInicio(null);
    setEnPausa(!enPausa);
  };

  const finalizarMutation = useMutation({
    mutationFn: async () => {
      const tiempoFinal = tiempoTranscurrido;
      const ocioFinal = tiempoOcio;

      const { error: updateError } = await supabase
        .from('tms_nv_diarias')
        .update({ estado: 'LISTO_DESPACHO', usuario_asignado: null, usuario_nombre: null })
        .eq('nv', String(nvActiva.nv));
      if (updateError) throw new Error("Error actualizando NV: " + updateError.message);

      const { error: upsertError } = await supabase
        .from('tms_entregas')
        .upsert({
          nv: nvActiva.nv.toString(),
          cliente: nvActiva.cliente,
          direccion: formData.direccion || nvActiva.direccion_despacho || 'Dirección por confirmar',
          comuna: formData.comuna || nvActiva.comuna || '',
          bultos: parseInt(formData.bultos) || 0,
          peso: parseFloat(formData.peso) || 0,
          estado: 'PENDIENTE',
          fecha_creacion: new Date(),
          fecha_actualizacion: new Date()
        }, { onConflict: 'nv' });
      if (upsertError) throw upsertError;

      const { error: medicionError } = await supabase
        .from('tms_mediciones_tiempos')
        .update({
          fin_at: new Date().toISOString(),
          tiempo_activo: tiempoFinal,
          tiempo_ocio: ocioFinal,
          estado: 'COMPLETADO',
          updated_at: new Date().toISOString()
        })
        .eq('nv', String(nvActiva.nv))
        .eq('proceso', 'PACKING')
        .eq('estado', 'EN_PROCESO');
      if (medicionError) throw new Error("Error actualizando medición: " + medicionError.message);
    },
    onSuccess: () => {
      setNvActiva(null);
      setTiempoInicio(null);
      setTiempoTranscurrido(0);
      setTiempoOcio(0);
      setEnPausa(false);
      setVista('clientes');
      setFormData({ bultos: '', pallets: '', peso: '', peso_sobredimensionado: '', direccion: '', comuna: '' });
      queryClient.invalidateQueries(['packing_data']);
      toast.success(`Packing finalizado. N.V. #${nvActiva.nv} lista para despacho.`);
    },
    onError: (error) => {
      console.error('Error:', error);
      toast.error('Error al finalizar: ' + error.message);
    }
  });

  const finalizarPacking = async () => {
    if (!nvActiva) return;
    if (!formData.bultos || !formData.pallets || !formData.peso) {
      toast.error("Debes completar Bultos, Pallets y Peso antes de finalizar.");
      return;
    }
    toast.loading('Finalizando packing...');
    finalizarMutation.mutate();
  };

  const cancelarPacking = async () => {
    if (nvActiva) {
      await supabase
        .from('tms_mediciones_tiempos')
        .update({ estado: 'ABANDONADO', updated_at: new Date().toISOString() })
        .eq('nv', nvActiva.nv)
        .eq('proceso', 'PACKING')
        .eq('estado', 'EN_PROCESO');

      await supabase.from('tms_nv_diarias').update({ usuario_asignado: null, usuario_nombre: null }).eq('nv', nvActiva.nv);
    }
    setNvActiva(null);
    setTiempoInicio(null);
    setTiempoTranscurrido(0);
    setTiempoOcio(0);
    setEnPausa(false);
    setVista('clientes');
    setFormData({ bultos: '', pallets: '', peso: '', peso_sobredimensionado: '', direccion: '', comuna: '' });
  };

  const devolverMutation = useMutation({
    mutationFn: async () => {
      const { data: pickingData } = await supabase
        .from('tms_mediciones_tiempos')
        .select('usuario_id, usuario_nombre')
        .eq('nv', nvActiva.nv)
        .eq('proceso', 'PICKING')
        .eq('estado', 'COMPLETADO')
        .order('fin_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      const { error: errorLog } = await supabase
        .from('tms_errores_picking')
        .insert({
          nv: nvActiva.nv.toString(),
          usuario_picking_id: pickingData?.usuario_id || null,
          usuario_picking_nombre: pickingData?.usuario_nombre || 'Desconocido',
          usuario_packing_id: user.id,
          usuario_packing_nombre: user.nombre,
          motivo: motivoDevolucion
        });
      if (errorLog) throw errorLog;

      const { error: updateError } = await supabase
        .from('tms_nv_diarias')
        .update({
          estado: 'Pendiente Picking',
          picking_status: null,
          usuario_asignado: null,
          usuario_nombre: null
        })
        .eq('nv', nvActiva.nv);
      if (updateError) throw updateError;

      await supabase
        .from('tms_mediciones_tiempos')
        .update({ estado: 'RECHAZADO', updated_at: new Date().toISOString() })
        .eq('nv', nvActiva.nv)
        .eq('proceso', 'PACKING')
        .eq('estado', 'EN_PROCESO');
    },
    onSuccess: () => {
      setNvActiva(null);
      setTiempoInicio(null);
      setTiempoTranscurrido(0);
      setTiempoOcio(0);
      setEnPausa(false);
      setVista('clientes');
      setFormData({ bultos: '', pallets: '', peso: '', peso_sobredimensionado: '', direccion: '', comuna: '' });
      setShowDevolverModal(false);
      setMotivoDevolucion('');
      queryClient.invalidateQueries(['packing_data']);
      toast.success(`N.V. #${nvActiva.nv} devuelta a Picking correctamente.`);
    },
    onError: (error) => {
      console.error('Error al devolver:', error);
      toast.error('Error al devolver a Picking: ' + error.message);
    }
  });

  const handleDevolverPicking = async () => {
    if (!motivoDevolucion.trim()) {
      toast.warning("Debes indicar el motivo de la devolución.");
      return;
    }
    toast.loading('Devolviendo a picking...');
    devolverMutation.mutate();
  };

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const clientesFiltrados = React.useMemo(() => {
    return clientesAgrupados.filter(c =>
      c.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.nvList.some(nv => nv.nv.toString().includes(searchTerm))
    );
  }, [clientesAgrupados, searchTerm]);

  if (vista === 'clientes' || vista === 'lista') {
    return (
      <div ref={containerRef} className="space-y-6 bg-slate-50 min-h-screen text-slate-700 p-6">
        <div className="flex justify-between items-end relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white border border-slate-200 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.2)]">
              <Box className="text-indigo-400" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Packing</h2>
              <p className="text-slate-500 text-sm">Empaque de notas de venta por cliente</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="bg-white border border-slate-200 rounded-lg flex items-center px-3 py-2 shadow-sm focus-within:border-wms-neon transition-colors">
              <Search size={18} className="text-slate-500 mr-2" />
              <input
                type="text"
                placeholder="Buscar cliente o N.V..."
                className="outline-none text-sm w-48 bg-transparent text-slate-900 placeholder:text-slate-500"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    if (clientesFiltrados.length === 1 && clientesFiltrados[0].nvList.length === 1) {
                      iniciarPacking(clientesFiltrados[0].nvList[0]);
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
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 shadow-[0_0_15px_rgba(99,102,241,0.3)] transition-all"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              Actualizar
            </button>
          </div>
        </div>

        <div className="flex gap-2 relative z-10">
          <button
            onClick={() => setVista('clientes')}
            className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors ${vista === 'clientes'
              ? 'bg-indigo-600 text-white shadow-[0_0_10px_rgba(99,102,241,0.3)]'
              : 'bg-white text-slate-500 border border-slate-200 hover:text-white'
              }`}
          >
            <LayoutGrid size={18} /> Por Cliente
          </button>
          <button
            onClick={() => setVista('lista')}
            className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors ${vista === 'lista'
              ? 'bg-indigo-600 text-white shadow-[0_0_10px_rgba(99,102,241,0.3)]'
              : 'bg-white text-slate-500 border border-slate-200 hover:text-white'
              }`}
          >
            <List size={18} /> Lista N.V.
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
          <div className="bg-white backdrop-blur-xl rounded-xl p-4 border border-slate-200 shadow-2xl flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">N.V. Pendientes</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{stats.pendientes}</h3>
            </div>
            <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400 border border-indigo-500/30">
              <FileText size={20} />
            </div>
          </div>

          <div className="bg-white backdrop-blur-xl rounded-xl p-4 border border-slate-200 shadow-2xl flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Unidades Total</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{stats.itemsPendientes}</h3>
            </div>
            <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-400 border border-cyan-500/30">
              <Package size={20} />
            </div>
          </div>

          <div className="bg-white backdrop-blur-xl rounded-xl p-4 border border-slate-200 shadow-2xl flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Empacados Hoy</p>
              <h3 className="text-2xl font-black text-emerald-400 mt-1">{stats.completadosHoy}</h3>
            </div>
            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 border border-emerald-500/30">
              <CheckCircle size={20} />
            </div>
          </div>
        </div>

        {vista === 'clientes' ? (
          loading ? (
            <div className="flex items-center justify-center py-16">
              <RefreshCw className="animate-spin text-indigo-500" size={32} />
            </div>
          ) : clientesFiltrados.length === 0 ? (
            <div className="bg-white backdrop-blur-xl rounded-xl p-12 text-center border border-slate-200 relative z-10">
              <Package size={48} className="mx-auto text-slate-600 mb-4" />
              <h3 className="text-lg font-semibold text-slate-700">No hay N.V. en Packing</h3>
              <p className="text-sm text-slate-500">Las notas de venta aparecerán aquí cuando lleguen del Picking</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 relative z-10">
              {clientesFiltrados.map((grupo, index) => (
                <div
                  key={index}
                  className="bg-white backdrop-blur-xl rounded-xl border border-slate-200 shadow-2xl hover:border-indigo-500/50 transition-all overflow-hidden"
                >
                  <div className="bg-indigo-900/20 p-4 border-b border-slate-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
                          <User size={20} className="text-indigo-400" />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900 text-sm truncate max-w-[180px]" title={grupo.cliente}>
                            {grupo.cliente}
                          </h3>
                          <p className="text-xs text-slate-500">{grupo.totalItems} N.V.</p>
                        </div>
                      </div>
                      <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-1 rounded-full text-xs font-bold">
                        {grupo.totalBultos} items
                      </span>
                    </div>
                  </div>

                  <div className="p-3 space-y-2 max-h-[200px] overflow-y-auto">
                    {grupo.nvList.map((nv, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-200 hover:border-indigo-500/30 transition-colors"
                      >
                        <div>
                          <p className="font-mono text-sm font-bold text-wms-neon">#{nv.nv}</p>
                          <p className="text-xs text-slate-500 truncate max-w-[120px]">
                            {nv.total_items > 1 ? `${nv.total_items} items` : nv.codigo_producto}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-900">
                            {nv.total_items > 1 ? `${nv.total_cantidad} un.` : nv.cantidad}
                          </span>
                          <button
                            onClick={() => iniciarPacking(nv)}
                            className="p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.4)] transition-colors"
                            title="Iniciar Packing"
                          >
                            <Play size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          <div className="bg-white backdrop-blur-xl rounded-xl shadow-2xl border border-slate-200 overflow-hidden relative z-10">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-500 uppercase text-xs">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium">N.V.</th>
                    <th className="px-4 py-3 text-left font-medium">Cliente</th>
                    <th className="px-4 py-3 text-center font-medium">Items</th>
                    <th className="px-4 py-3 text-center font-medium">Total Un.</th>
                    <th className="px-4 py-3 text-center font-medium">Estado</th>
                    <th className="px-4 py-3 text-right font-medium">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-wms-border">
                  {nvData.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-4 py-8 text-center text-slate-500">
                        No hay notas de venta pendientes
                      </td>
                    </tr>
                  ) : (
                    nvData.map((nv, index) => (
                      <tr key={index} className="hover:bg-slate-50/50">
                        <td className="px-4 py-3 font-bold text-wms-neon">#{nv.nv}</td>
                        <td className="px-4 py-3 text-slate-700 font-medium">{nv.cliente}</td>
                        <td className="px-4 py-3 text-center text-slate-500">{nv.total_items}</td>
                        <td className="px-4 py-3 text-center font-bold text-slate-900">{nv.total_cantidad}</td>
                        <td className="px-4 py-3 text-center">
                          {nv.has_stock_break ? (
                            <span className="bg-rose-500/20 text-rose-400 border border-rose-500/30 px-2 py-1 rounded-full text-xs font-bold">Quiebre Stock</span>
                          ) : nv.has_partial ? (
                            <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-1 rounded-full text-xs font-bold">Parcial</span>
                          ) : (
                            <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-1 rounded-full text-xs font-bold">Completo</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => iniciarPacking(nv)}
                            className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 ml-auto"
                          >
                            <Play size={14} /> Empacar
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
      </div>
    );
  }

  return (
    <div ref={containerRef} className="space-y-6 bg-slate-50 min-h-screen text-slate-700 p-6">
      <div className="bg-white backdrop-blur-xl border border-slate-200 rounded-2xl p-6 text-slate-900 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

        <div className="flex justify-between items-start mb-6 relative z-10">
          <div className="flex gap-2">
            <button
              onClick={cancelarPacking}
              className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-bold"
            >
              <ArrowLeft size={16} /> Volver
            </button>
            <button
              onClick={() => setShowDevolverModal(true)}
              className="flex items-center gap-2 text-rose-400 hover:text-rose-300 transition-colors bg-rose-500/20 px-3 py-1.5 rounded-lg border border-rose-500/30 text-xs font-bold"
            >
              <RotateCcw size={16} /> Devolver a Picking
            </button>
          </div>
          <div className="text-right">
            <p className="text-slate-500 text-xs uppercase font-bold tracking-wider">Operador</p>
            <p className="font-bold text-wms-neon">{user?.nombre}</p>
          </div>
        </div>

        <div className="text-center relative z-10">
          <p className="text-slate-500 text-sm mb-1 font-bold uppercase tracking-wider">Empacando N.V.</p>
          <h1 className="text-4xl font-black mb-4 text-slate-900">#{nvActiva?.nv}</h1>

          <div className="text-center mb-6">
            <span className="text-slate-500 text-xs font-mono">
              Proceso ID: {nvActiva?.nv}
            </span>
          </div>

          {(nvActiva?.has_partial || nvActiva?.has_stock_break) && (
            <div className="mx-auto max-w-lg mb-6 bg-rose-500/20 border-2 border-rose-500/50 rounded-xl p-4 flex items-center gap-4 animate-bounce-subtle shadow-[0_0_15px_rgba(244,63,94,0.3)]">
              <div className="bg-rose-500/20 p-2 rounded-full border border-rose-500/50">
                <AlertCircle size={24} className="text-rose-400" />
              </div>
              <div className="text-left">
                <h4 className="font-bold text-lg text-rose-300">¡ATENCIÓN: Pedido Incompleto!</h4>
                <p className="text-rose-200/80 text-sm">
                  Esta N.V. contiene productos con <span className="font-bold text-slate-900">Quiebre de Stock</span> o <span className="font-bold text-slate-900">Picking Parcial</span>. Verifica los ítems antes de empacar.
                </p>
              </div>
            </div>
          )}

          <div className="mt-8 bg-slate-50/80 p-6 rounded-xl text-left border border-slate-200 max-w-2xl mx-auto shadow-inner">
            <h3 className="text-slate-900 font-bold mb-4 flex items-center gap-2">
              <Package size={20} className="text-indigo-400" /> Datos de Despacho
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 border-b border-slate-200 pb-4">
              <div className="md:col-span-2">
                <label className="block text-xs text-slate-500 mb-1 font-bold uppercase">Dirección de Entrega</label>
                <input
                  type="text"
                  name="direccion"
                  value={formData.direccion}
                  onChange={handleInputChange}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-900 placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-mono text-sm transition-colors"
                  placeholder="Calle, Número..."
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1 font-bold uppercase">Comuna</label>
                <input
                  type="text"
                  name="comuna"
                  value={formData.comuna}
                  onChange={handleInputChange}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-900 placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-mono text-sm transition-colors"
                  placeholder="Comuna"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs text-slate-500 mb-1 font-bold uppercase">Bultos *</label>
                <input
                  type="number"
                  name="bultos"
                  value={formData.bultos}
                  onChange={handleInputChange}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-900 placeholder-slate-600 focus:outline-none focus:border-wms-neon transition-colors"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1 font-bold uppercase">Pallets *</label>
                <input
                  type="number"
                  name="pallets"
                  value={formData.pallets}
                  onChange={handleInputChange}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-900 placeholder-slate-600 focus:outline-none focus:border-wms-neon transition-colors"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1 font-bold uppercase">Peso (kg) *</label>
                <input
                  type="number"
                  name="peso"
                  value={formData.peso}
                  onChange={handleInputChange}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-900 placeholder-slate-600 focus:outline-none focus:border-wms-neon transition-colors"
                  placeholder="0.0"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1 font-bold uppercase">Peso Sobredim.</label>
                <input
                  type="number"
                  name="peso_sobredimensionado"
                  value={formData.peso_sobredimensionado}
                  onChange={handleInputChange}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-900 placeholder-slate-600 focus:outline-none focus:border-wms-neon transition-colors"
                  placeholder="0.0"
                />
              </div>
            </div>

            <button
              onClick={finalizarPacking}
              disabled={finalizarMutation.isPending}
              className="w-full mt-6 px-6 py-3 bg-wms-neon text-wms-dark rounded-xl font-black flex items-center justify-center gap-2 hover:bg-emerald-400 transition-all shadow-[0_0_15px_rgba(16,185,129,0.4)] disabled:opacity-50"
            >
              <CheckCircle size={20} />
              Finalizar y Registrar Bultos
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
        <div className="bg-white backdrop-blur-xl rounded-xl border border-slate-200 shadow-2xl p-6">
          <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Package size={18} className="text-indigo-400" />
            Detalle de Productos ({nvActiva?.total_items || 1})
          </h3>

          <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
            {(nvActiva?.items || [nvActiva]).map((item, idx) => {
              const isStockBreak = item.estado === 'QUIEBRE_STOCK' || item.picking_status === 'SIN_STOCK';
              const isPartial = item.picking_status === 'PARCIAL';

              return (
                <div key={idx} className={`rounded-xl p-4 border flex items-center gap-4 ${isStockBreak
                  ? 'bg-rose-500/10 border-rose-500/30'
                  : isPartial
                    ? 'bg-amber-500/10 border-amber-500/30'
                    : 'bg-slate-50 border-slate-200'
                  }`}>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className={`text-xs font-bold uppercase ${isStockBreak ? 'text-rose-400' : isPartial ? 'text-amber-400' : 'text-indigo-400'
                        }`}>Código</p>
                      {isStockBreak && <span className="text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/30 px-1 rounded font-bold">SIN STOCK</span>}
                      {isPartial && <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1 rounded font-bold">PARCIAL</span>}
                    </div>
                    <p className={`text-lg font-mono font-bold ${isStockBreak ? 'text-rose-300 line-through opacity-70' : isPartial ? 'text-amber-300' : 'text-wms-neon'
                      }`}>{item.codigo_producto}</p>
                    <p className="text-sm text-slate-500 mt-1">{item.descripcion_producto}</p>
                  </div>
                  <div className="text-right">
                    <div className="bg-white rounded-lg p-2 text-center border border-slate-200 shadow-inner">
                      <p className={`text-2xl font-black ${isStockBreak ? 'text-rose-400/50 line-through' : 'text-slate-900'
                        }`}>{item.cantidad}</p>

                      {(isPartial || isStockBreak) && (
                        <p className="text-sm font-bold text-rose-400 mt-1">
                          Real: {item.cantidad_real || 0}
                        </p>
                      )}

                      <p className="text-[10px] text-slate-500 font-bold mt-1">{item.unidad || 'UNI'}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white backdrop-blur-xl rounded-xl border border-slate-200 shadow-2xl p-6">
          <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
            <User size={18} className="text-indigo-400" />
            Información del Cliente
          </h3>

          <div className="space-y-4">
            <div>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Cliente</p>
              <p className="text-lg font-bold text-slate-900">{nvActiva?.cliente}</p>
            </div>

            <div>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Vendedor</p>
              <p className="text-slate-700 font-medium">{nvActiva?.vendedor || '-'}</p>
            </div>

            <div className="bg-amber-500/10 rounded-lg p-4 border border-amber-500/30">
              <p className="text-xs text-amber-400 font-bold uppercase tracking-wider mb-1">Siguiente Paso</p>
              <div className="flex items-center gap-2 text-amber-300">
                <Send size={18} />
                <span className="font-bold">LISTO DESPACHO</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showDevolverModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-rose-500/20 p-6 border-b border-rose-500/30 flex items-center gap-4">
              <div className="bg-rose-500/20 border border-rose-500/50 p-3 rounded-full text-rose-400">
                <RotateCcw size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-rose-400">Devolver a Picking</h3>
                <p className="text-rose-300/80 text-sm">Se registrará como error de picking</p>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-amber-500/10 p-4 rounded-lg border border-amber-500/30 flex items-start gap-3">
                <AlertCircle className="text-amber-400 flex-shrink-0 mt-0.5" size={18} />
                <p className="text-sm text-amber-200">
                  Esta acción detendrá tu cronómetro actual y devolverá la N.V. a la lista de pendientes de Picking.
                </p>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Motivo de la devolución / Error detectado *
                </label>
                <textarea
                  value={motivoDevolucion}
                  onChange={(e) => setMotivoDevolucion(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm text-slate-900 focus:border-rose-500 outline-none resize-none h-32"
                  placeholder="Describe el error (ej: Producto incorrecto, Cantidad errónea, Dañado...)"
                  autoFocus
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowDevolverModal(false)}
                  disabled={devolverMutation.isPending}
                  className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 hover:bg-white text-slate-700 rounded-xl font-bold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDevolverPicking}
                  disabled={devolverMutation.isPending || !motivoDevolucion.trim()}
                  className="flex-1 px-4 py-2 bg-rose-600 text-white rounded-xl font-bold shadow-[0_0_15px_rgba(225,29,72,0.4)] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {devolverMutation.isPending ? 'Procesando...' : 'Confirmar Devolución'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Packing;