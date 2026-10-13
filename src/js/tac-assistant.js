import '../scss/tac-assistant.scss';
import { detectAnswerLanguage } from '../data/tac-assistant-knowledge.js';

const assistantRoot = '/assets/tac/assistant/';
const mascot = `${assistantRoot}expressions/happy.webp`;
const stateAssets = {
  idle: `${assistantRoot}expressions/happy.webp`, greeting: `${assistantRoot}expressions/happy.webp`, thinking: `${assistantRoot}states/thinking.webp`, typing: `${assistantRoot}states/typing.webp`, complete: `${assistantRoot}states/complete.webp`, 'no-answer': `${assistantRoot}states/no-answer.webp`, sales: `${assistantRoot}states/sales.webp`, 'error-offline': `${assistantRoot}states/error-offline.webp`
};

const stateLabels = {
  idle: 'Idle', greeting: 'Greeting', thinking: 'Thinking', typing: 'Typing', complete: 'Complete', 'no-answer': 'No answer', sales: 'Sales', 'error-offline': 'Error / Offline'
};

const stateOverlays = { idle: '', greeting: '✦', thinking: '✧', typing: '•••', complete: '✓', 'no-answer': '×', sales: '↗', 'error-offline': '⌁' };
const stateDurations = { idle: '2600ms / LOOP', greeting: '600ms / ONCE', thinking: '2400ms / LOOP', typing: '1100ms / LOOP', complete: '900ms / ONCE', 'no-answer': '700ms / ONCE', sales: '700ms / ONCE', 'error-offline': '4200ms / LOOP' };
const quickQuestions = [
  { question: 'What can TAC do?', label: 'What can TAC do?' },
  { question: 'Which industries does TAC support?', label: 'Industry solutions' },
  { question: 'What is the Agent Platform?', label: 'Agent Platform' },
  { question: 'Contact sales', label: 'Contact sales' }
];

const escapeHtml = (value) => String(value).replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character]));

