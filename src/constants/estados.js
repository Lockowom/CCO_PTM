import { Hourglass, ThumbsUp, Hand, Box, Send, Ship, Truck, X, RotateCcw, CheckCircle, FileText } from 'lucide-react';

export const ESTADOS_CONFIG = [
  { key: 'Pendiente', label: 'Pendiente', icon: Hourglass, color: '#64748b', bgColor: 'bg-slate-500', lightBg: 'bg-slate-100', textColor: 'text-slate-700', borderColor: 'border-slate-300', description: 'Esperando aprobación' },
  { key: 'Aprobada', label: 'Aprobada', icon: ThumbsUp, color: '#f59e0b', bgColor: 'bg-amber-500', lightBg: 'bg-amber-50', textColor: 'text-amber-700', borderColor: 'border-amber-200', description: 'Lista para Picking' },
  { key: 'Pendiente Picking', label: 'En Picking', icon: Hand, color: '#06b6d4', bgColor: 'bg-cyan-500', lightBg: 'bg-cyan-50', textColor: 'text-cyan-700', borderColor: 'border-cyan-200', description: 'Recolectando productos' },
  { key: 'QUIEBRE_STOCK', label: 'Quiebre', icon: X, color: '#ef4444', bgColor: 'bg-red-500', lightBg: 'bg-red-100', textColor: 'text-red-700', borderColor: 'border-red-200', description: 'Sin stock disponible' },
  { key: 'PACKING', label: 'Packing', icon: Box, color: '#6366f1', bgColor: 'bg-indigo-500', lightBg: 'bg-indigo-50', textColor: 'text-indigo-700', borderColor: 'border-indigo-200', description: 'Empacando pedido' },
  { key: 'LISTO_DESPACHO', label: 'Listo Despacho', icon: Send, color: '#a855f7', bgColor: 'bg-purple-500', lightBg: 'bg-purple-50', textColor: 'text-purple-700', borderColor: 'border-purple-200', description: 'Listo para enviar' },
  { key: 'Pendiente Shipping', label: 'Pend. Shipping', icon: Ship, color: '#3b82f6', bgColor: 'bg-blue-500', lightBg: 'bg-blue-50', textColor: 'text-blue-700', borderColor: 'border-blue-200', description: 'Pendiente de envío' },
  { key: 'Despachado', label: 'En Ruta', icon: Truck, color: '#10b981', bgColor: 'bg-emerald-500', lightBg: 'bg-emerald-50', textColor: 'text-emerald-700', borderColor: 'border-emerald-200', description: 'En camino' },
  { key: 'ENTREGADO', label: 'Entregado', icon: CheckCircle, color: '#059669', bgColor: 'bg-green-500', lightBg: 'bg-green-100', textColor: 'text-green-700', borderColor: 'border-green-200', description: 'Pedido entregado' },
  { key: 'NULA', label: 'Nula', icon: X, color: '#f43f5e', bgColor: 'bg-rose-500', lightBg: 'bg-rose-50', textColor: 'text-rose-700', borderColor: 'border-rose-200', description: 'Venta anulada' },
  { key: 'Refacturacion', label: 'Refacturación', icon: RotateCcw, color: '#f97316', bgColor: 'bg-orange-500', lightBg: 'bg-orange-50', textColor: 'text-orange-700', borderColor: 'border-orange-200', description: 'Requiere refacturación' },
  { key: 'SOLO_FACTURAR', label: 'Solo Facturar', icon: FileText, color: '#0891b2', bgColor: 'bg-teal-500', lightBg: 'bg-teal-50', textColor: 'text-teal-700', borderColor: 'border-teal-200', description: 'Solo requiere facturación' },
];

export const getEstadoConfig = (estado) => {
  const normalized = estado === 'PENDIENTE' ? 'Pendiente' : estado;
  return ESTADOS_CONFIG.find(e => e.key === normalized) || ESTADOS_CONFIG[0];
};

export const ACCIONES_ESTADO = {
  'Pendiente': { next: 'Aprobada', label: 'Aprobar', icon: ThumbsUp },
  'Aprobada': { next: 'Pendiente Picking', label: 'Enviar a Picking', icon: Hand },
  'Pendiente Picking': { next: 'PACKING', label: 'Enviar a Packing', icon: Box },
  'PACKING': { next: 'LISTO_DESPACHO', label: 'Listo Despacho', icon: Send },
  'LISTO_DESPACHO': { next: 'Pendiente Shipping', label: 'A Shipping', icon: Ship },
  'Pendiente Shipping': { next: 'Despachado', label: 'Despachar', icon: Truck },
};

export const ESTADOS_PIPELINE = ['Pendiente', 'Aprobada', 'Pendiente Picking', 'PACKING', 'LISTO_DESPACHO', 'Pendiente Shipping', 'NULA', 'Refacturacion', 'SOLO_FACTURAR'];
