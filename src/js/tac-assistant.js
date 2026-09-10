import '../scss/tac-assistant.scss';
import { buildHomepageKnowledge, buildMockAnswer } from '../data/tac-assistant-knowledge.js';

const assistantRoot = '/assets/tac/assistant/';
const mascot = `${assistantRoot}expressions/happy.webp`;
const stateAssets = {
  idle: `${assistantRoot}expressions/happy.webp`,
  greeting: `${assistantRoot}expressions/happy.webp`,
  thinking: `${assistantRoot}states/thinking.webp`,
  typing: `${assistantRoot}states/typing.webp`,
  complete: `${assistantRoot}states/complete.webp`,
  'no-answer': `${assistantRoot}states/no-answer.webp`,
  sales: `${assistantRoot}states/sales.webp`,
  'error-offline': `${assistantRoot}states/error-offline.webp`
};

const stateLabels = {
  idle: '待机',
  greeting: '欢迎',
  thinking: '思考中',
  typing: '生成中',
  complete: '回答完成',
  'no-answer': '无法回答',
  sales: '转销售',
  'error-offline': '错误或离线'
};

const stateOverlays = {
  idle: '',
  greeting: '✦',
  thinking: '✧',
  typing: '•••',
  complete: '✓',
  'no-answer': '×',
  sales: '↗',
  'error-offline': '⌁'
};

const stateDurations = {
  idle: '2600ms / LOOP',
  greeting: '600ms / ONCE',
  thinking: '2400ms / LOOP',
  typing: '1100ms / LOOP',
  complete: '900ms / ONCE',
  'no-answer': '700ms / ONCE',
  sales: '700ms / ONCE',
  'error-offline': '4200ms / LOOP'
};

const escapeHtml = (value) => String(value).replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character]));

