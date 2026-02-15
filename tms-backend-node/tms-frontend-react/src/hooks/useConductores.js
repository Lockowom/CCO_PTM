// useConductores.js - Hook con Realtime para actualizaciones instantáneas
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';

export function useConductores() {
  const [conductores, setConductores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar conductores inicial
  const fetchConductores = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('tms_conductores')
        .select('*')
        .order('nombre', { ascending: true });

      if (error) throw error;
      setConductores(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Crear conductor
  const crearConductor = async (conductor) => {
    const { data, error } = await supabase
      .from('tms_conductores')
      .insert(conductor)
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  // Actualizar conductor
  const actualizarConductor = async (id, updates) => {
    const { data, error } = await supabase
      .from('tms_conductores')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  // Eliminar conductor
  const eliminarConductor = async (id) => {
    const { error } = await supabase
      .from('tms_conductores')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  };

  // Suscripción Realtime
  useEffect(() => {
    fetchConductores();

    // Configurar canal Realtime
    const channel = supabase
      .channel('tms_conductores_changes')
      .on(
        'postgres_changes',
        {
          event: '*', // INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'tms_conductores',
        },
        (payload) => {
          console.log('🔄 Realtime event:', payload.eventType, payload);

          switch (payload.eventType) {
            case 'INSERT':
              setConductores((prev) => [...prev, payload.new]);
              break;

            case 'UPDATE':
              setConductores((prev) =>
                prev.map((c) =>
                  c.id === payload.new.id ? payload.new : c
                )
              );
              break;

            case 'DELETE':
              setConductores((prev) =>
                prev.filter((c) => c.id !== payload.old.id)
              );
              break;
          }
        }
      )
      .subscribe((status) => {
        console.log('📡 Realtime status:', status);
      });

    // Cleanup al desmontar
    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchConductores]);

  return {
    conductores,
    loading,
    error,
    crearConductor,
    actualizarConductor,
    eliminarConductor,
    refetch: fetchConductores,
  };
}
