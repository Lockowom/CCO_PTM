import { describe, expect, it } from 'vitest';
import { FEATURE_FLAGS } from '../config/featureFlags';
import { PUBLIC_SHELL_ROUTES } from '../components/shell/PublicShell';

describe('PR22 · Login, público, Builder y TV', () => {
  it('mantiene apagados por defecto todos los cortes visuales', () => {
    expect(FEATURE_FLAGS.web_login_v2).toBe(false);
    expect(FEATURE_FLAGS.web_public_v2).toBe(false);
    expect(FEATURE_FLAGS.web_builder_v2).toBe(false);
    expect(FEATURE_FLAGS.web_tv_v2).toBe(false);
  });

  it('cubre todas las familias de rutas públicas sin navegación interna', () => {
    expect(Object.keys(PUBLIC_SHELL_ROUTES)).toEqual([
      '/consulta',
      '/verificar',
      '/soporte',
      '/rendiciones'
    ]);
  });
});
