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
  AlertCircle
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

  // Formulario de Packing (Campos requeridos al finalizar)
  const [formData, setFormData] = useState({
    bultos: '',
    pallets: '',
    peso: '',
    peso_sobredimensionado: ''
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

  // Cargar N.V. en estado PACKING
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('tms_nv_diarias')
        .select('*')
        .eq('estado', 'PACKING')
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
            total_cantidad: 0
          };
        }
        nvGrouped[nvId].items.push(item);
        nvGrouped[nvId].total_items++;
        nvGrouped[nvId].total_cantidad += parseInt(item.cantidad) || 0;
      });

      const uniqueNVs = Object.values(nvGrouped);
      setNvData(uniqueNVs); // Lista de NVs únicas
      
      // Agrupar por cliente (usando las NVs únicas)
      const groupedByClient = {};
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
        groupedByClient[cliente].totalItems++; // Cantidad de NVs
        groupedByClient[cliente].totalBultos += nv.total_cantidad; // Suma de productos
      });
      
      setClientesAgrupados(Object.values(groupedByClient));
      
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    
    // Realtime
    const channel = supabase
      .channel('packing_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tms_nv_diarias' }, () => {
        fetchData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      if (timerRef.current) clearInterval(timerRef.current);
      if (ocioRef.current) clearInterval(ocioRef.current);
    };
  }, [fetchData]);

  // Timer de trabajo
  useEffect(() => {
    if (tiempoInicio && !enPausa) {
      timerRef.current = setInterval(() => {
        setTiempoTranscurrido(Math.floor((Date.now() - tiempoInicio) / 1000) - tiempoOcio);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
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
    setFormData({ bultos: '', pallets: '', peso: '', peso_sobredimensionado: '' }); // Reset form
    
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
          direccion: nvActiva.direccion_despacho || 'Dirección por confirmar', // Fallback si no hay dirección
          comuna: nvActiva.comuna || '',
          bultos: parseInt(formData.bultos) || 0,
          peso: parseFloat(formData.peso) || 0,
          estado: 'PENDIENTE', // Queda lista para ser asignada a ruta
          fecha_creacion: new Date()
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
      setFormData({ bultos: '', pallets: '', peso: '', peso_sobredimensionado: '' });
      
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

  // ==================== VISTA: CLIENTES ====================
  if (vista === 'clientes') {
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
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium flex items-center gap-2"
          >
            <LayoutGrid size={18} /> Por Cliente
          </button>
          <button 
            className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg font-medium flex items-center gap-2 opacity-50 cursor-not-allowed"
            disabled
          >
            <List size={18} /> Lista N.V.
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold uppercase mb-2">
              <Users size={14} /> Clientes
            </div>
            <p className="text-2xl font-bold text-slate-800">{clientesAgrupados.length}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-indigo-200 shadow-sm">
            <div className="flex items-center gap-2 text-indigo-500 text-xs font-semibold uppercase mb-2">
              <FileText size={14} /> N.V. en Packing
            </div>
            <p className="text-2xl font-bold text-indigo-600">{nvData.length}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-amber-200 shadow-sm">
            <div className="flex items-center gap-2 text-amber-500 text-xs font-semibold uppercase mb-2">
              <Package size={14} /> Total Bultos
            </div>
            <p className="text-2xl font-bold text-amber-600">
              {nvData.reduce((sum, nv) => sum + (parseInt(nv.cantidad) || 0), 0)}
            </p>
          </div>
          <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200 shadow-sm">
            <div className="flex items-center gap-2 text-emerald-500 text-xs font-semibold uppercase mb-2">
              <Timer size={14} /> Operador
            </div>
            <p className="text-sm font-bold text-emerald-600 truncate">{user?.nombre || 'Desconocido'}</p>
          </div>
        </div>

        {/* Grid de Clientes */}
        {loading ? (
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
          <button 
            onClick={cancelarPacking}
            className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} /> Cancelar
          </button>
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
          
          {/* Mensaje de estado */}
          <div className="text-center mb-6">
            <span className="bg-white/20 text-white px-4 py-2 rounded-full text-sm font-bold animate-pulse">
              ⏱️ Proceso de empaque en curso...
            </span>
          </div>

          {/* Alerta de Picking Parcial */}
          {nvActiva?.picking_status === 'PARCIAL' && (
            <div className="mx-auto max-w-lg mb-6 bg-red-500/20 border-2 border-red-400 rounded-xl p-4 flex items-center gap-4 animate-bounce-subtle">
              <div className="bg-red-100 p-2 rounded-full">
                <AlertCircle size={24} className="text-red-600" />
              </div>
              <div className="text-left">
                <h4 className="font-bold text-lg text-white">¡ATENCIÓN: Picking Incompleto!</h4>
                <p className="text-white/90 text-sm">
                  Se solicitaron <span className="font-bold">{nvActiva.cantidad}</span> pero solo se encontraron <span className="font-bold text-xl underline">{nvActiva.cantidad_real}</span> unidades.
                </p>
              </div>
            </div>
          )}
          
          {/* Controles */}
          <div className="flex justify-center gap-4 mt-6">
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
            {(nvActiva?.items || [nvActiva]).map((item, idx) => (
              <div key={idx} className="bg-indigo-50 rounded-xl p-4 border border-indigo-100 flex items-center gap-4">
                <div className="flex-1">
                  <p className="text-xs text-indigo-500 font-semibold uppercase mb-1">Código</p>
                  <p className="text-lg font-mono font-bold text-indigo-700">{item.codigo_producto}</p>
                  <p className="text-sm text-slate-600 mt-1">{item.descripcion_producto}</p>
                </div>
                <div className="text-right">
                  <div className="bg-white rounded-lg p-2 text-center border border-indigo-100 shadow-sm">
                    <p className="text-2xl font-black text-indigo-600">{item.cantidad}</p>
                    <p className="text-[10px] text-indigo-400 font-bold">{item.unidad || 'UNI'}</p>
                  </div>
                </div>
              </div>
            ))}
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
    </div>
  );
};

export default Packing;
