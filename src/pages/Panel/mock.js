// Datos de EJEMPLO para el Panel PTM nativo (Fase de estructura, sin datos
// reales). Cuando se conecte a Supabase, esta capa se reemplaza por consultas
// reales (equivalente a lib/queries.ts del repo panel-). Las formas imitan el
// payload del dashboard original para que las pantallas se puedan pulir.

export const MOCK_KPIS = {
  totalNV: 1284,
  entregadas: 942,
  enProceso: 231,
  enRuta: 74,
  conVendedor: 21,
  retiro: 16,
  atiempoPct: 91.4,
  otifPct: 88.2,
  leadTimeProm: 3.6,
  // Notas de Venta por canal (hero)
  countNvPtm: 862,
  nvOrange: 248,
  nvFarmapack: 121,
  nvVarios: 53,
  // KPIs operacionales
  activas: 342,
  leadTimeTardanza: 2.1,
  pctAtiempo: 91.4,
  fillRateShipping: { pct: 87, evaluables: 214 },
};

// Tiempos de ciclo (lead time total + etapas + cuello de botella)
export const MOCK_TIEMPOS = {
  leadTimeTotal: 3.6,
  leadTimeTotalN: 942,
  etapas: [
    { nombre: 'Aprobación → Picking', dias: 0.8, n: 910 },
    { nombre: 'Picking → Packing', dias: 1.2, n: 880 },
    { nombre: 'Packing → Despacho', dias: 0.9, n: 845 },
    { nombre: 'Despacho → Entrega', dias: 0.7, n: 812 },
  ],
  cuelloBotella: { nombre: 'Picking → Packing', dias: 1.2 },
};

// Genera filas de detalle COHERENTES con el contexto clicado (estado + cantidad).
// Determinista (misma selección → mismas filas) para que el detalle sea preciso.
const CLIENTES = ['Clínica Los Andes', 'Hospital Regional', 'Lab. BioTest', 'Dental Sur',
  'Comercial El Roble', 'Farmacia Vida', 'Clínica Norte', 'Centro Médico Sur', 'Hospital Del Valle', 'Policlínico Oriente'];
const VENDEDORES = ['M. González', 'P. Rojas', 'C. Díaz', 'A. Muñoz', 'L. Torres', 'R. Silva'];

export function buildDetalle(titulo, count) {
  const total = Math.max(1, count || 4);
  const mostrar = Math.min(total, 8); // se listan hasta 8; el resto va en "y N más"
  let seed = String(titulo).length * 97 + total;
  const rand = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
  const rows = [];
  for (let i = 0; i < mostrar; i++) {
    const r = rand();
    rows.push({
      nv: `NV-${20400 + Math.floor(r * 300)}`,
      cliente: CLIENTES[(i + Math.floor(r * 10)) % CLIENTES.length],
      vendedor: VENDEDORES[(i + Math.floor(r * 6)) % VENDEDORES.length],
      estado: titulo,
      fecha: `2026-07-${String(8 + (i % 20)).padStart(2, '0')}`,
      monto: Math.round((300000 + r * 4000000) / 1000) * 1000,
    });
  }
  return { total, mostrados: mostrar, rows };
}

export const MOCK_ESTADO_TABLE = [
  { estado: 'Entregado', count: 942, badge: 'entregado' },
  { estado: 'En Proceso', count: 231, badge: 'proceso' },
  { estado: 'En Ruta', count: 74, badge: 'ruta' },
  { estado: 'Con Vendedor', count: 21, badge: 'vendedor' },
  { estado: 'Retiro en Bodega', count: 16, badge: 'retiro' },
  { estado: 'Sin Stock', count: 9, badge: 'stock' },
];

export const MOCK_RESUMEN = [
  { estado: 'Pendiente Picking', count: 42 },
  { estado: 'En Packing', count: 58 },
  { estado: 'Listo Despacho', count: 33 },
  { estado: 'En Tránsito', count: 74 },
];

export const MOCK_WEEKLY = [
  { semana: 'Sem 1', creadas: 210, entregadas: 190 },
  { semana: 'Sem 2', creadas: 265, entregadas: 240 },
  { semana: 'Sem 3', creadas: 240, entregadas: 232 },
  { semana: 'Sem 4', creadas: 288, entregadas: 271 },
  { semana: 'Sem 5', creadas: 254, entregadas: 245 },
  { semana: 'Sem 6', creadas: 301, entregadas: 289 },
];

