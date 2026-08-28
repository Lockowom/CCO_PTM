import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Loader2, LogOut } from 'lucide-react';
import NotificationBell from '../../NotificationBell';
import { useAuth } from '../../../context/AuthContext';
import SidebarUserCard from './SidebarUserCard';

const APP_VERSION = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : 'dev';

const SidebarFooterView = ({ collapsed, onToggle, canAccessRoute, session }) => {
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);
  const logoutStarted = useRef(false);

  const handleLogout = async () => {
    if (logoutStarted.current) return;
    logoutStarted.current = true;
    setLoggingOut(true);
    try {
      await session.logout();
      navigate('/login', { replace: true });
    } finally {
      setLoggingOut(false);
      logoutStarted.current = false;
    }
  };

  return (
    <footer
      aria-label="Sesión y sistema"
      className={`shrink-0 border-t border-[var(--sidebar-border)] ${
        collapsed ? 'flex flex-col items-center gap-1 px-2 py-2' : 'space-y-0.5 px-2.5 py-2'
      }`}
    >
      <NotificationBell
        variant="sidebar"
        collapsed={collapsed}
        canAccessRoute={canAccessRoute}
        authState={session}
      />

      <SidebarUserCard user={session.user} collapsed={collapsed} />

      <div
        className={`flex min-h-8 items-center rounded-xl text-[var(--text-muted)] ${
          collapsed ? 'w-11 justify-center' : 'justify-between gap-2 px-2'
        }`}
        title="Sesión operativa"
        aria-label={`Sesión operativa, versión ${APP_VERSION}`}
      >
        <span className="flex min-w-0 items-center gap-2">
          <span
            className="h-2.5 w-2.5 shrink-0 rounded-full bg-[var(--status-ok)]"
            aria-hidden="true"
          />
          {!collapsed && <span className="truncate text-[10px] font-bold">Operativo</span>}
        </span>
        {!collapsed && (
          <span className="font-mono text-[9px] text-[var(--text-faint)] [@media(max-height:650px)]:hidden">
            v{APP_VERSION}
          </span>
        )}
      </div>

      <button
        type="button"
        onClick={handleLogout}
        disabled={loggingOut}
        aria-busy={loggingOut}
        aria-label={loggingOut ? 'Cerrando sesión' : 'Cerrar sesión'}
        title={collapsed ? 'Cerrar sesión' : undefined}
        className={`flex min-h-9 items-center rounded-xl text-[var(--text-muted)] transition-colors hover:bg-red-50 hover:text-red-600 disabled:cursor-wait disabled:opacity-60 ${
          collapsed ? 'w-11 justify-center' : 'w-full gap-2.5 px-2.5'
        }`}
      >
        {loggingOut ? (
          <Loader2 aria-hidden="true" size={18} className="motion-safe:animate-spin" />
        ) : (
          <LogOut aria-hidden="true" size={18} />
        )}
        {!collapsed && <span className="text-[11px] font-bold">Cerrar sesión</span>}
      </button>

      <button
        type="button"
        onClick={onToggle}
        className={`flex min-h-9 items-center rounded-xl text-[var(--text-muted)] transition-colors hover:bg-[var(--sidebar-hover)] hover:text-[var(--text-primary)] ${
          collapsed ? 'w-11 justify-center' : 'w-full justify-between gap-2 px-2.5'
        }`}
        aria-label={collapsed ? 'Expandir menú' : 'Colapsar menú'}
        title={collapsed ? 'Expandir navegación' : undefined}
      >
        {!collapsed && <span className="text-[11px] font-bold">Colapsar menú</span>}
        {collapsed ? (
          <ChevronRight aria-hidden="true" size={18} />
        ) : (
          <ChevronLeft aria-hidden="true" size={18} />
        )}
      </button>
    </footer>
  );
};

const SidebarFooterFromContext = (props) => {
  const { user, logout, isAuthenticated, loading, canAccessRoute } = useAuth();
  return (
    <SidebarFooterView
      {...props}
      canAccessRoute={props.canAccessRoute || canAccessRoute}
      session={{ user, logout, isAuthenticated, loading }}
    />
  );
};

const SidebarFooter = (props) =>
  props.session ? <SidebarFooterView {...props} /> : <SidebarFooterFromContext {...props} />;

export default SidebarFooter;
