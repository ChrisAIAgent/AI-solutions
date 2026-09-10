import '../scss/tacwork-download.scss';
import { content } from '../data/tac-home-content.js';

const download = content.download;

document.addEventListener('DOMContentLoaded', () => {
  const action = document.querySelector('#tacDownloadAction');
  if (action) {
    action.innerHTML = download.available
      ? `<a class="tac-download-button" href="${download.artifact}" download="${download.fileName}">${download.label}<span aria-hidden="true">↗</span></a>`
      : `<span class="tac-download-button tac-download-button--disabled" aria-disabled="true">${download.label}<span aria-hidden="true">↗</span></span>`;
  }
  document.querySelector('#tacDownloadHeroMeta').textContent = download.platform;
  document.querySelector('#tacDownloadProduct').textContent = download.product;
  document.querySelector('#tacDownloadVersion').textContent = download.version;
  document.querySelector('#tacDownloadPlatformCopy').textContent = download.platform;
  document.querySelector('#tacDownloadPlatform').textContent = download.platform;
  document.querySelector('#tacDownloadFile').textContent = `${download.fileName} · ${download.fileSize}`;
  document.querySelector('#tacDownloadChecksum').textContent = download.checksum;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    document.querySelectorAll('.tac-download-hero-copy, .tac-download-hero-art, .tac-download-showcase, .tac-download-details, .tac-download-steps, .tac-download-release').forEach((element, index) => {
    element.style.setProperty('--delay', `${index * 90}ms`);
    element.classList.add('is-ready');
  });
});
