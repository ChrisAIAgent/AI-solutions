import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { parse } from 'parse5';
import { sitePages } from '../site-pages.js';
import { buildSiteIndex, extractPage } from '../scripts/build-assistant-index.js';
import { createSiteRetriever, knowledgeContext } from '../server/tac-site-retrieval.js';
import index from '../server/generated/tac-site-knowledge.json' with { type: 'json' };
import worker from '../worker.js';

const search = createSiteRetriever(index.documents);

test('generated index covers exactly the published pages and matches current sources', () => {
  assert.deepEqual(index, buildSiteIndex());
  assert.deepEqual(index.pages.map((page) => page.href).sort(), Object.values(sitePages).map((file) => `/${file}`).sort());
  assert.ok(index.pages.every((page) => page.documentCount > 0));
  assert.equal(new Set(index.documents.map((item) => item.id)).size, index.documents.length);
  for (const item of index.documents) {
    assert.ok(existsSync(item.sourceFile), item.sourceFile);
    const [path, anchor] = item.href.split('#');
    assert.ok(index.pages.some((page) => page.href === path), item.href);
    if (anchor) {
      const tree = parse(readFileSync(path.slice(1), 'utf8'));
      const containsId = (node) => node.attrs?.some((attr) => attr.name === 'id' && attr.value === decodeURIComponent(anchor)) || node.childNodes?.some(containsId);
      assert.ok(containsId(tree), item.href);
    }
  }
});

test('extraction includes readable main text and excludes controls, hidden content and code', () => {
  const page = extractPage('<html><head><title>Example</title></head><body><nav>NAV_ONLY</nav><main><section id="facts"><h2>Public facts</h2><p>Windows &amp; Linux are mentioned in this sample public paragraph.</p><form>KEY_CONTROL</form><button>BUTTON_ONLY</button><p hidden>HIDDEN_ONLY</p><div aria-hidden="true">ARIA_ONLY</div><p style="display: none">STYLE_ONLY</p><script>SECRET_CODE</script><template>TEMPLATE_ONLY</template></section></main><footer>FOOTER_ONLY</footer></body></html>', 'pages/example.html');
  const text = page.documents.map((item) => item.text).join('\n');
  assert.ok(text.includes('Windows & Linux'));
  assert.ok(!/NAV_ONLY|KEY_CONTROL|BUTTON_ONLY|HIDDEN_ONLY|ARIA_ONLY|STYLE_ONLY|SECRET_CODE|TEMPLATE_ONLY|FOOTER_ONLY/.test(text));
  assert.equal(page.documents[0].href, '/pages/example.html#facts');
});

test('index uses the actual hosted skill manifest and plugin catalog without access key fields', () => {
  const manifest = JSON.parse(readFileSync('public/skill-artifacts/MANIFEST.json', 'utf8').replace(/^\uFEFF/, ''));
  const skills = manifest.skills.filter((skill) => skill.id && skill.name && skill.artifactUrl?.startsWith('/skill-artifacts/'));
  const plugins = JSON.parse(readFileSync('src/data/tac-plugins.json', 'utf8')).plugins;
  assert.equal(index.documents.filter((item) => item.id.startsWith('skill-') && item.id !== 'skill-directory-overview').length, skills.length);
  assert.equal(index.documents.filter((item) => /^plugin-\d+$/.test(item.id)).length, plugins.length);
  for (const skill of skills) assert.ok(index.documents.some((item) => item.id === `skill-${skill.id}` && item.text.includes(skill.description)));
  assert.ok(!JSON.stringify(index).includes('activationKey'));
});

test('English and Chinese secondary-page questions retrieve the relevant evidence', () => {
  const cases = [
    ['How do I download TACWork?', 'tacwork-release'], ['TACWork怎么下载？', 'tacwork-release'],
    ['What is TAC Harness?', 'tac-harness-1-0'], ['TAC CLI什么时候发布？', 'tac-cli-0-0'],
    ['What skills are available?', 'skill-directory-overview'], ['有哪些技能？', 'skill-directory-overview'],
    ['What plugins are available?', 'plugin-directory-overview'], ['有哪些插件？', 'plugin-directory-overview'],
    ['Prisma PostgreSQL Setup', 'skill-prisma-postgres-setup'], ['品牌字体是什么？', 'brand-guidelines-0-0']
  ];
  for (const [question, id] of cases) assert.equal(search(question)[0]?.item.id, id, question);
  assert.ok(search('TAC机器人有哪些表情？').some(({ item }) => item.id === 'assistant-asset-inventory'));
  assert.ok(search('TAC CLI什么时候发布？').every(({ item }) => item.section === 'tac-cli'));
  const comparison = search('Compare TACWork and TAC Harness');
  assert.ok(comparison.some(({ item }) => item.section === 'tacwork-download'));
  assert.ok(comparison.some(({ item }) => item.section === 'tac-harness'));
  assert.equal(search('What is the weather in Tokyo?').length, 0);
  assert.equal(search('怎样制作宫保鸡丁？').length, 0);
});

test('context budget keeps complete passages and only lists sources actually supplied', () => {
  const matches = search('What plugins are available?');
  const result = knowledgeContext(matches, 9000);
  assert.ok(result.context.length <= 9000);
  assert.ok(result.matches.length);
  for (const { item } of result.matches) assert.ok(result.context.includes(item.text) && result.context.includes(item.href));
  const tiny = knowledgeContext(matches, 1);
  assert.equal(tiny.context, '');
  assert.deepEqual(tiny.matches, []);
});

test('Worker supplies real secondary-page context, release restrictions and page source links', async () => {
  const originalFetch = globalThis.fetch;
  try {
    for (const [question, expected, path] of [
      ['TACWork怎么下载？', 'Internal preview; an access key is required', '/pages/tacwork-download.html'],
      ['When will TAC CLI launch?', 'There is no public download or release date', '/pages/tac-cli.html'],
      ['Show TAC Harness demos', 'Creator mode', '/pages/tac-harness.html']
    ]) {
      let called = false;
      globalThis.fetch = async (_, options) => {
        called = true;
        const payload = JSON.parse(options.body);
        const prompt = payload.messages[0].content;
        assert.ok(prompt.includes(expected), question);
        assert.ok(prompt.includes(path), question);
        return Response.json({ choices: [{ message: { content: 'A supported answer from the supplied page.' } }] });
      };
      const response = await worker.fetch(new Request('https://example.com/api/assistant/chat', {
        method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ question })
      }), { ASSISTANT_API_KEY: 'test-key' });
      const body = await response.json();
      assert.equal(response.status, 200);
      assert.equal(body.state, 'complete');
      assert.ok(called, question);
      assert.ok(body.sources.some((source) => source.href.startsWith(path)), question);
    }
  } finally { globalThis.fetch = originalFetch; }
});
