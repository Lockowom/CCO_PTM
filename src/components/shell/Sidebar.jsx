// PR-013 · Sidebar del AppShell (TXT 03 §4-5).
// 240px expandido / 64px colapsado en desktop. Derivado de routeMeta
// (getNavGroups) — la visibilidad la decide el llamador (Layout ya aplica
// permisos); aquí NO se duplica lógica de permisos.

import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getNavGroups } from '../../constants/routeMeta';

const ICONS = {
  ArrowDownToLine: '→',
  Warehouse: '▣',
  Search: '⌕',
  LayoutDashboard: '▦',
  ShieldCheck: '✓',
  Headset: '♪',
  Settings: '⚙',
  Truck: '▬',
};

const Sidebar = ({ collapsed, onToggle, width = 'w-60' }) => {
  const [openGroups, setOpenGroups] = useState({});
  const groups = getNavGroups();

  const toggleGroup = (id) =>
    setOpenGroups((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <aside
      className={`shrink-0 border-r border-slate-800 bg-[var(--surface-elevated)] transition-[width] duration-200
        ${collapsed ? 'w-16' : width} hidden lg:flex flex-col`}
      aria-label="Navegación principal"
    >
      <div className="flex h-14 items-center justify-between border-b border-slate-800 px-3">
        {!collapsed && (
          <span className="text-xs font-black tracking-widest text-brand-500 truncate">
            CCO · WMS
          </span>
        )}
        <button
          onClick={onToggle}
          aria-label={collapsed ? 'Expandir menú' : 'Colapsar menú'}
          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto custom-scrollbar py-3">
        {groups.map((g) => (
          <div key={g.id} className="mb-1">
            <button
              onClick={() => !collapsed && toggleGroup(g.id)}
              className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500 hover:text-slate-300"
              aria-expanded={collapsed || openGroups[g.id]}
            >
              <span className="w-5 text-center text-sm text-slate-600">{ICONS[g.icon] || '•'}</span>
              {!collapsed && <span className="truncate">{g.label}</span>}
            </button>
            {(!collapsed && (openGroups[g.id] ?? true)) && (
              <ul className="space-y-0.5 px-2">
                {g.items.map((item) => (
                  <li key={item.path}>
                    <NavLink
                      to={item.path}
                      end={item.path.split('?')[0].split('/').length <= 3}
                      className={({ isActive }) =>
                        `flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] transition-colors
                        ${isActive ? 'bg-brand-500/10 text-brand-400 font-semibold' : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'}`
                      }
                    >
                      <span className="w-5 shrink-0 text-center text-sm text-slate-500">•</span>
                      <span className="truncate">{item.title.split(' - ')[1] || item.title}</span>
                    </NavLink>
                  </li>
                ))}
              </ul>
            )}
            {collapsed && (
              <div className="px-3 py-1 text-center text-lg text-slate-600">
                {ICONS[g.icon] || '•'}
              </div>
            )}
          </div>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;