export function mountTacAssistant(content) {
  if (document.querySelector('#tacAssistant')) return;
  const knowledge = buildHomepageKnowledge(content);
  const root = document.createElement('aside');
  root.id = 'tacAssistant';
  root.className = 'tac-assistant';
  root.innerHTML = `
    <section class="tac-assistant-panel" aria-label="TAC AI Assistant" aria-hidden="true">
      <header class="tac-assistant-panel-header">
        <div><span class="tac-assistant-status-dot"></span><strong>TAC AI Assistant</strong><small>HOMEPAGE MOCK MODE</small></div>
        <button type="button" class="tac-assistant-close" data-assistant-close aria-label="关闭机器人">×</button>
      </header>
      <div class="tac-assistant-state-readout"><span class="tac-assistant-state-label">待机</span><small class="tac-assistant-duration">2600ms / LOOP</small></div>
      <div class="tac-assistant-messages" aria-live="polite"></div>
      <div class="tac-assistant-quick" aria-label="常见问题">
        <button type="button" data-question="TAC 能做什么？">TAC 能做什么？</button>
        <button type="button" data-question="有哪些行业方案？">行业方案</button>
        <button type="button" data-question="什么是 Agent Platform？">Agent Platform</button>
        <button type="button" data-question="联系销售">联系销售</button>
      </div>
      <form class="tac-assistant-form">
        <label class="tac-assistant-input-label"><span class="visually-hidden">向 TAC AI Assistant 提问</span><input name="question" autocomplete="off" placeholder="Ask about TAC homepage..." maxlength="240"></label>
        <button type="submit" aria-label="发送问题">↗</button>
      </form>
      <div class="tac-assistant-form-note"><span>Local homepage retrieval · No LLM/API</span><button type="button" data-assistant-error>模拟离线</button></div>
    </section>
    <button type="button" class="tac-assistant-launcher" data-assistant-open aria-label="打开 TAC AI Assistant">
      <span class="tac-assistant-launcher-ring"></span><img class="tac-assistant-state-image" src="${mascot}" alt="TAC AI Assistant"><span class="tac-assistant-launcher-badge tac-assistant-state-overlay">✦</span>
    </button>`;
  document.body.appendChild(root);

  const panel = root.querySelector('.tac-assistant-panel');
  const messages = root.querySelector('.tac-assistant-messages');
  const input = root.querySelector('input');
  let state = 'idle';
  let lastQuestion = '';
  let responseTimer;
  let fallbackTimer;

  const updateState = (nextState) => {
    state = nextState;
    root.dataset.state = nextState;
    const image = root.querySelector('.tac-assistant-state-image');
    const overlay = root.querySelector('.tac-assistant-state-overlay');
    if (image) image.src = stateAssets[nextState] || stateAssets.idle;
    if (overlay) overlay.textContent = stateOverlays[nextState] || '';
    root.querySelector('.tac-assistant-state-label')?.replaceChildren(document.createTextNode(stateLabels[nextState] || nextState));
    root.querySelector('.tac-assistant-duration')?.replaceChildren(document.createTextNode(stateDurations[nextState] || ''));
  };

  const addMessage = (role, text, meta = {}) => {
    const message = document.createElement('article');
    message.className = `tac-assistant-message tac-assistant-message--${role}`;
    message.innerHTML = `<div class="tac-assistant-message-bubble">${escapeHtml(text).replace(/\n/g, '<br>')}</div>${meta.sources?.length ? `<div class="tac-assistant-sources">${meta.sources.map((source) => `<a href="${escapeHtml(source.href)}">来源：${escapeHtml(source.label)}</a>`).join('')}</div>` : ''}${meta.cta ? `<a class="tac-assistant-sales-cta" href="${escapeHtml(meta.cta.href)}">${escapeHtml(meta.cta.label)} <span aria-hidden="true">↗</span></a>` : ''}${meta.retry ? '<button type="button" class="tac-assistant-retry" data-assistant-retry>重试</button>' : ''}`;
    messages.appendChild(message);
    messages.scrollTop = messages.scrollHeight;
  };

  const open = () => {
    root.classList.add('is-open');
    panel.setAttribute('aria-hidden', 'false');
    if (!messages.children.length) {
      updateState('greeting');
      addMessage('assistant', 'Hi, I’m TAC AI Assistant. 我可以根据当前主页内容回答问题。');
      window.setTimeout(() => updateState('idle'), 620);
    }
    window.setTimeout(() => input.focus(), 120);
  };

  const close = () => {
    root.classList.remove('is-open');
    panel.setAttribute('aria-hidden', 'true');
    updateState('idle');
  };

  const showAnswer = (question, answer) => {
    lastQuestion = question;
    addMessage('user', question);
    updateState('thinking');
    window.clearTimeout(responseTimer);
    window.clearTimeout(fallbackTimer);
    responseTimer = window.setTimeout(() => {
      updateState('typing');
      fallbackTimer = window.setTimeout(() => {
        updateState(answer.state);
        addMessage('assistant', answer.text, answer);
        if (answer.state === 'no-answer') {
          window.setTimeout(() => updateState('sales'), 740);
        } else if (answer.state === 'complete') {
          window.setTimeout(() => updateState('idle'), 1000);
        }
      }, 650);
    }, 360);
  };

  const submit = (question) => {
    const value = question.trim();
    if (!value || state === 'thinking' || state === 'typing') return;
    input.value = '';
    showAnswer(value, buildMockAnswer(value, knowledge));
  };

  const retry = () => {
    if (lastQuestion) {
      submit(lastQuestion);
      return;
    }
    updateState('thinking');
    responseTimer = window.setTimeout(() => {
      updateState('complete');
      addMessage('assistant', '模拟重试成功，主页检索已经恢复。');
      window.setTimeout(() => updateState('idle'), 1000);
    }, 520);
  };

  root.querySelector('[data-assistant-open]').addEventListener('click', open);
  root.querySelector('[data-assistant-close]').addEventListener('click', close);
  root.querySelector('.tac-assistant-form').addEventListener('submit', (event) => { event.preventDefault(); submit(input.value); });
  root.querySelectorAll('[data-question]').forEach((button) => button.addEventListener('click', () => submit(button.dataset.question)));
  root.querySelector('[data-assistant-error]').addEventListener('click', () => {
    if (!root.classList.contains('is-open')) open();
    window.clearTimeout(responseTimer);
    window.clearTimeout(fallbackTimer);
    updateState('error-offline');
    addMessage('assistant', '当前请求不可用。请检查网络后重试，或联系 TAC 销售团队。', { cta: { label: '联系销售', href: '#contact' }, retry: true });
  });
  root.addEventListener('click', (event) => {
    const salesLink = event.target.closest('.tac-assistant-sales-cta');
    if (salesLink) window.setTimeout(() => updateState('sales'), 80);
    if (event.target.closest('[data-assistant-retry]')) retry();
  });
  document.addEventListener('visibilitychange', () => root.classList.toggle('is-paused', document.hidden));
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && root.classList.contains('is-open')) close(); });
  updateState('idle');
}
