import { workspaceCategories, workspaceStatuses } from '../data/tac-workspaces.js';
import { getWorkspaceStatusPresentation } from './tac-workspaces-state.js';
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

export function renderWorkspaceCard(workspace) {
  const categoryLabel = categoryName(workspace.categoryId);
  const featureTag = workspace.featured ? '<span class="tw-featured-tag">Featured</span>' : '';
  const importLabel = importLabelFor(workspace);
  return `<article class="tw-card">
    <div class="tw-card-copy">
      <div class="tw-card-meta"><span class="tw-category-label">${escapeHtml(categoryLabel)}</span><span class="tw-status">${escapeHtml(statusFor(workspace).label)}</span></div>
      <div class="tw-card-title-row"><h4>${escapeHtml(workspace.name)}</h4>${featureTag}</div>
      <p class="tw-card-purpose">${escapeHtml(workspace.purpose)}</p>
      <div class="tw-card-io">
        <div><span>INPUT</span><p>${escapeHtml(workspace.inputs.join(' · '))}</p></div>
        <div><span>EXPECTED OUTPUT</span><p>${escapeHtml(workspace.outputs.join(' · '))}</p></div>
      </div>
      <div class="tw-card-actions"><button class="tw-detail-link" type="button" data-workspace-id="${escapeHtml(workspace.id)}">View details <span aria-hidden="true">↗</span></button><span class="tw-import-hint">${escapeHtml(importLabel)}</span></div>
    </div>
  </article>`;
}
