// ── Info de la N.V. para Calidad · Salida y Post-Venta ──────────────────────
// Tras el cutover del Panel a CCO, la FUENTE DE VERDAD de las Notas de Venta es
// `tms_operaciones` EN EL MISMO proyecto Supabase de CCO. Antes esto leía un
// proyecto Supabase EXTERNO (el Panel en Vercel) con su anon key embebida en el
// bundle → se eliminó: (1) ya no se expone la llave de otro proyecto ni se envía
// PII cross-project, y (2) se leen datos EN VIVO (el externo quedó obsoleto tras
// el cutover). Usa el cliente CCO autenticado (sesión del usuario + RLS).
import { supabase } from '../supabase';

const OPERACIONES_READ_VIEW = 'tms_operaciones_vigentes';

const CAMPOS = [
  'nv_ptm', 'cliente', 'vendedor', 'factura', 'guia', 'transportista',
  'empresa_transporte', 'bultos', 'estado', 'tipo_despacho', 'urgente',
  'numero_envio', 'fecha_compromiso', 'fecha_despacho', 'centro_costo', 'division',
].join(', ');

// Normaliza la fila de operaciones a los campos que usa Calidad · Salida / Post-Venta.
export const mapNvPanel = (row) => (row ? {
  nv: String(row.nv_ptm ?? ''),
  cliente: row.cliente || '',
  vendedor: row.vendedor || '',
  factura: row.factura || '',
  guia: row.guia || '',
  transportista: row.transportista || row.empresa_transporte || '',
  bultos: row.bultos != null ? String(row.bultos) : '',
  estado: row.estado || '',
  tipoDespacho: row.tipo_despacho || '',
  urgente: !!row.urgente,
  numeroEnvio: row.numero_envio || '',
  fechaCompromiso: row.fecha_compromiso || '',
  fechaDespacho: row.fecha_despacho || '',
  centroCosto: row.centro_costo || '',
  division: row.division || '',
} : null);

// Busca una N.V (canal PTM) por número exacto en la operación viva. null si no existe.
export async function fetchNvPanel(nv) {
  const num = String(nv || '').replace(/[^0-9]/g, '');
  if (!num) return null;
  const { data, error } = await supabase
    .from(OPERACIONES_READ_VIEW)
    .select(CAMPOS)
    .eq('nv_ptm', Number(num))
    .order('fecha_estado', { ascending: false })
    .limit(1);
  if (error) throw new Error(error.message);
  return mapNvPanel((data && data[0]) || null);
}
