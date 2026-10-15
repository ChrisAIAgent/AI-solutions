import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { parse } from 'parse5';
import { sitePages } from '../site-pages.js';
import { content } from '../src/data/tac-home-content.js';
import { skills as fallbackSkills } from '../src/data/tac-skills.js';
import { buildHomepageKnowledge } from '../src/data/tac-assistant-knowledge.js';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUTPUT = 'server/generated/tac-site-knowledge.json';
const OMIT = new Set(['script', 'style', 'nav', 'header', 'footer', 'form', 'button', 'input', 'select', 'textarea', 'svg', 'canvas', 'template', 'noscript']);
const BLOCK = new Set(['section', 'article', 'div', 'p', 'h1', 'h2', 'h3', 'h4', 'li', 'dt', 'dd', 'figcaption', 'tr', 'br']);
const aliases = {
  'tacwork-download': ['TACWork', 'download', 'installer', '下载', '安装', '桌面应用', '版本'],
  'tac-harness': ['TAC Harness', 'harness', '工作台', '插件化'],
  'tac-cli': ['TAC CLI', 'cli', '命令行'],
  'tac-plugins': ['plugins', 'plugin', '插件', '多模态'],
  skills: ['skills', 'skill', '技能', '技能市场'],
  'tac-assistant-assets': ['Asset Lab', 'assistant', '机器人', '素材', '动画', '表情'],
  'marketing-library': ['marketing', '营销素材库', '素材库'],
  'brand-guidelines': ['brand', '品牌', '品牌指南', '配色', '字体'],
  'ai-models': ['models', 'MaaS', '模型', '模型服务']
};
const attr = (node, name) => node.attrs?.find((item) => item.name === name)?.value;
const readJson = (path) => JSON.parse(readFileSync(path, 'utf8').replace(/^\uFEFF/, ''));
const omitted = (node) => OMIT.has(node.tagName) || attr(node, 'hidden') !== undefined || attr(node, 'aria-hidden') === 'true'
  || attr(node, 'data-knowledge-exclude') !== undefined || /display\s*:\s*none|visibility\s*:\s*hidden/i.test(attr(node, 'style') || '');
function find(node, predicate) {
  if (omitted(node)) return undefined;
  if (predicate(node)) return node;
  for (const child of node.childNodes || []) {
    const result = find(child, predicate);
    if (result) return result;
  }
}
export function visibleText(node) {
  if (!node || omitted(node)) return '';
  if (node.nodeName === '#text') return node.value;
  const text = (node.childNodes || []).map(visibleText).join('');
  return BLOCK.has(node.tagName) ? `\n${text}\n` : text;
}
function chunks(text, limit = 1500) {
  const result = [];
  let current = '';
  for (const line of text.split('\n').map((value) => value.replace(/\s+/g, ' ').trim()).filter(Boolean)) {
    if (current.length + line.length > limit && current) { result.push(current); current = ''; }
    // Bound exceptionally long paragraphs without truncating the rest of the page.
    for (let offset = 0; offset < line.length; offset += limit) {
      const part = line.slice(offset, offset + limit);
      if (offset) { result.push(current); current = ''; }
      current += `${current ? '\n' : ''}${part}`;
    }
  }
  if (current) result.push(current);
  return result;
}

