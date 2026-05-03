import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'CCO WMS',
        short_name: 'CCO',
        description: 'Centro de Control Operacional & WMS',
        theme_color: '#f97316',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
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
          'ui-vendor': ['lucide-react', 'sonner', 'recharts', 'gsap', '@gsap/react'],
          'map-vendor': ['leaflet', 'react-leaflet'],
          'query-vendor': ['@tanstack/react-query']
        }
      }
    }
  },
  // Importante para SPA routing
  preview: {
    port: 4173,
    strictPort: true,
  },
  server: {
    port: 5173,
    strictPort: true,
  }
})
