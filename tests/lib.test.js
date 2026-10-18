const test = require('node:test');
const assert = require('node:assert');
const W = require('../page/lib.js');
const all = [{ kind: 'web', name: 'B', state: 'running' }, { kind: 'web', name: 'A', state: 'error' }, { kind: 'db', name: 'C', state: 'stopped' }, { kind: 'minecraft', name: 'D', state: 'running' }];

test('Zähler', () => { assert.deepStrictEqual(W.summary(all), { running: 2, problems: 1, stopped: 1, total: 4 }); });
test('nach Art gruppiert, Fehler zuerst', () => {
  const g = W.groups(all);
  assert.deepStrictEqual(g.map(([k]) => k), ['web', 'db', 'minecraft']);
  assert.deepStrictEqual(g[0][1].map((s) => s.name), ['A', 'B']);
});
test('Gestoppte ausblenden, ohne Gruppen', () => {
  const g = W.groups(all, { group: false, showStopped: false });
  assert.strictEqual(g.length, 1); assert.ok(!g[0][1].some((s) => s.state === 'stopped'));
  assert.deepStrictEqual(W.groups([], { group: false }), []);
});
