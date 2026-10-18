import { renderCard } from './tac-skills-render.js';
import '../scss/tac-skills.scss';
import { skills as fallbackSkills } from '../data/tac-skills.js';

const escapeHtml = (value) => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;');

const initialSkills = JSON.parse(document.querySelector('#staticSkillCatalog')?.textContent || 'null') || fallbackSkills;
const state = {
  query: '',
  category: 'All',
  skills: [...initialSkills],
  categories: ['All', ...new Set(initialSkills.map((skill) => skill.category))]
};
let selectedId = '';

function normalizeManifestSkill(skill) {
  return {
    ...skill,
    featured: Boolean(skill.featured),
    tags: Array.isArray(skill.tags) ? skill.tags : [],
    lastUpdated: skill.lastUpdated || skill.packagedAt?.slice(0, 10) || skill.version || '',
    minTacWorkVersion: skill.minTacWorkVersion || null
  };
}

function isLocalArtifactUrl(value) {
  return typeof value === 'string' && value.startsWith('/skill-artifacts/');
}

async function loadSkillManifest() {
  try {
    const response = await fetch('../skill-artifacts/MANIFEST.json', { headers: { Accept: 'application/json' } });
    if (!response.ok) throw new Error(`Manifest request failed with ${response.status}`);
    const payload = await response.json();
    const manifestSkills = Array.isArray(payload.skills)
      ? payload.skills.filter((skill) => skill && skill.id && skill.name && isLocalArtifactUrl(skill.artifactUrl)).map(normalizeManifestSkill)
      : [];
    if (!manifestSkills.length) throw new Error('Manifest has no publishable skills');
    state.skills = manifestSkills;
    state.categories = ['All', ...new Set(manifestSkills.map((skill) => skill.category).filter(Boolean))];
  } catch (error) {
    console.warn('[TAC Skill Hub] Using fallback catalog.', error);
  }
}

function matchesFilter(skill) {
  const query = state.query.trim().toLowerCase();
  const categoryMatches = state.category === 'All' || skill.category === state.category;
  if (!categoryMatches) return false;
  if (!query) return true;
  const searchable = [skill.name, skill.description, skill.category, skill.author, skill.sourceRepo, ...(skill.tags || [])].join(' ').toLowerCase();
  return searchable.includes(query);
}

function renderFilters() {
  const container = document.querySelector('#skillFilters');
  container.innerHTML = state.categories.map((category, index) => `<button type="button" role="tab" aria-selected="${category === state.category}" tabindex="${index === 0 ? '0' : '-1'}" data-category="${escapeHtml(category)}">${escapeHtml(category)}</button>`).join('');
}



function getDetailStatus(skill) {
  if (skill.trust === 'tac-authored') return 'TAC AUTHORED';
  if (skill.featured) return 'FEATURED EXAMPLE';
  return 'PUBLIC EXAMPLE';
}

function getDistributionLabel(skill) {
  return skill.artifactUrl ? 'TAC-hosted package' : 'Source repository only';
}

function renderDownloadAction(skill) {
  if (!skill.artifactUrl) return '';
  const requirement = skill.minTacWorkVersion ? ` · TACWork ${escapeHtml(skill.minTacWorkVersion)}+` : '';
  return `<div class="tac-skills-detail-actions">
    <a class="tac-skills-download-link" href="${escapeHtml(skill.artifactUrl)}" download>Download for TACWork <span aria-hidden="true">↘</span></a>
    <span>${escapeHtml(skill.artifactType || 'package').toUpperCase()} · v${escapeHtml(skill.version || 'unversioned')}${requirement}</span>
  </div>`;
}

