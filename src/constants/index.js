// src/constants/status.js

export const STATUS_COLORS = {
  // Inventario y Recepción
  'VERIFICADA': 'bg-blue-500 text-white',
  'PENDING_QC': 'bg-yellow-500 text-white',
  'QC_APROBADO': 'bg-emerald-500 text-white',
  'QC_RECHAZADO': 'bg-red-500 text-white',
  'CUARENTENA': 'bg-orange-500 text-white',
  'LIBERADO': 'bg-indigo-500 text-white',
  
  // Despacho / Outbound
  'PENDIENTE': 'bg-slate-600 text-white',
  'EN PICKING': 'bg-blue-500 text-white',
  'PICKING_COMPLETADO': 'bg-emerald-400 text-slate-900',
  'EN PACKING': 'bg-indigo-500 text-white',
  'PACKING_COMPLETADO': 'bg-purple-500 text-white',
  'DESPACHADO': 'bg-emerald-600 text-white',
  
  // TMS / Transporte
  'EN RUTA': 'bg-blue-500 text-white',
  'ENTREGADO': 'bg-emerald-500 text-white',
  'FALLIDO': 'bg-red-500 text-white',
  
  // Roles
  'ADMIN': 'bg-purple-600 text-white',
  'SUPERVISOR': 'bg-blue-600 text-white',
  'OPERADOR': 'bg-slate-600 text-white',
  'CONDUCTOR': 'bg-orange-600 text-white'
};

export const ROLES = {
  ADMIN: 'ADMIN',
  SUPERVISOR: 'SUPERVISOR',
  OPERADOR: 'OPERADOR',
  CONDUCTOR: 'CONDUCTOR'
};