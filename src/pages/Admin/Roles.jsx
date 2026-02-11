import React, { useState, useEffect } from 'react';
import { 
  Shield, Plus, Edit, Trash2, Save, X, Check, 
  Lock, Users, LayoutDashboard, Truck, Package, 
  Search, Settings, Database, AlertCircle, Loader2,
  Warehouse, ArrowDownToLine, ArrowUpFromLine, FileText
} from 'lucide-react';
import { supabase } from '../../supabase';

const RolesPage = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Definición de Módulos y Permisos del Sistema
  const modules = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard size={16} />,
      permissions: [
        { id: 'view_dashboard', label: 'Ver Dashboard' },
        { id: 'view_kpis', label: 'Ver KPIs Financieros' }
      ]
    },
    {
      id: 'tms',
      label: 'TMS (Transporte)',
      icon: <Truck size={16} />,
      permissions: [
        { id: 'view_routes', label: 'Ver Rutas' },
        { id: 'create_routes', label: 'Planificar Rutas' },
        { id: 'assign_drivers', label: 'Asignar Conductores' },
        { id: 'track_gps', label: 'Monitoreo GPS' },
        { id: 'view_drivers', label: 'Ver Conductores' }
      ]
    },
    {
      id: 'inbound',
      label: 'Inbound (Entrada)',
      icon: <ArrowDownToLine size={16} />,
      permissions: [
        { id: 'view_reception', label: 'Ver Recepciones' },
        { id: 'process_entry', label: 'Procesar Ingresos' }
      ]
    },
    {
      id: 'outbound',
      label: 'Outbound (Salida)',
      icon: <ArrowUpFromLine size={16} />,
      permissions: [
        { id: 'view_sales_orders', label: 'Ver Notas de Venta' },
        { id: 'view_picking', label: 'Ver Picking' },
        { id: 'process_picking', label: 'Procesar Picking' },
        { id: 'view_packing', label: 'Ver Packing' },
        { id: 'process_packing', label: 'Procesar Packing' },
        { id: 'view_shipping', label: 'Ver Despachos' },
        { id: 'process_shipping', label: 'Gestionar Despachos' }
      ]
    },
    {
      id: 'inventory',
      label: 'Inventario',
      icon: <Warehouse size={16} />,
      permissions: [
        { id: 'view_stock', label: 'Ver Stock' },
        { id: 'manage_inventory', label: 'Gestionar Inventario' },
        { id: 'view_layout', label: 'Ver Layout Bodega' },
        { id: 'manage_transfers', label: 'Gestionar Transferencias' }
      ]
    },
    {
      id: 'queries',
      label: 'Consultas',
      icon: <Search size={16} />,
      permissions: [
        { id: 'view_batches', label: 'Ver Lotes/Series' },
        { id: 'view_sales_status', label: 'Ver Estado N.V.' },
        { id: 'view_addresses', label: 'Ver Direcciones' }
      ]
    },
    {
      id: 'admin',
      label: 'Administración',
      icon: <Settings size={16} />,
      permissions: [
        { id: 'manage_users', label: 'Gestionar Usuarios' },
        { id: 'manage_roles', label: 'Gestionar Roles' },
        { id: 'manage_views', label: 'Configurar Vistas' },
        { id: 'view_reports', label: 'Ver Reportes' },
        { id: 'view_logs', label: 'Ver Auditoría' }
      ]
    }
  ];

  useEffect(() => {
    fetchRolesAndPermissions();
  }, []);

  const fetchRolesAndPermissions = async () => {
    try {
      setLoading(true);
      
      // 1. Fetch Roles
      const { data: rolesData, error: rolesError } = await supabase
        .from('tms_roles')
        .select('*')
        .order('nombre');

      if (rolesError) throw rolesError;

      // 2. Fetch Permissions Map (Rol -> Permisos)
      const { data: permsData, error: permsError } = await supabase
        .from('tms_roles_permisos')
        .select('rol_id, permiso_id');

      if (permsError) throw permsError;

      // 3. Count Users per Role
      const { data: usersData, error: usersError } = await supabase
        .from('tms_usuarios')
        .select('rol');
      
      // Agrupar usuarios por rol
      const userCounts = {};
      if (usersData) {
        usersData.forEach(u => {
          userCounts[u.rol] = (userCounts[u.rol] || 0) + 1;
        });
      }

      // Combinar todo
      const formattedRoles = rolesData.map(rol => ({
        ...rol,
        usuarios: userCounts[rol.id] || 0,
        permisos: permsData
          .filter(p => p.rol_id === rol.id)
          .map(p => p.permiso_id)
      }));

      setRoles(formattedRoles);

    } catch (error) {
      console.error('Error fetching roles:', error);
      // Fallback a datos mock si no hay tablas
      setRoles([
        {
          id: 'ADMIN',
          nombre: 'Administrador (Demo)',
          descripcion: 'Acceso total (Datos Mock)',
          usuarios: 1,
          permisos: ['view_dashboard', 'manage_users']
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRole = () => {
    const newRole = {
      id: '', // Se definirá al guardar
      nombre: 'Nuevo Rol',
      descripcion: 'Descripción del rol',
      usuarios: 0,
      permisos: []
    };
    setSelectedRole(newRole);
    setIsCreating(true);
    setIsEditing(true);
  };

  const handleSaveRole = async () => {
    try {
      const roleId = isCreating 
        ? selectedRole.nombre.toUpperCase().replace(/\s+/g, '_') 
        : selectedRole.id;

      // 1. Upsert Role
      const { error: roleError } = await supabase
        .from('tms_roles')
        .upsert({
          id: roleId,
          nombre: selectedRole.nombre,
          descripcion: selectedRole.descripcion
        });

      if (roleError) throw roleError;

      // 2. Update Permissions (Delete all + Insert new)
      // Primero borrar existentes para este rol
      await supabase.from('tms_roles_permisos').delete().eq('rol_id', roleId);

      // Insertar nuevos
      if (selectedRole.permisos && selectedRole.permisos.length > 0) {
        const permsToInsert = selectedRole.permisos.map(p => ({
          rol_id: roleId,
          permiso_id: p
        }));
        
        const { error: permsError } = await supabase
          .from('tms_roles_permisos')
          .insert(permsToInsert);
          
        if (permsError) throw permsError;
      }

      // Refresh UI
      await fetchRolesAndPermissions();
      setIsEditing(false);
      setIsCreating(false);
      if (isCreating) setSelectedRole(null); // Reset selection after create
      
    } catch (error) {
      console.error('Error saving role:', error);
      alert('Error al guardar rol: ' + error.message);
    }
  };

  const togglePermission = (permId) => {
    if (!isEditing) return;
    
    const currentPerms = selectedRole.permisos || [];
    const newPerms = currentPerms.includes(permId)
      ? currentPerms.filter(p => p !== permId)
      : [...currentPerms, permId];
      
    setSelectedRole({ ...selectedRole, permisos: newPerms });
  };

  const handleDeleteRole = async (roleId) => {
    if (confirm('¿Estás seguro de eliminar este rol?')) {
      try {
        const { error } = await supabase
          .from('tms_roles')
          .delete()
          .eq('id', roleId);
          
        if (error) throw error;
        
        setRoles(roles.filter(r => r.id !== roleId));
        if (selectedRole?.id === roleId) setSelectedRole(null);
      } catch (error) {
        console.error('Error deleting role:', error);
        alert('Error al eliminar: ' + error.message);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <Loader2 size={48} className="animate-spin text-blue-500" />
        <p className="text-slate-500 font-medium animate-pulse">Cargando roles y permisos...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 h-[calc(100vh-100px)] flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center flex-shrink-0">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <Shield className="text-indigo-600" />
            Roles y Permisos
          </h1>
          <p className="text-slate-500 text-sm mt-1">Define qué pueden hacer los usuarios en el sistema</p>
        </div>
        <button 
          onClick={handleCreateRole}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 shadow-lg shadow-indigo-500/20 transition-all hover:scale-105 active:scale-95"
        >
          <Plus size={18} />
          Nuevo Rol
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 overflow-hidden">
        {/* Roles List (Sidebar) */}
        <div className="w-full lg:w-1/3 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50">
            <h3 className="font-bold text-slate-700">Roles Definidos ({roles.length})</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {roles.map(role => (
              <div 
                key={role.id}
                onClick={() => {
                  if (!isEditing) setSelectedRole(role);
                }}
                className={`p-4 rounded-lg cursor-pointer border transition-all ${
                  selectedRole?.id === role.id 
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
                      <Users size={10} />
                      {role.usuarios}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Role Details & Permissions (Main Area) */}
        <div className="w-full lg:w-2/3 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
          {selectedRole ? (
            <>
              {/* Detail Header */}
              <div className="p-6 border-b border-slate-100 flex justify-between items-start bg-slate-50">
                <div className="flex-1 mr-4">
                  {isEditing ? (
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-bold text-slate-500 uppercase">Nombre del Rol</label>
                        <input 
                          type="text" 
                          value={selectedRole.nombre} 
                          onChange={e => setSelectedRole({...selectedRole, nombre: e.target.value})}
                          className="w-full text-xl font-bold text-slate-800 bg-white border border-slate-300 rounded px-2 py-1 focus:border-indigo-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-500 uppercase">Descripción</label>
                        <input 
                          type="text" 
                          value={selectedRole.descripcion} 
                          onChange={e => setSelectedRole({...selectedRole, descripcion: e.target.value})}
                          className="w-full text-sm text-slate-600 bg-white border border-slate-300 rounded px-2 py-1 focus:border-indigo-500 outline-none"
                        />
                      </div>
                    </div>
                  ) : (
                    <>
                      <h2 className="text-2xl font-bold text-slate-800">{selectedRole.nombre}</h2>
                      <p className="text-slate-500 mt-1">{selectedRole.descripcion}</p>
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
                        className="p-2 text-slate-500 hover:bg-slate-200 rounded-lg transition-colors"
                        title="Cancelar"
                      >
                        <X size={20} />
                      </button>
                      <button 
                        onClick={handleSaveRole}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold flex items-center gap-2 shadow-sm"
                      >
                        <Save size={18} />
                        Guardar
                      </button>
                    </>
                  ) : (
                    <>
                      <button 
                        onClick={() => setIsEditing(true)}
                        disabled={selectedRole.id === 'ADMIN'}
                        className="px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg font-bold flex items-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Edit size={16} />
                        Editar
                      </button>
                      <button 
                        onClick={() => handleDeleteRole(selectedRole.id)}
                        disabled={selectedRole.id === 'ADMIN' || selectedRole.usuarios > 0}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Eliminar Rol"
                      >
                        <Trash2 size={20} />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Permissions Grid */}
              <div className="flex-1 overflow-y-auto p-6 bg-white">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Lock size={14} />
                  Permisos de Acceso
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {modules.map(module => (
                    <div key={module.id} className="border border-slate-100 rounded-xl p-4 hover:border-slate-200 transition-colors">
                      <div className="flex items-center gap-2 mb-3 text-slate-800 font-bold border-b border-slate-50 pb-2">
                        <span className="text-indigo-500">{module.icon}</span>
                        {module.label}
                      </div>
                      <div className="space-y-2">
                        {module.permissions.map(perm => {
                          const isEnabled = selectedRole.permisos?.includes(perm.id);
                          return (
                            <label 
                              key={perm.id} 
                              className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${
                                isEditing ? 'cursor-pointer hover:bg-slate-50' : 'cursor-default'
                              }`}
                            >
                              <div 
                                className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                                  isEnabled 
                                    ? 'bg-indigo-600 border-indigo-600 text-white' 
                                    : 'bg-white border-slate-300'
                                }`}
                                onClick={(e) => {
                                  if(!isEditing) return;
                                  e.preventDefault();
                                  togglePermission(perm.id);
                                }}
                              >
                                {isEnabled && <Check size={12} strokeWidth={4} />}
                              </div>
                              <span className={`text-sm ${isEnabled ? 'text-slate-700 font-medium' : 'text-slate-400'}`}>
                                {perm.label}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 text-center">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                <Shield size={40} className="opacity-20" />
              </div>
              <h3 className="text-lg font-bold text-slate-600 mb-1">Selecciona un Rol</h3>
              <p className="max-w-xs mx-auto">Elige un rol de la lista para ver o editar sus permisos, o crea uno nuevo.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RolesPage;
