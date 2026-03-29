import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabase';
import { History, User, Database, Calendar, Search, FileText } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const UploadHistory = () => {
    const { user } = useAuth();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('tms_historial_cargas')
                .select('*')
                .order('fecha_carga', { ascending: false })
                .limit(100);

            if (error) throw error;
            setHistory(data || []);
        } catch (err) {
            console.error("Error al obtener historial:", err);
        } finally {
            setLoading(false);
        }
    };

    // Si no es admin, no debería ver esto, pero por si acaso bloqueamos la vista
    if (user?.rol !== 'ADMIN') {
        return (
            <div className="flex flex-col items-center justify-center h-96 text-slate-500">
                <Database size={48} className="mb-4 opacity-50" />
                <h2 className="text-xl font-bold">Acceso Denegado</h2>
                <p>Solo los administradores pueden ver el historial de cargas.</p>
            </div>
        );
    }

    const filteredHistory = history.filter(item => 
        item.usuario_nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.modulo.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <History className="text-orange-600" />
                        Historial de Subida de Datos
                    </h1>
                    <p className="text-slate-500 text-sm">Auditoría de quién, cuándo y qué se actualizó en el sistema.</p>
                </div>
                
                <div className="relative w-full md:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Buscar usuario o módulo..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl outline-none focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all font-medium text-slate-700 placeholder-slate-400 shadow-sm"
                    />
                </div>
            </div>

            <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/40 border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50/80 text-slate-400 uppercase text-[10px] tracking-widest font-black border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4">Fecha y Hora</th>
                                <th className="px-6 py-4">Usuario</th>
                                <th className="px-6 py-4">Módulo</th>
                                <th className="px-6 py-4 text-center">T. Registros</th>
                                <th className="px-6 py-4 text-center text-emerald-600">Nuevos</th>
                                <th className="px-6 py-4 text-center text-blue-600">Actualizados</th>
                                <th className="px-6 py-4 text-center text-rose-600">Errores</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-12 text-center text-slate-400">
                                        Cargando historial...
                                    </td>
                                </tr>
                            ) : filteredHistory.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-12 text-center text-slate-400">
                                        No hay registros de cargas aún.
                                    </td>
                                </tr>
                            ) : (
                                filteredHistory.map((row) => (
                                    <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2 text-slate-600 font-medium">
                                                <Calendar size={14} className="text-slate-400" />
                                                {new Date(row.fecha_carga).toLocaleString('es-ES', { 
                                                    day: '2-digit', month: '2-digit', year: 'numeric', 
                                                    hour: '2-digit', minute:'2-digit' 
                                                })}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center">
                                                    <User size={12} className="text-orange-600" />
                                                </div>
                                                <span className="font-bold text-slate-700">{row.usuario_nombre}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-medium text-xs">
                                                <FileText size={12} />
                                                {row.modulo}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center font-mono font-bold text-slate-700">
                                            {row.registros_totales}
                                        </td>
                                        <td className="px-6 py-4 text-center font-mono font-bold text-emerald-600 bg-emerald-50/30">
                                            {row.registros_nuevos > 0 ? `+${row.registros_nuevos}` : '-'}
                                        </td>
                                        <td className="px-6 py-4 text-center font-mono font-bold text-blue-600 bg-blue-50/30">
                                            {row.registros_actualizados > 0 ? row.registros_actualizados : '-'}
                                        </td>
                                        <td className="px-6 py-4 text-center font-mono font-bold text-rose-600 bg-rose-50/30">
                                            {row.registros_error > 0 ? row.registros_error : '-'}
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
};

export default UploadHistory;