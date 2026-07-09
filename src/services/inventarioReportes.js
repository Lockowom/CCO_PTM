// Reportes del conteo cíclico: se calculan en el cliente a partir de wms_cc_conteos
// y los maestros existentes (tms_inventario_resumen, tms_partidas) + costos.
import { supabase } from '../supabase';

const round = (v) => Math.round((Number(v) || 0) * 100) / 100;
const estadoDif = (d) => (d === 0 ? 'CUADRADO' : d < 0 ? 'FALTA' : 'SOBRA');

async function inChunks(tabla, columnas, campo, valores) {
  const out = [];
  for (let i = 0; i < valores.length; i += 200) {
    const grupo = valores.slice(i, i + 200);
    const { data, error } = await supabase.from(tabla).select(columnas).in(campo, grupo);
    if (error) throw error;
    out.push(...(data || []));
  }
  return out;
}

async function conteosDeSesion(sesionId) {
  let q = supabase.from('wms_cc_conteos').select('*');
  q = sesionId ? q.eq('sesion_id', sesionId) : q;
  const { data, error } = await q;
  if (error) throw error;
  return data || [];
}

export async function conciliacion(sesionId) {
  const conteos = await conteosDeSesion(sesionId);
  const skus = [...new Set(conteos.map((c) => c.codigo_producto))];
  if (!skus.length) return [];
  const resumen = await inChunks('tms_inventario_resumen', 'codigo_producto, stock_total', 'codigo_producto', skus);
  const costos = await inChunks('wms_cc_costos', 'codigo_producto, costo_unitario', 'codigo_producto', skus);
  const sysMap = Object.fromEntries(resumen.map((r) => [r.codigo_producto, Number(r.stock_total) || 0]));
  const costoMap = Object.fromEntries(costos.map((r) => [r.codigo_producto, Number(r.costo_unitario) || 0]));

  const grupos = {};
  for (const c of conteos) {
    const g = (grupos[c.codigo_producto] = grupos[c.codigo_producto] || {
      codigo_producto: c.codigo_producto, descripcion: c.descripcion, unidad_medida: c.unidad_medida,
      contado: 0, lineas: 0, ubic: new Set(), part: new Set(), ser: new Set(),
    });
    g.contado += Number(c.cantidad_contada) || 0; g.lineas += 1;
    if (c.ubicacion) g.ubic.add(c.ubicacion);
    if (c.partida) g.part.add(c.partida);
    if (c.serie) g.ser.add(c.serie);
  }
  return Object.values(grupos).map((g) => {
    const contado = round(g.contado), sistema = round(sysMap[g.codigo_producto] || 0);
    const diferencia = round(contado - sistema), costo = costoMap[g.codigo_producto] || 0;
    return {
      codigo_producto: g.codigo_producto, descripcion: g.descripcion, unidad_medida: g.unidad_medida,
      contado, sistema, diferencia, estado: estadoDif(diferencia), lineas: g.lineas,
      ubicaciones: g.ubic.size, partidas_distintas: g.part.size, series_distintas: g.ser.size,
      costo_unitario: costo, impacto: round(diferencia * costo),
    };
  }).sort((a, b) => a.codigo_producto.localeCompare(b.codigo_producto));
}

export async function ajusteErp(sesionId) {
  const conteos = await conteosDeSesion(sesionId);
  const skus = [...new Set(conteos.map((c) => c.codigo_producto))];
  if (!skus.length) return [];
  const partidasSys = await inChunks('tms_partidas', 'codigo_producto, partida, stock_total', 'codigo_producto', skus);
  const costos = await inChunks('wms_cc_costos', 'codigo_producto, costo_unitario', 'codigo_producto', skus);
  const costoMap = Object.fromEntries(costos.map((r) => [r.codigo_producto, Number(r.costo_unitario) || 0]));
  const sysBySku = {};
  for (const p of partidasSys) (sysBySku[p.codigo_producto] = sysBySku[p.codigo_producto] || []).push(p);

  // contado por (sku, partida)
  const cont = {};
  for (const c of conteos) {
    const key = `${c.codigo_producto}|${c.partida || '(sin partida)'}`;
    const g = (cont[key] = cont[key] || { codigo_producto: c.codigo_producto, partida: c.partida || '(sin partida)', descripcion: c.descripcion, unidad_medida: c.unidad_medida, contado: 0, ubic: new Set() });
    g.contado += Number(c.cantidad_contada) || 0; if (c.ubicacion) g.ubic.add(c.ubicacion);
  }

  const out = [];
  for (const sku of skus) {
    const costo = costoMap[sku] || 0;
    const sys = sysBySku[sku] || [];
    const vistas = new Set();
    for (const sp of sys) {
      const part = sp.partida || '(sin partida)';
      vistas.add(part);
      const c = cont[`${sku}|${part}`];
      const contado = round(c?.contado || 0), sistema = round(sp.stock_total || 0);
      out.push(buildAjuste(sku, part, c, contado, sistema, round(contado - sistema), costo, ''));
    }
    for (const key of Object.keys(cont)) {
      const c = cont[key];
      if (c.codigo_producto !== sku || vistas.has(c.partida)) continue;
      const contado = round(c.contado);
      out.push(buildAjuste(sku, c.partida, c, contado, 0, contado, costo, '🆕 PARTIDA NUEVA (no existe en sistema)'));
    }
  }
  return out.sort((a, b) => a.codigo_producto.localeCompare(b.codigo_producto) || String(a.partida).localeCompare(String(b.partida)));
}

function buildAjuste(sku, partida, c, contado, sistema, diferencia, costo, alerta) {
  const tipo = diferencia > 0 ? 'ALTA' : diferencia < 0 ? 'BAJA' : 'CUADRADO';
  let estado;
  if (contado === 0 && sistema > 0) estado = '❌ NO CONTADO';
  else if (diferencia === 0) estado = '✅ CUADRADO';
  else if (diferencia > 0) estado = `⚠️ SOBRA ${Math.abs(diferencia)}`;
  else estado = `❌ FALTA ${Math.abs(diferencia)}`;
  return {
    codigo_producto: sku, partida, descripcion: c?.descripcion || '', unidad_medida: c?.unidad_medida || '',
    contado, sistema, diferencia, tipo_movimiento: tipo, estado, costo_unitario: costo,
    impacto: round(diferencia * costo), ubicaciones: c ? [...c.ubic].join(', ') : '', alerta_calidad: alerta,
  };
}

export async function analisis(sesionId) {
  const rows = await conciliacion(sesionId);
  const resumen = { CUADRADO: { cantidad: 0, valorizado: 0 }, FALTA: { cantidad: 0, valorizado: 0 }, SOBRA: { cantidad: 0, valorizado: 0 } };
  let impactoTotal = 0, unidades = 0;
  for (const r of rows) {
    resumen[r.estado].cantidad += 1;
    resumen[r.estado].valorizado = round(resumen[r.estado].valorizado + Math.abs(r.diferencia) * r.costo_unitario);
    impactoTotal = round(impactoTotal + r.impacto);
    unidades += r.contado;
  }
  return { resumen, skus_contados: rows.length, unidades_contadas: round(unidades), impacto_total: impactoTotal };
}
