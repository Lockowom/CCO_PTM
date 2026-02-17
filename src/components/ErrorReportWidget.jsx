import React, { useState } from 'react';
import { supabase } from '../supabase';
import { useAuth } from '../context/AuthContext';
import { 
  MessageSquare, 
  X, 
  Send, 
  CheckCircle, 
  AlertTriangle 
} from 'lucide-react';

const ErrorReportWidget = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null); // 'success' | 'error'

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim()) return;

    setLoading(true);
    setStatus(null);

    try {
      // Generar ID amigable: T-{YYYYMMDD}-{HHMM}
      const now = new Date();
      const timestamp = now.toISOString().replace(/[-:T.]/g, '').slice(0, 12);
      const ticketId = `T-${timestamp}`;

      const { error } = await supabase
        .from('tms_tickets')
        .insert({
          ticket_id: ticketId,
          usuario_id: user?.id || 'anon',
          usuario_nombre: user?.nombre || 'Usuario Anónimo',
          descripcion: description,
          prioridad: 'MEDIA',
          estado: 'PENDIENTE'
        });

      if (error) throw error;

      setStatus('success');
      setDescription('');
      
      // Cerrar automáticamente después de 2s
      setTimeout(() => {
        setIsOpen(false);
        setStatus(null);
      }, 2500);

    } catch (err) {
      console.error('Error enviando reporte:', err);
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Botón Flotante (Circular) */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-4 left-4 md:bottom-6 md:left-6 z-50 w-10 h-10 md:w-12 md:h-12 rounded-full bg-slate-800/80 hover:bg-slate-800 text-white shadow-lg flex items-center justify-center transition-all hover:scale-110 active:scale-95 border border-slate-600 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 opacity-50 hover:opacity-100"
          title="Reportar Error o Problema"
          aria-label="Reportar Error"
        >
          <MessageSquare size={20} className="text-amber-400" strokeWidth={2} />
        </button>
      )}

      {/* Modal / Formulario */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:justify-start sm:p-4 pointer-events-none">
          {/* Backdrop for mobile */}
          <div className="absolute inset-0 bg-black/20 sm:hidden pointer-events-auto" onClick={() => setIsOpen(false)} />

          <div className="bg-white w-full sm:w-96 rounded-t-xl sm:rounded-xl shadow-2xl border border-slate-200 pointer-events-auto animate-in slide-in-from-bottom-10 fade-in duration-200">
            
            {/* Header */}
            <div className="bg-slate-900 text-white p-4 rounded-t-xl flex justify-between items-center">
              <div className="flex items-center gap-2">
                <MessageSquare size={18} className="text-amber-400" />
                <h3 className="font-bold">Reportar Problema TI</h3>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white transition-colors p-1 hover:bg-slate-800 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="p-4">
              {status === 'success' ? (
                <div className="text-center py-6 text-green-600 animate-in zoom-in duration-300">
                  <CheckCircle size={48} className="mx-auto mb-2" />
                  <p className="font-bold">¡Reporte Enviado!</p>
                  <p className="text-sm text-slate-500 mt-1">El equipo de TI ha sido notificado.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                      Descripción del Error
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe qué pasó, dónde ocurrió y qué esperabas que sucediera..."
                      className="w-full h-32 p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 resize-none transition-colors focus:bg-white"
                      autoFocus
                    />
                  </div>
                  
                  {status === 'error' && (
                    <div className="mb-4 p-2 bg-red-50 text-red-600 text-xs rounded flex items-center gap-2 animate-pulse">
                      <AlertTriangle size={14} />
                      Error al enviar. Intenta nuevamente.
                    </div>
                  )}

                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsOpen(false)}
                      className="px-4 py-2 text-slate-500 text-sm hover:bg-slate-50 rounded-lg transition-colors font-medium"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={loading || !description.trim()}
                      className="px-4 py-2 bg-indigo-600 text-white text-sm font-bold rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all active:scale-95 shadow-md shadow-indigo-500/20"
                    >
                      {loading ? 'Enviando...' : (
                        <>
                          <Send size={14} /> Enviar Reporte
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
            
            {/* Footer info */}
            <div className="bg-slate-50 p-2 text-center border-t border-slate-100 rounded-b-xl">
              <p className="text-[10px] text-slate-400 font-mono">
                ID: {user?.nombre || 'Anónimo'} • {new Date().toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ErrorReportWidget;
