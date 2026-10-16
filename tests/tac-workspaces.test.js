import test from 'node:test';
import assert from 'node:assert/strict';
import { getWorkspaceById, workspaceCategories, workspaceStatuses, workspaces } from '../src/data/tac-workspaces.js';
import {
  buildWorkspaceHref,
  cleanWorkspaceQuery,
  filterWorkspaces,
  getWorkspaceStatusPresentation,
  isWorkspacePackageReady,
  normalizeWorkspaceQuery,
  parseWorkspaceLocation
} from '../src/js/tac-workspaces-state.js';

const directoryUrl = 'https://tac.example/pages/tac-workspaces.html';
const parse = (href) => parseWorkspaceLocation(href, { categories: workspaceCategories, workspaces });

test('the directory data has five stable concept records with empty distribution metadata', () => {
  assert.equal(workspaces.length, 5);
  assert.equal(new Set(workspaces.map(({ id }) => id)).size, workspaces.length);
  assert.ok(workspaces.every((workspace) => workspace.status === 'concept'));
  assert.ok(workspaces.every((workspace) => workspace.distribution === null));
  assert.ok(workspaces.every((workspace) => workspace.version === null && workspace.author === null && workspace.updatedAt === null));
  assert.ok(workspaces.every((workspace) => workspace.preview?.rows?.length));
  assert.ok(getWorkspaceById('sales-weekly-report'));
  assert.equal(getWorkspaceById('unknown-workspace'), null);
  assert.ok(workspaceStatuses.concept.importLabel);
  for (const workspace of workspaces) {
    assert.deepEqual(getWorkspaceStatusPresentation(workspace, workspaceStatuses), {
      label: 'Concept example',
      importLabel: 'Import not available',
      detailNotice: 'This is a concept example. No executable workspace package is provided, so it cannot be imported.'
    });
  }
});

test('featured workspaces sort to the top once while search and category filter one list', () => {
  const all = filterWorkspaces(workspaces, {}, workspaceCategories);
  assert.equal(all.length, 5);
  assert.deepEqual(all.slice(0, 3).map(({ id }) => id), [
    'sales-weekly-report', 'customer-enquiry-organizer', 'business-content-planner'
  ]);
  assert.equal(new Set(all.map(({ id }) => id)).size, 5);

  const reportSearch = filterWorkspaces(workspaces, { query: 'WEEKLY' }, workspaceCategories);
  assert.deepEqual(reportSearch.map(({ id }) => id), ['sales-weekly-report']);
  const combined = filterWorkspaces(workspaces, { query: 'follow-up', categoryId: 'sales-customer' }, workspaceCategories);
  assert.deepEqual(combined.map(({ id }) => id), ['customer-enquiry-organizer']);
  assert.deepEqual(filterWorkspaces(workspaces, { categoryId: 'missing' }, workspaceCategories).map(({ id }) => id), all.map(({ id }) => id));
  assert.deepEqual(filterWorkspaces(workspaces, { query: 'no-match' }, workspaceCategories), []);
});

test('a URL restores query, category and a known shareable detail hash', () => {
  const state = parse(`${directoryUrl}?q=report&category=business-analysis#workspace/sales-weekly-report`);
  assert.deepEqual(state, {
    query: 'report',
    categoryId: 'business-analysis',
    workspaceId: 'sales-weekly-report',
    clearHash: false,
    notices: []
  });
});

test('URL serialization keeps unrelated query parameters and the current detail hash', () => {
  const filteredHref = buildWorkspaceHref(`${directoryUrl}?utm_source=marketplace&q=old`, {
    query: 'weekly report', categoryId: 'business-analysis', workspaceId: undefined
  });
  const filteredUrl = new URL(filteredHref, directoryUrl);
  assert.equal(filteredUrl.searchParams.get('utm_source'), 'marketplace');
  assert.equal(filteredUrl.searchParams.get('q'), 'weekly report');
  assert.equal(filteredUrl.searchParams.get('category'), 'business-analysis');

  const detailHref = buildWorkspaceHref(filteredUrl.href, {
    query: 'weekly report', categoryId: 'business-analysis', workspaceId: 'sales-weekly-report'
  });
  const detailUrl = new URL(detailHref, directoryUrl);
  assert.equal(detailUrl.hash, '#workspace/sales-weekly-report');
  assert.equal(detailUrl.searchParams.get('q'), 'weekly report');
  assert.equal(detailUrl.searchParams.get('category'), 'business-analysis');

  const closedHref = buildWorkspaceHref(detailUrl.href, {
    query: 'weekly report', categoryId: 'business-analysis', workspaceId: null
  });
  const closedUrl = new URL(closedHref, directoryUrl);
  assert.equal(closedUrl.hash, '');
  assert.equal(closedUrl.searchParams.get('q'), 'weekly report');
  assert.equal(closedUrl.searchParams.get('category'), 'business-analysis');
});

