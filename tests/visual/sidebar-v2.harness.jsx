import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import Sidebar from '../../src/components/shell/Sidebar';
import '../../src/index.css';

const SidebarHarness = () => {
  const [collapsed, setCollapsed] = useState(false);
  const session = {
    user: { id: 'visual-admin', nombre: 'Cristopher Cabezas', rol: 'ADMIN' },
    logout: async () => {},
    isAuthenticated: false,
    loading: false
  };
  return (
    <MemoryRouter initialEntries={['/admin/access']}>
      <div className="flex h-screen bg-[var(--surface-base)] text-[var(--text-primary)]">
        <Sidebar
          collapsed={collapsed}
          onToggle={() => setCollapsed((current) => !current)}
          canAccessRoute={() => true}
          session={session}
        />
        <main className="min-w-0 flex-1 p-8">
          <div className="mx-auto max-w-4xl rounded-2xl border border-[var(--border-default)] bg-[var(--surface-elevated)] p-8 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-brand-600">NAV-002</p>
            <h1 className="mt-2 font-brand text-3xl font-black">Sidebar operacional</h1>
            <p className="mt-3 text-sm text-[var(--text-secondary)]">
              Harness visual sin autenticación. La navegación usa el mismo routeMeta y los mismos
              componentes de producción.
            </p>
          </div>
        </main>
      </div>
    </MemoryRouter>
  );
};

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <SidebarHarness />
  </React.StrictMode>
);
