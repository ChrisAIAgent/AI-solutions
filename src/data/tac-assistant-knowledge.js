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

const sectionLabels = {
  en: { hero: 'Homepage', solutions: 'Solutions', platform: 'Platform', contact: 'Contact', industries: 'Industries', applications: 'Applications', accelerators: 'Accelerators', tailored: 'Tailored apps', reports: 'Reports', partners: 'Partners', insights: 'Insights', skills: 'Skills' },
  zh: { hero: '主页介绍', solutions: '解决方案', platform: '平台能力', contact: '联系信息', industries: '行业方案', applications: '应用场景', accelerators: '应用加速器', tailored: '定制应用', reports: '报告资料', partners: '合作生态', insights: '行业洞察', skills: '技能市场' }
};

const zhAnswers = {
  hero: 'TAC 帮助企业构建随业务发展的智能运营能力，将智能自动化、互联知识和受治理的工作流整合到一个统一体验中。',
  solutions: 'TAC 提供预构建应用、应用加速器和定制应用，帮助企业更快落地客户服务与员工生产力场景。',
  'agent-platform': 'TAC 智能体平台为企业提供可靠的工作流基础，将人员、系统、知识和智能助手连接到统一的运营模式中。',
  contact: '如果你希望进一步了解 TAC 的方案、合作方式或演示安排，可以通过主页联系 TAC 团队。',
  'industry-banking': '银行与金融行业方案聚焦风险运营、客户服务、顾问支持和合规场景，帮助团队在复杂客户旅程中保持统一上下文。',
  'industry-healthcare': '医疗与健康行业方案帮助护理、会员服务和运营团队处理高频问题，并将分散的内部知识转化为安全、可引导的服务体验。',
  'industry-retail': '零售行业方案连接产品知识、服务政策和运营流程，为每个零售触点提供快速、个性化的支持。',
  'industry-telecom': '电信与媒体行业方案帮助团队统一客户沟通、服务运营和业务知识，提升多渠道服务的一致性。',
  'industry-business': '企业通用方案覆盖人力、信息技术、法务和运营等场景，帮助团队减少重复工作并提高响应效率。',
  'application-banking': '银行应用用于协调自助服务和人工支持，让客户沟通共享上下文、保持一致并满足合规要求。',
  'application-healthcare': '医疗应用支持全天候患者与会员自助服务，在保证合规的同时减轻服务团队的重复工作。',
  'application-retail': '零售应用为购物和运营提供即时、个性化支持，帮助团队改善每个客户接触点的体验。',
  'application-it': '信息技术应用用于处理事件、减少工单数量，并提供全天候的内部支持。',
  'application-hr': '人力资源应用帮助自动处理员工问题，减少重复咨询和手工工作量。',
  'application-recruiting': '招聘应用帮助自动筛选、加快招聘流程，并提升候选人的沟通体验。'
};

const zhSectionAnswers = {
  accelerators: 'TAC 应用加速器提供可复用的智能体、模板和系统集成，帮助团队从想法更快走向可运行的工作流。',
  tailored: 'TAC 定制应用围绕企业独特的业务流程设计，并结合知识、政策和人工复核要求构建专属体验。',
  platform: 'TAC 智能体平台覆盖构建、编排、测试、部署、治理和持续优化等环节，帮助企业让智能工作可靠运行。',
  reports: '主页中的报告资料关注企业智能化准备度、服务运营、员工工作和治理等主题。',
  partners: 'TAC 合作生态包括技术生态与实施生态，帮助方案适配真实的云、数据、软件和交付环境。',
  insights: '主页洞察关注如何让企业智能工作流真正可运营、可衡量并持续演进。',
  skills: '技能市场提供面向设计、开发、规划和演示工作的社区技能，使用前应先查看原始来源。'
};

