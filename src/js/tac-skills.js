import '../scss/tac-skills.scss';
import { skillCategories, skills } from '../data/tac-skills.js';

const escapeHtml = (value) => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;');

const state = { query: '', category: 'All' };
let selectedId = '';

function matchesFilter(skill) {
  const query = state.query.trim().toLowerCase();
  const categoryMatches = state.category === 'All' || skill.category === state.category;
  if (!categoryMatches) return false;
  if (!query) return true;
  const searchable = [skill.name, skill.description, skill.category, skill.author, skill.sourceRepo, ...skill.tags].join(' ').toLowerCase();
  return searchable.includes(query);
}

function renderFilters() {
  const container = document.querySelector('#skillFilters');
  container.innerHTML = skillCategories.map((category, index) => `<button type="button" role="tab" aria-selected="${category === state.category}" tabindex="${index === 0 ? '0' : '-1'}" data-category="${escapeHtml(category)}">${escapeHtml(category)}</button>`).join('');
}

function renderCard(skill) {
  const selected = selectedId === skill.id;
  return `<button type="button" class="tac-skill-card${skill.featured ? ' is-featured' : ''}${selected ? ' is-selected' : ''}" data-skill-id="${escapeHtml(skill.id)}" aria-pressed="${selected}">
    <span class="tac-skill-card-top"><span>${skill.featured ? 'FEATURED' : 'COMMUNITY'}</span><span>${escapeHtml(skill.category)}</span></span>
    <span class="tac-skill-card-number">${String(skills.indexOf(skill) + 1).padStart(2, '0')}</span>
    <strong>${escapeHtml(skill.name)}</strong>
    <span class="tac-skill-card-description">${escapeHtml(skill.description)}</span>
    <span class="tac-skill-card-tags">${skill.tags.map((tag) => `<i>${escapeHtml(tag)}</i>`).join('')}</span>
    <span class="tac-skill-card-arrow" aria-hidden="true">↗</span>
  </button>`;
}

function renderDetail(skill) {
  const detail = document.querySelector('#skillDetail');
  if (!skill) {
    detail.innerHTML = '<div class="tac-skills-detail-empty"><p class="tac-skills-eyebrow"><span></span>SKILL DETAIL</p><h2 id="skillDetailTitle">Select a skill to inspect its source.</h2><p>Choose a card to view its public metadata and original repository.</p></div>';
    return;
  }

  detail.innerHTML = `<div class="tac-skills-detail-content">
    <div class="tac-skills-detail-top"><p class="tac-skills-eyebrow"><span></span>SKILL DETAIL</p><span class="tac-skills-detail-status">${skill.featured ? 'FEATURED EXAMPLE' : 'PUBLIC EXAMPLE'}</span></div>
    <h2 id="skillDetailTitle">${escapeHtml(skill.name)}</h2>
    <p class="tac-skills-detail-description">${escapeHtml(skill.description)}</p>
    <div class="tac-skills-detail-visual"><img src="../assets/tac/skills/tac-skill-system.png" alt="TAC AI robot and interface system" loading="lazy" decoding="async"><span>TAC / COMMUNITY SKILLS</span></div>
    <dl class="tac-skills-meta">
      <div><dt>Category</dt><dd>${escapeHtml(skill.category)}</dd></div>
      <div><dt>Author</dt><dd>${escapeHtml(skill.author)}</dd></div>
      <div><dt>Source</dt><dd>${escapeHtml(skill.sourceRepo)}</dd></div>
      <div><dt>License</dt><dd>${escapeHtml(skill.license)}</dd></div>
      <div><dt>Reference date</dt><dd>${escapeHtml(skill.lastUpdated)}</dd></div>
    </dl>
    <div class="tac-skills-detail-tags">${skill.tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join('')}</div>
    <a class="tac-skills-source-link" href="${escapeHtml(skill.sourceUrl)}" target="_blank" rel="noopener noreferrer">View source on GitHub <span aria-hidden="true">↗</span></a>
    <p class="tac-skills-detail-note">TAC does not host or certify this skill. Review the original repository before use.</p>
  </div>`;
}

function renderGrid() {
  const filtered = skills.filter(matchesFilter);
  const grid = document.querySelector('#skillGrid');
  const count = document.querySelector('#skillResultCount');
  count.textContent = `${filtered.length} ${filtered.length === 1 ? 'skill' : 'skills'} shown`;
  grid.innerHTML = filtered.length
    ? filtered.map(renderCard).join('')
    : '<div class="tac-skills-empty"><h3>No matching skills.</h3><p>Try another keyword or category.</p></div>';
}

function setSelectedSkill(id, { updateHash = false } = {}) {
  const skill = skills.find((item) => item.id === id);
  if (!skill) return;
  selectedId = skill.id;
  if (updateHash) history.pushState(null, '', `#${skill.id}`);
  renderGrid();
  renderDetail(skill);
}

function syncFromHash() {
  const id = window.location.hash.slice(1).trim();
  const matchingSkill = skills.find((skill) => skill.id === id);
  if (matchingSkill) setSelectedSkill(matchingSkill.id);
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
});
