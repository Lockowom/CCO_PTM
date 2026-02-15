import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabase';

const ConfigContext = createContext();

export const useConfig = () => useContext(ConfigContext);

export const ConfigProvider = ({ children }) => {
  const [modulesConfig, setModulesConfig] = useState({});
  const [loading, setLoading] = useState(true);

  // Cargar configuración inicial
  const fetchConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('tms_modules_config')
        .select('*');
      
      if (error) throw error;

      // Convertir array a objeto para acceso rápido: { 'tms': true, 'inbound': false }
      const configMap = (data || []).reduce((acc, item) => {
        acc[item.id] = item.enabled;
        return acc;
      }, {});

      setModulesConfig(configMap);
    } catch (err) {
      console.error("Error loading config:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();

    // Suscripción a cambios en tiempo real
    const subscription = supabase
      .channel('public:tms_modules_config')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tms_modules_config' }, (payload) => {
        console.log('🔄 Cambio detectado en módulos (ConfigContext):', payload);
        
        // Actualizar estado local según el tipo de evento
        if (payload.eventType === 'DELETE' && payload.old?.id) {
          // Si se eliminó un módulo, quitarlo del estado
          setModulesConfig(prev => {
            const updated = { ...prev };
            delete updated[payload.old.id];
            return updated;
          });
        } else if (payload.new?.id !== undefined) {
          // Para INSERT y UPDATE, actualizar el módulo
          setModulesConfig(prev => ({
            ...prev,
            [payload.new.id]: payload.new.enabled
          }));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  // Función helper para verificar si un módulo está habilitado
  const isModuleEnabled = (moduleId) => {
    // Si no existe en la config, asumimos true por defecto (fail-open) o false según preferencia
    // Aquí asumimos true para no bloquear módulos nuevos no registrados
    return modulesConfig[moduleId] !== false;
  };

  const value = {
    modulesConfig,
    isModuleEnabled,
    refreshConfig: fetchConfig,
    loading
  };

  return (
    <ConfigContext.Provider value={value}>
      {children}
    </ConfigContext.Provider>
  );
};
