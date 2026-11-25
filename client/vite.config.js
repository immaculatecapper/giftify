import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Vite config
// - dev server proxies /api and /auth to the Express API on port 3000 (no CORS needed)
// - vitest runs the unit tests in a jsdom (browser-like) environment
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:3000',
      '/auth': 'http://localhost:3000',
    },
  },
  build: {
    // split React + router into their own long-cached chunk (performance)
    rollupOptions: {
      output: {
        manualChunks: { react: ['react', 'react-dom', 'react-router-dom'] },
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/setupTests.js',
    css: false,
  },
})
