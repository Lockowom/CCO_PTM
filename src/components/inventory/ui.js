// Helpers de formato y estilos de estado para el módulo Inventario.
export const nf = new Intl.NumberFormat('es-CL', { maximumFractionDigits: 2 });
export const money = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 });
export const n = (v) => nf.format(Number(v) || 0);
export const money$ = (v) => money.format(Number(v) || 0);

export function fechaLocal(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return isNaN(d.getTime()) ? '' : d.toLocaleString('es-CL');
}

export function estadoStyle(estado) {
  const e = (estado || '').toUpperCase();
  if (e.includes('CUADRADO')) return { cls: 'bg-emerald-100 text-emerald-700', emoji: '✅', label: 'Cuadrado' };
  if (e.includes('SOBRA')) return { cls: 'bg-amber-100 text-amber-700', emoji: '⚠️', label: 'Sobra' };
  if (e.includes('SIN_STOCK')) return { cls: 'bg-fuchsia-100 text-fuchsia-700', emoji: '🆕', label: 'Sin stock' };
  if (e.includes('FALTA') || e.includes('NO CONTADO')) return { cls: 'bg-rose-100 text-rose-700', emoji: '❌', label: 'Falta' };
  return { cls: 'bg-slate-100 text-slate-600', emoji: '•', label: estado };
}

const KEY = 'inv_sesion_activa';
export const getSesionActiva = () => localStorage.getItem(KEY) || '';
export const setSesionActiva = (id) => { if (id) localStorage.setItem(KEY, id); else localStorage.removeItem(KEY); };
