import { describe, it, expect, afterEach } from 'vitest';
import { renderHook, cleanup } from '@testing-library/react';
import useOnlineStatus from '../hooks/useOnlineStatus';

// setup.js define navigator.onLine como writable y suprime los listeners
// online/offline en el entorno de test, así que verificamos la LECTURA inicial
// (que es lo que determina el indicador del PDA al montar cada pantalla).
describe('useOnlineStatus — conectividad real del PDA', () => {
  afterEach(() => { cleanup(); navigator.onLine = true; });

  it('devuelve true cuando el dispositivo está conectado', () => {
    navigator.onLine = true;
    const { result } = renderHook(() => useOnlineStatus());
    expect(result.current).toBe(true);
  });

  it('devuelve false cuando el dispositivo está sin señal', () => {
    navigator.onLine = false;
    const { result } = renderHook(() => useOnlineStatus());
    expect(result.current).toBe(false);
  });
});
