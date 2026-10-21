// Status Wall – page. Starting, stopping and restarting go through Hostwerk, which asks the user before anything changes –
// game servers too (SDK 2.10: control:services covers them). The kiosk wall without sign-in is page/kiosk.html (/v/status-wall/).
const { html, t } = Hostwerk;
const W = StatusWall;
const STATE_CLASS = { running: 'ok', error: 'err', starting: 'warn', stopping: 'warn' };
const ROUTE = { game: '/spiele/' };
let data = null; // { all, hist, checks, at } – zuletzt geladen; bleibt bei Fehlern stehen
let failed = false;

/** Mini-Verlauf: CPU (Linie in Akzentfarbe) und Arbeitsspeicher (zweite Linie), mit Textalternative. */
function spark(s) {
  const h = data.hist[W.procKey(s)];
  if (!h || h.length < 2) return '';
  const cpu = W.sparkPoints(h.map((x) => x.cpu), 100, 24, 100);
  const mem = W.sparkPoints(h.map((x) => x.memory), 100, 24);
  const last = h[h.length - 1];
  const label = t('sparkLabel', { cpu: Hostwerk.fmt.number(Math.round(last.cpu)), mem: Hostwerk.fmt.bytes(last.memory) });
  return html`<svg class="spark" viewBox="0 0 100 24" preserveAspectRatio="none" role="img" aria-label="${label}"><title>${label}</title>
    <polyline class="spark-mem" points="${mem}"/><polyline class="spark-cpu" points="${cpu}"/></svg>`;
}

function tile(s) {
  const up = s.state === 'running' && s.startedAt ? Hostwerk.fmt.duration(Date.now() - s.startedAt) : null;
  const reach = s.state === 'running' ? W.reachability(s, data.checks) : null;
  const btn = (act) => (act === 'open'
    ? html`<button type="button" class="btn sm" data-act="open" data-kind="${s.kind}" data-id="${s.id}">${t('open')}</button>`
    : html`<button type="button" class="btn sm ${act === 'start' ? 'primary' : act === 'stop' ? 'ghost' : ''}" data-act="${act}" data-kind="${s.kind}" data-id="${s.id}" aria-label="${t(act + 'Named', { name: s.name })}">${t(act)}</button>`);
  return html`<div class="card card-pad tile ${s.state}">
    <div class="kind">${t(`kind.${s.kind}`)}</div>
    <div class="name ellipsis">${s.name}</div>
    <div class="row-tight" style="flex-wrap: wrap">
      <span class="badge ${STATE_CLASS[s.state] || ''}"><span class="dot ${STATE_CLASS[s.state] || ''}"></span>${t(`state.${s.state}`)}</span>
      ${reach ? html`<span class="badge ${reach.ok === false ? 'err' : reach.ok ? 'ok' : ''}" title="${t('reachHint', { name: reach.name })}">${t(reach.ok === false ? 'unreachable' : reach.ok ? 'reachable' : 'reachUnknown')}</span>` : ''}
    </div>
    <div class="meta">${up ? html`<span>${t('uptime', { time: up })}</span>` : ''}${s.port ? html`<span>${t('port', { port: s.port })}</span>` : ''}${s.memory ? html`<span>${Hostwerk.fmt.bytes(s.memory)}</span>` : ''}${s.extra.players ? html`<span>${t('players', { n: Hostwerk.fmt.number(s.extra.players.length) })}</span>` : ''}</div>
    ${spark(s)}
    <div class="actions">${W.actions(s).map(btn)}</div>
  </div>`;
}

async function fetchAll() {
  // Grundlage ist /overview (auch Spiele-Server); Auslastung und Erreichbarkeit sind Zusätze, die fehlen dürfen
  const [o, res, up] = await Promise.all([Hostwerk.get('/overview'), Hostwerk.get('/system/resources').catch(() => null), Hostwerk.get('/live/uptime').catch(() => null)]);
  return { all: W.fromOverview(o), hist: W.histories(res), checks: (up && up.checks) || [], at: Date.now() };
}

async function load() {
  try { data = await fetchAll(); failed = false; } catch { failed = true; }
  render();
}

