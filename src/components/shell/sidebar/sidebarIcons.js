import {
  Circle,
  ClipboardCheck,
  Headphones,
  LayoutDashboard,
  PackagePlus,
  ScanSearch,
  ShieldCheck,
  Truck,
  Warehouse
} from 'lucide-react';

export const SIDEBAR_ICONS = Object.freeze({
  PackagePlus,
  Warehouse,
  ScanSearch,
  LayoutDashboard,
  ClipboardCheck,
  Headphones,
  // lucide-react 0.294 no expone ShieldCog; mantenemos la clave semántica
  // del catálogo y usamos su equivalente de seguridad disponible.
  ShieldCog: ShieldCheck,
  Truck,
  Circle
});

export function getSidebarIcon(name) {
  return SIDEBAR_ICONS[name] || Circle;
}
