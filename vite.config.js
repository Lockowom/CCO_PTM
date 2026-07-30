import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';
import { readFileSync } from 'fs';
import { execSync } from 'child_process';

// Versión real de la app (package.json) expuesta al bundle como __APP_VERSION__
// para mostrarla en el PDA/pie y que soporte sepa qué build corre.
const pkg = JSON.parse(readFileSync(path.resolve(__dirname, 'package.json'), 'utf8'));

function resolveBuildId() {
  const envBuildId =
    process.env.RENDER_GIT_COMMIT || process.env.SOURCE_VERSION || process.env.COMMIT_SHA;
  if (envBuildId) return String(envBuildId);
  try {
    return execSync('git rev-parse HEAD', { cwd: __dirname, stdio: ['ignore', 'pipe', 'ignore'] })
      .toString()
      .trim();
  } catch {
    return pkg.version;
  }
}

const buildId = resolveBuildId();

// https://vitejs.dev/config/
export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
    __APP_BUILD_ID__: JSON.stringify(buildId)
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'CCO WMS Industrial',
        short_name: 'WMS CCO',
        description: 'Centro de Control Operacional & Warehouse Management System',
        theme_color: '#0f172a', // wms-dark
        background_color: '#0f172a',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        // El módulo integrado /traspasos (app estática vendorizada) NO se precachea
        // (2.6MB) y NO debe recibir el fallback SPA: se sirve directo por express.
        globIgnores: ['**/traspasos/**'],
        navigateFallbackDenylist: [/^\/traspasos\//],
        runtimeCaching: [
          {
            // Estrategia StaleWhileRevalidate para datos de referencia (GET)
            urlPattern:
              /^https:\/\/.*\.supabase\.co\/rest\/v1\/(tms_skus|tms_ubicaciones|tms_conductores|tms_vehiculos).*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'supabase-reference-data',
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24 * 7 // 1 semana
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            // NetworkFirst para el resto de la API de Supabase
            urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'supabase-api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 // 1 día
              },
              cacheableResponse: {
                statuses: [0, 200]
              },
              backgroundSync: {
                name: 'supabase-background-sync',
                options: {
                  maxRetentionTime: 24 * 60 // Retener peticiones fallidas por 24h
                }
              }
            }
          }
        ]
      }
    })
  ],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    // Copiar archivos de public al build
    copyPublicDir: true,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'supabase-vendor': ['@supabase/supabase-js'],
          'ui-vendor': ['lucide-react', 'sonner'],
          'charts-vendor': ['recharts'],
          'animation-vendor': ['gsap', '@gsap/react'],
          'query-vendor': ['@tanstack/react-query']
        }
      }
    }
  },
  // Vitest configuration
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/tests/setup.js'],
    include: ['src/**/*.{test,spec}.{js,jsx}'],
    coverage: {
      reporter: ['text', 'lcov'],
      include: ['src/lib/**', 'src/context/**']
    }
  },
  // Importante para SPA routing
  preview: {
    port: 4173,
    strictPort: true
  },
  server: {
    port: 5173,
    strictPort: true
  }
});
