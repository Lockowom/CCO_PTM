import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    // Copiar archivos de public al build
    copyPublicDir: true,
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
