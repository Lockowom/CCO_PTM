import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabase';

const ConfigContext = createContext();

// Evento personalizado
const CONFIG_UPDATED_EVENT = 'config-updated';

export const emitConfigUpdate = () => {
  window.dispatchEvent(new CustomEvent(CONFIG_UPDATED_EVENT));
};

export const useConfig = () => useContext(ConfigContext);

export const ConfigProvider = ({ children }) => {
  const [modulesConfig, setModulesConfig] = useState({});
  const [loading, setLoading] = useState(true);

  // Cargar configuración
  const loadConfig = useCallback(async () => {
    try {
      console.log('📥 Cargando configuración de módulos...');
      
      const { data, error } = await supabase
        .from('tms_modules_config')
        .select('id, enabled');

      if (error) {
        console.error('Error cargando config:', error);
        return;
      }

      const configMap = (data || []).reduce((acc, item) => {
        acc[item.id] = item.enabled;
        return acc;
      }, {});

      console.log('✅ Módulos cargados:', Object.keys(configMap).length);
      setModulesConfig(configMap);
      
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Refrescar configuración
  const refreshConfig = useCallback(async () => {
    await loadConfig();
  }, [loadConfig]);

  // Cargar al iniciar
  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  // Escuchar eventos de actualización
  useEffect(() => {
    const handleConfigUpdate = () => {
      console.log('🔔 Evento de actualización de config recibido');
      loadConfig();
    };

    window.addEventListener(CONFIG_UPDATED_EVENT, handleConfigUpdate);
    return () => window.removeEventListener(CONFIG_UPDATED_EVENT, handleConfigUpdate);
  }, [loadConfig]);

  // Verificar si un módulo está habilitado
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