async function render() {
  const settings = await Hostwerk.settings.get();
  document.body.className = `size-${settings.size || 'normal'}`;
  if (!data) {
    if (failed) {
      Hostwerk.render('#groups', html`<div class="card card-pad empty"><h3>${t('loadFailed')}</h3><div class="empty-action"><button type="button" class="btn" data-act="retry">${t('retry')}</button></div></div>`);
      document.getElementById('sub').textContent = '';
    }
    return;
  }
  const { all } = data;
  const sum = W.summary(all);
  document.getElementById('sub').textContent = failed ? t('stale', { time: Hostwerk.fmt.time(data.at) }) : t('summary', { up: sum.running, all: sum.total });
  Hostwerk.render('#summary', html`
    <div class="card card-pad stat"><div class="k">${t('running')}</div><div class="v">${Hostwerk.fmt.number(sum.running)}</div></div>
    <div class="card card-pad stat"><div class="k">${t('busy')}</div><div class="v">${Hostwerk.fmt.number(sum.busy)}</div></div>
    <div class="card card-pad stat"><div class="k">${t('stopped')}</div><div class="v">${Hostwerk.fmt.number(sum.stopped)}</div></div>
    <div class="card card-pad stat"><div class="k">${t('problems')}</div><div class="v">${Hostwerk.fmt.number(sum.problems)}</div></div>
    ${failed ? html`<div class="callout warn"><div class="callout-body">${t('refreshFailed')} <button type="button" class="btn xs" data-act="retry">${t('retry')}</button></div></div>` : ''}`);
  const groups = W.groups(all, { group: settings.group !== false, showStopped: settings.showStopped !== false });
  drawKiosk(settings);
  if (!groups.length) return Hostwerk.render('#groups', html`<div class="card card-pad empty"><b>${t('empty')}</b>${t('emptyHint')}</div>`);
  Hostwerk.render('#groups', html`${groups.map(([k, xs]) => html`<section>${k ? html`<h2>${t(`group.${k}`)}</h2>` : ''}<div class="grid-auto">${xs.map(tile)}</div></section>`)}`);
  return undefined;
}

/** Address of the kiosk wall (public view) – for a second screen or a tablet, without Hostwerk around it. */
const kioskUrl = () => { let origin = ''; try { origin = new URL(document.referrer).origin; } catch { /* Adresse steht auch in der Detailansicht der Erweiterung */ } return `${origin}/v/status-wall/`; };
function drawKiosk(settings) {
  Hostwerk.render('#kiosk', html`<div class="card card-pad stack"><b>${t('kioskTitle')}</b>${settings.kiosk
    ? html`<div class="row-tight"><code class="grow ellipsis">${kioskUrl()}</code><button type="button" class="btn sm" data-act="copy-kiosk">${t('copyLink')}</button></div><p class="muted small">${t('kioskHint')}</p>`
    : html`<p class="muted small">${t('kioskOff')}</p><div><button type="button" class="btn sm" data-act="settings">${t('settings')}</button></div>`}</div>`);
}

document.addEventListener('click', async (e) => {
  const b = e.target.closest('button[data-act]');
  if (!b) return;
  const act = b.dataset.act;
  if (act === 'retry') return load();
  if (act === 'copy-kiosk') return Hostwerk.copy(kioskUrl()).catch(() => {});
  if (act === 'settings') return Hostwerk.settings.open().catch(() => {});
  if (act === 'open') return Hostwerk.navigate(`${ROUTE[b.dataset.kind] || '/'}${b.dataset.id}`);
  b.disabled = true;
  try {
    const svc = Hostwerk.service(b.dataset.kind, b.dataset.id);
    await (act === 'start' ? svc.start() : act === 'stop' ? svc.stop() : svc.restart());
    Hostwerk.toast(t({ start: 'starting', stop: 'stopping', restart: 'restarting' }[act]), { kind: 'success' });
  } catch (er) { if (!/declined|abgelehnt/i.test(er.message)) Hostwerk.toast(er.message, { kind: 'error' }); }
  b.disabled = false;
  load();
});

const tick = () => { document.getElementById('clock').textContent = Hostwerk.fmt.time(Date.now()); };
Hostwerk.ready().then(() => {
  tick(); setInterval(tick, 10000);
  load();
  // Alle 15 s nachladen – nicht, solange die Seite versteckt ist; beim Zurückkommen sofort
  setInterval(() => { if (!document.hidden) load(); }, 15000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) { tick(); load(); } });
  Hostwerk.on('service', load);
  Hostwerk.on('settings', render);
  Hostwerk.on('lang', render);
});
