import { parse, parseFragment, serialize } from 'parse5';
import { readFileSync } from 'node:fs';
import { sitePages } from '../site-pages.js';
import { createHomeRenderer } from '../src/js/tac-home-render.js';
import { renderCard as skillCard } from '../src/js/tac-skills-render.js';
import { renderCard as pluginCard } from '../src/js/tac-plugins-render.js';
import { renderWorkspaceCard } from '../src/js/tac-workspaces-render.js';
const { plugins } = JSON.parse(readFileSync(new URL('../src/data/tac-plugins.json', import.meta.url), 'utf8'));
import { workspaces } from '../src/data/tac-workspaces.js';

export const origin = 'https://aisolution.worldtoolx.com';
export const seoPages = {
  'index.html': ['AI Workspaces & Agent Workflows | TAC AI', 'Explore TACWork, AI agent tools and business workflows for individuals, teams, businesses and solo founders. Find the right starting point for useful AI work.', true],
  'pages/tacwork-download.html': ['Download TACWork for Windows | TAC AI', 'Download TACWork for Windows x64. Explore a shared AI workspace for individual work, small teams and business workflows.', true],
  'pages/tac-harness.html': ['TAC Harness: AI Agents & Plugins | TAC AI', 'Explore TAC Harness, a desktop workspace bringing AI agents and composable plugins together for useful workflows.', true],
  'pages/tac-workspaces.html': ['TACWork Workspace Concepts & Workflows | TAC AI', 'Explore business workspace concepts, example inputs and illustrative outputs for TACWork. These concepts are not downloadable workspace packages.', true],
  'pages/skills.html': ['AI Skills Directory for TACWork | TAC AI', 'Browse community AI skills, inspect source repositories and explore versioned packages for local import in TACWork.', true],
  'pages/tac-plugins.html': ['AI Agent Plugin Directory for TAC Harness | TAC AI', 'Explore visual and multimodal plugins for TAC Harness. Search public projects and inspect their original GitHub repositories.', true],
  'pages/contact-us.html': ['Contact TAC: Products, Demos & Partnerships | TAC AI', 'Contact TAC about AI products, team workflows, business solutions, demos and partnerships.', true],
  'pages/tac-cli.html': ['TAC CLI: Coming Soon | TAC AI', 'TAC CLI is in development. Explore currently available TAC products and contact the team for enquiries.', false],
  'pages/tac-assistant-assets.html': ['Assistant Asset Lab | TAC AI', 'Preview TAC AI assistant mascot and motion assets.', false],
  'pages/marketing-library.html': ['Marketing Asset Library | TAC AI', 'Explore the TAC marketing asset library.', false],
  'pages/brand-guidelines.html': ['Brand Guidelines | TAC AI', 'TAC brand identity and marketing guidelines.', false],
  'pages/ai-models.html': ['AI Model Resources | TAC AI', 'AI model and MaaS marketing resources.', false]
};
export const pagePath = file => file === 'index.html' ? '/' : '/' + file.replace(/\.html$/, '');
const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function find(node, predicate) {
  if (predicate(node)) return node;
  for (const child of node.childNodes || []) { const result = find(child, predicate); if (result) return result; }
}
const attr = (node, name) => node.attrs?.find(a => a.name === name)?.value;
function adapter(tree) {
  return { querySelector(selector) {
    const node = find(tree, n => selector.startsWith('#') ? attr(n, 'id') === selector.slice(1) : selector.startsWith('.') ? (attr(n, 'class') || '').split(/\s+/).includes(selector.slice(1)) : n.tagName === selector);
    if (!node) throw new Error(`Static render target missing: ${selector}`);
    return { set innerHTML(html) { node.childNodes = parseFragment(node, html).childNodes; node.childNodes.forEach(c => c.parentNode = node); } };
  } };
}
function visit(node, fn) { fn(node); (node.childNodes || []).forEach(child => visit(child, fn)); }
export function renderSeoHtml(html, file) {
  const config = seoPages[file];
  if (!config) throw new Error(`Missing SEO configuration: ${file}`);
  const tree = parse(html); const document = adapter(tree);
  if (file === 'index.html') {
    const renderer = createHomeRenderer(document);
    for (const name of ['renderHeader','renderHero','renderTrust','renderApplications','renderCapabilities','renderReports','renderPartners','renderInsights','renderSkillMarketplaceFeature','renderContactAndFooter']) renderer[name]();
    find(tree, n => n.tagName === 'body').attrs.push({ name: 'data-static-home', value: '' });
  }
  let catalogId; let cards;
  if (file === 'pages/skills.html') {
    const manifest = JSON.parse(readFileSync(new URL('../public/skill-artifacts/MANIFEST.json', import.meta.url), 'utf8').replace(/^\uFEFF/, ''));
    const skills = manifest.skills.filter(s => s.id && s.name && s.artifactUrl?.startsWith('/skill-artifacts/'));
    catalogId = 'skillGrid'; cards = skills.map(s => skillCard(s, skills)).join('');
    document.querySelector('#skillResultCount').innerHTML = `${skills.length} skills shown`;
    const body = find(tree, n => n.tagName === 'body');
    const snapshot = parseFragment(`<script id="staticSkillCatalog" type="application/json">${JSON.stringify(skills).replaceAll('<', '\\u003c')}</script><noscript><section aria-label="Skill source repositories"><h2>Explore skill sources</h2>${skills.map(s => `<p><a href="${escape(s.sourceUrl)}">${escape(s.name)} source repository</a></p>`).join('')}</section></noscript>`);
    for (const node of snapshot.childNodes) { node.parentNode = body; body.childNodes.push(node); }
  }
  if (file === 'pages/tac-plugins.html') {
    catalogId = 'pluginGrid'; cards = [...plugins].sort((a,b) => (b.downloads ?? -1) - (a.downloads ?? -1) || `${a.owner}/${a.name}`.localeCompare(`${b.owner}/${b.name}`)).map(pluginCard).join('');
    for (const id of ['pluginTotal', 'pluginHeroTotal']) document.querySelector('#'+id).innerHTML = String(plugins.length);
    document.querySelector('#pluginResultCount').innerHTML = `Showing ${plugins.length} of ${plugins.length} plugins`;
  }
  if (file === 'pages/tac-workspaces.html') {
    catalogId = 'workspaceGrid'; cards = workspaces.map(renderWorkspaceCard).join('');
    document.querySelector('#workspaceResultCount').innerHTML = `Showing ${workspaces.length} of ${workspaces.length} workspaces`;
  }
  if (catalogId) {
    document.querySelector('#'+catalogId).innerHTML = cards;
    find(tree, n => attr(n, 'id') === catalogId).attrs.push({ name: 'data-static-catalog', value: 'true' });
  }
  visit(tree, node => {
    if (node.tagName !== 'a') return;
    const href = node.attrs.find(a => a.name === 'href');
    // Preserve same-document fragments used by the homepage interaction handlers.
    if (!href || href.value.startsWith('#')) return;
    const url = new URL(href.value, origin + '/' + file);
    if (url.origin === origin && (Object.values(sitePages).some(f => '/'+f === url.pathname))) href.value = pagePath(url.pathname.slice(1)) + url.search + url.hash;
  });
  let output = serialize(tree).replace(/<title>[\s\S]*?<\/title>/i, '').replace(/<meta\s+name="description"[^>]*>/gi, '');
  const [title, description, index] = config; const url = origin + pagePath(file); const image = origin + '/assets/tac/industrial-hero.png';
  const metadata = `<title>${escape(title)}</title>
<meta name="description" content="${escape(description)}">
<meta name="robots" content="${index ? 'index,follow' : 'noindex,follow'}">
<link rel="canonical" href="${url}">
<meta property="og:type" content="website"><meta property="og:site_name" content="TAC AI"><meta property="og:locale" content="en_US">
<meta property="og:title" content="${escape(title)}"><meta property="og:description" content="${escape(description)}"><meta property="og:url" content="${url}"><meta property="og:image" content="${image}"><meta property="og:image:alt" content="TAC AI platform illustration">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${escape(title)}"><meta name="twitter:description" content="${escape(description)}"><meta name="twitter:image" content="${image}">`;
  output = output.replace('</head>', (file === 'index.html' ? '<noscript><style>.tac-nav-links{display:flex!important;flex-wrap:wrap;position:static!important}.tac-nav-popover{display:block!important;position:static!important;opacity:1!important;visibility:visible!important;transform:none!important}.tac-menu-toggle{display:none!important}</style></noscript>' : '') + metadata + (file === 'index.html' ? `<script type="application/ld+json">${JSON.stringify({'@context':'https://schema.org','@graph':[{'@type':'Organization','@id':origin+'/#organization',name:'TAC AI',url:origin+'/',logo:origin+'/assets/tac/tac-mark.png'},{'@type':'WebSite','@id':origin+'/#website',name:'TAC AI',url:origin+'/',inLanguage:'en',publisher:{'@id':origin+'/#organization'}}]})}</script>` : '') + '</head>');
  return output;
}
export function seoPlugin() {
  return {
    name: 'tac-static-seo',
    configurePreviewServer(server) {
      server.middlewares.use((request, response, next) => {
        const url = new URL(request.url, origin);
        const file = url.pathname.slice(1);
        if (seoPages[file]) {
          response.writeHead(307, { Location: pagePath(file) + url.search });
          response.end(); return;
        }
        next();
      });
    },
    transformIndexHtml: { order: 'pre', handler(html, context) {
      const file = context.path.replace(/^\//, '') || 'index.html';
      return renderSeoHtml(html, file);
    } },
    generateBundle() {
      this.emitFile({ type: 'asset', fileName: 'robots.txt', source: `User-agent: *\nAllow: /\nSitemap: ${origin}/sitemap.xml\n` });
      const entries = Object.entries(seoPages).filter(([,config]) => config[2]).map(([file]) => `<url><loc>${origin}${pagePath(file)}</loc></url>`).join('');
      this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${entries}</urlset>` });
    }
  };
}
