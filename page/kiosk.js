// Status Wall – kiosk wall without sign-in (/v/status-wall/, permission share:view). Runs WITHOUT Hostwerk around it:
// no SDK, read only, data only from the extension's own public server part (/api/x/status-wall/pub/wall), texts built in.
// Address options: ?theme=light · ?size=compact|wall · ?stopped=0 (hide stopped) · ?group=0 (one list) · ?lang=de
(function () {
  const W = StatusWall;
  const q = new URLSearchParams(location.search);
  const lang = (q.get('lang') || navigator.language || 'en').slice(0, 2) === 'de' ? 'de' : 'en';
  const DE = lang === 'de';
  const TX = DE
    ? { title: 'Status-Wand', running: 'Läuft', busy: 'Im Wechsel', stopped: 'Gestoppt', problems: 'Probleme', summary: (u, a) => `${u} von ${a} Diensten laufen`, stale: (t) => `Stand ${t} – Hostwerk antwortet gerade nicht`, off: 'Die Kiosk-Wand ist in Hostwerk nicht freigegeben (Einstellungen → Erweiterungen → Status-Wand).', empty: 'Keine Dienste', full: 'Vollbild', fullOff: 'Vollbild beenden',
      kind: { web: 'Webserver', db: 'Datenbank', minecraft: 'Minecraft', game: 'Spiele-Server', app: 'App', mail: 'E-Mail', other: 'Sonstiges' }, group: { web: 'Webserver', db: 'Datenbanken', minecraft: 'Minecraft', game: 'Spiele-Server', app: 'Apps', mail: 'E-Mail', other: 'Sonstiges' },
      state: { running: 'läuft', stopped: 'gestoppt', error: 'Fehler', starting: 'startet …', stopping: 'stoppt …' }, reachable: 'erreichbar', unreachable: 'nicht erreichbar', reachUnknown: 'wird geprüft', up: (d) => `seit ${d}`, players: (n) => `${n} Spieler`, spark: (c) => `Zuletzt ${c} % CPU` }
    : { title: 'Status Wall', running: 'Running', busy: 'Changing', stopped: 'Stopped', problems: 'Problems', summary: (u, a) => `${u} of ${a} services running`, stale: (t) => `As of ${t} – Hostwerk does not answer right now`, off: 'The kiosk wall is not shared in Hostwerk (Settings → Extensions → Status Wall).', empty: 'No services', full: 'Full screen', fullOff: 'Leave full screen',
      kind: { web: 'Web server', db: 'Database', minecraft: 'Minecraft', game: 'Game server', app: 'App', mail: 'E-mail', other: 'Other' }, group: { web: 'Web servers', db: 'Databases', minecraft: 'Minecraft', game: 'Game servers', app: 'Apps', mail: 'E-mail', other: 'Other' },
      state: { running: 'running', stopped: 'stopped', error: 'error', starting: 'starting …', stopping: 'stopping …' }, reachable: 'reachable', unreachable: 'not reachable', reachUnknown: 'being checked', up: (d) => `up ${d}`, players: (n) => `${n} players`, spark: (c) => `Last ${c} % CPU` };
  const STATE_CLASS = { running: 'ok', error: 'err', starting: 'warn', stopping: 'warn' };
  const root = document.documentElement;
  root.lang = lang;
  if (q.get('theme') === 'light') root.dataset.theme = 'light';
  if (['compact', 'wall'].includes(q.get('size'))) root.dataset.size = q.get('size');
  const opts = { showStopped: q.get('stopped') !== '0', group: q.get('group') !== '0' };
  const $ = (id) => document.getElementById(id);
  const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
  const num = (n) => Number(n).toLocaleString(DE ? 'de-DE' : 'en-US');
  const time = (t) => new Date(t).toLocaleTimeString(DE ? 'de-DE' : 'en-US', { hour: '2-digit', minute: '2-digit' });
  const dur = (ms) => { const m = Math.floor(ms / 60000); const d = Math.floor(m / 1440); const h = Math.floor((m % 1440) / 60); return d ? `${d} d ${h} h` : h ? `${h} h ${m % 60} min` : `${m} min`; };
  let last = null;
  $('title').textContent = TX.title;
  document.title = TX.title;

  function spark(s) {
    if (!s.cpu || s.cpu.length < 2) return null;
    const ns = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('class', 'spark'); svg.setAttribute('viewBox', '0 0 100 24'); svg.setAttribute('preserveAspectRatio', 'none');
    svg.setAttribute('role', 'img'); svg.setAttribute('aria-label', TX.spark(num(Math.round(s.cpu[s.cpu.length - 1]))));
    for (const [cls, pts] of [['mem', W.sparkPoints(s.mem, 100, 24)], ['cpu', W.sparkPoints(s.cpu, 100, 24, 100)]]) {
      const p = document.createElementNS(ns, 'polyline'); p.setAttribute('class', cls); p.setAttribute('points', pts); svg.append(p);
    }
    return svg;
  }
  function tile(s) {
    const t = el('div', `tile ${s.state}`);
    t.append(el('div', 'kind', s.kind === 'game' && s.game ? `${TX.kind.game} · ${s.game}` : TX.kind[s.kind] || TX.kind.other), el('div', 'name', s.name));
    const b = el('div', 'badges');
    const st = el('span', `badge ${STATE_CLASS[s.state] || ''}`); st.append(el('span', 'dot'), document.createTextNode(TX.state[s.state] || s.state)); b.append(st);
    if (s.reach) b.append(el('span', `badge ${s.reach.ok === false ? 'err' : s.reach.ok ? 'ok' : ''}`, s.reach.ok === false ? TX.unreachable : s.reach.ok ? TX.reachable : TX.reachUnknown));
    t.append(b);
    const meta = el('div', 'meta');
    if (s.startedAt) meta.append(el('span', '', TX.up(dur(Date.now() - s.startedAt))));
    if (s.players != null) meta.append(el('span', '', TX.players(num(s.players))));
    if (meta.childNodes.length) t.append(meta);
    const sp = spark(s); if (sp) t.append(sp);
    return t;
  }
  function draw(data, stale) {
    const all = data.services || [];
    const sum = W.summary(all);
    $('sub').textContent = stale ? TX.stale(time(data.at)) : TX.summary(num(sum.running), num(sum.total));
    $('summary').replaceChildren(...[[TX.running, sum.running], [TX.busy, sum.busy], [TX.stopped, sum.stopped], [TX.problems, sum.problems]].map(([k, v]) => { const c = el('div', 'stat'); c.append(el('div', 'k', k), el('div', 'v', num(v))); return c; }));
    const groups = W.groups(all, opts);
    $('groups').replaceChildren(...(groups.length ? groups.map(([k, xs]) => { const sec = el('section'); if (k) sec.append(el('h2', '', TX.group[k] || TX.group.other)); const g = el('div', 'grid'); g.append(...xs.map(tile)); sec.append(g); return sec; }) : [el('p', 'note', TX.empty)]));
  }
  function note(text, warn) { $('note').hidden = !text; $('note').textContent = text || ''; $('note').className = `note ${warn ? 'warn' : ''}`; }
  async function load() {
    try {
      const r = await fetch('/api/x/status-wall/pub/wall', { cache: 'no-store' });
      if (r.status === 403) { $('summary').replaceChildren(); $('groups').replaceChildren(); $('sub').textContent = ''; note(TX.off, true); return; }
      if (!r.ok) throw new Error(String(r.status));
      last = await r.json(); note(''); draw(last, false);
    } catch { if (last) draw(last, true); else note(TX.stale(time(Date.now())), true); }
  }
  const tick = () => { $('clock').textContent = time(Date.now()); };
  // Vollbild – nur, wo der Browser es erlaubt (Kiosk-Browser haben es meist ohnehin)
  const full = $('full');
  if (document.fullscreenEnabled) {
    full.hidden = false;
    const label = () => { full.textContent = document.fullscreenElement ? TX.fullOff : TX.full; };
    label();
    full.addEventListener('click', () => { (document.fullscreenElement ? document.exitFullscreen() : root.requestFullscreen()).catch(() => {}); });
    document.addEventListener('fullscreenchange', label);
  }
  tick(); load();
  setInterval(tick, 10000);
  setInterval(load, 15000);
}());
