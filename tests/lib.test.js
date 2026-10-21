const test = require('node:test');
const assert = require('node:assert');
const W = require('../page/lib.js');
const all = [{ kind: 'web', name: 'B', state: 'running' }, { kind: 'web', name: 'A', state: 'error' }, { kind: 'db', name: 'C', state: 'stopped' }, { kind: 'minecraft', name: 'D', state: 'running' }];

test('Zähler', () => { assert.deepStrictEqual(W.summary(all), { running: 2, problems: 1, busy: 0, stopped: 1, total: 4 }); });
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

test('„startet“ und „stoppt“ zählen nicht als gestoppt', () => {
  const s = W.summary([{ state: 'starting' }, { state: 'stopping' }, { state: 'stopped' }, { state: 'running' }]);
  assert.deepStrictEqual(s, { running: 1, problems: 0, busy: 2, stopped: 1, total: 4 });
});

test('Übersicht: Spiele-Server als eigene Gruppe, Mail-Fänger mit fester ID', () => {
  const list = W.fromOverview({ web: [{ id: 'w', name: 'Web', port: 80, proc: { state: 'running', startedAt: 5 } }], games: [{ id: 'v', name: 'Valheim', running: true, game: 'valheim' }], mail: { config: { smtpPort: 1025 }, proc: { state: 'stopped' } } });
  assert.deepStrictEqual(list.map((s) => [s.kind, s.id, s.state, s.control]), [['web', 'w', 'running', true], ['game', 'v', 'running', true], ['mail', 'mail', 'stopped', true]]);
  assert.deepStrictEqual(W.groups(list).map(([k]) => k), ['web', 'game', 'mail']);
  assert.deepStrictEqual(W.groups([{ kind: 'neu', name: 'X', state: 'running' }]).map(([k]) => k), ['other']);
  assert.deepStrictEqual(W.fromOverview(null), []);
});

test('Knöpfe: Stoppen für laufende, Öffnen für Spiele-Server, nichts im Wechsel', () => {
  assert.deepStrictEqual(W.actions({ control: true, state: 'running' }), ['restart', 'stop']);
  assert.deepStrictEqual(W.actions({ control: true, state: 'error' }), ['start']);
  assert.deepStrictEqual(W.actions({ control: true, state: 'starting' }), []);
  assert.deepStrictEqual(W.actions({ control: false, state: 'running' }), ['open']);
  assert.deepStrictEqual(W.actions({ kind: 'game', control: true, state: 'running' }), ['restart', 'stop', 'open'], 'game servers: control plus their own page');
  assert.deepStrictEqual(W.actions({ kind: 'game', control: true, state: 'stopped' }), ['start', 'open']);
});

test('Verlauf je Dienst und Mini-Linie', () => {
  assert.strictEqual(W.procKey({ kind: 'minecraft', id: 's' }), 'mc:s');
  assert.strictEqual(W.procKey({ kind: 'app', id: 'a' }), 'app:a');
  assert.strictEqual(W.procKey({ kind: 'mail', id: 'mail' }), 'mail');
  assert.strictEqual(W.procKey({ kind: 'web', id: 'w1' }), 'w1');
  const h = W.histories({ procs: [{ id: 'mc:s', history: [{ cpu: 10, memory: 5 }, { cpu: 'x', memory: 7 }] }] });
  assert.deepStrictEqual(h['mc:s'], [{ cpu: 10, memory: 5 }, { cpu: 0, memory: 7 }]);
  assert.strictEqual(W.sparkPoints([0, 50, 100], 100, 24, 100), '0,24 50,12 100,0');
  assert.strictEqual(W.sparkPoints([5]), '', 'ein Wert ist keine Linie');
  assert.deepStrictEqual(W.histories(null), {});
});

test('Erreichbarkeit: gleicher Port auf diesem Rechner oder gleicher Name', () => {
  const checks = [{ name: 'Shop', url: 'https://shop.example.com', ok: true }, { name: 'Lokal', url: 'http://localhost:8080/health', ok: false }];
  assert.strictEqual(W.reachability({ name: 'Blog', port: 8080 }, checks).ok, false);
  assert.strictEqual(W.reachability({ name: 'shop', port: 9000 }, checks).ok, true);
  assert.strictEqual(W.reachability({ name: 'Anders', port: 1234 }, checks), null);
  assert.strictEqual(W.reachability({ name: 'X', port: 80 }, [{ url: 'kaputt' }]), null);
});
