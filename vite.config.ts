import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { serviceWorkerPlugin } from './vite-plugins/serviceWorker';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), serviceWorkerPlugin()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
