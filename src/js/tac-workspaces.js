import { renderWorkspaceCard } from './tac-workspaces-render.js';
import '../scss/tac-workspaces.scss';
import { getWorkspaceById, workspaceCategories, workspaceStatuses, workspaces } from '../data/tac-workspaces.js';
import {
  buildWorkspaceHref,
  cleanWorkspaceQuery,
  filterWorkspaces,
  getWorkspaceStatusPresentation,
  parseWorkspaceLocation
} from './tac-workspaces-state.js';

const numberFormat = new Intl.NumberFormat('en');
const state = { query: '', categoryId: 'all' };
const elements = {
  filters: document.querySelector('#workspaceFilters'),
  search: document.querySelector('#workspaceSearch'),
  clearSearch: document.querySelector('#workspaceClearSearch'),
  clearFilters: document.querySelector('#workspaceClearFilters'),
  grid: document.querySelector('#workspaceGrid'),
  count: document.querySelector('#workspaceResultCount'),
  prototypeSummary: document.querySelector('#workspacePrototypeSummary'),
  dialog: document.querySelector('#workspaceDialog'),
  urlNotice: document.querySelector('#workspaceUrlNotice'),
  urlNoticeText: document.querySelector('#workspaceUrlNoticeText'),
  urlNoticeClear: document.querySelector('#workspaceUrlNoticeClear')
};

let returnFocus = null;
let openWorkspaceId = null;
let searchTimer = 0;

const escapeHtml = (value = '') => String(value).replace(/[&<>"']/g, (character) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
})[character]);

function categoryName(id) {
  return workspaceCategories.find((category) => category.id === id)?.label || 'Uncategorized';
}

function statusFor(workspace) {
  return getWorkspaceStatusPresentation(workspace, workspaceStatuses);
}

function importLabelFor(workspace) {
  return statusFor(workspace).importLabel;
}

function renderFilters() {
  elements.filters.replaceChildren(...workspaceCategories.map((category) => {
    const button = document.createElement('button');
    const label = document.createElement('span');
    const count = document.createElement('b');
    button.type = 'button';
    button.dataset.categoryId = category.id;
    button.setAttribute('aria-pressed', String(state.categoryId === category.id));
    label.textContent = category.label;
    count.textContent = numberFormat.format(category.id === 'all'
      ? workspaces.length
      : workspaces.filter((workspace) => workspace.categoryId === category.id).length);
    button.append(label, count);
    return button;
  }));
}



function renderEmptyState() {
  return `<div class="tw-empty-state" role="status"><span aria-hidden="true">⌕</span><h4>No workspaces found</h4><p>Try a different search or business area, or clear your filters to view the directory.</p><button type="button" data-reset-filters>Clear search and filters</button></div>`;
}

function renderDirectory() {
  const filtered = filterWorkspaces(workspaces, state, workspaceCategories);
  elements.count.textContent = `Showing ${numberFormat.format(filtered.length)} of ${numberFormat.format(workspaces.length)} workspaces`;
  if (!(elements.grid.dataset.staticCatalog === 'true' && !state.query && state.categoryId === 'all')) elements.grid.innerHTML = filtered.length ? filtered.map(renderWorkspaceCard).join('') : renderEmptyState();
  elements.filters.querySelectorAll('[data-category-id]').forEach((button) => {
    button.setAttribute('aria-pressed', String(button.dataset.categoryId === state.categoryId));
  });
  elements.clearFilters.hidden = state.categoryId === 'all' && !state.query;
  elements.clearSearch.hidden = !state.query;
  delete elements.grid.dataset.staticCatalog;
}

function renderList(items) {
  return `<ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`;
}

