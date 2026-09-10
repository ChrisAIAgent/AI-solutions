const entry = (id, section, title, text, keywords, href) => ({ id, section, title, text, keywords, href });

const industryAliases = {
  banking: ['银行', '金融', 'banking', 'finance'],
  healthcare: ['医疗', '健康', 'healthcare', 'care'],
  retail: ['零售', '电商', 'retail', 'commerce'],
  telecom: ['电信', '媒体', 'telecom', 'media'],
  business: ['企业', 'business', 'hr', 'it', 'legal']
};

const applicationAliases = {
  Banking: ['银行', '金融', 'banking'],
  Healthcare: ['医疗', '健康', 'healthcare'],
  Retail: ['零售', 'retail'],
  IT: ['IT', '工单', 'incident', 'support'],
  HR: ['HR', '人力', 'employee'],
  Recruiting: ['招聘', 'recruiting', 'hiring']
};

export function buildHomepageKnowledge(content) {
  const items = [
    entry('hero', 'hero', content.hero.eyebrow, `${content.hero.title} ${content.hero.lead}`, ['TAC', 'AI', '平台', '智能体', '自动化', 'AI platform'], '#top'),
    entry('solutions', 'solutions', 'AI Solutions', `${content.hero.featureCards.map((card) => `${card.title}: ${card.text}`).join(' ')}`, ['解决方案', 'solutions', '应用', 'enterprise AI'], '#applications'),
    entry('agent-platform', 'platform', 'Agent Platform', 'TAC provides a platform foundation for building dependable agent workflows across enterprise teams and systems.', ['平台', '智能体平台', 'agent platform', 'workflow', '工作流'], '#platform'),
    entry('contact', 'contact', 'Contact TAC', 'Tell TAC what work you want to make clearer, faster, or easier to govern. Start a conversation with TAC.', ['联系', '销售', '演示', '合作', 'contact', 'sales', 'demo'], '#contact')
  ];

  content.industries.forEach((item) => {
    items.push(entry(`industry-${item.id}`, 'industries', item.title, `${item.text} Relevant capabilities: ${item.logos.join(', ')}.`, ['行业', '方案', item.label, ...(industryAliases[item.id] || [])], '#industries'));
  });

  content.applications.forEach((item) => {
    items.push(entry(`application-${item.accent.toLowerCase()}`, 'applications', item.title, item.text, [item.accent, ...(applicationAliases[item.accent] || []), 'AI application'], '#applications'));
  });

  content.accelerators.items.forEach(([title, text]) => {
    items.push(entry(`accelerator-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`, 'accelerators', title, text, ['accelerator', '加速器', '模板', '集成', title], '#applications'));
  });

  content.tailored.forEach((item) => {
    items.push(entry(`tailored-${item.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`, 'tailored', item.title, item.text, ['tailored', '定制', '自定义', item.title], '#applications'));
  });

  content.capabilities.forEach((item) => {
    items.push(entry(`capability-${item.id}`, 'platform', item.label, `${item.headline} ${item.text} Metric: ${item.metric}.`, ['能力', 'capability', item.label, item.metric], '#platform'));
  });

  content.reports.forEach((item) => {
    items.push(entry(`report-${item.id}`, 'reports', item.title, item.text, ['报告', 'insight', '研究', item.label], '#reports'));
  });

  content.partners.forEach((item) => {
    items.push(entry(`partner-${item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`, 'partners', item.name, item.text, ['伙伴', '合作伙伴', 'partner', 'ecosystem'], '#partners'));
  });

  content.insights.forEach((item) => {
    items.push(entry(`insight-${item.date.toLowerCase()}`, 'insights', item.title, item.text, [item.tag, '洞察', 'insight', 'AI'], '#insights'));
  });

  items.push(entry('skills-marketplace', 'skills', content.skillsMarketplace.title, content.skillsMarketplace.text, ['技能', 'skill', 'marketplace', '市场'], '#skills'));
  return items;
}

function normalize(text) {
  return String(text || '').toLowerCase().replace(/\s+/g, ' ').trim();
}

function terms(text) {
  const value = normalize(text);
  const latin = value.match(/[a-z0-9]+/g) || [];
  const han = value.match(/[\u3400-\u9fff]/g) || [];
  const bigrams = han.slice(0, -1).map((character, index) => `${character}${han[index + 1]}`);
  return [...new Set([...latin, ...han, ...bigrams])];
}

export function retrieveHomepageKnowledge(query, knowledge) {
  const normalizedQuery = normalize(query);
  const queryTerms = terms(query);
  return knowledge.map((item) => {
    const haystack = normalize(`${item.title} ${item.text} ${item.keywords.join(' ')}`);
    let score = 0;
    if (normalizedQuery && haystack.includes(normalizedQuery)) score += 10;
    queryTerms.forEach((term) => {
      if (normalize(item.title).includes(term)) score += 6;
      else if (item.keywords.some((keyword) => normalize(keyword).includes(term))) score += 4;
      else if (haystack.includes(term)) score += 1;
    });
    return { item, score };
  }).filter(({ score }) => score > 0).sort((a, b) => b.score - a.score).slice(0, 3);
}

export function buildMockAnswer(query, knowledge) {
  const normalized = normalize(query);
  if (/销售|联系|演示|报价|价格|采购|contact|sales|demo|price|quote/i.test(normalized)) {
    return {
      state: 'sales',
      text: '如果你希望了解具体方案、报价或演示安排，我可以把你转给 TAC 销售团队。',
      sources: [{ label: 'Contact', href: '#contact' }],
      cta: { label: '联系销售', href: '#contact' }
    };
  }

  const matches = retrieveHomepageKnowledge(query, knowledge);
  if (!matches.length || matches[0].score < 2) {
    return {
      state: 'no-answer',
      text: '这个问题不在当前 TAC 主页知识范围内。我不编造答案，可以为你转接销售进一步确认。',
      sources: [],
      cta: { label: '转销售', href: '#contact' }
    };
  }

  const [primary, secondary] = matches;
  const supporting = secondary && secondary.score >= Math.max(2, primary.score - 3) ? ` 另外，${secondary.item.title}：${secondary.item.text}` : '';
  return {
    state: 'complete',
    text: `${primary.item.title}：${primary.item.text}${supporting}`,
    sources: matches.filter(({ score }) => score >= Math.max(2, primary.score - 3)).slice(0, 2).map(({ item }) => ({ label: item.section, href: item.href })),
    cta: null
  };
}