export const MOCK_LEADTIME = [
  { semana: 'Sem 1', dias: 4.1 },
  { semana: 'Sem 2', dias: 3.8 },
  { semana: 'Sem 3', dias: 3.9 },
  { semana: 'Sem 4', dias: 3.4 },
  { semana: 'Sem 5', dias: 3.6 },
  { semana: 'Sem 6', dias: 3.2 },
];

export const MOCK_RANK_TRANSP = [
  { nombre: 'Transportes Andes', entregas: 312, atiempoPct: 94 },
  { nombre: 'LogiSur', entregas: 268, atiempoPct: 90 },
  { nombre: 'RápidoExpress', entregas: 201, atiempoPct: 87 },
  { nombre: 'CargoNorte', entregas: 154, atiempoPct: 92 },
];

export const MOCK_RANK_VEND = [
  { nombre: 'M. González', nv: 148, monto: 62_400_000 },
  { nombre: 'P. Rojas', nv: 121, monto: 51_900_000 },
  { nombre: 'C. Díaz', nv: 98, monto: 44_100_000 },
  { nombre: 'A. Muñoz', nv: 87, monto: 39_800_000 },
];

export const MOCK_DIVISIONS = [
  { division: 'Hospitalaria', nv: 512, entregadas: 470 },
  { division: 'Dental', nv: 388, entregadas: 351 },
  { division: 'Laboratorio', nv: 244, entregadas: 220 },
  { division: 'Veterinaria', nv: 140, entregadas: 128 },
];

export const MOCK_ALERTAS_OP = [
  { nv: 'NV-20451', cliente: 'Clínica Los Andes', estado: 'En Proceso', dias: 6, riesgo: 'alto' },
  { nv: 'NV-20488', cliente: 'Hospital Regional', estado: 'Con Vendedor', dias: 4, riesgo: 'medio' },
  { nv: 'NV-20502', cliente: 'Lab. BioTest', estado: 'Sin Stock', dias: 8, riesgo: 'alto' },
];

export const MOCK_TENDENCIA = [
  { label: 'Feb', entregadas: 820, otif: 85 },
  { label: 'Mar', entregadas: 910, otif: 87 },
  { label: 'Abr', entregadas: 880, otif: 86 },
  { label: 'May', entregadas: 970, otif: 89 },
  { label: 'Jun', entregadas: 1020, otif: 90 },
  { label: 'Jul', entregadas: 1084, otif: 91 },
];

