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
};

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

export const MOCK_CALIDAD = {
  total: 37,
  porTipo: { 'Sin RUT': 12, 'Dirección incompleta': 9, 'Sin transportista': 16 },
};
