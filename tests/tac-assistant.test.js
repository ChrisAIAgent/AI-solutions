import test from 'node:test';
import assert from 'node:assert/strict';
import { requestChatCompletion } from '../server/tac-assistant-provider.js';
import { fetchAssistantAnswer, failurePresentation } from '../src/js/tac-assistant-client.js';
import { CLIENT_TIMEOUT_MS, PROVIDER_TIMEOUT_MS } from '../src/data/tac-assistant-runtime.js';
import worker from '../worker.js';
import { content } from '../src/data/tac-home-content.js';
import { buildHomepageKnowledge, retrieveRelevantHomepageKnowledge } from '../src/data/tac-assistant-knowledge.js';

test('industry overview questions supply every actual sector to the model in both languages', async () => {
  const originalFetch = globalThis.fetch;
  try {
    for (const question of ['Which industries does TAC support?', 'TAC有哪些行业方案？']) {
      let called = false;
      globalThis.fetch = async (_, options) => {
        called = true;
        const payload = JSON.parse(options.body);
        const context = payload.messages.map((message) => message.content).join('\n');
        for (const industry of content.industries) assert.ok(context.includes(industry.label), industry.label);
        return Response.json({ choices: [{ message: { content: 'Grounded sector answer' } }] });
      };
      const response = await worker.fetch(new Request('https://example.com/api/assistant/chat', {
        method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ question })
      }), { ASSISTANT_API_KEY: 'test-key' });
      assert.equal(response.status, 200);
      assert.equal((await response.json()).state, 'complete');
      assert.ok(called);
    }
  } finally { globalThis.fetch = originalFetch; }
});

test('specific industry questions retain sector details and explicit sector labels', () => {
  const knowledge = buildHomepageKnowledge(content);
  for (const question of ['Banking industry solutions', '银行行业方案']) {
    const matches = retrieveRelevantHomepageKnowledge(question, knowledge);
    assert.equal(matches[0].item.id, 'industry-banking');
    assert.ok(matches[0].item.title.includes('BANKING'));
    assert.ok(matches[0].item.text.includes('Risk operations'));
  }
});

test('provider uses the configured base URL and preserves the custom port', async () => {
  await requestChatCompletion({ model: 'deepseek-v4-flash' }, 'test-key', {
    baseUrl: 'http://43.172.73.230:3002/v1/',
    fetchImpl: async (url, options) => {
      assert.equal(url, 'http://43.172.73.230:3002/v1/chat/completions');
      assert.equal(options.headers.authorization, 'Bearer test-key');
      assert.equal(JSON.parse(options.body).model, 'deepseek-v4-flash');
      return Response.json({ choices: [{ message: { content: 'Answer' } }] });
    }
  });
});

test('temporary provider rejection retries once and returns the real answer', async () => {
  let calls = 0;
  const result = await requestChatCompletion({}, 'test-key', {
    retryBaseMs: 1, log() {},
    fetchImpl: async () => ++calls === 1
      ? Response.json({ error: { code: 'rate_limit_exceeded' } }, { status: 429 })
      : Response.json({ choices: [{ message: { content: 'A grounded answer' } }] })
  });
  assert.equal(calls, 2);
  assert.equal(result.choices[0].message.content, 'A grounded answer');
});

test('authentication errors are not retried and do not expose upstream bodies', async () => {
  let calls = 0;
  const logs = [];
  await assert.rejects(requestChatCompletion({}, 'test-key', {
    log: (line) => logs.push(line), fetchImpl: async () => {
      calls += 1;
      return Response.json({ error: { code: 'invalid_api_key', message: 'test-key' } }, { status: 401 });
    }
  }), { code: 'provider_auth_error', status: 503 });
  assert.equal(calls, 1);
  assert.ok(!logs.join('').includes('test-key'));
});

test('long Retry-After is honored by declining an immediate retry', async () => {
  let calls = 0;
  await assert.rejects(requestChatCompletion({}, 'test-key', {
    log() {}, fetchImpl: async () => {
      calls += 1;
      return Response.json({}, { status: 429, headers: { 'retry-after': '60' } });
    }
  }), { code: 'provider_busy', retryAfterSeconds: 60 });
  assert.equal(calls, 1);
});

