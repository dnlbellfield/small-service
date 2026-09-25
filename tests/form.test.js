import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const script = readFileSync('assets/site.js', 'utf8');

async function submitWith(status) {
  const listeners = {};
  const error = { textContent: '' };
  const button = { disabled: false };
  const destination = [];
  const requests = [];
  const storage = new Map();
  const form = {
    action: 'https://example.netlify.app/thank-you/',
    getAttribute: () => 'quote-request',
    checkValidity: () => true,
    querySelector: selector => selector === '.form-error' ? error : button,
    addEventListener: (name, fn) => { listeners[name] = fn; },
  };
  const context = {
    document: { querySelector: selector => selector === '[data-quote-form]' ? form : null, querySelectorAll: () => [] },
    window: { dataLayer: [], matchMedia: () => ({ matches: false }), location: { assign: url => destination.push(url) } },
    sessionStorage: { setItem: (key, value) => storage.set(key, value) },
    FormData: class { constructor() { this.fields = new Map([['name', 'Test Person'], ['email', 'test@example.com']]); } set(k, v) { this.fields.set(k, v); } *[Symbol.iterator]() { yield* this.fields; } },
    URLSearchParams,
    fetch: async (url, options) => { requests.push({ url, options }); return { ok: status === 200, status }; },
  };
  runInNewContext(script, context);
  let prevented = false;
  await listeners.submit({ preventDefault: () => { prevented = true; } });
  return { requests, destination, storage, error, button, prevented };
}

test('accepted submissions use form encoding and then navigate', async () => {
  const result = await submitWith(200);
  assert.equal(result.prevented, true);
  assert.equal(result.requests[0].url, '/');
  assert.equal(result.requests[0].options.headers['Content-Type'], 'application/x-www-form-urlencoded');
  assert.equal(new URLSearchParams(result.requests[0].options.body).get('form-name'), 'quote-request');
  assert.equal(result.destination.length, 1);
  assert.equal(result.storage.get('quote-request-accepted'), '1');
});

test('rejected submissions stay on the form and show an error', async () => {
  const result = await submitWith(422);
  assert.equal(result.destination.length, 0);
  assert.equal(result.storage.has('quote-request-accepted'), false);
  assert.match(result.error.textContent, /could not be sent/);
  assert.equal(result.button.disabled, false);
});