export function extractPage(html, sourceFile) {
  const tree = parse(html);
  const main = find(tree, (node) => node.tagName === 'main');
  if (!main) throw new Error(`Published page has no main content: ${sourceFile}`);
  const titleNode = find(tree, (node) => node.tagName === 'title');
  const pageTitle = visibleText(titleNode).trim();
  const slug = sourceFile.replace(/\.html$/, '').split('/').at(-1);
  const href = `/${sourceFile}`;
  const documents = [];
  const sections = (main.childNodes || []).filter((node) => node.tagName === 'section');
  const groups = sections.length ? [
    { childNodes: main.childNodes.filter((node) => node.tagName !== 'section') }, ...sections
  ] : [main];
  for (const [groupIndex, group] of groups.entries()) {
    const heading = find(group, (node) => /^h[1-3]$/.test(node.tagName));
    const title = visibleText(heading).replace(/\s+/g, ' ').trim() || pageTitle;
    const anchor = attr(group, 'id') || attr(heading || {}, 'id');
    chunks(visibleText(group)).forEach((text, index) => {
      if (text.length < 35) return;
      documents.push({ id: `${slug}-${groupIndex}-${index}`, section: slug, pageTitle, title, text,
        keywords: aliases[slug] || [], href: `${href}${anchor ? `#${encodeURIComponent(anchor)}` : ''}`, sourceFile });
    });
  }
  return { pageTitle, href, documents };
}

export function buildSiteIndex(root = ROOT) {
  const documents = buildHomepageKnowledge(content).map((item) => ({ ...item,
    href: `/index.html${item.href}`, pageTitle: 'TAC AI Platform', sourceFile: 'src/data/tac-home-content.js' }));
  const pages = [{ href: '/index.html', title: 'TAC AI Platform' }];
  const add = (id, page, title, text, keywords, sourceFile, anchor = '') => {
    documents.push({ id, section: page, pageTitle: pages.find((item) => item.href === `/pages/${page}.html`)?.title || page,
      title, text, keywords, href: `/pages/${page}.html${anchor}`, sourceFile });
  };
  for (const sourceFile of Object.values(sitePages).filter((file) => file !== 'index.html')) {
    const page = extractPage(readFileSync(resolve(root, sourceFile), 'utf8'), sourceFile);
    pages.push({ href: page.href, title: page.pageTitle });
    documents.push(...page.documents);
  }

  const pluginFile = 'src/data/tac-plugins.json';
  const plugins = readJson(resolve(root, pluginFile)).plugins;
  add('plugin-directory-overview', 'tac-plugins', 'Plugin directory catalog',
    `The directory lists ${plugins.length} community Visual & Multimodal plugins. These are catalog listings with original repository links, not a guarantee of TAC-built integrations. Listed plugins: ${plugins.map((plugin) => plugin.name).join('; ')}.`,
    ['plugin', 'plugins', 'directory', 'catalog', '插件', '插件目录'], pluginFile);
  plugins.forEach((plugin, index) => add(`plugin-${index}`, 'tac-plugins', plugin.name,
    `${plugin.description} Author: ${plugin.owner}. npm package: ${plugin.package || 'not listed'}. Community repository: ${plugin.repository}.`,
    [plugin.name, plugin.package, 'plugin', '插件'].filter(Boolean), pluginFile));

  const manifestFile = 'public/skill-artifacts/MANIFEST.json';
  const manifest = existsSync(resolve(root, manifestFile)) ? readJson(resolve(root, manifestFile)) : {};
  const hostedSkills = (manifest.skills || []).filter((skill) => skill?.id && skill.name && typeof skill.artifactUrl === 'string' && skill.artifactUrl.startsWith('/skill-artifacts/'));
  const skills = hostedSkills.length ? hostedSkills : fallbackSkills;
  const skillFile = hostedSkills.length ? manifestFile : 'src/data/tac-skills.js';
  add('skill-directory-overview', 'skills', 'Skill Marketplace catalog',
    `The marketplace lists ${skills.length} skills. Categories: ${[...new Set(skills.map((skill) => skill.category))].join(', ')}. Listed skills: ${skills.map((skill) => skill.name).join('; ')}. Community authors and source repositories are identified on the page.`,
    ['skills', 'skill', 'catalog', '技能', '技能市场'], skillFile);
  skills.forEach((skill) => add(`skill-${skill.id}`, 'skills', skill.name,
    `${skill.description} Category: ${skill.category}. Author: ${skill.author}. License: ${skill.license || 'See source repository'}. ${skill.artifactUrl ? 'TAC-hosted ZIP download available.' : 'Source repository listing only.'} Source: ${skill.sourceUrl || skill.sourceRepo}.`,
    [skill.name, skill.category, ...(skill.tags || []), 'skill', '技能'], skillFile));

  const download = content.download;
  add('tacwork-release', 'tacwork-download', 'TACWork release and download availability',
    `Product: ${download.product}. Version: ${download.version}. Platform: ${download.platform}. File: ${download.fileName}. Size: ${download.fileSize}. Availability: ${download.available ? 'Public download available' : 'Internal preview; an access key is required. Public download is not enabled'}.`,
    aliases['tacwork-download'], 'src/data/tac-home-content.js');

  const assetFile = 'public/assets/tac/assistant/assistant-asset-manifest.json';
  const assets = readJson(resolve(root, assetFile));
  add('assistant-asset-inventory', 'tac-assistant-assets', 'Mascot views and expressions',
    `Views: ${assets.views.map((view) => view.alt).join('; ')}. Expressions: ${assets.expressions.map((expression) => expression.label).join('; ')}. Canvas: ${assets.validation.canvas}. Transparency: ${assets.validation.alpha}. Supported display sizes: 64, 48, 32, 24px.`,
    ['assistant', 'mascot', 'expression', 'expressions', '素材', '机器人', '表情', '视角'], assetFile, '#expressions-title');

  const motionFile = 'public/assets/tac/assistant/assistant-motion-rules.json';
  const motion = readJson(resolve(root, motionFile));
  for (const [id, state] of Object.entries(motion.states)) {
    add(`assistant-motion-${id}`, 'tac-assistant-assets', `Assistant animation: ${id}`,
      `State: ${id}. Trigger: ${state.trigger}. Duration: ${state.durationMs}ms. Playback: ${state.loop ? 'loop' : 'once'}. Next state: ${state.next}. Motion: ${state.motion}. Reduced motion uses a static image and short fade; loops are disabled.`,
      ['assistant', 'animation', 'motion', '动画', '机器人', id], motionFile, '#rules-title');
  }
  for (const page of pages) {
    page.documentCount = documents.filter((item) => item.href.split('#')[0] === page.href).length;
    if (!page.documentCount) throw new Error(`Published page has no indexed passages: ${page.href}`);
  }
  const revision = createHash('sha256').update(JSON.stringify(documents)).digest('hex').slice(0, 16);
  return { schemaVersion: 1, revision, pages, documents };
}

export function writeSiteIndex(root = ROOT) {
  const index = buildSiteIndex(root);
  const target = resolve(root, OUTPUT);
  const serialized = `${JSON.stringify(index, null, 2)}\n`;
  mkdirSync(dirname(target), { recursive: true });
  if (!existsSync(target) || readFileSync(target, 'utf8') !== serialized) writeFileSync(target, serialized);
  console.log(`[TAC knowledge] ${index.pages.length} pages, ${index.documents.length} passages, revision ${index.revision}`);
  return index;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) writeSiteIndex();
