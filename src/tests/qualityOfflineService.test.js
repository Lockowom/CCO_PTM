import { afterEach, describe, expect, it } from 'vitest';

const loadService = () => import('../services/qualityOfflineService.js');

afterEach(async () => {
  const { setQualityConnectionStatus } = await loadService();
  setQualityConnectionStatus(null);
  navigator.onLine = true;
});

describe('QUALITY-OFFLINE-001 · contrato de sincronización', () => {
  it('distingue evidencia local de rutas ya sincronizadas', async () => {
    const { isLocalQualityEvidencePath, isQualityOffline } = await import(
      '../services/qualityOfflineService.js'
    );
    expect(typeof isQualityOffline()).toBe('boolean');
    expect(isLocalQualityEvidencePath('quality-offline://photo-1')).toBe(true);
    expect(isLocalQualityEvidencePath('ingreso/task-1/photo.jpg')).toBe(false);
  });
});

describe('QUALITY-OFFLINE-002 · conectividad comprobada', () => {
  it('no bloquea Calidad si el navegador informa offline pero el backend ya fue validado', async () => {
    const { isQualityOffline, setQualityConnectionStatus } = await loadService();
    navigator.onLine = false;
    setQualityConnectionStatus(true);
    expect(isQualityOffline()).toBe(false);
  });

  it('mantiene el modo offline si la comprobación real falla', async () => {
    const { isQualityOffline, setQualityConnectionStatus } = await loadService();
    navigator.onLine = true;
    setQualityConnectionStatus(false);
    expect(isQualityOffline()).toBe(true);
  });
});
