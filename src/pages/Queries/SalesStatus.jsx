import React, { useState, useEffect, useRef } from 'react';
import {
    Search, FileText, Truck, Box, CheckCircle, Clock,
    AlertCircle, Calendar, User, ArrowRight, Activity,
    Package, MapPin, Zap
} from 'lucide-react';
import { supabase } from '../../supabase';
import { toast } from 'sonner';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

const SalesStatus = () => {
    const queryClient = useQueryClient();
    const containerRef = useRef(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedTerm, setDebouncedTerm] = useState('');
    const [selectedNVId, setSelectedNVId] = useState(null);

    useGSAP(() => {
        gsap.from(containerRef.current, {
            y: 20,
            opacity: 0,
            duration: 0.4,
            ease: 'power3.out',
            clearProps: 'all'
        });
    }, { scope: containerRef });

    // Búsqueda con debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchTerm.length >= 3) {
                setDebouncedTerm(searchTerm);
            } else if (searchTerm.length === 0) {
                setDebouncedTerm('');
                setSelectedNVId(null);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    // TanStack Query para Resultados
    const { data: results = [], isLoading: loading } = useQuery({
        queryKey: ['sales_search', debouncedTerm],
        queryFn: async () => {
            if (!debouncedTerm) return [];
            const { data, error } = await supabase
                .from('tms_nv_diarias')
                .select('*')
                .or(`nv.ilike.%${debouncedTerm}%,cliente.ilike.%${debouncedTerm}%,codigo_producto.ilike.%${debouncedTerm}%`)
                .order('fecha_emision', { ascending: false })
                .limit(20);

            if (error) throw error;
            return data || [];
        },
        enabled: !!debouncedTerm,
        select: (data) => {
            if (data.length === 1 && data[0].nv.toLowerCase() === debouncedTerm.toLowerCase()) {
                setTimeout(() => setSelectedNVId(data[0].nv), 0);
            }
            return data;
        },
    });

    // TanStack Query para Detalles (incluyendo entrega)
    const { data: selectedNV, isLoading: loadingDetails } = useQuery({
        queryKey: ['sales_details', selectedNVId],
        queryFn: async () => {
            if (!selectedNVId) return null;
            
            const nvBase = results.find(r => r.nv === selectedNVId) || null;
            
            const { data: entrega, error } = await supabase
                .from('tms_entregas')
                .select(`
                    *,
                    tms_rutas ( nombre, fecha_inicio ),
                    tms_conductores ( nombre, apellido, vehiculo_patente )
                `)
                .eq('nv', selectedNVId)
                .maybeSingle();

            if (error && error.code !== 'PGRST116') {
            }

            return {
                ...nvBase,
                entrega: entrega || null
            };
        },
        enabled: !!selectedNVId && results.length > 0,
    });

    const selectedNVRef = useRef(null);
    useEffect(() => {
        selectedNVRef.current = selectedNV;
    }, [selectedNV]);

    // Sincronización en Tiempo Real
    useEffect(() => {
        const channel = supabase
            .channel('sales_status_realtime')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'tms_nv_diarias' }, (payload) => {
                queryClient.invalidateQueries({ queryKey: ['sales_search'] });
                if (selectedNVRef.current && selectedNVRef.current.nv === payload.new.nv) {
                    queryClient.invalidateQueries({ queryKey: ['sales_details', payload.new.nv] });
                    toast('Actualización WMS', {
                        description: `El estado cambió a ${payload.new.estado}`,
                        icon: <Activity className="text-wms-neon" />,
                        style: { background: '#1e293b', border: '1px solid #10b981', color: '#f8fafc' }
                    });
                }
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'tms_entregas' }, (payload) => {
                if (selectedNVRef.current && selectedNVRef.current.nv === payload.new.nv) {
                    queryClient.invalidateQueries({ queryKey: ['sales_details', selectedNVRef.current.nv] });
                    toast('Actualización Logística', {
                        description: `Datos de ruta/despacho modificados para la NV`,
                        icon: <Truck className="text-wms-neon animate-bounce" />,
                        style: { background: '#1e293b', border: '1px solid #10b981', color: '#f8fafc' }
                    });
                }
            })
            .subscribe((status, err) => {
              if (err) console.error('Realtime subscription error:', err);
            });

        return () => {
            supabase.removeChannel(channel);
        };
    }, [queryClient]);

    const handleClear = () => {
        setSearchTerm('');
        setDebouncedTerm('');
        setSelectedNVId(null);
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
                                        : 'border-slate-200 text-slate-700'
                                }`}>
                                <step.icon size={22} strokeWidth={isCompleted || isCurrent ? 2.5 : 2} />
                            </div>

                            <p className={`text-[9px] md:text-[11px] font-black uppercase tracking-wider mt-3 text-center transition-colors ${isCompleted ? 'text-emerald-700' : isCurrent ? 'text-indigo-700' : 'text-slate-500'
                                }`}>
                                {step.label}
                            </p>

                            {step.date && !isPending && (
                                <span className="text-[9px] text-slate-500 font-bold mt-1 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
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
        <div ref={containerRef} className="h-full flex flex-col font-sans p-2 md:p-6 bg-slate-50 min-h-screen text-slate-700">

            {/* HEADER WMS AESTHETIC INTEGRADO CON BÚSQUEDA */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 bg-white backdrop-blur-xl p-5 rounded-3xl border border-slate-200 shadow-2xl relative z-20 overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-wms-neon/10 rounded-full blur-3xl"></div>
                <div className="flex items-center gap-5 relative z-10">
                    <div className="bg-wms-neon/10 p-4 rounded-2xl border border-wms-neon/20 shadow-neon-green text-wms-neon transform hover:scale-105 transition-transform">
                        <Search size={28} strokeWidth={3} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tighter text-slate-900 leading-none mb-1">
                            CONSULTAS <span className="text-wms-neon">WMS</span>
                        </h1>
                        <div className="flex items-center gap-1.5 text-slate-500 font-bold text-[10px] md:text-xs tracking-wider uppercase">
                            <Activity size={14} className="text-wms-neon" />
                            <span>Trazabilidad de Venta • En Vivo</span>
                        </div>
                    </div>
                </div>

                {/* Barra de Búsqueda Flotante */}
                <div className="mt-5 md:mt-0 w-full md:w-[450px] relative group z-10">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-wms-neon border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            <Search className="text-slate-500 group-focus-within:text-wms-neon transition-colors" size={20} strokeWidth={2.5} />
                        )}
                    </div>
                    <input
                        type="text"
                        placeholder="Buscar por N.V, Cliente o SKU..."
                        className="w-full pl-12 pr-12 py-3.5 bg-white border border-slate-200 rounded-xl text-slate-900 font-bold tracking-wide transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {searchTerm && (
                        <button
                            onClick={handleClear}
                            className="absolute inset-y-0 right-4 flex items-center text-slate-500 hover:text-wms-alert bg-white shadow-sm my-2 px-1.5 rounded-lg border border-slate-200"
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
                <div className="lg:col-span-4 flex flex-col bg-white backdrop-blur-xl rounded-[2rem] border border-slate-200 shadow-2xl overflow-hidden relative">
                    <div className="p-5 border-b border-slate-200 bg-slate-50/50 z-10 flex justify-between items-center sticky top-0">
                        <h3 className="font-black text-slate-900 tracking-tight flex items-center gap-2">
                            <Clock size={18} className="text-wms-neon" />
                            COINCIDENCIAS
                        </h3>
                        <span className="bg-wms-neon/10 border border-wms-neon/20 text-wms-neon font-black px-3 py-1 rounded-lg text-xs shadow-neon-green">
                            {results.length} res.
                        </span>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar bg-slate-50/20">
                        {results.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-slate-500 p-6 text-center">
                                <Zap size={64} className="mb-4 opacity-50 text-wms-neon" />
                                <p className="font-black text-xl tracking-tight text-slate-500">EN ESPERA</p>
                                <p className="text-xs font-bold mt-1 opacity-60">Ingresa una Nota de Venta para rastrear</p>
                            </div>
                        ) : (
                            results.map(item => {
                                const isSelected = selectedNVId === item.nv;
                                return (
                                    <div
                                        key={item.id}
                                        onClick={() => setSelectedNVId(item.nv)}
                                        className={`p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 relative overflow-hidden group ${isSelected
                                                ? 'bg-wms-neon/10 border-wms-neon shadow-neon-green'
                                                : 'bg-slate-50/50 border-slate-200 hover:border-wms-neon/50'
                                            }`}
                                    >
                                        {isSelected && <div className="absolute left-0 top-0 bottom-0 w-2 bg-wms-neon rounded-l-2xl"></div>}

                                        <div className="flex justify-between items-start mb-2">
                                            <span className={`text-xl font-black tracking-tight ${isSelected ? 'text-wms-neon ml-1' : 'text-slate-900'}`}>
                                                #{item.nv}
                                            </span>
                                            <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest border ${getStatusColor(item.estado)}`}>
                                                {item.estado}
                                            </span>
                                        </div>
                                        <p className="text-sm text-slate-500 font-bold truncate mb-3">{item.cliente}</p>

                                        <div className="flex items-center justify-between text-xs font-bold mt-3">
                                            <div className="flex items-center gap-1.5 text-slate-500 bg-white/80 px-2 py-1 rounded-md border border-slate-200">
                                                <Calendar size={12} />
                                                <span>{new Date(item.fecha_emision).toLocaleDateString()}</span>
                                            </div>
                                            {isSelected && <ArrowRight size={16} className="text-wms-neon animate-pulse" />}
                                        </div>
                                    </div>
                                )
                            })
                        )}
                    </div>
                </div>

                {/* ====== PANEL CENTRAL DETALLES (8 Cols) ====== */}
                <div className="lg:col-span-8 bg-white backdrop-blur-xl rounded-[2rem] shadow-2xl border border-slate-200 overflow-hidden flex flex-col relative w-full h-full">
                    {loadingDetails ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-500 bg-slate-50/20 p-10">
                            <div className="w-16 h-16 border-4 border-slate-200 border-t-wms-neon rounded-full animate-spin mb-4"></div>
                            <p className="font-bold">Cargando detalles...</p>
                        </div>
                    ) : selectedNV ? (
                        <div className="flex-1 overflow-y-auto custom-scrollbar animate-in fade-in slide-in-from-right-4 duration-300">

                            {/* Dark Header de Pedido */}
                            <div className="bg-slate-50 p-8 shadow-inner relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-96 h-96 bg-wms-neon/10 rounded-full blur-3xl -mr-24 -mt-24 pointer-events-none"></div>

                                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                                    <div>
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="bg-wms-neon/20 p-2 rounded-xl border border-wms-neon/30">
                                                <FileText size={24} className="text-wms-neon" />
                                            </div>
                                            <span className="text-wms-neon font-black tracking-widest uppercase text-xs">Información de N.V.</span>
                                        </div>
                                        <h2 className="text-6xl font-black tracking-tighter text-slate-900 mb-2 ml-[-3px]">#{selectedNV.nv}</h2>
                                        <p className="text-slate-700 font-bold text-lg flex items-center gap-2">
                                            <User size={18} className="text-wms-neon" />
                                            {selectedNV.cliente}
                                        </p>
                                    </div>

                                    <div className="flex flex-col items-end gap-3 w-full md:w-auto mt-4 md:mt-0">
                                        <div className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest border border-white/20 shadow-lg ${getStatusColor(selectedNV.estado).replace('bg-', 'bg-white text-slate-900 border-')}`}>
                                            <span className="opacity-70 mr-2">ESTADO ACTUAL:</span>
                                            {selectedNV.estado}
                                        </div>
                                        <div className="text-right bg-white/80 p-3.5 rounded-xl border border-slate-300/80 backdrop-blur-sm w-full md:w-auto flex flex-col items-end">
                                            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1 flex items-center gap-1.5">
                                                <Calendar size={12} /> Creado el
                                            </p>
                                            <p className="font-mono text-lg font-bold text-slate-900 tracking-wide">
                                                {new Date(selectedNV.fecha_emision).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Timeline Logístico */}
                            <div className="p-8 border-b border-slate-200 bg-slate-50/30">
                                <h4 className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest mb-8">
                                    <Activity size={14} className="text-wms-neon" /> Trazabilidad Operativa
                                </h4>
                                <Timeline data={selectedNV} />
                            </div>

                            {/* Cards de Detalle Expandido */}
                            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8 bg-white">

                                {/* 1. PRODUCTO */}
                                <div className="bg-slate-50/50 rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-neon-green transition-shadow">
                                    <h4 className="font-black text-slate-900 flex items-center gap-2 mb-6 text-lg tracking-tight">
                                        <Box size={22} className="text-wms-neon" />
                                        Especificaciones del Ítem
                                    </h4>
                                    <div className="space-y-4">
                                        <div className="bg-white/80 p-4 rounded-xl border border-slate-200 flex items-center gap-4">
                                            <div className="w-12 h-12 bg-slate-50 rounded-xl shadow-sm flex items-center justify-center font-bold text-slate-500 border border-slate-200">
                                                SKU
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Código Único</p>
                                                <span className="font-mono font-black text-slate-900 text-lg tracking-tight">{selectedNV.codigo_producto}</span>
                                            </div>
                                        </div>

                                        <div>
                                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 pl-1">Descripción Registrada</p>
                                            <p className="font-bold text-slate-700 bg-white/80 border border-slate-200 p-3 rounded-xl leading-snug">{selectedNV.descripcion_producto}</p>
                                        </div>

                                        <div className="flex items-center justify-between bg-wms-neon/10 p-4 rounded-xl border border-wms-neon/20">
                                            <span className="font-black text-wms-neon text-xs uppercase tracking-widest">Cant. Solicitada</span>
                                            <div className="flex items-baseline gap-1 bg-slate-50 px-3 py-1 rounded-lg shadow-sm border border-wms-neon/30">
                                                <span className="font-black text-2xl text-wms-neon">{selectedNV.cantidad}</span>
                                                <span className="font-bold text-wms-neon/70 text-[10px] uppercase tracking-wider">{selectedNV.unidad}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* 2. LOGÍSTICA / ENTREGA */}
                                <div className="bg-slate-50/50 rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-neon-green transition-shadow relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-wms-neon/5 rounded-bl-full -z-10"></div>

                                    <h4 className="font-black text-slate-900 flex items-center gap-2 mb-6 text-lg tracking-tight">
                                        <Truck size={22} className="text-wms-neon" />
                                        Manifiesto de Despacho
                                    </h4>

                                    {selectedNV.entrega ? (
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="bg-white/80 p-4 rounded-xl border border-slate-200 flex flex-col justify-center">
                                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Bultos Tot.</p>
                                                    <p className="font-black text-3xl text-slate-900">{selectedNV.entrega.bultos || '0'}</p>
                                                </div>
                                                <div className="bg-white/80 p-4 rounded-xl border border-slate-200 flex flex-col justify-center">
                                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Vol / Peso</p>
                                                    <p className="font-black text-3xl text-slate-900 flex items-baseline gap-1">
                                                        {selectedNV.entrega.peso_kg || '0'}
                                                        <span className="text-xs text-slate-500 tracking-wider">KG</span>
                                                    </p>
                                                </div>
                                            </div>

                                            {selectedNV.entrega.tms_rutas && (
                                                <div className="bg-wms-neon/10 p-4 rounded-xl border border-wms-neon/20 flex items-center gap-4 group">
                                                    <div className="bg-slate-50 p-2.5 rounded-xl border border-wms-neon/30 text-wms-neon shadow-sm group-hover:scale-110 transition-transform">
                                                        <MapPin size={24} strokeWidth={2.5} />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-black text-wms-neon/70 uppercase tracking-widest mb-0.5">Ruta Operativa</p>
                                                        <p className="font-black text-wms-neon text-lg leading-tight">{selectedNV.entrega.tms_rutas.nombre}</p>
                                                    </div>
                                                </div>
                                            )}

                                            {selectedNV.entrega.tms_conductores && (
                                                <div className="flex items-center gap-4 bg-white/80 p-4 rounded-xl border border-slate-200">
                                                    <div className="w-12 h-12 bg-slate-50 border border-slate-200 text-wms-neon rounded-xl flex items-center justify-center font-black shadow-sm">
                                                        <User size={20} />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Chofer Asignado</p>
                                                        <p className="font-black text-slate-900 text-sm">
                                                            {selectedNV.entrega.tms_conductores.nombre} {selectedNV.entrega.tms_conductores.apellido}
                                                        </p>
                                                        <div className="bg-slate-50 text-slate-500 border border-slate-200 px-2 py-0.5 rounded text-[10px] font-mono font-bold inline-block mt-1">
                                                            PT: {selectedNV.entrega.tms_conductores.vehiculo_patente}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="h-full min-h-[220px] flex flex-col items-center justify-center text-slate-500 bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-200 p-6 text-center">
                                            <div className="w-16 h-16 bg-white shadow-sm rounded-full flex items-center justify-center mb-4 border border-slate-200">
                                                <Package size={28} className="text-slate-500" />
                                            </div>
                                            <p className="font-black text-slate-700 text-base tracking-tight">Sin Datos de Despacho</p>
                                            <p className="text-xs font-bold text-slate-500 mt-2 max-w-[200px]">El pedido aún no ha sido planificado para entrega en ruta.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-500 bg-slate-50/20 p-10 relative">
                            <div className="absolute inset-0 flex items-center justify-center opacity-[0.02] pointer-events-none">
                                <Search size={400} />
                            </div>
                            <div className="relative z-10 text-center flex flex-col items-center">
                                <div className="w-24 h-24 bg-white rounded-full shadow-xl shadow-wms-neon/10 border border-wms-neon/20 flex items-center justify-center mb-6 animate-bounce">
                                    <Search size={40} className="text-wms-neon" strokeWidth={2.5} />
                                </div>
                                <h3 className="font-black text-3xl tracking-tight text-slate-900 mb-3">Auditoría WMS</h3>
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
