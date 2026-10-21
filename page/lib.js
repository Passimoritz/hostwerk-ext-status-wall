/* StatusWall – pure logic without DOM, tested in tests/lib.test.js (node --test). */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api; else root.StatusWall = api;
}(typeof self !== 'undefined' ? self : this, () => {
  const KINDS = ['web', 'db', 'minecraft', 'game', 'app', 'mail'];
  /** Zustände „im Wechsel“ – weder laufend noch gestoppt. */
  const BUSY = ['starting', 'stopping'];

  /**
   * Alle Dienste aus GET /overview – wie Hostwerk.services(), aber auch Spiele-Server (nur „läuft ja/nein“ bekannt;
   * steuerbar seit SDK 2.10 über Hostwerk.service('game', id) mit dem Recht control:services) und der Mail-Fänger mit fester ID.
   */
  function fromOverview(o) {
    const x = o || {};
    const pick = (kind, xs) => (Array.isArray(xs) ? xs : []).filter(Boolean).map((s) => ({
      kind, id: String(s.id), name: s.name || String(s.id), state: (s.proc && s.proc.state) || 'stopped', port: s.port || null,
      memory: s.proc && s.proc.stats ? s.proc.stats.memory : null, startedAt: s.proc ? s.proc.startedAt : null, extra: (s.proc && s.proc.extra) || {}, control: true,
    }));
    return [
      ...pick('web', x.web), ...pick('db', x.db), ...pick('minecraft', x.minecraft),
      ...(Array.isArray(x.games) ? x.games : []).filter(Boolean).map((g) => ({ kind: 'game', id: String(g.id), name: g.name || String(g.id), state: g.running ? 'running' : 'stopped', port: null, memory: null, startedAt: null, extra: { game: g.game || null }, control: true })),
      ...pick('app', x.apps),
      ...(x.mail ? pick('mail', [{ ...x.mail, id: 'mail', name: 'Mail', port: x.mail.config ? x.mail.config.smtpPort : null }]) : []),
    ];
  }

  /** Zähler für die Kopfzeile: „startet“/„stoppt“ zählen extra, nicht als gestoppt. */
  function summary(all) {
    const list = all || [];
    const count = (f) => list.filter(f).length;
    const running = count((s) => s.state === 'running');
    const problems = count((s) => s.state === 'error');
    const busy = count((s) => BUSY.includes(s.state));
    return { running, problems, busy, stopped: list.length - running - problems - busy, total: list.length };
  }

  /** Gruppen nach Art (oder eine Gruppe); Fehler zuerst, dann Name. showStopped=false blendet Gestoppte aus. */
  function groups(all, { group = true, showStopped = true } = {}) {
    let list = [...(all || [])];
    if (!showStopped) list = list.filter((s) => s.state !== 'stopped');
    const order = (a, b) => (a.state === 'error' ? -1 : 0) - (b.state === 'error' ? -1 : 0) || String(a.name).localeCompare(String(b.name));
    if (!group) return list.length ? [[null, list.sort(order)]] : [];
    const known = KINDS.map((k) => [k, list.filter((s) => s.kind === k).sort(order)]);
    const other = list.filter((s) => !KINDS.includes(s.kind)).sort(order);
    return [...known, ['other', other]].filter(([, xs]) => xs.length);
  }

  /**
   * Welche Knöpfe eine Kachel hat: im Wechsel keine; Spiele-Server zusätzlich „Öffnen“ (Konsole, Spieler auf ihrer Seite).
   * Ohne Steuerung (control: false) nur „Öffnen“.
   */
  function actions(s) {
    if (!s.control) return ['open'];
    if (BUSY.includes(s.state)) return [];
    const base = s.state === 'running' ? ['restart', 'stop'] : ['start'];
    return s.kind === 'game' ? [...base, 'open'] : base;
  }

  /** Schlüssel eines Dienstes in /system/resources (procs[].id). */
  function procKey(s) {
    if (s.kind === 'minecraft') return `mc:${s.id}`;
    if (s.kind === 'app') return `app:${s.id}`;
    if (s.kind === 'mail') return 'mail';
    return s.id;
  }
  /** Verlauf je Dienst aus /system/resources: { key → [{ cpu, memory }] } (die letzten n Werte). */
  function histories(res, n = 30) {
    const out = {};
    for (const p of (res && Array.isArray(res.procs) ? res.procs : [])) out[p.id] = (p.history || []).slice(-n).map((h) => ({ cpu: Number(h.cpu) || 0, memory: Number(h.memory) || 0 }));
    return out;
  }
  /** Punkte einer Mini-Linie (SVG polyline) in einem w×h-Feld; max = oberer Rand (mindestens 1). */
  function sparkPoints(values, w = 100, h = 24, max = null) {
    const v = (values || []).map((x) => (Number.isFinite(x) ? x : 0));
    if (v.length < 2) return '';
    const top = Math.max(1, max == null ? Math.max(...v) : max);
    return v.map((x, i) => `${Math.round((i / (v.length - 1)) * w * 10) / 10},${Math.round((h - (Math.min(x, top) / top) * h) * 10) / 10}`).join(' ');
  }

  /**
   * Erreichbarkeit aus der Uptime-Prüfung (/live/uptime) zu einem Dienst: gleicher Port auf diesem Rechner
   * (localhost/127.0.0.1) oder gleicher Name. null = keine passende Prüfung.
   */
  function reachability(s, checks) {
    const local = /^(localhost|127\.0\.0\.1|\[::1\])$/i;
    for (const c of checks || []) {
      let match = c.name && s.name && String(c.name).toLowerCase() === String(s.name).toLowerCase();
      if (!match && s.port) { try { const u = new URL(c.url); match = local.test(u.hostname) && Number(u.port || (u.protocol === 'https:' ? 443 : 80)) === Number(s.port); } catch { /* keine URL */ } }
      if (match) return { ok: c.ok, name: c.name, ms: c.ms };
    }
    return null;
  }

  /**
   * Kiosk-Wand ohne Anmeldung (/v/status-wall/, Recht share:view): nur lesend und nur, was eine Wand zeigt –
   * Art, Name, Zustand, seit wann, Spielerzahl, Erreichbarkeit, Mini-Verlauf. Keine Kennungen, Ports, Pfade oder Adressen.
   * → { at, services: [{ key, kind, name, state, startedAt, players, game, reach, cpu, mem }] }
   */
  function publicWall(all, hist, checks, now = Date.now()) {
    const services = (all || []).map((s, i) => {
      const h = (hist || {})[procKey(s)] || [];
      const reach = s.state === 'running' ? reachability(s, checks) : null;
      return {
        key: `${s.kind}-${i}`, kind: KINDS.includes(s.kind) ? s.kind : 'other', name: String(s.name), state: s.state, startedAt: s.state === 'running' ? s.startedAt || null : null,
        players: Array.isArray(s.extra && s.extra.players) ? s.extra.players.length : null, game: (s.extra && s.extra.game) || null,
        reach: reach ? { ok: reach.ok === undefined ? null : reach.ok } : null,
        cpu: h.map((x) => Math.round(x.cpu * 10) / 10), mem: h.map((x) => x.memory),
      };
    });
    return { at: now, services };
  }

  return { KINDS, BUSY, fromOverview, summary, groups, actions, procKey, histories, sparkPoints, reachability, publicWall };
}));
