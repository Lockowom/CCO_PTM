import {
  ArrowDownToLine,
  Circle,
  Headphones,
  LayoutDashboard,
  Search,
  Settings,
  ShieldCheck,
  Truck,
  Warehouse
} from 'lucide-react';

export const SIDEBAR_ICONS = Object.freeze({
  ArrowDownToLine,
  Warehouse,
  Search,
  LayoutDashboard,
  ShieldCheck,
  Headset: Headphones,
  Settings,
  Truck,
  Circle
});

export function getSidebarIcon(name) {
  return SIDEBAR_ICONS[name] || Circle;
}
