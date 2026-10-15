import '../scss/tac-assistant.scss';
import { detectAnswerLanguage } from '../data/tac-assistant-knowledge.js';
import { CLIENT_TIMEOUT_MS, PROGRESS_AFTER_MS } from '../data/tac-assistant-runtime.js';
import { fetchAssistantAnswer, failurePresentation } from './tac-assistant-client.js';

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

const escapeHtml = (value) => String(value).replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character]));

export function mountTacAssistant() {
  if (document.querySelector('#tacAssistant')) return;
  const root = document.createElement('aside');
  root.id = 'tacAssistant';
  root.className = 'tac-assistant';
  root.innerHTML = `
    <section class="tac-assistant-panel" aria-label="TAC AI Assistant" aria-hidden="true">
      <header class="tac-assistant-panel-header">
        <div><span class="tac-assistant-status-dot"></span><strong>TAC AI Assistant</strong><small>TAC KNOWLEDGE ASSISTANT</small></div>
        <button type="button" class="tac-assistant-close" data-assistant-close aria-label="Close assistant">×</button>
      </header>
      <div class="tac-assistant-state-readout"><span class="tac-assistant-state-label">Idle</span><small class="tac-assistant-duration">2600ms / LOOP</small></div>
      <div class="tac-assistant-messages" aria-live="polite"></div>
      <form class="tac-assistant-form">
        <label class="tac-assistant-input-label"><span class="visually-hidden">Ask TAC AI Assistant a question</span><input name="question" autocomplete="off" placeholder="Ask about TAC..." maxlength="240"></label>
        <button type="submit" aria-label="Send question">↗</button>
      </form>
      <div class="tac-assistant-form-note"><span>Answers based on the TAC knowledge base</span>${import.meta.env.DEV ? '<button type="button" data-assistant-error>Simulate offline</button>' : ''}</div>
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
  let retryAvailableAt = 0;
  let cooldownTimer;
  let conversation = [];

  const clearTimers = () => {
    window.clearTimeout(responseTimer);
    window.clearTimeout(slowTimer);
    window.clearTimeout(fallbackTimer);
    window.clearTimeout(terminalTimer);
  };

  const refreshControls = () => {
    const pending = state === 'thinking' || state === 'typing';
    const seconds = Math.max(0, Math.ceil((retryAvailableAt - Date.now()) / 1000));
    root.querySelectorAll('[data-assistant-retry], .tac-assistant-form > button').forEach((button) => {
      button.disabled = pending || seconds > 0;
      if (button.hasAttribute('data-assistant-retry')) button.textContent = seconds > 0 ? `Retry in ${seconds}s` : 'Retry';
    });
    if (!seconds) window.clearInterval(cooldownTimer);
  };

  const updateState = (nextState, label) => {
    state = nextState;
    root.dataset.state = nextState;
    const image = root.querySelector('.tac-assistant-state-image');
    const overlay = root.querySelector('.tac-assistant-state-overlay');
    if (image) image.src = stateAssets[nextState] || stateAssets.idle;
    if (overlay) overlay.textContent = stateOverlays[nextState] || '';
    root.querySelector('.tac-assistant-state-label')?.replaceChildren(document.createTextNode(label || stateLabels[nextState] || nextState));
    root.querySelector('.tac-assistant-duration')?.replaceChildren(document.createTextNode(stateDurations[nextState] || ''));
    const pending = nextState === 'thinking' || nextState === 'typing';
    messages.setAttribute('aria-busy', String(pending));
    refreshControls();
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
    refreshControls();
  };

  const open = () => {
    root.classList.add('is-open');
    panel.setAttribute('aria-hidden', 'false');
    if (!messages.children.length) {
      updateState('greeting');
      addMessage('assistant', 'Hi, I’m TAC AI Assistant. I can help you find answers in the TAC knowledge base.', { language: 'en' });
      window.setTimeout(() => { if (state === 'greeting') updateState('idle'); }, 620);
    }
    window.setTimeout(() => input.focus(), 120);
  };

  const close = () => {
    root.classList.remove('is-open');
    panel.setAttribute('aria-hidden', 'true');
    if (state === 'greeting') updateState('idle');
  };

  const showFailure = (code = 'provider_unavailable', retryAfterSeconds = 0) => {
    if (code === 'provider_busy' && Number.isFinite(retryAfterSeconds) && retryAfterSeconds > 0) {
      retryAvailableAt = Date.now() + Math.min(retryAfterSeconds, 3600) * 1000;
      window.clearInterval(cooldownTimer);
      cooldownTimer = window.setInterval(refreshControls, 1000);
    }
    const failure = failurePresentation(code, lastLanguage);
    updateState('error-offline', failure.label);
    addMessage('assistant', failure.text, {
      language: lastLanguage,
      cta: { label: 'Contact sales', href: '#contact' },
      retry: true
    });
  };

  const submit = async (question, { showUser = true } = {}) => {
    const value = String(question || '').trim();
    if (!value || state === 'thinking' || state === 'typing' || Date.now() < retryAvailableAt) return;

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
      addMessage('assistant', lastLanguage === 'zh' ? '我正在查询 TAC 知识库，请稍候…' : 'I’m checking the TAC knowledge base. One moment…', { language: lastLanguage });
    }, PROGRESS_AFTER_MS);
    fallbackTimer = window.setTimeout(() => {
      if (sequence !== requestSequence) return;
      requestSequence += 1;
      activeRequest = null;
      controller.abort();
      clearTimers();
      showFailure('client_timeout');
    }, CLIENT_TIMEOUT_MS);

    try {
      const answer = await fetchAssistantAnswer(value, { signal: controller.signal, history: conversation });
      if (sequence !== requestSequence) return;

      clearTimers();
      activeRequest = null;
      lastLanguage = answer.language || lastLanguage;
      updateState(answer.state || 'complete');
      addMessage('assistant', answer.text, { ...answer, language: lastLanguage });
      conversation = [...conversation, { role: 'user', content: value }, { role: 'assistant', content: answer.text.slice(0, 480) }].slice(-6);
      if (answer.state === 'complete') terminalTimer = window.setTimeout(() => { if (state === 'complete') updateState('idle'); }, 1_000);
    } catch (error) {
      if (sequence !== requestSequence) return;
      clearTimers();
      activeRequest = null;
      showFailure(error.code, error.retryAfterSeconds);
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
  root.querySelector('[data-assistant-error]')?.addEventListener('click', () => {
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
