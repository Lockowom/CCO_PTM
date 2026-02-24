import React, { useState, useEffect } from 'react';
import {
  Shield, Plus, Edit, Trash2, Save, X, Check,
  Lock, Users, LayoutDashboard, Truck, Package,
  Search, Settings, Loader2,
  Warehouse, ArrowDownToLine, ArrowUpFromLine, FileText,
  Hand, Ship, MapPin, Barcode, History, Timer,
  Satellite, Smartphone, MapPinned, Layers, FileBarChart,
  Clock, Upload, Trash, MessageSquare, ArrowLeft
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
        { id: 'delete_sales_orders', label: 'Eliminar N.V.' },
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
        {!selectedRole && !isCreating && (
          <button
            onClick={handleCreateRole}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2"
          >
            <Plus size={18} /> Nuevo Rol
          </button>
        )}
      </div>

      <div className="flex flex-col gap-6 flex-1 overflow-hidden">
        {/* Vista de Tarjetas (Grid) si no hay rol seleccionado o si estamos creando */}
        {(!selectedRole || isCreating) && !isEditing ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 overflow-y-auto p-2">
            {roles.map(role => (
              <div
                key={role.id}
                onClick={() => setSelectedRole(role)}
                className="bg-white rounded-2xl border border-slate-200 p-6 cursor-pointer hover:shadow-lg hover:border-indigo-200 hover:-translate-y-1 transition-all group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Shield size={64} className="text-indigo-600" />
                </div>
                
                <div className="flex justify-between items-start mb-4 relative z-10">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    role.id === 'ADMIN' ? 'bg-amber-100 text-amber-600' : 'bg-indigo-50 text-indigo-600'
                  }`}>
                    {role.id === 'ADMIN' ? <Lock size={24} /> : <Users size={24} />}
                  </div>
                  {role.id !== 'ADMIN' && (
                    <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2.5 py-1 rounded-full">
                      {role.usuarios} usuarios
                    </span>
                  )}
                </div>

                <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-indigo-700 transition-colors">
                  {role.nombre}
                </h3>
                <p className="text-sm text-slate-500 mb-6 line-clamp-2 h-10">
                  {role.descripcion || 'Sin descripción'}
                </p>

                <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-auto">
                  <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                    <Shield size={14} />
                    {role.permisos?.length || 0} permisos
                  </div>
                  <span className="text-indigo-600 text-sm font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    Editar <Edit size={14} />
                  </span>
                </div>
              </div>
            ))}
            
            {/* Botón para crear nuevo rol (tarjeta) */}
            <button
              onClick={handleCreateRole}
              className="bg-slate-50 rounded-2xl border-2 border-dashed border-slate-300 p-6 flex flex-col items-center justify-center gap-4 text-slate-400 hover:text-indigo-600 hover:border-indigo-400 hover:bg-indigo-50/50 transition-all group min-h-[240px]"
            >
              <div className="w-16 h-16 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center group-hover:border-indigo-400 transition-colors">
                <Plus size={32} />
              </div>
              <span className="font-bold text-lg">Crear Nuevo Rol</span>
            </button>
          </div>
        ) : (
          /* Vista de Edición / Detalle (Pantalla completa) */
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl flex flex-col overflow-hidden h-full animate-in fade-in slide-in-from-bottom-4 duration-300">
             {/* Header del rol */}
             <div className="p-6 border-b border-slate-100 flex justify-between items-start bg-gradient-to-r from-slate-50 to-white">
                <div className="flex items-center gap-4 flex-1">
                  <button 
                    onClick={() => {
                      setSelectedRole(null);
                      setIsEditing(false);
                      setIsCreating(false);
                    }}
                    className="p-2 hover:bg-white hover:shadow-sm rounded-lg text-slate-400 hover:text-slate-700 transition-all"
                  >
                    <ArrowLeft size={24} />
                  </button>
                  
                  <div className="flex-1 mr-8">
                    {isEditing ? (
                      <div className="flex gap-4 items-start">
                        <div className="flex-1">
                          <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Nombre del Rol</label>
                          <input
                            type="text"
                            value={selectedRole.nombre}
                            onChange={e => setSelectedRole({ ...selectedRole, nombre: e.target.value })}
                            disabled={selectedRole.id === 'ADMIN'}
                            className="w-full text-2xl font-bold text-slate-800 bg-transparent border-b-2 border-slate-200 focus:border-indigo-500 outline-none px-0 py-1 transition-colors disabled:opacity-50"
                            placeholder="Nombre del Rol"
                            autoFocus
                          />
                        </div>
                        <div className="flex-[2]">
                          <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Descripción</label>
                          <input
                            type="text"
                            value={selectedRole.descripcion || ''}
                            onChange={e => setSelectedRole({ ...selectedRole, descripcion: e.target.value })}
                            className="w-full text-lg text-slate-600 bg-transparent border-b-2 border-slate-200 focus:border-indigo-500 outline-none px-0 py-1 transition-colors"
                            placeholder="Descripción breve del rol"
                          />
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-center gap-3">
                          <h2 className="text-3xl font-black text-slate-800">{selectedRole.nombre}</h2>
                          {selectedRole.id === 'ADMIN' && (
                            <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                              <Lock size={12} /> Sistema
                            </span>
                          )}
                        </div>
                        <p className="text-slate-500 mt-1 text-lg">{selectedRole.descripcion}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-3">
                  {isEditing ? (
                    <>
                      <button
                        onClick={() => { 
                          setIsEditing(false); 
                          setIsCreating(false); 
                          if (isCreating) setSelectedRole(null); 
                        }}
                        className="px-6 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl font-bold transition-colors"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={handleSaveRole}
                        disabled={saving}
                        className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-indigo-200 transition-all disabled:opacity-50 disabled:shadow-none"
                      >
                        {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                        {saving ? 'Guardando...' : 'Guardar Cambios'}
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleDeleteRole(selectedRole.id)}
                        disabled={selectedRole.id === 'ADMIN' || selectedRole.usuarios > 0}
                        className="p-3 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors disabled:opacity-20"
                        title="Eliminar Rol"
                      >
                        <Trash2 size={20} />
                      </button>
                      <button
                        onClick={() => setIsEditing(true)}
                        className="px-6 py-2.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 rounded-xl font-bold flex items-center gap-2 transition-colors"
                      >
                        <Edit size={18} /> Editar Permisos
                      </button>
                    </>
                  )}
                </div>
             </div>

             {/* Permisos Grid */}
             <div className="flex-1 overflow-y-auto bg-slate-50/50 p-8">
                <div className="max-w-7xl mx-auto">
                  <h3 className="text-sm font-bold text-slate-400 uppercase mb-6 flex items-center gap-2">
                    <Shield size={16} /> Configuración de Accesos por Módulo
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {modules.map(module => {
                      const allPerms = module.permissions.map(p => p.id);
                      const enabledCount = allPerms.filter(p => selectedRole.permisos?.includes(p)).length;
                      const hasAll = enabledCount === allPerms.length;
                      const isNone = enabledCount === 0;

                      return (
                        <div 
                          key={module.id} 
                          className={`bg-white rounded-xl border shadow-sm transition-all ${
                            hasAll ? 'border-indigo-200 ring-1 ring-indigo-100' : 'border-slate-200'
                          }`}
                        >
                          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white rounded-t-xl">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg ${
                                hasAll ? 'bg-indigo-100 text-indigo-600' : 
                                isNone ? 'bg-slate-100 text-slate-400' : 'bg-indigo-50 text-indigo-500'
                              }`}>
                                {module.icon}
                              </div>
                              <div>
                                <h4 className={`font-bold ${hasAll ? 'text-indigo-700' : 'text-slate-700'}`}>
                                  {module.label}
                                </h4>
                                {!isEditing && (
                                  <span className="text-xs text-slate-400 font-medium">
                                    {enabledCount} de {allPerms.length} activos
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            {isEditing && (
                              <button
                                onClick={() => selectAllModule(module.id)}
                                className={`text-xs px-3 py-1.5 rounded-lg font-bold transition-colors ${
                                  hasAll 
                                    ? 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200' 
                                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                }`}
                              >
                                {hasAll ? 'Desmarcar Todo' : 'Marcar Todo'}
                              </button>
                            )}
                          </div>
                          
                          <div className="p-4 space-y-3">
                            {module.permissions.map(perm => {
                              const isEnabled = selectedRole.permisos?.includes(perm.id);
                              return (
                                <label
                                  key={perm.id}
                                  className={`flex items-start gap-3 p-2 rounded-lg transition-all ${
                                    isEditing 
                                      ? 'cursor-pointer hover:bg-slate-50 active:scale-[0.99]' 
                                      : 'cursor-default opacity-80'
                                  }`}
                                  onClick={() => togglePermission(perm.id)}
                                >
                                  <div className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                                    isEnabled 
                                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm shadow-indigo-200' 
                                      : 'bg-white border-slate-300'
                                  }`}>
                                    {isEnabled && <Check size={12} strokeWidth={4} />}
                                  </div>
                                  <div>
                                    <span className={`text-sm block leading-tight ${
                                      isEnabled ? 'text-slate-700 font-bold' : 'text-slate-400 font-medium'
                                    }`}>
                                      {perm.label}
                                    </span>
                                  </div>
                                </label>
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
