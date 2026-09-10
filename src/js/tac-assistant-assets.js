import '../scss/tac-assistant-assets.scss';

const assetRoot = '../assets/tac/assistant/';
const localeCopy = {
  en: {
    pageTitle: 'TAC AI Assistant · Asset Lab', skip: 'Skip to main content', brandAria: 'Back to TAC home', languageLabel: 'Language',
    heroKicker: 'PRE-INTEGRATION REVIEW', heroDescription: 'An independent review page for mascot assets, motion states, and playback rules. No homepage Q&A or sales system is connected here.',
    viewsKicker: '01 / MASCOT VIEWS', viewsTitle: 'Unified mascot views', viewsDescription: 'Transparent assets for brand surfaces, asset maintenance, and responsive adaptations.',
    expressionsKicker: '02 / EXPRESSIONS', expressionsTitle: 'Six feedback expressions', expressionsDescription: 'Status overlays are drawn in CSS; the robot images remain clean and contain no embedded UI copy.',
    motionKicker: '03 / STATE MACHINE', motionTitle: 'Motion state simulation', darkStage: 'Dark stage', lightStage: 'Light stage', tryState: 'TRY A STATE', sizeLabel: 'View different sizes', size: 'Size',
    rulesKicker: '04 / MOTION RULES', rulesTitle: 'Motion rules', rulesDescription: 'Fixed state IDs and transition rules that can map directly to GSAP or Rive later.',
    tableState: 'State', tableTrigger: 'Trigger', tableDuration: 'Duration', tablePlayback: 'Playback', tableNext: 'Next', loop: 'Loop', once: 'Once', triggerPrefix: 'Trigger: ', nextPrefix: 'Next: ',
    progress: 'Show progress after', fallback: 'Enter fallback after', hidden: 'Hidden', pauseLoops: 'Pause loops', reduced: 'Reduced', staticFade: 'Static asset + short fade', footerNote: 'Reference-only preview · No assistant API connected',
    views: { front: 'Front view', side: 'Side view', back: 'Back view', left: 'Left view', right: 'Right view', '45': 'Three-quarter view' },
    expressions: { happy: 'Happy', wink: 'Wink', thinking: 'Thinking', surprised: 'Surprised', sleep: 'Sleep', question: 'Question' },
    states: {
      idle: { label: 'Idle', code: 'IDLE', semantic: 'Idle behavior' }, greeting: { label: 'Greeting', code: 'GREETING', semantic: 'Welcome the visitor' }, thinking: { label: 'Thinking', code: 'THINKING', semantic: 'Analyze the question' }, typing: { label: 'Typing', code: 'TYPING', semantic: 'Generate an answer' }, complete: { label: 'Complete', code: 'COMPLETE', semantic: 'Answer completed' }, 'no-answer': { label: 'No answer', code: 'NO ANSWER', semantic: 'No supported evidence' }, sales: { label: 'Sales', code: 'SALES', semantic: 'Recommend sales contact' }, 'error-offline': { label: 'Error / Offline', code: 'ERROR / OFFLINE', semantic: 'Request unavailable' }
    },
    next: { idle: 'Idle', greeting: 'Idle', thinking: 'Typing', typing: 'Complete / No answer / Error', complete: 'Idle', 'no-answer': 'Sales', sales: 'Idle', 'error-offline': 'Thinking' },
    triggers: {}
  },
  zh: {
    pageTitle: 'TAC AI 助手 · 素材实验室', skip: '跳到主要内容', brandAria: '返回 TAC 首页', languageLabel: '语言',
    heroKicker: '接入前验收', heroDescription: '用于独立验收机器人素材、动态状态和播放规则。本页面不会接入主页问答或销售系统。',
    viewsKicker: '01 / 机器人视角', viewsTitle: '统一角色视角', viewsDescription: '透明素材用于品牌展示、资产维护和响应式适配。',
    expressionsKicker: '02 / 表情状态', expressionsTitle: '六种反馈表情', expressionsDescription: '状态叠加图标由 CSS 绘制，机器人图片保持纯净，不嵌入 UI 文案。',
    motionKicker: '03 / 状态机', motionTitle: '动态状态模拟', darkStage: '深色背景', lightStage: '浅色背景', tryState: '试用状态', sizeLabel: '查看不同尺寸', size: '尺寸',
    rulesKicker: '04 / 动画规则', rulesTitle: '播放规则', rulesDescription: '固定状态 ID 和转场规则，后续可直接映射到 GSAP 或 Rive。',
    tableState: '状态', tableTrigger: '触发', tableDuration: '时长', tablePlayback: '播放', tableNext: '下一步', loop: '循环', once: '单次', triggerPrefix: '触发条件：', nextPrefix: '下一状态：',
    progress: '显示进度提示', fallback: '进入兜底', hidden: '页面隐藏', pauseLoops: '暂停循环', reduced: '减少动效', staticFade: '静态素材 + 短淡入', footerNote: '仅供参考的预览 · 未连接助手 API',
    views: { front: '正面', side: '侧面', back: '背面', left: '左侧', right: '右侧', '45': '45° 视角' },
    expressions: { happy: '开心', wink: '眨眼', thinking: '思考', surprised: '惊讶', sleep: '睡眠', question: '疑惑' },
    states: {
      idle: { label: '待机', code: '待机', semantic: '等待用户操作' }, greeting: { label: '欢迎', code: '欢迎', semantic: '欢迎访客' }, thinking: { label: '思考中', code: '思考中', semantic: '分析问题' }, typing: { label: '生成中', code: '生成中', semantic: '生成回答' }, complete: { label: '回答完成', code: '回答完成', semantic: '回答已完成' }, 'no-answer': { label: '无法回答', code: '无法回答', semantic: '没有找到依据' }, sales: { label: '转销售', code: '转销售', semantic: '建议联系销售' }, 'error-offline': { label: '错误或离线', code: '错误或离线', semantic: '请求不可用' }
    },
    next: { idle: '待机', greeting: '待机', thinking: '生成中', typing: '回答完成 / 无法回答 / 错误或离线', complete: '待机', 'no-answer': '转销售', sales: '待机', 'error-offline': '思考中' },
    triggers: { idle: '助手关闭且页面可见', greeting: '助手打开', thinking: '提交问题', typing: '开始生成回答', complete: '找到有依据的回答', 'no-answer': '没有找到主页中的支持信息', sales: '访客选择联系销售或检测到高意向转接', 'error-offline': '网络或助手请求失败' }
  }
};

