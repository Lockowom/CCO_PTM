import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { 
  Users, UserPlus, Search, Filter, RefreshCw, 
  MoreVertical, Edit, Trash2, Key, Shield, UserCheck, 
  Crown, Briefcase, Wrench, X, Save, Eye, EyeOff, Loader2 
} from 'lucide-react';
import { supabase } from '../../supabase';
import gsap from 'gsap';

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    rol: '',
    activo: true
  });
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);

  // Refs para animaciones
  const pageRef = useRef(null);
  const usersGridRef = useRef(null);
  const modalRef = useRef(null);

  // Stats
  const stats = {
    total: users.length,
    active: users.filter(u => u.activo).length,
    admins: users.filter(u => u.rol?.toUpperCase().includes('ADMIN')).length,
    supervisors: users.filter(u => u.rol?.toUpperCase().includes('SUPERVISOR')).length
  };

  const [isSyncing, setIsSyncing] = useState(false); // Indicador de sincronización realtime

  // Animación Inicial
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // Header & Stats
      gsap.from(".page-header", { y: -20, opacity: 0, duration: 0.6, ease: "power3.out" });
      gsap.from(".stat-card", { 
        y: 20, 
        opacity: 0, 
        duration: 0.5, 
        stagger: 0.1, 
        delay: 0.2,
        ease: "back.out(1.2)" 
      });
      
      // Filters
      gsap.from(".filters-bar", { 
        y: 20, 
        opacity: 0, 
        duration: 0.5, 
        delay: 0.4,
        ease: "power2.out" 
      });

    }, pageRef);

    return () => ctx.revert();
  }, []);

  // Animar Grid de Usuarios cuando cargan
  useEffect(() => {
    if (!loading && users.length > 0) {
      gsap.fromTo(".user-card", 
        { y: 30, opacity: 0, scale: 0.95 },
        { y: 0, opacity: 1, scale: 1, duration: 0.4, stagger: 0.05, ease: "power2.out" }
      );
    }
  }, [loading, users.length]);

  // Animar Modal
  useEffect(() => {
    if (isModalOpen && modalRef.current) {
      gsap.fromTo(modalRef.current,
        { scale: 0.9, opacity: 0, y: 20 },
        { scale: 1, opacity: 1, y: 0, duration: 0.3, ease: "back.out(1.2)" }
      );
    }
  }, [isModalOpen]);

  useEffect(() => {
    fetchUsers();
    fetchRoles();

    // REALTIME: Escuchar cambios en tms_usuarios
    const usersChannel = supabase
      .channel('tms_usuarios_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tms_usuarios'
        },
        (payload) => {
          console.log('🔄 Cambio detectado en usuarios (Realtime):', payload);
          setIsSyncing(true);
          // Flash animation for sync
          gsap.to(".sync-indicator", { scale: 1.5, opacity: 0.5, duration: 0.3, yoyo: true, repeat: 1 });
          fetchUsers();
          setTimeout(() => setIsSyncing(false), 300);
        }
      )
      .subscribe();


    // REALTIME: Escuchar cambios en tms_roles
    const rolesChannel = supabase
      .channel('tms_roles_users_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tms_roles'
        },
        (payload) => {
          console.log('🔄 Cambio detectado en roles (Realtime):', payload);
          setIsSyncing(true);
          fetchRoles();
          setTimeout(() => setIsSyncing(false), 300);
        }
      )
      .subscribe();

    // Limpiar listeners al desmontar
    return () => {
      usersChannel.unsubscribe();
      rolesChannel.unsubscribe();
    };
  }, []);

  const fetchRoles = async () => {
    try {
      const { data, error } = await supabase
        .from('tms_roles')
        .select('id, nombre')
        .order('nombre');

      if (error) throw error;
      setRoles(data || []);
    } catch (error) {
      console.error('Error fetching roles:', error);
      // Fallback a roles básicos si falla la DB o no existen
      setRoles([
        { id: 'ADMIN', nombre: 'Administrador' },
        { id: 'SUPERVISOR', nombre: 'Supervisor' },
        { id: 'OPERADOR', nombre: 'Operador' },
        { id: 'CONDUCTOR', nombre: 'Conductor' }
      ]);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // Intentar leer de la tabla 'tms_usuarios'
      const { data, error } = await supabase
        .from('tms_usuarios')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error Supabase fetching users:', error);
        throw error;
      }
      
      // Validar y establecer usuarios
      if (data && Array.isArray(data)) {
        setUsers(data);
      } else {
        setUsers([]);
      }
      
    } catch (error) {
      console.error('Error fetching users:', error);
      alert('⚠ Error al cargar usuarios: ' + error.message);
      // Fallback robusto para evitar pantalla blanca si falla la DB
      setUsers([
        { 
          id: 'fallback-1', 
          id_usuario: 'USR-FALLBACK-001',
          nombre: 'Admin Fallback', 
          email: 'admin@cco.cl', 
          rol: 'ADMIN', 
          activo: true, 
          created_at: new Date().toISOString() 
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (user = null) => {
    setEditingUser(user);
    setShowPassword(false);
    if (user) {
      setFormData({
        nombre: user.nombre,
        email: user.email,
        password: '',
        rol: user.rol,
        activo: user.activo
      });
    } else {
      setFormData({
        nombre: '',
        email: '',
        password: '',
        rol: '',
        activo: true
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Validar campos requeridos
      if (!formData.nombre || !formData.email || !formData.rol) {
        alert('⚠ Por favor completa todos los campos requeridos');
        setSaving(false);
        return;
      }

      if (editingUser) {
        // UPDATE: Actualizar usuario existente
        const updates = {
          nombre: formData.nombre,
          email: formData.email,
          rol: formData.rol,
          activo: formData.activo
        };

        // Incluir contraseña solo si se cambió
        if (formData.password && formData.password.trim() !== '') {
          updates.password_hash = formData.password;
        }

        const { data, error } = await supabase
          .from('tms_usuarios')
          .update(updates)
          .eq('id', editingUser.id)
          .select();

        if (error) {
          console.error('Error updating user:', error);
          throw error;
        }

        if (!data || data.length === 0) {
          throw new Error('No se pudo actualizar el usuario');
        }

        alert('✓ Usuario actualizado exitosamente');
      } else {
        // CREATE: Crear nuevo usuario
        const legacyId = `USR-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
        
        const { data, error } = await supabase
          .from('tms_usuarios')
          .insert([{ 
            id_usuario: legacyId,
            nombre: formData.nombre,
            email: formData.email,
            password_hash: formData.password || '123456',
            rol: formData.rol,
            activo: formData.activo
          }])
          .select();

        if (error) {
          console.error('Error creating user:', error);
          throw error;
        }

        if (!data || data.length === 0) {
          throw new Error('No se pudo crear el usuario');
        }

        alert('✓ Nuevo usuario creado exitosamente');
      }
      
      setIsModalOpen(false);
      setEditingUser(null);
      setFormData({
        nombre: '',
        email: '',
        password: '',
        rol: '',
        activo: true
      });
      
      // Recargar la lista
      await fetchUsers();
      
    } catch (error) {
      console.error('Error saving user:', error);
      alert('❌ Error al guardar usuario: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Estás seguro de eliminar este usuario?')) return;
    try {
      const { error } = await supabase
        .from('tms_usuarios')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Error deleting user:', error);
        throw error;
      }

      alert('✓ Usuario eliminado exitosamente');
      await fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('❌ Error al eliminar usuario: ' + error.message);
    }
  };

  // Filtrado
  const filteredUsers = users.filter(user => {
    const matchesSearch = !searchTerm || 
      user.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = !roleFilter || user.rol === roleFilter;
    
    const matchesStatus = !statusFilter || 
      (statusFilter === 'active' ? user.activo : !user.activo);

    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleBadgeColor = (rol) => {
    switch (rol?.toUpperCase()) {
      case 'ADMIN': return 'bg-red-50 text-red-700 border-red-100';
      case 'SUPERVISOR': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'OPERADOR': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      default: return 'bg-blue-50 text-blue-700 border-blue-100';
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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <Loader2 size={48} className="animate-spin text-blue-500" />
        <p className="text-slate-500 font-medium animate-pulse">Cargando usuarios...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Moderno */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 page-header">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-200">
              <Users className="text-white" size={24} />
            </div>
            Gestión de Usuarios (Control de Accesos)
            {isSyncing && (
              <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full flex items-center gap-1 animate-pulse">
                <RefreshCw size={12} className="animate-spin" /> Sincronizando
              </span>
            )}
          </h1>
          <p className="text-slate-500 text-lg mt-2 ml-1">Administración centralizada de accesos y credenciales</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={fetchUsers}
            className="p-3 text-slate-500 hover:bg-white hover:shadow-md hover:text-indigo-600 rounded-xl transition-all border border-transparent hover:border-slate-100"
            title="Actualizar lista"
          >
            <RefreshCw size={24} className={loading ? 'animate-spin' : ''} />
          </button>
          <button 
            onClick={() => handleOpenModal()}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-xl shadow-indigo-200 transition-all hover:scale-105 active:scale-95"
          >
            <UserPlus size={20} />
            Nuevo Usuario
          </button>
        </div>
      </div>

      {/* Stats Cards Modernos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={<Users />} label="Total Usuarios" value={stats.total} color="indigo" />
        <StatCard icon={<UserCheck />} label="Usuarios Activos" value={stats.active} color="emerald" />
        <StatCard icon={<Crown />} label="Administradores" value={stats.admins} color="rose" />
        <StatCard icon={<Briefcase />} label="Supervisores" value={stats.supervisors} color="amber" />
      </div>

      {/* Barra de Filtros Flotante */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-lg shadow-slate-100/50 flex flex-col md:flex-row gap-2 items-center filters-bar sticky top-4 z-30 backdrop-blur-xl bg-white/90">
        <div className="flex-1 relative w-full group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
          <input 
            type="text"
            placeholder="Buscar por nombre, email o ID..."
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-transparent rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all placeholder-slate-400 font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
          <select 
            className="px-4 py-3 bg-slate-50 hover:bg-slate-100 border-transparent rounded-xl outline-none focus:ring-2 focus:ring-indigo-100 font-bold text-slate-600 cursor-pointer transition-colors"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="">Todos los roles</option>
            {roles.map(r => <option key={r.id} value={r.id}>{r.nombre}</option>)}
          </select>
          <select 
            className="px-4 py-3 bg-slate-50 hover:bg-slate-100 border-transparent rounded-xl outline-none focus:ring-2 focus:ring-indigo-100 font-bold text-slate-600 cursor-pointer transition-colors"
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
      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Users size={20} className="text-indigo-600" />
            </div>
          </div>
          <p className="text-slate-400 font-medium animate-pulse">Cargando directorio...</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
          <div className="bg-white p-6 rounded-full shadow-sm mb-4">
            <Search size={48} className="text-slate-300" />
          </div>
          <h3 className="text-xl font-bold text-slate-600">No se encontraron usuarios</h3>
          <p className="text-slate-400 mt-1">Intenta ajustar los filtros de búsqueda</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" ref={usersGridRef}>
          {filteredUsers.map(user => (
            <div key={user.id} className="user-card group bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden relative">
              {/* Background Pattern */}
              <div className={`h-24 w-full absolute top-0 left-0 opacity-10 transition-colors ${
                user.activo ? 'bg-indigo-600' : 'bg-slate-400'
              }`}></div>
              
              <div className="p-6 relative pt-8">
                <div className="flex justify-between items-start mb-4">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black text-white shadow-lg transform group-hover:scale-110 transition-transform duration-300
                    ${user.rol === 'ADMIN' ? 'bg-gradient-to-br from-rose-500 to-red-600 shadow-rose-200' : 
                      user.rol === 'SUPERVISOR' ? 'bg-gradient-to-br from-amber-400 to-orange-500 shadow-amber-200' : 
                      'bg-gradient-to-br from-indigo-500 to-blue-600 shadow-indigo-200'}`}
                  >
                    {user.nombre?.charAt(0).toUpperCase()}
                  </div>
                  
                  <div className="flex flex-col items-end gap-2">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border shadow-sm ${
                      user.activo 
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                        : 'bg-slate-100 text-slate-500 border-slate-200'
                    }`}>
                      {user.activo ? 'Activo' : 'Inactivo'}
                    </span>
                    
                    {user.rol === 'ADMIN' && (
                      <span className="text-rose-500 bg-rose-50 p-1 rounded-lg" title="Administrador">
                        <Crown size={14} />
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-1 mb-6">
                  <h3 className="font-bold text-xl text-slate-800 leading-tight truncate" title={user.nombre}>
                    {user.nombre}
                  </h3>
                  <p className="text-sm text-slate-500 truncate font-medium flex items-center gap-1">
                    {user.email}
                  </p>
                </div>

                <div className="flex items-center gap-2 mb-6">
                  <div className={`flex-1 flex items-center gap-2 px-3 py-2 rounded-xl border bg-slate-50/50 ${getRoleBadgeColor(user.rol)}`}>
                    {getRoleIcon(user.rol)}
                    <span className="font-bold text-xs truncate">{roles.find(r => r.id === user.rol)?.nombre || user.rol}</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-4 border-t border-slate-100">
                  <button 
                    onClick={() => handleOpenModal(user)}
                    className="flex-1 py-2.5 bg-slate-50 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2"
                  >
                    <Edit size={16} /> Editar
                  </button>
                  <button 
                    onClick={() => handleDelete(user.id)}
                    className="p-2.5 text-slate-400 hover:bg-red-50 hover:text-red-600 rounded-xl transition-colors"
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

      {/* Modal Moderno */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4 transition-all">
          <div ref={modalRef} className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden transform transition-all">
            <div className="bg-slate-50 px-8 py-6 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
                  {editingUser ? 'Editar Perfil' : 'Nuevo Usuario'}
                </h2>
                <p className="text-slate-500 text-sm">Completa los datos de acceso</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="bg-white p-2 rounded-full shadow-sm text-slate-400 hover:text-rose-500 transition-colors hover:rotate-90 duration-300"
              >
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-8 space-y-6">
              <div className="space-y-4">
                <div className="group">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 group-focus-within:text-indigo-500 transition-colors">Nombre Completo</label>
                  <div className="relative">
                    <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
                    <input 
                      type="text" 
                      required
                      className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium text-slate-700"
                      placeholder="Ej: Juan Pérez"
                      value={formData.nombre}
                      onChange={e => setFormData({...formData, nombre: e.target.value})}
                    />
                  </div>
                </div>

                <div className="group">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 group-focus-within:text-indigo-500 transition-colors">Email Corporativo</label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold group-focus-within:text-indigo-500">@</div>
                    <input 
                      type="email" 
                      required
                      className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium text-slate-700"
                      placeholder="juan@empresa.com"
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                </div>

                <div className="group">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 group-focus-within:text-indigo-500 transition-colors">
                    {editingUser ? 'Nueva Contraseña (Opcional)' : 'Contraseña Inicial'}
                  </label>
                  <div className="relative">
                    <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
                    <input 
                      type={showPassword ? "text" : "password"}
                      required={!editingUser}
                      minLength={6}
                      className="w-full pl-12 pr-12 py-3 bg-slate-50 border-2 border-transparent rounded-xl outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium text-slate-700"
                      value={formData.password}
                      onChange={e => setFormData({...formData, password: e.target.value})}
                      placeholder={editingUser ? "••••••••" : "Mínimo 6 caracteres"}
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="group">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 group-focus-within:text-indigo-500 transition-colors">Rol de Acceso</label>
                    <div className="relative">
                      <select 
                        required
                        className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-bold text-slate-700 appearance-none cursor-pointer"
                        value={formData.rol}
                        onChange={e => setFormData({...formData, rol: e.target.value})}
                      >
                        <option value="">Seleccionar...</option>
                        {roles.map(r => <option key={r.id} value={r.id}>{r.nombre}</option>)}
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                        <Briefcase size={16} />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Estado</label>
                    <div 
                      onClick={() => setFormData({...formData, activo: !formData.activo})}
                      className={`h-[50px] w-full rounded-xl flex items-center px-4 cursor-pointer transition-all border-2 ${
                        formData.activo 
                          ? 'bg-emerald-50 border-emerald-200' 
                          : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className={`w-10 h-6 rounded-full relative transition-colors ${
                        formData.activo ? 'bg-emerald-500' : 'bg-slate-300'
                      }`}>
                        <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform shadow-sm ${
                          formData.activo ? 'translate-x-4' : 'translate-x-0'
                        }`}></div>
                      </div>
                      <span className={`ml-3 font-bold text-sm ${
                        formData.activo ? 'text-emerald-700' : 'text-slate-500'
                      }`}>
                        {formData.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6 flex gap-4">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3.5 text-slate-600 hover:bg-slate-100 rounded-xl font-bold transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  disabled={saving}
                  className="flex-[2] py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 transition-all hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed disabled:scale-100"
                >
                  {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                  {saving ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ icon, label, value, color }) => {
  const colorClasses = {
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    rose: 'bg-rose-50 text-rose-600 border-rose-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    blue: 'bg-blue-50 text-blue-600 border-blue-100'
  };

  const bgClass = colorClasses[color] || colorClasses.blue;

  return (
    <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-lg shadow-slate-100/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      <div className="flex items-center gap-4">
        <div className={`p-4 rounded-2xl ${bgClass}`}>
          {React.cloneElement(icon, { size: 28 })}
        </div>
        <div>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">{label}</p>
          <p className="text-3xl font-black text-slate-800">{value}</p>
        </div>
      </div>
    </div>
  );
};

export default UsersPage;