import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';

export default defineConfig({
  root: __dirname,
  cacheDir: '../../node_modules/.vite/web',
  plugins: [nxViteTsPaths(), react()],
  server: {
    host: '0.0.0.0',
    port: 4200,
    proxy: {
      '/api': {
        target: 'http://localhost:3333',
        changeOrigin: true
      }
    }
  },
  build: {
    outDir: '../../dist/apps/web',
    emptyOutDir: true
  }
});