test('stalled upstream is canceled within the provider budget', async () => {
  await assert.rejects(requestChatCompletion({}, 'test-key', {
    timeoutMs: 20, fetchImpl: (_, { signal }) => new Promise((resolve, reject) => {
      signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')), { once: true });
    })
  }), { code: 'provider_timeout', status: 504 });
  assert.ok(CLIENT_TIMEOUT_MS > PROVIDER_TIMEOUT_MS + 5000);
});

test('browser preserves a structured server error instead of calling it offline', async () => {
  await assert.rejects(fetchAssistantAnswer('Question', {
    fetchImpl: async () => Response.json({ error: 'provider_busy', requestId: 'trace-1' }, { status: 429 })
  }), { code: 'provider_busy', requestId: 'trace-1' });
  assert.equal(failurePresentation('provider_busy', 'en').label, 'Service busy');
  assert.match(failurePresentation('provider_timeout', 'zh').text, /超时/);
});

test('malformed success replies do not render an empty or undefined answer', async () => {
  await assert.rejects(fetchAssistantAnswer('Question', {
    fetchImpl: async () => Response.json({ state: 'complete' })
  }), { code: 'invalid_provider_response' });
});

test('persistent throttling is bounded to two attempts', async () => {
  let calls = 0;
  await assert.rejects(requestChatCompletion({}, 'test-key', {
    log() {}, retryBaseMs: 1, fetchImpl: async () => {
      calls += 1;
      return Response.json({}, { status: 429 });
    }
  }), { code: 'provider_busy', status: 429 });
  assert.equal(calls, 2);
});

test('non-JSON gateway throttling is identified without logging response bodies', async () => {
  const logs = [];
  await assert.rejects(requestChatCompletion({}, 'test-key', {
    log: (line) => logs.push(JSON.parse(line)),
    fetchImpl: async () => new Response('error code: 1015', {
      status: 429, headers: { 'retry-after': '60', server: 'cloudflare', 'content-type': 'text/plain' }
    })
  }), { code: 'provider_busy' });
  assert.equal(logs[0].gatewayCode, '1015');
  assert.equal(logs[0].reason, 'gateway-rate-limit');
  assert.equal(logs[0].responseFormat, 'non-json');
});

test('Cloudflare 1015 is never immediately retried even without Retry-After', async () => {
  let calls = 0;
  await assert.rejects(requestChatCompletion({}, 'test-key', {
    log() {}, retryBaseMs: 1, fetchImpl: async () => {
      calls += 1;
      return new Response('error code: 1015', { status: 429 });
    }
  }), { code: 'provider_busy' });
  assert.equal(calls, 1);
});

test('Worker distinguishes empty model output from a genuine knowledge handoff', async () => {
  const originalFetch = globalThis.fetch;
  const originalError = console.error;
  const request = () => new Request('https://example.com/api/assistant/chat', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ question: 'What can TAC do?' })
  });
  try {
    console.error = () => {};
    globalThis.fetch = async () => Response.json({ choices: [{ message: { content: '' } }] });
    const empty = await worker.fetch(request(), { ASSISTANT_API_KEY: 'test-key' });
    assert.equal(empty.status, 502);
    assert.equal((await empty.json()).error, 'invalid_provider_response');
    globalThis.fetch = async () => Response.json({ choices: [{ message: { content: '__HANDOFF__' } }] });
    const handoff = await worker.fetch(request(), { ASSISTANT_API_KEY: 'test-key' });
    assert.equal(handoff.status, 200);
    assert.equal((await handoff.json()).state, 'no-answer');
  } finally {
    globalThis.fetch = originalFetch;
    console.error = originalError;
  }
});

test('sales handoff works without sending a model request', async () => {
  const response = await worker.fetch(new Request('https://example.com/api/assistant/chat', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ question: 'Contact sales' })
  }), {});
  assert.equal(response.status, 200);
  const result = await response.json();
  assert.equal(result.state, 'sales');
  assert.ok(JSON.stringify(result).includes('tac.aisolution@gmail.com'));
  assert.ok(result.cta.href.startsWith('mailto:tac.aisolution@gmail.com'));
});
