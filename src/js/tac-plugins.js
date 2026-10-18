import { renderCard } from './tac-plugins-render.js';
import '../scss/tac-plugins.scss';
import { pluginSourceUpdated, pluginSourceUrl, plugins } from '../data/tac-plugins.js';

const state = { query: '', npmOnly: false, sort: 'downloads' };
const numberFormat = new Intl.NumberFormat('en');
const displayName = (plugin) => plugin.name.includes('/') ? plugin.name : `${plugin.owner}/${plugin.name}`;

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



function renderDirectory() {
  const grid = document.querySelector('#pluginGrid');
  const filtered = sortPlugins(plugins.filter(matches));
  document.querySelector('#pluginResultCount').textContent = `Showing ${numberFormat.format(filtered.length)} of ${numberFormat.format(plugins.length)} plugins`;
  document.querySelector('#pluginTotal').textContent = numberFormat.format(plugins.length);
  document.querySelector('#pluginHeroTotal').textContent = numberFormat.format(plugins.length);
  document.querySelector('#pluginSourceUpdated').textContent = pluginSourceUpdated;
  document.querySelector('#pluginSourceUpdated').dateTime = pluginSourceUpdated;
  document.querySelector('#pluginSourceLink').href = pluginSourceUrl;
  if (!(grid.dataset.staticCatalog === 'true' && !state.query && state.sort === 'downloads' && !state.npmOnly)) grid.innerHTML = filtered.length
    ? filtered.map(renderCard).join('')
    : '<div class="tac-plugins-empty"><h3>No matching plugins.</h3><p>Try another search or clear the npm package filter.</p></div>';
  delete grid.dataset.staticCatalog;
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
