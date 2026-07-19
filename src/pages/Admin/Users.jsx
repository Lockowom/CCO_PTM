import React, { useState, useRef } from 'react';
import {
  Users, UserPlus, Search, RefreshCw,
  Edit, Trash2, Key, Crown,
  Briefcase, Wrench, X, Save, Eye, EyeOff, Loader2, UserCheck,
  LayoutGrid, List, CheckSquare, Square, Power, PowerOff, Clock, ChevronDown,
} from 'lucide-react';
import { supabase } from '../../supabase';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { accesosConPermisos } from '../../constants/permissions';
import { APP_ROUTES } from '../../config/modules';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { toast } from 'sonner';

// Alta/edición pasan por la RPC transaccional `guardar_usuario` (crea la cuenta
// auth + la fila en una sola transacción, gateada a admin). Las acciones en
// lote y el toggle rápido usan `usuarios_bulk`. La escalada de privilegios ya
// está bloqueada en la BD por el trigger tms_usuarios_freeze_privileged.

const OK_STYLE = { background: '#1e293b', border: '1px solid #10b981', color: '#f8fafc' };
const ERR_STYLE = { background: '#1e293b', border: '1px solid #ef4444', color: '#f8fafc' };

// "Último acceso" legible desde tms_usuarios.last_seen.
const fmtUltimo = (ts) => {
  if (!ts) return 'Nunca';
  const d = new Date(ts);
  if (isNaN(d.getTime())) return '—';
  const min = Math.floor((Date.now() - d.getTime()) / 60000);
  if (min < 1) return 'Ahora';
  if (min < 60) return `hace ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `hace ${h} h`;
  const dias = Math.floor(h / 24);
  if (dias < 30) return `hace ${dias} d`;
  return d.toLocaleDateString('es-CL');
};

const UsersPage = ({ embedded = false }) => {
  const queryClient = useQueryClient();
  const containerRef = useRef(null);
  const modalRef = useRef(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('recientes');
  const [viewMode, setViewMode] = useState('cards');
  const [selected, setSelected] = useState(() => new Set());
  const [bulkRole, setBulkRole] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '', email: '', password: '', rol: '', activo: true, es_admin_delegado: false
  });
  const [showPassword, setShowPassword] = useState(false);

  useGSAP(() => {
    if (isModalOpen && modalRef.current) {
      gsap.from(modalRef.current, { scale: 0.95, opacity: 0, y: 20, duration: 0.3, ease: 'back.out(1.2)', clearProps: 'all' });
    }
  }, [isModalOpen]);

  // Query: Roles (queryKey PROPIO — antes chocaba con ['admin_roles'] de la
  // pestaña Roles, que devuelve otra forma y dejaba contadores en 0).
  const { data: roles = [], isLoading: loadingRoles } = useQuery({
    queryKey: ['roles_catalogo'],
    queryFn: async () => {
      const { data, error } = await supabase.from('tms_roles').select('id, nombre, descripcion, landing_page, permisos_json').order('nombre');
      if (error) throw error;
      return data || [];
    }
  });
  const rolesById = React.useMemo(() => Object.fromEntries(roles.map(r => [r.id, r])), [roles]);

  // Query: Usuarios (incluye last_seen para "último acceso").
  const { data: users = [], isLoading: loadingUsers } = useQuery({
    queryKey: ['admin_users'],
    queryFn: async () => {
      const { data, error } = await supabase.from('tms_usuarios')
        .select('id, id_usuario, nombre, email, rol, activo, es_admin_delegado, created_at, last_seen')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    }
  });

  // Realtime (con debounce) → refresca ambos queryKeys propios.
  React.useEffect(() => {
    let timers = {};
    const debounced = (key) => {
      if (timers[key]) clearTimeout(timers[key]);
      timers[key] = setTimeout(() => queryClient.invalidateQueries({ queryKey: [key] }), 800);
    };
    const channel = supabase.channel('admin_users_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tms_usuarios' }, () => debounced('admin_users'))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tms_roles' }, () => debounced('roles_catalogo'))
      .subscribe((status, err) => { if (err) console.error('Realtime subscription error:', err); });
    return () => { Object.values(timers).forEach(t => clearTimeout(t)); supabase.removeChannel(channel); };
  }, [queryClient]);

  // Mutation: Guardar Usuario (RPC transaccional gateada).
  const saveMutation = useMutation({
    mutationFn: async (user) => {
      const payload = {
        id: editingUser?.id || null,
        nombre: user.nombre, email: user.email, rol: user.rol,
        activo: user.activo, es_admin_delegado: user.es_admin_delegado,
        password: user.password?.trim() || null,
      };
      const { data, error } = await supabase.rpc('guardar_usuario', { p: payload });
      if (error) throw error;
      if (data && data.ok === false) throw new Error(data.error || 'No se pudo guardar');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin_users'] });
      toast.success(`Usuario ${editingUser ? 'actualizado' : 'creado'} exitosamente`, { style: OK_STYLE });
      setIsModalOpen(false);
    },
    onError: (err) => toast.error('Error al guardar usuario: ' + err.message, { style: ERR_STYLE }),
  });

  // Mutation: Eliminar Usuario — supresión COMPLETA (Ley 21.719) vía RPC.
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.rpc('eliminar_usuario_completo', { p_id: id });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin_users'] });
      toast.success('Usuario eliminado (cuenta, accesos y rastros anonimizados)');
    },
    onError: (err) => toast.error('Error al eliminar: ' + err.message),
  });

  // Mutation: acciones en lote / toggle rápido (RPC usuarios_bulk gateada).
  const bulkMutation = useMutation({
    mutationFn: async ({ ids, accion, valor = null }) => {
      const { data, error } = await supabase.rpc('usuarios_bulk', { p_ids: ids, p_accion: accion, p_valor: valor });
      if (error) throw error;
      return data;
    },
    onSuccess: (data, vars) => {
      queryClient.invalidateQueries({ queryKey: ['admin_users'] });
      const verbo = { activar: 'activado(s)', desactivar: 'desactivado(s)', rol: 'reasignado(s)', eliminar: 'eliminado(s)' }[vars.accion] || 'actualizado(s)';
      toast.success(`${data?.n ?? vars.ids.length} usuario(s) ${verbo}`, { style: OK_STYLE });
      if (vars.accion !== '__toggle') { setSelected(new Set()); setBulkRole(''); }
    },
    onError: (err) => toast.error('Error en la acción: ' + err.message, { style: ERR_STYLE }),
  });

  const handleOpenModal = (user = null) => {
    setEditingUser(user);
    setShowPassword(false);
    setFormData({
      nombre: user?.nombre || '', email: user?.email || '', password: '',
      rol: user?.rol || '', activo: user ? user.activo : true, es_admin_delegado: user?.es_admin_delegado || false
    });
    setIsModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.nombre || !formData.email || !formData.rol) { toast.error('Completa los campos requeridos'); return; }
    saveMutation.mutate(formData);
  };

  const handleDelete = (id) => {
    if (window.confirm('¿Eliminar este usuario permanentemente?')) deleteMutation.mutate(id);
  };

  // Toggle rápido activo/inactivo (una sola fila, sin abrir el modal).
  const quickToggle = (user, e) => {
    e?.stopPropagation();
    bulkMutation.mutate({ ids: [user.id], accion: user.activo ? 'desactivar' : 'activar' });
  };

  // Selección múltiple
  const toggleSelect = (id, e) => {
    e?.stopPropagation();
    setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };
  const clearSelection = () => setSelected(new Set());

  const filteredUsers = React.useMemo(() => {
    const arr = users.filter(user => {
      const matchSearch = !searchTerm || user.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) || user.email?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchRole = !roleFilter || user.rol === roleFilter;
      const matchStatus = !statusFilter || (statusFilter === 'active' ? user.activo : !user.activo);
      return matchSearch && matchRole && matchStatus;
    });
    const rolName = (u) => rolesById[u.rol]?.nombre || u.rol || '';
    const cmp = {
      recientes: (a, b) => new Date(b.created_at) - new Date(a.created_at),
      nombre: (a, b) => (a.nombre || '').localeCompare(b.nombre || ''),
      rol: (a, b) => rolName(a).localeCompare(rolName(b)),
      ultimo: (a, b) => new Date(b.last_seen || 0) - new Date(a.last_seen || 0),
      estado: (a, b) => Number(b.activo) - Number(a.activo),
    }[sortBy] || (() => 0);
    return [...arr].sort(cmp);
  }, [users, searchTerm, roleFilter, statusFilter, sortBy, rolesById]);

  const visibleIds = filteredUsers.map(u => u.id);
  const allVisibleSelected = visibleIds.length > 0 && visibleIds.every(id => selected.has(id));
  const toggleSelectAll = () => {
    setSelected(prev => {
      const n = new Set(prev);
      if (allVisibleSelected) visibleIds.forEach(id => n.delete(id));
      else visibleIds.forEach(id => n.add(id));
      return n;
    });
  };

  const doBulk = (accion, valor = null) => {
    const ids = [...selected];
    if (ids.length === 0) return;
    if (accion === 'eliminar' && !window.confirm(`¿Eliminar ${ids.length} usuario(s) permanentemente? Esta acción no se puede deshacer.`)) return;
    bulkMutation.mutate({ ids, accion, valor });
  };

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
        <div className={`p-2 sm:p-4 rounded-xl bg-slate-50 border border-slate-200 text-${glowColor}-400 shadow-sm`}>{icon}</div>
        <div className="min-w-0">
          <p className="text-[10px] sm:text-xs text-slate-500 font-bold uppercase tracking-wider mb-1 truncate">{label}</p>
          <p className="text-2xl sm:text-3xl font-black text-slate-900">{value}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div ref={containerRef} className={embedded ? 'space-y-4 sm:space-y-8 text-slate-700 relative' : 'space-y-4 sm:space-y-8 bg-slate-50 min-h-[calc(100vh-80px)] p-3 sm:p-6 text-slate-700'}>

      <div className="absolute inset-0 pointer-events-none overflow-hidden flex justify-center z-0">
        <div className="absolute top-[-10%] w-[800px] h-[400px] bg-orange-500/10 blur-[100px] rounded-full"></div>
      </div>

      {/* Header / acciones */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
        {!embedded && (
          <div>
            <h1 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <div className="bg-orange-500/10 p-2.5 rounded-xl border border-orange-500/30 shadow-sm"><Users className="text-orange-400" size={28} /></div>
              Control de <span className="text-orange-400">Accesos</span>
            </h1>
            <p className="text-slate-500 text-sm mt-2 font-medium">Administración centralizada de usuarios y roles del sistema</p>
          </div>
        )}
        <div className="flex gap-3 md:ml-auto">
          <button onClick={() => queryClient.invalidateQueries({ queryKey: ['admin_users'] })}
            className="p-3 text-slate-500 hover:text-slate-900 bg-white border border-slate-200 hover:border-slate-600 rounded-xl transition-all shadow-sm" title="Actualizar lista">
            <RefreshCw size={20} className={loadingUsers ? 'animate-spin text-orange-400' : ''} />
          </button>
          <button onClick={() => handleOpenModal()}
            className="bg-orange-600 text-white px-6 py-3 rounded-xl font-black flex items-center gap-2 shadow-md transition-all active:scale-95">
            <UserPlus size={20} /> Nuevo Usuario
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 relative z-10">
        <StatCard icon={<Users size={24} />} label="Total Usuarios" value={stats.total} glowColor="orange" />
        <StatCard icon={<UserCheck size={24} />} label="Activos" value={stats.active} glowColor="emerald" />
        <StatCard icon={<Crown size={24} />} label="Admins" value={stats.admins} glowColor="rose" />
        <StatCard icon={<Briefcase size={24} />} label="Supervisores" value={stats.supervisors} glowColor="amber" />
      </div>

      {/* Filtros + orden + vista */}
      <div className="bg-white backdrop-blur-xl p-3 rounded-2xl border border-slate-200 shadow-2xl flex flex-col lg:flex-row gap-3 items-stretch lg:items-center sticky top-4 z-30">
        <div className="flex-1 relative w-full group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-orange-400 transition-colors" size={20} />
          <input type="text" placeholder="Buscar por nombre o email..."
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30 transition-all text-slate-900 placeholder-slate-500 font-medium"
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <div className="flex gap-2 w-full lg:w-auto overflow-x-auto pb-1 lg:pb-0">
          <select className="px-3 py-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl outline-none focus:border-orange-500 font-bold text-slate-700 cursor-pointer text-sm" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
            <option value="">Todos los roles</option>
            {roles.map(r => <option key={r.id} value={r.id}>{r.nombre}</option>)}
          </select>
          <select className="px-3 py-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl outline-none focus:border-orange-500 font-bold text-slate-700 cursor-pointer text-sm" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">Todos los estados</option>
            <option value="active">Activos</option>
            <option value="inactive">Inactivos</option>
          </select>
          <select className="px-3 py-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl outline-none focus:border-orange-500 font-bold text-slate-700 cursor-pointer text-sm" value={sortBy} onChange={(e) => setSortBy(e.target.value)} title="Ordenar">
            <option value="recientes">Más recientes</option>
            <option value="nombre">Nombre (A-Z)</option>
            <option value="rol">Rol</option>
            <option value="ultimo">Último acceso</option>
            <option value="estado">Estado</option>
          </select>
          <div className="flex bg-slate-50 border border-slate-200 rounded-xl p-1 shrink-0">
            <button onClick={() => setViewMode('cards')} title="Tarjetas" className={`p-2 rounded-lg transition-colors ${viewMode === 'cards' ? 'bg-orange-600 text-white' : 'text-slate-400 hover:text-slate-700'}`}><LayoutGrid size={18} /></button>
            <button onClick={() => setViewMode('table')} title="Tabla" className={`p-2 rounded-lg transition-colors ${viewMode === 'table' ? 'bg-orange-600 text-white' : 'text-slate-400 hover:text-slate-700'}`}><List size={18} /></button>
          </div>
        </div>
      </div>

      {/* Barra de acciones masivas */}
      {selected.size > 0 && (
        <div className="sticky top-24 z-30 bg-slate-900 text-white rounded-2xl px-4 py-3 flex flex-wrap items-center gap-3 shadow-xl relative anim-fade-up">
          <span className="font-black text-sm">{selected.size} seleccionado(s)</span>
          <button onClick={clearSelection} className="text-slate-300 hover:text-white text-xs font-bold underline">Limpiar</button>
          <div className="h-5 w-px bg-white/20 mx-1" />
          <button onClick={() => doBulk('activar')} disabled={bulkMutation.isPending} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-black hover:bg-emerald-500/30 disabled:opacity-50"><Power size={14} /> Activar</button>
          <button onClick={() => doBulk('desactivar')} disabled={bulkMutation.isPending} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-500/20 text-slate-200 border border-slate-400/30 text-xs font-black hover:bg-slate-500/30 disabled:opacity-50"><PowerOff size={14} /> Desactivar</button>
          <div className="inline-flex items-center gap-1.5">
            <select value={bulkRole} onChange={(e) => { const v = e.target.value; setBulkRole(v); if (v) doBulk('rol', v); }}
              className="px-3 py-1.5 rounded-lg bg-white/10 text-white border border-white/20 text-xs font-bold outline-none cursor-pointer">
              <option value="" className="text-slate-900">Cambiar rol a…</option>
              {roles.map(r => <option key={r.id} value={r.id} className="text-slate-900">{r.nombre}</option>)}
            </select>
          </div>
          <button onClick={() => doBulk('eliminar')} disabled={bulkMutation.isPending} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-400/30 text-xs font-black hover:bg-rose-500/30 disabled:opacity-50 ml-auto"><Trash2 size={14} /> Eliminar</button>
          {bulkMutation.isPending && <Loader2 size={16} className="animate-spin" />}
        </div>
      )}

      <div className="flex items-center justify-between text-xs font-bold text-slate-400 relative z-10 px-1">
        <span>{filteredUsers.length} de {users.length} usuarios</span>
        {filteredUsers.length > 0 && (
          <button onClick={toggleSelectAll} className="inline-flex items-center gap-1.5 hover:text-orange-500 transition-colors">
            {allVisibleSelected ? <CheckSquare size={15} /> : <Square size={15} />} Seleccionar todos
          </button>
        )}
      </div>

      {/* Contenido */}
      <div className="relative z-10">
        {loadingUsers || loadingRoles ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <div className="w-16 h-16 border-4 border-slate-200 border-t-orange-500 rounded-full animate-spin"></div>
            <p className="text-slate-500 font-bold animate-pulse">Cargando directorio...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center bg-white rounded-3xl border-2 border-dashed border-slate-200">
            <div className="bg-slate-50 p-6 rounded-full mb-4 border border-slate-200"><Search size={48} className="text-slate-500" /></div>
            <h3 className="text-xl font-bold text-slate-900">No se encontraron usuarios</h3>
            <p className="text-slate-500 mt-1">Intenta ajustar los filtros de búsqueda</p>
          </div>
        ) : viewMode === 'table' ? (
          /* ── Vista tabla compacta ── */
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-400 font-black">
                    <th className="p-3 w-10"><button onClick={toggleSelectAll}>{allVisibleSelected ? <CheckSquare size={16} className="text-orange-600" /> : <Square size={16} className="text-slate-300" />}</button></th>
                    <th className="p-3 text-left">Usuario</th>
                    <th className="p-3 text-left hidden sm:table-cell">Rol</th>
                    <th className="p-3 text-left">Estado</th>
                    <th className="p-3 text-left hidden md:table-cell">Último acceso</th>
                    <th className="p-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(user => {
                    const isSel = selected.has(user.id);
                    return (
                      <tr key={user.id} className={`border-b border-slate-100 last:border-0 transition-colors ${isSel ? 'bg-orange-50/60' : 'hover:bg-slate-50'}`}>
                        <td className="p-3"><button onClick={(e) => toggleSelect(user.id, e)}>{isSel ? <CheckSquare size={16} className="text-orange-600" /> : <Square size={16} className="text-slate-300" />}</button></td>
                        <td className="p-3">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs shrink-0 ${getRoleBadgeColor(user.rol)}`}>{user.nombre?.charAt(0).toUpperCase()}</div>
                            <div className="min-w-0">
                              <div className="font-bold text-slate-900 truncate flex items-center gap-1.5">{user.nombre}{(user.rol === 'ADMIN' || user.es_admin_delegado) && <Crown size={12} className="text-amber-500" />}</div>
                              <div className="text-xs text-slate-400 truncate">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-3 hidden sm:table-cell">
                          <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg border text-xs font-bold ${getRoleBadgeColor(user.rol)}`}>{getRoleIcon(user.rol)}{rolesById[user.rol]?.nombre || user.rol}</span>
                        </td>
                        <td className="p-3">
                          <button onClick={(e) => quickToggle(user, e)} title={user.activo ? 'Desactivar' : 'Activar'}
                            className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[11px] font-black border transition-colors ${user.activo ? 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100' : 'bg-slate-100 text-slate-400 border-slate-200 hover:bg-slate-200'}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${user.activo ? 'bg-emerald-500' : 'bg-slate-400'}`} />{user.activo ? 'Activo' : 'Inactivo'}
                          </button>
                        </td>
                        <td className="p-3 hidden md:table-cell text-xs text-slate-500 whitespace-nowrap"><span className="inline-flex items-center gap-1"><Clock size={12} className="text-slate-300" />{fmtUltimo(user.last_seen)}</span></td>
                        <td className="p-3">
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => handleOpenModal(user)} className="p-2 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors" title="Editar"><Edit size={16} /></button>
                            <button onClick={() => handleDelete(user.id)} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors" title="Eliminar"><Trash2 size={16} /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* ── Vista tarjetas ── */
          <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
            {filteredUsers.map(user => {
              const isSel = selected.has(user.id);
              return (
              <div key={user.id} className={`group bg-white backdrop-blur-md rounded-3xl border shadow-sm hover:shadow-2xl transition-all duration-300 overflow-hidden relative ${isSel ? 'border-orange-400 ring-2 ring-orange-200' : 'border-slate-200 hover:border-slate-600'}`}>
                <div className={`h-24 w-full absolute top-0 left-0 transition-colors ${user.activo ? 'bg-gradient-to-b from-orange-500/10 to-transparent' : 'bg-slate-100'}`}></div>

                {/* checkbox selección */}
                <button onClick={(e) => toggleSelect(user.id, e)} className="absolute top-3 left-3 z-20 p-1 rounded-lg bg-white/80 backdrop-blur border border-slate-200 shadow-sm">
                  {isSel ? <CheckSquare size={18} className="text-orange-600" /> : <Square size={18} className="text-slate-300" />}
                </button>

                <div className="p-4 sm:p-6 relative pt-6 sm:pt-8">
                  <div className="flex justify-between items-start mb-4">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black border shadow-lg transform group-hover:scale-110 transition-transform duration-300
                      ${user.rol === 'ADMIN' ? 'bg-rose-500/20 border-rose-500/30 text-rose-400' : user.rol === 'SUPERVISOR' ? 'bg-amber-500/20 border-amber-500/30 text-amber-400' : 'bg-orange-500/20 border-orange-500/30 text-orange-400'}`}>
                      {user.nombre?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {/* toggle rápido activo */}
                      <button onClick={(e) => quickToggle(user, e)} title={user.activo ? 'Desactivar' : 'Activar'}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border transition-colors ${user.activo ? 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100' : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'}`}>
                        {user.activo ? 'Activo' : 'Inactivo'}
                      </button>
                      {(user.rol === 'ADMIN' || user.es_admin_delegado) && (
                        <span className={`p-1.5 rounded-lg border ${user.es_admin_delegado ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}`} title={user.es_admin_delegado ? 'Administrador Delegado' : 'Administrador'}><Crown size={14} /></span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1 mb-4">
                    <h3 className="font-black text-xl text-slate-900 leading-tight truncate" title={user.nombre}>{user.nombre}</h3>
                    <p className="text-sm text-slate-500 truncate font-medium">{user.email}</p>
                    <p className="text-[11px] text-slate-400 font-bold flex items-center gap-1"><Clock size={11} /> Último acceso: {fmtUltimo(user.last_seen)}</p>
                  </div>

                  <div className="flex items-center gap-2 mb-6">
                    <div className={`flex-1 flex items-center gap-2 px-3 py-2 rounded-xl border ${getRoleBadgeColor(user.rol)}`}>
                      {getRoleIcon(user.rol)}
                      <span className="font-bold text-xs truncate">{rolesById[user.rol]?.nombre || user.rol}</span>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4 border-t border-slate-200">
                    <button onClick={() => handleOpenModal(user)} className="flex-1 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-900 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2"><Edit size={16} /> Editar</button>
                    <button onClick={() => handleDelete(user.id)} className="p-2.5 text-slate-500 bg-slate-50 hover:bg-rose-500/10 border border-slate-200 hover:border-rose-500/30 hover:text-rose-400 rounded-xl transition-colors" title="Eliminar usuario"><Trash2 size={18} /></button>
                  </div>
                </div>
              </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal (alta/edición) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-50/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div ref={modalRef} className="bg-white border border-slate-200 rounded-[2rem] w-full max-w-lg shadow-2xl overflow-hidden relative max-h-[92vh] overflow-y-auto">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-orange-500 to-purple-500"></div>
            <div className="px-4 sm:px-8 py-4 sm:py-6 border-b border-slate-200 flex justify-between items-center bg-slate-50 sticky top-0 z-10">
              <div>
                <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">{editingUser ? 'Editar Perfil' : 'Nuevo Usuario'}</h2>
                <p className="text-slate-500 text-sm font-medium">Configura los datos de acceso</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="bg-slate-100 p-2 rounded-full border border-slate-200 text-slate-500 hover:text-rose-400 hover:border-rose-400/30 transition-all hover:rotate-90"><X size={20} /></button>
            </div>

            <form onSubmit={handleSave} className="p-4 sm:p-8 space-y-4 sm:space-y-6">
              <div className="space-y-5">
                <div className="group">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Nombre Completo</label>
                  <div className="relative">
                    <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                    <input type="text" required className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30 transition-all font-bold text-slate-900 placeholder-slate-600"
                      placeholder="Ej: Juan Pérez" value={formData.nombre} onChange={e => setFormData({ ...formData, nombre: e.target.value })} />
                  </div>
                </div>

                <div className="group">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Email Corporativo</label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-black">@</div>
                    <input type="email" required className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30 transition-all font-bold text-slate-900 placeholder-slate-600"
                      placeholder="usuario@empresa.com" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                  </div>
                </div>

                <div className="group">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">{editingUser ? 'Nueva Contraseña (Opcional)' : 'Contraseña Inicial'}</label>
                  <div className="relative">
                    <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                    <input type={showPassword ? 'text' : 'password'} required={!editingUser} minLength={6}
                      className="w-full pl-12 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30 transition-all font-bold text-slate-900 placeholder-slate-600"
                      value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} placeholder={editingUser ? '••••••••' : 'Mínimo 6 caracteres'} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-900 transition-colors">{showPassword ? <EyeOff size={20} /> : <Eye size={20} />}</button>
                  </div>
                </div>

                <div className="grid grid-cols-1 xs:grid-cols-2 gap-4 sm:gap-6">
                  <div className="group">
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Rol de Acceso</label>
                    <div className="relative">
                      <select required className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30 transition-all font-bold text-slate-900 appearance-none cursor-pointer"
                        value={formData.rol} onChange={e => setFormData({ ...formData, rol: e.target.value })}>
                        <option value="" disabled>Seleccionar...</option>
                        {roles.map(r => <option key={r.id} value={r.id}>{r.nombre}</option>)}
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500"><Briefcase size={16} /></div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Estado</label>
                    <div onClick={() => setFormData({ ...formData, activo: !formData.activo })}
                      className={`h-[52px] w-full rounded-xl flex items-center px-4 cursor-pointer transition-all border ${formData.activo ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200'}`}>
                      <div className={`w-12 h-6 rounded-full relative transition-colors ${formData.activo ? 'bg-emerald-500' : 'bg-slate-200'}`}>
                        <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform shadow-sm ${formData.activo ? 'translate-x-6' : 'translate-x-0'}`}></div>
                      </div>
                      <span className={`ml-3 font-bold text-sm ${formData.activo ? 'text-emerald-600' : 'text-slate-500'}`}>{formData.activo ? 'Activo' : 'Inactivo'}</span>
                    </div>
                  </div>
                </div>

                {/* Resumen PRECISO del rol elegido */}
                {formData.rol && (() => {
                  const rolSel = rolesById[formData.rol];
                  if (!rolSel) return null;
                  const permisos = rolSel.permisos_json || [];
                  const { modulos } = accesosConPermisos(permisos);
                  const landing = APP_ROUTES.find(r => r.value === rolSel.landing_page)?.label || rolSel.landing_page;
                  return (
                    <div className="bg-orange-50 rounded-xl p-4 border border-orange-100 text-xs space-y-2">
                      <div className="font-black text-orange-800">Este rol otorga {permisos.length} permiso(s) · verá {modulos.length} módulo(s){rolSel.descripcion ? <span className="font-medium text-orange-500"> — {rolSel.descripcion}</span> : null}</div>
                      <div className="flex flex-wrap gap-1.5">
                        {modulos.map(m => (
                          <span key={m.id} title={m.rutas.map(r => r.label).join('\n')} className={`px-2 py-0.5 rounded-md border font-bold ${m.soloAdmin ? 'bg-orange-50 text-orange-600 border-orange-200' : 'bg-white text-orange-700 border-orange-200'}`}>{m.label} · {m.rutas.length}</span>
                        ))}
                        {modulos.length === 0 && <span className="text-orange-400 font-medium">Sin accesos — configura los permisos del rol en la pestaña Roles.</span>}
                      </div>
                      {landing && <div className="text-orange-600">Página de inicio: <b>{landing}</b></div>}
                      {modulos.some(m => m.soloAdmin) && <div className="text-orange-600 text-[11px]">Las rutas de Configuración además requieren rol ADMIN.</div>}
                    </div>
                  );
                })()}

                <div className="bg-amber-500/10 rounded-xl p-4 border border-amber-500/20 mt-4 flex items-start gap-3">
                  <div className="bg-amber-500/20 text-amber-400 p-2 rounded-lg flex-shrink-0 mt-1"><Crown size={20} /></div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-sm font-bold text-amber-400 block">Delegar Administración</label>
                      <div onClick={() => setFormData(prev => ({ ...prev, es_admin_delegado: !prev.es_admin_delegado }))}
                        className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${formData.es_admin_delegado ? 'bg-amber-500' : 'bg-slate-200'}`}>
                        <div className={`absolute top-0.5 left-0.5 bg-white w-4 h-4 rounded-full transition-transform shadow-sm ${formData.es_admin_delegado ? 'translate-x-5' : 'translate-x-0'}`}></div>
                      </div>
                    </div>
                    <p className="text-[11px] text-amber-500/80 leading-tight font-medium">Otorga accesos totales sin cambiar el rol visual original.</p>
                  </div>
                </div>
              </div>

              <div className="pt-6 flex gap-4 border-t border-slate-200">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl font-bold transition-colors">Cancelar</button>
                <button type="submit" disabled={saveMutation.isPending} className="flex-[2] py-4 bg-orange-600 text-white rounded-xl font-black flex items-center justify-center gap-2 shadow-md transition-all hover:scale-[1.02] disabled:opacity-70 disabled:scale-100">
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
