// ── Inventario → Análisis de Códigos (port del Excel "STOCK NAME") ─────────
// El cálculo vive en la BD (migración 067): analisis_codigos(filtro, q) y
// analisis_codigos_resumen() clasifican el stock (tms_inventario_general,
// sumado por SKU a través de bodegas) contra el catálogo tms_productos_activo.
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase';

export const FILTROS_ANALISIS = [
  { id: 'todos', label: 'Todos' },
  { id: 'antiguos', label: 'Antiguos' },
  { id: 'antiguos_disp', label: 'Antiguos con Disponible' },
  { id: 'no_activos_stock', label: 'No Activos con Stock' },
  { id: 'duplicados', label: 'Duplicados' },
  { id: 'anomalias', label: 'Anomalías' },
];

export function useAnalisisResumen() {
  return useQuery({
    queryKey: ['analisis_resumen'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('analisis_codigos_resumen');
      if (error) throw error;
      return data || {};
    },
    staleTime: 60_000,
  });
}

export function useAnalisisCodigos(filtro = 'todos', q = '') {
  return useQuery({
    queryKey: ['analisis_codigos', filtro, q || ''],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('analisis_codigos', {
        p_filtro: filtro, p_q: q || '',
      });
      if (error) throw error;
      return data || [];
    },
    staleTime: 60_000,
  });
}

// Carga del catálogo ACTIVO (hoja del ERP con la marca Si/No) → upsert por
// código en tms_productos_activo (bulk_upsert, chunks para no exceder payload).
export function useCargarActivo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (rows) => {
      let insertados = 0;
      for (let i = 0; i < rows.length; i += 800) {
        const chunk = rows.slice(i, i + 800);
        const { data, error } = await supabase.rpc('bulk_upsert', {
          p_table: 'tms_productos_activo',
          p_data: chunk,
          p_conflict_keys: 'codigo_producto',
        });
        if (error) throw error;
        if (data?.error) throw new Error(data.error);
        insertados += data?.inserted || 0;
      }
      return { insertados, total: rows.length };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['analisis_resumen'] });
      qc.invalidateQueries({ queryKey: ['analisis_codigos'] });
    },
  });
}

// Parsea el Excel/CSV del catálogo ACTIVO: detecta la fila de encabezados y
// mapea columnas por nombre (Código producto / Descripción / U. medida / Activo).
export async function parseActivoFile(file) {
  const XLSX = await import('xlsx');
  const wb = XLSX.read(await file.arrayBuffer());
  for (const name of wb.SheetNames) {
    const rows = XLSX.utils.sheet_to_json(wb.Sheets[name], { header: 1, defval: '' });
    // Buscar la fila de encabezados en las primeras 10 filas.
    for (let h = 0; h < Math.min(rows.length, 10); h++) {
      const hdr = rows[h].map((c) => String(c || '').toLowerCase());
      const iCod = hdr.findIndex((c) => /c[oó]d/.test(c) && /prod/.test(c));
      const iAct = hdr.findIndex((c) => /activo/.test(c));
      if (iCod === -1 || iAct === -1) continue;
      const iDesc = hdr.findIndex((c) => /descrip|^producto$/.test(c));
      const iUm = hdr.findIndex((c) => /medida|u\.?m\b/.test(c));
      const out = new Map();
      for (let r = h + 1; r < rows.length; r++) {
        const codigo = String(rows[r][iCod] ?? '').trim();
        if (!codigo) continue;
        out.set(codigo, {
          codigo_producto: codigo,
          producto: iDesc >= 0 ? String(rows[r][iDesc] ?? '').trim() : '',
          unidad_medida: iUm >= 0 ? String(rows[r][iUm] ?? '').trim() : '',
          activo: /^s[ií]/i.test(String(rows[r][iAct] ?? '').trim()),
        });
      }
      if (out.size) return [...out.values()];
    }
  }
  throw new Error('No se encontró una hoja con las columnas "Código producto" y "Activo" (formato de la hoja ACTIVO del ERP).');
}
