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

export function renderCard(plugin) {
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
