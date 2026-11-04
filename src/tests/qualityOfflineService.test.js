import { describe, expect, it } from 'vitest';

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
