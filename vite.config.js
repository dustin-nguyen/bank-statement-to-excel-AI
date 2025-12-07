import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Base path for GitHub Pages deployment
  base: '/bank-statement-to-excel-AI/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  }
});