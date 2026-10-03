import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import assert from 'node:assert/strict';

const origin = 'https://greenlight-k53-review.vercel.app';
const events = {};
const entries = new Map();
const key = input => new URL(typeof input === 'string' ? input : input.url, origin + '/').href;
const response = body => ({ status: 200, ok: true, type: 'basic', body, clone() { return response(body); } });
const cache = {
  async addAll(paths) { for (const path of paths) entries.set(key(path), response(path)); },
  async put(input, value) { entries.set(key(input), value); },
};
const caches = {
  async open() { return cache; },
  async keys() { return ['greenlight-k53-v7']; },
  async delete() { return true; },
  async match(input) { return entries.get(key(input)); },
};
let online = true;
const sandbox = {
  URL,
  location: { origin },
  caches,
  Response: { error: () => response('error') },
  fetch: async request => { if (!online) throw new Error('offline'); return response('network:' + key(request)); },
  self: { addEventListener(type, handler) { events[type] = handler; }, skipWaiting: async () => {}, clients: { claim: async () => {} } },
};
runInNewContext(readFileSync('sw.js', 'utf8'), sandbox);
async function dispatch(type, request) {
  let pending;
  const waits = [];
  events[type]({ request, waitUntil(p) { waits.push(p); }, respondWith(p) { pending = p; } });
  const result = pending && await pending;
  await Promise.all(waits);
  return result;
}
await dispatch('install');
assert(entries.has(key('./index.html')) && entries.has(key('./assets/signs/hill.svg')));
const navigation = { url: origin + '/', method: 'GET', mode: 'navigate' };
assert.equal((await dispatch('fetch', navigation)).body, 'network:' + origin + '/');
online = false;
assert.equal((await dispatch('fetch', navigation)).body, 'network:' + origin + '/');
assert.equal((await dispatch('fetch', { ...navigation, url: origin + '/deep-link' })).body, './index.html');
assert.equal((await dispatch('fetch', { url: origin + '/assets/signs/hill.svg', method: 'GET', mode: 'same-origin' })).body, './assets/signs/hill.svg');
console.log('Online refresh, offline navigation and cached sign asset passed.');
