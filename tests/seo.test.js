import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { parse } from 'parse5';
import { seoPages, origin, pagePath, renderSeoHtml, seoPlugin } from '../scripts/seo-build.js';
import { workspaces } from '../src/data/tac-workspaces.js';
import { sitePages } from '../site-pages.js';
function nodes(html, predicate) {
  const result = []; const walk = n => { if (predicate(n)) result.push(n); (n.childNodes || []).forEach(walk); }; walk(parse(html)); return result;
}
const attr = (n,k) => n.attrs?.find(a=>a.name===k)?.value;
test('SEO policy covers every published page with unique titles and canonical URLs', () => {
  assert.deepEqual(Object.keys(seoPages).sort(), Object.values(sitePages).sort());
  const titles = new Set();
  for (const [file, [title,description,index]] of Object.entries(seoPages)) {
    const html = renderSeoHtml(readFileSync(file, 'utf8'), file);
    assert.ok(!titles.has(title)); titles.add(title); assert.ok(description.length > 20);
    assert.equal(nodes(html,n=>n.tagName==='title').length,1);
    assert.equal(nodes(html,n=>attr(n,'name')==='description').length,1);
    assert.equal(nodes(html,n=>attr(n,'rel')==='canonical').map(n=>attr(n,'href'))[0], origin+pagePath(file));
    assert.equal(nodes(html,n=>attr(n,'name')==='robots').map(n=>attr(n,'content'))[0], index?'index,follow':'noindex,follow');
    for(const node of nodes(html,n=>n.tagName==='a')) assert.ok(!/^\/?(?:\.\.\/|\.\/)?(?:pages\/)?[^?#]*\.html(?:[?#]|$)/.test(attr(node,'href')||''), `${file}: ${attr(node,'href')}`);
    assert.equal(nodes(html,n=>n.tagName==='html').map(n=>attr(n,'lang'))[0],'en');
  }
});
test('home and directories contain real HTML before JavaScript runs', () => {
  for(const [file, marker, minimum] of [['index.html','tac-application-card',6],['pages/skills.html','tac-skill-card',10],['pages/tac-plugins.html','tac-plugin-card',10],['pages/tac-workspaces.html','tw-card',workspaces.length]]) {
    const html=renderSeoHtml(readFileSync(file,'utf8'),file);
    assert.ok(nodes(html,n=>(attr(n,'class')||'').split(' ').includes(marker)).length>=minimum,file);
    assert.equal(nodes(html,n=>n.tagName==='h1').length,1,file);
    if(file==='index.html') {
      assert.ok(html.includes('solo founders')); assert.ok(html.includes('data-static-home'));
      const schema=nodes(html,n=>attr(n,'type')==='application/ld+json')[0];
      assert.equal(JSON.parse(schema.childNodes[0].value)['@graph'].length,2);
    }
  }
});
test('sitemap includes only indexable canonical pages and robots allows noindex discovery', () => {
  const emitted=[]; seoPlugin().generateBundle.call({emitFile:f=>emitted.push(f)});
  const sitemap=emitted.find(f=>f.fileName==='sitemap.xml').source;
  for(const [file,config] of Object.entries(seoPages)) assert.equal(sitemap.includes(`<loc>${origin}${pagePath(file)}</loc>`),config[2]);
  assert.ok(!sitemap.includes('.html')); assert.ok(!sitemap.includes('<lastmod>'));
  assert.ok(emitted.find(f=>f.fileName==='robots.txt').source.includes('Allow: /'));
  assert.ok(existsSync('public/404.html'));
});

test('same-document fragments preserve homepage scrolling and product navigation', () => {
  const html = renderSeoHtml(readFileSync('index.html', 'utf8'), 'index.html');
  const hrefs = nodes(html, n => n.tagName === 'a').map(n => attr(n, 'href'));
  for (const fragment of ['#contact', '#platform', '#Application-Accelerators', '#top']) assert.ok(hrefs.includes(fragment), fragment);
  assert.ok(!hrefs.includes('/#contact'));
  assert.ok(hrefs.includes('/pages/skills'));
});
