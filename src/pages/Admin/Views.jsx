import React, { useState, useEffect } from 'react';
import { 
  Layout, Save, RefreshCw, Power, Home, 
  CheckCircle, XCircle, AlertTriangle, Loader2,
  LayoutDashboard, Truck, Package, ArrowUpFromLine, 
  ArrowDownToLine, Warehouse, Search, Settings
} from 'lucide-react';
import { supabase } from '../../supabase';

const ViewsPage = () => {
  const [activeTab, setActiveTab] = useState('modules'); // 'modules' | 'landing'
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Data
  const [modulesConfig, setModulesConfig] = useState([]);
  const [roles, setRoles] = useState([]);

  // Available Routes for Landing Page
  const availableRoutes = [
    { value: '/dashboard', label: 'Dashboard General' },
    { value: '/tms/planning', label: 'TMS - Planificación' },
    { value: '/tms/control-tower', label: 'TMS - Torre de Control' },
    { value: '/tms/drivers', label: 'TMS - Conductores' },
    { value: '/tms/mobile', label: 'TMS - App Móvil' },
    { value: '/inbound/reception', label: 'Inbound - Recepción' },
    { value: '/inbound/entry', label: 'Inbound - Ingreso' },
    { value: '/outbound/picking', label: 'Outbound - Picking' },
    { value: '/outbound/packing', label: 'Outbound - Packing' },
    { value: '/outbound/shipping', label: 'Outbound - Despachos' },
    { value: '/inventory/stock', label: 'Inventario - Stock' },
    { value: '/admin/users', label: 'Admin - Usuarios' },
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // 1. Fetch Modules Config
      const { data: modulesData, error: modulesError } = await supabase
        .from('tms_modules_config')
        .select('*')
        .order('id');

      if (modulesError) throw modulesError;

      // 2. Fetch Roles for Landing Pages
      const { data: rolesData, error: rolesError } = await supabase
        .from('tms_roles')
        .select('*')
        .order('nombre');

      if (rolesError) throw rolesError;

      setModulesConfig(modulesData || []);
      setRoles(rolesData || []);

    } catch (error) {
      console.error('Error fetching views config:', error);
      // Mock data fallback
      setRoles([
        { id: 'ADMIN', nombre: 'Administrador', landing_page: '/dashboard' },
        { id: 'OPERADOR', nombre: 'Operador', landing_page: '/outbound/picking' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleModule = async (id, currentStatus) => {
    try {
      // Optimistic update
      const newStatus = !currentStatus;
      setModulesConfig(prev => prev.map(m => m.id === id ? { ...m, enabled: newStatus } : m));

      const { error } = await supabase
        .from('tms_modules_config')
        .update({ enabled: newStatus, updated_at: new Date() })
        .eq('id', id);

      if (error) throw error;

    } catch (error) {
      console.error('Error toggling module:', error);
      fetchData(); // Revert on error
    }
  };

  const handleUpdateLandingPage = async (roleId, newPath) => {
    try {
      setSaving(true);
      // Optimistic
      setRoles(prev => prev.map(r => r.id === roleId ? { ...r, landing_page: newPath } : r));

      const { error } = await supabase
        .from('tms_roles')
        .update({ landing_page: newPath })
        .eq('id', roleId);

      if (error) throw error;

    } catch (error) {
      console.error('Error updating landing page:', error);
      alert('Error al actualizar: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <Loader2 size={48} className="animate-spin text-indigo-500 mb-4" />
        <p className="text-slate-500">Cargando configuración...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
            <Layout className="text-indigo-600" />
            Configuración de Vistas
          </h1>
          <p className="text-slate-500 text-sm mt-1">Gestiona módulos globales y páginas de inicio por rol</p>
        </div>
        <button 
          onClick={fetchData} 
          className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
          title="Recargar"
        >
          <RefreshCw size={20} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('modules')}
          className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'modules' 
              ? 'border-indigo-600 text-indigo-600' 
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Power size={16} />
          Módulos del Sistema
        </button>
        <button
          onClick={() => setActiveTab('landing')}
          className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'landing' 
              ? 'border-indigo-600 text-indigo-600' 
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Home size={16} />
          Vista Inicial por Rol
        </button>
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        
        {/* TAB: MODULES */}
        {activeTab === 'modules' && (
          <div className="space-y-6">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3 text-amber-800 text-sm">
              <AlertTriangle className="shrink-0 mt-0.5" size={16} />
              <p>
                Desactivar un módulo aquí lo ocultará para <strong>todos los usuarios</strong>, independientemente de sus roles. 
                Útil para mantenimiento o funciones no implementadas.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {modulesConfig.map(module => (
                <div 
                  key={module.id} 
                  className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                    module.enabled 
                      ? 'bg-white border-slate-200 hover:border-indigo-300 shadow-sm' 
                      : 'bg-slate-50 border-slate-100 opacity-70'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      module.enabled ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-200 text-slate-400'
                    }`}>
                      <Layout size={20} />
                    </div>
                    <div>
                      <h4 className={`font-bold ${module.enabled ? 'text-slate-800' : 'text-slate-500'}`}>
                        {module.label || module.id}
                      </h4>
                      <p className="text-xs text-slate-400 font-mono">{module.id}</p>
                    </div>
                  </div>
                  
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer"
                      checked={module.enabled}
                      onChange={() => handleToggleModule(module.id, module.enabled)}
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: LANDING PAGES */}
        {activeTab === 'landing' && (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3 text-blue-800 text-sm">
              <Home className="shrink-0 mt-0.5" size={16} />
              <p>
                Define a qué pantalla será redirigido cada rol inmediatamente después de iniciar sesión.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {roles.map(role => (
                <div key={role.id} className="p-4 border border-slate-200 rounded-xl hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 font-bold">
                      {role.nombre.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800">{role.nombre}</h3>
                      <p className="text-xs text-slate-500">{role.descripcion || 'Sin descripción'}</p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Página de Inicio</label>
                    <select
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 outline-none transition-colors"
                      value={role.landing_page || '/dashboard'}
                      onChange={(e) => handleUpdateLandingPage(role.id, e.target.value)}
                    >
                      {availableRoutes.map(route => (
                        <option key={route.value} value={route.value}>
                          {route.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default ViewsPage;
