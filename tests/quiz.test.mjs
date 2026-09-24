import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
const code = readFileSync(new URL('../extensions/04-entertainment/317-math-quiz/popup.js', import.meta.url), 'utf8');
function quiz() {
  const elements = new Map();
  let now = 1000, timeout;
  const context = vm.createContext({
    document: { addEventListener() {}, getElementById(id) {
      if (!elements.has(id)) elements.set(id, { style: {}, value: '', textContent: '', addEventListener() {}, focus() {} });
      return elements.get(id);
    } },
    Date: { now: () => now }, setInterval: () => 1, clearInterval() {},
    setTimeout(fn) { timeout = fn; return 1; }, clearTimeout() {}
  });
  vm.runInContext(code, context);
  const instance = vm.runInContext('new MathQuiz()', context);
  return { instance, elements, expire() { now = 40000; }, next() { timeout?.(); } };
}
test('one question awards at most one point', () => {
  const { instance } = quiz();
  instance.start();
  const answer = { target: { value: String(instance.currentAnswer) } };
  instance.checkAnswer(answer);
  instance.checkAnswer(answer);
  assert.equal(instance.score, 1);
});
test('empty or partial input cannot score a zero answer', () => {
  const { instance } = quiz();
  instance.start();
  instance.currentAnswer = 0;
  for (const value of ['', ' ', '0x', '0.0']) instance.checkAnswer({ target: { value } });
  assert.equal(instance.score, 0);
  instance.checkAnswer({ target: { value: '0' } });
  assert.equal(instance.score, 1);
});
test('expired games and pending callbacks cannot restart a finished question', () => {
  const env = quiz();
  env.instance.start();
  env.instance.checkAnswer({ target: { value: String(env.instance.currentAnswer) } });
  env.expire();
  env.next();
  assert.equal(env.instance.playing, false);
  assert.match(env.elements.get('problem').textContent, /Time's up/);
  env.instance.newProblem();
  assert.match(env.elements.get('problem').textContent, /Time's up/);
  assert.equal(env.elements.get('answer').disabled, true);
});
