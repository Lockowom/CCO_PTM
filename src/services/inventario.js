// Servicio del módulo Inventario: reutiliza los maestros existentes del sistema
// (tms_matriz_codigos, tms_inventario_resumen, tms_partidas, tms_series,
// wms_ubicaciones) para no duplicar la data de SKUs.
import { supabase } from '../supabase';

// Búsqueda de productos por código o descripción (autocompletado)
export async function buscarProductos(q, limit = 20) {
  const term = (q || '').trim();
  if (!term) return [];
  const like = `%${term}%`;
  const { data, error } = await supabase
    .from('tms_matriz_codigos')
    .select('codigo_producto, producto, unidad_medida')
    .or(`codigo_producto.ilike.${like},producto.ilike.${like}`)
    .limit(limit);
  if (error) throw error;
  return data || [];
}

// Detalle de un SKU: producto + stock total del sistema + partidas + series + costo
export async function detalleProducto(codigo) {
  const [prod, resumen, partidas, series, costo] = await Promise.all([
    supabase.from('tms_matriz_codigos').select('codigo_producto, producto, unidad_medida').eq('codigo_producto', codigo).maybeSingle(),
    supabase.from('tms_inventario_resumen').select('*').eq('codigo_producto', codigo).maybeSingle(),
    supabase.from('tms_partidas').select('partida, fecha_vencimiento, disponible, stock_total').eq('codigo_producto', codigo).order('partida'),
    supabase.from('tms_series').select('serie, stock_total, ubicacion_actual').eq('codigo_producto', codigo).limit(200),
    supabase.from('wms_cc_costos').select('costo_unitario').eq('codigo_producto', codigo).maybeSingle(),
  ]);
  return {
    producto: prod.data || null,
    resumen: resumen.data || null,
    partidas: partidas.data || [],
    series: series.data || [],
    costo_unitario: Number(costo.data?.costo_unitario) || 0,
    stock_sistema: Number(resumen.data?.stock_total) || 0,
  };
}

// Stock del sistema relevante para un registro: serie > partida > total del SKU
export async function stockSistema({ codigo_producto, partida, serie }) {
  if (serie) {
    const { data } = await supabase.from('tms_series').select('stock_total').eq('codigo_producto', codigo_producto).eq('serie', serie).maybeSingle();
    if (data) return Number(data.stock_total) || 0;
  }
  if (partida) {
    const { data } = await supabase.from('tms_partidas').select('stock_total').eq('codigo_producto', codigo_producto).eq('partida', partida).maybeSingle();
    if (data) return Number(data.stock_total) || 0;
  }
  const { data } = await supabase.from('tms_inventario_resumen').select('stock_total').eq('codigo_producto', codigo_producto).maybeSingle();
  return Number(data?.stock_total) || 0;
}

export function calcEstado(contada, sistema) {
  const c = Number(contada) || 0;
  const s = Number(sistema) || 0;
  if (s === 0 && c > 0) return 'SIN_STOCK';
  if (c === s) return 'CUADRADO';
  return c < s ? 'FALTA' : 'SOBRA';
}
