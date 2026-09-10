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
        'pages/skills': resolve(__dirname, 'pages/skills.html'),
        'pages/tac-assistant-assets': resolve(__dirname, 'pages/tac-assistant-assets.html')
      }
    }
  }
});
