import '../scss/tacwork-download.scss';
import { content } from '../data/tac-home-content.js';

const download = content.download;

document.addEventListener('DOMContentLoaded', () => {
  const action = document.querySelector('#tacDownloadAction');
  const gate = document.querySelector('#tacDownloadGate');
  const keyInput = document.querySelector('#tacDownloadKey');
  const gateStatus = document.querySelector('#tacDownloadGateStatus');
  const renderDownloadLink = () => `<a class="tac-download-button" href="${download.artifact}" download="${download.fileName}">${download.label}<span aria-hidden="true">↗</span></a>`;

  if (action) {
    action.innerHTML = download.available
      ? renderDownloadLink()
      : `<button type="button" class="tac-download-button tac-download-button--disabled" aria-disabled="true" aria-controls="tacDownloadKey">${download.label}<span aria-hidden="true">↗</span></button>`;
  }
  document.querySelector('#tacDownloadHeroMeta').textContent = download.platform;
  document.querySelector('#tacDownloadAvailability').textContent = download.available ? 'Download available' : 'Internal preview · Key required';
  document.querySelector('#tacDownloadProduct').textContent = download.product;
  document.querySelector('#tacDownloadVersion').textContent = download.version;
  document.querySelector('#tacDownloadPlatformCopy').textContent = download.platform;
  document.querySelector('#tacDownloadPlatform').textContent = download.platform;
  document.querySelector('#tacDownloadFile').textContent = `${download.fileName} · ${download.fileSize}`;
  document.querySelector('#tacDownloadChecksum').textContent = download.checksum;

  if (!download.available && gate && keyInput && gateStatus) {
    gate.hidden = false;
    action?.querySelector('[aria-controls="tacDownloadKey"]')?.addEventListener('click', () => {
      keyInput.focus();
      gateStatus.textContent = 'Enter the internal key to enable this download.';
      gateStatus.classList.remove('is-error');
    });
    gate.addEventListener('submit', (event) => {
      event.preventDefault();
      if (keyInput.value.trim() !== download.activationKey) {
        gateStatus.textContent = 'That key does not match. Try again.';
        gateStatus.classList.add('is-error');
        keyInput.select();
        return;
      }
      action.innerHTML = renderDownloadLink();
      gate.hidden = true;
      document.querySelector('#tacDownloadAvailability').textContent = 'Download activated for this session';
    });
  }

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    document.querySelectorAll('.tac-download-hero-copy, .tac-download-hero-art, .tac-download-showcase, .tac-download-details, .tac-download-steps, .tac-download-release').forEach((element, index) => {
    element.style.setProperty('--delay', `${index * 90}ms`);
    element.classList.add('is-ready');
  });
});
