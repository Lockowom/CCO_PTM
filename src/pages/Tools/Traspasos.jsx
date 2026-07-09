import React, { useState } from 'react';
import { Loader2, ExternalLink, ArrowLeftRight } from 'lucide-react';

// Registro de Traspasos · Correo (app estática vendorizada en public/traspasos).
// Se embebe en un iframe para conservar el framework/navbar de CCO, con la
// cabecera de módulo estándar de CCO alrededor (el branding propio del iframe
// se oculta vía public/traspasos/cco-theme.css para no duplicar el título).
// Los datos viven en Supabase (puente cco-bridge.js) + localStorage del mismo
// origen. Actualizable con `npm run update:traspasos`.
const SRC = '/traspasos/index.html';

const Traspasos = () => {
  const [cargando, setCargando] = useState(true);

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col bg-slate-50 p-3 sm:p-6 gap-3 sm:gap-5">
      {/* Cabecera estilo módulo CCO */}
      <div className="relative overflow-hidden bg-white rounded-2xl sm:rounded-[2rem] border border-slate-200 shadow-sm px-5 sm:px-7 py-4 sm:py-5 flex flex-wrap items-center justify-between gap-4 shrink-0">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-orange-500 via-amber-400 to-orange-500" />
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-orange-50 border border-orange-100 rounded-2xl flex items-center justify-center text-orange-600 shrink-0">
            <ArrowLeftRight size={22} />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight truncate">
              Registro de <span className="text-orange-600">Traspasos</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 truncate">
              Registra traspasos y ajustes de inventario y genera el correo listo para enviar
            </p>
          </div>
        </div>
        <a
          href={SRC}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs sm:text-sm font-black flex items-center gap-2 hover:bg-slate-50 hover:border-orange-200 hover:text-orange-600 transition-colors shrink-0"
        >
          <ExternalLink size={15} /> Abrir en pestaña
        </a>
      </div>

      {/* Lienzo del módulo (iframe con la app vendorizada) */}
      <div className="relative flex-1 rounded-2xl sm:rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden bg-slate-50">
        {cargando && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-slate-50">
            <Loader2 className="animate-spin text-orange-500" size={34} />
            <p className="text-xs font-bold text-slate-400">Cargando módulo…</p>
          </div>
        )}
        <iframe
          src={SRC}
          title="Registro de Traspasos"
          onLoad={() => setCargando(false)}
          className="w-full h-full border-0"
          allow="clipboard-write; clipboard-read"
        />
      </div>
    </div>
  );
};

export default Traspasos;
