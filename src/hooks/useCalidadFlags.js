import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { supabase } from '../supabase';
import { useAuth } from '../context/AuthContext';

function useCanViewCalidadFlags() {
  const { user, loading, hasPermission } = useAuth();
  const isAdmin = user?.rol === 'ADMIN' || user?.es_admin_delegado === true;
  const canView =
    isAdmin ||
    [
      'manage_quality',
      'manage_monitoreo',
      'view_acciones_calidad',
      'manage_inventory',
      'view_locations',
      'manage_locations',
      'view_stock',
      'manage_stock',
      'view_inventario'
    ].some((permissionId) => hasPermission(permissionId));
  return !loading && canView;
}

/**
 * Lee el overlay persistente de estado de calidad (tms_calidad_flags) y lo
 * expone como índices para pintar badges en cualquier vista (Ubicaciones, Lotes).
 *
 * Devuelve:
 *  - byCodigo:        Map<codigo, flag de mayor severidad>
 *  - byCodigoUbic:    Map<`${codigo}::${ubicacion}`, flag>
 *  - flagForItem(codigo, ubicacion): resuelve el flag más específico/severo.
 */
export function useCalidadFlags() {
  const enabled = useCanViewCalidadFlags();
  const { data: flags = [], isLoading } = useQuery({
    queryKey: ['calidad_flags'],
    enabled,
    meta: { module: 'quality', action: 'calidad_flags_query', table: 'tms_calidad_flags' },
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tms_calidad_flags')
        .select('codigo_producto, partida, ubicacion, estado_calidad, severidad, nota')
        .eq('vigente', true);
      if (error) throw error;
      return data || [];
    },
    staleTime: 60_000,
    gcTime: 10 * 60_000,
    refetchOnWindowFocus: false,
    retry: 1,
    retryDelay: (attempt) => Math.min(500 * 2 ** attempt, 2_000)
  });

  const { byCodigo, byCodigoUbic } = useMemo(() => {
    const codigo = new Map();
    const codigoUbic = new Map();
    for (const f of flags) {
      const cod = (f.codigo_producto || '').toUpperCase();
      const prev = codigo.get(cod);
      if (!prev || f.severidad > prev.severidad) codigo.set(cod, f);

      if (f.ubicacion) {
        const key = `${cod}::${(f.ubicacion || '').toUpperCase()}`;
        const prevU = codigoUbic.get(key);
        if (!prevU || f.severidad > prevU.severidad) codigoUbic.set(key, f);
      }
    }
    return { byCodigo: codigo, byCodigoUbic: codigoUbic };
  }, [flags]);

  function flagForItem(codigo, ubicacion) {
    const cod = (codigo || '').toUpperCase();
    if (ubicacion) {
      const specific = byCodigoUbic.get(`${cod}::${(ubicacion || '').toUpperCase()}`);
      if (specific) return specific;
    }
    return byCodigo.get(cod) || null;
  }

  return { flags, isLoading, byCodigo, byCodigoUbic, flagForItem };
}
