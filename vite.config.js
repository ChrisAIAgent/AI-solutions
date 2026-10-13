import { defineConfig } from 'vite';
import { existsSync, rmSync } from 'fs';
import { resolve } from 'path';

const publishDownloadArtifact = process.env.TAC_PUBLISH_DOWNLOAD_ARTIFACT === 'true';

const excludeLocalDownloadArtifact = {
  name: 'exclude-local-download-artifact',
  apply: 'build',
  closeBundle() {
    if (publishDownloadArtifact) return;
    const downloadsDir = resolve(__dirname, 'dist/downloads');
    if (existsSync(downloadsDir)) rmSync(downloadsDir, { recursive: true, force: true });
  }
};

export default defineConfig({
  base: './',
  plugins: [excludeLocalDownloadArtifact],
  css: {
    preprocessorOptions: {
      scss: {}
    }
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8791',
        changeOrigin: true,
        headers: { origin: 'http://127.0.0.1:8791' }
      }
    }
  },
  build: {
    outDir: 'dist',
    assetsInlineLimit: 4096,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        'pages/marketing-library': resolve(__dirname, 'pages/marketing-library.html'),
        'pages/ai-models': resolve(__dirname, 'pages/ai-models.html'),
        'pages/brand-guidelines': resolve(__dirname, 'pages/brand-guidelines.html'),
        'pages/tacwork-download': resolve(__dirname, 'pages/tacwork-download.html'),
        'pages/tac-harness': resolve(__dirname, 'pages/tac-harness.html'),
        'pages/tac-cli': resolve(__dirname, 'pages/tac-cli.html'),
        'pages/tac-plugins': resolve(__dirname, 'pages/tac-plugins.html'),
        'pages/skills': resolve(__dirname, 'pages/skills.html'),
        'pages/tac-assistant-assets': resolve(__dirname, 'pages/tac-assistant-assets.html')
      }
    }
  }
});
