import { retrieveRelevantHomepageKnowledge } from '../src/data/tac-assistant-knowledge.js';

const stopWords = new Set('a an the is are was be to of in on at for with and or can do does how what which who where when me you your i it its this that about tell please use available tac ai support supported supports 有哪些 什么 怎么 如何 是否 可以 请问 关于 介绍 支持'.split(' '));
const synonymGroups = [
  ['industry', 'industries', 'sector', 'sectors', '行业'],
  ['banking', 'finance', '银行', '金融'], ['healthcare', '医疗', '健康'],
  ['retail', 'commerce', '零售', '电商'], ['telecom', '电信'], ['media', '媒体'],
  ['business', 'enterprise', '企业'], ['hr', '人力', '人事'], ['legal', '法务'],
  ['plugin', 'plugins', '插件'], ['skill', 'skills', '技能'],
  ['download', 'downloads', 'installer', '下载', '安装'],
  ['version', 'release', '版本'], ['cli', '命令行'],
  ['harness', '工作台'], ['workspace', '工作空间'],
  ['platform', '平台'], ['workflow', 'workflows', '工作流'],
  ['capabilities', 'capability', '功能', '能力'],
  ['brand', '品牌'], ['typography', 'font', '字体'], ['palette', 'color', '配色', '颜色'],
  ['model', 'models', '模型'], ['marketing', '营销'],
  ['assistant', '机器人', '助手'], ['animation', 'motion', '动画'], ['expression', 'expressions', '表情'],
  ['asset', 'assets', '素材'], ['license', '许可', '许可证'], ['category', 'categories', '分类'],
  ['image', 'images', 'vision', '图片', '图像', '视觉'], ['video', 'videos', '视频'], ['audio', '语音', '音频'],
  ['presentation', 'presentations', 'slides', 'pptx', '幻灯片', '演示文稿'],
  ['spreadsheet', 'xlsx', '表格'], ['document', 'docx', '文档'], ['generate', 'generation', '生成']
];
const normalize = (value) => String(value || '').normalize('NFKC').toLowerCase();
function tokens(value) {
  const text = normalize(value);
  const latin = text.match(/[a-z0-9]+(?:[-_.+#][a-z0-9]+)*/g) || [];
  const han = text.match(/[\u3400-\u9fff]+/g) || [];
  return [...latin.flatMap((term) => [term, ...term.split(/[-_.+#]/)]), ...han.flatMap((phrase) =>
    phrase.length === 1 ? [] : [phrase, ...Array.from({ length: phrase.length - 1 }, (_, i) => phrase.slice(i, i + 2))])]
    .filter((term) => term.length > 1 && !stopWords.has(term));
}
function queryTokens(query) {
  const terms = new Map(tokens(query).map((term) => [term, 1]));
  const normalized = normalize(query);
  for (const group of synonymGroups) {
    if (!group.some((term) => /[\u3400-\u9fff]/.test(term) ? normalized.includes(term) : terms.has(term))) continue;
    for (const term of group.flatMap(tokens)) if (!terms.has(term)) terms.set(term, 0.55);
  }
  return terms;
}

// Small, deployment-local BM25 index. No embeddings, external crawl, or database.
export function createSiteRetriever(documents) {
  const corpus = documents.map((item) => {
    const body = tokens(item.text);
    const frequencies = new Map();
    for (const token of body) frequencies.set(token, (frequencies.get(token) || 0) + 1);
    return { item, frequencies, length: body.length, title: new Set(tokens(item.title)), keywords: new Set(tokens((item.keywords || []).join(' '))) };
  });
  const frequency = new Map();
  for (const record of corpus) for (const term of new Set([...record.frequencies.keys(), ...record.title, ...record.keywords])) {
    frequency.set(term, (frequency.get(term) || 0) + 1);
  }
  const averageLength = corpus.reduce((total, record) => total + record.length, 0) / Math.max(1, corpus.length) || 1;
  const homepage = documents.filter((item) => item.sourceFile === 'src/data/tac-home-content.js' && item.href.startsWith('/index.html'));

  return function retrieve(query, limit = 5) {
    const normalized = normalize(query);
    const productSpecific = /tacwork|harness|\bcli\b|plugins?|skills?|asset|机器人|素材|技能|插件|下载|品牌|模型/.test(normalized);
    if (!productSpecific && /industr(?:y|ies)|sectors?|行业/.test(normalized)) {
      return retrieveRelevantHomepageKnowledge(query, homepage);
    }
    if (!productSpecific && /what (?:can|does|is) tac\b|tac.*(?:能做什么|是什么|介绍)|^(?:介绍|了解).*tac|capabilities|overview/.test(normalized)) {
      return retrieveRelevantHomepageKnowledge('What can TAC do?', homepage);
    }
    const terms = queryTokens(query);
    const focusedPages = [];
    if (/\btacwork\b/.test(normalized)) focusedPages.push('tacwork-download');
    if (/\btac\s+cli\b/.test(normalized)) focusedPages.push('tac-cli');
    if (/\btac\s+harness\b|^harness\b/.test(normalized)) focusedPages.push('tac-harness');
    if (focusedPages.length && /plugins?|插件/.test(normalized)) focusedPages.push('tac-plugins');
    if (focusedPages.length && /skills?|技能/.test(normalized)) focusedPages.push('skills');
    const pool = focusedPages.length ? corpus.filter(({ item }) => focusedPages.includes(item.section)) : corpus;
    const ranked = pool.map((record) => {
      let score = 0;
      for (const [term, weight] of terms) {
        const df = frequency.get(term) || 0;
        if (!df) continue;
        const idf = Math.log(1 + (corpus.length - df + 0.5) / (df + 0.5));
        const tf = record.frequencies.get(term) || 0;
        const bm25 = tf * 2.2 / (tf + 1.2 * (0.25 + 0.75 * record.length / averageLength));
        score += weight * idf * (bm25 + (record.title.has(term) ? 3 : 0) + (record.keywords.has(term) ? 1.5 : 0));
      }
      return { item: record.item, score };
    }).filter(({ score }) => score >= 2).sort((a, b) => b.score - a.score);
    const broadCatalog = /^(?:(?:what|which|list|all|available|are|the|can|i|use|tac|harness|plugins?|skills?|does|have|offer|directory|catalog|marketplace)\b[\s?,.!]*)+$/i.test(normalized)
      || /^(?:tac|harness|的|平台|网站|有哪些|什么|有|可用|提供|支持|列出|全部|请问|？|\?|\s|插件|技能|目录|市场)+$/i.test(normalized);
    const requiredIds = [];
    if (broadCatalog && /skills?|技能/.test(normalized)) requiredIds.push('skill-directory-overview');
    if (broadCatalog && /plugins?|插件/.test(normalized)) requiredIds.push('plugin-directory-overview');
    if (/\btacwork\b/.test(normalized)) requiredIds.push('tacwork-release');
    if (focusedPages.length > 1) {
      for (const page of focusedPages) {
        const best = ranked.find(({ item }) => item.section === page);
        if (best) requiredIds.push(best.item.id);
      }
    }
    const required = requiredIds.flatMap((id) => {
      const item = documents.find((document) => document.id === id);
      return item ? [{ item, score: ranked[0]?.score || 20 }] : [];
    });
    const seenText = new Set();
    return [...required, ...ranked.filter(({ score }) => score >= (ranked[0]?.score || 0) * 0.25)].filter(({ item }) => {
      if (seenText.has(item.text)) return false;
      seenText.add(item.text);
      return true;
    }).slice(0, limit);
  };
}

export function knowledgeContext(matches, budget = 9000) {
  const selected = [];
  let context = '';
  for (const match of matches) {
    const { item } = match;
    const excerpt = `Source ID: ${item.id}\nSource: ${item.pageTitle} (${item.href})\n${item.title}: ${item.text}\n`;
    if (context.length + excerpt.length > budget) continue;
    context += excerpt;
    selected.push(match);
  }
  return { context, matches: selected };
}
