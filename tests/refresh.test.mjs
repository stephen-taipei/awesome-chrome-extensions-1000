import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
const code = readFileSync(new URL('../extensions/01-productivity/013-auto-refresh/background.js', import.meta.url), 'utf8');
function environment(existing) {
  const state = existing || { sessions: {}, alarms: new Map(), reloads: [], tabs: new Map([[1, { id: 1, url: 'https://example.com/a' }], [2, { id: 2, url: 'https://example.org/b' }]]) };
  const listeners = {};
  const event = name => ({ addListener(fn) { listeners[name] = fn; } });
  const chrome = {
    runtime: { id: 'test', getURL: path => 'chrome-extension://test/' + path, onMessage: event('message') },
    storage: { session: {
      async get() { return { refreshSessions: structuredClone(state.sessions) }; },
      async set(value) { state.sessions = structuredClone(value.refreshSessions); }
    } },
    alarms: {
      onAlarm: event('alarm'), async getAll() { return [...state.alarms.values()]; },
      async get(name) { return state.alarms.get(name); },
      async clear(name) { return state.alarms.delete(name); },
      async create(name, options) { state.alarms.set(name, { name, ...options, scheduledTime: Date.now() + options.delayInMinutes * 60000 }); }
    },
    tabs: {
      onRemoved: event('removed'), onUpdated: event('updated'),
      async get(id) { if (!state.tabs.has(id)) throw new Error('Closed tab'); return state.tabs.get(id); },
      async reload(id) { state.reloads.push(id); }
    }
  };
  const context = vm.createContext({ chrome, URL, console: { warn() {} } });
  vm.runInContext(code, context);
  const idle = () => vm.runInContext('queue', context);
  const send = (type, tabId = 1, interval = 30) => new Promise(resolve => {
    listeners.message({ type, tabId, interval }, { id: 'test', url: chrome.runtime.getURL('popup.html') }, resolve);
  });
  return { state, listeners, idle, send };
}
test('refresh rejects invalid intervals, invalid IDs and restricted pages', async () => {
  const env = environment();
  await env.idle();
  for (const interval of [0, 5, 29, 30.5, 3601, '60']) assert.equal((await env.send('startRefresh', 1, interval)).ok, false);
  assert.equal((await env.send('startRefresh', null)).ok, false);
  env.state.tabs.set(3, { id: 3, url: 'chrome://settings/' });
  assert.equal((await env.send('startRefresh', 3)).ok, false);
  assert.equal(env.state.alarms.size, 0);
});
test('concurrent starts are serialized without dropping another tab', async () => {
  const env = environment();
  const values = await Promise.all([env.send('startRefresh', 1), env.send('startRefresh', 2, 60)]);
  assert.ok(values.every(value => value.ok));
  assert.deepEqual(Object.keys(env.state.sessions), ['1', '2']);
  assert.equal(env.state.alarms.size, 2);
});
test('worker restart retains an existing alarm deadline and session schedule', async () => {
  const first = environment();
  await first.send('startRefresh');
  const deadline = first.state.alarms.get('auto-refresh:1').scheduledTime;
  const second = environment(first.state);
  await second.idle();
  assert.equal(second.state.alarms.get('auto-refresh:1').scheduledTime, deadline);
  second.listeners.alarm({ name: 'auto-refresh:1' });
  await second.idle();
  assert.deepEqual(first.state.reloads, [1]);
});
test('missing alarms are recreated; unrelated-tab/orphan alarms are removed', async () => {
  const first = environment();
  await first.send('startRefresh');
  first.state.alarms.clear();
  const second = environment(first.state);
  await second.idle();
  assert.ok(first.state.alarms.has('auto-refresh:1'));
  first.state.sessions = {}; // browser restart: session storage is empty
  const third = environment(first.state);
  await third.idle();
  assert.equal(first.state.alarms.size, 0);
});
test('stop, closed tabs and cross-origin navigation clean up schedules', async () => {
  const env = environment();
  await env.send('startRefresh');
  await env.send('stopRefresh');
  assert.equal(env.state.alarms.size, 0);
  await env.send('startRefresh');
  env.listeners.updated(1, { url: 'https://different.example/' });
  await env.idle();
  assert.equal(env.state.alarms.size, 0);
  await env.send('startRefresh');
  env.state.tabs.delete(1);
  env.listeners.alarm({ name: 'auto-refresh:1' });
  await env.idle();
  assert.equal(env.state.alarms.size, 0);
  assert.deepEqual(env.state.reloads, []);
});
test('untrusted messages cannot start background refreshes', async () => {
  const env = environment();
  await env.idle();
  let responded = false;
  const result = env.listeners.message({ type: 'startRefresh', tabId: 1, interval: 30 }, { id: 'test', url: 'https://example.com/' }, () => { responded = true; });
  assert.equal(result, false);
  assert.equal(responded, false);
  assert.equal(env.state.alarms.size, 0);
});
