import React, { useState } from 'react';
import { Loader2, ExternalLink, LayoutDashboard } from 'lucide-react';

// Panel PTM (repo lockowom/panel-, app Next.js desplegada en Vercel). Es una app
// SSR con API routes, así que NO se puede vendorizar como estática (a diferencia
// de Traspasos/em-il); se embebe en un iframe apuntando a su despliegue de Vercel.
// El Panel mantiene su propia sesión/login dentro del iframe.
const SRC = 'https://panel-dashboard-ptm.vercel.app';

const PanelPTM = () => {
  const [cargando, setCargando] = useState(true);

  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col bg-slate-50">
      {/* Cabecera estilo módulo CCO */}
      <div className="relative overflow-hidden bg-white rounded-2xl sm:rounded-[2rem] border border-slate-200 shadow-sm px-5 sm:px-7 py-4 sm:py-5 flex flex-wrap items-center justify-between gap-4 shrink-0 m-3 sm:m-6 mb-0 sm:mb-0">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-orange-500 via-amber-400 to-orange-500" />
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-orange-50 border border-orange-100 rounded-2xl flex items-center justify-center text-orange-600 shrink-0">
            <LayoutDashboard size={22} />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight truncate">
              Panel <span className="text-orange-600">PTM</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 truncate">
              Dashboard de indicadores PTM (tiempo real) embebido desde su despliegue
            </p>
          </div>
        </div>
        <a
          href={SRC}
          target="_blank"
          rel="noopener noreferrer"
          title="Abrir en pestaña"
          className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs sm:text-sm font-black flex items-center gap-2 hover:bg-slate-50 hover:border-orange-200 hover:text-orange-600 transition-colors shrink-0"
        >
          <ExternalLink size={15} /> <span className="hidden sm:inline">Abrir</span>
        </a>
      </div>

      {/* Lienzo del módulo (iframe a todo el ancho) */}
      <div className="relative flex-1 min-h-[70vh] mt-3 sm:mt-4 bg-slate-50">
        {cargando && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-slate-50">
            <Loader2 className="animate-spin text-orange-500" size={34} />
            <p className="text-xs font-bold text-slate-400">Cargando Panel PTM…</p>
          </div>
        )}
        <iframe
          src={SRC}
          title="Panel PTM"
          onLoad={() => setCargando(false)}
          className="w-full h-full min-h-[70vh] border-0"
          allow="clipboard-write; clipboard-read; fullscreen"
        />
      </div>
    </div>
  );
};

export default PanelPTM;
