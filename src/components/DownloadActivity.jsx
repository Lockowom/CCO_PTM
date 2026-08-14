import { useEffect, useState } from 'react';
import { CheckCircle2, FileDown, Loader2, Share2, XCircle } from 'lucide-react';
import { DOWNLOAD_EVENT } from '../services/downloadService';

const phaseText = {
  generating: 'Preparando el informe',
  generated: 'Informe generado',
  saving: 'Guardando el archivo',
  sharing: 'Listo para abrir o compartir',
  done: 'Descarga completada',
  error: 'No se pudo descargar'
};

export default function DownloadActivity() {
  const [activity, setActivity] = useState(null);

  useEffect(() => {
    let hideTimer;
    const handleProgress = (event) => {
      const next = event.detail;
      window.clearTimeout(hideTimer);
      setActivity(next);
      if (next.phase === 'done' || next.phase === 'error') {
        hideTimer = window.setTimeout(() => setActivity(null), next.phase === 'done' ? 2600 : 5000);
      }
    };
    window.addEventListener(DOWNLOAD_EVENT, handleProgress);
    return () => {
      window.clearTimeout(hideTimer);
      window.removeEventListener(DOWNLOAD_EVENT, handleProgress);
    };
  }, []);

  if (!activity?.visible) return null;
  const isDone = activity.phase === 'done';
  const isError = activity.phase === 'error';
  const Icon = isDone
    ? CheckCircle2
    : isError
      ? XCircle
      : activity.phase === 'sharing'
        ? Share2
        : Loader2;

  return (
    <aside className="download-activity" role="status" aria-live="polite">
      <div
        className={`download-activity__icon ${isDone ? 'is-done' : ''} ${isError ? 'is-error' : ''}`}
      >
        <Icon
          size={20}
          className={!isDone && !isError && activity.phase !== 'sharing' ? 'animate-spin' : ''}
        />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-3">
          <strong>{phaseText[activity.phase] || 'Procesando descarga'}</strong>
          <span>{Math.round(activity.progress || 0)}%</span>
        </div>
        <p title={activity.filename}>{activity.message || activity.filename}</p>
        <div className="download-activity__track">
          <div style={{ width: `${activity.progress || 0}%` }} />
        </div>
      </div>
      <FileDown size={16} className="shrink-0 text-slate-400" />
    </aside>
  );
}
