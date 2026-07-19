import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Sparkles, X, Send, Loader2, Bot, User as UserIcon, AlertTriangle, Eraser } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { preguntarAsistente } from '../services/asistenteService';

// Asistente CCO — burbuja flotante conversacional (v1, SOLO LECTURA). Consulta
// datos reales (operaciones/N.V., stock, tickets Post-Venta) vía /api/asistente,
// que ejecuta las herramientas con el token del usuario → respeta sus permisos y
// ámbito. Se muestra solo a usuarios autenticados con permiso `view_asistente`.

const SUGERENCIAS = [
  '¿Cómo vamos hoy? Dame un resumen',
  '¿Cuántas N.V. están en proceso?',
  'Busca el stock del producto…',
  '¿Qué tickets de Post-Venta hay abiertos?',
];

// Render mínimo de texto: respeta saltos de línea y **negritas** (sin dependencia).
function Texto({ children }) {
  const partes = String(children).split(/(\*\*[^*]+\*\*)/g);
  return (
    <span className="whitespace-pre-wrap break-words">
      {partes.map((p, i) =>
        p.startsWith('**') && p.endsWith('**')
          ? <strong key={i} className="font-bold">{p.slice(2, -2)}</strong>
          : <React.Fragment key={i}>{p}</React.Fragment>
      )}
    </span>
  );
}

export default function AsistenteIA() {
  const { isAuthenticated, hasPermission, user } = useAuth();
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState([]); // [{role, content}]
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [msgs, loading]);

  useEffect(() => { if (open) setTimeout(() => inputRef.current?.focus(), 120); }, [open]);

  const enviar = useCallback(async (texto) => {
    const q = (texto ?? input).trim();
    if (!q || loading) return;
    setError(null);
    const nuevos = [...msgs, { role: 'user', content: q }];
    setMsgs(nuevos);
    setInput('');
    setLoading(true);
    try {
      const resp = await preguntarAsistente(nuevos);
      setMsgs((m) => [...m, { role: 'assistant', content: resp || '(sin respuesta)' }]);
    } catch (e) {
      setError(e.message || 'No se pudo consultar el asistente.');
    } finally {
      setLoading(false);
    }
  }, [input, msgs, loading]);

  if (!isAuthenticated || !hasPermission('view_asistente')) return null;

  return (
    <>
      {/* Botón flotante */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Abrir Asistente IA"
          className="fixed z-[120] bottom-5 right-5 w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/30 grid place-items-center hover:scale-105 active:scale-95 transition-transform"
          style={{ paddingBottom: 'env(safe-area-inset-bottom, 0)' }}
        >
          <Sparkles size={24} />
        </button>
      )}

      {/* Panel de chat */}
      {open && (
        <div className="fixed z-[121] bottom-0 right-0 sm:bottom-5 sm:right-5 w-full sm:w-[400px] h-[85vh] sm:h-[600px] sm:max-h-[85vh] bg-white sm:rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
          {/* Cabecera */}
          <div className="relative shrink-0 px-4 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/20 grid place-items-center"><Bot size={19} /></div>
            <div className="min-w-0 flex-1">
              <div className="font-black text-[15px] leading-tight">Asistente CCO</div>
              <div className="text-[11px] text-white/80">Consulta tus datos · solo lectura</div>
            </div>
            {msgs.length > 0 && (
              <button onClick={() => { setMsgs([]); setError(null); }} title="Nueva conversación" className="w-8 h-8 rounded-lg hover:bg-white/20 grid place-items-center"><Eraser size={16} /></button>
            )}
            <button onClick={() => setOpen(false)} aria-label="Cerrar" className="w-8 h-8 rounded-lg hover:bg-white/20 grid place-items-center"><X size={18} /></button>
          </div>

          {/* Mensajes */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-4 space-y-3 bg-slate-50">
            {msgs.length === 0 && (
              <div className="text-center pt-6 pb-2">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-orange-100 text-orange-500 grid place-items-center mb-3"><Sparkles size={26} /></div>
                <p className="text-slate-700 font-black text-[15px]">Hola{user?.nombre ? `, ${String(user.nombre).split(' ')[0]}` : ''} 👋</p>
                <p className="text-slate-400 text-[12px] mt-1 px-6">Pregúntame sobre tus operaciones, stock o tickets de Post-Venta.</p>
                <div className="mt-4 space-y-2 px-2">
                  {SUGERENCIAS.map((s) => (
                    <button key={s} onClick={() => enviar(s)}
                      className="block w-full text-left text-[12.5px] px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:border-orange-300 hover:text-orange-600 transition-colors">
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {msgs.map((m, i) => (
              <div key={i} className={`flex gap-2 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-7 h-7 rounded-lg grid place-items-center shrink-0 ${m.role === 'user' ? 'bg-slate-800 text-white' : 'bg-orange-100 text-orange-500'}`}>
                  {m.role === 'user' ? <UserIcon size={14} /> : <Bot size={15} />}
                </div>
                <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-[13px] leading-relaxed ${m.role === 'user' ? 'bg-slate-800 text-white rounded-tr-sm' : 'bg-white border border-slate-200 text-slate-700 rounded-tl-sm'}`}>
                  <Texto>{m.content}</Texto>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-2">
                <div className="w-7 h-7 rounded-lg bg-orange-100 text-orange-500 grid place-items-center shrink-0"><Bot size={15} /></div>
                <div className="px-3 py-2.5 rounded-2xl rounded-tl-sm bg-white border border-slate-200 text-slate-400 inline-flex items-center gap-2 text-[13px]">
                  <Loader2 size={14} className="animate-spin" /> Pensando…
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-start gap-2 text-[12px] text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
                <AlertTriangle size={14} className="mt-0.5 shrink-0" /> <span>{error}</span>
              </div>
            )}
          </div>

          {/* Entrada */}
          <div className="shrink-0 border-t border-slate-100 p-2.5 bg-white" style={{ paddingBottom: 'max(0.625rem, env(safe-area-inset-bottom, 0))' }}>
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); enviar(); } }}
                rows={1}
                placeholder="Escribe tu pregunta…"
                className="flex-1 resize-none max-h-28 border border-slate-200 rounded-xl px-3 py-2 text-[13px] outline-none focus:border-orange-400"
              />
              <button onClick={() => enviar()} disabled={loading || !input.trim()}
                aria-label="Enviar"
                className="w-10 h-10 rounded-xl bg-orange-500 text-white grid place-items-center hover:bg-orange-600 disabled:opacity-40 shrink-0">
                {loading ? <Loader2 size={17} className="animate-spin" /> : <Send size={17} />}
              </button>
            </div>
            <p className="text-[10px] text-slate-300 text-center mt-1.5">La IA puede equivocarse · verifica datos críticos</p>
          </div>
        </div>
      )}
    </>
  );
}