function renderDetail(skill) {
  const detail = document.querySelector('#skillDetail');
  if (!skill) {
    detail.innerHTML = '<div class="tac-skills-detail-empty"><p class="tac-skills-eyebrow"><span></span>SKILL DETAIL</p><h2 id="skillDetailTitle">Select a skill to inspect its source.</h2><p>Choose a card to view its public metadata and original repository.</p></div>';
    return;
  }

  const note = skill.artifactUrl
    ? 'This TAC-hosted package is downloaded from the static Skill Hub. Import it through TACWork’s local Skill importer.'
    : 'TAC does not host or certify this community skill. Review the original repository before use.';
  detail.innerHTML = `<div class="tac-skills-detail-content">
    <div class="tac-skills-detail-top"><p class="tac-skills-eyebrow"><span></span>SKILL DETAIL</p><span class="tac-skills-detail-status">${getDetailStatus(skill)}</span></div>
    <h2 id="skillDetailTitle">${escapeHtml(skill.name)}</h2>
    <p class="tac-skills-detail-description">${escapeHtml(skill.description)}</p>
    ${renderDownloadAction(skill)}
    <div class="tac-skills-detail-visual"><img src="../assets/tac/skills/tac-skill-system.png" alt="TAC AI robot and interface system" loading="lazy" decoding="async"><span>TAC / COMMUNITY SKILLS</span></div>
    <dl class="tac-skills-meta">
      <div><dt>Category</dt><dd>${escapeHtml(skill.category)}</dd></div>
      <div><dt>Author</dt><dd>${escapeHtml(skill.author)}</dd></div>
      <div><dt>Source</dt><dd>${escapeHtml(skill.sourceRepo)}</dd></div>
      <div><dt>License</dt><dd>${escapeHtml(skill.license)}</dd></div>
      <div><dt>Distribution</dt><dd>${getDistributionLabel(skill)}</dd></div>
      ${skill.version ? `<div><dt>Version</dt><dd>${escapeHtml(skill.version)}</dd></div>` : ''}
      <div><dt>Reference date</dt><dd>${escapeHtml(skill.lastUpdated)}</dd></div>
    </dl>
    <div class="tac-skills-detail-tags">${(skill.tags || []).map((tag) => `<span>${escapeHtml(tag)}</span>`).join('')}</div>
    <a class="tac-skills-source-link" href="${escapeHtml(skill.sourceUrl)}" target="_blank" rel="noopener noreferrer">View source on GitHub <span aria-hidden="true">↗</span></a>
    <p class="tac-skills-detail-note">${note}</p>
  </div>`;
}

function renderGrid() {
  const filtered = state.skills.filter(matchesFilter);
  const grid = document.querySelector('#skillGrid');
  const count = document.querySelector('#skillResultCount');
  count.textContent = `${filtered.length} ${filtered.length === 1 ? 'skill' : 'skills'} shown`;
  if (!(grid.dataset.staticCatalog === 'true' && !state.query && state.category === 'All' && !selectedId)) grid.innerHTML = filtered.length
    ? filtered.map(skill => renderCard(skill, state.skills, selectedId)).join('')
    : '<div class="tac-skills-empty"><h3>No matching skills.</h3><p>Try another keyword or category.</p></div>';
  delete grid.dataset.staticCatalog;
}

function setSelectedSkill(id, { updateHash = false } = {}) {
  const skill = state.skills.find((item) => item.id === id);
  if (!skill) return;
  selectedId = skill.id;
  if (updateHash) history.pushState(null, '', `#${skill.id}`);
  renderGrid();
  renderDetail(skill);
}

function syncFromHash() {
  const id = window.location.hash.slice(1).trim();
  const matchingSkill = state.skills.find((skill) => skill.id === id);
  if (matchingSkill) {
    setSelectedSkill(matchingSkill.id);
  } else if (id) {
    selectedId = '';
    renderGrid();
    renderDetail(null);
  }
}

function setupRovingFilters() {
  document.querySelector('#skillFilters').addEventListener('keydown', (event) => {
    const buttons = [...event.currentTarget.querySelectorAll('[role="tab"]')];
    const current = buttons.indexOf(document.activeElement);
    if (current < 0 || !['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? buttons.length - 1 : (current + (event.key === 'ArrowRight' ? 1 : -1) + buttons.length) % buttons.length;
    buttons[next].focus();
    buttons[next].click();
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const search = document.querySelector('#skillSearch');
  const filters = document.querySelector('#skillFilters');
  const grid = document.querySelector('#skillGrid');

  renderFilters();
  renderGrid();
  renderDetail(null);
  setupRovingFilters();

  search.addEventListener('input', (event) => {
    state.query = event.target.value;
    renderGrid();
  });

  filters.addEventListener('click', (event) => {
    const button = event.target.closest('[data-category]');
    if (!button) return;
    state.category = button.dataset.category;
    renderFilters();
    renderGrid();
    document.querySelector(`[data-category="${CSS.escape(state.category)}"]`)?.focus();
  });

  grid.addEventListener('click', (event) => {
    const card = event.target.closest('[data-skill-id]');
    if (card) setSelectedSkill(card.dataset.skillId, { updateHash: true });
  });

  window.addEventListener('hashchange', syncFromHash);
  syncFromHash();

  loadSkillManifest().then(() => {
    renderFilters();
    syncFromHash();
    if (!window.location.hash) renderGrid();
  });
});
