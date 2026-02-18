import React, { useState, useEffect } from 'react';
import { 
  History, Search, RefreshCw, Calendar, 
  Shield, Mail, User, Loader2, Users, LogOut, Clock, Activity 
} from 'lucide-react';
import { supabase } from '../../supabase';
import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

const LoginHistory = () => {
  const [logs, setLogs] = useState([]);
  const [activeUsers, setActiveUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [view, setView] = useState('active'); // 'active' | 'history'

  useEffect(() => {
    fetchData();
    
    // Subscribe to realtime changes for active users
    const channel = supabase
      .channel('active_users_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tms_usuarios_activos' }, () => {
        fetchActiveUsers();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([fetchActiveUsers(), fetchLogs()]);
    setLoading(false);
    setRefreshing(false);
  };

  const fetchActiveUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('tms_usuarios_activos')
        .select('*')
        .order('ultima_actividad', { ascending: false });

      if (error) throw error;
      setActiveUsers(data || []);
    } catch (error) {
      console.error('Error fetching active users:', error);
    }
  };

  const fetchLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('tms_accesos')
        .select('*')
        .order('fecha', { ascending: false })
        .limit(100);

      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error('Error fetching access logs:', error);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleForceLogout = async (userId, userName) => {
    if (!window.confirm(`¿Estás seguro de cerrar la sesión de ${userName}?`)) return;

    try {
      // Opción 1: Usar RPC si está configurado (más seguro)
      // const { error } = await supabase.rpc('force_user_logout', { user_id_param: userId });
      
      // Opción 2: Eliminación directa (si RLS lo permite)
      const { error } = await supabase
        .from('tms_usuarios_activos')
        .delete()
        .eq('usuario_id', userId);

      if (error) throw error;
      
      alert(`Sesión de ${userName} cerrada exitosamente.`);
      fetchActiveUsers();
    } catch (error) {
      console.error('Error forcing logout:', error);
      alert('Error al cerrar sesión: ' + error.message);
    }
  };

  const filteredLogs = logs.filter(log => 
    log.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.rol?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredActiveUsers = activeUsers.filter(user => 
    user.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.rol?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleBadgeColor = (rol) => {
    switch (rol?.toUpperCase()) {
      case 'ADMIN': return 'bg-red-50 text-red-700 border-red-100';
      case 'SUPERVISOR': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'OPERADOR': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      default: return 'bg-blue-50 text-blue-700 border-blue-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <History className="text-orange-600" />
            Control de Accesos
          </h1>
          <p className="text-slate-500 text-sm mt-1">Monitoreo de usuarios y registro de ingresos</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleRefresh}
            className={`p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors ${refreshing ? 'animate-spin' : ''}`}
            title="Actualizar lista"
          >
            <RefreshCw size={20} />
          </button>
        </div>
      </div>

      {/* Tabs & Filters */}
      <div className="flex flex-col gap-4">
        <div className="flex gap-2 border-b border-slate-200">
          <button
            onClick={() => setView('active')}
            className={`px-4 py-2 font-bold text-sm flex items-center gap-2 border-b-2 transition-colors ${
              view === 'active' 
                ? 'border-orange-500 text-orange-600' 
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Activity size={16} />
            Usuarios Activos
            <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-xs">
              {activeUsers.length}
            </span>
          </button>
          <button
            onClick={() => setView('history')}
            className={`px-4 py-2 font-bold text-sm flex items-center gap-2 border-b-2 transition-colors ${
              view === 'history' 
                ? 'border-orange-500 text-orange-600' 
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <History size={16} />
            Historial
          </button>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center">
          <div className="flex-1 relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text"
              placeholder="Buscar por usuario, email o rol..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 size={40} className="animate-spin text-orange-500" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            {view === 'active' ? (
              // ACTIVE USERS TABLE
              filteredActiveUsers.length === 0 ? (
                <div className="text-center py-20 text-slate-400">
                  <Users size={48} className="mx-auto mb-4 opacity-20" />
                  <p>No hay usuarios activos en este momento</p>
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                      <th className="px-6 py-4">Usuario</th>
                      <th className="px-6 py-4">Rol</th>
                      <th className="px-6 py-4">Última Actividad</th>
                      <th className="px-6 py-4">Tiempo Activo</th>
                      <th className="px-6 py-4">Módulo</th>
                      <th className="px-6 py-4 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredActiveUsers.map((user) => (
                      <tr key={user.usuario_id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="relative">
                              <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-xs">
                                {user.nombre?.charAt(0).toUpperCase()}
                              </div>
                              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></span>
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-slate-700">{user.nombre}</p>
                              <p className="text-xs text-slate-400">ID: {user.usuario_id?.substring(0, 8)}...</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${getRoleBadgeColor(user.rol)}`}>
                            {user.rol}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Clock size={14} className="text-slate-400" />
                            {format(new Date(user.ultima_actividad), "HH:mm:ss", { locale: es })}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-slate-600 font-mono bg-slate-100 px-2 py-1 rounded">
                            {formatDistanceToNow(new Date(user.ultima_actividad), { locale: es, addSuffix: false })}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-slate-500">
                            {user.modulo_actual || 'General'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleForceLogout(user.usuario_id, user.nombre)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors"
                            title="Forzar cierre de sesión"
                          >
                            <LogOut size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )
            ) : (
              // HISTORY TABLE
              filteredLogs.length === 0 ? (
                <div className="text-center py-20 text-slate-400">
                  <History size={48} className="mx-auto mb-4 opacity-20" />
                  <p>No se encontraron registros de acceso</p>
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                      <th className="px-6 py-4">Fecha y Hora</th>
                      <th className="px-6 py-4">Usuario</th>
                      <th className="px-6 py-4">Email</th>
                      <th className="px-6 py-4">Rol</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                            <Calendar size={16} className="text-slate-400" />
                            {format(new Date(log.fecha), "d MMM yyyy, HH:mm:ss", { locale: es })}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs">
                              {log.nombre?.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-sm font-semibold text-slate-700">{log.nombre}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-sm text-slate-500">
                            <Mail size={14} />
                            {log.email}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${getRoleBadgeColor(log.rol)}`}>
                            {log.rol}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginHistory;
