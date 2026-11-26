const test = require('node:test');
const assert = require('node:assert/strict');
const E = require('../engine.js');

const T = '2026-11-26';
function bank(n, topic = 'dicts') {
  return Array.from({ length: n }, (_, i) => ({ id: `q${i}`, topic, type: 'mcq' }));
}
function seen(state, ids, due) {
  ids.forEach(id => { state.cards[id] = { box: 1, due }; });
}

test('date helpers cross month and year', () => {
  assert.equal(E.addDays('2026-12-31', 1), '2027-01-01');
  assert.equal(E.daysBetween('2026-11-26', '2026-12-01'), 5);
  assert.equal(E.localDay(new Date(2026, 10, 26, 23, 59)), '2026-11-26');
});

test('newState starts with 2 freezes and no streak', () => {
  const s = E.newState();
  assert.equal(s.freezes, 2);
  assert.equal(s.streak, 0);
  assert.equal(s.lastDay, null);
});

test('pickSession with nothing due gives 5 new unlocked questions', () => {
  const s = E.newState();
  const ids = E.pickSession(s, bank(10), ['dicts'], T);
  assert.equal(ids.length, 5);
  assert.equal(new Set(ids).size, 5);
});

test('pickSession fills with new when fewer than 3 are due', () => {
  const s = E.newState();
  seen(s, ['q0', 'q1'], T);
  const ids = E.pickSession(s, bank(10), ['dicts'], T);
  assert.equal(ids.length, 5);
  assert.ok(ids.includes('q0') && ids.includes('q1'));
});

test('pickSession uses 3 due + 2 new normally', () => {
  const s = E.newState();
  seen(s, ['q0', 'q1', 'q2', 'q3'], T);
  const ids = E.pickSession(s, bank(14), ['dicts'], T);
  assert.equal(ids.filter(id => ['q0', 'q1', 'q2', 'q3'].includes(id)).length, 3);
  assert.equal(ids.length, 5);
});

test('pickSession after a gap is all review, oldest due first', () => {
  const s = E.newState();
  for (let i = 0; i < 7; i++) s.cards[`q${i}`] = { box: 1, due: E.addDays(T, -i) };
  const ids = E.pickSession(s, bank(20), ['dicts'], T);
  assert.deepEqual(ids, ['q6', 'q5', 'q4', 'q3', 'q2']);
});

test('pickSession never picks locked topics', () => {
  const q = [...bank(3, 'dicts'), { id: 'x', topic: 'classes', type: 'mcq' }];
  const ids = E.pickSession(E.newState(), q, ['dicts'], T);
  assert.equal(ids.length, 3);
  assert.ok(!ids.includes('x'));
});

test('pickSession with an empty bank returns []', () => {
  assert.deepEqual(E.pickSession(E.newState(), [], ['dicts'], T), []);
});

test('pickSession ignores saved cards missing from the bank', () => {
  const s = E.newState();
  seen(s, ['gone1', 'gone2'], T);
  const ids = E.pickSession(s, bank(5), ['dicts'], T);
  assert.equal(ids.length, 5);
  assert.ok(!ids.includes('gone1'));
});

test('recordAnswer moves through Leitner boxes', () => {
  const s = E.newState();
  E.recordAnswer(s, 'a', true, T);
  assert.deepEqual(s.cards.a, { box: 2, due: E.addDays(T, 2) });
  s.cards.b = { box: 5, due: T };
  E.recordAnswer(s, 'b', true, T);
  assert.deepEqual(s.cards.b, { box: 5, due: E.addDays(T, 16) });
  E.recordAnswer(s, 'b', false, T);
  assert.deepEqual(s.cards.b, { box: 1, due: E.addDays(T, 1) });
});

test('completeDay builds a streak and is idempotent per day', () => {
  const s = E.newState();
  assert.equal(E.completeDay(s, T).streak, 1);
  const again = E.completeDay(s, T);
  assert.equal(again.alreadyDone, true);
  assert.equal(s.streak, 1);
  assert.equal(E.completeDay(s, E.addDays(T, 1)).streak, 2);
  assert.deepEqual(s.days, [T, E.addDays(T, 1)]);
});

test('freezes cover a short gap', () => {
  const s = E.newState();
  E.completeDay(s, T);
  const r = E.completeDay(s, E.addDays(T, 2));
  assert.equal(r.streak, 2);
  assert.equal(r.freezesUsed, 1);
  assert.equal(s.freezes, 1);
});

test('a gap longer than the freezes resets the streak and keeps freezes', () => {
  const s = E.newState();
  E.completeDay(s, T);
  const r = E.completeDay(s, E.addDays(T, 4));
  assert.equal(r.streak, 1);
  assert.equal(r.freezesUsed, 0);
  assert.equal(s.freezes, 2);
});

test('every 7th streak day earns a freeze, capped at 3', () => {
  const s = E.newState();
  let r;
  for (let i = 0; i < 7; i++) r = E.completeDay(s, E.addDays(T, i));
  assert.equal(r.freezeEarned, true);
  assert.equal(s.freezes, 3);
  for (let i = 7; i < 14; i++) r = E.completeDay(s, E.addDays(T, i));
  assert.equal(s.freezes, 3);
  assert.equal(r.freezeEarned, false);
  assert.equal(s.best, 14);
});

test('best keeps the maximum after a reset', () => {
  const s = E.newState();
  for (let i = 0; i < 3; i++) E.completeDay(s, E.addDays(T, i));
  E.completeDay(s, E.addDays(T, 10));
  assert.equal(s.streak, 1);
  assert.equal(s.best, 3);
});

test('export/import round-trips and rejects junk', () => {
  const s = E.newState();
  E.recordAnswer(s, 'a', true, T);
  E.completeDay(s, T);
  assert.deepEqual(E.importState(E.exportState(s)), s);
  assert.throws(() => E.importState('nope'));
  assert.throws(() => E.importState('{"v":9}'));
  assert.throws(() => E.importState('{"v":1}'));
});

test('the real question bank gives a full session of known questions', () => {
  const Bank = require('../questions.js');
  const ids = E.pickSession(E.newState(), Bank.QUESTIONS, Bank.UNLOCKED, T);
  assert.equal(ids.length, 5);
  const known = new Set(Bank.QUESTIONS.map(q => q.id));
  ids.forEach(id => assert.ok(known.has(id)));
});
