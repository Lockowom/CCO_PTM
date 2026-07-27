import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../supabase';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';
import { APP_PERMISSIONS, APP_ROUTES } from '../../config/modules';
import { accesosConPermisos } from '../../constants/permissions';
import { getRoleBlueprint } from '../../config/iamBlueprints.js';
import {
  Shield,
  Plus,
  Edit,
  Trash2,
  Save,
  Check,
  Lock,
  Users,
  LayoutDashboard,
  Truck,
  Search,
  Settings,
  Loader2,
  ArrowDownToLine,
  ArrowUpFromLine,
  Layers,
  FileBarChart,
  ArrowLeft
} from 'lucide-react';

// Mapeo de iconos para los módulos
const MODULE_ICONS = {
  dashboard: <LayoutDashboard size={16} />,
  tms: <Truck size={16} />,
  inbound: <ArrowDownToLine size={16} />,
  outbound: <ArrowUpFromLine size={16} />,
  queries: <Search size={16} />,
  analytics: <FileBarChart size={16} />,
  quality: <Check size={16} />,
  admin: <Settings size={16} />
};

// Generar la lista de módulos dinámicamente desde la configuración central
const modules = APP_PERMISSIONS.map((m) => ({
  ...m,
  icon: MODULE_ICONS[m.id] || <Shield size={16} />
}));

