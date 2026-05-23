import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabase';

const ConfigContext = createContext();

export const useConfig = () => useContext(ConfigContext);

export const ConfigProvider = ({ children }) => {
  const [modulesConfig, setModulesConfig] = useState({});
  const [loading, setLoading] = useState(true);

  const loadConfig = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('tms_modules_config')
        .select('id, enabled');

      if (error) throw error;

      const configMap = {};
      (data || []).forEach(item => {
        configMap[item.id] = item.enabled;
      });

      setModulesConfig(configMap);
      return configMap;
    } catch (_) {
      return {};
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshConfig = useCallback(async () => {
    return await loadConfig();
  }, [loadConfig]);

  useEffect(() => {
    loadConfig();

    const channel = supabase
      .channel('config_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tms_modules_config' },
        () => { loadConfig(); }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadConfig]);

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
