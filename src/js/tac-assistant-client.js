export class AssistantRequestError extends Error {
  constructor(code, retryAfterSeconds = 0, requestId = '') {
    super(code);
    this.code = code;
    this.retryAfterSeconds = retryAfterSeconds;
    this.requestId = requestId;
  }
}

export async function fetchAssistantAnswer(question, { signal, fetchImpl = fetch, history = [] } = {}) {
  const response = await fetchImpl('/api/assistant/chat', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ question, history }), signal
  });
  let answer;
  try { answer = await response.json(); }
  catch (error) {
    if (signal?.aborted) throw error;
    throw new AssistantRequestError('invalid_provider_response');
  }
  if (!response.ok) throw new AssistantRequestError(answer.error || 'provider_unavailable',
    answer.retryAfterSeconds || 0, answer.requestId || '');
  if (!['complete', 'no-answer', 'sales'].includes(answer.state) || typeof answer.text !== 'string' || !answer.text.trim()) {
    throw new AssistantRequestError('invalid_provider_response');
  }
  return answer;
}

export function failurePresentation(code, language) {
  const zh = language === 'zh';
  if (code === 'provider_busy') return {
    label: 'Service busy',
    text: zh ? '回答服务暂时繁忙，请稍后重试，或联系 TAC 销售团队。' : 'The answer service is busy. Please try again shortly, or contact TAC sales.'
  };
  if (code === 'provider_timeout' || code === 'client_timeout') return {
    label: 'Response timed out',
    text: zh ? '这次回答等待超时，请重试，或联系 TAC 销售团队。' : 'The answer took too long. Please retry, or contact TAC sales.'
  };
  if (code === 'assistant_unconfigured' || code === 'provider_auth_error') return {
    label: 'Service unavailable',
    text: zh ? '回答服务暂时不可用，请联系 TAC 销售团队。' : 'The answer service is temporarily unavailable. Please contact TAC sales.'
  };
  return {
    label: 'Connection error',
    text: zh ? '暂时无法获取回答，请重试，或联系 TAC 销售团队。' : 'Could not retrieve an answer. Please retry, or contact TAC sales.'
  };
}
