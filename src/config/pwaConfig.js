/**
 * PWA — configuración VitePWA (contrato PR-008 B6).
 * Extraída de vite.config.js como dato puro para poder blindar con tests las
 * reglas de caché críticas:
 *   1. Datos SENSIBLES (auth, sesiones, IAM, usuarios, roles, postventa,
 *      correos, direcciones, historial de cargas) → SIEMPRE NetworkOnly y
 *      ANTES del catch-all (prioridad de reglas).
 *   2. app_runtime_control (token de actualización global) → NetworkOnly.
 *   3. Datos de referencia (skus, ubicaciones, conductores, vehículos) →
 *      StaleWhileRevalidate con expiración de 1 semana.
 *   4. Resto de Supabase → NetworkFirst con expiración de 1 día.
 *   5. El módulo vendorizado /traspasos NO se precachea ni recibe fallback.
 */

export const PWA_SENSITIVE_ROUTES =
  /^https:\/\/.*\.supabase\.co\/(auth\/|rest\/v1\/(iam\.|tms_usuarios|tms_usuarios_activos|tms_accesos|tms_roles|tms_permisos|tms_sesiones|tms_postventa_tickets|tms_postventa_correos|tms_direcciones|tms_historial_cargas|tms_consulta_metricas|tms_operaciones|tms_transporte_ordenes|coord_rutas_|system_alert|mobile_ota_|app_runtime_control)|rest\/v1\/rpc\/(iam_|coord_rutas_|tms_|guardar_|cambiar_estado_|usuarios_|api_key_|update_system_alert_))/i;

export const PWA_RUNTIME_CONTROL_ROUTE =
  /^https:\/\/.*\.supabase\.co\/rest\/v1\/app_runtime_control.*/i;

export const PWA_REFERENCE_ROUTES =
  /^https:\/\/.*\.supabase\.co\/rest\/v1\/(tms_skus|tms_ubicaciones|tms_conductores|tms_vehiculos).*/i;

export const PWA_SUPABASE_CATCH_ALL = /^https:\/\/.*\.supabase\.co\/.*/i;

export const pwaConfig = {
  registerType: 'autoUpdate',
  includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
  manifest: {
    name: 'CCO WMS Industrial',
    short_name: 'WMS CCO',
    description: 'Centro de Control Operacional & Warehouse Management System',
    theme_color: '#0f172a',
    background_color: '#0f172a',
    display: 'standalone',
    orientation: 'portrait',
    icons: [
      { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
      { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' }
    ]
  },
  workbox: {
    globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
    globIgnores: ['**/traspasos/**'],
    navigateFallbackDenylist: [/^\/traspasos\//],
    runtimeCaching: [
      {
        // PR-005 · HARDENING: datos SENSIBLES nunca se cachean.
        // Esta regla debe estar ANTES del catch-all para tener prioridad.
        urlPattern: PWA_SENSITIVE_ROUTES,
        handler: 'NetworkOnly'
      },
      {
        // El token de actualización global siempre debe venir de red.
        urlPattern: PWA_RUNTIME_CONTROL_ROUTE,
        handler: 'NetworkOnly'
      },
      {
        urlPattern: PWA_REFERENCE_ROUTES,
        handler: 'StaleWhileRevalidate',
        options: {
          cacheName: 'supabase-reference-data',
          expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 7 },
          cacheableResponse: { statuses: [0, 200] }
        }
      },
      {
        urlPattern: PWA_SUPABASE_CATCH_ALL,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'supabase-api-cache',
          expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 },
          cacheableResponse: { statuses: [0, 200] }
        }
      }
    ]
  }
};
