import '../scss/tacwork-download.scss';
import { content } from '../data/tac-home-content.js';

const download = content.download;

document.addEventListener('DOMContentLoaded', () => {
  const action = document.querySelector('#tacDownloadAction');
  const downloadLink = document.createElement('a');
  const arrow = document.createElement('span');
  downloadLink.className = 'tac-download-button';
  downloadLink.href = download.artifact;
  downloadLink.textContent = download.label;
  arrow.setAttribute('aria-hidden', 'true');
  arrow.textContent = '↗';
  downloadLink.append(arrow);
  action?.replaceChildren(downloadLink);

  document.querySelector('#tacDownloadHeroMeta').textContent = download.platform;
  document.querySelector('#tacDownloadVersionMeta').textContent = `Version ${download.version}`;
  document.querySelector('#tacDownloadReleaseType').textContent = download.releaseType.replace(/\s+release$/i, '');
  document.querySelector('#tacDownloadAvailability').textContent = download.accessNote;
  document.querySelector('#tacDownloadSecurityNote').textContent = download.securityNotice;
  document.querySelector('#tacDownloadProduct').textContent = download.product;
  document.querySelector('#tacDownloadVersion').textContent = download.version;
  document.querySelector('#tacDownloadPlatformCopy').textContent = download.platform;
  document.querySelector('#tacDownloadPlatform').textContent = download.platform;
  document.querySelector('#tacDownloadFile').textContent = download.fileName;
  document.querySelector('#tacDownloadFileSize').textContent = download.fileSize;
  const checksumRow = document.querySelector('.tac-download-checksum-row');
  if (download.checksum) {
    document.querySelector('#tacDownloadChecksum').textContent = download.checksum;
  } else {
    checksumRow?.remove();
  }

  const checksumStatus = document.querySelector('#tacDownloadChecksumStatus');
  if (download.checksum) document.querySelector('[data-copy-checksum]')?.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(download.checksum);
      checksumStatus.textContent = 'Full SHA-256 checksum copied.';
    } catch {
      checksumStatus.textContent = 'Copy unavailable. Select and copy the full checksum above.';
    }
  });

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  document.querySelectorAll('.tac-download-hero-copy, .tac-download-hero-art, .tac-download-showcase, .tac-download-details, .tac-download-steps, .tac-download-release').forEach((element, index) => {
    element.style.setProperty('--delay', `${index * 90}ms`);
    element.classList.add('is-ready');
  });
});
