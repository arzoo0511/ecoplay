import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { serviceWorkerPlugin } from './vite-plugins/serviceWorker';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), serviceWorkerPlugin()],
  optimizeDeps: {
    // Removed exclude: ['lucide-react'] to prevent ad-blocker issues with fingerprint.js
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
  },
});
