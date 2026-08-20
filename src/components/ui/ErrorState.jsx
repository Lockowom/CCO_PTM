import { AlertTriangle, RotateCcw } from 'lucide-react';
import Button from './Button';

const ErrorState = ({
  title = 'No pudimos cargar esta información',
  message,
  correlationId,
  onRetry
}) => (
  <section
    role="alert"
    className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-center"
  >
    <AlertTriangle className="mx-auto mb-3 text-red-400" aria-hidden="true" />
    <h2 className="font-semibold text-slate-100">{title}</h2>
    {message ? <p className="mt-2 text-sm text-slate-300">{message}</p> : null}
    {correlationId ? (
      <p className="mt-2 font-mono text-xs text-slate-400">Referencia: {correlationId}</p>
    ) : null}
    {onRetry ? (
      <Button className="mt-4" icon={RotateCcw} onClick={onRetry}>
        Reintentar
      </Button>
    ) : null}
  </section>
);

export default ErrorState;
