import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { webcrypto } from 'node:crypto';
import { readFileSync } from 'node:fs';
const source = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8');
function randomContext(crypto = webcrypto) {
  const context = vm.createContext({ crypto });
  vm.runInContext(source('shared/secure-random.js'), context);
  return context;
}
test('unbiased bounded sampling rejects the incomplete high range', () => {
  let calls = 0;
  const context = randomContext({ getRandomValues(array) { array[0] = calls++ ? 42 : 0xffffffff; return array; } });
  assert.equal(context.SecureRandom.index(10), 2);
  assert.equal(calls, 2);
});
test('random range and password options reject invalid input', () => {
  const { SecureRandom: random } = randomContext();
  for (const value of [0, -1, NaN, 1.5, 0x100000001]) assert.throws(() => random.index(value));
  for (const value of [0, 7, 129, 8.5, '12']) assert.throws(() => random.password(value, ['abc']));
  for (const groups of [[], [''], null, [false]]) assert.throws(() => random.password(12, groups));
});
test('passwords honor length, alphabet, and every selected character type', () => {
  const random = randomContext().SecureRandom;
  const groups = ['ABCDEFGH', 'abcdefgh', '23456789', '!@#$'];
  for (let i = 0; i < 100; i++) {
    const password = random.password(20, groups);
    assert.equal(password.length, 20);
    assert.match(password, /^[A-Ha-h2-9!@#$]+$/);
    assert.ok(groups.every(group => [...password].some(char => group.includes(char))));
  }
});
test('standalone extension packages contain the canonical cryptographic helper', () => {
  for (const path of ['03-developer-tools/222-password-generator', '10-experimental/974-password-generator']) {
    assert.equal(source(`extensions/${path}/secure-random.js`), source('shared/secure-random.js'));
  }
});
function passwordWorker() {
  const listeners = {}, writes = [];
  const chrome = { runtime: { id: 'test', getURL: path => 'chrome-extension://test/' + path,
    onInstalled: { addListener(fn) { listeners.install = fn; } }, onMessage: { addListener(fn) { listeners.message = fn; } } },
    storage: { local: { set(data) { writes.push(data); } } } };
  const context = vm.createContext({ crypto: webcrypto, chrome });
  context.importScripts = () => vm.runInContext(source('shared/secure-random.js'), context);
  vm.runInContext(source('extensions/10-experimental/974-password-generator/background.js'), context);
  return { context, listeners, writes };
}
test('password settings survive extension updates and initialize only on install', () => {
  const worker = passwordWorker();
  worker.listeners.install({ reason: 'update' });
  assert.equal(worker.writes.length, 0);
  worker.listeners.install({ reason: 'install' });
  assert.equal(worker.writes.length, 1);
});
test('password worker rejects invalid requests and foreign senders', () => {
  const worker = passwordWorker();
  let response;
  worker.listeners.message({ type: 'GENERATE_PASSWORD', options: { length: 0 } }, { id: 'test', url: 'chrome-extension://test/popup.html' }, value => { response = value; });
  assert.ok(response.error);
  response = undefined;
  worker.listeners.message({ type: 'GENERATE_PASSWORD', options: {} }, { id: 'foreign', url: 'https://example.com' }, value => { response = value; });
  assert.equal(response, undefined);
});
test('small-dictionary passphrases disclose real entropy rather than claim Strong', () => {
  const worker = passwordWorker();
  let response;
  worker.listeners.message({ type: 'GENERATE_PASSPHRASE', wordCount: 4 }, { id: 'test', url: 'chrome-extension://test/popup.html' }, value => { response = value; });
  assert.match(response.strength.label, /18 bits/);
  assert.equal(response.passphrase.split('-').length, 4);
  assert.throws(() => vm.runInContext('generatePassphrase(10000)', worker.context));
});
