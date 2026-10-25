'use strict';
/*
 * Kiosk-Wand ohne Anmeldung: nur lesend, ohne Kennungen/Ports/Adressen, nur mit Freigabe – im Hostwerk-Prozess
 * (ctx.audit.selfCall) und abgeschottet (host.api).
 */
const test = require('node:test');
const assert = require('node:assert');
const W = require('../page/lib.js');
const { activate } = require('../server/index.js');

const OVERVIEW = {
  web: [{ id: 'w1', name: 'Shop', port: 8080, dir: 'C:/secret/shop', proc: { state: 'running', startedAt: 1000, stats: { memory: 5 } } }],
  minecraft: [{ id: 'mc', name: 'Survival', port: 25565, proc: { state: 'running', extra: { players: ['Steve'] } } }],
  games: [{ id: 'v', name: 'Valheim', game: 'Valheim', running: false }],
};
const RES = { procs: [{ id: 'w1', history: [{ cpu: 10, memory: 100 }, { cpu: 20, memory: 120 }] }] };
const UP = { checks: [{ name: 'Shop', url: 'http://localhost:8080/', ok: true, ms: 12 }] };

test('publicWall: names and state only – no ids, ports or paths', () => {
  const r = W.publicWall(W.fromOverview(OVERVIEW), W.histories(RES), UP.checks, 7);
  assert.strictEqual(r.at, 7);
  assert.deepStrictEqual(r.services.map((s) => [s.kind, s.name, s.state, s.players, s.reach]), [['web', 'Shop', 'running', null, { ok: true }], ['minecraft', 'Survival', 'running', 1, null], ['game', 'Valheim', 'stopped', null, null]]);
  assert.deepStrictEqual(r.services[0].cpu, [10, 20]);
  const text = JSON.stringify(r);
  for (const bad of ['8080', '25565', 'secret', '"w1"', '"mc"', 'localhost']) assert.ok(!text.includes(bad), bad);
  assert.deepStrictEqual(W.summary(r.services), { running: 2, problems: 0, busy: 0, stopped: 1, total: 3 });
});

function fakeHost({ sandboxed, settings }) {
  const pub = {}; const seen = [];
  const answer = (p) => { seen.push(p); return { '/overview': OVERVIEW, '/system/resources': RES, '/live/uptime': UP }[p]; };
  const host = { id: 'status-wall', sandboxed, publicRouter: { get: (p, fn) => { pub[p] = fn; } } };
  if (sandboxed) { host.api = async (m, p) => answer(p); host.settings = async () => settings; } else host.ctx = { audit: { selfCall: async (m, p) => answer(p) }, extMarket: { settingsFor: () => settings } };
  return { host, pub, seen };
}
const call = async (fn) => { let status = 200; let body = null; const res = { status(s) { status = s; return res; }, json(b) { body = b; return res; }, setHeader() {} }; await fn({ query: {} }, res); return { status, body }; };

test('server part: 403 until shared, then the wall – in Hostwerk’s process and sandboxed', async () => {
  const off = fakeHost({ sandboxed: false, settings: { kiosk: false } });
  activate(off.host);
  assert.strictEqual((await call(off.pub['/pub/wall'])).status, 403);
  for (const sandboxed of [false, true]) {
    const { host, pub, seen } = fakeHost({ sandboxed, settings: { kiosk: true } });
    activate(host);
    const r = await call(pub['/pub/wall']);
    assert.strictEqual(r.status, 200);
    assert.strictEqual(r.body.services.length, 3);
    await call(pub['/pub/wall']);
    assert.strictEqual(seen.filter((p) => p === '/overview').length, 1, 'cached for a few seconds');
  }
});

test('2.0: uptime checks on the kiosk wall only with “kioskUptime” – name, state, availability, never the address', async () => {
  const plain = fakeHost({ sandboxed: true, settings: { kiosk: true } });
  activate(plain.host);
  assert.strictEqual((await call(plain.pub['/pub/wall'])).body.checks, undefined);
  const { host, pub } = fakeHost({ sandboxed: true, settings: { kiosk: true, kioskUptime: true } });
  activate(host);
  const r = await call(pub['/pub/wall']);
  assert.deepStrictEqual(r.body.checks, [{ name: 'Shop', state: 'up', uptime24: null }]);
  assert.ok(!JSON.stringify(r.body.checks).includes('localhost'));
});
