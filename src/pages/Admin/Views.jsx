import React, { useState, useEffect } from 'react';
import {
  Layout, RefreshCw, Power, Home,
  AlertTriangle, Loader2
} from 'lucide-react';
import { supabase } from '../../supabase';
import { useConfig } from '../../context/ConfigContext';
import { APP_MODULES, APP_ROUTES } from '../../config/modules';

const ViewsPage = () => {
  // IMPORTANTE: Obtener refreshConfig del contexto
  const { refreshConfig } = useConfig();

  const [activeTab, setActiveTab] = useState('modules');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [modulesConfig, setModulesConfig] = useState([]);
  const [roles, setRoles] = useState([]);

  // Las rutas ahora vienen del archivo de configuración central
  const availableRoutes = APP_ROUTES;

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

      // 💡 FILTRADO DINÁMICO: Solo mostrar módulos que existen en APP_MODULES
      // Esto elimina automáticamente los módulos borrados del proyecto
      const validModuleIds = APP_MODULES.map(m => m.id);
      const filteredModules = (modulesData || []).filter(m => validModuleIds.includes(m.id));

      setModulesConfig(filteredModules);
      setRoles(rolesData || []);

    } catch (_) {
      console.error('Views fetch error:', _);
    } finally {
      setLoading(false);
    }
  };

  // ⭐ Cambiar estado de módulo y actualizar menú instantáneamente
  const handleToggleModule = async (id, currentStatus) => {
    try {
      setSaving(true);

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

      // La actualización en Navbar ocurre vía Realtime (ConfigContext)
      // Pero forzamos un refresh local por si acaso
      await refreshConfig();

    } catch (error) {
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
      alert('Error: ' + error.message);
      await fetchData();
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <Loader2 size={48} className="animate-spin text-orange-500 mb-4" />
        <p className="text-slate-500 font-medium animate-pulse">Cargando configuración...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 relative">
      {/* Background Decorativo */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden flex justify-center z-0">
        <div className="absolute top-[-10%] w-[800px] h-[400px] bg-orange-500/10 blur-[120px] rounded-full"></div>
        <div className="absolute top-[20%] left-[-10%] w-[400px] h-[400px] bg-amber-500/10 blur-[100px] rounded-full"></div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-orange-500/30 transform hover:scale-105 transition-transform">
            <Layout size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-800 flex items-center gap-3 tracking-tight">
              Configuración de <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-500">Vistas</span>
              {saving && <Loader2 size={20} className="animate-spin text-emerald-500" />}
            </h1>
            <p className="text-slate-500 text-sm mt-1 font-medium flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-orange-500"></span>
              </span>
              Los cambios se reflejan instantáneamente en el menú
            </p>
          </div>
        </div>
        <button
          onClick={fetchData}
          className="p-3 bg-white text-slate-500 hover:text-orange-600 hover:bg-orange-50 border border-slate-200 hover:border-orange-200 rounded-xl transition-all shadow-sm active:scale-95"
          title="Recargar configuración"
        >
          <RefreshCw size={20} />
        </button>
      </div>

      {/* Tabs Modernos */}
      <div className="flex gap-4 relative z-10 overflow-x-auto pb-2 no-scrollbar">
        <button
          onClick={() => setActiveTab('modules')}
          className={`px-6 py-3.5 rounded-2xl text-sm font-bold flex items-center gap-3 transition-all flex-shrink-0 ${activeTab === 'modules'
              ? 'bg-gradient-to-br from-orange-500 to-amber-600 text-white shadow-lg shadow-orange-500/30 scale-[1.02]'
              : 'bg-white text-slate-500 hover:text-orange-600 hover:bg-orange-50 border border-slate-200'
            }`}
        >
          <Power size={18} />
          Activar/Desactivar Módulos
        </button>
        <button
          onClick={() => setActiveTab('landing')}
          className={`px-6 py-3.5 rounded-2xl text-sm font-bold flex items-center gap-3 transition-all flex-shrink-0 ${activeTab === 'landing'
              ? 'bg-gradient-to-br from-orange-500 to-amber-600 text-white shadow-lg shadow-orange-500/30 scale-[1.02]'
              : 'bg-white text-slate-500 hover:text-orange-600 hover:bg-orange-50 border border-slate-200'
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
                  className={`relative overflow-hidden flex flex-col justify-between p-6 rounded-3xl border-2 transition-all group ${module.enabled
                      ? 'bg-white border-orange-100 shadow-md hover:border-orange-300 hover:shadow-xl hover:-translate-y-1'
                      : 'bg-slate-50 border-slate-200 opacity-70 grayscale hover:grayscale-0 hover:opacity-100'
                    }`}
                >
                  <div className="flex justify-between items-start mb-4 relative z-10">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 ${module.enabled ? 'bg-gradient-to-br from-orange-100 to-amber-50 text-orange-600 shadow-inner' : 'bg-slate-200 text-slate-400'
                      }`}>
                      <Layout size={28} />
                    </div>

                    <label className="relative inline-flex items-center cursor-pointer w-14 h-7 transition duration-200 ease-in-out group-hover:scale-105">
                      <input
                        type="checkbox"
                        className="peer absolute opacity-0 w-0 h-0"
                        checked={module.enabled}
                        onChange={() => handleToggleModule(module.id, module.enabled)}
                        disabled={saving}
                      />
                      <span className={`block w-full h-full rounded-full transition-colors duration-300 shadow-inner ${module.enabled ? 'bg-gradient-to-r from-orange-500 to-amber-500' : 'bg-slate-300'}`}></span>
                      <span className={`absolute left-1 top-1 bg-white w-5 h-5 rounded-full transition-transform duration-300 shadow-md ${module.enabled ? 'translate-x-7' : 'translate-x-0'}`}></span>
                    </label>
                  </div>

                  <div className="relative z-10">
                    <h4 className={`text-xl font-black mb-1 transition-colors ${module.enabled ? 'text-slate-800' : 'text-slate-500'}`}>
                      {module.label || module.id}
                    </h4>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{module.id}</p>
                  </div>

                  {module.enabled && (
                    <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-gradient-to-br from-orange-500/10 to-amber-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700 pointer-events-none"></div>
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
                <div key={role.id} className="p-6 border border-slate-200 rounded-3xl bg-white hover:shadow-xl hover:-translate-y-1 hover:border-orange-300 transition-all duration-300 group">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-600 font-black text-2xl group-hover:bg-gradient-to-br group-hover:from-orange-500 group-hover:to-amber-600 group-hover:text-white group-hover:shadow-lg group-hover:shadow-orange-500/30 transition-all duration-300">
                      {role.nombre?.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-black text-xl text-slate-800 group-hover:text-orange-600 transition-colors">{role.nombre}</h3>
                      <p className="text-sm font-medium text-slate-500">{role.descripcion || 'Sin descripción'}</p>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 group-hover:bg-orange-50/50 group-hover:border-orange-100 transition-colors">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <Home size={14} className="text-orange-500" /> Página de Inicio Principal
                    </label>
                    <div className="relative group/select">
                      <select
                        className="w-full pl-4 pr-10 py-3.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none appearance-none cursor-pointer hover:border-orange-300 transition-all shadow-sm"
                        value={role.landing_page || '/dashboard'}
                        onChange={(e) => handleUpdateLandingPage(role.id, e.target.value)}
                      >
                        {availableRoutes.map(route => (
                          <option key={route.value} value={route.value}>
                            {route.label}
                          </option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-slate-400 group-hover/select:text-orange-500 transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"></path></svg>
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
