import { useCallback, useEffect, useState } from 'react';
import { AlertTriangle, DownloadCloud, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { toast } from 'sonner';
import useOnlineStatus from '../hooks/useOnlineStatus';
import {
  descargarTareasCalidadOffline,
  estadoCalidadOffline,
  sincronizarCalidadOffline
} from '../services/qualityOfflineService';

const EMPTY_STATE = { tasks: 0, pending: 0, conflicts: 0, rejected: 0 };

const QualityOfflineControl = ({ onSynced }) => {
  const online = useOnlineStatus();
  const [state, setState] = useState(EMPTY_STATE);
  const [working, setWorking] = useState(false);

  const refresh = useCallback(async () => {
    try {
      setState(await estadoCalidadOffline());
    } catch {
      setState(EMPTY_STATE);
    }
  }, []);

  useEffect(() => {
    refresh();
    const timer = window.setInterval(refresh, 3000);
    return () => window.clearInterval(timer);
  }, [refresh, online]);

  const download = async () => {
    try {
      setWorking(true);
      const result = await descargarTareasCalidadOffline();
      await refresh();
      toast.success(`${result.downloaded} tarea(s) de Calidad disponibles sin conexión`);
    } catch (error) {
      toast.error(error.message || 'No se pudieron descargar las tareas');
    } finally {
      setWorking(false);
    }
  };

  const sync = async () => {
    try {
      setWorking(true);
      const result = await sincronizarCalidadOffline();
      await refresh();
      if (result.conflicts || result.rejected) {
        toast.warning(
          `Sincronización: ${result.applied} aplicada(s), ${result.conflicts} conflicto(s)`
        );
      } else {
        toast.success(`${result.applied} cambio(s) de Calidad sincronizado(s)`);
      }
      onSynced?.(result);
    } catch (error) {
      toast.error(error.message || 'No se pudo sincronizar Calidad');
    } finally {
      setWorking(false);
    }
  };

  return (
    <section className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-white/85 px-3 py-2 shadow-sm">
      <span
        className={`inline-flex items-center gap-1.5 text-[11px] font-black ${online ? 'text-emerald-700' : 'text-amber-700'}`}
      >
        {online ? <Wifi size={14} /> : <WifiOff size={14} />}
        {online ? 'Calidad conectada' : 'Calidad sin conexión'}
      </span>
      <span className="text-[10px] font-bold text-slate-400">
        {state.tasks} tarea(s) descargada(s)
      </span>
      {state.pending > 0 && (
        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-black text-amber-700">
          {state.pending} pendiente(s)
        </span>
      )}
      {state.conflicts > 0 && (
        <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-black text-rose-700">
          <AlertTriangle size={11} /> {state.conflicts} conflicto(s)
        </span>
      )}
      <span className="ml-auto flex gap-1.5">
        <button
          onClick={download}
          disabled={!online || working}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-[10px] font-black text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <DownloadCloud size={13} /> Descargar tareas
        </button>
        <button
          onClick={sync}
          disabled={!online || !state.pending || working}
          className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-2.5 py-1.5 text-[10px] font-black text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <RefreshCw size={13} className={working ? 'animate-spin' : ''} /> Sincronizar
        </button>
      </span>
    </section>
  );
};

export default QualityOfflineControl;
