import React, { useState, useEffect, useRef, useMemo } from 'react';
import { supabase } from '../../supabase';
import { 
    History, 
    User, 
    Database, 
    Calendar, 
    Search, 
    FileText, 
    TrendingUp, 
    AlertCircle, 
    CheckCircle2, 
    RefreshCw,
    ArrowUpRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

const UploadHistory = () => {
    const containerRef = useRef();
    const { user } = useAuth();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [refreshing, setRefreshing] = useState(false);
    
    // Filtros de fecha
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    useEffect(() => {
        fetchHistory();

        // Suscripción en tiempo real para "detectar" nuevas subidas automáticamente
        const channel = supabase
            .channel('realtime-uploads')
            .on('postgres_changes', 
                { event: 'INSERT', schema: 'public', table: 'tms_historial_cargas' }, 
                (payload) => {
                    // Añadir el nuevo registro al inicio del estado local
                    setHistory(prev => [payload.new, ...prev].slice(0, 100));
                    
                    // Opcional: Podríamos mostrar un toast o notificación aquí
                }
            )
            .subscribe((status, err) => {
              if (err) console.error('Realtime subscription error:', err);
            });

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    useEffect(() => {
        fetchHistory();
    }, [startDate, endDate]);

    const fetchHistory = async () => {
        if (!refreshing) setLoading(true);
        try {
            let query = supabase
                .from('tms_historial_cargas')
                .select('*')
                .order('fecha_carga', { ascending: false });

            if (startDate) {
                query = query.gte('fecha_carga', `${startDate}T00:00:00`);
            }
            if (endDate) {
                query = query.lte('fecha_carga', `${endDate}T23:59:59`);
            }

            const { data, error } = await query.limit(100);

            if (error) throw error;
            setHistory(data || []);
        } catch (_) {
            console.error('Upload history fetch error:', _);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleRefresh = () => {
        fetchHistory();
    };

    const clearFilters = () => {
        setSearchTerm('');
        setStartDate('');
        setEndDate('');
    };

    useGSAP(() => {
        gsap.from(".animate-in", {
            y: 20,
            opacity: 0,
            duration: 0.6,
            stagger: 0.1,
            ease: "power3.out"
        });
    }, { scope: containerRef });

    // Estadísticas calculadas
    const stats = useMemo(() => {
        const total = history.length;
        const totalRegistros = history.reduce((acc, curr) => acc + (curr.registros_totales || 0), 0);
        const totalErrores = history.reduce((acc, curr) => acc + (curr.registros_error || 0), 0);
        const hoy = new Date().toLocaleDateString();
        const cargasHoy = history.filter(item => new Date(item.fecha_carga).toLocaleDateString() === hoy).length;

        return { total, totalRegistros, totalErrores, cargasHoy };
    }, [history]);

    if (user?.rol !== 'ADMIN') {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-slate-50 text-slate-500">
                <div className="w-20 h-20 bg-white rounded-3xl shadow-xl flex items-center justify-center mb-6">
                    <Database size={40} className="text-slate-300" />
                </div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Acceso Denegado</h2>
                <p className="font-bold text-slate-400 mt-2">Solo administradores pueden auditar el historial.</p>
            </div>
        );
    }

    const filteredHistory = history.filter(item => 
        item.usuario_nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.modulo.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div ref={containerRef} className="bg-slate-50 min-h-screen p-8 space-y-8 font-sans">
            
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 animate-in">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-orange-200">
                            <History size={20} />
                        </div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Historial de Auditoría</h1>
                    </div>
                    <p className="text-slate-500 font-bold text-sm ml-13">Control centralizado de cargas masivas y actualizaciones de base de datos.</p>
                </div>
                
                <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                    {/* Buscador */}
                    <div className="relative flex-1 min-w-[280px]">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                            type="text" 
                            placeholder="Buscar por usuario o módulo..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/5 transition-all font-bold text-slate-700 placeholder-slate-400 shadow-sm"
                        />
                    </div>

                    {/* Controles de Fecha */}
                    <div className="flex items-center gap-2 bg-white p-1.5 border border-slate-200 rounded-2xl shadow-sm">
                        <div className="flex items-center gap-2 px-3">
                            <Calendar size={16} className="text-slate-400" />
                            <input 
                                type="date" 
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="bg-transparent border-none outline-none text-xs font-black text-slate-600 uppercase tracking-tighter cursor-pointer"
                            />
                        </div>
                        <div className="h-4 w-[1px] bg-slate-200"></div>
                        <div className="flex items-center gap-2 px-3">
                            <input 
                                type="date" 
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="bg-transparent border-none outline-none text-xs font-black text-slate-600 uppercase tracking-tighter cursor-pointer"
                            />
                        </div>
                        {(startDate || endDate || searchTerm) && (
                            <button 
                                onClick={clearFilters}
                                className="ml-2 p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-rose-500 transition-colors"
                                title="Limpiar filtros"
                            >
                                <RefreshCw size={14} />
                            </button>
                        )}
                    </div>

                    <button 
                        onClick={handleRefresh}
                        disabled={refreshing}
                        className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-600 hover:text-orange-600 hover:border-orange-200 hover:bg-orange-50 transition-all shadow-sm group"
                    >
                        <RefreshCw size={20} className={refreshing ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'} />
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in">
                <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm group hover:border-orange-200 transition-all">
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600">
                            <TrendingUp size={24} />
                        </div>
                        <ArrowUpRight size={18} className="text-slate-300" />
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Cargas Totales</p>
                    <h3 className="text-3xl font-black text-slate-900">{stats.total}</h3>
                </div>

                <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm group hover:border-blue-200 transition-all">
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                            <Database size={24} />
                        </div>
                        <ArrowUpRight size={18} className="text-slate-300" />
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Registros Procesados</p>
                    <h3 className="text-3xl font-black text-slate-900">{stats.totalRegistros.toLocaleString()}</h3>
                </div>

                <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm group hover:border-emerald-200 transition-all">
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                            <CheckCircle2 size={24} />
                        </div>
                        <ArrowUpRight size={18} className="text-slate-300" />
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Cargas de Hoy</p>
                    <h3 className="text-3xl font-black text-slate-900">{stats.cargasHoy}</h3>
                </div>

                <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm group hover:border-rose-200 transition-all">
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-600">
                            <AlertCircle size={24} />
                        </div>
                        <ArrowUpRight size={18} className="text-slate-300" />
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Errores Detectados</p>
                    <h3 className="text-3xl font-black text-slate-900">{stats.totalErrores}</h3>
                </div>
            </div>

            {/* Table Section */}
            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/40 overflow-hidden animate-in">
                <div className="overflow-x-auto overflow-y-auto max-h-[600px] custom-scrollbar">
                    <table className="w-full text-left text-sm border-separate border-spacing-0">
                        <thead className="sticky top-0 z-20 bg-slate-50/95 backdrop-blur-md text-slate-400 uppercase text-[10px] tracking-[0.2em] font-black border-b border-slate-200">
                            <tr>
                                <th className="px-8 py-5 border-b border-slate-200">Timestamp</th>
                                <th className="px-8 py-5 border-b border-slate-200">Operador</th>
                                <th className="px-8 py-5 border-b border-slate-200">Módulo</th>
                                <th className="px-8 py-5 border-b border-slate-200 text-center">Total</th>
                                <th className="px-8 py-5 border-b border-slate-200 text-center text-emerald-600">Éxito</th>
                                <th className="px-8 py-5 border-b border-slate-200 text-center text-blue-600">Modif.</th>
                                <th className="px-8 py-5 border-b border-slate-200 text-center text-rose-600">Fallas</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan="7" className="px-8 py-4">
                                            <div className="h-10 bg-slate-50 rounded-xl w-full"></div>
                                        </td>
                                    </tr>
                                ))
                            ) : filteredHistory.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center opacity-30">
                                            <Database size={48} className="mb-4" />
                                            <p className="font-black uppercase tracking-widest text-xs">Sin registros de actividad</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredHistory.map((row, idx) => (
                                    <tr key={row.id} className="hover:bg-slate-50/80 transition-all group/row">
                                        <td className="px-8 py-5 whitespace-nowrap border-b border-slate-50">
                                            <div className="flex flex-col">
                                                <span className="text-slate-900 font-black text-xs uppercase">
                                                    {new Date(row.fecha_carga).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                </span>
                                                <span className="text-[10px] font-bold text-slate-400">
                                                    {new Date(row.fecha_carga).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 border-b border-slate-50">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600 font-black text-xs group-hover/row:scale-110 transition-transform">
                                                    {row.usuario_nombre.charAt(0).toUpperCase()}
                                                </div>
                                                <span className="font-bold text-slate-700 tracking-tight">{row.usuario_nombre}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 border-b border-slate-50">
                                            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-600 font-black text-[10px] uppercase tracking-wider group-hover/row:bg-slate-900 group-hover/row:text-white transition-colors">
                                                <FileText size={12} />
                                                {row.modulo}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-center border-b border-slate-50">
                                            <span className="font-black text-slate-900 text-sm">{row.registros_totales}</span>
                                        </td>
                                        <td className="px-8 py-5 text-center border-b border-slate-50">
                                            <div className="inline-flex items-center justify-center min-w-[3rem] px-2 py-1 rounded-lg bg-emerald-50 text-emerald-600 font-black text-xs">
                                                {row.registros_nuevos > 0 ? `+${row.registros_nuevos}` : '0'}
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-center border-b border-slate-50">
                                            <div className="inline-flex items-center justify-center min-w-[3rem] px-2 py-1 rounded-lg bg-blue-50 text-blue-600 font-black text-xs">
                                                {row.registros_actualizados || '0'}
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-center border-b border-slate-50">
                                            <div className={`inline-flex items-center justify-center min-w-[3rem] px-2 py-1 rounded-lg font-black text-xs ${row.registros_error > 0 ? 'bg-rose-50 text-rose-600' : 'bg-slate-50 text-slate-300'}`}>
                                                {row.registros_error || '0'}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                    height: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #e2e8f0;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #cbd5e1;
                }
            `}</style>
        </div>
    );
};

export default UploadHistory;