// ── Conexión de SOLO LECTURA al "Panel Dashboard PTM" (Supabase externo) ────
// El panel (panel-dashboard-ptm.vercel.app) vive en otro proyecto Supabase y
// mantiene la tabla `operaciones` con el ciclo de vida de cada Nota de Venta
// (cliente, vendedor, factura, guía, transportista, bultos, estado, fechas).
// Su tabla tiene lectura pública por RLS y esta es su anon key (pública por
// diseño, la misma que expone el propio panel en su frontend), así que basta
// el REST de PostgREST — sin credenciales secretas ni segundo cliente supabase.
const PANEL_URL = 'https://yynlmcxmkrlmhqqoxskb.supabase.co';
const PANEL_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl5bmxtY3hta3JsbWhxcW94c2tiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODExMTQzMzgsImV4cCI6MjA5NjY5MDMzOH0.zO8D87FBytEvSRuhiAhtBI733qHqCLhViJVkHdU-D6k';

const CAMPOS = [
  'nv_ptm', 'cliente', 'vendedor', 'factura', 'guia', 'transportista',
  'empresa_transporte', 'bultos', 'estado', 'tipo_despacho', 'urgente',
  'numero_envio', 'fecha_compromiso', 'fecha_despacho', 'centro_costo', 'division',
].join(',');

// Normaliza la fila del panel a los campos que usa Calidad · Salida.
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

// Busca una N.V por número exacto. Devuelve null si no existe en el panel.
export async function fetchNvPanel(nv) {
  const num = String(nv || '').replace(/[^0-9]/g, '');
  if (!num) return null;
  const url = `${PANEL_URL}/rest/v1/operaciones?nv_ptm=eq.${num}&select=${CAMPOS}&limit=1`;
  const res = await fetch(url, {
    headers: { apikey: PANEL_ANON, Authorization: `Bearer ${PANEL_ANON}` },
  });
  if (!res.ok) throw new Error(`Panel PTM respondió HTTP ${res.status}`);
  const rows = await res.json();
  return mapNvPanel(rows?.[0]);
}
