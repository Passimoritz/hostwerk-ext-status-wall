'use strict';
/*
 * Status-Wand – Server-Teil (SDK 3.0). Nur für die Kiosk-Wand ohne Anmeldung (/v/status-wall/, Recht share:view):
 *   GET /api/x/status-wall/pub/wall → { at, services: [{ key, kind, name, state, startedAt, players, game, reach, cpu, mem }], checks? }
 *   checks (2.0, nur mit Einstellung „kioskUptime“): [{ name, state: 'up'|'down'|'pending', uptime24 }] – ohne Adressen und Fehler
 *   (Prüfungen ohne eigenen Namen liefert Hostwerk mit der Adresse als Namen – dann name: '', die Wand zeigt „Prüfung n“)
 * Nur lesend, nur mit eingeschalteter Einstellung „Kiosk-Wand ohne Anmeldung“ (sonst 403) und ohne Kennungen, Ports,
 * Pfade oder Adressen (page/lib.js publicWall). Starten und Stoppen gibt es nur auf der Seite in Hostwerk (mit Rückfrage).
 * Offizielles Paket → läuft im Hostwerk-Prozess (Hostwerks API über ctx.audit.selfCall); abgeschottet → host.api mit den
 * Rechten aus dem Manifest (read:services, read:system, read:live).
 */
const fs = require('fs');
const path = require('path');
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
  // Eigene Anzeigenamen der Prüfungen für die Wand (2.1): eigener Datenordner, Hostwerks Prüfungen bleiben unverändert
  const namesFile = () => { try { return host.dataDir ? path.join(host.dataDir, 'check-names.json') : null; } catch { return null; } };
  const readNames = () => { const f = namesFile(); if (!f) return {}; try { return JSON.parse(fs.readFileSync(f, 'utf8')) || {}; } catch { return {}; } };
  const writeNames = (names) => { const f = namesFile(); if (!f) throw Object.assign(new Error('No data folder'), { status: 501 }); fs.writeFileSync(`${f}.tmp`, JSON.stringify(names)); fs.renameSync(`${f}.tmp`, f); };
  if (host.router) {
    host.router.get('/names', (req, res) => res.json({ names: readNames() }));
    host.router.put('/names', (req, res) => {
      const b = req.body || {};
      if (b.id == null || String(b.id) === '') return res.status(400).json({ error: 'id missing' });
      const names = U.setName(readNames(), b.id, b.name);
      try { writeNames(names); } catch (e) { return res.status(e.status || 500).json({ error: e.message }); }
      memo = null; // Kiosk-Wand gleich mit neuem Namen
      return res.json({ names });
    });
  }
  // Eine Wand fragt alle paar Sekunden – Hostwerk höchstens alle 5 s
  let memo = null;
  const wall = async () => {
    if (memo && Date.now() - memo.at < 5000) return memo;
    const [o, res, up] = await Promise.all([api('/overview'), api('/system/resources').catch(() => null), api('/live/uptime').catch(() => null)]);
    const checks = U.applyNames((up && up.checks) || [], readNames());
    const value = W.publicWall(W.fromOverview(o), W.histories(res), checks);
    memo = { at: Date.now(), value, checks: checks.map((c) => ({ name: c.wallName || (c.name && c.name !== c.url) ? String(c.name).slice(0, 80) : '', state: U.state(c), uptime24: c.uptime24 == null ? null : Number(c.uptime24) })) };
    return memo;
  };
  const pubWall = async (req, res) => {
    const st = await settings();
    res.setHeader('Cache-Control', 'no-store');
    if (!st.kiosk) return res.status(403).json({ error: 'off' });
    const m = await wall();
    return res.json(st.kioskUptime ? { ...m.value, checks: m.checks } : m.value);
  };
  // Im Hostwerk-Prozess kommt der Pfad mit /pub an, abgeschottet (Entwickler-Modus, eigener Ordner) ohne – beide bedienen
  host.publicRouter.get('/pub/wall', pubWall);
  host.publicRouter.get('/wall', pubWall);
}

module.exports = { activate };
