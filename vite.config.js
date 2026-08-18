import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';
import { readFileSync } from 'fs';
import { execSync } from 'child_process';
import { pwaConfig } from './src/config/pwaConfig';

// VersiÃ³n real de la app (package.json) expuesta al bundle como __APP_VERSION__
// para mostrarla en el PDA/pie y que soporte sepa quÃ© build corre.
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

function versionManifestPlugin() {
  return {
    name: 'cco-version-manifest',
    generateBundle() {
      this.emitFile({
        type: 'asset',
        fileName: 'version.json',
        source: JSON.stringify({ version: pkg.version, buildId })
      });
    }
  };
}

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
  plugins: [react(), versionManifestPlugin(), VitePWA(pwaConfig)],
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
