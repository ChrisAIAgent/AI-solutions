import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  base: './',
  css: {
    preprocessorOptions: {
      scss: {}
    }
  },
  build: {
    outDir: 'dist',
    assetsInlineLimit: 4096,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        'pages/ai-models': resolve(__dirname, 'pages/ai-models.html'),
        'pages/brand-guidelines': resolve(__dirname, 'pages/brand-guidelines.html')
      }
    }
  }
});