export function mountTacAssistant() {
  if (document.querySelector('#tacAssistant')) return;
  const root = document.createElement('aside');
  root.id = 'tacAssistant';
  root.className = 'tac-assistant';
  root.innerHTML = `
    <section class="tac-assistant-panel" aria-label="TAC AI Assistant" aria-hidden="true">
      <header class="tac-assistant-panel-header">
        <div><span class="tac-assistant-status-dot"></span><strong>TAC AI Assistant</strong><small>AGNES AI · LIVE API</small></div>
        <button type="button" class="tac-assistant-close" data-assistant-close aria-label="Close assistant">×</button>
      </header>
      <div class="tac-assistant-state-readout"><span class="tac-assistant-state-label">Idle</span><small class="tac-assistant-duration">2600ms / LOOP</small></div>
      <div class="tac-assistant-messages" aria-live="polite"></div>
      <div class="tac-assistant-quick" aria-label="Common questions">${quickQuestions.map(({ question, label }) => `<button type="button" data-question="${escapeHtml(question)}">${escapeHtml(label)}</button>`).join('')}</div>
      <form class="tac-assistant-form">
        <label class="tac-assistant-input-label"><span class="visually-hidden">Ask TAC AI Assistant a question</span><input name="question" autocomplete="off" placeholder="Ask about TAC homepage..." maxlength="240"></label>
        <button type="submit" aria-label="Send question">↗</button>
      </form>
      <div class="tac-assistant-form-note"><span>Answers grounded in TAC homepage</span><button type="button" data-assistant-error>Simulate offline</button></div>
    </section>
    <button type="button" class="tac-assistant-launcher" data-assistant-open aria-label="Open TAC AI Assistant">
      <span class="tac-assistant-launcher-ring"></span><img class="tac-assistant-state-image" src="${mascot}" alt="TAC AI Assistant"><span class="tac-assistant-launcher-badge tac-assistant-state-overlay">✦</span>
    </button>`;
  document.body.appendChild(root);

  const panel = root.querySelector('.tac-assistant-panel');
  const messages = root.querySelector('.tac-assistant-messages');
  const input = root.querySelector('input');
  let state = 'idle';
  let lastQuestion = '';
  let lastLanguage = 'en';
  let responseTimer;
  let slowTimer;
  let fallbackTimer;
  let terminalTimer;
  let requestSequence = 0;
  let activeRequest;

  const clearTimers = () => {
    window.clearTimeout(responseTimer);
    window.clearTimeout(slowTimer);
    window.clearTimeout(fallbackTimer);
    window.clearTimeout(terminalTimer);
  };

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
    const sourcePrefix = 'Source: ';
    const plainText = escapeHtml(text)
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/(^|\n)[ \t]*(?:[-*+]|\d+\.)[ \t]+/g, '$1• ')
      .replace(/`([^`]+)`/g, '$1');
    const message = document.createElement('article');
    message.className = `tac-assistant-message tac-assistant-message--${role}`;
    message.innerHTML = `<div class="tac-assistant-message-bubble">${plainText.replace(/\n/g, '<br>')}</div>${meta.sources?.length ? `<div class="tac-assistant-sources">${meta.sources.map((source) => `<a href="${escapeHtml(source.href)}">${sourcePrefix}${escapeHtml(source.label)}</a>`).join('')}</div>` : ''}${meta.cta ? `<a class="tac-assistant-sales-cta" href="${escapeHtml(meta.cta.href)}">${escapeHtml(meta.cta.label)} <span aria-hidden="true">↗</span></a>` : ''}${meta.retry ? '<button type="button" class="tac-assistant-retry" data-assistant-retry>Retry</button>' : ''}`;
    messages.appendChild(message);
    messages.scrollTop = messages.scrollHeight;
  };

  const open = () => {
    root.classList.add('is-open');
    panel.setAttribute('aria-hidden', 'false');
    if (!messages.children.length) {
      updateState('greeting');
      addMessage('assistant', 'Hi, I’m TAC AI Assistant. I can answer questions based on the current homepage.', { language: 'en' });
      window.setTimeout(() => { if (state === 'greeting') updateState('idle'); }, 620);
    }
    window.setTimeout(() => input.focus(), 120);
  };

  const close = () => {
    root.classList.remove('is-open');
    panel.setAttribute('aria-hidden', 'true');
    if (state === 'greeting') updateState('idle');
  };

  const showFailure = () => {
    updateState('error-offline');
    addMessage('assistant', lastLanguage === 'zh'
      ? '目前无法连接 TAC 助手服务，请稍后重试，或联系 TAC 销售团队。'
      : 'The TAC assistant service is unavailable right now. Please try again or contact TAC sales.', {
      language: lastLanguage,
      cta: { label: 'Contact sales', href: '#contact' },
      retry: true
    });
  };

  const submit = async (question, { showUser = true } = {}) => {
    const value = String(question || '').trim();
    if (!value || state === 'thinking' || state === 'typing') return;

    clearTimers();
    activeRequest?.abort();
    const sequence = ++requestSequence;
    const controller = new AbortController();
    activeRequest = controller;
    lastQuestion = value;
    lastLanguage = detectAnswerLanguage(value);
    input.value = '';
    if (showUser) addMessage('user', value, { language: lastLanguage });
    updateState('thinking');

    responseTimer = window.setTimeout(() => {
      if (sequence === requestSequence) updateState('typing');
    }, 360);
    slowTimer = window.setTimeout(() => {
      if (sequence !== requestSequence) return;
      addMessage('assistant', lastLanguage === 'zh' ? '我还在检索主页内容，请稍候…' : 'I’m still checking the homepage. One moment…', { language: lastLanguage });
    }, 8_000);
    fallbackTimer = window.setTimeout(() => {
      if (sequence !== requestSequence) return;
      requestSequence += 1;
      activeRequest = null;
      controller.abort();
      updateState('no-answer');
      addMessage('assistant', lastLanguage === 'zh'
        ? '这次回答耗时较长，暂时无法完成。我可以为你转接 TAC 销售团队。'
        : 'This is taking longer than expected, so I could not complete the answer. I can connect you with TAC sales.', {
        language: lastLanguage,
        cta: { label: 'Contact sales', href: '#contact' }
      });
      terminalTimer = window.setTimeout(() => { if (state === 'no-answer') updateState('sales'); }, 740);
    }, 15_000);

    try {
      const response = await fetch('/api/assistant/chat', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ question: value }),
        signal: controller.signal
      });
      if (sequence !== requestSequence) return;
      if (!response.ok) throw new Error('assistant_request_failed');
      const answer = await response.json();
      if (sequence !== requestSequence) return;

      clearTimers();
      activeRequest = null;
      lastLanguage = answer.language || lastLanguage;
      updateState(answer.state || 'complete');
      addMessage('assistant', answer.text, { ...answer, language: lastLanguage });
      if (answer.state === 'no-answer') terminalTimer = window.setTimeout(() => { if (state === 'no-answer') updateState('sales'); }, 740);
      else if (answer.state === 'complete') terminalTimer = window.setTimeout(() => { if (state === 'complete') updateState('idle'); }, 1_000);
    } catch {
      if (sequence !== requestSequence) return;
      clearTimers();
      activeRequest = null;
      showFailure();
    }
  };

  const retry = () => {
    if (lastQuestion) {
      submit(lastQuestion, { showUser: false });
      return;
    }
    updateState('idle');
    addMessage('assistant', 'Enter a question and try again.', { language: 'en' });
  };

  root.querySelector('[data-assistant-open]').addEventListener('click', open);
  root.querySelector('[data-assistant-close]').addEventListener('click', close);
  root.querySelector('.tac-assistant-form').addEventListener('submit', (event) => { event.preventDefault(); submit(input.value); });
  root.querySelectorAll('[data-question]').forEach((button) => button.addEventListener('click', () => submit(button.dataset.question)));
  root.querySelector('[data-assistant-error]').addEventListener('click', () => {
    clearTimers();
    requestSequence += 1;
    activeRequest?.abort();
    activeRequest = null;
    if (!root.classList.contains('is-open')) open();
    updateState('error-offline');
    addMessage('assistant', lastLanguage === 'zh'
      ? '当前请求不可用。请检查网络后重试，或联系 TAC 销售团队。'
      : 'This request is currently unavailable. Check your connection and try again, or contact TAC sales.', {
      language: lastLanguage,
      cta: { label: 'Contact sales', href: '#contact' },
      retry: true
    });
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
