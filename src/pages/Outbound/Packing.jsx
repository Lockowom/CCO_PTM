// Packing.jsx - Módulo de Packing con 2 vistas y medición de tiempos
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Box, 
  Package, 
  User, 
  Clock, 
  CheckCircle, 
  Play, 
  Pause, 
  Square,
  RefreshCw, 
  Search,
  Eye,
  ChevronRight,
  Timer,
  Users,
  FileText,
  ArrowLeft,
  Send,
  LayoutGrid,
  List,
  AlertCircle,
  RotateCcw
} from 'lucide-react';
import { supabase } from '../../supabase';

import { useAuth } from '../../context/AuthContext'; // Importar contexto

const Packing = () => {
  const { user } = useAuth(); // Usar usuario real
  // Vista actual: 'clientes' o 'packing'
  const [vista, setVista] = useState('clientes');
  
  // Datos
  const [nvData, setNvData] = useState([]);
  const [clientesAgrupados, setClientesAgrupados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Packing activo
  const [nvActiva, setNvActiva] = useState(null);
  const [tiempoInicio, setTiempoInicio] = useState(null);
  const [tiempoTranscurrido, setTiempoTranscurrido] = useState(0);
  const [enPausa, setEnPausa] = useState(false);
  const [tiempoOcio, setTiempoOcio] = useState(0);
  const [pausaInicio, setPausaInicio] = useState(null);

  // Estado para Devolver a Picking
  const [showDevolverModal, setShowDevolverModal] = useState(false);
  const [motivoDevolucion, setMotivoDevolucion] = useState('');
  const [loadingDevolucion, setLoadingDevolucion] = useState(false);

  // Formulario de Packing (Campos requeridos al finalizar)
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
  
  // Usuario simulado (ELIMINADO - Usar user del contexto)
  // const [usuario] = useState({ id: 'user-packing-001', nombre: 'Operador Packing' });
  
  // Timer ref
  const timerRef = useRef(null);
  const ocioRef = useRef(null);
  const lastHiddenTime = useRef(null); // Para tracking silencioso

  // Stats
  const [stats, setStats] = useState({
    pendientes: 0,
    itemsPendientes: 0,
    completadosHoy: 0
  });

  // Cargar N.V. en estado PACKING
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      
      // 1. Cargar N.V. Pendientes
      const { data, error } = await supabase
        .from('tms_nv_diarias')
        .select('*')
        .in('estado', ['PACKING', 'QUIEBRE_STOCK']) // Incluir QUIEBRE_STOCK para mostrar parciales
        .order('cliente', { ascending: true });

      if (error) throw error;

      // Agrupar por NV (para tener datos consolidados)
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

      // Filtrar NVs únicas
      const uniqueNVs = Object.values(nvGrouped).filter(nv => 
        nv.items.some(i => i.estado === 'PACKING')
      );
      
      setNvData(uniqueNVs);

      // Agrupar por cliente
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
      
      setClientesAgrupados(Object.values(groupedByClient));

      // 2. Cargar Stats de Hoy (Completados)
      const today = new Date().toISOString().split('T')[0];
      const { count: completados, error: countError } = await supabase
        .from('tms_mediciones_tiempos')
        .select('*', { count: 'exact', head: true })
        .eq('proceso', 'PACKING')
        .eq('estado', 'COMPLETADO')
        .gte('fin_at', `${today}T00:00:00`);

      if (countError) console.error("Error contando completados:", countError);

      // Actualizar Stats
      setStats({
        pendientes: uniqueNVs.length,
        itemsPendientes: totalItemsPendientes,
        completadosHoy: completados || 0
      });
      
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    
    // Realtime: Escuchar cambios en N.V. y Mediciones
    const channelNV = supabase
      .channel('packing_realtime_nv')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tms_nv_diarias' }, () => fetchData())
      .subscribe();

    const channelMetrics = supabase
      .channel('packing_realtime_metrics')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tms_mediciones_tiempos' }, () => fetchData())
      .subscribe();

    return () => {
      supabase.removeChannel(channelNV);
      supabase.removeChannel(channelMetrics);
      if (timerRef.current) clearInterval(timerRef.current);
      if (ocioRef.current) clearInterval(ocioRef.current);
    };
  }, [fetchData]);

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

    // Lógica del timer visual
    if (tiempoInicio && !enPausa) {
      intervalId = setInterval(() => {
        // Recalcular basado en la diferencia real de tiempo, descontando ocio acumulado
        const now = Date.now();
        // Si hay un tiempo oculto en curso, lo restamos dinámicamente
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

  // Timer de ocio (cuando está en pausa)
  useEffect(() => {
    if (enPausa && pausaInicio) {
      ocioRef.current = setInterval(() => {
        setTiempoOcio(prev => prev + 1);
      }, 1000);
    } else {
      if (ocioRef.current) clearInterval(ocioRef.current);
    }
    
    return () => {
      if (ocioRef.current) clearInterval(ocioRef.current);
    };
  }, [enPausa, pausaInicio]);

  // Iniciar packing de una N.V.
  const iniciarPacking = async (nv) => {
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
    setVista('packing');

    // Intentar obtener dirección si no viene en la N.V.
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
      bultos: '', 
      pallets: '', 
      peso: '', 
      peso_sobredimensionado: '',
      direccion,
      comuna
    }); 
    
    // Asignar usuario
    await supabase
      .from('tms_nv_diarias')
      .update({
        usuario_asignado: user.id,
        usuario_nombre: user.nombre
      })
      .eq('nv', nv.nv);

    // Registrar inicio en mediciones
    await supabase.from('tms_mediciones_tiempos').insert({
      nv: nv.nv,
      proceso: 'PACKING',
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

  // Finalizar packing
  const finalizarPacking = async () => {
    if (!nvActiva) return;

    // Validación de campos obligatorios
    if (!formData.bultos || !formData.pallets || !formData.peso) {
      alert("Debes completar Bultos, Pallets y Peso antes de finalizar.");
      return;
    }
    
    const tiempoFinal = tiempoTranscurrido;
    const ocioFinal = tiempoOcio;
    
    try {
      // 1. Actualizar N.V. con datos de despacho y estado LISTO_DESPACHO
      await supabase
        .from('tms_nv_diarias')
        .update({ 
          estado: 'LISTO_DESPACHO',
          bultos_reales: parseInt(formData.bultos) || 0,
          pallets_reales: parseInt(formData.pallets) || 0,
          peso_real: parseFloat(formData.peso) || 0,
          peso_sobredimensionado: parseFloat(formData.peso_sobredimensionado) || 0,
          usuario_asignado: null, // Liberar
          usuario_nombre: null
        })
        .eq('nv', nvActiva.nv);
      
      // 2. Crear o Actualizar Entrega en TMS (tms_entregas)
      // Esto sincroniza con el módulo de Rutas y Despacho
      const { error: upsertError } = await supabase
        .from('tms_entregas')
        .upsert({
          nv: nvActiva.nv.toString(),
          cliente: nvActiva.cliente,
          direccion: formData.direccion || nvActiva.direccion_despacho || 'Dirección por confirmar', 
          comuna: formData.comuna || nvActiva.comuna || '',
          bultos: parseInt(formData.bultos) || 0,
          peso: parseFloat(formData.peso) || 0,
          estado: 'PENDIENTE', // Queda lista para ser asignada a ruta
          fecha_creacion: new Date(),
          fecha_actualizacion: new Date() // Forzar cambio para disparar realtime
        }, { onConflict: 'nv' });

      if (upsertError) throw upsertError;

      // Actualizar medición
      await supabase
        .from('tms_mediciones_tiempos')
        .update({
          fin_at: new Date().toISOString(),
          tiempo_activo: tiempoFinal,
          tiempo_ocio: ocioFinal,
          estado: 'COMPLETADO',
          updated_at: new Date().toISOString()
        })
        .eq('nv', nvActiva.nv)
        .eq('proceso', 'PACKING')
        .eq('estado', 'EN_PROCESO');
      
      // Reset
      setNvActiva(null);
      setTiempoInicio(null);
      setTiempoTranscurrido(0);
      setTiempoOcio(0);
      setEnPausa(false);
      setVista('clientes');
      setFormData({ bultos: '', pallets: '', peso: '', peso_sobredimensionado: '', direccion: '', comuna: '' });
      
      await fetchData();
      
    } catch (error) {
      console.error('Error:', error);
      alert('Error al finalizar packing: ' + error.message);
    }
  };

  // Cancelar packing
  const cancelarPacking = async () => {
    if (nvActiva) {
      await supabase
        .from('tms_mediciones_tiempos')
        .update({ estado: 'ABANDONADO', updated_at: new Date().toISOString() })
        .eq('nv', nvActiva.nv)
        .eq('proceso', 'PACKING')
        .eq('estado', 'EN_PROCESO');

      // Liberar usuario
      await supabase
        .from('tms_nv_diarias')
        .update({
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
    setVista('clientes');
    setFormData({ bultos: '', pallets: '', peso: '', peso_sobredimensionado: '', direccion: '', comuna: '' });
  };

  // Devolver a Picking (Error detectado)
  const handleDevolverPicking = async () => {
    if (!motivoDevolucion.trim()) {
      alert("Debes indicar el motivo de la devolución.");
      return;
    }

    try {
      setLoadingDevolucion(true);

      // 1. Encontrar quién hizo el Picking (último registro completado)
      const { data: pickingData, error: pickingError } = await supabase
        .from('tms_mediciones_tiempos')
        .select('usuario_id, usuario_nombre')
        .eq('nv', nvActiva.nv)
        .eq('proceso', 'PICKING')
        .eq('estado', 'COMPLETADO')
        .order('fin_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (pickingError) console.error("Error buscando picker:", pickingError);

      // 2. Registrar el error en la nueva tabla
      const { error: errorLog } = await supabase
        .from('tms_errores_picking')
        .insert({
          nv: nvActiva.nv.toString(),
          usuario_picking_id: pickingData?.usuario_id || null, // Si no se encuentra, queda null
          usuario_picking_nombre: pickingData?.usuario_nombre || 'Desconocido',
          usuario_packing_id: user.id,
          usuario_packing_nombre: user.nombre,
          motivo: motivoDevolucion
        });

      if (errorLog) throw errorLog;

      // 3. Devolver N.V. a estado "Pendiente Picking"
      // Importante: Liberar usuario_asignado para que Picking pueda tomarla de nuevo
      const { error: updateError } = await supabase
        .from('tms_nv_diarias')
        .update({ 
          estado: 'Pendiente Picking',
          picking_status: null, // Resetear status de picking
          usuario_asignado: null,
          usuario_nombre: null
        })
        .eq('nv', nvActiva.nv);

      if (updateError) throw updateError;

      // 4. Cancelar medición de Packing actual (para que no cuente tiempo)
      await supabase
        .from('tms_mediciones_tiempos')
        .update({ 
          estado: 'RECHAZADO', // Nuevo estado para diferenciar de ABANDONADO
          updated_at: new Date().toISOString() 
        })
        .eq('nv', nvActiva.nv)
        .eq('proceso', 'PACKING')
        .eq('estado', 'EN_PROCESO');

      // 5. Resetear UI
      setNvActiva(null);
      setTiempoInicio(null);
      setTiempoTranscurrido(0);
      setTiempoOcio(0);
      setEnPausa(false);
      setVista('clientes');
      setFormData({ bultos: '', pallets: '', peso: '', peso_sobredimensionado: '', direccion: '', comuna: '' });
      setShowDevolverModal(false);
      setMotivoDevolucion('');
      
      await fetchData();
      alert(`N.V. #${nvActiva.nv} devuelta a Picking correctamente.`);

    } catch (error) {
      console.error('Error al devolver:', error);
      alert('Error al devolver a Picking: ' + error.message);
    } finally {
      setLoadingDevolucion(false);
    }
  };

  // Formatear tiempo
  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Filtrar clientes
  const clientesFiltrados = clientesAgrupados.filter(c =>
    c.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.nvList.some(nv => nv.nv.toString().includes(searchTerm))
  );

  // ==================== VISTA: CLIENTES O LISTA ====================
  if (vista === 'clientes' || vista === 'lista') {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-end">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <Box className="text-white" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Packing</h2>
              <p className="text-slate-500 text-sm">Empaque de notas de venta por cliente</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="bg-white border rounded-lg flex items-center px-3 py-2 shadow-sm">
              <Search size={18} className="text-slate-400 mr-2" />
              <input 
                type="text" 
                placeholder="Buscar cliente o N.V..." 
                className="outline-none text-sm w-48"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <button 
              onClick={fetchData}
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              Actualizar
            </button>
          </div>
        </div>

        {/* Tabs de vista */}
        <div className="flex gap-2">
          <button 
            onClick={() => setVista('clientes')}
            className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors ${
              vista === 'clientes' 
                ? 'bg-indigo-600 text-white' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <LayoutGrid size={18} /> Por Cliente
          </button>
          <button 
            onClick={() => setVista('lista')}
            className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors ${
              vista === 'lista' 
                ? 'bg-indigo-600 text-white' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <List size={18} /> Lista N.V.
          </button>
        </div>

        {/* Resumen de Clientes (Solicitado por usuario) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: Pendientes */}
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">N.V. Pendientes</p>
              <h3 className="text-2xl font-black text-slate-800 mt-1">{stats.pendientes}</h3>
            </div>
            <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
              <FileText size={20} />
            </div>
          </div>

          {/* Card 2: Carga de Trabajo */}
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Unidades Total</p>
              <h3 className="text-2xl font-black text-slate-800 mt-1">{stats.itemsPendientes}</h3>
            </div>
            <div className="w-10 h-10 rounded-lg bg-cyan-50 flex items-center justify-center text-cyan-600">
              <Package size={20} />
            </div>
          </div>

          {/* Card 3: Completados Hoy */}
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Empacados Hoy</p>
              <h3 className="text-2xl font-black text-emerald-600 mt-1">{stats.completadosHoy}</h3>
            </div>
            <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
              <CheckCircle size={20} />
            </div>
          </div>
        </div>

        {/* Grid de Clientes (Detalle) */}
        {vista === 'clientes' ? (
          loading ? (
            <div className="flex items-center justify-center py-16">
              <RefreshCw className="animate-spin text-indigo-500" size={32} />
            </div>
          ) : clientesFiltrados.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center border border-slate-200">
              <Package size={48} className="mx-auto text-slate-300 mb-4" />
              <h3 className="text-lg font-semibold text-slate-600">No hay N.V. en Packing</h3>
              <p className="text-sm text-slate-400">Las notas de venta aparecerán aquí cuando lleguen del Picking</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {clientesFiltrados.map((grupo, index) => (
                <div 
                  key={index}
                  className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden"
                >
                  {/* Header del cliente */}
                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 border-b border-slate-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                          <User size={20} className="text-indigo-600" />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-800 text-sm truncate max-w-[180px]" title={grupo.cliente}>
                            {grupo.cliente}
                          </h3>
                          <p className="text-xs text-slate-500">{grupo.totalItems} N.V.</p>
                        </div>
                      </div>
                      <span className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full text-xs font-bold">
                        {grupo.totalBultos} items
                      </span>
                    </div>
                  </div>
                  
                  {/* Lista de N.V. */}
                  <div className="p-3 space-y-2 max-h-[200px] overflow-y-auto">
                    {grupo.nvList.map((nv, i) => (
                      <div 
                        key={i}
                        className="flex items-center justify-between p-2 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                      >
                        <div>
                          <p className="font-mono text-sm font-bold text-indigo-600">#{nv.nv}</p>
                          <p className="text-xs text-slate-500 truncate max-w-[120px]">
                            {nv.total_items > 1 ? `${nv.total_items} items` : nv.codigo_producto}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-700">
                            {nv.total_items > 1 ? `${nv.total_cantidad} un.` : nv.cantidad}
                          </span>
                          <button
                            onClick={() => iniciarPacking(nv)}
                            className="p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
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
          /* VISTA LISTA DE N.V. */
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
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
                <tbody className="divide-y divide-slate-100">
                  {nvData.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-4 py-8 text-center text-slate-400">
                        No hay notas de venta pendientes
                      </td>
                    </tr>
                  ) : (
                    nvData.map((nv, index) => (
                      <tr key={index} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-bold text-indigo-600">#{nv.nv}</td>
                        <td className="px-4 py-3 text-slate-700 font-medium">{nv.cliente}</td>
                        <td className="px-4 py-3 text-center text-slate-600">{nv.total_items}</td>
                        <td className="px-4 py-3 text-center font-bold text-slate-800">{nv.total_cantidad}</td>
                        <td className="px-4 py-3 text-center">
                          {nv.has_stock_break ? (
                            <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-bold">Quiebre Stock</span>
                          ) : nv.has_partial ? (
                            <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded-full text-xs font-bold">Parcial</span>
                          ) : (
                            <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full text-xs font-bold">Completo</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => iniciarPacking(nv)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 ml-auto"
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

  // ==================== VISTA: PACKING ACTIVO ====================
  return (
    <div className="space-y-6">
      {/* Header con timer */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex justify-between items-start mb-6">
            <div className="flex gap-2">
              <button 
                onClick={cancelarPacking}
                className="flex items-center gap-2 text-white/80 hover:text-white transition-colors bg-white/10 px-3 py-1.5 rounded-lg"
              >
                <ArrowLeft size={16} /> Volver
              </button>
              <button 
                onClick={() => setShowDevolverModal(true)}
                className="flex items-center gap-2 text-rose-200 hover:text-rose-100 transition-colors bg-rose-500/20 px-3 py-1.5 rounded-lg border border-rose-500/30"
              >
                <RotateCcw size={16} /> Devolver a Picking
              </button>
            </div>
            <div className="text-right">
              <p className="text-white/70 text-sm">Operador</p>
            <p className="font-bold">{user?.nombre}</p>
          </div>
        </div>
        
        <div className="text-center">
          <p className="text-white/70 text-sm mb-1">Empacando N.V.</p>
          <h1 className="text-4xl font-black mb-4">#{nvActiva?.nv}</h1>
          
          {/* Timer principal (Oculto visualmente, pero funcional internamente) */}
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

          {/* Alerta de Picking Parcial o Sin Stock */}
          {(nvActiva?.has_partial || nvActiva?.has_stock_break) && (
            <div className="mx-auto max-w-lg mb-6 bg-red-500/20 border-2 border-red-400 rounded-xl p-4 flex items-center gap-4 animate-bounce-subtle">
              <div className="bg-red-100 p-2 rounded-full">
                <AlertCircle size={24} className="text-red-600" />
              </div>
              <div className="text-left">
                <h4 className="font-bold text-lg text-white">¡ATENCIÓN: Pedido Incompleto!</h4>
                <p className="text-white/90 text-sm">
                  Esta N.V. contiene productos con <span className="font-bold">Quiebre de Stock</span> o <span className="font-bold">Picking Parcial</span>. Verifica los ítems antes de empacar.
                </p>
              </div>
            </div>
          )}
          
          {/* Controles (Ocultos para tracking silencioso) */}
          <div className="flex justify-center gap-4 mt-6 opacity-0 pointer-events-none h-0">
            <button
              onClick={togglePausa}
              className={`px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all ${
                enPausa 
                  ? 'bg-amber-500 text-white hover:bg-amber-600' 
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              {enPausa ? <Play size={20} /> : <Pause size={20} />}
              {enPausa ? 'Reanudar' : 'Pausar'}
            </button>
          </div>

          {/* Formulario de Cierre de Packing (Restaurado) */}
          <div className="mt-8 bg-white/10 p-6 rounded-xl text-left backdrop-blur-sm border border-white/20 max-w-2xl mx-auto">
            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
              <Package size={20} /> Datos de Despacho
            </h3>

            {/* Dirección (Nuevo) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 border-b border-white/10 pb-4">
               <div className="md:col-span-2">
                 <label className="block text-xs text-white/70 mb-1">Dirección de Entrega</label>
                 <input 
                   type="text"
                   name="direccion"
                   value={formData.direccion}
                   onChange={handleInputChange}
                   className="w-full bg-white/20 border border-white/30 rounded-lg px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:bg-white/30 font-mono text-sm"
                   placeholder="Calle, Número..."
                 />
               </div>
               <div>
                 <label className="block text-xs text-white/70 mb-1">Comuna</label>
                 <input 
                   type="text"
                   name="comuna"
                   value={formData.comuna}
                   onChange={handleInputChange}
                   className="w-full bg-white/20 border border-white/30 rounded-lg px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:bg-white/30 font-mono text-sm"
                   placeholder="Comuna"
                 />
               </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs text-white/70 mb-1">Bultos *</label>
                <input 
                  type="number"
                  name="bultos"
                  value={formData.bultos}
                  onChange={handleInputChange}
                  className="w-full bg-white/20 border border-white/30 rounded-lg px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:bg-white/30"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-xs text-white/70 mb-1">Pallets *</label>
                <input 
                  type="number"
                  name="pallets"
                  value={formData.pallets}
                  onChange={handleInputChange}
                  className="w-full bg-white/20 border border-white/30 rounded-lg px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:bg-white/30"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-xs text-white/70 mb-1">Peso (kg) *</label>
                <input 
                  type="number"
                  name="peso"
                  value={formData.peso}
                  onChange={handleInputChange}
                  className="w-full bg-white/20 border border-white/30 rounded-lg px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:bg-white/30"
                  placeholder="0.0"
                />
              </div>
              <div>
                <label className="block text-xs text-white/70 mb-1">Peso Sobredim.</label>
                <input 
                  type="number"
                  name="peso_sobredimensionado"
                  value={formData.peso_sobredimensionado}
                  onChange={handleInputChange}
                  className="w-full bg-white/20 border border-white/30 rounded-lg px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:bg-white/30"
                  placeholder="0.0"
                />
              </div>
            </div>
            
            <button
              onClick={finalizarPacking}
              className="w-full mt-6 px-6 py-3 bg-emerald-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-600 transition-all shadow-lg"
            >
              <CheckCircle size={20} />
              Finalizar y Registrar Bultos
            </button>
          </div>
          
          {enPausa && (
            <div className="mt-4 bg-amber-500/30 border border-amber-400 rounded-lg px-4 py-2 inline-flex items-center gap-2">
              <AlertCircle size={16} />
              <span className="text-sm font-medium">Proceso Pausado</span>
            </div>
          )}
        </div>
      </div>

      {/* Detalle de la N.V. */}
      <div className="grid grid-cols-2 gap-6">
        {/* Info del producto */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Package size={18} className="text-indigo-500" />
            Detalle de Productos ({nvActiva?.total_items || 1})
          </h3>
          
          <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
            {(nvActiva?.items || [nvActiva]).map((item, idx) => {
              const isStockBreak = item.estado === 'QUIEBRE_STOCK' || item.picking_status === 'SIN_STOCK';
              const isPartial = item.picking_status === 'PARCIAL';
              
              return (
                <div key={idx} className={`rounded-xl p-4 border flex items-center gap-4 ${
                  isStockBreak 
                    ? 'bg-red-50 border-red-200 opacity-75' 
                    : isPartial
                      ? 'bg-amber-50 border-amber-200'
                      : 'bg-indigo-50 border-indigo-100'
                }`}>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className={`text-xs font-semibold uppercase ${
                        isStockBreak ? 'text-red-500' : isPartial ? 'text-amber-600' : 'text-indigo-500'
                      }`}>Código</p>
                      {isStockBreak && <span className="text-[10px] bg-red-100 text-red-600 px-1 rounded font-bold">SIN STOCK</span>}
                      {isPartial && <span className="text-[10px] bg-amber-100 text-amber-600 px-1 rounded font-bold">PARCIAL</span>}
                    </div>
                    <p className={`text-lg font-mono font-bold ${
                      isStockBreak ? 'text-red-700' : isPartial ? 'text-amber-800' : 'text-indigo-700'
                    }`}>{item.codigo_producto}</p>
                    <p className="text-sm text-slate-600 mt-1">{item.descripcion_producto}</p>
                  </div>
                  <div className="text-right">
                    <div className="bg-white rounded-lg p-2 text-center border shadow-sm">
                      <p className={`text-2xl font-black ${
                        isStockBreak ? 'text-red-400 line-through' : 'text-indigo-600'
                      }`}>{item.cantidad}</p>
                      
                      {(isPartial || isStockBreak) && (
                        <p className="text-sm font-bold text-red-500 mt-1">
                          Real: {item.cantidad_real || 0}
                        </p>
                      )}
                      
                      <p className="text-[10px] text-indigo-400 font-bold mt-1">{item.unidad || 'UNI'}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Info del cliente */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <User size={18} className="text-indigo-500" />
            Información del Cliente
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
            
            <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
              <p className="text-xs text-amber-600 font-semibold uppercase mb-1">Siguiente Paso</p>
              <div className="flex items-center gap-2 text-amber-700">
                <Send size={18} />
                <span className="font-bold">LISTO DESPACHO</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Modal Devolver a Picking */}
      {showDevolverModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-rose-50 p-6 border-b border-rose-100 flex items-center gap-4">
              <div className="bg-rose-100 p-3 rounded-full text-rose-600">
                <RotateCcw size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-rose-800">Devolver a Picking</h3>
                <p className="text-rose-600 text-sm">Se registrará como error de picking</p>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="bg-amber-50 p-4 rounded-lg border border-amber-200 flex items-start gap-3">
                <AlertCircle className="text-amber-600 flex-shrink-0 mt-0.5" size={18} />
                <p className="text-sm text-amber-800">
                  Esta acción detendrá tu cronómetro actual (no contará en tus tiempos) y devolverá la N.V. a la lista de pendientes de Picking.
                </p>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Motivo de la devolución / Error detectado *
                </label>
                <textarea
                  value={motivoDevolucion}
                  onChange={(e) => setMotivoDevolucion(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none resize-none h-32"
                  placeholder="Describe el error (ej: Producto incorrecto, Cantidad errónea, Dañado...)"
                  autoFocus
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowDevolverModal(false)}
                  disabled={loadingDevolucion}
                  className="flex-1 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDevolverPicking}
                  disabled={loadingDevolucion || !motivoDevolucion.trim()}
                  className="flex-1 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold shadow-lg shadow-rose-200 transition-all disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2"
                >
                  {loadingDevolucion ? 'Procesando...' : 'Confirmar Devolución'}
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
