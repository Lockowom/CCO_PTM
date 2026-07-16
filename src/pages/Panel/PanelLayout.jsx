import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard } from 'lucide-react';
import './panel.css';

// Shell del Panel PTM nativo (port de la estructura de app/ del repo panel-).
// La navegación entre pantallas vive en el menú de CCO (Inteligencia → Panel
// PTM), así que aquí NO se repite un nav interno. Contenido vía <Outlet/>.
// El índice (/panel) es el Dashboard fiel (copia del original), que trae su
// PROPIA cabecera de pantalla completa → en esa ruta se omite la cabecera CCO.
export default function PanelLayout() {
  const { pathname } = useLocation();
  const esDashboard = pathname === '/panel' || pathname === '/panel/';
  if (esDashboard) return <div className="panel-dash-wrap"><Outlet /></div>;
  return (
    <div className="panel-root space-y-4">
      {/* Cabecera estilo módulo CCO (franja degradada + ícono naranja) */}
      <div className="anim-fade-up relative overflow-hidden bg-white rounded-2xl sm:rounded-[2rem] border border-slate-200 shadow-sm px-5 sm:px-7 py-4 sm:py-5">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-orange-500 via-amber-400 to-orange-500" />
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-orange-50 border border-orange-100 rounded-2xl flex items-center justify-center text-orange-600 shrink-0">
            <LayoutDashboard size={22} />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight truncate">
              Panel <span className="text-orange-600">PTM</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 truncate">Resumen operacional · datos reales</p>
          </div>
        </div>
      </div>

      <main className="anim-fade-up">
        <Outlet />
      </main>
    </div>
  );
}
