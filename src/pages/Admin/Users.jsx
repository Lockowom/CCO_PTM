import React, { useState, useRef } from 'react';
import {
  Users, UserPlus, Search, RefreshCw,
  MoreVertical, Edit, Trash2, Key, Crown, 
  Briefcase, Wrench, X, Save, Eye, EyeOff, Loader2, UserCheck
} from 'lucide-react';
import { supabase } from '../../supabase';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { toast } from 'sonner';

// Las contraseñas ahora se gestionan via Supabase Auth + RPCs server-side
// create_auth_user() y update_auth_password() en la BD

const UsersPage = () => {
  const queryClient = useQueryClient();
  const containerRef = useRef(null);
  const modalRef = useRef(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '', email: '', password: '', rol: '', activo: true, es_admin_delegado: false
  });
  const [showPassword, setShowPassword] = useState(false);

  useGSAP(() => {
    if (isModalOpen && modalRef.current) {
      gsap.from(modalRef.current, {
        scale: 0.95,
        opacity: 0,
        y: 20,
        duration: 0.3,
        ease: 'back.out(1.2)',
        clearProps: 'all'
      });
    }
  }, [isModalOpen]);

  // Query: Roles
  const { data: roles = [], isLoading: loadingRoles } = useQuery({
    queryKey: ['admin_roles'],
    queryFn: async () => {
      const { data, error } = await supabase.from('tms_roles').select('id, nombre').order('nombre');
      if (error) throw error;
      return data || [];
    }
  });

  // Query: Usuarios
  const { data: users = [], isLoading: loadingUsers } = useQuery({
    queryKey: ['admin_users'],
    queryFn: async () => {
      const { data, error } = await supabase.from('tms_usuarios').select('id, id_usuario, nombre, email, rol, activo, es_admin_delegado, created_at').order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    }
  });

  // Suscripciones Realtime (con debounce)
  React.useEffect(() => {
    let timers = {};
    const debounced = (key) => {
      if (timers[key]) clearTimeout(timers[key]);
      timers[key] = setTimeout(() => queryClient.invalidateQueries({ queryKey: [key] }), 800);
    };

    const channel = supabase.channel('admin_users_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tms_usuarios' }, () => {
        debounced('admin_users');
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tms_roles' }, () => {
        debounced('admin_roles');
      })
      .subscribe((status, err) => {
        if (err) console.error('Realtime subscription error:', err);
      });
    return () => {
      Object.values(timers).forEach(t => clearTimeout(t));
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  // Mutation: Guardar Usuario
  const saveMutation = useMutation({
    mutationFn: async (user) => {
      if (editingUser) {
        // Actualizar datos en tms_usuarios
        const updates = {
          nombre: user.nombre,
          email: user.email,
          rol: user.rol,
          activo: user.activo,
          es_admin_delegado: user.es_admin_delegado,
        };

        const { error } = await supabase.from('tms_usuarios').update(updates).eq('id', editingUser.id);
        if (error) throw error;

        // Si se cambió la contraseña, actualizar en Supabase Auth
        if (user.password && user.password.trim() !== '') {
          if (user.password.trim().length < 6) {
            throw new Error('La contraseña debe tener al menos 6 caracteres');
          }

          // Obtener auth_uid del usuario
          const { data: userData } = await supabase
            .from('tms_usuarios')
            .select('auth_uid')
            .eq('id', editingUser.id)
            .single();

          if (userData?.auth_uid) {
            // Actualizar contraseña en auth.users via RPC
            const { error: pwdError } = await supabase
              .rpc('update_auth_password', {
                p_auth_uid: userData.auth_uid,
                p_new_password: user.password.trim()
              });
            if (pwdError) throw new Error('Error al actualizar contraseña: ' + pwdError.message);
          }
        }
      } else {
        // Crear nuevo usuario
        if (!user.password || user.password.trim().length < 6) {
          throw new Error('La contraseña es obligatoria y debe tener al menos 6 caracteres');
        }

        // 1. Crear en Supabase Auth via RPC
        const { data: authUid, error: authError } = await supabase
          .rpc('create_auth_user', {
            p_email: user.email.toLowerCase(),
            p_password: user.password.trim()
          });

        if (authError) throw new Error('Error al crear usuario auth: ' + authError.message);

        // 2. Crear en tms_usuarios con auth_uid vinculado
        const legacyId = `USR-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
        const { error } = await supabase.from('tms_usuarios').insert([{
          id_usuario: legacyId,
          nombre: user.nombre,
          email: user.email.toLowerCase(),
          password_hash: 'managed_by_supabase_auth',
          auth_uid: authUid,
          rol: user.rol,
          activo: user.activo,
          es_admin_delegado: user.es_admin_delegado
        }]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin_users'] });
      toast.success(`Usuario ${editingUser ? 'actualizado' : 'creado'} exitosamente`, {
        style: { background: '#1e293b', border: '1px solid #10b981', color: '#f8fafc' }
      });
      setIsModalOpen(false);
    },
    onError: (err) => {
      toast.error('Error al guardar usuario: ' + err.message, {
        style: { background: '#1e293b', border: '1px solid #ef4444', color: '#f8fafc' }
      });
    }
  });

  // Mutation: Eliminar Usuario
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from('tms_usuarios').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin_users'] });
      toast.success('Usuario eliminado exitosamente');
    },
    onError: (err) => toast.error('Error al eliminar: ' + err.message)
  });

  const handleOpenModal = (user = null) => {
    setEditingUser(user);
    setShowPassword(false);
    setFormData({
      nombre: user?.nombre || '',
      email: user?.email || '',
      password: '',
      rol: user?.rol || '',
      activo: user ? user.activo : true,
      es_admin_delegado: user?.es_admin_delegado || false
    });
    setIsModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.nombre || !formData.email || !formData.rol) {
      toast.error('Completa los campos requeridos');
      return;
    }
    saveMutation.mutate(formData);
  };

  const handleDelete = (id) => {
    if (window.confirm('¿Eliminar este usuario permanentemente?')) {
      deleteMutation.mutate(id);
    }
  };

  const filteredUsers = React.useMemo(() => {
    return users.filter(user => {
      const matchSearch = !searchTerm || user.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) || user.email?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchRole = !roleFilter || user.rol === roleFilter;
      const matchStatus = !statusFilter || (statusFilter === 'active' ? user.activo : !user.activo);
      return matchSearch && matchRole && matchStatus;
    });
  }, [users, searchTerm, roleFilter, statusFilter]);

  const stats = React.useMemo(() => ({
    total: users.length,
    active: users.filter(u => u.activo).length,
    admins: users.filter(u => u.rol?.toUpperCase() === 'ADMIN' || u.es_admin_delegado).length,
    supervisors: users.filter(u => u.rol?.toUpperCase() === 'SUPERVISOR').length
  }), [users]);

  const getRoleBadgeColor = (rol) => {
    switch (rol?.toUpperCase()) {
      case 'ADMIN': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'SUPERVISOR': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'OPERADOR': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      default: return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    }
  };

  const getRoleIcon = (rol) => {
    switch (rol?.toUpperCase()) {
      case 'ADMIN': return <Crown size={14} />;
      case 'SUPERVISOR': return <Briefcase size={14} />;
      case 'OPERADOR': return <Wrench size={14} />;
      default: return <Users size={14} />;
    }
  };

  const StatCard = ({ icon, label, value, glowColor }) => (
    <div className="bg-white backdrop-blur-xl rounded-2xl p-3 sm:p-5 border border-slate-200 relative overflow-hidden group">
      <div className={`absolute top-0 right-0 w-24 h-24 bg-${glowColor}-500/10 rounded-full blur-2xl group-hover:bg-${glowColor}-500/20 transition-all`}></div>
      <div className="flex items-center gap-2 sm:gap-4 relative z-10">
        <div className={`p-2 sm:p-4 rounded-xl bg-slate-50 border border-slate-200 text-${glowColor}-400 shadow-sm`}>
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-[10px] sm:text-xs text-slate-500 font-bold uppercase tracking-wider mb-1 truncate">{label}</p>
          <p className="text-2xl sm:text-3xl font-black text-slate-900">{value}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div ref={containerRef} className="space-y-4 sm:space-y-8 bg-slate-50 min-h-[calc(100vh-80px)] p-3 sm:p-6 text-slate-700">
      
      {/* Background Decorativo */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden flex justify-center z-0">
        <div className="absolute top-[-10%] w-[800px] h-[400px] bg-indigo-500/10 blur-[100px] rounded-full"></div>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
        <div>
          <h1 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <div className="bg-indigo-500/10 p-2.5 rounded-xl border border-indigo-500/30 shadow-sm">
              <Users className="text-indigo-400" size={28} />
            </div>
            Control de <span className="text-indigo-400">Accesos</span>
          </h1>
          <p className="text-slate-500 text-sm mt-2 font-medium">Administración centralizada de usuarios y roles del sistema</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => queryClient.invalidateQueries({ queryKey: ['admin_users'] })}
            className="p-3 text-slate-500 hover:text-slate-900 bg-white border border-slate-200 hover:border-slate-600 rounded-xl transition-all shadow-sm"
            title="Actualizar lista"
          >
            <RefreshCw size={20} className={loadingUsers ? 'animate-spin text-indigo-400' : ''} />
          </button>
          <button
            onClick={() => handleOpenModal()}
            className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-black flex items-center gap-2 shadow-md transition-all active:scale-95"
          >
            <UserPlus size={20} />
            Nuevo Usuario
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 relative z-10">
        <StatCard icon={<Users size={24} />} label="Total Usuarios" value={stats.total} glowColor="indigo" />
        <StatCard icon={<UserCheck size={24} />} label="Activos" value={stats.active} glowColor="emerald" />
        <StatCard icon={<Crown size={24} />} label="Admins" value={stats.admins} glowColor="rose" />
        <StatCard icon={<Briefcase size={24} />} label="Supervisores" value={stats.supervisors} glowColor="amber" />
      </div>

      {/* Filters Bar */}
      <div className="bg-white backdrop-blur-xl p-3 rounded-2xl border border-slate-200 shadow-2xl flex flex-col md:flex-row gap-3 items-center sticky top-4 z-30">
        <div className="flex-1 relative w-full group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={20} />
          <input
            type="text"
            placeholder="Buscar por nombre, email o ID..."
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all text-slate-900 placeholder-slate-500 font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 custom-scrollbar">
          <select
            className="px-4 py-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 font-bold text-slate-700 cursor-pointer transition-colors"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="">Todos los roles</option>
            {roles.map(r => <option key={r.id} value={r.id}>{r.nombre}</option>)}
          </select>
          <select
            className="px-4 py-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 font-bold text-slate-700 cursor-pointer transition-colors"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">Todos los estados</option>
            <option value="active">Activos</option>
            <option value="inactive">Inactivos</option>
          </select>
        </div>
      </div>

      {/* Users Grid */}
      <div className="relative z-10">
        {loadingUsers || loadingRoles ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <div className="w-16 h-16 border-4 border-slate-200 border-t-indigo-500 rounded-full animate-spin"></div>
            <p className="text-slate-500 font-bold animate-pulse">Cargando directorio...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center bg-white rounded-3xl border-2 border-dashed border-slate-200">
            <div className="bg-slate-50 p-6 rounded-full mb-4 border border-slate-200">
              <Search size={48} className="text-slate-500" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">No se encontraron usuarios</h3>
            <p className="text-slate-500 mt-1">Intenta ajustar los filtros de búsqueda</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
            {filteredUsers.map(user => (
              <div key={user.id} className="group bg-white backdrop-blur-md rounded-3xl border border-slate-200 shadow-sm hover:shadow-2xl hover:border-slate-600 transition-all duration-300 overflow-hidden relative">
                {/* Background Pattern */}
                <div className={`h-24 w-full absolute top-0 left-0 transition-colors ${user.activo ? 'bg-gradient-to-b from-indigo-500/10 to-transparent' : 'bg-slate-100'}`}></div>

                <div className="p-4 sm:p-6 relative pt-6 sm:pt-8">
                  <div className="flex justify-between items-start mb-4">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black text-slate-900 border shadow-lg transform group-hover:scale-110 transition-transform duration-300
                      ${user.rol === 'ADMIN' ? 'bg-rose-500/20 border-rose-500/30 text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.2)]' :
                        user.rol === 'SUPERVISOR' ? 'bg-amber-500/20 border-amber-500/30 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)]' :
                          'bg-indigo-500/20 border-indigo-500/30 text-indigo-400 shadow-sm'}`}
                    >
                      {user.nombre?.charAt(0).toUpperCase()}
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${user.activo
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-200 shadow-sm'
                        : 'bg-slate-100 text-slate-500 border-slate-200'
                        }`}>
                        {user.activo ? 'Activo' : 'Inactivo'}
                      </span>

                      {(user.rol === 'ADMIN' || user.es_admin_delegado) && (
                        <span className={`p-1.5 rounded-lg border ${user.es_admin_delegado ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}`} title={user.es_admin_delegado ? "Administrador Delegado" : "Administrador"}>
                          <Crown size={14} />
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1 mb-6">
                    <h3 className="font-black text-xl text-slate-900 leading-tight truncate" title={user.nombre}>
                      {user.nombre}
                    </h3>
                    <p className="text-sm text-slate-500 truncate font-medium flex items-center gap-1">
                      {user.email}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 mb-6">
                    <div className={`flex-1 flex items-center gap-2 px-3 py-2 rounded-xl border ${getRoleBadgeColor(user.rol)}`}>
                      {getRoleIcon(user.rol)}
                      <span className="font-bold text-xs truncate">{roles.find(r => r.id === user.rol)?.nombre || user.rol}</span>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4 border-t border-slate-200">
                    <button
                      onClick={() => handleOpenModal(user)}
                      className="flex-1 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-900 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2"
                    >
                      <Edit size={16} /> Editar
                    </button>
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="p-2.5 text-slate-500 bg-slate-50 hover:bg-rose-500/10 border border-slate-200 hover:border-rose-500/30 hover:text-rose-400 rounded-xl transition-colors"
                      title="Eliminar usuario"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-50/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div ref={modalRef} className="bg-white border border-slate-200 rounded-[2rem] w-full max-w-lg shadow-2xl overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
            <div className="px-4 sm:px-8 py-4 sm:py-6 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <div>
                <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                  {editingUser ? 'Editar Perfil' : 'Nuevo Usuario'}
                </h2>
                <p className="text-slate-500 text-sm font-medium">Configura los datos de acceso</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="bg-slate-100 p-2 rounded-full border border-slate-200 text-slate-500 hover:text-rose-400 hover:border-rose-400/30 transition-all hover:rotate-90"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-4 sm:p-8 space-y-4 sm:space-y-6">
              <div className="space-y-5">
                <div className="group">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 group-focus-within:text-indigo-400 transition-colors">Nombre Completo</label>
                  <div className="relative">
                    <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={20} />
                    <input
                      type="text" required
                      className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all font-bold text-slate-900 placeholder-slate-600"
                      placeholder="Ej: Juan Pérez"
                      value={formData.nombre}
                      onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                    />
                  </div>
                </div>

                <div className="group">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 group-focus-within:text-indigo-400 transition-colors">Email Corporativo</label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-black group-focus-within:text-indigo-400">@</div>
                    <input
                      type="email" required
                      className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all font-bold text-slate-900 placeholder-slate-600"
                      placeholder="usuario@empresa.com"
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                </div>

                <div className="group">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 group-focus-within:text-indigo-400 transition-colors">
                    {editingUser ? 'Nueva Contraseña (Opcional)' : 'Contraseña Inicial'}
                  </label>
                  <div className="relative">
                    <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={20} />
                    <input
                      type={showPassword ? "text" : "password"}
                      required={!editingUser} minLength={6}
                      className="w-full pl-12 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all font-bold text-slate-900 placeholder-slate-600"
                      value={formData.password}
                      onChange={e => setFormData({ ...formData, password: e.target.value })}
                      placeholder={editingUser ? "••••••••" : "Mínimo 6 caracteres"}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-900 transition-colors">
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 xs:grid-cols-2 gap-4 sm:gap-6">
                  <div className="group">
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 group-focus-within:text-indigo-400 transition-colors">Rol de Acceso</label>
                    <div className="relative">
                      <select
                        required
                        className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all font-bold text-slate-900 appearance-none cursor-pointer"
                        value={formData.rol}
                        onChange={e => setFormData({ ...formData, rol: e.target.value })}
                      >
                        <option value="" disabled>Seleccionar...</option>
                        {roles.map(r => <option key={r.id} value={r.id}>{r.nombre}</option>)}
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                        <Briefcase size={16} />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Estado</label>
                    <div
                      onClick={() => setFormData({ ...formData, activo: !formData.activo })}
                      className={`h-[52px] w-full rounded-xl flex items-center px-4 cursor-pointer transition-all border ${formData.activo
                        ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200'
                        }`}
                    >
                      <div className={`w-12 h-6 rounded-full relative transition-colors ${formData.activo ? 'bg-emerald-500' : 'bg-slate-200'}`}>
                        <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform shadow-sm ${formData.activo ? 'translate-x-6' : 'translate-x-0'}`}></div>
                      </div>
                      <span className={`ml-3 font-bold text-sm ${formData.activo ? 'text-emerald-600' : 'text-slate-500'}`}>
                        {formData.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-amber-500/10 rounded-xl p-4 border border-amber-500/20 mt-4 flex items-start gap-3">
                  <div className="bg-amber-500/20 text-amber-400 p-2 rounded-lg flex-shrink-0 mt-1">
                    <Crown size={20} />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-sm font-bold text-amber-400 block">Delegar Administración</label>
                      <div
                        onClick={() => setFormData(prev => ({ ...prev, es_admin_delegado: !prev.es_admin_delegado }))}
                        className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${formData.es_admin_delegado ? 'bg-amber-500' : 'bg-slate-200'}`}
                      >
                        <div className={`absolute top-0.5 left-0.5 bg-white w-4 h-4 rounded-full transition-transform shadow-sm ${formData.es_admin_delegado ? 'translate-x-5' : 'translate-x-0'}`}></div>
                      </div>
                    </div>
                    <p className="text-[11px] text-amber-500/80 leading-tight font-medium">Otorga accesos totales sin cambiar el rol visual original.</p>
                  </div>
                </div>
              </div>

              <div className="pt-6 flex gap-4 border-t border-slate-200">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl font-bold transition-colors">
                  Cancelar
                </button>
                <button type="submit" disabled={saveMutation.isPending} className="flex-[2] py-4 bg-indigo-600 text-white rounded-xl font-black flex items-center justify-center gap-2 shadow-md transition-all hover:scale-[1.02] disabled:opacity-70 disabled:scale-100">
                  {saveMutation.isPending ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                  {saveMutation.isPending ? 'Guardando...' : 'Confirmar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPage;
