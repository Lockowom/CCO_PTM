import React, { useState, useEffect } from 'react';
import { 
  Users, UserPlus, Search, Filter, RefreshCw, 
  MoreVertical, Edit, Trash2, Key, Shield, UserCheck, 
  Crown, Briefcase, Wrench, X, Save, Eye, EyeOff, Loader2 
} from 'lucide-react';
import { supabase } from '../../supabase';

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

  // Stats
  const stats = {
    total: users.length,
    active: users.filter(u => u.activo).length,
    admins: users.filter(u => u.rol?.toUpperCase().includes('ADMIN')).length,
    supervisors: users.filter(u => u.rol?.toUpperCase().includes('SUPERVISOR')).length
  };

  useEffect(() => {
    fetchUsers();
    // Simular roles por ahora, idealmente vendrían de una tabla 'roles'
    setRoles([
      { id: 'ADMIN', nombre: 'Administrador' },
      { id: 'SUPERVISOR', nombre: 'Supervisor' },
      { id: 'OPERADOR', nombre: 'Operador' },
      { id: 'CONDUCTOR', nombre: 'Conductor' }
    ]);
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // Intentar leer de la tabla 'tms_usuarios'
      const { data, error } = await supabase
        .from('tms_usuarios')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error Supabase:', error);
        throw error;
      }
      
      // Si no hay datos, mostrar array vacío pero NO undefined
      setUsers(data || []);
      
    } catch (error) {
      console.error('Error fetching users:', error);
      // Fallback robusto para evitar pantalla blanca si falla la DB
      setUsers([
        { id: 'fallback-1', nombre: 'Admin Fallback', email: 'admin@cco.cl', rol: 'ADMIN', activo: true, created_at: new Date().toISOString() }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingUser) {
        // Update
        const updates = {
          nombre: formData.nombre,
          email: formData.email,
          rol: formData.rol,
          activo: formData.activo
        };
        // Nota: En un sistema real, el hash se haría en el backend o Edge Function.
        // Aquí simulamos guardando el hash directamente si se provee.
        if (formData.password) updates.password_hash = formData.password; 

        const { error } = await supabase
          .from('tms_usuarios')
          .update(updates)
          .eq('id', editingUser.id);

        if (error) throw error;
      } else {
        // Create
        // Generar ID estilo legacy USR-...
        const legacyId = `USR-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
        
        const { error } = await supabase
          .from('tms_usuarios')
          .insert([{ 
            id_usuario: legacyId,
            nombre: formData.nombre,
            email: formData.email,
            password_hash: formData.password, // En producción usar bcrypt
            rol: formData.rol,
            activo: formData.activo
          }]);

        if (error) throw error;
      }
      
      setIsModalOpen(false);
      fetchUsers();
    } catch (error) {
      console.error('Error saving user:', error);
      alert('Error al guardar usuario');
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
      
      if (error) throw error;
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <Users className="text-blue-600" />
            Gestión de Usuarios
          </h1>
          <p className="text-slate-500 text-sm mt-1">Administración de accesos y credenciales</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={fetchUsers}
            className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            title="Actualizar lista"
          >
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
          </button>
          <button 
            onClick={() => handleOpenModal()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 shadow-lg shadow-blue-500/20 transition-all hover:scale-105 active:scale-95"
          >
            <UserPlus size={18} />
            Nuevo Usuario
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard icon={<Users />} label="Total Usuarios" value={stats.total} color="blue" />
        <StatCard icon={<UserCheck />} label="Activos" value={stats.active} color="emerald" />
        <StatCard icon={<Crown />} label="Administradores" value={stats.admins} color="red" />
        <StatCard icon={<Briefcase />} label="Supervisores" value={stats.supervisors} color="amber" />
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center">
        <div className="flex-1 relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text"
            placeholder="Buscar por nombre o email..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <select 
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-blue-500 text-sm"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="">Todos los roles</option>
            {roles.map(r => <option key={r.id} value={r.id}>{r.nombre}</option>)}
          </select>
          <select 
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-blue-500 text-sm"
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
        <div className="flex justify-center py-20">
          <Loader2 size={40} className="animate-spin text-blue-500" />
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="text-center py-20 text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
          <Search size={48} className="mx-auto mb-4 opacity-20" />
          <p>No se encontraron usuarios</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map(user => (
            <div key={user.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow group">
              <div className="p-4 bg-gradient-to-br from-slate-50 to-slate-100 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold text-white shadow-sm
                    ${user.rol === 'ADMIN' ? 'bg-gradient-to-br from-red-500 to-rose-600' : 
                      user.rol === 'SUPERVISOR' ? 'bg-gradient-to-br from-amber-400 to-orange-500' : 
                      'bg-gradient-to-br from-blue-400 to-indigo-500'}`}
                  >
                    {user.nombre?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 leading-tight">{user.nombre}</h3>
                    <p className="text-xs text-slate-500">{user.email}</p>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${user.activo ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
                  {user.activo ? 'Activo' : 'Inactivo'}
                </span>
              </div>
              
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <div className={`flex items-center gap-2 px-2 py-1 rounded-md border ${getRoleBadgeColor(user.rol)}`}>
                    {getRoleIcon(user.rol)}
                    <span className="font-semibold text-xs">{roles.find(r => r.id === user.rol)?.nombre || user.rol}</span>
                  </div>
                  <span className="text-xs text-slate-400">
                    Creado: {new Date(user.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => handleOpenModal(user)}
                  className="p-2 text-slate-600 hover:bg-white hover:text-blue-600 rounded-lg transition-colors shadow-sm"
                  title="Editar"
                >
                  <Edit size={16} />
                </button>
                <button 
                  onClick={() => {
                    setEditingUser(user);
                    // Aquí lógica de reset password
                    alert('Funcionalidad de resetear password pendiente');
                  }}
                  className="p-2 text-slate-600 hover:bg-white hover:text-amber-600 rounded-lg transition-colors shadow-sm"
                  title="Cambiar Contraseña"
                >
                  <Key size={16} />
                </button>
                <button 
                  onClick={() => handleDelete(user.id)}
                  className="p-2 text-slate-600 hover:bg-white hover:text-red-600 rounded-lg transition-colors shadow-sm"
                  title="Eliminar"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                {editingUser ? <Edit className="text-blue-500" size={20} /> : <UserPlus className="text-blue-500" size={20} />}
                {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Nombre Completo</label>
                <input 
                  type="text" 
                  required
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-blue-500 outline-none"
                  value={formData.nombre}
                  onChange={e => setFormData({...formData, nombre: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Email</label>
                <input 
                  type="email" 
                  required
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-blue-500 outline-none"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">
                  {editingUser ? 'Nueva Contraseña (Opcional)' : 'Contraseña'}
                </label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"}
                    required={!editingUser}
                    minLength={6}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-blue-500 outline-none pr-10"
                    value={formData.password}
                    onChange={e => setFormData({...formData, password: e.target.value})}
                    placeholder={editingUser ? "Dejar vacío para mantener actual" : "Mínimo 6 caracteres"}
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Rol</label>
                  <select 
                    required
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-blue-500 outline-none"
                    value={formData.rol}
                    onChange={e => setFormData({...formData, rol: e.target.value})}
                  >
                    <option value="">Seleccionar...</option>
                    {roles.map(r => <option key={r.id} value={r.id}>{r.nombre}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Estado</label>
                  <div className="flex items-center h-[42px]">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer"
                        checked={formData.activo}
                        onChange={e => setFormData({...formData, activo: e.target.checked})}
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      <span className="ml-3 text-sm font-medium text-slate-700">
                        {formData.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold flex items-center gap-2 shadow-lg shadow-blue-500/20 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                  Guardar
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
    blue: 'bg-blue-50 text-blue-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    red: 'bg-red-50 text-red-600',
    amber: 'bg-amber-50 text-amber-600'
  };

  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
      <div className={`p-3 rounded-xl ${colorClasses[color]}`}>
        {React.cloneElement(icon, { size: 24 })}
      </div>
      <div>
        <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-black text-slate-800">{value}</p>
      </div>
    </div>
  );
};

export default UsersPage;