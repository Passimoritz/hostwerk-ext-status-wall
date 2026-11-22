// Status-Wand, Reiter „Erreichbarkeit“ (bis 1.5 eigene Erweiterung „Uptime-Wand“): alle Erreichbarkeits-Prüfungen
// groß und farbig, mit Verfügbarkeit, Antwortzeit und Verlauf. Gekapselt: eigene Kennungen (up-…) und Texte (up.…).
(function () {
const { html } = Hostwerk;
const t = (k, v) => Hostwerk.t(`up.${k}`, v);
const U = Uptime;
const CLS = { up: 'ok', down: 'err', pending: '' };
const pct = (n) => (n == null ? '–' : `${Hostwerk.fmt.number(n)} %`);
// Bewegung wie in Hostwerk (SDK 3.6): Kacheln erscheinen beim ersten Mal nacheinander, der leere Zustand kommt von Hostwerk.
// Ältere Hostwerk-Versionen kennen ui.empty und die hw-*-Klassen nicht – dann bleibt es wie bisher.
let firstTiles = true;
let names = null; // eigene Anzeigenamen für die Wand { id: Name } (Server-Teil der Erweiterung)
let editing = null; // id der Prüfung, deren Name gerade bearbeitet wird
let lastChecks = [];

function failed(e) {
  // Fehler nie als leeres „–“ stehen lassen: kurz sagen, was los ist, und „Erneut versuchen“ anbieten
  Hostwerk.render('#up-app', html`<div class="empty"><h3>${t('loadFailed')}</h3><p class="small muted">${(e && e.message) || ''}</p><div class="empty-action"><button type="button" class="btn" id="up-retry">${t('retry')}</button></div></div>`);
  document.getElementById('up-retry').addEventListener('click', load);
}

async function load() {
  let d; try { d = await Hostwerk.get('/live/uptime'); } catch (e) { failed(e); return; }
  if (!names) names = await Hostwerk.backend('GET', '/names').then((x) => (x && x.names) || {}).catch(() => ({}));
  lastChecks = Array.isArray(d && d.checks) ? d.checks : [];
  if (!editing) draw(); // beim Umbenennen nicht dazwischenzeichnen (Getipptes bliebe sonst nicht stehen)
}
function draw() {
  const checks = U.applyNames(lastChecks, names);
  const o = U.overall(checks);
  if (!checks.length) {
    const add = html`<button type="button" class="btn primary" id="up-add">${t('addCheck')}</button>`;
    Hostwerk.render('#up-app', Hostwerk.ui.empty ? Hostwerk.ui.empty({ title: t('emptyTitle'), text: t('emptyText'), icon: Hostwerk.raw(PULSE), action: add }) : html`<div class="empty"><h3>${t('emptyTitle')}</h3><p>${t('emptyText')}</p><div class="empty-action">${add}</div></div>`);
    // Hostwerk with SDK 3.11: watchers live under Go live → Monitoring → Watchers (/live/statuspage answers with "path"); older: /live/monitor
    document.getElementById('up-add').addEventListener('click', () => Hostwerk.get('/live/statuspage').then((x) => !!x && x.path !== undefined).catch(() => false)
      .then((now) => Hostwerk.navigate(now ? '/live/ueberwachung/waechter' : '/live/monitor')));
    return;
  }
  const tile = (c, big) => {
    const st = U.state(c);
    const out = U.outages(c.history);
    const label = U.describe(c, { pct, outages: (n) => t('outages', { n }), avg: (ms) => t('avg', { ms: Hostwerk.fmt.number(ms) }), uptime: t('uptime') });
    return html`<div class="card card-pad up-tile ${st}">
      <div class="row-tight"><span class="badge ${CLS[st]}">${t('state.' + st)}</span>${editing != null && String(editing) === String(c.id)
        ? html`<input class="input sm grow up-name-input" id="up-name" data-id="${c.id}" value="${c.wallName ? c.name : ''}" placeholder="${c.origName || c.name}" maxlength="80" aria-label="${t('wallName')}">`
        : html`<b class="grow ellipsis" title="${c.wallName ? t('wallNameOf', { name: c.origName }) : c.name}">${c.name}</b><button type="button" class="btn xs ghost up-rename" data-rename="${c.id}" title="${t('wallName')}" aria-label="${t('wallNameFor', { name: c.name })}">✎</button>`}</div>
      ${big ? html`<div class="up-num">${pct(c.uptime24)}</div><div class="tiny muted">${t('uptime')}${c.avgMs != null ? ' · ' + t('avg', { ms: Hostwerk.fmt.number(c.avgMs) }) : ''}${out ? html` · <span class="c-err">${t('outages', { n: out })}</span>` : ''}</div>
      <svg class="up-spark" viewBox="0 0 120 28" preserveAspectRatio="none" role="img" aria-label="${label}"><title>${label}</title><polyline points="${U.spark(c.history)}" /></svg>${c.error ? html`<div class="tiny c-err ellipsis" title="${c.error}">${c.error}</div>` : ''}` : ''}
    </div>`;
  };
  Hostwerk.render('#up-app', html`<div class="callout ${o.down ? 'err' : o.pending ? '' : 'ok'}" style="margin-bottom: var(--sp-3, 12px)"><div class="callout-body"><b class="callout-title">${o.down ? t('someDown', { n: o.down }) : o.pending ? t('somePending', { n: o.pending }) : t('allUp')}</b>${t('summary', { up: o.up, total: o.total })}</div></div>
    <div class="grid grid-3${firstTiles ? ' hw-stagger' : ''}">${checks.map((c) => tile(c, true))}</div>`);
  firstTiles = false;
  const inp = document.getElementById('up-name');
  if (inp) {
    inp.focus(); inp.select();
    let done = false;
    const finish = (keep) => { if (done) return; done = true; if (keep) saveName(inp.dataset.id, inp.value); else { editing = null; draw(); } };
    inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); finish(true); } else if (e.key === 'Escape') { e.preventDefault(); finish(false); } });
    inp.addEventListener('blur', () => finish(true));
  }
}
async function saveName(id, name) {
  try { const r = await Hostwerk.backend('PUT', '/names', { id, name }); names = (r && r.names) || names; Hostwerk.toast(t(String(name || '').trim() ? 'wallNameSaved' : 'wallNameReset'), { kind: 'success' }); } catch (e) { Hostwerk.toast(e.message, { kind: 'error' }); }
  editing = null; draw();
  const b = document.querySelector(`[data-rename="${CSS.escape(String(id))}"]`); if (b) b.focus();
}
document.addEventListener('click', (e) => { const b = e.target.closest('[data-rename]'); if (b) { editing = b.dataset.rename; draw(); } });
/** Herzschlag (Lucide „activity“, ISC) für den leeren Zustand */
const PULSE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2"/></svg>';
// Nur laden, solange der Reiter zu sehen ist – alle 30 s, beim Zurückkommen und beim Wechsel auf den Reiter sofort
const shown = () => { const sec = document.querySelector('[data-tab="uptime"]'); return !!sec && !sec.hidden && !document.hidden; };
const again = () => { if (shown()) load(); };
window.UptimeWall = { show: () => load() };
Hostwerk.ready().then(() => {
  setInterval(again, 30000);
  document.addEventListener('visibilitychange', again);
  Hostwerk.on('lang', again);
});
}());
