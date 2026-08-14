import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Bell, BellRing, Check, CheckCheck, X } from 'lucide-react';
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
        message: 'Falló la carga de notificaciones en la campana'
      });
    }
  }, [isAuthenticated, loading, user?.id]);

  useEffect(() => {
    if (loading || !isAuthenticated || !user?.id) {
      setItems([]);
      return undefined;
    }
    const initialLoad = window.setTimeout(load, 3000);
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
      clearTimeout(initialLoad);
      clearInterval(t);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('focus', onFocus);
    };
  }, [isAuthenticated, load, loading, user?.id]);

  useEffect(() => {
    if (!open || typeof document === 'undefined') return undefined;
    const previousOverflow = document.body.style.overflow;
    if (window.matchMedia('(max-width: 639px)').matches) document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  const leer = async (id) => {
    await marcarLeida(id);
    setItems((current) => current.filter((item) => item.id !== id));
  };
  const todas = async () => {
    await marcarTodasLeidas();
    setItems([]);
  };
  const abrir = async (notificacion) => {
    await leer(notificacion.id);
    const ruta = notificacion.payload?.route;
    if (ruta) {
      setOpen(false);
      nav(ruta);
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        aria-label={`Notificaciones${items.length ? `, ${items.length} pendientes` : ''}`}
        aria-expanded={open}
        onClick={() => {
          setOpen((current) => !current);
          if (!open) load();
        }}
        title="Notificaciones"
        className="relative grid min-h-11 min-w-11 place-items-center rounded-2xl border border-transparent transition-all hover:border-slate-200 hover:bg-slate-50 active:scale-95"
      >
        <Bell size={18} className="text-slate-500" />
        {items.length > 0 && (
          <span className="absolute right-0 top-0 grid h-4 min-w-4 place-items-center rounded-full bg-orange-500 px-1 text-[9px] font-black text-white ring-2 ring-white">
            {items.length > 9 ? '9+' : items.length}
          </span>
        )}
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40 bg-slate-950/30 backdrop-blur-[2px] sm:bg-transparent sm:backdrop-blur-none"
            onClick={() => setOpen(false)}
          />
          <section
            aria-label="Centro de notificaciones"
            className="notification-sheet anim-fade-up fixed inset-x-3 bottom-[max(.75rem,calc(.75rem+var(--sab)))] z-50 max-h-[min(78dvh,42rem)] overflow-hidden rounded-[1.75rem] border border-white/80 bg-white shadow-[0_28px_80px_-24px_rgba(15,23,42,.65)] sm:absolute sm:inset-x-auto sm:bottom-auto sm:right-0 sm:top-full sm:mt-2 sm:w-96 sm:max-h-[34rem] sm:rounded-3xl"
          >
            <header className="border-b border-slate-100 bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 px-4 py-4 text-white">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-white/10 ring-1 ring-white/15">
                    <BellRing size={19} className="text-emerald-300" />
                  </span>
                  <div className="min-w-0">
                    <h2 className="text-sm font-black">Centro de notificaciones</h2>
                    <p className="mt-0.5 text-[11px] font-semibold text-slate-300">
                      {items.length
                        ? `${items.length} tarea${items.length === 1 ? '' : 's'} por revisar`
                        : 'Todo está al día'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/10 text-white/80 transition hover:bg-white/20"
                  aria-label="Cerrar notificaciones"
                >
                  <X size={17} />
                </button>
              </div>
            </header>

            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-2.5">
              <span className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
                Pendientes
              </span>
              {items.length > 0 && (
                <button
                  type="button"
                  onClick={todas}
                  className="inline-flex min-h-9 items-center gap-1 rounded-xl px-2 text-[11px] font-black text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
                >
                  <CheckCheck size={13} /> Marcar todas
                </button>
              )}
            </div>

            {items.length === 0 ? (
              <div className="px-5 py-12 text-center">
                <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-emerald-50 text-emerald-500">
                  <CheckCheck size={24} />
                </span>
                <p className="mt-3 text-sm font-black text-slate-700">Sin pendientes nuevas</p>
                <p className="mt-1 text-xs text-slate-400">
                  Te avisaremos cuando llegue una tarea.
                </p>
              </div>
            ) : (
              <div className="max-h-[calc(min(78dvh,42rem)-10.5rem)] space-y-2 overflow-y-auto bg-slate-50/70 p-2.5 sm:max-h-80">
                {items.map((notificacion) => (
                  <article
                    key={notificacion.id}
                    onClick={() => abrir(notificacion)}
                    className={`flex min-h-20 items-start gap-3 rounded-2xl border border-slate-100 bg-white p-3 shadow-sm transition hover:border-emerald-200 hover:shadow-md active:scale-[.99] ${notificacion.payload?.route ? 'cursor-pointer' : ''}`}
                  >
                    <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-orange-50 text-orange-500">
                      <Bell size={15} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="text-[13px] font-black leading-tight text-slate-800">
                        {notificacion.titulo}
                      </div>
                      <div className="mt-1 line-clamp-2 text-[12px] leading-relaxed text-slate-500">
                        {notificacion.mensaje}
                      </div>
                      <div className="mt-1.5 text-[10px] font-bold text-slate-400">
                        {fmt(notificacion.creado_en)}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        leer(notificacion.id);
                      }}
                      title="Marcar leída"
                      className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-slate-300 hover:bg-emerald-50 hover:text-emerald-500"
                    >
                      <Check size={15} />
                    </button>
                  </article>
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                setOpen(false);
                nav('/admin/eventos');
              }}
              className="flex min-h-12 w-full items-center justify-center gap-2 border-t border-slate-100 px-4 text-[12px] font-black text-slate-600 hover:bg-slate-50"
            >
              Ver centro completo <ArrowRight size={14} />
            </button>
          </section>
        </>
      )}
    </div>
  );
}
