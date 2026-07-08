import React, { useEffect, useState } from 'react';
import { ShieldCheck, ShieldX, Loader2, FileCheck2 } from 'lucide-react';
import { verificarCertificado } from '../services/calidadService';

// Página PÚBLICA (sin login) de verificación de certificados de Calidad.
// La abre el QR del documento: /verificar?folio=CERT-2026-0001
const VerificarCertificado = () => {
  const folio = new URLSearchParams(window.location.search).get('folio') || '';
  const [loading, setLoading] = useState(true);
  const [res, setRes] = useState(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!folio) { if (alive) { setRes({ valido: false, motivo: 'Falta el folio a verificar' }); setLoading(false); } return; }
      try {
        const data = await verificarCertificado(folio);
        if (alive) { setRes(data); setLoading(false); }
      } catch (e) {
        if (alive) { setRes({ valido: false, motivo: e.message || 'Error de verificación' }); setLoading(false); }
      }
    })();
    return () => { alive = false; };
  }, [folio]);

  const ok = res?.valido;
  const Row = ({ k, v }) => (
    <div className="flex justify-between gap-4 py-1.5 border-b border-slate-100 last:border-0">
      <span className="text-slate-500 font-semibold text-sm">{k}</span>
      <span className="text-slate-800 font-bold text-sm text-right">{v || '—'}</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 text-center border-b border-slate-100">
          <div className="flex items-center justify-center gap-2 text-slate-800">
            <FileCheck2 size={22} className="text-emerald-600" />
            <span className="font-black tracking-tight">PTM CHILE LTDA. — Verificación de documento</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">Control de Calidad · ISO 13485:2016</p>
        </div>

        {loading ? (
          <div className="p-12 flex flex-col items-center gap-3 text-slate-400">
            <Loader2 size={34} className="animate-spin text-emerald-500" />
            <p className="text-sm font-bold">Verificando {folio}…</p>
          </div>
        ) : (
          <div className="p-6">
            <div className={`rounded-2xl p-5 flex items-center gap-4 mb-5 ${ok ? 'bg-emerald-50 border border-emerald-200' : 'bg-rose-50 border border-rose-200'}`}>
              {ok ? <ShieldCheck size={38} className="text-emerald-600 shrink-0" /> : <ShieldX size={38} className="text-rose-600 shrink-0" />}
              <div>
                <p className={`font-black text-lg ${ok ? 'text-emerald-800' : 'text-rose-800'}`}>{ok ? 'Documento válido' : 'No válido'}</p>
                <p className={`text-sm ${ok ? 'text-emerald-700' : 'text-rose-700'}`}>{res?.motivo}</p>
              </div>
            </div>

            {res?.folio && (
              <div className="space-y-0.5">
                <Row k="Folio" v={res.folio} />
                <Row k="Resultado" v={res.resultado === 'CONFORME' ? 'Conforme' : (res.resultado === 'NO_CONFORME' ? 'No conforme' : res.resultado)} />
                <Row k="Proveedor" v={res.proveedor} />
                <Row k="Orden de compra" v={res.oc} />
                <Row k="Origen" v={res.origen === 'NACIONAL' ? 'Nacional' : (res.origen === 'IMPORTACION' ? 'Importación' : res.origen)} />
                <Row k="Fecha de recepción" v={res.fecha_recepcion} />
                <Row k="Firmado por" v={res.firmado_nombre} />
                <Row k="Fecha de firma" v={res.firmado_en ? new Date(res.firmado_en).toLocaleString('es-CL') : '—'} />
                <Row k="Algoritmo" v={res.algoritmo} />
              </div>
            )}
            <p className="text-[11px] text-slate-400 text-center mt-5">Verificación criptográfica (HMAC-SHA256) contra el registro original. Cualquier alteración del documento invalida la firma.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerificarCertificado;