const RolesPage = ({ embedded = false }) => {
  const { refreshPermissions } = useAuth();
  const queryClient = useQueryClient();
  const containerRef = React.useRef();

  const [selectedRole, setSelectedRole] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const { data: roles = [], isLoading } = useQuery({
    queryKey: ['admin_roles'],
    queryFn: async () => {
      const { data: rolesData, error: rolesError } = await supabase
        .from('tms_roles')
        .select('*')
        .order('nombre');
      if (rolesError) throw rolesError;

      const { data: usersData } = await supabase.from('tms_usuarios').select('rol');
      const userCounts = {};
      (usersData || []).forEach((u) => {
        userCounts[u.rol] = (userCounts[u.rol] || 0) + 1;
      });

      return rolesData.map((rol) => ({
        ...rol,
        usuarios: userCounts[rol.id] || 0,
        permisos: rol.permisos_json || []
      }));
    }
  });

  const saveRoleMutation = useMutation({
    mutationFn: async (roleData) => {
      const roleId = isCreating ? roleData.nombre.toUpperCase().replace(/\s+/g, '_') : roleData.id;
      const roleName = roleData.id === 'ADMIN' ? 'Administrador' : roleData.nombre;

      const { error } = await supabase.from('tms_roles').upsert(
        {
          id: roleId,
          nombre: roleName,
          descripcion: roleData.descripcion,
          landing_page: roleData.landing_page || null,
          permisos_json: roleData.permisos || []
        },
        { onConflict: 'id' }
      );

      if (error) throw error;
      return roleData;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin_roles'] });
      await refreshPermissions();
      toast.success('Rol guardado exitosamente');
      setIsEditing(false);
      setIsCreating(false);
    },
    onError: (error) => {
      toast.error(`Error al guardar: ${error.message}`);
    }
  });

  const deleteRoleMutation = useMutation({
    mutationFn: async (roleId) => {
      const { error } = await supabase.from('tms_roles').delete().eq('id', roleId);
      if (error) throw error;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin_roles'] });
      await refreshPermissions();
      toast.success('Rol eliminado');
      setSelectedRole(null);
    },
    onError: (error) => {
      toast.error(`Error al eliminar: ${error.message}`);
    }
  });

  // Usuarios que tienen el rol seleccionado (precisión: ver a quién afecta).
  const { data: usuariosRol = [] } = useQuery({
    queryKey: ['rol_usuarios', selectedRole?.id || ''],
    enabled: !!selectedRole?.id,
    queryFn: async () => {
      const { data } = await supabase
        .from('tms_usuarios')
        .select('nombre, activo')
        .eq('rol', selectedRole.id)
        .order('nombre');
      return data || [];
    }
  });

  const handleCreateRole = () => {
    setSelectedRole({
      id: '',
      nombre: 'Nuevo Rol',
      descripcion: 'Descripción del rol',
      landing_page: '',
      usuarios: 0,
      permisos: []
    });
    setIsCreating(true);
    setIsEditing(true);
  };

  // Duplicar un rol existente (mismos permisos y landing, nuevo nombre/ID).
  const handleDuplicateRole = (role, e) => {
    e?.stopPropagation();
    setSelectedRole({
      id: '',
      nombre: `${role.nombre} (copia)`,
      descripcion: role.descripcion || '',
      landing_page: role.landing_page || '',
      usuarios: 0,
      permisos: [...(role.permisos || [])]
    });
    setIsCreating(true);
    setIsEditing(true);
  };

  const handleSaveRole = () => {
    saveRoleMutation.mutate(selectedRole);
  };

  const applyBlueprint = () => {
    const blueprint = getRoleBlueprint(selectedRole?.id);
    if (!blueprint) return;
    setSelectedRole((prev) => ({
      ...prev,
      nombre: blueprint.nombre,
      descripcion: blueprint.descripcion,
      landing_page: blueprint.landingPage,
      permisos: [...blueprint.permissions]
    }));
    toast.success(`Plantilla oficial cargada para ${blueprint.id}`);
  };

  const handleDeleteRole = (roleId) => {
    if (!confirm('¿Eliminar este rol?')) return;
    deleteRoleMutation.mutate(roleId);
  };

  const togglePermission = (permId) => {
    if (!isEditing) return;
    setSelectedRole((prev) => {
      const perms = prev.permisos || [];
      const newPerms = perms.includes(permId)
        ? perms.filter((p) => p !== permId)
        : [...perms, permId];
      return { ...prev, permisos: newPerms };
    });
  };

  const selectAllModule = (moduleId) => {
    if (!isEditing) return;
    const module = modules.find((m) => m.id === moduleId);
    const allPerms = module.permissions.map((p) => p.id);

    setSelectedRole((prev) => {
      const currentPerms = prev.permisos || [];
      const hasAll = allPerms.every((p) => currentPerms.includes(p));
      const newPerms = hasAll
        ? currentPerms.filter((p) => !allPerms.includes(p))
        : [...new Set([...currentPerms, ...allPerms])];
      return { ...prev, permisos: newPerms };
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="animate-spin text-emerald-500" size={40} />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={
        embedded
          ? 'flex flex-col space-y-4 sm:space-y-6'
          : 'h-full flex flex-col space-y-4 sm:space-y-6 bg-slate-50 p-3 sm:p-6 min-h-screen'
      }
    >
      {/* Header (oculto en modo embebido: la cabecera vive en AccessControl) */}
      {!embedded && (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 sm:gap-6 bg-white p-4 sm:p-8 rounded-2xl sm:rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/50 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full blur-3xl -mr-20 -mt-20 opacity-60"></div>
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500"></div>

          <div className="flex items-center gap-3 sm:gap-6 relative z-10">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-emerald-50 border border-emerald-100 rounded-xl sm:rounded-[1.5rem] flex items-center justify-center text-emerald-600 shadow-lg shadow-emerald-500/10 flex-shrink-0">
              <Shield size={24} className="sm:hidden" strokeWidth={2.5} />
              <Shield size={32} className="hidden sm:block" strokeWidth={2.5} />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-4xl font-black text-slate-900 tracking-tight">
                Roles y <span className="text-emerald-600">Permisos</span>
              </h1>
              <p className="text-slate-500 font-bold mt-1 text-sm sm:text-lg">
                Gestión de accesos y perfiles
              </p>
            </div>
          </div>

          {!selectedRole && !isCreating && (
            <button
              onClick={handleCreateRole}
              className="bg-emerald-600 text-white px-8 py-4 rounded-2xl font-black flex items-center gap-3 shadow-lg shadow-emerald-600/20 hover:shadow-emerald-600/40 hover:-translate-y-1 transition-all active:scale-95 relative z-10"
            >
              <Plus size={24} /> Nuevo Rol
            </button>
          )}
        </div>
      )}

      <div className="flex flex-col gap-8 flex-1">
        {(!selectedRole || isCreating) && !isEditing ? (
          <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-8">
            {roles.map((role) => (
              <div
                key={role.id}
                onClick={() => setSelectedRole(role)}
                className="bg-white rounded-2xl sm:rounded-[2.5rem] border border-slate-100 p-4 sm:p-8 cursor-pointer shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)] hover:border-emerald-200 hover:-translate-y-2 transition-all group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                  <Shield size={80} className="text-emerald-600" />
                </div>

                <div className="flex justify-between items-start mb-6 relative z-10">
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center ${role.id === 'ADMIN' ? 'bg-orange-50 text-orange-600 border border-orange-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}
                  >
                    {role.id === 'ADMIN' ? <Lock size={28} /> : <Users size={28} />}
                  </div>
                  <div className="flex items-center gap-2">
                    {role.id !== 'ADMIN' && (
                      <span className="bg-slate-50 text-slate-500 border border-slate-100 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full">
                        {role.usuarios} usuarios
                      </span>
                    )}
                    <button
                      onClick={(e) => handleDuplicateRole(role, e)}
                      title="Duplicar rol (mismos permisos)"
                      className="p-2 rounded-xl border border-slate-100 text-slate-300 hover:text-emerald-600 hover:border-emerald-200 hover:bg-emerald-50 transition-all"
                    >
                      <Layers size={16} />
                    </button>
                  </div>
                </div>

                <h3 className="text-2xl font-black text-slate-900 mb-3 group-hover:text-emerald-600 transition-colors tracking-tight">
                  {role.nombre}
                </h3>
                <p className="text-base text-slate-500 font-medium mb-8 line-clamp-2 h-12 leading-relaxed">
                  {role.descripcion || 'Sin descripción'}
                </p>

                <div className="flex items-center justify-between border-t border-slate-50 pt-6 mt-auto">
                  <div className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest">
                    <Shield size={16} className="text-emerald-500/50" />
                    {role.permisos?.length || 0} permisos
                  </div>
                  <span className="text-emerald-600 text-sm font-black flex items-center gap-2 group-hover:translate-x-2 transition-transform uppercase tracking-widest">
                    Editar <Edit size={16} />
                  </span>
                </div>
              </div>
            ))}

            <button
              onClick={handleCreateRole}
              className="bg-white rounded-[2.5rem] border-4 border-dashed border-slate-100 p-8 flex flex-col items-center justify-center gap-6 text-slate-400 hover:text-emerald-600 hover:border-emerald-200 hover:bg-emerald-50/30 transition-all group min-h-[300px]"
            >
              <div className="w-20 h-20 rounded-full bg-slate-50 border-2 border-slate-100 flex items-center justify-center group-hover:border-emerald-200 group-hover:bg-white transition-all shadow-inner">
                <Plus size={40} strokeWidth={3} />
              </div>
              <span className="font-black text-xl uppercase tracking-tighter">Crear Nuevo Rol</span>
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl sm:rounded-[3rem] border border-slate-200 shadow-[0_30px_100px_rgba(0,0,0,0.08)] flex flex-col overflow-hidden flex-1">
            {(() => {
              const blueprint = getRoleBlueprint(selectedRole?.id);
              if (!blueprint) return null;
              return (
                <div className="mx-4 mt-4 sm:mx-10 sm:mt-10 rounded-2xl border border-orange-200 bg-orange-50 px-5 py-4 text-sm text-orange-900">
                  <div className="font-black uppercase tracking-wider text-[11px] text-orange-700">
                    Plantilla Oficial Frontend
                  </div>
                  <div className="mt-1 font-semibold">
                    Este rol tiene blueprint central en `src/config/iamBlueprints.js` con landing `
                    {blueprint.landingPage}` y {blueprint.permissions.length} permiso(s).
                  </div>
                </div>
              );
            })()}
            <div className="p-4 sm:p-10 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start bg-slate-50/30 gap-4">
              <div className="flex items-center gap-8 flex-1">
                <button
                  onClick={() => {
                    setSelectedRole(null);
                    setIsEditing(false);
                    setIsCreating(false);
                  }}
                  className="p-4 bg-white hover:bg-slate-100 rounded-[1.5rem] text-slate-400 hover:text-slate-900 transition-all border border-slate-200 shadow-sm"
                >
                  <ArrowLeft size={28} />
                </button>

                <div className="flex-1 mr-12">
                  {isEditing ? (
                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 items-start">
                      <div className="flex-1 w-full">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">
                          Nombre del Rol
                        </label>
                        <input
                          type="text"
                          value={selectedRole.nombre}
                          onChange={(e) =>
                            setSelectedRole({ ...selectedRole, nombre: e.target.value })
                          }
                          disabled={selectedRole.id === 'ADMIN'}
                          className="w-full text-3xl font-black text-slate-900 bg-transparent border-b-2 border-slate-200 focus:border-emerald-500 outline-none px-0 py-2 transition-all disabled:opacity-50"
                          placeholder="Nombre del Rol"
                          autoFocus
                        />
                      </div>
                      <div className="flex-[2]">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">
                          Descripción
                        </label>
                        <input
                          type="text"
                          value={selectedRole.descripcion || ''}
                          onChange={(e) =>
                            setSelectedRole({ ...selectedRole, descripcion: e.target.value })
                          }
                          className="w-full text-xl text-slate-600 font-bold bg-transparent border-b-2 border-slate-200 focus:border-emerald-500 outline-none px-0 py-2 transition-all"
                          placeholder="Descripción breve del rol"
                        />
                      </div>
                      <div className="flex-1 w-full">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">
                          Página de inicio
                        </label>
                        <select
                          value={selectedRole.landing_page || ''}
                          onChange={(e) =>
                            setSelectedRole({ ...selectedRole, landing_page: e.target.value })
                          }
                          className="w-full text-sm font-bold text-slate-700 bg-white border-2 border-slate-200 focus:border-emerald-500 outline-none rounded-xl px-3 py-2.5 transition-all"
                        >
                          <option value="">— Por defecto —</option>
                          {APP_ROUTES.map((r) => (
                            <option key={r.value} value={r.value}>
                              {r.label}
                            </option>
                          ))}
                        </select>
                        {isCreating && selectedRole.nombre && (
                          <p className="text-[10px] text-slate-400 font-bold mt-1.5">
                            ID del rol: {selectedRole.nombre.toUpperCase().replace(/\s+/g, '_')}
                          </p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center gap-4">
                        <h2 className="text-4xl font-black text-slate-900 tracking-tight">
                          {selectedRole.nombre}
                        </h2>
                        {selectedRole.id === 'ADMIN' && (
                          <span className="bg-orange-50 border border-orange-100 text-orange-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                            <Lock size={12} strokeWidth={3} /> Sistema
                          </span>
                        )}
                      </div>
                      <p className="text-slate-500 mt-2 text-xl font-medium leading-relaxed">
                        {selectedRole.descripcion}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-4">
                {isEditing ? (
                  <>
                    {getRoleBlueprint(selectedRole?.id) && (
                      <button
                        onClick={applyBlueprint}
                        className="px-6 py-4 bg-orange-50 text-orange-700 hover:bg-orange-100 border border-orange-200 rounded-2xl font-black uppercase tracking-widest flex items-center gap-3 transition-all"
                      >
                        <Layers size={20} /> Cargar Plantilla
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setIsCreating(false);
                        if (isCreating) setSelectedRole(null);
                      }}
                      className="px-8 py-4 text-slate-500 hover:bg-slate-100 rounded-2xl font-black uppercase tracking-widest transition-all"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleSaveRole}
                      disabled={saveRoleMutation.isPending}
                      className="px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black uppercase tracking-widest flex items-center gap-3 shadow-lg shadow-emerald-600/20 transition-all disabled:opacity-50"
                    >
                      {saveRoleMutation.isPending ? (
                        <Loader2 className="animate-spin" size={20} />
                      ) : (
                        <Save size={20} />
                      )}
                      {saveRoleMutation.isPending ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => handleDeleteRole(selectedRole.id)}
                      disabled={selectedRole.id === 'ADMIN' || selectedRole.usuarios > 0}
                      className="p-4 text-slate-400 hover:text-rose-500 hover:bg-rose-50 border border-slate-200 rounded-2xl transition-all disabled:opacity-10 shadow-sm"
                      title="Eliminar Rol"
                    >
                      <Trash2 size={24} />
                    </button>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-8 py-4 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200 rounded-2xl font-black uppercase tracking-widest flex items-center gap-3 transition-all"
                    >
                      <Edit size={20} /> Editar Permisos
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto bg-slate-50/50 p-3 sm:p-12">
              <div className="max-w-7xl mx-auto">
                {/* PRECISIÓN: qué otorga este set de permisos + a quién afecta (en vivo) */}
                {(() => {
                  const { modulos } = accesosConPermisos(selectedRole.permisos || []);
                  const landingLabel = APP_ROUTES.find(
                    (r) => r.value === selectedRole.landing_page
                  )?.label;
                  return (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
                      <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">
                          Accesos que otorga {isEditing ? '(se actualiza al marcar permisos)' : ''}
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {modulos.map((m) => (
                            <span
                              key={m.id}
                              title={m.rutas.map((r) => r.label).join('\n')}
                              className={`px-3 py-1.5 rounded-xl border text-xs font-black ${m.soloAdmin ? 'bg-orange-50 text-orange-600 border-orange-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}
                            >
                              {m.label} · {m.rutas.length} pantalla(s)
                            </span>
                          ))}
                          {modulos.length === 0 && (
                            <span className="text-slate-400 text-sm font-bold">
                              Sin accesos aún — marca permisos abajo y verás aquí qué pantallas
                              desbloquean.
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-[11px] text-slate-500">
                          {landingLabel && (
                            <span>
                              Inicio: <b className="text-slate-700">{landingLabel}</b>
                            </span>
                          )}
                          <span>{(selectedRole.permisos || []).length} permiso(s) marcados</span>
                          {modulos.some((m) => m.soloAdmin) && (
                            <span className="text-orange-600 font-bold">
                              Configuración requiere además rol ADMIN
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="bg-white rounded-2xl border border-slate-200 p-5">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">
                          Usuarios con este rol ({usuariosRol.length})
                        </h4>
                        <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                          {usuariosRol.map((u, i) => (
                            <span
                              key={i}
                              className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold ${u.activo ? 'bg-slate-50 text-slate-700 border-slate-200' : 'bg-slate-100 text-slate-400 border-slate-200 line-through'}`}
                            >
                              {u.nombre}
                            </span>
                          ))}
                          {usuariosRol.length === 0 && (
                            <span className="text-slate-400 text-xs font-bold">
                              Nadie tiene este rol todavía.
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })()}

                <div className="flex items-center justify-between mb-10">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-3">
                    <Shield size={20} className="text-emerald-500" /> Configuración de Accesos por
                    Módulo
                  </h3>
                  {isEditing && (
                    <p className="text-xs font-bold text-slate-400 italic">
                      Haz clic en un módulo o permiso para alternar
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-8">
                  {modules.map((module) => {
                    const allPerms = module.permissions.map((p) => p.id);
                    const enabledCount = allPerms.filter((p) =>
                      selectedRole.permisos?.includes(p)
                    ).length;
                    const hasAll = enabledCount === allPerms.length;
                    const isNone = enabledCount === 0;

                    return (
                      <div
                        key={module.id}
                        className={`bg-white rounded-[2.5rem] border transition-all duration-500 ${hasAll ? 'border-emerald-500 shadow-xl shadow-emerald-500/5' : 'border-slate-100 shadow-sm'}`}
                      >
                        <div
                          className={`p-6 border-b transition-colors rounded-t-[2.5rem] flex items-center justify-between ${hasAll ? 'bg-emerald-50/50 border-emerald-100' : 'bg-slate-50/50 border-slate-100'}`}
                        >
                          <div className="flex items-center gap-4">
                            <div
                              className={`p-3 rounded-2xl transition-all ${hasAll ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : isNone ? 'bg-white text-slate-300 border border-slate-100' : 'bg-orange-50 text-orange-500 border border-orange-100'}`}
                            >
                              {module.icon}
                            </div>
                            <div>
                              <h4
                                className={`text-lg font-black tracking-tight ${hasAll ? 'text-emerald-700' : 'text-slate-900'}`}
                              >
                                {module.label}
                              </h4>
                              {!isEditing && (
                                <span
                                  className={`text-[10px] font-black uppercase tracking-widest ${hasAll ? 'text-emerald-500' : 'text-slate-400'}`}
                                >
                                  {enabledCount} de {allPerms.length} activos
                                </span>
                              )}
                            </div>
                          </div>

                          {isEditing && (
                            <button
                              onClick={() => selectAllModule(module.id)}
                              className={`text-[10px] px-4 py-2 rounded-xl font-black uppercase tracking-widest transition-all ${
                                hasAll
                                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
                                  : 'bg-white text-slate-400 hover:text-slate-900 border border-slate-200'
                              }`}
                            >
                              {hasAll ? 'Ninguno' : 'Todos'}
                            </button>
                          )}
                        </div>

                        <div className="p-6 space-y-3">
                          {module.permissions.map((perm) => {
                            const isEnabled = selectedRole.permisos?.includes(perm.id);
                            return (
                              <div
                                key={perm.id}
                                role="checkbox"
                                aria-checked={isEnabled}
                                className={`flex items-start gap-4 p-3 rounded-2xl transition-all ${
                                  isEditing
                                    ? 'cursor-pointer hover:bg-slate-50 active:scale-[0.98]'
                                    : 'cursor-default opacity-80'
                                }`}
                                onClick={() => isEditing && togglePermission(perm.id)}
                              >
                                <div
                                  className={`mt-0.5 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                                    isEnabled
                                      ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                                      : 'bg-white border-slate-200'
                                  }`}
                                >
                                  {isEnabled && <Check size={14} strokeWidth={4} />}
                                </div>
                                <div>
                                  <span
                                    className={`text-sm block leading-tight tracking-tight ${isEnabled ? 'text-slate-900 font-black' : 'text-slate-500 font-bold'}`}
                                  >
                                    {perm.label}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RolesPage;
