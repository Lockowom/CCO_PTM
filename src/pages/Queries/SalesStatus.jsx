import React, { useState, useEffect, useRef } from 'react';
import {
    Search, FileText, Truck, Box, CheckCircle, Clock,
    AlertCircle, Calendar, User, ArrowRight, Activity,
    Package, MapPin, Zap
} from 'lucide-react';
import { supabase } from '../../supabase';
import { toast } from 'sonner';

const SalesStatus = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState([]);
    const [selectedNV, setSelectedNV] = useState(null);

    const selectedNVRef = useRef(null);

    useEffect(() => {
        selectedNVRef.current = selectedNV;
    }, [selectedNV]);

    // Sincronización en Tiempo Real
    useEffect(() => {
        const channel = supabase
            .channel('sales_status_realtime')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'tms_nv_diarias' }, (payload) => {
                // 1. Actualizar la lista lateral si el pedido afectado está ahí
                setResults(prev => {
                    const index = prev.findIndex(item => item.nv === payload.new.nv);
                    if (index !== -1) {
                        const newResults = [...prev];
                        newResults[index] = { ...newResults[index], ...payload.new };
                        return newResults;
                    }
                    return prev;
                });

                // 2. Si es el pedido que el usuario está viendo, recargar detalles completos
                if (selectedNVRef.current && selectedNVRef.current.nv === payload.new.nv) {
                    fetchDetails(payload.new);

                    // Notificación visual opcional para que el usuario sepa que algo cambió
                    toast('Actualización WMS', {
                        description: `El estado cambió a ${payload.new.estado}`,
                        icon: <Activity className="text-blue-500" />
                    });
                }
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'tms_entregas' }, (payload) => {
                // Actualización de logística
                if (selectedNVRef.current && selectedNVRef.current.nv === payload.new.nv) {
                    fetchDetails(selectedNVRef.current);
                    toast('Actualización Logística', {
                        description: `Datos de ruta/despacho modificados para la NV`,
                        icon: <Truck className="text-emerald-500 animate-bounce" />
                    });
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    // Búsqueda con debounce
    useEffect(() => {
        if (searchTerm.length >= 3) {
            const delayDebounceFn = setTimeout(() => {
                handleSearch();
            }, 500);
            return () => clearTimeout(delayDebounceFn);
        } else if (searchTerm.length === 0) {
            setResults([]);
            setSelectedNV(null);
        }
    }, [searchTerm]);

    const handleSearch = async () => {
        if (!searchTerm) return;
        setLoading(true);

        try {
            const { data, error } = await supabase
                .from('tms_nv_diarias')
                .select('*')
                .or(`nv.ilike.%${searchTerm}%,cliente.ilike.%${searchTerm}%,codigo_producto.ilike.%${searchTerm}%`)
                .order('fecha_emision', { ascending: false })
                .limit(20);

            if (error) throw error;
            setResults(data || []);

            // Auto-seleccionar si es coincidencia exacta por número de NV
            if (data && data.length === 1 && data[0].nv.toLowerCase() === searchTerm.toLowerCase()) {
                fetchDetails(data[0]);
            }
        } catch (err) {
            console.error(err);
            toast.error('Error al realizar la búsqueda');
        } finally {
            setLoading(false);
        }
    };

    const handleClear = () => {
        setSearchTerm('');
        setResults([]);
        setSelectedNV(null);
    };

    const fetchDetails = async (nv) => {
        try {
            setLoading(true);
            const { data: entrega, error } = await supabase
                .from('tms_entregas')
                .select(`
            *,
            tms_rutas ( nombre, fecha_inicio ),
            tms_conductores ( nombre, apellido, vehiculo_patente )
        `)
                .eq('nv', nv.nv)
                .maybeSingle();

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
            'PENDIENTE': 'bg-slate-100 text-slate-700 border-slate-200',
            'Pendiente Picking': 'bg-amber-100 text-amber-800 border-amber-200',
            'PICKING': 'bg-yellow-100 text-yellow-800 border-yellow-200',
            'QUIEBRE_STOCK': 'bg-red-100 text-red-800 border-red-200',
            'PACKING': 'bg-blue-100 text-blue-800 border-blue-200',
            'LISTO_DESPACHO': 'bg-indigo-100 text-indigo-800 border-indigo-200',
            'EN_RUTA': 'bg-purple-100 text-violet-800 border-purple-200',
            'DESPACHADO': 'bg-green-100 text-green-800 border-green-200',
            'ENTREGADO': 'bg-emerald-100 text-emerald-800 border-emerald-200'
        };
        return map[status] || 'bg-slate-50 text-slate-600 border-slate-200';
    };

    // --- REDISEÑO DEL TIMELINE WMS ---
    const Timeline = ({ data }) => {
        let currentStatus = data.estado;
        if (currentStatus === 'Aprobada' || currentStatus === 'Pendiente Picking') currentStatus = 'PENDIENTE';

        const steps = [
            { id: 'PENDIENTE', label: 'Ingresado', icon: FileText, date: data.fecha_emision },
            { id: 'PICKING', label: 'Picking', icon: Package, date: null },
            { id: 'PACKING', label: 'Packing', icon: Box, date: null },
            { id: 'LISTO_DESPACHO', label: 'Preparado', icon: CheckCircle, date: null },
            { id: 'EN_RUTA', label: 'Despacho', icon: Truck, date: data.entrega?.fecha_asignacion },
            { id: 'ENTREGADO', label: 'Entregado', icon: MapPin, date: data.entrega?.fecha_entrega_real }
        ];

        const statusMap = {
            'PENDIENTE': 0, 'Pendiente Picking': 0, 'Aprobada': 0,
            'PICKING': 1, 'QUIEBRE_STOCK': 1,
            'PACKING': 2,
            'LISTO_DESPACHO': 3,
            'EN_RUTA': 4,
            'DESPACHADO': 4,
            'ENTREGADO': 5
        };

        const currentIdx = statusMap[data.estado] !== undefined ? statusMap[data.estado] : 0;

        return (
            <div className="relative flex justify-between items-start w-full mt-4 mb-2">
                {/* Linea base gris (Fondo de Progreso) */}
                <div className="absolute top-6 left-6 right-6 h-1.5 bg-slate-200/60 rounded-full -z-10"></div>
                {/* Linea Activa (Verde) que se "llena" según el índice actual */}
                <div
                    className="absolute top-6 left-6 h-1.5 bg-emerald-500 rounded-full -z-10 transition-all duration-1000 ease-out shadow-sm shadow-emerald-400/50"
                    style={{ width: `calc(${(currentIdx / (steps.length - 1)) * 100}% - 3rem)` }}
                ></div>

                {steps.map((step, idx) => {
                    const isCompleted = idx < currentIdx;
                    const isCurrent = idx === currentIdx;
                    const isPending = idx > currentIdx;

                    return (
                        <div key={step.id} className="flex flex-col items-center group relative w-16 md:w-20">
                            <div className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center border-[3px] transition-all duration-500 bg-white ${isCompleted
                                    ? 'border-emerald-500 text-emerald-500 shadow-lg shadow-emerald-100'
                                    : isCurrent
                                        ? 'border-indigo-500 text-indigo-600 shadow-xl shadow-indigo-200 animate-pulse scale-110'
                                        : 'border-slate-200 text-slate-300'
                                }`}>
                                <step.icon size={22} strokeWidth={isCompleted || isCurrent ? 2.5 : 2} />
                            </div>

                            <p className={`text-[9px] md:text-[11px] font-black uppercase tracking-wider mt-3 text-center transition-colors ${isCompleted ? 'text-emerald-700' : isCurrent ? 'text-indigo-700' : 'text-slate-400'
                                }`}>
                                {step.label}
                            </p>

                            {step.date && !isPending && (
                                <span className="text-[9px] text-slate-400 font-bold mt-1 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                                    {new Date(step.date).toLocaleDateString()}
                                </span>
                            )}
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="h-full flex flex-col font-sans p-2 md:p-6 bg-slate-50/50 min-h-screen">

            {/* HEADER WMS AESTHETIC INTEGRADO CON BÚSQUEDA */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 bg-white p-5 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/40 relative z-20">
                <div className="flex items-center gap-5">
                    <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 p-4 rounded-2xl shadow-lg shadow-indigo-200 text-white transform hover:scale-105 transition-transform">
                        <Search size={28} strokeWidth={3} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tighter text-slate-800 leading-none mb-1">
                            CONSULTAS <span className="text-indigo-600">WMS</span>
                        </h1>
                        <div className="flex items-center gap-1.5 text-slate-500 font-bold text-[10px] md:text-xs tracking-wider uppercase">
                            <Activity size={14} className="text-emerald-500" />
                            <span>Trazabilidad de Venta • En Vivo</span>
                        </div>
                    </div>
                </div>

                {/* Barra de Búsqueda Flotante */}
                <div className="mt-5 md:mt-0 w-full md:w-[450px] relative group">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            <Search className="text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} strokeWidth={2.5} />
                        )}
                    </div>
                    <input
                        type="text"
                        placeholder="Buscar por N.V, Cliente o SKU..."
                        className="w-full pl-12 pr-12 py-3.5 bg-slate-100 hover:bg-slate-200/50 rounded-2xl border-2 border-transparent focus:bg-white focus:border-indigo-400 outline-none text-slate-700 font-bold tracking-wide transition-all shadow-inner focus:shadow-lg focus:shadow-indigo-100/50"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {searchTerm && (
                        <button
                            onClick={handleClear}
                            className="absolute inset-y-0 right-4 flex items-center text-slate-400 hover:text-slate-600 bg-white shadow-sm my-2 px-1.5 rounded-lg border border-slate-200"
                            title="Limpiar Búsqueda"
                        >
                            <AlertCircle size={16} className="transform rotate-45" />
                        </button>
                    )}
                </div>
            </header>

            {/* DISEÑO PRINCIPAL (Split View) */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 pb-4">

                {/* ====== LISTA LATERAL RESULTADOS (4 Cols) ====== */}
                <div className="lg:col-span-4 flex flex-col bg-white rounded-[2rem] border border-slate-200 shadow-lg shadow-slate-200/50 overflow-hidden relative">
                    <div className="p-5 border-b border-slate-100 bg-slate-50/80 backdrop-blur-sm z-10 flex justify-between items-center sticky top-0">
                        <h3 className="font-black text-slate-700 tracking-tight flex items-center gap-2">
                            <Clock size={18} className="text-slate-400" />
                            COINCIDENCIAS
                        </h3>
                        <span className="bg-slate-200 text-slate-600 font-black px-3 py-1 rounded-lg text-xs">
                            {results.length} res.
                        </span>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar bg-slate-50/30">
                        {results.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-slate-300 p-6 text-center">
                                <Zap size={64} className="mb-4 opacity-50 text-indigo-300" />
                                <p className="font-black text-xl tracking-tight text-slate-400">EN ESPERA</p>
                                <p className="text-xs font-bold mt-1 opacity-60">Ingresa una Nota de Venta para rastrear</p>
                            </div>
                        ) : (
                            results.map(item => {
                                const isSelected = selectedNV?.id === item.id;
                                return (
                                    <div
                                        key={item.id}
                                        onClick={() => fetchDetails(item)}
                                        className={`p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 relative overflow-hidden group ${isSelected
                                                ? 'bg-indigo-50 border-indigo-400 shadow-md shadow-indigo-100/50'
                                                : 'bg-white border-slate-100 hover:border-indigo-200 hover:shadow-sm'
                                            }`}
                                    >
                                        {isSelected && <div className="absolute left-0 top-0 bottom-0 w-2 bg-indigo-500 rounded-l-2xl"></div>}

                                        <div className="flex justify-between items-start mb-2">
                                            <span className={`text-xl font-black tracking-tight ${isSelected ? 'text-indigo-900 ml-1' : 'text-slate-800'}`}>
                                                #{item.nv}
                                            </span>
                                            <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest border ${getStatusColor(item.estado)}`}>
                                                {item.estado}
                                            </span>
                                        </div>
                                        <p className="text-sm text-slate-500 font-bold truncate mb-3">{item.cliente}</p>

                                        <div className="flex items-center justify-between text-xs font-bold mt-3">
                                            <div className="flex items-center gap-1.5 text-slate-400 bg-slate-100/80 px-2 py-1 rounded-md">
                                                <Calendar size={12} />
                                                <span>{new Date(item.fecha_emision).toLocaleDateString()}</span>
                                            </div>
                                            {isSelected && <ArrowRight size={16} className="text-indigo-500 animate-pulse" />}
                                        </div>
                                    </div>
                                )
                            })
                        )}
                    </div>
                </div>

                {/* ====== PANEL CENTRAL DETALLES (8 Cols) ====== */}
                <div className="lg:col-span-8 bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden flex flex-col relative w-full h-full">
                    {selectedNV ? (
                        <div className="flex-1 overflow-y-auto custom-scrollbar animate-in fade-in slide-in-from-right-4 duration-300">

                            {/* Dark Header de Pedido */}
                            <div className="bg-slate-900 p-8 shadow-inner relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -mr-24 -mt-24 pointer-events-none"></div>

                                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                                    <div>
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="bg-indigo-500/20 p-2 rounded-xl border border-indigo-500/30">
                                                <FileText size={24} className="text-indigo-300" />
                                            </div>
                                            <span className="text-indigo-300 font-black tracking-widest uppercase text-xs">Información de N.V.</span>
                                        </div>
                                        <h2 className="text-6xl font-black tracking-tighter text-white mb-2 ml-[-3px]">#{selectedNV.nv}</h2>
                                        <p className="text-slate-300 font-bold text-lg flex items-center gap-2">
                                            <User size={18} className="text-indigo-400" />
                                            {selectedNV.cliente}
                                        </p>
                                    </div>

                                    <div className="flex flex-col items-end gap-3 w-full md:w-auto mt-4 md:mt-0">
                                        <div className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest border border-white/20 shadow-lg ${getStatusColor(selectedNV.estado).replace('bg-', 'bg-white/10 text-white ')}`}>
                                            <span className="opacity-70 mr-2">ESTADO ACTUAL:</span>
                                            {selectedNV.estado}
                                        </div>
                                        <div className="text-right bg-slate-800/80 p-3.5 rounded-xl border border-slate-700/80 backdrop-blur-sm w-full md:w-auto flex flex-col items-end">
                                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1 flex items-center gap-1.5">
                                                <Calendar size={12} /> Creado el
                                            </p>
                                            <p className="font-mono text-lg font-bold text-white tracking-wide">
                                                {new Date(selectedNV.fecha_emision).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Timeline Logístico */}
                            <div className="p-8 border-b border-slate-100 bg-slate-50/50">
                                <h4 className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8">
                                    <Activity size={14} className="text-slate-400" /> Trazabilidad Operativa
                                </h4>
                                <Timeline data={selectedNV} />
                            </div>

                            {/* Cards de Detalle Expandido */}
                            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8 bg-white">

                                {/* 1. PRODUCTO */}
                                <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                                    <h4 className="font-black text-slate-800 flex items-center gap-2 mb-6 text-lg tracking-tight">
                                        <Box size={22} className="text-indigo-500" />
                                        Especificaciones del Ítem
                                    </h4>
                                    <div className="space-y-4">
                                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center gap-4">
                                            <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center font-bold text-slate-400 border border-slate-200">
                                                SKU
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Código Único</p>
                                                <span className="font-mono font-black text-slate-800 text-lg tracking-tight">{selectedNV.codigo_producto}</span>
                                            </div>
                                        </div>

                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 pl-1">Descripción Registrada</p>
                                            <p className="font-bold text-slate-600 bg-slate-50 border border-slate-100 p-3 rounded-xl leading-snug">{selectedNV.descripcion_producto}</p>
                                        </div>

                                        <div className="flex items-center justify-between bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                                            <span className="font-black text-indigo-900 text-xs uppercase tracking-widest">Cant. Solicitada</span>
                                            <div className="flex items-baseline gap-1 bg-white px-3 py-1 rounded-lg shadow-sm border border-indigo-100">
                                                <span className="font-black text-2xl text-indigo-600">{selectedNV.cantidad}</span>
                                                <span className="font-bold text-indigo-400 text-[10px] uppercase tracking-wider">{selectedNV.unidad}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* 2. LOGÍSTICA / ENTREGA */}
                                <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-full -z-10"></div>

                                    <h4 className="font-black text-slate-800 flex items-center gap-2 mb-6 text-lg tracking-tight">
                                        <Truck size={22} className="text-emerald-500" />
                                        Manifiesto de Despacho
                                    </h4>

                                    {selectedNV.entrega ? (
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col justify-center">
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Bultos Tot.</p>
                                                    <p className="font-black text-3xl text-slate-700">{selectedNV.entrega.bultos || '0'}</p>
                                                </div>
                                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col justify-center">
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Vol / Peso</p>
                                                    <p className="font-black text-3xl text-slate-700 flex items-baseline gap-1">
                                                        {selectedNV.entrega.peso_kg || '0'}
                                                        <span className="text-xs text-slate-400 tracking-wider">KG</span>
                                                    </p>
                                                </div>
                                            </div>

                                            {selectedNV.entrega.tms_rutas && (
                                                <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 flex items-center gap-4 group">
                                                    <div className="bg-white p-2.5 rounded-xl border border-emerald-100 text-emerald-600 shadow-sm group-hover:scale-110 transition-transform">
                                                        <MapPin size={24} strokeWidth={2.5} />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-black text-emerald-600/70 uppercase tracking-widest mb-0.5">Ruta Operativa</p>
                                                        <p className="font-black text-emerald-900 text-lg leading-tight">{selectedNV.entrega.tms_rutas.nombre}</p>
                                                    </div>
                                                </div>
                                            )}

                                            {selectedNV.entrega.tms_conductores && (
                                                <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                                                    <div className="w-12 h-12 bg-white border border-slate-200 text-indigo-600 rounded-xl flex items-center justify-center font-black shadow-sm">
                                                        <User size={20} />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Chofer Asignado</p>
                                                        <p className="font-black text-slate-800 text-sm">
                                                            {selectedNV.entrega.tms_conductores.nombre} {selectedNV.entrega.tms_conductores.apellido}
                                                        </p>
                                                        <div className="bg-slate-200/60 text-slate-600 px-2 py-0.5 rounded text-[10px] font-mono font-bold inline-block mt-1">
                                                            PT: {selectedNV.entrega.tms_conductores.vehiculo_patente}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="h-full min-h-[220px] flex flex-col items-center justify-center text-slate-400 bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-200 p-6 text-center">
                                            <div className="w-16 h-16 bg-white shadow-sm rounded-full flex items-center justify-center mb-4 border border-slate-100">
                                                <Package size={28} className="text-slate-300" />
                                            </div>
                                            <p className="font-black text-slate-600 text-base tracking-tight">Sin Datos de Despacho</p>
                                            <p className="text-xs font-bold text-slate-400 mt-2 max-w-[200px]">El pedido aún no ha sido planificado para entrega en ruta.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-slate-50/30 p-10 relative">
                            <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
                                <Search size={400} />
                            </div>
                            <div className="relative z-10 text-center flex flex-col items-center">
                                <div className="w-24 h-24 bg-white rounded-full shadow-xl shadow-indigo-100 border border-indigo-50 flex items-center justify-center mb-6 animate-bounce">
                                    <Search size={40} className="text-indigo-400" strokeWidth={2.5} />
                                </div>
                                <h3 className="font-black text-3xl tracking-tight text-slate-700 mb-3">Auditoría WMS</h3>
                                <p className="font-bold text-slate-500 max-w-sm">
                                    Selecciona una Nota de Venta de la lista para inspeccionar toda su trazabilidad en tiempo real.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SalesStatus;
