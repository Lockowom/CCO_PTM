import React, { useState, useEffect } from 'react';
import { Search, FileText, Truck, Box, CheckCircle, Clock, AlertCircle, Calendar, User, ArrowRight } from 'lucide-react';
import { supabase } from '../../supabase';

const SalesStatus = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [selectedNV, setSelectedNV] = useState(null);

  // Auto-search si hay término al cargar (opcional)
  useEffect(() => {
    if (searchTerm.length > 3) {
      const delayDebounceFn = setTimeout(() => {
        handleSearch();
      }, 800);
      return () => clearTimeout(delayDebounceFn);
    }
  }, [searchTerm]);

  const handleSearch = async () => {
    if (!searchTerm) return;
    setLoading(true);
    setResults([]);
    setSelectedNV(null);

    try {
      // Buscar en tms_nv_diarias
      const { data, error } = await supabase
        .from('tms_nv_diarias')
        .select('*')
        .or(`nv.ilike.%${searchTerm}%,cliente.ilike.%${searchTerm}%`)
        .order('fecha_emision', { ascending: false })
        .limit(20);

      if (error) throw error;
      setResults(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDetails = async (nv) => {
    try {
      setLoading(true);
      // Obtener detalles adicionales (Entregas, Ruta, Conductor)
      const { data: entrega, error } = await supabase
        .from('tms_entregas')
        .select(`
            *,
            tms_rutas ( nombre, fecha_inicio ),
            tms_conductores ( nombre, apellido, vehiculo_patente )
        `)
        .eq('nv', nv.nv)
        .single();

      // Combinar info
      setSelectedNV({
        ...nv,
        entrega: entrega || null
      });

    } catch (err) {
      console.error(err);
      setSelectedNV({ ...nv, entrega: null });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const map = {
      'PENDIENTE': 'bg-gray-100 text-gray-700',
      'PICKING': 'bg-yellow-100 text-yellow-800',
      'PACKING': 'bg-blue-100 text-blue-800',
      'LISTO_DESPACHO': 'bg-indigo-100 text-indigo-800',
      'EN_RUTA': 'bg-purple-100 text-violet-800',
      'DESPACHADO': 'bg-green-100 text-green-800',
      'ENTREGADO': 'bg-emerald-100 text-emerald-800'
    };
    return map[status] || 'bg-gray-50 text-gray-600';
  };

  // Timeline Component
  const Timeline = ({ data }) => {
    const steps = [
      { id: 'PENDIENTE', label: 'Ingresado', icon: FileText, date: data.fecha_emision },
      { id: 'PICKING', label: 'Picking', icon: HandIcon, date: null }, // Fecha picking no la tenemos exacta en nv_diarias, pero podríamos inferirla
      { id: 'PACKING', label: 'Packing', icon: Box, date: data.entrega?.fecha_creacion },
      { id: 'EN_RUTA', label: 'En Ruta', icon: Truck, date: data.entrega?.fecha_asignacion },
      { id: 'ENTREGADO', label: 'Entregado', icon: CheckCircle, date: data.entrega?.fecha_entrega_real }
    ];

    // Lógica simple para determinar activo
    const currentIdx = steps.findIndex(s => s.id === data.estado) || 0;

    return (
      <div className="relative flex justify-between items-center w-full my-8">
        {/* Linea base */}
        <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 -z-10 transform -translate-y-1/2"></div>
        
        {steps.map((step, idx) => {
            const isCompleted = idx <= currentIdx;
            const isCurrent = idx === currentIdx;
            
            return (
                <div key={step.id} className="flex flex-col items-center bg-white px-2">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                        isCompleted 
                        ? 'bg-green-500 border-green-500 text-white' 
                        : 'bg-white border-slate-300 text-slate-300'
                    }`}>
                        <step.icon size={18} />
                    </div>
                    <p className={`text-xs font-bold mt-2 ${isCurrent ? 'text-green-600' : 'text-slate-500'}`}>
                        {step.label}
                    </p>
                    {step.date && (
                        <span className="text-[10px] text-slate-400">
                            {new Date(step.date).toLocaleDateString()}
                        </span>
                    )}
                </div>
            );
        })}
      </div>
    );
  };

  // Helper icon for timeline
  const HandIcon = (props) => (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={props.size} 
      height={props.size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      {...props}
    >
      <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0"/>
      <path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2"/>
      <path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8"/>
      <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/>
    </svg>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Consulta de Pedidos</h2>
          <p className="text-slate-500 text-sm">Trazabilidad completa de Notas de Venta</p>
        </div>
      </div>

      {/* Buscador */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-3.5 text-slate-400" size={20} />
            <input 
                type="text" 
                placeholder="Ingrese N.V, Cliente o Producto..." 
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none text-lg transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            {loading && (
                <div className="absolute right-4 top-3.5">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600"></div>
                </div>
            )}
        </div>
      </div>

      {/* Resultados */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Lista Lateral */}
        <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden h-[600px] flex flex-col">
            <div className="p-4 border-b border-slate-100 bg-slate-50">
                <h3 className="font-bold text-slate-700 text-sm">Resultados ({results.length})</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-2">
                {results.length === 0 ? (
                    <div className="text-center py-10 text-slate-400">
                        <Search size={32} className="mx-auto mb-2 opacity-20" />
                        <p className="text-sm">Sin resultados</p>
                    </div>
                ) : (
                    results.map(item => (
                        <div 
                            key={item.id}
                            onClick={() => fetchDetails(item)}
                            className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                                selectedNV?.id === item.id 
                                ? 'bg-indigo-50 border-indigo-300 ring-1 ring-indigo-300' 
                                : 'bg-white border-slate-100 hover:border-indigo-200'
                            }`}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <span className="font-bold text-slate-800">NV: {item.nv}</span>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${getStatusColor(item.estado)}`}>
                                    {item.estado}
                                </span>
                            </div>
                            <p className="text-xs text-slate-600 font-medium truncate">{item.cliente}</p>
                            <div className="flex items-center gap-2 mt-2 text-xs text-slate-400">
                                <Calendar size={12} />
                                <span>{new Date(item.fecha_emision).toLocaleDateString()}</span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>

        {/* Detalle Central */}
        <div className="lg:col-span-2">
            {selectedNV ? (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-right-4 duration-300">
                    {/* Header Detalle */}
                    <div className="bg-slate-900 text-white p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <h2 className="text-3xl font-black tracking-tight">N.V {selectedNV.nv}</h2>
                                    <span className={`text-xs font-bold px-3 py-1 rounded-full text-slate-900 ${getStatusColor(selectedNV.estado).replace('text-', 'bg-').replace('bg-', 'text-white ')} bg-white`}>
                                        {selectedNV.estado}
                                    </span>
                                </div>
                                <p className="text-slate-300 font-medium text-lg">{selectedNV.cliente}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-slate-400 uppercase font-bold mb-1">Fecha Emisión</p>
                                <p className="text-xl font-bold">{new Date(selectedNV.fecha_emision).toLocaleDateString()}</p>
                            </div>
                        </div>
                    </div>

                    {/* Timeline Visual */}
                    <div className="p-6 border-b border-slate-100">
                        <Timeline data={selectedNV} />
                    </div>

                    {/* Info Grid */}
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <h4 className="font-bold text-slate-800 flex items-center gap-2 pb-2 border-b border-slate-100">
                                <Box size={18} className="text-indigo-600" /> Detalle del Producto
                            </h4>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="block text-xs text-slate-400 uppercase font-bold">Código</span>
                                    <span className="font-mono font-medium text-slate-700">{selectedNV.codigo_producto}</span>
                                </div>
                                <div>
                                    <span className="block text-xs text-slate-400 uppercase font-bold">Cantidad</span>
                                    <span className="font-bold text-slate-800 text-lg">{selectedNV.cantidad} {selectedNV.unidad}</span>
                                </div>
                                <div className="col-span-2">
                                    <span className="block text-xs text-slate-400 uppercase font-bold">Descripción</span>
                                    <p className="text-slate-600">{selectedNV.descripcion_producto}</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h4 className="font-bold text-slate-800 flex items-center gap-2 pb-2 border-b border-slate-100">
                                <Truck size={18} className="text-indigo-600" /> Información Logística
                            </h4>
                            {selectedNV.entrega ? (
                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Bultos:</span>
                                        <span className="font-bold text-slate-800">{selectedNV.entrega.bultos || '-'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Peso:</span>
                                        <span className="font-bold text-slate-800">{selectedNV.entrega.peso_kg ? `${selectedNV.entrega.peso_kg} kg` : '-'}</span>
                                    </div>
                                    
                                    {selectedNV.entrega.tms_rutas && (
                                        <div className="bg-indigo-50 p-3 rounded-lg mt-2">
                                            <p className="text-xs text-indigo-600 font-bold uppercase mb-1">Ruta Asignada</p>
                                            <p className="font-bold text-indigo-900">{selectedNV.entrega.tms_rutas.nombre}</p>
                                            <p className="text-xs text-indigo-700 mt-1 flex items-center gap-1">
                                                <Calendar size={10} /> 
                                                {new Date(selectedNV.entrega.tms_rutas.fecha_inicio).toLocaleDateString()}
                                            </p>
                                        </div>
                                    )}

                                    {selectedNV.entrega.tms_conductores && (
                                        <div className="flex items-center gap-3 mt-2 pt-2 border-t border-slate-100">
                                            <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
                                                <User size={14} className="text-slate-500" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-700 text-xs">
                                                    {selectedNV.entrega.tms_conductores.nombre} {selectedNV.entrega.tms_conductores.apellido}
                                                </p>
                                                <p className="text-[10px] text-slate-400 font-mono">
                                                    {selectedNV.entrega.tms_conductores.vehiculo_patente}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-slate-400 text-sm italic bg-slate-50 p-4 rounded-lg text-center">
                                    Aún no hay datos de despacho generados.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl h-full flex flex-col items-center justify-center text-slate-400 p-10">
                    <Search size={48} className="mb-4 opacity-20" />
                    <p className="font-medium text-lg">Selecciona un pedido para ver el detalle</p>
                    <p className="text-sm">Usa el buscador superior para encontrar Notas de Venta</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default SalesStatus;
