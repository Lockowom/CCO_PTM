import { useCallback, useState } from 'react';

export const SIDEBAR_STORAGE_KEY = 'cco.sidebar.collapsed';

function readStoredState() {
  if (typeof window === 'undefined') return false;
  try {
    const stored = window.localStorage.getItem(SIDEBAR_STORAGE_KEY);
    if (stored === 'true') return true;
    if (stored === 'false') return false;
  } catch {
    // Un storage bloqueado no debe impedir el acceso a la navegación.
  }
  return false;
}

export function usePersistentSidebarState() {
  const [collapsed, setCollapsedState] = useState(readStoredState);

  const setCollapsed = useCallback((nextValue) => {
    setCollapsedState((current) => {
      const resolved = typeof nextValue === 'function' ? nextValue(current) : nextValue;
      const safeValue = Boolean(resolved);
      try {
        window.localStorage.setItem(SIDEBAR_STORAGE_KEY, String(safeValue));
      } catch {
        // El estado en memoria sigue siendo completamente funcional.
      }
      return safeValue;
    });
  }, []);

  return [collapsed, setCollapsed];
}
