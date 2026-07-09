import React, { useState } from 'react';
import { Loader2, ExternalLink, ArrowLeftRight } from 'lucide-react';

// Registro de Traspasos · Email (app estática vendorizada en public/traspasos).
// Se embebe en un iframe para conservar el framework/navbar de CCO. Los datos del
// módulo viven en localStorage del mismo origen. Actualizable con
// `npm run update:traspasos` (re-sincroniza desde lockowom/em-il).
const SRC = '/traspasos/index.html';

const Traspasos = () => {
  const [cargando, setCargando] = useState(true);

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col bg-slate-50">
      <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-3 bg-white border-b border-slate-200">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
            <ArrowLeftRight size={20} />
          </div>
          <div className="min-w-0">
            <h1 className="text-base font-black text-slate-900 truncate">Registro de Traspasos · Correo</h1>
            <p className="text-xs text-slate-500 truncate">Registra traspasos/ajustes y genera el correo listo para enviar</p>
          </div>
        </div>
        <a href={SRC} target="_blank" rel="noopener noreferrer"
          className="px-3 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-black flex items-center gap-1.5 hover:bg-slate-50 shrink-0">
          <ExternalLink size={14} /> Abrir en pestaña
        </a>
      </div>

      <div className="relative flex-1">
        {cargando && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-50">
            <Loader2 className="animate-spin text-indigo-500" size={36} />
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
