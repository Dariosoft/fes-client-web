import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

const clusterDev = process.env.VITE_USE_POLLING === 'true';

export default defineConfig({
  plugins: [tailwindcss(), react()],
  server: {
    allowedHosts: clusterDev ? true : undefined,
    watch: clusterDev ? { usePolling: true, interval: 300 } : undefined,
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: false,
    passWithNoTests: true,
  },
});
