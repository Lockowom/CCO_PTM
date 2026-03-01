import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeftRight, 
  Search, 
  MapPin, 
  Package, 
  ArrowRight, 
  CheckCircle, 
  AlertTriangle,
  History,
  Box,
  ScanBarcode,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { supabase } from '../../supabase';
import { useAuth } from '../../context/AuthContext';
import gsap from 'gsap';

const Transfers = () => {
  const { user } = useAuth();
  const [step, setStep] = useState(1); // 1: Origen, 2: Selección, 3: Destino, 4: Confirmación
  const [loading, setLoading] = useState(false);
  
  // Estados de Selección
  const [origenSearch, setOrigenSearch] = useState('');
  const [origenUbicacion, setOrigenUbicacion] = useState(null);
  const [itemsOrigen, setItemsOrigen] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [cantidadTransferir, setCantidadTransferir] = useState(1);
  
  const [destinoSearch, setDestinoSearch] = useState('');
  const [destinoUbicacion, setDestinoUbicacion] = useState(null);

  const [historial, setHistorial] = useState([]);

  // Referencias para animaciones
  const containerRef = useRef(null);
  const stepRef = useRef(null);

  useEffect(() => {
    cargarHistorial();
  }, []);

  // Animación al cambiar de paso
  useEffect(() => {
    if (stepRef.current) {
      gsap.fromTo(stepRef.current, 
        { x: 20, opacity: 0 }, 
        { x: 0, opacity: 1, duration: 0.4, ease: "power2.out" }
      );
    }
  }, [step]);

  const cargarHistorial = async () => {
    // Simulado: En producción leería de una tabla de movimientos
    // const { data } = await supabase.from('wms_movimientos').select('*').limit(5);
    setHistorial([
      { id: 1, origen: 'A-01-01', destino: 'B-02-03', producto: 'PARACETAMOL 500MG', cantidad: 50, usuario: 'Juan Pérez', hora: '10:30' },
      { id: 2, origen: 'RECEPCION', destino: 'A-05-02', producto: 'IBUPROFENO 400MG', cantidad: 200, usuario: 'Maria Gonzalez', hora: '09:15' }
    ]);
  };

  const buscarOrigen = async () => {
    if (!origenSearch.trim()) return;
    setLoading(true);
    try {
      // Buscar ubicación exacta
      const { data, error } = await supabase
        .from('wms_ubicaciones')
        .select('*')
        .eq('ubicacion', origenSearch.toUpperCase());

      if (error) throw error;

      if (data && data.length > 0) {
        setOrigenUbicacion(origenSearch.toUpperCase());
        setItemsOrigen(data);
        setStep(2);
      } else {
        alert("Ubicación no encontrada o vacía");
      }
    } catch (err) {
      console.error(err);
      alert("Error buscando ubicación");
    } finally {
      setLoading(false);
    }
  };

  const seleccionarItem = (item) => {
    setSelectedItem(item);
    setCantidadTransferir(item.cantidad); // Por defecto todo
    setStep(3);
  };

  const verificarDestino = async () => {
    if (!destinoSearch.trim()) return;
    // En un sistema real, validaríamos que el destino existe en wms_layout
    // Por ahora asumimos que es válido si tiene formato correcto
    setDestinoUbicacion(destinoSearch.toUpperCase());
    setStep(4);
  };

  const confirmarTransferencia = async () => {
    setLoading(true);
    try {
      // 1. Restar de Origen
      const nuevaCantidadOrigen = selectedItem.cantidad - cantidadTransferir;
      
      if (nuevaCantidadOrigen === 0) {
        // Eliminar registro si queda en 0
        await supabase
          .from('wms_ubicaciones')
          .delete()
          .eq('id', selectedItem.id);
      } else {
        // Actualizar cantidad
        await supabase
          .from('wms_ubicaciones')
          .update({ cantidad: nuevaCantidadOrigen })
          .eq('id', selectedItem.id);
      }

      // 2. Sumar a Destino (Upsert)
      // Buscar si ya existe el producto en destino para sumar
      const { data: existente } = await supabase
        .from('wms_ubicaciones')
        .select('*')
        .eq('ubicacion', destinoUbicacion)
        .eq('codigo', selectedItem.codigo)
        .single();

      if (existente) {
        await supabase
          .from('wms_ubicaciones')
          .update({ cantidad: existente.cantidad + parseInt(cantidadTransferir) })
          .eq('id', existente.id);
      } else {
        // Crear nuevo registro
        const { id, created_at, ...rest } = selectedItem; // Excluir ID original
        await supabase
          .from('wms_ubicaciones')
          .insert({
            ...rest,
            ubicacion: destinoUbicacion,
            cantidad: parseInt(cantidadTransferir),
            pasillo: destinoUbicacion.split('-')[0] || 'GEN',
            columna: parseInt(destinoUbicacion.split('-')[1]) || 0,
            nivel: parseInt(destinoUbicacion.split('-')[2]) || 0,
            updated_at: new Date()
          });
      }

      // 3. Registrar Movimiento (Log) - Pendiente tabla real
      console.log(`Transferido ${cantidadTransferir} de ${selectedItem.codigo} desde ${origenUbicacion} a ${destinoUbicacion}`);

      // Resetear
      setStep(1);
      setOrigenSearch('');
      setDestinoSearch('');
      setSelectedItem(null);
      alert("Transferencia realizada con éxito ✅");
      cargarHistorial(); // Refrescar

    } catch (err) {
      console.error(err);
      alert("Error al procesar transferencia");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-slate-50/50 p-4 sm:p-6 lg:p-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
            <ArrowLeftRight className="text-blue-600" />
            Transferencias WMS
          </h1>
          <p className="text-slate-500 text-sm mt-1">Mover inventario entre ubicaciones</p>
        </div>
        <button className="bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 shadow-sm hover:text-blue-600 transition-colors">
          <History size={16} /> Ver Historial
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Panel Principal - Wizard */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            
            {/* Progress Bar */}
            <div className="flex border-b border-slate-100">
              {[1, 2, 3, 4].map((s) => (
                <div 
                  key={s} 
                  className={`flex-1 h-1.5 transition-all duration-500 ${step >= s ? 'bg-blue-500' : 'bg-slate-100'}`}
                ></div>
              ))}
            </div>

            <div className="p-6 sm:p-8 min-h-[400px]" ref={stepRef}>
              
              {/* PASO 1: ORIGEN */}
              {step === 1 && (
                <div className="space-y-6">
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600">
                      <MapPin size={32} />
                    </div>
                    <h2 className="text-xl font-bold text-slate-800">¿Desde dónde quieres mover?</h2>
                    <p className="text-slate-500">Escanea o ingresa la ubicación de origen</p>
                  </div>

                  <div className="max-w-md mx-auto">
                    <div className="relative flex items-center">
                      <ScanBarcode className="absolute left-4 text-slate-400" size={20} />
                      <input
                        type="text"
                        value={origenSearch}
                        onChange={(e) => setOrigenSearch(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && buscarOrigen()}
                        placeholder="Ej: A-01-01"
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-200 rounded-xl text-lg font-mono font-bold text-slate-800 focus:border-blue-500 focus:ring-0 outline-none transition-all uppercase placeholder:normal-case placeholder:font-sans"
                        autoFocus
                      />
                      <button 
                        onClick={buscarOrigen}
                        disabled={!origenSearch || loading}
                        className="absolute right-2 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                      >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : <ArrowRight size={20} />}
                      </button>
                    </div>
                    <div className="mt-4 flex gap-2 justify-center">
                      <span className="px-3 py-1 bg-slate-100 rounded-full text-xs font-bold text-slate-500 border border-slate-200">RECEPCION</span>
                      <span className="px-3 py-1 bg-slate-100 rounded-full text-xs font-bold text-slate-500 border border-slate-200">MERMA</span>
                      <span className="px-3 py-1 bg-slate-100 rounded-full text-xs font-bold text-slate-500 border border-slate-200">DEV_CLIENTE</span>
                    </div>
                  </div>
                </div>
              )}

              {/* PASO 2: SELECCIONAR PRODUCTO */}
              {step === 2 && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-slate-800">Productos en <span className="text-blue-600 font-black">{origenUbicacion}</span></h2>
                    <button onClick={() => setStep(1)} className="text-sm font-bold text-slate-400 hover:text-slate-600">Cambiar Origen</button>
                  </div>

                  <div className="space-y-3">
                    {itemsOrigen.map((item) => (
                      <div 
                        key={item.id}
                        onClick={() => seleccionarItem(item)}
                        className="p-4 border border-slate-200 rounded-xl hover:border-blue-400 hover:bg-blue-50 cursor-pointer transition-all group flex items-center justify-between"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-white border border-slate-100 rounded-lg flex items-center justify-center text-slate-400 group-hover:text-blue-500">
                            <Package size={20} />
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 text-sm">{item.descripcion || 'Sin Descripción'}</p>
                            <p className="text-xs font-mono text-slate-500">{item.codigo}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="block text-xl font-black text-slate-800">{item.cantidad}</span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase">Unidades</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* PASO 3: DESTINO Y CANTIDAD */}
              {step === 3 && selectedItem && (
                <div className="space-y-6">
                  <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center text-blue-600 shadow-sm">
                      <Package size={24} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-blue-500 uppercase tracking-wider">Moviendo</p>
                      <p className="font-bold text-slate-800">{selectedItem.descripcion}</p>
                      <p className="text-xs text-slate-500 font-mono">{selectedItem.codigo}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Cantidad a Mover</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="1"
                          max={selectedItem.cantidad}
                          value={cantidadTransferir}
                          onChange={(e) => setCantidadTransferir(Math.min(parseInt(e.target.value) || 0, selectedItem.cantidad))}
                          className="w-full p-3 border-2 border-slate-200 rounded-xl font-mono text-lg font-bold text-center outline-none focus:border-blue-500"
                        />
                        <button 
                          onClick={() => setCantidadTransferir(selectedItem.cantidad)}
                          className="px-3 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl text-xs hover:bg-slate-200"
                        >
                          MAX
                        </button>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 text-center">Disponible: {selectedItem.cantidad}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Ubicación Destino</label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3.5 text-slate-400" size={18} />
                        <input
                          type="text"
                          value={destinoSearch}
                          onChange={(e) => setDestinoSearch(e.target.value)}
                          placeholder="Ej: B-05-01"
                          className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 rounded-xl outline-none focus:border-blue-500 font-mono uppercase placeholder:normal-case placeholder:font-sans"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-8">
                    <button 
                      onClick={() => setStep(2)}
                      className="flex-1 py-3 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50"
                    >
                      Atrás
                    </button>
                    <button 
                      onClick={verificarDestino}
                      disabled={!destinoSearch || cantidadTransferir <= 0}
                      className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 disabled:opacity-50 shadow-lg shadow-blue-500/30"
                    >
                      Continuar
                    </button>
                  </div>
                </div>
              )}

              {/* PASO 4: CONFIRMACIÓN */}
              {step === 4 && (
                <div className="text-center space-y-6 py-4">
                  <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto text-green-500 animate-pulse">
                    <CheckCircle size={40} />
                  </div>
                  
                  <div>
                    <h2 className="text-2xl font-black text-slate-800">Confirmar Movimiento</h2>
                    <p className="text-slate-500">Verifica los detalles antes de procesar</p>
                  </div>

                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 max-w-sm mx-auto space-y-4 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-green-500"></div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-400 uppercase">Origen</span>
                      <span className="font-mono font-bold text-red-500 bg-red-50 px-2 py-1 rounded">{origenUbicacion}</span>
                    </div>
                    
                    <div className="flex justify-center text-slate-300">
                      <ArrowRight size={20} className="transform rotate-90" />
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-400 uppercase">Destino</span>
                      <span className="font-mono font-bold text-green-600 bg-green-50 px-2 py-1 rounded">{destinoUbicacion}</span>
                    </div>

                    <div className="pt-4 border-t border-slate-200 mt-4">
                      <p className="text-sm text-slate-600 font-medium mb-1">{selectedItem.descripcion}</p>
                      <p className="text-3xl font-black text-slate-800">{cantidadTransferir} <span className="text-xs font-bold text-slate-400 align-middle">UNIDADES</span></p>
                    </div>
                  </div>

                  <div className="flex gap-3 max-w-sm mx-auto">
                    <button 
                      onClick={() => setStep(3)}
                      className="flex-1 py-3 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50"
                    >
                      Cancelar
                    </button>
                    <button 
                      onClick={confirmarTransferencia}
                      disabled={loading}
                      className="flex-1 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 shadow-lg shadow-green-500/30 flex items-center justify-center gap-2"
                    >
                      {loading ? <Loader2 className="animate-spin" /> : 'Confirmar'}
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>

        {/* Panel Lateral - Historial */}
        <div className="hidden lg:block">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 h-full">
            <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-6">
              <History size={18} className="text-orange-500" />
              Últimos Movimientos
            </h3>

            <div className="relative pl-4 space-y-6 before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-100">
              {historial.map((mov) => (
                <div key={mov.id} className="relative">
                  <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-white border-2 border-orange-400"></div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-[10px] font-bold text-slate-400">{mov.hora} • {mov.usuario}</span>
                      <span className="text-[10px] font-bold bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded">INT</span>
                    </div>
                    <p className="text-xs font-bold text-slate-800 mb-1 line-clamp-1">{mov.producto}</p>
                    <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500">
                      <span>{mov.origen}</span>
                      <ArrowRight size={10} />
                      <span className="text-slate-800 font-bold">{mov.destino}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Transfers;
