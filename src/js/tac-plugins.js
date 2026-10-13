import '../scss/tac-plugins.scss';
import { pluginSourceUpdated, pluginSourceUrl, plugins } from '../data/tac-plugins.js';

const state = { query: '', npmOnly: false, sort: 'downloads' };
const numberFormat = new Intl.NumberFormat('en');
const dateFormat = new Intl.DateTimeFormat('en', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' });
const escapeHtml = (value = '') => String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const githubRepositoryUrl = (value = '') => {
  try {
    const repository = new URL(value);
    return repository.hostname === 'github.com' && repository.protocol === 'https:' ? repository.href : '';
  } catch { return ''; }
};
const displayName = (plugin) => plugin.name.includes('/') ? plugin.name : `${plugin.owner}/${plugin.name}`;
const metric = (value) => Number.isFinite(value) ? numberFormat.format(value) : '—';

function matches(plugin) {
  const haystack = [plugin.name, plugin.owner, displayName(plugin), plugin.description, plugin.package || ''].join(' ').toLocaleLowerCase();
  return (!state.query || haystack.includes(state.query)) && (!state.npmOnly || Boolean(plugin.package));
}

function sortPlugins(items) {
  const compareNumber = (key) => (a, b) => (b[key] ?? -1) - (a[key] ?? -1) || displayName(a).localeCompare(displayName(b));
  if (state.sort === 'stars') return items.sort(compareNumber('stars'));
  if (state.sort === 'newest') return items.sort((a, b) => (b.added || '').localeCompare(a.added || '') || displayName(a).localeCompare(displayName(b)));
  if (state.sort === 'name') return items.sort((a, b) => displayName(a).localeCompare(displayName(b)));
  return items.sort(compareNumber('downloads'));
}

function renderCard(plugin) {
  const repository = githubRepositoryUrl(plugin.repository);
  const repositoryAction = repository
    ? `<a href="${escapeHtml(repository)}" target="_blank" rel="noopener noreferrer">GitHub repository <span aria-hidden="true">↗</span></a>`
    : '<span class="tac-plugin-no-repository">GitHub link unavailable</span>';
  const packageLabel = plugin.package
    ? `<span class="tac-plugin-package">npm <code>${escapeHtml(plugin.package)}</code></span>`
    : '<span class="tac-plugin-package tac-plugin-package--guide">GitHub project</span>';
  const addedDate = plugin.added && !Number.isNaN(Date.parse(`${plugin.added}T00:00:00Z`))
    ? `<time datetime="${escapeHtml(plugin.added)}">Added ${escapeHtml(dateFormat.format(new Date(`${plugin.added}T00:00:00Z`)))}</time>`
    : '';
  return `<article class="tac-plugin-card">
    <div class="tac-plugin-card-mark" aria-hidden="true">◉</div>
    <div class="tac-plugin-card-content">
      <div class="tac-plugin-card-meta"><span>VISION &amp; MULTIMODAL</span>${packageLabel}</div>
      <h3>${escapeHtml(displayName(plugin))}</h3>
      <p>${escapeHtml(plugin.description)}</p>
      <div class="tac-plugin-card-stats"><span>★ ${metric(plugin.stars)} stars</span><span>${metric(plugin.downloads)} downloads</span>${addedDate}</div>
      <div class="tac-plugin-card-footer"><span>TAC HARNESS / PLUGIN</span>${repositoryAction}</div>
    </div>
  </article>`;
}

function renderDirectory() {
  const grid = document.querySelector('#pluginGrid');
  const filtered = sortPlugins(plugins.filter(matches));
  document.querySelector('#pluginResultCount').textContent = `Showing ${numberFormat.format(filtered.length)} of ${numberFormat.format(plugins.length)} plugins`;
  document.querySelector('#pluginTotal').textContent = numberFormat.format(plugins.length);
  document.querySelector('#pluginHeroTotal').textContent = numberFormat.format(plugins.length);
  document.querySelector('#pluginSourceUpdated').textContent = pluginSourceUpdated;
  document.querySelector('#pluginSourceUpdated').dateTime = pluginSourceUpdated;
  document.querySelector('#pluginSourceLink').href = pluginSourceUrl;
  grid.innerHTML = filtered.length
    ? filtered.map(renderCard).join('')
    : '<div class="tac-plugins-empty"><h3>No matching plugins.</h3><p>Try another search or clear the npm package filter.</p></div>';
}

document.querySelector('#pluginSearch').addEventListener('input', (event) => {
  state.query = event.currentTarget.value.trim().toLocaleLowerCase();
  renderDirectory();
});

document.querySelector('#pluginSort').addEventListener('change', (event) => {
  state.sort = event.currentTarget.value;
  renderDirectory();
});

document.querySelector('#pluginNpmOnly').addEventListener('change', (event) => {
  state.npmOnly = event.currentTarget.checked;
  renderDirectory();
});

renderDirectory();
