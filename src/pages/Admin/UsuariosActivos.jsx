import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabase';
import { 
  Users, 
  Activity, 
  Clock, 
  Monitor, 
  Shield, 
  LogOut,
  RefreshCw,
  Search
} from 'lucide-react';

const UsuariosActivos = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUsuarios();

    // Suscribirse a cambios en tiempo real
    const channel = supabase
      .channel('usuarios_activos_monitor')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tms_usuarios_activos' }, () => {
        fetchUsuarios();
      })
      .subscribe();

    // Limpiar usuarios inactivos cada minuto
    const cleanupInterval = setInterval(() => {
      // Opcional: Llamar a función RPC de limpieza si existe
      // supabase.rpc('clean_inactive_users'); 
      fetchUsuarios();
    }, 60000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(cleanupInterval);
    };
  }, []);

  const fetchUsuarios = async () => {
    try {
      // Solo traer usuarios con actividad en los últimos 5 minutos
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      
      const { data, error } = await supabase
        .from('tms_usuarios_activos')
        .select('*')
        .gt('ultima_actividad', fiveMinutesAgo)
        .order('ultima_actividad', { ascending: false });

      if (error) throw error;
      setUsuarios(data || []);
    } catch (error) {
      console.error('Error fetching active users:', error);
    } finally {
      setLoading(false);
    }
  };

  const desconectarUsuario = async (userId) => {
    if (!confirm('¿Estás seguro de desconectar a este usuario?')) return;
    
    try {
      await supabase
        .from('tms_usuarios_activos')
        .delete()
        .eq('usuario_id', userId);
        
      // Aquí se podría implementar una lógica para invalidar token si fuera necesario
    } catch (error) {
      console.error('Error desconectando usuario:', error);
    }
  };

  const filteredUsers = usuarios.filter(u => 
    u.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.rol?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatTime = (isoString) => {
    if (!isoString) return '-';
    const date = new Date(isoString);
    return date.toLocaleTimeString();
  };

  const getTimeAgo = (isoString) => {
    if (!isoString) return '';
    const seconds = Math.floor((new Date() - new Date(isoString)) / 1000);
    if (seconds < 60) return 'Hace unos segundos';
    if (seconds < 3600) return `Hace ${Math.floor(seconds / 60)} min`;
    return `Hace ${Math.floor(seconds / 3600)} h`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Activity className="text-emerald-500" />
            Usuarios en Línea
          </h2>
          <p className="text-slate-500 text-sm">Monitoreo de sesiones activas en tiempo real</p>
        </div>
        
        <div className="flex gap-2">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar usuario..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:border-indigo-500"
            />
          </div>
          <button 
            onClick={fetchUsuarios}
            className="bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Tarjeta de Resumen */}
        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-xl p-6 text-white shadow-lg col-span-1 md:col-span-2 lg:col-span-3 flex justify-between items-center">
          <div>
            <h3 className="text-3xl font-bold">{usuarios.length}</h3>
            <p className="text-indigo-100 font-medium">Usuarios Conectados Ahora</p>
          </div>
          <div className="bg-white/20 p-3 rounded-full">
            <Users size={32} />
          </div>
        </div>

        {/* Lista de Usuarios */}
        {filteredUsers.map((user) => (
          <div key={user.usuario_id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all flex items-start justify-between relative overflow-hidden group">
            {/* Indicador de estado */}
            <div className={`absolute top-0 left-0 w-1 h-full ${
              user.estado === 'ONLINE' ? 'bg-emerald-500' : 'bg-amber-500'
            }`}></div>

            <div className="flex gap-3">
              <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 font-bold text-lg">
                {user.nombre?.charAt(0) || '?'}
              </div>
              <div>
                <h4 className="font-bold text-slate-800">{user.nombre}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium border border-slate-200">
                    {user.rol}
                  </span>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Monitor size={10} /> {user.modulo_actual || 'Navegando'}
                  </span>
                </div>
                <div className="mt-2 text-xs text-emerald-600 font-medium flex items-center gap-1">
                  <Clock size={10} /> Activo: {getTimeAgo(user.ultima_actividad)}
                </div>
              </div>
            </div>

            <button 
              onClick={() => desconectarUsuario(user.usuario_id)}
              className="text-slate-300 hover:text-red-500 p-1 rounded transition-colors opacity-0 group-hover:opacity-100"
              title="Forzar desconexión"
            >
              <LogOut size={18} />
            </button>
          </div>
        ))}

        {filteredUsers.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-400 bg-white rounded-xl border border-dashed border-slate-200">
            <Users size={48} className="mx-auto mb-2 opacity-20" />
            <p>No se encontraron usuarios activos</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UsuariosActivos;
