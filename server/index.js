'use strict';
/*
 * Status-Wand – Server-Teil (SDK 3.0). Nur für die Kiosk-Wand ohne Anmeldung (/v/status-wall/, Recht share:view):
 *   GET /api/x/status-wall/pub/wall → { at, services: [{ key, kind, name, state, startedAt, players, game, reach, cpu, mem }], checks? }
 *   checks (2.0, nur mit Einstellung „kioskUptime“): [{ name, state: 'up'|'down'|'pending', uptime24 }] – ohne Adressen und Fehler
 * Nur lesend, nur mit eingeschalteter Einstellung „Kiosk-Wand ohne Anmeldung“ (sonst 403) und ohne Kennungen, Ports,
 * Pfade oder Adressen (page/lib.js publicWall). Starten und Stoppen gibt es nur auf der Seite in Hostwerk (mit Rückfrage).
 * Offizielles Paket → läuft im Hostwerk-Prozess (Hostwerks API über ctx.audit.selfCall); abgeschottet → host.api mit den
 * Rechten aus dem Manifest (read:services, read:system, read:live).
 */
const W = require('../page/lib.js');
const U = require('../page/uptime-lib.js');

function activate(host) {
  const api = (p) => {
    if (typeof host.api === 'function') return host.api('GET', p);
    const a = host.ctx && host.ctx.audit;
    if (!a || typeof a.selfCall !== 'function') return Promise.reject(new Error('Hostwerk is still starting'));
    return a.selfCall('GET', p);
  };
  const settings = async () => {
    try {
      if (typeof host.settings === 'function') return (await host.settings()) || {};
      return (host.ctx.extMarket && host.ctx.extMarket.settingsFor(host.id)) || {};
    } catch { return {}; }
  };
  // Eine Wand fragt alle paar Sekunden – Hostwerk höchstens alle 5 s
  let memo = null;
  const wall = async () => {
    if (memo && Date.now() - memo.at < 5000) return memo;
    const [o, res, up] = await Promise.all([api('/overview'), api('/system/resources').catch(() => null), api('/live/uptime').catch(() => null)]);
    const checks = (up && up.checks) || [];
    const value = W.publicWall(W.fromOverview(o), W.histories(res), checks);
    memo = { at: Date.now(), value, checks: checks.map((c) => ({ name: String(c.name || ''), state: U.state(c), uptime24: c.uptime24 == null ? null : Number(c.uptime24) })) };
    return memo;
  };
  host.publicRouter.get('/pub/wall', async (req, res) => {
    const st = await settings();
    if (!st.kiosk) return res.status(403).json({ error: 'off' });
    res.setHeader('Cache-Control', 'no-store');
    const m = await wall();
    res.json(st.kioskUptime ? { ...m.value, checks: m.checks } : m.value);
  });
}

module.exports = { activate };