function renderPreview(preview = {}) {
  const previewTypes = { 'summary-table': 'Summary and table', table: 'Table' };
  const previewType = previewTypes[preview.type] || 'Output example';
  const highlights = Array.isArray(preview.highlights) && preview.highlights.length
    ? `<div class="tw-preview-highlights">${preview.highlights.map(({ label, value }) => `<div><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>`).join('')}</div>`
    : '';
  const columns = Array.isArray(preview.columns) ? preview.columns : [];
  const rows = Array.isArray(preview.rows) ? preview.rows : [];
  const table = columns.length && rows.length
    ? `<div class="tw-preview-table-wrap"><table class="tw-preview-table" aria-label="${escapeHtml(preview.title || 'Illustrative output')}"><thead><tr>${columns.map((column) => `<th scope="col">${escapeHtml(column)}</th>`).join('')}</tr></thead><tbody>${rows.map((row) => `<tr>${columns.map((_, index) => `<td>${escapeHtml(row[index] ?? '')}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`
    : '<p class="tw-preview-empty">No output example has been added.</p>';
  return `<section class="tw-detail-section tw-detail-preview" aria-labelledby="workspacePreviewTitle"><div class="tw-detail-section-heading"><div><p class="tw-eyebrow tw-eyebrow--soft"><span></span>OUTCOME PREVIEW</p><h3 id="workspacePreviewTitle">${escapeHtml(preview.title || 'Illustrative output')}</h3></div><div class="tw-preview-tags"><span class="tw-preview-format">${escapeHtml(previewType)}</span><span class="tw-preview-label">Illustrative preview — not a real run result</span></div></div>${highlights}${table}<p class="tw-preview-footnote">Fictional example data for layout and content illustration.</p></section>`;
}

function formatCompatibility(workspace) {
  const compatibility = workspace.compatibility;
  if (!compatibility) return 'Not declared';
  const version = compatibility.minimumTacWorkVersion?.trim() || 'Not declared';
  const systems = Array.isArray(compatibility.supportedSystems) && compatibility.supportedSystems.length
    ? compatibility.supportedSystems.join(', ')
    : 'Not declared';
  return `Minimum TACWork version: ${escapeHtml(version)} · Supported systems: ${escapeHtml(systems)}`;
}

function renderMetadata(workspace) {
  const declared = (value) => value?.trim() ? escapeHtml(value) : 'Not declared';
  return `<dl class="tw-metadata-list"><div><dt>Author</dt><dd>${declared(workspace.author)}</dd></div><div><dt>Version</dt><dd>${declared(workspace.version)}</dd></div><div><dt>Last updated</dt><dd>${declared(workspace.updatedAt)}</dd></div><div><dt>Compatibility</dt><dd>${formatCompatibility(workspace)}</dd></div></dl>`;
}

function renderWorkspaceDetail(workspace) {
  const status = statusFor(workspace);
  const notice = status.detailNotice;
  const folderTree = Array.isArray(workspace.structure) ? workspace.structure.join('\n') : '';
  return `<div class="tw-dialog-header"><div class="tw-detail-heading-meta"><span class="tw-category-label">${escapeHtml(categoryName(workspace.categoryId))}</span><span class="tw-status">${escapeHtml(status.label)}</span></div><button class="tw-dialog-close" type="button" aria-label="Close workspace details">×</button></div>
    <div class="tw-dialog-content">
      <div class="tw-dialog-title"><h2 id="workspaceDialogTitle" tabindex="-1">${escapeHtml(workspace.name)}</h2><p>${escapeHtml(workspace.purpose)}</p></div>
      <p class="tw-detail-notice">${escapeHtml(notice)}</p>
      ${renderPreview(workspace.preview)}
      <section class="tw-detail-section tw-detail-two-col" aria-labelledby="workspaceScenarioTitle"><div><h3 id="workspaceScenarioTitle">Use case</h3><p>${escapeHtml(workspace.scenario)}</p></div><div><h3>Materials to prepare</h3>${renderList(workspace.materials)}</div></section>
      <section class="tw-detail-section"><h3>Suggested steps</h3>${renderList(workspace.steps)}</section>
      <section class="tw-detail-section"><div class="tw-detail-section-heading"><h3>Example folder structure</h3><span class="tw-illustration-tag">Design sketch</span></div><pre><code>${escapeHtml(folderTree)}</code></pre></section>
      <section class="tw-detail-section tw-detail-two-col"><div><h3>Dependencies</h3>${renderList(workspace.dependencies)}</div><div><h3>Permissions</h3>${renderList(workspace.permissions)}</div></section>
      <section class="tw-detail-section"><h3>Human review</h3>${renderList(workspace.humanChecks)}</section>
      <section class="tw-detail-section"><h3>Workspace information</h3>${renderMetadata(workspace)}</section>
      <div class="tw-dialog-actions"><button class="tw-import-button" type="button" disabled>${escapeHtml(importLabelFor(workspace))}</button><a class="tw-button tw-button--dark" href="./tacwork-download.html">Get TACWork <span aria-hidden="true">↗</span></a><a class="tw-text-link" href="./contact-us.html">Discuss a custom workspace <span aria-hidden="true">↗</span></a></div>
    </div>`;
}

function clearPendingSearchWrite() {
  window.clearTimeout(searchTimer);
  searchTimer = 0;
}

function writeCurrentUrl({ workspaceId } = {}) {
  const href = buildWorkspaceHref(window.location.href, { ...state, workspaceId });
  if (`${window.location.pathname}${window.location.search}${window.location.hash}` !== href) {
    window.history.replaceState(window.history.state, '', href);
  }
}

function openWorkspace(id, { pushState = true } = {}) {
  const workspace = getWorkspaceById(id);
  if (!workspace) return false;
  clearPendingSearchWrite();
  const wasOpen = elements.dialog.open;
  if (!wasOpen) {
    const activeElement = document.activeElement?.closest?.('[data-workspace-id]') || document.activeElement;
    returnFocus = activeElement && activeElement !== document.body && activeElement !== document.documentElement
      ? activeElement
      : elements.search;
  }
  elements.dialog.innerHTML = renderWorkspaceDetail(workspace);
  openWorkspaceId = workspace.id;
  if (!wasOpen) elements.dialog.showModal();
  const href = buildWorkspaceHref(window.location.href, { ...state, workspaceId: workspace.id });
  if (pushState && `${window.location.pathname}${window.location.search}${window.location.hash}` !== href) {
    window.history.pushState({ ...(window.history.state || {}), tacWorkspaceDetail: workspace.id }, '', href);
  }
  elements.dialog.querySelector('.tw-dialog-close').focus();
  return true;
}

function focusAfterClose() {
  if (returnFocus?.isConnected && !returnFocus.disabled) returnFocus.focus();
  else if (elements.search?.isConnected) elements.search.focus();
  else elements.filters.querySelector('[aria-pressed="true"]')?.focus();
  returnFocus = null;
  openWorkspaceId = null;
}

function closeWorkspaceWithoutNavigation() {
  if (elements.dialog.open) elements.dialog.close();
}

function requestCloseWorkspace() {
  if (!elements.dialog.open) return;
  const currentId = openWorkspaceId;
  if (currentId && window.location.hash === `#workspace/${encodeURIComponent(currentId)}`
      && window.history.state?.tacWorkspaceDetail === currentId) {
    window.history.back();
    return;
  }
  const href = buildWorkspaceHref(window.location.href, { ...state, workspaceId: null });
  const historyState = { ...(window.history.state || {}) };
  delete historyState.tacWorkspaceDetail;
  window.history.replaceState(historyState, '', href);
  closeWorkspaceWithoutNavigation();
}

function resetFilters({ hideNotice = true } = {}) {
  clearPendingSearchWrite();
  state.query = '';
  state.categoryId = 'all';
  elements.search.value = '';
  renderDirectory();
  writeCurrentUrl({ workspaceId: null });
  if (hideNotice) elements.urlNotice.hidden = true;
  elements.search.focus();
}

const noticeCopy = {
  'invalid-url': 'This link could not be read. The directory has been opened with safe default filters.',
  'query-adjusted': 'The search value in this link was cleaned up before use.',
  'category-reset': 'This category link is not recognized. All workspaces are shown instead.',
  'workspace-not-found': 'This workspace link is not available. Browse the directory or reset the link state.'
};

function showLocationNotices(notices) {
  const uniqueMessages = [...new Set(notices.map((notice) => noticeCopy[notice]).filter(Boolean))];
  elements.urlNotice.hidden = uniqueMessages.length === 0;
  elements.urlNoticeText.textContent = uniqueMessages.join(' ');
}

function syncFromLocation({ focusNotice = false } = {}) {
  clearPendingSearchWrite();
  const parsed = parseWorkspaceLocation(window.location.href, { categories: workspaceCategories, workspaces });
  const stateChanged = state.query !== parsed.query || state.categoryId !== parsed.categoryId;
  state.query = parsed.query;
  state.categoryId = parsed.categoryId;
  elements.search.value = state.query;
  if (stateChanged) renderDirectory();
  else {
    elements.filters.querySelectorAll('[data-category-id]').forEach((button) => {
      button.setAttribute('aria-pressed', String(button.dataset.categoryId === state.categoryId));
    });
    elements.clearFilters.hidden = state.categoryId === 'all' && !state.query;
    elements.clearSearch.hidden = !state.query;
  }
  showLocationNotices(parsed.notices);

  const canonicalHref = buildWorkspaceHref(window.location.href, {
    ...state,
    workspaceId: parsed.clearHash ? null : parsed.workspaceId
  });
  if (`${window.location.pathname}${window.location.search}${window.location.hash}` !== canonicalHref) {
    const historyState = { ...(window.history.state || {}) };
    if (parsed.clearHash) delete historyState.tacWorkspaceDetail;
    window.history.replaceState(historyState, '', canonicalHref);
  }

  if (parsed.workspaceId) openWorkspace(parsed.workspaceId, { pushState: false });
  else closeWorkspaceWithoutNavigation();
  if (focusNotice && parsed.notices.length) elements.urlNoticeClear.focus();
}

function commitFiltersToUrl() {
  writeCurrentUrl({ workspaceId: undefined });
}

renderFilters();
const conceptCount = workspaces.filter((workspace) => workspace.status === 'concept').length;
elements.prototypeSummary.textContent = `${numberFormat.format(conceptCount)} entries are concept examples.`;
renderDirectory();
syncFromLocation({ focusNotice: true });

elements.search.addEventListener('input', () => {
  state.query = cleanWorkspaceQuery(elements.search.value);
  elements.search.value = state.query;
  renderDirectory();
  clearPendingSearchWrite();
  searchTimer = window.setTimeout(commitFiltersToUrl, 250);
});

elements.search.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    clearPendingSearchWrite();
    commitFiltersToUrl();
  }
});

elements.clearSearch.addEventListener('click', () => {
  state.query = '';
  elements.search.value = '';
  renderDirectory();
  commitFiltersToUrl();
  elements.search.focus();
});

elements.filters.addEventListener('click', (event) => {
  const button = event.target.closest('[data-category-id]');
  if (!button) return;
  state.categoryId = button.dataset.categoryId;
  renderDirectory();
  commitFiltersToUrl();
});

elements.clearFilters.addEventListener('click', () => resetFilters());
elements.urlNoticeClear.addEventListener('click', () => resetFilters());
elements.grid.addEventListener('click', (event) => {
  if (event.target.closest('[data-reset-filters]')) {
    resetFilters();
    return;
  }
  const trigger = event.target.closest('[data-workspace-id]');
  if (trigger) openWorkspace(trigger.dataset.workspaceId);
});

elements.dialog.addEventListener('click', (event) => {
  if (event.target === elements.dialog || event.target.closest('.tw-dialog-close')) requestCloseWorkspace();
});
elements.dialog.addEventListener('cancel', (event) => {
  event.preventDefault();
  requestCloseWorkspace();
});
elements.dialog.addEventListener('close', focusAfterClose);
window.addEventListener('popstate', () => syncFromLocation());
