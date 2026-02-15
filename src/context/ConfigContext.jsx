import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabase';

const ConfigContext = createContext();

export const useConfig = () => useContext(ConfigContext);

export const ConfigProvider = ({ children }) => {
  const [modulesConfig, setModulesConfig] = useState({});
  const [loading, setLoading] = useState(true);

  // Cargar configuración desde BD
  const loadConfig = useCallback(async () => {
    try {
      console.log('📥 Cargando configuración de módulos...');
      
      const { data, error } = await supabase
        .from('tms_modules_config')
        .select('id, enabled');

      if (error) throw error;

      const configMap = {};
      (data || []).forEach(item => {
        configMap[item.id] = item.enabled;
      });

      console.log('✅ Módulos cargados:', Object.keys(configMap).length);
      setModulesConfig(configMap);
      return configMap;
      
    } catch (err) {
      console.error('❌ Error cargando config:', err);
      return {};
    } finally {
      setLoading(false);
    }
  }, []);

  // FUNCIÓN PÚBLICA: Refrescar config (llamar desde Views.jsx)
  const refreshConfig = useCallback(async () => {
    console.log('🔄 Refrescando configuración...');
    return await loadConfig();
  }, [loadConfig]);

  // Cargar al iniciar
  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  // Verificar si módulo está habilitado
  const isModuleEnabled = useCallback((moduleId) => {
    return modulesConfig[moduleId] !== false;
  }, [modulesConfig]);

  return (
    <ConfigContext.Provider value={{
      modulesConfig,
      isModuleEnabled,
      refreshConfig,
      loading
    }}>
      {children}
    </ConfigContext.Provider>
  );
};
