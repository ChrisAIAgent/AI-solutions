import { PROVIDER_TIMEOUT_MS } from '../src/data/tac-assistant-runtime.js';

const CHAT_ENDPOINT = 'https://apihub.agnes-ai.com/v1/chat/completions';

export class ProviderError extends Error {
  constructor(code, status, retryAfterSeconds = 0) {
    super(code);
    this.code = code;
    this.status = status;
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

function retryDelay(value) {
  if (!value) return 1500;
  const seconds = Number(value);
  return Number.isFinite(seconds)
    ? Math.max(1000, seconds * 1000)
    : Math.max(1000, Date.parse(value) - Date.now() || 1500);
}

export async function requestAgnesCompletion(payload, apiKey, {
  fetchImpl = fetch, timeoutMs = PROVIDER_TIMEOUT_MS, log = console.warn,
  requestId = '', retryBaseMs = 1500
} = {}) {
  const controller = new AbortController();
  const deadline = Date.now() + timeoutMs;
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    for (let attempt = 1; attempt <= 2; attempt += 1) {
      const response = await fetchImpl(CHAT_ENDPOINT, {
        method: 'POST',
        headers: { authorization: `Bearer ${apiKey}`, 'content-type': 'application/json' },
        body: JSON.stringify(payload), signal: controller.signal
      });
      if (response.ok) {
        try { return await response.json(); }
        catch (error) {
          if (controller.signal.aborted) throw error;
          throw new ProviderError('invalid_provider_response', 502);
        }
      }

      const retryAfter = response.headers.get('retry-after');
      let detail = {};
      let responseBody = '';
      try { responseBody = await response.text(); detail = JSON.parse(responseBody); }
      catch { /* Some gateways return HTML; do not log their raw body. */ }
      const providerError = detail?.error;
      const gatewayCode = responseBody.match(/error\s*code\s*:\s*(\d{3,5})/i)?.[1];
      // Keep credentials, questions and provider bodies out of logs and browser replies.
      const safeField = (value) => typeof value === 'string' && /^[\w.-]{1,80}$/.test(value) ? value : undefined;
      log(JSON.stringify({ event: 'assistant_provider_error', requestId, attempt,
        status: response.status, providerCode: safeField(providerError?.code),
        providerType: safeField(providerError?.type),
        gatewayCode,
        gatewayServer: safeField(response.headers.get('server')),
        responseFormat: response.headers.get('content-type')?.includes('json') ? 'json' : 'non-json',
        reason: gatewayCode === '1015' ? 'gateway-rate-limit' : /quota|credit|balance/i.test(responseBody) ? 'quota' : /concurren/i.test(responseBody) ? 'concurrency'
          : /rate.?limit|too many requests/i.test(responseBody) ? 'rate-limit' : 'unspecified',
        retryAfterSeconds: Math.ceil(retryDelay(retryAfter) / 1000) }));

      const delayMs = retryAfter ? retryDelay(retryAfter) : retryBaseMs;
      // Cloudflare 1015 is an edge block; repeating requests can extend it.
      const transient = gatewayCode !== '1015' && (response.status === 429 || [500, 502, 503, 504].includes(response.status));
      if (attempt === 1 && transient && delayMs <= 10_000 && Date.now() + delayMs + 1000 < deadline) {
        await new Promise((resolve, reject) => {
          const onAbort = () => { clearTimeout(timer); reject(new DOMException('Timed out', 'AbortError')); };
          const timer = setTimeout(() => { controller.signal.removeEventListener('abort', onAbort); resolve(); }, delayMs);
          if (controller.signal.aborted) onAbort();
          else controller.signal.addEventListener('abort', onAbort, { once: true });
        });
        continue;
      }
      if ([401, 403].includes(response.status)) throw new ProviderError('provider_auth_error', 503);
      if (response.status === 429) throw new ProviderError('provider_busy', 429, Math.ceil(delayMs / 1000));
      throw new ProviderError('provider_error', 502);
    }
  } catch (error) {
    if (controller.signal.aborted || error?.name === 'AbortError') throw new ProviderError('provider_timeout', 504);
    if (error instanceof ProviderError) throw error;
    throw new ProviderError('provider_unavailable', 502);
  } finally {
    clearTimeout(timeout);
  }
}
