import test from 'node:test';
import assert from 'node:assert/strict';
import { requestAgnesCompletion } from '../server/tac-assistant-provider.js';
import { fetchAssistantAnswer, failurePresentation } from '../src/js/tac-assistant-client.js';
import { CLIENT_TIMEOUT_MS, PROVIDER_TIMEOUT_MS } from '../src/data/tac-assistant-runtime.js';
import worker from '../worker.js';

test('temporary provider rejection retries once and returns the real answer', async () => {
  let calls = 0;
  const result = await requestAgnesCompletion({}, 'test-key', {
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
  await assert.rejects(requestAgnesCompletion({}, 'test-key', {
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
  await assert.rejects(requestAgnesCompletion({}, 'test-key', {
    log() {}, fetchImpl: async () => {
      calls += 1;
      return Response.json({}, { status: 429, headers: { 'retry-after': '60' } });
    }
  }), { code: 'provider_busy', retryAfterSeconds: 60 });
  assert.equal(calls, 1);
});

test('stalled upstream is canceled within the provider budget', async () => {
  await assert.rejects(requestAgnesCompletion({}, 'test-key', {
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
  await assert.rejects(requestAgnesCompletion({}, 'test-key', {
    log() {}, retryBaseMs: 1, fetchImpl: async () => {
      calls += 1;
      return Response.json({}, { status: 429 });
    }
  }), { code: 'provider_busy', status: 429 });
  assert.equal(calls, 2);
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
    const empty = await worker.fetch(request(), { AGNES_API_KEY: 'test-key' });
    assert.equal(empty.status, 502);
    assert.equal((await empty.json()).error, 'invalid_provider_response');
    globalThis.fetch = async () => Response.json({ choices: [{ message: { content: '__HANDOFF__' } }] });
    const handoff = await worker.fetch(request(), { AGNES_API_KEY: 'test-key' });
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
  assert.equal((await response.json()).state, 'sales');
});