test('invalid categories, unknown IDs and damaged URL values recover with safe defaults', () => {
  const invalidCategory = parse(`${directoryUrl}?q=report&category=not-a-category`);
  assert.equal(invalidCategory.categoryId, 'all');
  assert.equal(invalidCategory.query, 'report');
  assert.ok(invalidCategory.notices.includes('category-reset'));

  const unknownWorkspace = parse(`${directoryUrl}?category=admin-office#workspace/not-a-workspace`);
  assert.equal(unknownWorkspace.workspaceId, null);
  assert.equal(unknownWorkspace.clearHash, true);
  assert.ok(unknownWorkspace.notices.includes('workspace-not-found'));

  const malformedHash = parse(`${directoryUrl}#workspace/%E0%A4%A`);
  assert.equal(malformedHash.workspaceId, null);
  assert.ok(malformedHash.notices.includes('workspace-not-found'));

  const malformedQuery = parse(`${directoryUrl}?q=%E0%A4%A&category=%ZZ`);
  assert.equal(typeof malformedQuery.query, 'string');
  assert.equal(malformedQuery.categoryId, 'all');
  assert.ok(malformedQuery.notices.includes('query-adjusted'));
  assert.ok(malformedQuery.notices.includes('category-reset'));
});

test('queries are safely normalized and capped', () => {
  assert.equal(cleanWorkspaceQuery('  report\n  '), 'report');
  assert.equal(normalizeWorkspaceQuery('  REPORT '), 'report');
  assert.equal(cleanWorkspaceQuery('x'.repeat(200)).length, 120);
});

test('a package URL alone never qualifies for import', () => {
  const withUrlOnly = {
    ...workspaces[0],
    distribution: { packageUrl: 'https://example.com/workspace.zip' }
  };
  const missingStatus = {
    ...withUrlOnly,
    version: '1.0.0',
    author: 'Example author',
    compatibility: { minimumTacWorkVersion: '1.0.0', supportedSystems: ['Windows'] },
    distribution: { ...withUrlOnly.distribution, format: 'tacwork-workspace', sizeBytes: 100, sha256: 'a'.repeat(64) }
  };
  assert.equal(isWorkspacePackageReady(withUrlOnly), false);
  assert.equal(isWorkspacePackageReady(missingStatus), false);
  assert.equal(isWorkspacePackageReady({
    ...missingStatus,
    status: 'available',
    distribution: { ...missingStatus.distribution, packageUrl: 'javascript:alert(1)' }
  }), false);
  assert.equal(isWorkspacePackageReady({
    ...missingStatus,
    status: 'available',
    distribution: { ...missingStatus.distribution, sha256: 'bad-checksum' }
  }), false);
  assert.equal(isWorkspacePackageReady({ ...missingStatus, status: 'available' }), true);
  assert.ok(workspaces.every((workspace) => !isWorkspacePackageReady(workspace)));
  assert.deepEqual(getWorkspaceStatusPresentation({ ...missingStatus, status: 'available', distribution: { packageUrl: 'https://example.com/workspace.zip' } }, workspaceStatuses), {
    label: 'Package details incomplete',
    importLabel: 'Import unavailable',
    detailNotice: 'The package status is marked available, but this prototype does not implement workspace import.'
  });
  assert.equal(getWorkspaceStatusPresentation({ ...missingStatus, status: 'available' }, workspaceStatuses).label, 'Available');
  assert.equal(getWorkspaceStatusPresentation({ ...missingStatus, status: 'available' }, workspaceStatuses).importLabel, 'Import is not implemented in this prototype');
});
