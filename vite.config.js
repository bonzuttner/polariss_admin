import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/', // Adjust this if deploying to a subpath
  build: {
    outDir: 'dist', // Output directory for production build
    assetsDir: 'assets', // Directory for static assets
  },
  server: {
    open: true, // Opens browser on local dev server start
  },
});