const stateOverlay = { idle: '', greeting: '✦', thinking: '✧', typing: '•••', complete: '✓', 'no-answer': '×', sales: '↗', 'error-offline': '⌁' };
const get = (selector) => document.querySelector(selector);
let rules;
let manifest;
let activeState = 'idle';
let activeLocale = 'en';

function copy() { return localeCopy[activeLocale]; }

function translateStaticContent() {
  const current = copy();
  document.documentElement.lang = activeLocale === 'zh' ? 'zh-CN' : 'en';
  document.title = current.pageTitle;
  document.querySelectorAll('[data-i18n]').forEach((element) => {
    const value = current[element.dataset.i18n];
    if (value !== undefined) element.textContent = value;
  });
  document.querySelectorAll('[data-i18n-aria-label]').forEach((element) => {
    const value = current[element.dataset.i18nAriaLabel];
    if (value !== undefined) element.setAttribute('aria-label', value);
  });
  document.querySelectorAll('[data-language]').forEach((button) => {
    const isActive = button.dataset.language === activeLocale;
    button.classList.toggle('is-active', isActive);
    button.setAttribute('aria-pressed', String(isActive));
  });
}

function setLocale(locale) {
  if (!localeCopy[locale]) return;
  activeLocale = locale;
  translateStaticContent();
  try { window.localStorage.setItem('tac-assistant-locale', locale); } catch { /* storage may be unavailable */ }
  if (!manifest || !rules) return;
  renderViews();
  renderExpressions();
  renderStateButtons();
  renderRules();
  activateState(activeState);
}

async function loadData() {
  const [manifestResponse, rulesResponse] = await Promise.all([
    fetch(`${assetRoot}assistant-asset-manifest.json`),
    fetch(`${assetRoot}assistant-motion-rules.json`)
  ]);
  manifest = await manifestResponse.json();
  rules = await rulesResponse.json();
  renderViews();
  renderExpressions();
  renderStateButtons();
  renderRules();
  activateState('idle');
}

function imagePath(file) { return `${assetRoot}${file}`; }

function renderViews() {
  const grid = get('#views-grid');
  grid.innerHTML = manifest.views.map((view) => `
    <figure class="asset-card asset-card--view">
      <div class="asset-image-frame"><img src="${imagePath(view.file)}" alt="TAC AI Assistant ${copy().views[view.id]}" loading="lazy"></div>
      <figcaption><span>${view.id.toUpperCase()}</span><strong>${copy().views[view.id]}</strong><small>${view.file}</small></figcaption>
    </figure>`).join('');
}

