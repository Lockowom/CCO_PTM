import { describe, expect, it } from 'vitest';
import {
  pwaConfig,
  PWA_SENSITIVE_ROUTES,
  PWA_RUNTIME_CONTROL_ROUTE,
  PWA_REFERENCE_ROUTES,
  PWA_SUPABASE_CATCH_ALL
} from '../config/pwaConfig';

// ── PR-008 B6 · Contrato PWA (vite-plugin-pwa) ───────────────────────────────
// Blinda las reglas de caché del Service Worker heredadas de PR-005 (hardening):
//   * Datos sensibles SIEMPRE NetworkOnly y con prioridad sobre el catch-all.
//   * app_runtime_control (token de actualización global) nunca desde caché.
//   * /traspasos no se precachea ni recibe fallback SPA.
//   * Referencia StaleWhileRevalidate (1 semana) y resto NetworkFirst (1 día).

describe('PR-008 B6 · reglas de caché del Service Worker', () => {
  it('registerType es autoUpdate (actualización sin intervención)', () => {
    expect(pwaConfig.registerType).toBe('autoUpdate');
  });

  it('la regla de datos SENSIBLES es NetworkOnly y va ANTES del catch-all', () => {
    const handlers = pwaConfig.workbox.runtimeCaching.map((r) => r.handler);
    const idxSensible = pwaConfig.workbox.runtimeCaching.findIndex(
      (r) => r.urlPattern === PWA_SENSITIVE_ROUTES
    );
    const idxCatchAll = pwaConfig.workbox.runtimeCaching.findIndex(
      (r) => r.urlPattern === PWA_SUPABASE_CATCH_ALL
    );
    expect(idxSensible).toBeGreaterThanOrEqual(0);
    expect(idxSensible).toBeLessThan(idxCatchAll);
    expect(pwaConfig.workbox.runtimeCaching[idxSensible].handler).toBe('NetworkOnly');
    expect(handlers.filter((h) => h === 'NetworkOnly').length).toBe(2);
  });

  it('PWA_SENSITIVE_ROUTES cubre auth, IAM y las tablas con datos personales', () => {
    expect(PWA_SENSITIVE_ROUTES.test('https://abc.supabase.co/auth/v1/token')).toBe(true);
    expect(PWA_SENSITIVE_ROUTES.test('https://abc.supabase.co/rest/v1/tms_usuarios?select=*')).toBe(
      true
    );
    expect(PWA_SENSITIVE_ROUTES.test('https://abc.supabase.co/rest/v1/tms_accesos?select=*')).toBe(
      true
    );
    expect(PWA_SENSITIVE_ROUTES.test('https://abc.supabase.co/rest/v1/tms_roles?select=*')).toBe(
      true
    );
    expect(PWA_SENSITIVE_ROUTES.test('https://abc.supabase.co/rest/v1/tms_permisos?select=*')).toBe(
      true
    );
    expect(PWA_SENSITIVE_ROUTES.test('https://abc.supabase.co/rest/v1/tms_sesiones?select=*')).toBe(
      true
    );
    expect(
      PWA_SENSITIVE_ROUTES.test('https://abc.supabase.co/rest/v1/rpc/iam_log_denegacion')
    ).toBe(true);
    expect(
      PWA_SENSITIVE_ROUTES.test('https://abc.supabase.co/rest/v1/tms_postventa_correos?select=*')
    ).toBe(true);
    expect(
      PWA_SENSITIVE_ROUTES.test('https://abc.supabase.co/rest/v1/tms_consulta_metricas?select=*')
    ).toBe(true);
  });

  it('app_runtime_control es NetworkOnly (token de actualización global)', () => {
    const idx = pwaConfig.workbox.runtimeCaching.findIndex(
      (r) => r.urlPattern === PWA_RUNTIME_CONTROL_ROUTE
    );
    expect(idx).toBeGreaterThanOrEqual(0);
    expect(pwaConfig.workbox.runtimeCaching[idx].handler).toBe('NetworkOnly');
    expect(
      PWA_RUNTIME_CONTROL_ROUTE.test('https://abc.supabase.co/rest/v1/app_runtime_control?select=*')
    ).toBe(true);
  });

  it('datos de referencia: StaleWhileRevalidate con expiración de 1 semana', () => {
    const idx = pwaConfig.workbox.runtimeCaching.findIndex(
      (r) => r.urlPattern === PWA_REFERENCE_ROUTES
    );
    const rule = pwaConfig.workbox.runtimeCaching[idx];
    expect(rule.handler).toBe('StaleWhileRevalidate');
    expect(rule.options.expiration.maxAgeSeconds).toBe(60 * 60 * 24 * 7);
    expect(rule.options.cacheName).toBe('supabase-reference-data');
    expect(PWA_REFERENCE_ROUTES.test('https://abc.supabase.co/rest/v1/tms_skus?select=*')).toBe(
      true
    );
    expect(
      PWA_REFERENCE_ROUTES.test('https://abc.supabase.co/rest/v1/tms_conductores?select=*')
    ).toBe(true);
  });

  it('catch-all de Supabase es NetworkFirst con expiración de 1 día', () => {
    const idx = pwaConfig.workbox.runtimeCaching.findIndex(
      (r) => r.urlPattern === PWA_SUPABASE_CATCH_ALL
    );
    const rule = pwaConfig.workbox.runtimeCaching[idx];
    expect(rule.handler).toBe('NetworkFirst');
    expect(rule.options.expiration.maxAgeSeconds).toBe(60 * 60 * 24);
  });

  it('/traspasos no se precachea ni recibe fallback SPA', () => {
    expect(pwaConfig.workbox.globIgnores).toContain('**/traspasos/**');
    expect(pwaConfig.workbox.navigateFallbackDenylist[0].test('/traspasos/index.html')).toBe(true);
    expect(pwaConfig.workbox.navigateFallbackDenylist[0].test('/panel/rutas')).toBe(false);
  });

  it('globPatterns cubre los artefactos del build', () => {
    const pattern = pwaConfig.workbox.globPatterns[0];
    expect(pattern).toContain('js');
    expect(pattern).toContain('css');
    expect(pattern).toContain('html');
    expect(pattern).toContain('png');
    expect(pattern).toContain('svg');
    expect(pattern).toContain('woff2');
  });
});

describe('PR-008 B6 · manifest', () => {
  it('cumple los requisitos básicos de una PWA instalable', () => {
    expect(pwaConfig.manifest.name).toBe('CCO WMS Industrial');
    expect(pwaConfig.manifest.short_name).toBe('WMS CCO');
    expect(pwaConfig.manifest.display).toBe('standalone');
    expect(pwaConfig.manifest.orientation).toBe('portrait');
    expect(pwaConfig.manifest.icons).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ src: 'pwa-192x192.png', sizes: '192x192' }),
        expect.objectContaining({
          src: 'pwa-512x512.png',
          sizes: '512x512',
          purpose: 'any maskable'
        })
      ])
    );
  });
});
