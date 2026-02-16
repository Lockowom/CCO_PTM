import React, { useState, useEffect } from 'react';
import {
  Shield, Plus, Edit, Trash2, Save, X, Check,
  Lock, Users, LayoutDashboard, Truck, Package,
  Search, Settings, Loader2,
  Warehouse, ArrowDownToLine, ArrowUpFromLine, FileText,
  Hand, Ship, MapPin, Barcode, History, Timer,
  Satellite, Smartphone, MapPinned, Layers, FileBarChart,
  Clock, Upload, Trash, MessageSquare
} from 'lucide-react';
import { supabase } from '../../supabase';
import { useAuth } from '../../context/AuthContext';

const RolesPage = () => {
  // IMPORTANTE: Obtener refreshPermissions del contexto
  const { refreshPermissions } = useAuth();
  
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [saving, setSaving] = useState(false);

  // Definición de módulos y permisos
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
        { id: 'manage_sales_orders', label: 'Gestionar N.V.' },
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
        { id: 'view_audit', label: 'Ver Auditoría' },
        { id: 'view_time_reports', label: 'Ver Reportes de Tiempo' },
        { id: 'manage_tickets', label: 'Gestionar Tickets' },
        { id: 'manage_cleanup', label: 'Limpieza de Datos' }
      ]
    }
  ];

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      setLoading(true);

      const { data: rolesData, error } = await supabase
        .from('tms_roles')
        .select('*')
        .order('nombre');

      if (error) throw error;

      // Contar usuarios por rol
      const { data: usersData } = await supabase
        .from('tms_usuarios')
        .select('rol');

      const userCounts = {};
      (usersData || []).forEach(u => {
        userCounts[u.rol] = (userCounts[u.rol] || 0) + 1;
      });

      const formattedRoles = (rolesData || []).map(rol => ({
        ...rol,
        usuarios: userCounts[rol.id] || 0,
        permisos: rol.permisos_json || []
      }));

      setRoles(formattedRoles);

    } catch (error) {
      console.error('Error:', error);
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

  // ⭐ FUNCIÓN PRINCIPAL: Guardar rol y actualizar menú
  const handleSaveRole = async () => {
    try {
      setSaving(true);
      console.log('💾 Guardando rol...');

      const roleId = isCreating
        ? selectedRole.nombre.toUpperCase().replace(/\s+/g, '_')
        : selectedRole.id;

      const roleName = selectedRole.id === 'ADMIN' ? 'Administrador' : selectedRole.nombre;

      // Guardar en BD
      const { error } = await supabase
        .from('tms_roles')
        .upsert({
          id: roleId,
          nombre: roleName,
          descripcion: selectedRole.descripcion,
          permisos_json: selectedRole.permisos || []
        }, { onConflict: 'id' });

      if (error) throw error;

      console.log('✅ Rol guardado en BD');

      // Recargar lista de roles
      await fetchRoles();

      // ⭐⭐⭐ ACTUALIZAR EL MENÚ INSTANTÁNEAMENTE ⭐⭐⭐
      console.log('🔄 Actualizando menú...');
      await refreshPermissions();
      console.log('✅ Menú actualizado');

      setIsEditing(false);
      setIsCreating(false);

    } catch (error) {
      console.error('❌ Error:', error);
      alert('Error al guardar: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRole = async (roleId) => {
    if (!confirm('¿Eliminar este rol?')) return;

    try {
      setLoading(true);

      const { error } = await supabase
        .from('tms_roles')
        .delete()
        .eq('id', roleId);

      if (error) throw error;

      await fetchRoles();
      await refreshPermissions(); // También actualizar al eliminar
      setSelectedRole(null);
      
    } catch (error) {
      console.error('Error:', error);
      alert('Error: ' + error.message);
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

    const newPerms = hasAll
      ? currentPerms.filter(p => !allPerms.includes(p))
      : [...new Set([...currentPerms, ...allPerms])];
    
    setSelectedRole({ ...selectedRole, permisos: newPerms });
  };

  if (loading && roles.length === 0) {
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
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Los cambios se reflejan instantáneamente en el menú
          </p>
        </div>
        <button
          onClick={handleCreateRole}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2"
        >
          <Plus size={18} /> Nuevo Rol
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 overflow-hidden">
        {/* Lista de Roles */}
        <div className="w-full lg:w-1/3 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50">
            <h3 className="font-bold text-slate-700">Roles ({roles.length})</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {roles.map(role => (
              <div
                key={role.id}
                onClick={() => { if (!isEditing) setSelectedRole(role); }}
                className={`p-4 rounded-lg cursor-pointer border transition-all ${
                  selectedRole?.id === role.id
                    ? 'bg-indigo-50 border-indigo-200'
                    : 'bg-white border-transparent hover:bg-slate-50'
                } ${isEditing && selectedRole?.id !== role.id ? 'opacity-50' : ''}`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className={`font-bold ${selectedRole?.id === role.id ? 'text-indigo-700' : 'text-slate-800'}`}>
                      {role.nombre}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">{role.descripcion}</p>
                    <p className="text-xs text-indigo-500 mt-1">{role.permisos?.length || 0} permisos</p>
                  </div>
                  {role.id === 'ADMIN' ? (
                    <Lock size={14} className="text-amber-500" />
                  ) : (
                    <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                      {role.usuarios} usuarios
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Detalle del Rol */}
        <div className="w-full lg:w-2/3 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
          {selectedRole ? (
            <>
              {/* Header del rol */}
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
                          className="w-full text-xl font-bold text-slate-800 bg-white border border-slate-300 rounded px-2 py-1 disabled:bg-slate-100"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-500 uppercase">Descripción</label>
                        <input
                          type="text"
                          value={selectedRole.descripcion || ''}
                          onChange={e => setSelectedRole({ ...selectedRole, descripcion: e.target.value })}
                          className="w-full text-sm text-slate-600 bg-white border border-slate-300 rounded px-2 py-1"
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
                        onClick={() => { 
                          setIsEditing(false); 
                          setIsCreating(false); 
                          if (isCreating) setSelectedRole(null); 
                        }}
                        className="p-2 text-slate-500 hover:bg-slate-200 rounded-lg"
                      >
                        <X size={20} />
                      </button>
                      <button
                        onClick={handleSaveRole}
                        disabled={saving}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold flex items-center gap-2 disabled:opacity-50"
                      >
                        {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                        {saving ? 'Guardando...' : 'Guardar'}
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
                        className="p-2 text-slate-400 hover:text-red-600 rounded-lg disabled:opacity-30"
                      >
                        <Trash2 size={20} />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Permisos */}
              <div className="flex-1 overflow-y-auto p-5">
                <h3 className="text-xs font-bold text-slate-400 uppercase mb-4 flex items-center gap-2">
                  <Lock size={14} /> Permisos
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {modules.map(module => {
                    const allPerms = module.permissions.map(p => p.id);
                    const enabledCount = allPerms.filter(p => selectedRole.permisos?.includes(p)).length;
                    const hasAll = enabledCount === allPerms.length;

                    return (
                      <div key={module.id} className="border border-slate-100 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-3 border-b border-slate-50 pb-2">
                          <div className="flex items-center gap-2 text-slate-800 font-bold">
                            <span className="text-indigo-500">{module.icon}</span>
                            {module.label}
                          </div>
                          {isEditing && (
                            <button
                              onClick={() => selectAllModule(module.id)}
                              className={`text-xs px-2 py-1 rounded-full font-medium ${
                                hasAll ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                              }`}
                            >
                              {hasAll ? 'Quitar' : 'Todos'}
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
                                className={`flex items-center gap-2 p-1.5 rounded-lg ${
                                  isEditing ? 'cursor-pointer hover:bg-slate-50' : ''
                                }`}
                                onClick={() => togglePermission(perm.id)}
                              >
                                <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                                  isEnabled ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-300'
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
              <h3 className="text-lg font-bold text-slate-600">Selecciona un Rol</h3>
              <p className="text-sm">Elige un rol para ver o editar sus permisos</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RolesPage;
