import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, PlusCircle, Info, Tv, Blocks, ShieldCheck, Settings } from 'lucide-react';
import './panel.css';

// Shell del Panel PTM nativo (port de la estructura de app/ del repo panel-).
// Navegación entre las pantallas: Dashboard, Ingresar, Info, TV, Builder,
// Auditoría y Configuración. Contenido vía <Outlet/>. Datos de ejemplo por ahora.
const NAV = [
  { to: '/panel', end: true, label: 'Dashboard', icon: LayoutDashboard },
  { to: '/panel/ingresar', label: 'Ingresar N.V.', icon: PlusCircle },
  { to: '/panel/info', label: 'Info N.V.', icon: Info },
  { to: '/panel/tv', label: 'Modo TV', icon: Tv },
  { to: '/panel/builder', label: 'Builder', icon: Blocks },
  { to: '/panel/auditoria', label: 'Auditoría', icon: ShieldCheck },
  { to: '/panel/configuracion', label: 'Configuración', icon: Settings },
];

export default function PanelLayout() {
  return (
    <div className="panel-root min-h-[calc(100vh-64px)]">
      {/* Cabecera del Panel */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-[1400px] mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-xs"
              style={{ background: 'linear-gradient(135deg, #f57c00, #e65100)' }}>PTM</div>
            <div>
              <h1 className="text-lg font-black text-gray-800 leading-none">PANEL DASHBOARD</h1>
              <p className="text-[11px] text-gray-400 uppercase tracking-wide">Resumen Operacional · datos de ejemplo</p>
            </div>
          </div>
          {/* Pill nav */}
          <nav className="flex flex-wrap items-center gap-1 bg-gray-100 rounded-full p-1">
            {NAV.map(({ to, end, label, icon: Icon }) => (
              <NavLink key={to} to={to} end={end}
                className={({ isActive }) =>
                  `inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
                    isActive ? 'bg-orange-500 text-white shadow' : 'text-gray-500 hover:text-orange-600 hover:bg-white'
                  }`}>
                <Icon size={14} /> <span className="hidden sm:inline">{label}</span>
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
