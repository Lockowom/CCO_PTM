import { s as o } from './index-DaxBKrsQ.js';
const s = 'tms_operaciones_vigentes',
  i = [
    'nv_ptm',
    'cliente',
    'vendedor',
    'factura',
    'guia',
    'transportista',
    'empresa_transporte',
    'bultos',
    'estado',
    'tipo_despacho',
    'urgente',
    'numero_envio',
    'fecha_compromiso',
    'fecha_despacho',
    'centro_costo',
    'division'
  ].join(', '),
  c = (e) =>
    e
      ? {
          nv: String(e.nv_ptm ?? ''),
          cliente: e.cliente || '',
          vendedor: e.vendedor || '',
          factura: e.factura || '',
          guia: e.guia || '',
          transportista: e.transportista || e.empresa_transporte || '',
          bultos: e.bultos != null ? String(e.bultos) : '',
          estado: e.estado || '',
          tipoDespacho: e.tipo_despacho || '',
          urgente: !!e.urgente,
          numeroEnvio: e.numero_envio || '',
          fechaCompromiso: e.fecha_compromiso || '',
          fechaDespacho: e.fecha_despacho || '',
          centroCosto: e.centro_costo || '',
          division: e.division || ''
        }
      : null;
async function p(e) {
  const t = String(e || '').replace(/[^0-9]/g, '');
  if (!t) return null;
  const { data: n, error: a } = await o
    .from(s)
    .select(i)
    .eq('nv_ptm', Number(t))
    .order('fecha_estado', { ascending: !1 })
    .limit(1);
  if (a) throw new Error(a.message);
  return c((n && n[0]) || null);
}
export { p as f };
