// PR-013 · AppShell (TXT 03 §4-5). Shell de escritorio: Sidebar + Topbar +
// contenedor de contenido. La app actual usa `Layout` (Navbar horizontal);
// este AppShell es la nueva capa que convivirá bajo feature flag `web_shell_v2`
// hasta el CUTOVER de RELEASE B. No elimina ni reemplaza Layout todavía.

import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const AppShell = ({ children, onSearch = null, syncing = false, onSync = null }) => {
  const { pathname } = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-full min-h-screen bg-[var(--surface-base)] text-slate-100 font-sans">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          pathname={pathname}
          onSearch={onSearch}
          syncing={syncing}
          onSync={onSync}
        />
        <main className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
          <div className="mx-auto w-full max-w-[1600px] min-h-full p-3 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppShell;