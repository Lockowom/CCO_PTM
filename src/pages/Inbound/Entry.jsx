import React, { useState, useEffect, useRef } from 'react';
import { PackagePlus, Search, QrCode, Trash2, Save, Wifi, WifiOff, Box, AlertCircle, Loader2, Calendar } from 'lucide-react';
import { supabase } from '../../supabase';

const Entry = () => {
  const [queue, setQueue] = useState([]);
  const [isOnline, setIsOnline] = useState(true);
  const [loadingDesc, setLoadingDesc] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  
  // Form State
  const [form, setForm] = useState({
    ubicacion: '', // OBLIGATORIO, MAX 8
    codigo: '',    // OBLIGATORIO, MAX 12, UPPERCASE
    serie: '',     // OPCIONAL
    partida: '',   // OPCIONAL
    pieza: '',     // OPCIONAL (PIEZA DEL PRODUCTO)
    fecha_vencimiento: '', // OPCIONAL (CALENDARIO)
    talla: '',     // OPCIONAL
    color: '',     // OPCIONAL
    cantidad: '',  // OBLIGATORIO
    descripcion: '' // AUTOMATICO
  });

  const codigoInputRef = useRef(null);
  const cantidadInputRef = useRef(null);

  // Cargar cola local al inicio
  useEffect(() => {
    const saved = localStorage.getItem('wms_entry_queue');
    if (saved) {
      try {
        setQueue(JSON.parse(saved));
      } catch (e) {
        console.error("Error parsing queue", e);
      }
    }
  }, []);

  // Guardar cola al cambiar
  useEffect(() => {
    localStorage.setItem('wms_entry_queue', JSON.stringify(queue));
  }, [queue]);

  // Buscar descripción al cambiar el código (Debounce o Blur)
  useEffect(() => {
    const fetchDescription = async () => {
      if (!form.codigo || form.codigo.length < 3) return;
      
      setLoadingDesc(true);
      setError(null);
      try {
        // 1. Intentar buscar en MATRIZ DE CODIGOS (tms_matriz_codigos) - PRIORIDAD
        let { data, error } = await supabase
          .from('tms_matriz_codigos')
          .select('producto')
          .eq('codigo_producto', form.codigo)
          .maybeSingle();

        if (data && data.producto) {
          setForm(prev => ({ ...prev, descripcion: data.producto }));
        } else {
          // 2. Si no está en maestro, buscar en historial de ubicaciones como fallback
          const { data: dataWms } = await supabase
            .from('wms_ubicaciones')
            .select('descripcion')
            .eq('codigo', form.codigo)
            .limit(1)
            .maybeSingle();
            
          if (dataWms && dataWms.descripcion) {
             setForm(prev => ({ ...prev, descripcion: dataWms.descripcion }));
          } else {
             // NO ENCONTRADO
             setForm(prev => ({ ...prev, descripcion: '' }));
             setError("SKU NO ENCONTRADO");
          }
        }
      } catch (err) {
        console.error("Error buscando descripción:", err);
      } finally {
        setLoadingDesc(false);
      }
    };

    const timer = setTimeout(fetchDescription, 800); // Debounce de 800ms
    return () => clearTimeout(timer);
  }, [form.codigo]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let finalValue = value;

    // Validaciones específicas
    if (name === 'ubicacion') {
      finalValue = value.toUpperCase().slice(0, 8); // Max 8 chars
    } else if (name === 'codigo') {
      finalValue = value.toUpperCase().slice(0, 12); // Max 12 chars, Uppercase
    }

    setForm(prev => ({ ...prev, [name]: finalValue }));
  };

  const addToQueue = (e) => {
    e.preventDefault();
    if (!form.ubicacion || !form.codigo || !form.cantidad) {
      setError("Faltan campos obligatorios (Ubicación, Código, Cantidad)");
      return;
    }

    const newItem = {
      id: Date.now(),
      ...form,
      timestamp: new Date().toISOString()
    };

    setQueue([newItem, ...queue]); // Agregar al principio
    
    // Resetear formulario parcial (mantener ubicación para agilizar)
    setForm(prev => ({
      ...prev,
      codigo: '',
      serie: '',
      partida: '',
      pieza: '',
      fecha_vencimiento: '',
      talla: '',
      color: '',
      cantidad: '',
      descripcion: ''
    }));
    setError(null);
    
    // Focus al código para seguir escaneando
    if (codigoInputRef.current) codigoInputRef.current.focus();
  };

  const removeFromQueue = (id) => {
    setQueue(queue.filter(item => item.id !== id));
  };

  const clearQueue = () => {
    if (window.confirm('¿Limpiar toda la cola?')) setQueue([]);
  };

  const handleSync = async () => {
    if (queue.length === 0) return;
    
    setSaving(true);
    try {
      // Preparar datos para inserción en wms_ubicaciones
      const rowsToInsert = queue.map(item => ({
        ubicacion: item.ubicacion,
        codigo: item.codigo,
        descripcion: item.descripcion,
        cantidad: parseFloat(item.cantidad),
        serie: item.serie || null,
        partida: item.partida || null,
        pieza: item.pieza || null,
        fecha_vencimiento: item.fecha_vencimiento || null,
        talla: item.talla || null,
        color: item.color || null,
        // fecha_ingreso: new Date().toISOString() // Si la tabla tiene columna de fecha
      }));

      const { error } = await supabase
        .from('wms_ubicaciones')
        .insert(rowsToInsert);

      if (error) throw error;

      alert(`✅ ${queue.length} registros guardados correctamente en Ubicaciones.`);
      setQueue([]);
    } catch (err) {
      console.error("Error guardando:", err);
      alert("❌ Error al guardar: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex justify-between items-end border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800 flex items-center gap-2 tracking-tight">
            <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
              <PackagePlus size={28} />
            </div>
            INGRESO DE MERCANCÍA
          </h2>
          <p className="text-slate-500 text-sm mt-1 ml-1">Registro manual de entradas a ubicaciones</p>
        </div>
        <div className={`flex items-center gap-2 text-sm px-4 py-2 rounded-full border font-bold ${isOnline ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
           {isOnline ? <Wifi size={16} /> : <WifiOff size={16} />}
           {isOnline ? 'CONECTADO' : 'SIN CONEXIÓN'}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Formulario de Ingreso */}
        <div className="xl:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-teal-500"></div>
            
            <h3 className="font-black text-slate-800 text-lg mb-6 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 text-sm">1</span>
              DATOS DEL PRODUCTO
            </h3>

            <form onSubmit={addToQueue} className="space-y-5">
              {/* UBICACION */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 tracking-wider">
                  Ubicación <span className="text-red-500">*</span> (Max 8)
                </label>
                <div className="relative group">
                  <input 
                    type="text" 
                    name="ubicacion"
                    className="w-full pl-4 pr-10 py-3 border-2 border-slate-200 rounded-xl text-lg font-mono font-bold uppercase focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all placeholder:text-slate-300"
                    placeholder="A-01-01"
                    value={form.ubicacion}
                    onChange={handleInputChange}
                    maxLength={8}
                    required 
                    autoFocus
                  />
                  <QrCode className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={20} />
                </div>
              </div>

              {/* CODIGO */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 tracking-wider">
                  Código <span className="text-red-500">*</span> (Max 12)
                </label>
                <div className="relative group">
                  <input 
                    ref={codigoInputRef}
                    type="text" 
                    name="codigo"
                    className="w-full pl-4 pr-10 py-3 border-2 border-slate-200 rounded-xl text-lg font-mono font-bold uppercase focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all placeholder:text-slate-300"
                    placeholder="SKU-123..."
                    value={form.codigo}
                    onChange={handleInputChange}
                    maxLength={12}
                    required 
                  />
                  {loadingDesc ? (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500 animate-spin" size={20} />
                  ) : (
                    <QrCode className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={20} />
                  )}
                </div>
              </div>

              {/* DESCRIPCION (AUTO) */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5 tracking-wider">
                  Descripción (Automático)
                </label>
                <textarea 
                  name="descripcion"
                  rows="2"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 resize-none focus:outline-none focus:bg-white transition-colors"
                  placeholder="Se llenará automáticamente al ingresar el código..."
                  value={form.descripcion}
                  readOnly
                  tabIndex="-1"
                />
              </div>

              {/* CANTIDAD */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 tracking-wider">
                  Cantidad Contada <span className="text-red-500">*</span>
                </label>
                <input 
                  ref={cantidadInputRef}
                  type="number" 
                  name="cantidad"
                  className="w-full p-3 border-2 border-slate-200 rounded-xl text-xl font-bold text-slate-800 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
                  placeholder="0"
                  min="0.01"
                  step="0.01"
                  value={form.cantidad}
                  onChange={handleInputChange}
                  required 
                />
              </div>

              {/* CAMPOS OPCIONALES (Accordion style or Grid) */}
              <div className="pt-4 border-t border-slate-100">
                <p className="text-xs font-bold text-slate-400 uppercase mb-4 tracking-wider">Detalles Opcionales</p>
                <div className="grid grid-cols-2 gap-4">
                  
                  {/* SERIE */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Serie</label>
                    <input type="text" name="serie" value={form.serie} onChange={handleInputChange} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:border-emerald-400 outline-none transition-all" placeholder="S/N..." />
                  </div>

                  {/* PARTIDA */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Partida</label>
                    <input type="text" name="partida" value={form.partida} onChange={handleInputChange} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:border-emerald-400 outline-none transition-all" placeholder="Lote..." />
                  </div>

                  {/* PIEZA */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Pieza</label>
                    <input type="text" name="pieza" value={form.pieza} onChange={handleInputChange} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:border-emerald-400 outline-none transition-all" placeholder="Ej: Motor..." />
                  </div>

                  {/* VENCIMIENTO */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Vencimiento</label>
                    <div className="relative">
                      <input type="date" name="fecha_vencimiento" value={form.fecha_vencimiento} onChange={handleInputChange} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:border-emerald-400 outline-none transition-all" />
                      <Calendar className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
                    </div>
                  </div>

                  {/* TALLA */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Talla</label>
                    <input type="text" name="talla" value={form.talla} onChange={handleInputChange} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:border-emerald-400 outline-none transition-all" placeholder="S, M, L..." />
                  </div>

                  {/* COLOR */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Color</label>
                    <input type="text" name="color" value={form.color} onChange={handleInputChange} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:border-emerald-400 outline-none transition-all" placeholder="Rojo..." />
                  </div>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-lg flex items-center gap-2 text-sm text-red-600 animate-in fade-in slide-in-from-top-2">
                  <AlertCircle size={16} />
                  {error}
                </div>
              )}

              <button className="w-full bg-slate-900 text-white py-4 rounded-xl font-black text-lg hover:bg-black transition-all shadow-lg hover:shadow-xl active:scale-95 flex items-center justify-center gap-2 group">
                <PackagePlus size={24} className="group-hover:scale-110 transition-transform" />
                AGREGAR A COLA
              </button>
            </form>
          </div>
        </div>

        {/* Cola de Registros */}
        <div className="xl:col-span-2 h-full">
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 flex flex-col h-[800px] relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-slate-200 to-slate-300"></div>

            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h3 className="font-black text-slate-800 text-lg flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 text-sm">2</span>
                    COLA DE PROCESAMIENTO
                    <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold border border-emerald-200 shadow-sm">{queue.length} ÍTEMS</span>
                </h3>
                <button onClick={clearQueue} disabled={queue.length===0} className="px-4 py-2 rounded-lg text-xs font-bold text-red-500 hover:bg-red-50 hover:text-red-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                    <Trash2 size={16} /> VACIAR TODO
                </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/30">
                {queue.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400">
                        <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                          <Box size={48} className="opacity-20" />
                        </div>
                        <p className="font-bold text-lg">La cola está vacía</p>
                        <p className="text-sm">Agrega productos usando el formulario</p>
                    </div>
                ) : (
                    queue.map((item, index) => (
                        <div key={item.id} className="group bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all flex flex-col md:flex-row gap-4 items-start md:items-center relative">
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500 rounded-l-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            
                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-500 shrink-0">
                                {queue.length - index}
                            </div>
                            
                            <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ubicación</p>
                                    <p className="font-mono font-bold text-slate-800 text-lg">{item.ubicacion}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Código</p>
                                    <p className="font-mono font-bold text-emerald-600 text-lg">{item.codigo}</p>
                                    {item.descripcion && <p className="text-xs text-slate-500 truncate max-w-[150px]">{item.descripcion}</p>}
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cantidad</p>
                                    <p className="font-black text-slate-900 text-lg">{item.cantidad}</p>
                                </div>
                                <div className="hidden md:block">
                                   {/* Detalles extra */}
                                   {(item.serie || item.lote || item.fecha_vencimiento) && (
                                     <div className="flex flex-wrap gap-1">
                                       {item.serie && <span className="px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded text-[10px] border border-blue-100">S: {item.serie}</span>}
                                       {item.partida && <span className="px-1.5 py-0.5 bg-purple-50 text-purple-600 rounded text-[10px] border border-purple-100">P: {item.partida}</span>}
                                       {item.fecha_vencimiento && <span className="px-1.5 py-0.5 bg-orange-50 text-orange-600 rounded text-[10px] border border-orange-100">V: {item.fecha_vencimiento}</span>}
                                     </div>
                                   )}
                                </div>
                            </div>

                            <button onClick={() => removeFromQueue(item.id)} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                <Trash2 size={20} />
                            </button>
                        </div>
                    ))
                )}
            </div>

            <div className="p-6 border-t border-slate-100 bg-white">
                <button 
                    onClick={handleSync}
                    disabled={queue.length === 0 || saving}
                    className="w-full bg-emerald-600 text-white py-4 rounded-xl font-black text-lg hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 transition-all shadow-lg shadow-emerald-200 disabled:shadow-none flex items-center justify-center gap-3"
                >
                    {saving ? (
                      <>
                        <Loader2 size={24} className="animate-spin" />
                        GUARDANDO...
                      </>
                    ) : (
                      <>
                        <Save size={24} />
                        GUARDAR EN UBICACIONES ({queue.length})
                      </>
                    )}
                </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Entry;
