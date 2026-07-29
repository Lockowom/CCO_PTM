import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Check, CheckCheck } from 'lucide-react';
import { misNotificaciones, marcarLeida, marcarTodasLeidas } from '../services/eventosService';
import { Logger } from '../lib/logger';
import { useAuth } from '../context/AuthContext';

const fmt = (ts) => {
  if (!ts) return '';
  const d = new Date(ts);
  return isNaN(d)
    ? ''
    : d.toLocaleString('es-CL', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
};

// Campana de notificaciones in-app (Centro de Notificaciones, migración 114).
export default function NotificationBell() {
  const nav = useNavigate();
  const { isAuthenticated, loading, user } = useAuth();
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);

  const load = useCallback(async () => {
    if (loading || !isAuthenticated || !user?.id) {
      setItems([]);
      return;
    }
    try {
      setItems(await misNotificaciones());
    } catch (error) {
      Logger.error(error, {
        module: 'eventos',
        screen: 'NotificationBell',
        action: 'mis_notificaciones_load',
        message: 'Fallo la carga de notificaciones en la campana'
      });
    }
  }, [isAuthenticated, loading, user?.id]);
  useEffect(() => {
    if (loading || !isAuthenticated || !user?.id) {
      setItems([]);
      return undefined;
    }
    load();
    const runIfVisible = () => {
      if (typeof document !== 'undefined' && document.hidden) return;
      load();
    };
    const t = setInterval(runIfVisible, 180000);
    const onVisibility = () => {
      if (typeof document !== 'undefined' && !document.hidden) load();
    };
    const onFocus = () => load();
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('focus', onFocus);
    return () => {
      clearInterval(t);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('focus', onFocus);
    };
  }, [isAuthenticated, load, loading, user?.id]);

  const leer = async (id) => {
    await marcarLeida(id);
    setItems((i) => i.filter((x) => x.id !== id));
  };
  const todas = async () => {
    await marcarTodasLeidas();
    setItems([]);
  };

  return (
    <div className="relative">
      <button
        onClick={() => {
          setOpen((o) => !o);
          if (!open) load();
        }}
        title="Notificaciones"
        className="relative p-2 hover:bg-slate-50 rounded-xl transition-all border border-transparent hover:border-slate-200"
      >
        <Bell size={18} className="text-slate-500" />
        {items.length > 0 && (
          <span className="absolute top-0 right-0 min-w-[16px] h-4 px-1 rounded-full bg-orange-500 text-white text-[9px] font-black grid place-items-center">
            {items.length > 9 ? '9+' : items.length}
          </span>
        )}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden">
            <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between">
              <span className="text-[11px] font-black text-slate-400 uppercase">
                Notificaciones ({items.length})
              </span>
              {items.length > 0 && (
                <button
                  onClick={todas}
                  className="text-[11px] font-bold text-orange-600 hover:text-orange-700 inline-flex items-center gap-1"
                >
                  <CheckCheck size={13} /> Marcar todas
                </button>
              )}
            </div>
            {items.length === 0 ? (
              <div className="py-10 text-center text-slate-400 text-sm">
                Sin notificaciones nuevas.
              </div>
            ) : (
              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                {items.map((n) => (
                  <div key={n.id} className="flex items-start gap-2 px-3 py-2.5 hover:bg-slate-50">
                    <span className="w-2 h-2 rounded-full bg-orange-500 mt-1.5 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-[13px] text-slate-800">{n.titulo}</div>
                      <div className="text-[12px] text-slate-500">{n.mensaje}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{fmt(n.creado_en)}</div>
                    </div>
                    <button
                      onClick={() => leer(n.id)}
                      title="Marcar leída"
                      className="text-slate-300 hover:text-emerald-500 shrink-0 mt-0.5"
                    >
                      <Check size={15} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <button
              onClick={() => {
                setOpen(false);
                nav('/admin/eventos');
              }}
              className="w-full px-4 py-2.5 border-t border-slate-100 text-[12px] font-bold text-slate-500 hover:bg-slate-50"
            >
              Ver todas →
            </button>
          </div>
        </>
      )}
    </div>
  );
}
