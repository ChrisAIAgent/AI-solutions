export const MAX_WORKSPACE_QUERY_LENGTH = 120;

export function cleanWorkspaceQuery(value = '') {
  return String(value).replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, MAX_WORKSPACE_QUERY_LENGTH);
}

export function normalizeWorkspaceQuery(value = '') {
  return cleanWorkspaceQuery(value).toLocaleLowerCase('en');
}

export function filterWorkspaces(items, { query = '', categoryId = 'all' } = {}, categories = []) {
  const normalizedQuery = normalizeWorkspaceQuery(query);
  const validCategories = new Set(categories.map(({ id }) => id));
  const selectedCategory = validCategories.has(categoryId) ? categoryId : 'all';
  const matches = items.filter((workspace) => {
    if (selectedCategory !== 'all' && workspace.categoryId !== selectedCategory) return false;
    if (!normalizedQuery) return true;
    const searchable = [
      workspace.name,
      workspace.purpose,
      workspace.categoryId,
      ...workspace.inputs,
      ...workspace.outputs
    ].join(' ');
    return normalizeWorkspaceQuery(searchable).includes(normalizedQuery);
  });
  return matches.sort((left, right) => Number(Boolean(right.featured)) - Number(Boolean(left.featured)));
}

export function isWorkspacePackageReady(workspace) {
  if (workspace?.status !== 'available') return false;
  const distribution = workspace.distribution;
  const compatibility = workspace.compatibility;
  if (!distribution || !compatibility) return false;
  if (!workspace.version?.trim() || !workspace.author?.trim()) return false;
  if (!compatibility.minimumTacWorkVersion?.trim() || !Array.isArray(compatibility.supportedSystems) || !compatibility.supportedSystems.length) return false;
  if (distribution.format !== 'tacwork-workspace' || !Number.isInteger(distribution.sizeBytes) || distribution.sizeBytes <= 0) return false;
  if (!/^[a-f\d]{64}$/i.test(distribution.sha256 || '')) return false;
  try {
    const packageUrl = new URL(distribution.packageUrl);
    return packageUrl.protocol === 'https:' && !packageUrl.username && !packageUrl.password;
  } catch {
    return false;
  }
}

export function getWorkspaceStatusPresentation(workspace, statuses) {
  const status = statuses[workspace?.status] || { label: 'Status not declared', importLabel: 'Import unavailable' };
  const packageReady = isWorkspacePackageReady(workspace);
  const packageMetadataMissing = workspace?.status === 'available' && !packageReady;
  return {
    label: packageMetadataMissing ? (status.incompleteLabel || 'Package details incomplete') : status.label,
    importLabel: packageMetadataMissing
      ? (status.incompleteImportLabel || 'Import unavailable')
      : packageReady
        ? 'Import is not implemented in this prototype'
        : status.importLabel,
    detailNotice: status.detailNotice || `${status.label}. No executable workspace package is provided in this prototype.`
  };
}

export function parseWorkspaceLocation(href, { categories, workspaces }) {
  const validCategories = new Set(categories.map(({ id }) => id));
  const validWorkspaceIds = new Set(workspaces.map(({ id }) => id));
  const notices = [];
  let url;

  try {
    url = new URL(href, 'http://localhost');
  } catch {
    url = new URL('http://localhost/');
    notices.push('invalid-url');
  }

  const queryValues = url.searchParams.getAll('q');
  const query = cleanWorkspaceQuery(queryValues[0] || '');
  if (queryValues.length > 1 || (queryValues[0] || '') !== query || /%(?![a-f\d]{2})/i.test(url.search)) notices.push('query-adjusted');

  const categoryValues = url.searchParams.getAll('category');
  const rawCategoryId = categoryValues[0] || 'all';
  const categoryId = validCategories.has(rawCategoryId) ? rawCategoryId : 'all';
  if ((categoryValues.length && !validCategories.has(rawCategoryId)) || categoryValues.length > 1) {
    notices.push('category-reset');
  }

  let workspaceId;
  let clearHash = false;
  const hashMatch = url.hash.match(/^#workspace\/(.*)$/);
  if (hashMatch || url.hash === '#workspace') {
    let decodedId = '';
    try {
      decodedId = hashMatch ? decodeURIComponent(hashMatch[1]) : '';
    } catch {
      decodedId = '';
    }
    if (validWorkspaceIds.has(decodedId)) workspaceId = decodedId;
    else {
      workspaceId = null;
      clearHash = true;
      notices.push('workspace-not-found');
    }
  }

  return { query, categoryId, workspaceId, clearHash, notices };
}

export function buildWorkspaceHref(currentHref, { query = '', categoryId = 'all', workspaceId } = {}) {
  const url = new URL(currentHref, 'http://localhost');
  const cleanQuery = cleanWorkspaceQuery(query);
  url.searchParams.delete('q');
  url.searchParams.delete('category');
  if (cleanQuery) url.searchParams.set('q', cleanQuery);
  if (categoryId && categoryId !== 'all') url.searchParams.set('category', categoryId);
  if (workspaceId === null) url.hash = '';
  else if (workspaceId !== undefined) url.hash = `workspace/${encodeURIComponent(workspaceId)}`;
  return `${url.pathname}${url.search}${url.hash}`;
}