// Dataset de N.V. de ejemplo para "Info N.V." (buscador universal).
export const MOCK_NVS = [
  {
    id: 1, canal: 'PTM', nv: '97125', nv_ptm: '97125', cliente: 'Clínica Los Andes', vendedor: 'M. González',
    division: 'DIV. HOSPITALARIA', centro_costo: '1-06', transportista: 'Transportes Andes', empresa_transporte: 'LogiSur',
    tipo_despacho: 'Directo', estado: 'En Ruta', urgente: true, factura: 'F-4412', guia: 'G-8890', numero_envio: 'ENV-2231',
    valor_factura: 2450000, valor_nv: 2600000, costo_flete: 48000, bultos: 12, fillrate: '98%',
    incidencia: '', estado_incidencia: '', observaciones_incidencia: '', dias_incidencia: '',
    fecha_registro_nv: '2026-07-08', fecha_aprobacion: '2026-07-08', fecha_aprobacion_real: '2026-07-09',
    fecha_compromiso: '2026-07-11', fecha_facturacion: '2026-07-09', fecha_en_proceso: '2026-07-09',
    fecha_shipping: '2026-07-10', fecha_despacho: '2026-07-10', fecha_en_ruta: '2026-07-11', fecha_entregado: '', fecha_estado: '2026-07-11',
  },
  {
    id: 2, canal: 'Orange', nv: '88431', nv_orange: '88431', cliente: 'Hospital Regional', vendedor: 'P. Rojas',
    division: 'DIV. INSTITUCIONAL', centro_costo: '2-03', transportista: 'RápidoExpress', empresa_transporte: 'RápidoExpress',
    tipo_despacho: 'Courier - Inyección', estado: 'Entregado', urgente: false, factura: 'F-4390', guia: 'G-8871', numero_envio: 'ENV-2210',
    valor_factura: 1180000, valor_nv: 1180000, costo_flete: 22000, bultos: 5, fillrate: '100%',
    incidencia: '', estado_incidencia: '', observaciones_incidencia: '', dias_incidencia: '',
    fecha_registro_nv: '2026-07-05', fecha_aprobacion: '2026-07-05', fecha_aprobacion_real: '2026-07-05',
    fecha_compromiso: '2026-07-08', fecha_facturacion: '2026-07-06', fecha_en_proceso: '2026-07-06',
    fecha_shipping: '2026-07-07', fecha_despacho: '2026-07-07', fecha_en_ruta: '2026-07-07', fecha_entregado: '2026-07-08', fecha_estado: '2026-07-08',
  },
  {
    id: 3, canal: 'Farmapack', nv: '55012', nv_farmapack: '55012', cliente: 'Lab. BioTest', vendedor: 'C. Díaz',
    division: 'DIV. LABORATORIO', centro_costo: '3-01', transportista: 'CargoNorte', empresa_transporte: 'CargoNorte',
    tipo_despacho: 'Directo', estado: 'En Proceso', urgente: false, factura: '', guia: '', numero_envio: '',
    valor_factura: 3920000, valor_nv: 3920000, costo_flete: 0, bultos: 20, fillrate: '',
    incidencia: 'Faltante parcial', estado_incidencia: 'Abierta', observaciones_incidencia: 'Falta 1 caja', dias_incidencia: 2,
    fecha_registro_nv: '2026-07-11', fecha_aprobacion: '2026-07-11', fecha_aprobacion_real: '2026-07-12',
    fecha_compromiso: '2026-07-14', fecha_facturacion: '', fecha_en_proceso: '2026-07-12',
    fecha_shipping: '', fecha_despacho: '', fecha_en_ruta: '', fecha_entregado: '', fecha_estado: '2026-07-12',
  },
  {
    id: 4, canal: 'Varios', nv: 'V-3021', varios: 'V-3021', cliente: 'Dental Sur', vendedor: 'A. Muñoz',
    division: 'DIV. DENTAL', centro_costo: '4-02', transportista: '', empresa_transporte: '',
    tipo_despacho: 'Courier (Retiro / Pick-up)', estado: 'Con Vendedor', urgente: false, factura: '', guia: '', numero_envio: '',
    valor_factura: 640000, valor_nv: 640000, costo_flete: 0, bultos: 2, fillrate: '',
    incidencia: '', estado_incidencia: '', observaciones_incidencia: '', dias_incidencia: '',
    fecha_registro_nv: '2026-07-12', fecha_aprobacion: '2026-07-12', fecha_aprobacion_real: '',
    fecha_compromiso: '2026-07-15', fecha_facturacion: '', fecha_en_proceso: '', fecha_shipping: '',
    fecha_despacho: '', fecha_en_ruta: '', fecha_entregado: '', fecha_estado: '2026-07-12',
  },
  {
    id: 5, canal: 'PTM', nv: '97108', nv_ptm: '97108', cliente: 'Centro Médico Sur', vendedor: 'L. Torres',
    division: 'DIV. HOSPITALARIA', centro_costo: '1-04', transportista: 'LogiSur', empresa_transporte: 'LogiSur',
    tipo_despacho: 'Directo', estado: 'Shipping', urgente: false, factura: 'F-4405', guia: '', numero_envio: 'ENV-2225',
    valor_factura: 1750000, valor_nv: 1750000, costo_flete: 31000, bultos: 8, fillrate: '95%',
    incidencia: '', estado_incidencia: '', observaciones_incidencia: '', dias_incidencia: '',
    fecha_registro_nv: '2026-07-09', fecha_aprobacion: '2026-07-09', fecha_aprobacion_real: '2026-07-09',
    fecha_compromiso: '2026-07-12', fecha_facturacion: '2026-07-10', fecha_en_proceso: '2026-07-10',
    fecha_shipping: '2026-07-11', fecha_despacho: '', fecha_en_ruta: '', fecha_entregado: '', fecha_estado: '2026-07-11',
  },
];

export const ESTADO_COLOR = {
  'Aprobada': '#64748b', 'En Proceso': '#f97316', 'Picking': '#2563eb', 'Packing': '#7c3aed',
  'Shipping': '#0891b2', 'En Ruta': '#2563eb', 'Entregado': '#10b981', 'Con Vendedor': '#e11d48',
  'Retiro en Bodega': '#6a1b9a', 'Anulada': '#94a3b8', 'Sin estado': '#94a3b8',
};

export const MOCK_CALIDAD = {
  total: 37,
  porTipo: { 'Sin RUT': 12, 'Dirección incompleta': 9, 'Sin transportista': 16 },
  detalle: [
    { nv: 'NV-20455', problema: 'Sin RUT', cliente: 'Comercial El Roble' },
    { nv: 'NV-20460', problema: 'Dirección incompleta', cliente: 'Farmacia Vida' },
    { nv: 'NV-20472', problema: 'Sin transportista', cliente: 'Clínica Norte' },
  ],
};
