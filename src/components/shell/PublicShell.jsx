import { useLocation } from 'react-router-dom';
import { isFeatureFlagEnabled } from '../../config/featureFlags';

export const PUBLIC_SHELL_ROUTES = {
  '/consulta': ['Consulta de N.V.', 'Seguimiento logístico seguro'],
  '/verificar': ['Verificación de certificado', 'Validación pública de documentos'],
  '/soporte': ['Solicitud de soporte', 'Ingreso seguro de requerimientos'],
  '/rendiciones': ['Rendición de gastos', 'Formulario protegido para técnicos']
};

function routeCopy(pathname) {
  const key = Object.keys(PUBLIC_SHELL_ROUTES).find((candidate) => pathname.startsWith(candidate));
  return PUBLIC_SHELL_ROUTES[key] || ['CCO PTM', 'Portal público seguro'];
}

/** Shell público sin navegación interna ni datos de sesión. Se activa sólo por flag. */
export default function PublicShell({ children }) {
  const { pathname } = useLocation();
  const enabled = isFeatureFlagEnabled('web_public_v2');
  if (!enabled) return children;

  const [title, description] = routeCopy(pathname);
  return (
    <div className="min-h-dvh bg-slate-50 text-slate-900" data-ui-surface="public-v2">
      <header className="border-b border-slate-200 bg-white/95 px-4 py-3 shadow-sm backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <img src="/logo-ptm.png" alt="PTM Health Care" className="h-9 w-auto shrink-0" />
            <div className="min-w-0 border-l border-slate-200 pl-3">
              <p className="truncate text-sm font-black text-slate-900">{title}</p>
              <p className="truncate text-[11px] font-medium text-slate-500">{description}</p>
            </div>
          </div>
          <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-emerald-700">
            Conexión segura
          </span>
        </div>
      </header>
      <div className="public-shell-content">{children}</div>
      <footer className="px-4 py-5 text-center text-[11px] text-slate-400">
        CCO PTM · Canal público protegido
      </footer>
    </div>
  );
}
