import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabase';

const ConfigContext = createContext();

export const useConfig = () => useContext(ConfigContext);

export const ConfigProvider = ({ children }) => {
  const [modulesConfig, setModulesConfig] = useState({});
  const [loading, setLoading] = useState(true);
  const [configVersion, setConfigVersion] = useState(0);

  // Cargar configuración
  const fetchConfig = useCallback(async () => {
    try {
      console.log('🔍 Cargando configuración de módulos...');
      const { data, error } = await supabase
        .from('tms_modules_config')
        .select('*');
      
      if (error) throw error;

      const configMap = (data || []).reduce((acc, item) => {
        acc[item.id] = item.enabled;
        return acc;
      }, {});

      console.log('✅ Módulos cargados:', Object.keys(configMap).length);
      setModulesConfig(configMap);
      setConfigVersion(v => v + 1);
    } catch (err) {
      console.error("Error loading config:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Refrescar configuración manualmente
  const refreshConfig = useCallback(async () => {
    console.log('🔄 Refrescando configuración manualmente...');
    await fetchConfig();
  }, [fetchConfig]);

  useEffect(() => {
    fetchConfig();

    // Suscripción a cambios en tiempo real
    const subscription = supabase
      .channel(`modules_config_${Date.now()}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'tms_modules_config' 
      }, (payload) => {
        console.log('🔄 Cambio detectado en módulos (Realtime):', payload);
        
        if (payload.eventType === 'DELETE' && payload.old?.id) {
          setModulesConfig(prev => {
            const updated = { ...prev };
            delete updated[payload.old.id];
            return updated;
          });
        } else if (payload.new?.id !== undefined) {
          setModulesConfig(prev => ({
            ...prev,
            [payload.new.id]: payload.new.enabled
          }));
        }
        setConfigVersion(v => v + 1);
      })
      .subscribe((status) => {
        console.log('📡 Estado suscripción módulos:', status);
      });

    // Polling como fallback (cada 30 segundos)
    const pollInterval = setInterval(() => {
      console.log('⏰ Polling de configuración...');
      fetchConfig();
    }, 30000);

    return () => {
      supabase.removeChannel(subscription);
      clearInterval(pollInterval);
    };
  }, [fetchConfig]);

  // Verificar si un módulo está habilitado
  const isModuleEnabled = useCallback((moduleId) => {
    return modulesConfig[moduleId] !== false;
  }, [modulesConfig]);

  const value = {
    modulesConfig,
    isModuleEnabled,
    refreshConfig,
    loading,
    configVersion
  };

  return (
    <ConfigContext.Provider value={value}>
      {children}
    </ConfigContext.Provider>
  );
};
