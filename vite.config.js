import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        // Rolldown (Vite 8) memerlukan manualChunks sebagai function
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // Pisahkan React core ke chunk tersendiri (di-cache browser)
            if (
              id.includes('react') ||
              id.includes('react-dom') ||
              id.includes('react-router')
            ) {
              return 'vendor-react';
            }
            // Library vendor lainnya
            return 'vendor';
          }
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
})
