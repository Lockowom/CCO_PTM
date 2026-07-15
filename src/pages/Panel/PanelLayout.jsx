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
    <div className="panel-root space-y-4">
      {/* Cabecera estilo módulo CCO (franja degradada + ícono naranja) */}
      <div className="anim-fade-up relative overflow-hidden bg-white rounded-2xl sm:rounded-[2rem] border border-slate-200 shadow-sm px-5 sm:px-7 py-4 sm:py-5">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-orange-500 via-amber-400 to-orange-500" />
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-orange-50 border border-orange-100 rounded-2xl flex items-center justify-center text-orange-600 shrink-0">
              <LayoutDashboard size={22} />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight truncate">
                Panel <span className="text-orange-600">PTM</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 truncate">Resumen operacional · datos de ejemplo</p>
            </div>
          </div>
          {/* Pill nav (naranja CCO) */}
          <nav className="flex flex-wrap items-center gap-1 bg-slate-100 rounded-2xl p-1">
            {NAV.map(({ to, end, label, icon: Icon }) => (
              <NavLink key={to} to={to} end={end}
                className={({ isActive }) =>
                  `inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-colors ${
                    isActive ? 'bg-orange-500 text-white shadow' : 'text-slate-500 hover:text-orange-600 hover:bg-white'
                  }`}>
                <Icon size={14} /> <span className="hidden md:inline">{label}</span>
              </NavLink>
            ))}
          </nav>
        </div>
      </div>

      <main className="anim-fade-up">
        <Outlet />
      </main>
    </div>
  );
}
