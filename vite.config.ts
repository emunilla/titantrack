
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
  },
  server: {
    // Para desarrollo local, las API routes se ejecutan con Vercel CLI
    // O puedes usar un proxy a tu URL de producción
    proxy: {
      '/api': {
        target: process.env.VERCEL_URL 
          ? `https://${process.env.VERCEL_URL}` 
          : 'http://localhost:3000',
        changeOrigin: true,
      }
    }
  }
});