export function buildHomepageKnowledge(content) {
  const items = [
    entry('hero', 'hero', content.hero.eyebrow, `${content.hero.title} ${content.hero.lead}`, ['TAC', 'AI', '平台', '智能体', '自动化', 'AI platform'], '#top'),
    entry('solutions', 'solutions', 'AI Solutions', `${content.hero.featureCards.map((card) => `${card.title}: ${card.text}`).join(' ')}`, ['解决方案', 'solutions', '应用', 'enterprise AI'], '#applications'),
    entry('agent-platform', 'platform', 'Agent Platform', 'TAC provides a platform foundation for building dependable agent workflows across enterprise teams and systems.', ['平台', '智能体平台', 'agent platform', 'workflow', '工作流'], '#platform'),
    entry('contact', 'contact', 'Contact TAC', 'Tell TAC what work you want to make clearer, faster, or easier to govern. Start a conversation with TAC.', ['联系', '销售', '演示', '合作', 'contact', 'sales', 'demo'], '#contact')
  ];

  content.industries.forEach((item) => {
    items.push(entry(`industry-${item.id}`, 'industries', item.title, `${item.text} Relevant capabilities: ${item.logos.join(', ')}.`, ['行业', '方案', 'industry', 'industries', 'solution', 'solutions', item.label, ...(industryAliases[item.id] || [])], '#industries'));
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

export function detectAnswerLanguage(query) {
  return /[\u3400-\u9fff]/.test(String(query || '')) ? 'zh' : 'en';
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

export function retrieveRelevantHomepageKnowledge(query, knowledge) {
  const normalized = normalize(query);
  const intentSections = /industry|industries|sector|vertical|行业|行业方案/.test(normalized)
    ? ['industries']
    : /what can tac|what does tac do|capabilities|overview|介绍|能做什么|能力/.test(normalized)
      ? ['hero', 'solutions', 'platform']
      : [];
  const searchPool = intentSections.length ? knowledge.filter((item) => intentSections.includes(item.section)) : knowledge;
  return retrieveHomepageKnowledge(query, searchPool);
}

function localizeAnswer(item, locale) {
  if (locale === 'zh') return zhAnswers[item.id] || zhSectionAnswers[item.section] || '这个主题可以在 TAC 主页的相关内容中继续了解。';
  return `${item.title}: ${item.text}`;
}

function sourceList(matches, primary) {
  return matches.filter(({ score }) => score >= Math.max(2, primary.score - 3)).slice(0, 2).map(({ item }) => ({
    label: sectionLabels.en[item.section] || item.section,
    href: item.href
  }));
}

export function buildMockAnswer(query, knowledge) {
  const normalized = normalize(query);
  const locale = detectAnswerLanguage(query);
  const salesIntent = /销售|联系|演示|报价|价格|采购|contact|sales|demo|price|quote/i.test(normalized);
  if (salesIntent) {
    return {
      language: locale,
      state: 'sales',
      text: locale === 'zh' ? '如果你希望了解具体方案、报价或演示安排，我可以为你转接 TAC 销售团队。' : 'If you would like to discuss a specific solution, pricing, or a demo, I can connect you with the TAC sales team.',
      sources: [{ label: sectionLabels.en.contact, href: '#contact' }],
      cta: { label: 'Contact sales', href: '#contact' }
    };
  }

  const matches = retrieveRelevantHomepageKnowledge(query, knowledge);
  if (!matches.length || matches[0].score < 2) {
    return {
      language: locale,
      state: 'no-answer',
      text: locale === 'zh' ? '这个问题不在当前 TAC 主页的知识范围内。我不会编造答案，可以为你转接销售进一步确认。' : 'That question is outside the current TAC homepage knowledge scope. I will not make up an answer, but I can connect you with sales for confirmation.',
      sources: [],
      cta: { label: 'Talk to sales', href: '#contact' }
    };
  }

  const [primary, secondary] = matches;
  const supporting = locale === 'en' && secondary && secondary.score >= Math.max(2, primary.score - 3) ? ` Also, ${secondary.item.title}: ${secondary.item.text}` : '';
  return {
    language: locale,
    state: 'complete',
    text: `${localizeAnswer(primary.item, locale)}${supporting}`,
    sources: sourceList(matches, primary),
    cta: null
  };
}
