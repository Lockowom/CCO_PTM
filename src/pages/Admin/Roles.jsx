import React, { useState, useEffect } from 'react';
import {
  Shield, Plus, Edit, Trash2, Save, X, Check,
  Lock, Users, LayoutDashboard, Truck, Package,
  Search, Settings, AlertCircle, Loader2,
  Warehouse, ArrowDownToLine, ArrowUpFromLine, FileText,
  Hand, Box, Ship, MapPin, Barcode, History, Timer,
  Satellite, Smartphone, MapPinned, Layers, FileBarChart
} from 'lucide-react';
import { supabase } from '../../supabase';
import { useAuth } from '../../context/AuthContext';

const RolesPage = () => {
  const { refreshPermissions, user } = useAuth(); // Obtener función para refrescar permisos
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false); // Indicador de sincronización realtime

  // Definición COMPLETA de Módulos y Permisos del Sistema
  const modules = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard size={16} />,
      permissions: [
        { id: 'view_dashboard', label: 'Ver Dashboard Principal' },
        { id: 'view_kpis', label: 'Ver KPIs y Estadísticas' }
      ]
    },
    {
      id: 'tms',
      label: 'TMS (Transporte)',
      icon: <Truck size={16} />,
      permissions: [
        { id: 'view_tms_dashboard', label: 'Ver Dashboard TMS' },
        { id: 'view_routes', label: 'Ver Rutas' },
        { id: 'create_routes', label: 'Planificar Rutas' },
        { id: 'view_control_tower', label: 'Ver Torre de Control' },
        { id: 'manage_control_tower', label: 'Gestionar Torre de Control' },
        { id: 'view_drivers', label: 'Ver Conductores' },
        { id: 'manage_drivers', label: 'Gestionar Conductores' },
        { id: 'view_mobile_app', label: 'Acceder App Móvil' },
        { id: 'use_mobile_app', label: 'Usar App Móvil (Entregas)' }
      ]
    },
    {
      id: 'inbound',
      label: 'Inbound (Entrada)',
      icon: <ArrowDownToLine size={16} />,
      permissions: [
        { id: 'view_reception', label: 'Ver Recepciones' },
        { id: 'process_reception', label: 'Procesar Recepciones' },
        { id: 'view_entry', label: 'Ver Ingresos' },
        { id: 'process_entry', label: 'Procesar Ingresos' }
      ]
    },
    {
      id: 'outbound',
      label: 'Outbound (Salida)',
      icon: <ArrowUpFromLine size={16} />,
      permissions: [
        { id: 'view_sales_orders', label: 'Ver Notas de Venta' },
        { id: 'manage_sales_orders', label: 'Gestionar N.V. (Aprobar/Cambiar Estado)' },
        { id: 'view_picking', label: 'Ver Picking' },
        { id: 'process_picking', label: 'Procesar Picking' },
        { id: 'view_packing', label: 'Ver Packing' },
        { id: 'process_packing', label: 'Procesar Packing' },
        { id: 'view_shipping', label: 'Ver Despachos' },
        { id: 'process_shipping', label: 'Gestionar Despachos' },
        { id: 'view_deliveries', label: 'Ver Entregas' },
        { id: 'manage_deliveries', label: 'Gestionar Entregas' }
      ]
    },
    {
      id: 'inventory',
      label: 'Inventario',
      icon: <Warehouse size={16} />,
      permissions: [
        { id: 'view_stock', label: 'Ver Stock' },
        { id: 'manage_stock', label: 'Gestionar Inventario' },
        { id: 'view_layout', label: 'Ver Layout Bodega' },
        { id: 'manage_layout', label: 'Editar Layout' },
        { id: 'view_transfers', label: 'Ver Transferencias' },
        { id: 'manage_transfers', label: 'Gestionar Transferencias' }
      ]
    },
    {
      id: 'queries',
      label: 'Consultas',
      icon: <Search size={16} />,
      permissions: [
        { id: 'view_historial_nv', label: 'Ver Historial N.V.' },
        { id: 'view_batches', label: 'Ver Lotes/Series' },
        { id: 'view_sales_status', label: 'Ver Estado N.V.' },
        { id: 'view_addresses', label: 'Ver Direcciones' },
        { id: 'view_locations', label: 'Ver Ubicaciones' },
        { id: 'export_data', label: 'Exportar Datos (CSV)' }
      ]
    },
    {
      id: 'admin',
      label: 'Administración',
      icon: <Settings size={16} />,
      permissions: [
        { id: 'view_mediciones', label: 'Ver Mediciones de Tiempo' },
        { id: 'manage_mediciones', label: 'Gestionar Mediciones' },
        { id: 'view_users', label: 'Ver Usuarios' },
        { id: 'manage_users', label: 'Gestionar Usuarios' },
        { id: 'view_roles', label: 'Ver Roles' },
        { id: 'manage_roles', label: 'Gestionar Roles' },
        { id: 'view_views', label: 'Ver Configuración Vistas' },
        { id: 'manage_views', label: 'Configurar Vistas/Módulos' },
        { id: 'view_reports', label: 'Ver Reportes' },
        { id: 'manage_data_import', label: 'Carga Masiva de Datos' },
        { id: 'view_audit', label: 'Ver Auditoría' }
      ]
    }
  ];

  useEffect(() => {
    fetchRolesAndPermissions();

    // REALTIME: Escuchar cambios en la tabla tms_roles
    const channel = supabase
      .channel('tms_roles_changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Todos los eventos: INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'tms_roles'
        },
        (payload) => {
          console.log('🔄 Cambio detectado en roles (Realtime):', payload);
          setIsSyncing(true);
          // Refresco automático cuando hay cambios
          fetchRolesAndPermissions();
          // Mostrar indicador de sincronización brevemente
          setTimeout(() => setIsSyncing(false), 300);
        }
      )
      .subscribe();

    // Limpiar listener al desmontar
    return () => {
      channel.unsubscribe();
    };
  }, []);

  const fetchRolesAndPermissions = async () => {
    try {
      setLoading(true);

      const { data: rolesData, error: rolesError } = await supabase
        .from('tms_roles')
        .select('*')
        .order('nombre');

      if (rolesError) throw rolesError;

      const { data: usersData } = await supabase
        .from('tms_usuarios')
        .select('rol');

      const userCounts = {};
      if (usersData) {
        usersData.forEach(u => {
          userCounts[u.rol] = (userCounts[u.rol] || 0) + 1;
        });
      }

      // Formatear roles - ahora usando permisos como JSON en la tabla
      const formattedRoles = rolesData.map(rol => ({
        ...rol,
        usuarios: userCounts[rol.id] || 0,
        // Los permisos están en permisos_json (JSONB) o en un array
        permisos: rol.permisos_json || rol.permisos || []
      }));

      setRoles(formattedRoles);

    } catch (error) {
      console.error('Error fetching roles:', error);
      setRoles([
        {
          id: 'ADMIN',
          nombre: 'Administrador',
          descripcion: 'Acceso total al sistema',
          usuarios: 1,
          permisos: modules.flatMap(m => m.permissions.map(p => p.id))
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRole = () => {
    setSelectedRole({
      id: '',
      nombre: 'Nuevo Rol',
      descripcion: 'Descripción del rol',
      usuarios: 0,
      permisos: []
    });
    setIsCreating(true);
    setIsEditing(true);
  };

  const handleSaveRole = async () => {
    try {
      setLoading(true);

      // Si es ADMIN, siempre usar el ID 'ADMIN'
      const roleId = isCreating
        ? selectedRole.nombre.toUpperCase().replace(/\s+/g, '_')
        : selectedRole.id;

      // Si es ADMIN, siempre usar el nombre original 'Administrador'
      const roleName = selectedRole.id === 'ADMIN' ? 'Administrador' : selectedRole.nombre;

      // SOLUCIÓN DEFINITIVA: Guardar permisos como JSON en la tabla tms_roles
      const { error: roleError } = await supabase
        .from('tms_roles')
        .upsert(
          {
            id: roleId,
            nombre: roleName,
            descripcion: selectedRole.descripcion,
            permisos_json: selectedRole.permisos || []  // Guardar permisos como JSON
          },
          { onConflict: 'id' }
        );

      if (roleError) {
        console.error('Error saving role:', roleError);
        throw new Error(`Error al guardar rol: ${roleError.message}`);
      }

      // PASO 2: Recargar datos
      await fetchRolesAndPermissions();
      
      // PASO 3: Si el rol guardado es el rol del usuario actual, refrescar sus permisos
      if (user?.rol === roleId) {
        console.log('🔄 Refrescando permisos del usuario actual...');
        await refreshPermissions();
      }
      
      setIsEditing(false);
      setIsCreating(false);

      const actionText = selectedRole.id === 'ADMIN' ? 'actualizado' : 'guardado';
      alert(`✓ Rol ${actionText} exitosamente`);

    } catch (error) {
      console.error('Error saving role:', error);
      alert('❌ Error al guardar: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRole = async (roleId) => {
    if (!confirm('¿Eliminar este rol?')) return;

    try {
      setLoading(true);
      // SOLUCIÓN DEFINITIVA: Solo eliminar de tms_roles (permisos están como JSON)
      const { error } = await supabase
        .from('tms_roles')
        .delete()
        .eq('id', roleId);

      if (error) throw error;

      await fetchRolesAndPermissions();
      setSelectedRole(null);
      alert('✓ Rol eliminado exitosamente');
    } catch (error) {
      console.error('Error:', error);
      alert('❌ Error al eliminar: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const togglePermission = (permId) => {
    if (!isEditing) return;
    const perms = selectedRole.permisos || [];
    const newPerms = perms.includes(permId)
      ? perms.filter(p => p !== permId)
      : [...perms, permId];
    setSelectedRole({ ...selectedRole, permisos: newPerms });
  };

  const selectAllModule = (moduleId) => {
    if (!isEditing) return;
    const module = modules.find(m => m.id === moduleId);
    const allPerms = module.permissions.map(p => p.id);
    const currentPerms = selectedRole.permisos || [];
    const hasAll = allPerms.every(p => currentPerms.includes(p));

    let newPerms;
    if (hasAll) {
      newPerms = currentPerms.filter(p => !allPerms.includes(p));
    } else {
      newPerms = [...new Set([...currentPerms, ...allPerms])];
    }
    setSelectedRole({ ...selectedRole, permisos: newPerms });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="animate-spin text-indigo-500" size={40} />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
            <Shield className="text-indigo-500" /> Roles y Permisos
            {isSyncing && <Loader2 size={18} className="animate-spin text-green-500" />}
            {!isSyncing && <span className="w-2 h-2 bg-green-500 rounded-full" title="Sincronización en tiempo real activa"></span>}
          </h1>
          <p className="text-slate-500 text-sm mt-1">Define qué pueden hacer los usuarios en el sistema</p>
        </div>
        <button
          onClick={handleCreateRole}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 shadow-lg transition-all"
        >
          <Plus size={18} /> Nuevo Rol
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 overflow-hidden">
        {/* Roles List */}
        <div className="w-full lg:w-1/3 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50">
            <h3 className="font-bold text-slate-700">Roles Definidos ({roles.length})</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {roles.map(role => (
              <div
                key={role.id}
                onClick={() => { if (!isEditing) setSelectedRole(role); }}
                className={`p-4 rounded-lg cursor-pointer border transition-all ${selectedRole?.id === role.id
                    ? 'bg-indigo-50 border-indigo-200 shadow-sm'
                    : 'bg-white border-transparent hover:bg-slate-50 hover:border-slate-200'
                  } ${isEditing && selectedRole?.id !== role.id ? 'opacity-50 pointer-events-none' : ''}`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className={`font-bold ${selectedRole?.id === role.id ? 'text-indigo-700' : 'text-slate-800'}`}>
                      {role.nombre}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-1">{role.descripcion}</p>
                  </div>
                  {role.id === 'ADMIN' ? (
                    <Lock size={14} className="text-amber-500 mt-1" title="Rol protegido" />
                  ) : (
                    <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Users size={10} /> {role.usuarios}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Role Details */}
        <div className="w-full lg:w-2/3 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
          {selectedRole ? (
            <>
              <div className="p-5 border-b border-slate-100 flex justify-between items-start bg-slate-50">
                <div className="flex-1 mr-4">
                  {isEditing ? (
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-bold text-slate-500 uppercase">Nombre</label>
                        <input
                          type="text"
                          value={selectedRole.nombre}
                          onChange={e => setSelectedRole({ ...selectedRole, nombre: e.target.value })}
                          disabled={selectedRole.id === 'ADMIN'}
                          className="w-full text-xl font-bold text-slate-800 bg-white border border-slate-300 rounded px-2 py-1 focus:border-indigo-500 outline-none disabled:bg-slate-100 disabled:cursor-not-allowed"
                        />
                        {selectedRole.id === 'ADMIN' && (
                          <p className="text-xs text-amber-600 mt-1">🔒 El nombre del rol ADMIN no puede cambiar</p>
                        )}
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-500 uppercase">Descripción</label>
                        <input
                          type="text"
                          value={selectedRole.descripcion}
                          onChange={e => setSelectedRole({ ...selectedRole, descripcion: e.target.value })}
                          className="w-full text-sm text-slate-600 bg-white border border-slate-300 rounded px-2 py-1 focus:border-indigo-500 outline-none"
                        />
                      </div>
                    </div>
                  ) : (
                    <>
                      <h2 className="text-2xl font-bold text-slate-800">{selectedRole.nombre}</h2>
                      <p className="text-slate-500 mt-1">{selectedRole.descripcion}</p>
                      <p className="text-xs text-indigo-600 mt-2">{selectedRole.permisos?.length || 0} permisos asignados</p>
                    </>
                  )}
                </div>

                <div className="flex gap-2">
                  {isEditing ? (
                    <>
                      <button
                        onClick={() => { setIsEditing(false); setIsCreating(false); if (isCreating) setSelectedRole(null); }}
                        className="p-2 text-slate-500 hover:bg-slate-200 rounded-lg"
                      >
                        <X size={20} />
                      </button>
                      <button
                        onClick={handleSaveRole}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold flex items-center gap-2"
                      >
                        <Save size={18} /> Guardar
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => setIsEditing(true)}
                        className="px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg font-bold flex items-center gap-2"
                      >
                        <Edit size={16} /> Editar
                      </button>
                      <button
                        onClick={() => handleDeleteRole(selectedRole.id)}
                        disabled={selectedRole.id === 'ADMIN' || selectedRole.usuarios > 0}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-30"
                        title={selectedRole.id === 'ADMIN' ? 'No se puede eliminar el rol ADMIN' : selectedRole.usuarios > 0 ? 'No se puede eliminar roles con usuarios' : 'Eliminar rol'}
                      >
                        <Trash2 size={20} />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Permissions Grid */}
              <div className="flex-1 overflow-y-auto p-5">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Lock size={14} /> Permisos de Acceso
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {modules.map(module => {
                    const allPerms = module.permissions.map(p => p.id);
                    const enabledCount = allPerms.filter(p => selectedRole.permisos?.includes(p)).length;
                    const hasAll = enabledCount === allPerms.length;

                    return (
                      <div key={module.id} className="border border-slate-100 rounded-xl p-4 hover:border-slate-200">
                        <div className="flex items-center justify-between mb-3 border-b border-slate-50 pb-2">
                          <div className="flex items-center gap-2 text-slate-800 font-bold">
                            <span className="text-indigo-500">{module.icon}</span>
                            {module.label}
                          </div>
                          {isEditing && (
                            <button
                              onClick={() => selectAllModule(module.id)}
                              className={`text-xs px-2 py-1 rounded-full font-medium transition-colors ${hasAll
                                  ? 'bg-indigo-100 text-indigo-700'
                                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                }`}
                            >
                              {hasAll ? 'Quitar todos' : 'Todos'}
                            </button>
                          )}
                          {!isEditing && (
                            <span className="text-xs text-slate-400">{enabledCount}/{allPerms.length}</span>
                          )}
                        </div>
                        <div className="space-y-1.5">
                          {module.permissions.map(perm => {
                            const isEnabled = selectedRole.permisos?.includes(perm.id);
                            return (
                              <label
                                key={perm.id}
                                className={`flex items-center gap-2 p-1.5 rounded-lg transition-colors ${isEditing ? 'cursor-pointer hover:bg-slate-50' : 'cursor-default'
                                  }`}
                                onClick={() => togglePermission(perm.id)}
                              >
                                <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${isEnabled
                                    ? 'bg-indigo-600 border-indigo-600 text-white'
                                    : 'bg-white border-slate-300'
                                  }`}>
                                  {isEnabled && <Check size={10} strokeWidth={4} />}
                                </div>
                                <span className={`text-sm ${isEnabled ? 'text-slate-700 font-medium' : 'text-slate-400'}`}>
                                  {perm.label}
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8">
              <Shield size={48} className="opacity-20 mb-4" />
              <h3 className="text-lg font-bold text-slate-600 mb-1">Selecciona un Rol</h3>
              <p className="text-center max-w-xs">Elige un rol para ver o editar sus permisos</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RolesPage;
