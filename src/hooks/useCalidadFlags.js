import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { supabase } from '../supabase';

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
  const { data: flags = [], isLoading } = useQuery({
    queryKey: ['calidad_flags'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tms_calidad_flags')
        .select('codigo_producto, partida, ubicacion, estado_calidad, severidad, nota')
        .eq('vigente', true);
      if (error) throw error;
      return data || [];
    },
    staleTime: 60_000,
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
