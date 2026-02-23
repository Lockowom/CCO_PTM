import React, { useState, useEffect } from 'react';
import { 
  Layout, RefreshCw, Power, Home, 
  AlertTriangle, Loader2
} from 'lucide-react';
import { supabase } from '../../supabase';
import { useConfig } from '../../context/ConfigContext';

const ViewsPage = () => {
  // IMPORTANTE: Obtener refreshConfig del contexto
  const { refreshConfig } = useConfig();
  
  const [activeTab, setActiveTab] = useState('modules');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [modulesConfig, setModulesConfig] = useState([]);
  const [roles, setRoles] = useState([]);

  const availableRoutes = [
    { value: '/dashboard', label: 'Dashboard General' },
    { value: '/tms/dashboard', label: 'TMS - Dashboard' },
    { value: '/tms/planning', label: 'TMS - Planificación' },
    { value: '/tms/control-tower', label: 'TMS - Torre de Control' },
    { value: '/tms/drivers', label: 'TMS - Conductores' },
    { value: '/tms/mobile', label: 'TMS - App Móvil' },
    { value: '/inbound/reception', label: 'Inbound - Recepción' },
    { value: '/inbound/entry', label: 'Inbound - Ingreso' },
    { value: '/outbound/sales-orders', label: 'Outbound - Notas de Venta' },
    { value: '/outbound/picking', label: 'Outbound - Picking' },
    { value: '/outbound/packing', label: 'Outbound - Packing' },
    { value: '/outbound/shipping', label: 'Outbound - Despachos' },
    { value: '/outbound/deliveries', label: 'Outbound - Entregas' },
    { value: '/inventory/stock', label: 'Inventario - Stock' },
    { value: '/inventory/layout', label: 'Inventario - Layout' },
    { value: '/inventory/transfers', label: 'Inventario - Transferencias' },
    { value: '/queries/historial-nv', label: 'Consultas - Historial N.V.' },
    { value: '/queries/batches', label: 'Consultas - Lotes/Series' },
    { value: '/queries/sales-status', label: 'Consultas - Estado N.V.' },
    { value: '/queries/addresses', label: 'Consultas - Direcciones' },
    { value: '/queries/locations', label: 'Consultas - Ubicaciones' },
    { value: '/admin/mediciones', label: 'Admin - Mediciones' },
    { value: '/admin/users', label: 'Admin - Usuarios' },
    { value: '/admin/roles', label: 'Admin - Roles' },
    { value: '/admin/views', label: 'Admin - Vistas' },
    { value: '/admin/reports', label: 'Admin - Reportes' }
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const { data: modulesData } = await supabase
        .from('tms_modules_config')
        .select('*')
        .order('id');

      const { data: rolesData } = await supabase
        .from('tms_roles')
        .select('*')
        .order('nombre');

      setModulesConfig(modulesData || []);
      setRoles(rolesData || []);

    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // ⭐ Cambiar estado de módulo y actualizar menú instantáneamente
  const handleToggleModule = async (id, currentStatus) => {
    try {
      setSaving(true);
      console.log('💾 Cambiando módulo:', id, '→', !currentStatus);
      
      const newStatus = !currentStatus;
      
      // Actualización optimista local
      setModulesConfig(prev => prev.map(m => 
        m.id === id ? { ...m, enabled: newStatus } : m
      ));

      // Guardar en BD
      const { error } = await supabase
        .from('tms_modules_config')
        .update({ 
          enabled: newStatus, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', id);

      if (error) throw error;

      console.log('✅ Módulo actualizado en BD');

      // ⭐⭐⭐ ACTUALIZAR EL MENÚ INSTANTÁNEAMENTE ⭐⭐⭐
      console.log('🔄 Actualizando menú...');
      await refreshConfig();
      console.log('✅ Menú actualizado');

    } catch (error) {
      console.error('❌ Error:', error);
      alert('Error: ' + error.message);
      await fetchData(); // Revertir en caso de error
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateLandingPage = async (roleId, newPath) => {
    try {
      setSaving(true);
      
      setRoles(prev => prev.map(r => 
        r.id === roleId ? { ...r, landing_page: newPath } : r
      ));

      const { error } = await supabase
        .from('tms_roles')
        .update({ landing_page: newPath })
        .eq('id', roleId);

      if (error) throw error;

    } catch (error) {
      console.error('Error:', error);
      alert('Error: ' + error.message);
      await fetchData();
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <Loader2 size={48} className="animate-spin text-indigo-500 mb-4" />
        <p className="text-slate-500">Cargando...</p>
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
            {saving && <Loader2 size={18} className="animate-spin text-green-500 ml-2" />}
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Los cambios se reflejan instantáneamente en el menú
          </p>
        </div>
        <button 
          onClick={fetchData} 
          className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg"
        >
          <RefreshCw size={20} />
        </button>
      </div>

      {/* Tabs Modernos */}
      <div className="flex gap-4">
        <button
          onClick={() => setActiveTab('modules')}
          className={`px-6 py-4 rounded-2xl text-sm font-bold flex items-center gap-3 transition-all flex-1 md:flex-none justify-center ${
            activeTab === 'modules' 
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 scale-[1.02]' 
              : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <Power size={18} />
          Activar/Desactivar Módulos
        </button>
        <button
          onClick={() => setActiveTab('landing')}
          className={`px-6 py-4 rounded-2xl text-sm font-bold flex items-center gap-3 transition-all flex-1 md:flex-none justify-center ${
            activeTab === 'landing' 
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 scale-[1.02]' 
              : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <Home size={18} />
          Página de Inicio por Rol
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {activeTab === 'modules' && (
          <div className="space-y-8">
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 flex items-start gap-4 text-amber-900 shadow-sm">
              <div className="bg-amber-100 p-2 rounded-lg text-amber-600">
                <AlertTriangle className="shrink-0" size={24} />
              </div>
              <div>
                <h4 className="font-bold text-lg mb-1">Control Global de Módulos</h4>
                <p className="opacity-90">
                  Desactivar un módulo aquí lo ocultará para <strong>todos los usuarios del sistema</strong>, independientemente de sus roles. 
                  El menú se actualiza <strong>instantáneamente</strong> al cambiar.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {modulesConfig.map(module => (
                <div 
                  key={module.id} 
                  className={`relative overflow-hidden flex flex-col justify-between p-6 rounded-2xl border-2 transition-all group ${
                    module.enabled 
                      ? 'bg-white border-slate-100 shadow-sm hover:border-indigo-200 hover:shadow-md' 
                      : 'bg-slate-50 border-slate-100 opacity-60 grayscale hover:grayscale-0 hover:opacity-100'
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${
                      module.enabled ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-200 text-slate-400'
                    }`}>
                      <Layout size={28} />
                    </div>
                    
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer"
                        checked={module.enabled}
                        onChange={() => handleToggleModule(module.id, module.enabled)}
                        disabled={saving}
                      />
                      <div className="w-14 h-8 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>

                  <div>
                    <h4 className={`text-xl font-bold mb-1 ${module.enabled ? 'text-slate-800' : 'text-slate-500'}`}>
                      {module.label || module.id}
                    </h4>
                    <p className="text-xs text-slate-400 font-mono uppercase tracking-wider">{module.id}</p>
                  </div>
                  
                  {module.enabled && (
                    <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-indigo-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500 pointer-events-none"></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'landing' && (
          <div className="space-y-8">
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 flex items-start gap-4 text-blue-900 shadow-sm">
              <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                <Home className="shrink-0" size={24} />
              </div>
              <div>
                <h4 className="font-bold text-lg mb-1">Rutas de Inicio Personalizadas</h4>
                <p className="opacity-90">
                  Define a qué pantalla será redirigido cada rol inmediatamente después de iniciar sesión.
                  Esto optimiza el flujo de trabajo para cada tipo de usuario.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {roles.map(role => (
                <div key={role.id} className="p-6 border border-slate-200 rounded-2xl bg-white hover:shadow-lg transition-all group">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600 font-bold text-xl group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                      {role.nombre?.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-slate-800 group-hover:text-indigo-700 transition-colors">{role.nombre}</h3>
                      <p className="text-xs text-slate-500">{role.descripcion || 'Sin descripción'}</p>
                    </div>
                  </div>
                  
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2 flex items-center gap-2">
                      <Home size={12} /> Página de Inicio
                    </label>
                    <div className="relative">
                      <select
                        className="w-full pl-3 pr-8 py-3 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none appearance-none cursor-pointer hover:border-indigo-300 transition-colors"
                        value={role.landing_page || '/dashboard'}
                        onChange={(e) => handleUpdateLandingPage(role.id, e.target.value)}
                      >
                        {availableRoutes.map(route => (
                          <option key={route.value} value={route.value}>
                            {route.label}
                          </option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-slate-500">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                      </div>
                    </div>
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
