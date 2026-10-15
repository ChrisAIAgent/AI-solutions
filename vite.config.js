import { defineConfig } from 'vite';
import { existsSync, rmSync } from 'fs';
import { resolve } from 'path';
import { sitePages } from './site-pages.js';
import { writeSiteIndex } from './scripts/build-assistant-index.js';

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
  plugins: [{ name: 'tac-assistant-site-index', buildStart() { writeSiteIndex(); } }, excludeLocalDownloadArtifact],
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
      input: Object.fromEntries(Object.entries(sitePages).map(([name, file]) => [name, resolve(__dirname, file)]))
    }
  }
});
