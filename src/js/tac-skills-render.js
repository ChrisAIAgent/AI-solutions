const escapeHtml = (value = '') => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function renderCard(skill, catalog, selectedId = '') {
  const selected = selectedId === skill.id;
  const label = skill.trust === 'tac-authored' ? 'TAC AUTHORED' : skill.featured ? 'FEATURED' : 'COMMUNITY';
  const availability = skill.artifactUrl ? 'TACWORK PACKAGE' : 'SOURCE ONLY';
  return `<button type="button" class="tac-skill-card${skill.featured ? ' is-featured' : ''}${skill.artifactUrl ? ' is-downloadable' : ''}${selected ? ' is-selected' : ''}" data-skill-id="${escapeHtml(skill.id)}" aria-pressed="${selected}">
    <span class="tac-skill-card-top"><span>${label}</span><span>${escapeHtml(skill.category)}</span></span>
    <span class="tac-skill-card-number">${String(catalog.indexOf(skill) + 1).padStart(2, '0')}</span>
    <strong>${escapeHtml(skill.name)}</strong>
    <span class="tac-skill-card-description">${escapeHtml(skill.description)}</span>
    <span class="tac-skill-card-tags">${skill.tags.map((tag) => `<i>${escapeHtml(tag)}</i>`).join('')}</span>
    <span class="tac-skill-card-availability">${availability}${skill.version ? ` · v${escapeHtml(skill.version)}` : ''}</span>
    <span class="tac-skill-card-arrow" aria-hidden="true">↗</span>
  </button>`;
}
