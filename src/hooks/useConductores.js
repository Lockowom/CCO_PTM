// useConductores.js - Hook con Realtime para actualizaciones instantáneas
import { useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function useConductores() {
  const queryClient = useQueryClient();

  const { data: conductores = [], isLoading: loading, error } = useQuery({
    queryKey: ['conductores'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tms_conductores')
        .select('*')
        .order('nombre', { ascending: true });

      if (error) throw error;
      return data || [];
    },
  });

  const crearMutation = useMutation({
    mutationFn: async (conductor) => {
      const { data, error } = await supabase
        .from('tms_conductores')
        .insert(conductor)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries(['conductores']),
  });

  const actualizarMutation = useMutation({
    mutationFn: async ({ id, updates }) => {
      const { data, error } = await supabase
        .from('tms_conductores')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onMutate: async ({ id, updates }) => {
      await queryClient.cancelQueries(['conductores']);
      const previousConductores = queryClient.getQueryData(['conductores']);
      queryClient.setQueryData(['conductores'], old => 
        old?.map(c => c.id === id ? { ...c, ...updates } : c)
      );
      return { previousConductores };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(['conductores'], context.previousConductores);
    },
    onSettled: () => {
      queryClient.invalidateQueries(['conductores']);
    }
  });

  const eliminarMutation = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase
        .from('tms_conductores')
        .delete()
        .eq('id', id);
      if (error) throw error;
      return true;
    },
    onSuccess: () => queryClient.invalidateQueries(['conductores']),
  });

  // Suscripción Realtime
  useEffect(() => {
    const channel = supabase
      .channel('tms_conductores_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tms_conductores' },
        (payload) => {
          queryClient.invalidateQueries(['conductores']);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return {
    conductores,
    loading,
    error: error?.message || null,
    crearConductor: (conductor) => crearMutation.mutateAsync(conductor),
    actualizarConductor: (id, updates) => actualizarMutation.mutateAsync({ id, updates }),
    eliminarConductor: (id) => eliminarMutation.mutateAsync(id),
    refetch: () => queryClient.invalidateQueries(['conductores']),
  };
}
