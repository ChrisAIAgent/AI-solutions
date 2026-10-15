export function sanitizeHistory(history) {
  if (!Array.isArray(history)) return [];
  return history.filter((turn) => turn && ['user', 'assistant'].includes(turn.role) && typeof turn.content === 'string' && turn.content.trim())
    .slice(-6).map(({ role, content }) => ({ role, content: content.trim().slice(0, 480) }));
}

export function socialReply(question, language) {
  const text = question.toLowerCase().replace(/[\s!?.,，。！？~～]+/gu, '');
  const zh = language === 'zh';
  if (/^(你好|您好|嗨|哈喽|在吗|有人吗|早上好|早安|下午好|晚上好|hello|hi|hey|hellothere|goodmorning|goodafternoon|goodevening)$/.test(text)) {
    return zh ? '你好！我是 TAC AI 助手。你想了解 TAC 的产品、行业方案，还是使用方法？也可以直接说说你想解决什么问题。'
      : 'Hi! I’m TAC AI Assistant. What would you like to know about TAC? You can ask about products, industry solutions, or simply describe what you need help with.';
  }
  if (/^(谢谢|谢谢你|多谢|感谢|好的谢谢|thanks|thankyou|thanksalot|thankssomuch)$/.test(text)) {
    return zh ? '不客气！还有什么想了解的，随时问我。' : 'You’re welcome! Let me know if there’s anything else you’d like to explore.';
  }
  if (/^(再见|拜拜|回头聊|bye|goodbye|seeyou)$/.test(text)) {
    return zh ? '再见！有需要随时回来找我。' : 'Goodbye! Come back anytime if you need help.';
  }
  return null;
}

export function semanticCatalog(index, question = '') {
  const focused = [];
  if (/\bskills?\b|技能/i.test(question)) focused.push('/pages/skills.html');
  if (/\bplugins?\b|插件/i.test(question)) focused.push('/pages/tac-plugins.html');
  return index.pages.filter((page) => !focused.length || focused.includes(page.href)).map((page) => {
    const titles = [...new Set(index.documents.filter((item) => item.href.split('#')[0] === page.href).map((item) =>
      focused.length && /^(?:skill-|plugin-\d)/.test(item.id) && !item.id.endsWith('-overview') ? `${item.title}: ${item.text.slice(0, 140)}` : item.title))];
    return `${page.href} — ${page.title}\n${titles.join('; ')}`;
  }).join('\n\n');
}

export function overviewEvidence(index) {
  const ids = ['hero', 'solutions', 'industries-overview', 'agent-platform', 'contact', ...index.documents.filter((item) => item.id.startsWith('application-')).map((item) => item.id)];
  const selected = ids.map((id) => index.documents.find((item) => item.id === id));
  for (const page of index.pages.filter((item) => item.href !== '/index.html')) {
    selected.push(index.documents.find((item) => item.href.split('#')[0] === page.href));
  }
  return selected.filter(Boolean).map((item) => ({ item: { ...item, text: item.text.slice(0, 650) }, score: 2 }));
}

export function modelText(result) {
  const raw = result?.choices?.[0]?.message?.content;
  return typeof raw === 'string' ? raw.trim() : Array.isArray(raw)
    ? raw.map((part) => typeof part?.text === 'string' ? part.text : '').join('').trim() : '';
}

export function parseSearchPlan(text, pages) {
  try {
    const plan = JSON.parse(text.replace(/^```(?:json)?\s*|\s*```$/gi, ''));
    const queries = Array.isArray(plan.queries) ? plan.queries.filter((query) => typeof query === 'string' && query.trim()).slice(0, 3).map((query) => query.trim().slice(0, 180)) : [];
    const allowed = new Set(pages.map((page) => page.href));
    return { queries, pages: Array.isArray(plan.pages) ? plan.pages.filter((page) => allowed.has(page)).slice(0, 3) : [] };
  } catch { return { queries: [], pages: [] }; }
}

export function parseAnswer(text) {
  if (text === '__HANDOFF__' || text === '__SEARCH__') return { action: text === '__SEARCH__' ? 'search' : 'handoff', text: '', sourceIds: [] };
  const clean = text.replace(/^```(?:json)?\s*|\s*```$/gi, '');
  if (!clean.startsWith('{')) return { action: 'answer', text, sourceIds: null };
  try {
    const answer = JSON.parse(clean);
    if (!['answer', 'search', 'clarify', 'outside', 'handoff'].includes(answer.action) || typeof answer.answer !== 'string' || !answer.answer.trim()) return null;
    return { action: answer.action, text: answer.answer.trim(), sourceIds: Array.isArray(answer.sourceIds) ? answer.sourceIds.filter((id) => typeof id === 'string') : [] };
  } catch { return null; }
}
