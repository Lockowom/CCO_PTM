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

// Carga DIRECTA del reporte de stock del ERP (hoja IW) → tms_inventario_general.
// Detecta las columnas POR NOMBRE (Cod. Producto / Producto / Disponible / …),
// así el archivo no puede entrar "corrido" como en Carga Masiva si falta la
// columna Bodega. Reemplaza la carga anterior del consolidado (bodega fija
// 'CONSOLIDADO') y deja el análisis listo al instante.
export const BODEGA_CONSOLIDADO = 'CONSOLIDADO';

export function useCargarStock() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (rows) => {
      // Reemplazo completo del consolidado anterior (evita mezclar dos reportes).
      const { error: delErr } = await supabase
        .from('tms_inventario_general').delete().eq('bodega', BODEGA_CONSOLIDADO);
      if (delErr) throw delErr;
      let insertados = 0;
      for (let i = 0; i < rows.length; i += 800) {
        const chunk = rows.slice(i, i + 800);
        const { data, error } = await supabase.rpc('bulk_upsert', {
          p_table: 'tms_inventario_general',
          p_data: chunk,
          p_conflict_keys: 'bodega,codigo_producto',
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

const num = (v) => {
  const x = Number(String(v ?? '').replace(/\./g, '').replace(',', '.'));
  return Number.isFinite(x) ? x : Number(v) || 0;
};

export async function parseStockFile(file) {
  const XLSX = await import('xlsx');
  const wb = XLSX.read(await file.arrayBuffer());
  for (const name of wb.SheetNames) {
    const rows = XLSX.utils.sheet_to_json(wb.Sheets[name], { header: 1, defval: '' });
    for (let h = 0; h < Math.min(rows.length, 10); h++) {
      const hdr = rows[h].map((c) => String(c || '').toLowerCase());
      const iCod = hdr.findIndex((c) => /cod/.test(c) && /prod/.test(c));
      const iDisp = hdr.findIndex((c) => /disponible/.test(c));
      if (iCod === -1 || iDisp === -1) continue;
      const col = (re) => hdr.findIndex((c) => re.test(c));
      const iProd = col(/^producto$|descrip/);
      const iUm = col(/medida|u\.?m\b/);
      const iRes = col(/reserva/);
      const iTra = col(/transitoria/);
      const iCon = col(/consign/);
      const iTot = col(/stock.*total|total.*stock/);
      const out = new Map();
      for (let r = h + 1; r < rows.length; r++) {
        const codigo = String(rows[r][iCod] ?? '').trim();
        if (!codigo) continue;
        const disponible = num(rows[r][iDisp]);
        const reserva = iRes >= 0 ? num(rows[r][iRes]) : 0;
        const transitoria = iTra >= 0 ? num(rows[r][iTra]) : 0;
        const consignacion = iCon >= 0 ? num(rows[r][iCon]) : 0;
        out.set(codigo, {
          bodega: BODEGA_CONSOLIDADO,
          codigo_producto: codigo,
          producto: iProd >= 0 ? String(rows[r][iProd] ?? '').trim() : '',
          unidad_medida: iUm >= 0 ? String(rows[r][iUm] ?? '').trim() : '',
          disponible, reserva, transitoria, consignacion,
          stock_total: iTot >= 0 ? num(rows[r][iTot]) : disponible + reserva + transitoria + consignacion,
        });
      }
      if (out.size) return [...out.values()];
    }
  }
  throw new Error('No se encontró una hoja con las columnas "Cod. Producto" y "Disponible" (formato del reporte de stock IW del ERP).');
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