function renderExpressions() {
  const grid = get('#expressions-grid');
  grid.innerHTML = manifest.expressions.map((expression) => `
    <figure class="asset-card asset-card--expression">
      <div class="asset-image-frame"><img src="${imagePath(expression.file)}" alt="TAC AI Assistant ${copy().expressions[expression.id]}" loading="lazy"></div>
      <figcaption><strong>${copy().expressions[expression.id]}</strong><small>${expression.file}</small></figcaption>
    </figure>`).join('');
}

function renderStateButtons() {
  const buttons = get('#stateButtons');
  buttons.innerHTML = Object.keys(rules.states).map((state) => `
    <button type="button" class="state-button" data-state="${state}">
      <span class="state-button-icon state-button-icon--${state}">${stateOverlay[state] || '•'}</span>
      <span>${copy().states[state].label}</span>
    </button>`).join('');
}

function renderRules() {
  const body = get('#rulesBody');
  body.innerHTML = Object.entries(rules.states).map(([state, config]) => `
    <tr>
      <th scope="row">${copy().states[state].label}</th>
      <td>${copy().triggers[state] || config.trigger}</td>
      <td>${config.durationMs}ms${config.holdMs ? ` + ${config.holdMs}ms` : ''}</td>
      <td>${config.loop ? copy().loop : copy().once}</td>
      <td>${copy().next[state] || config.next}</td>
    </tr>`).join('');

  const policy = rules.timingPolicy;
  get('#timingNotes').innerHTML = `
    <span><strong>+${policy.showProgressAfterMs / 1000}s</strong>${copy().progress}</span>
    <span><strong>+${policy.fallbackAfterMs / 1000}s</strong>${copy().fallback}</span>
    <span><strong>${copy().hidden}</strong> ${policy.pauseWhenDocumentHidden ? copy().pauseLoops : ''}</span>
    <span><strong>${copy().reduced}</strong> ${copy().staticFade}</span>`;
}

function activateState(state) {
  if (!rules?.states[state]) return;
  activeState = state;
  const config = rules.states[state];
  const currentState = copy().states[state];
  const stage = get('#motionStage');
  const mascot = get('#stateMascot');
  stage.dataset.state = state;
  mascot.src = imagePath(config.asset);
  mascot.alt = `TAC AI Assistant ${currentState.label}`;
  get('#stateName').textContent = currentState.code;
  get('#stateSemantic').textContent = currentState.semantic;
  get('#stateOverlay').textContent = stateOverlay[state] || '';
  const playback = config.loop ? (activeLocale === 'zh' ? '循环' : 'LOOP') : (activeLocale === 'zh' ? '单次' : 'ONCE');
  get('#stateDuration').textContent = `${config.durationMs}ms / ${playback}`;
  get('#stateTrigger').textContent = `${copy().triggerPrefix}${copy().triggers[state] || config.trigger} · ${copy().nextPrefix}${copy().next[state] || config.next}`;
  document.querySelectorAll('.state-button').forEach((button) => button.classList.toggle('is-active', button.dataset.state === state));
}

function bindInteractions() {
  get('#stateButtons').addEventListener('click', (event) => {
    const button = event.target.closest('[data-state]');
    if (button) activateState(button.dataset.state);
  });
  document.querySelectorAll('[data-language]').forEach((button) => button.addEventListener('click', () => setLocale(button.dataset.language)));
  document.querySelectorAll('[data-background]').forEach((button) => button.addEventListener('click', () => {
    get('#motionStage').dataset.background = button.dataset.background;
    document.querySelectorAll('[data-background]').forEach((item) => item.classList.toggle('is-active', item === button));
  }));
  document.querySelectorAll('[data-size]').forEach((button) => button.addEventListener('click', () => {
    const size = Number(button.dataset.size);
    get('#stateMascot').style.width = `${size * 3}px`;
    document.querySelectorAll('[data-size]').forEach((item) => item.classList.toggle('is-active', item === button));
  }));
  document.addEventListener('visibilitychange', () => get('#motionStage').classList.toggle('is-paused', document.hidden));
}

try {
  const storedLocale = window.localStorage.getItem('tac-assistant-locale');
  if (storedLocale && localeCopy[storedLocale]) activeLocale = storedLocale;
} catch { /* storage may be unavailable */ }

translateStaticContent();
bindInteractions();
loadData().catch((error) => {
  console.error('TAC assistant preview failed to load', error);
  get('#stateTrigger').textContent = activeLocale === 'zh' ? '素材清单或动画规则加载失败，请检查构建输出。' : 'The asset manifest or motion rules failed to load. Check the build output.';
});
