// Status Wall – page. Restarting goes through Hostwerk, which asks the user before anything changes.
const { html, t } = Hostwerk;
const KINDS = ['web', 'db', 'minecraft', 'app', 'mail'];
const STATE_CLASS = { running: 'hw-ok', error: 'hw-err', starting: 'hw-warn', stopping: 'hw-warn' };

function tile(s) {
  const up = s.state === 'running' && s.startedAt ? Hostwerk.fmt.duration(Date.now() - s.startedAt) : null;
  return html`<div class="hw-card tile ${s.state}">
    <div class="kind">${t(`kind.${s.kind}`)}</div>
    <div class="name hw-ellipsis">${s.name}</div>
    <span class="hw-badge ${STATE_CLASS[s.state] || ''}"><span class="hw-dot ${STATE_CLASS[s.state] || ''}"></span>${t(`state.${s.state}`)}</span>
    <div class="meta">${up ? html`<span>${t('uptime', { time: up })}</span>` : ''}${s.port ? html`<span>${t('port', { port: s.port })}</span>` : ''}${s.memory ? html`<span>${Hostwerk.fmt.bytes(s.memory)}</span>` : ''}${s.extra.players ? html`<span>${t('players', { n: s.extra.players.length })}</span>` : ''}</div>
    <div class="actions">${s.state === 'running'
      ? html`<button class="hw-btn hw-sm" data-act="restart" data-kind="${s.kind}" data-id="${s.id}">${t('restart')}</button>`
      : html`<button class="hw-btn hw-sm hw-primary" data-act="start" data-kind="${s.kind}" data-id="${s.id}">${t('start')}</button>`}</div>
  </div>`;
}

async function load() {
  const settings = await Hostwerk.settings.get();
  document.body.className = `size-${settings.size || 'normal'}`;
  let all = await Hostwerk.services();
  const running = all.filter((s) => s.state === 'running').length;
  const problems = all.filter((s) => s.state === 'error').length;
  document.getElementById('sub').textContent = t('summary', { up: running, all: all.length });
  Hostwerk.render('#summary', html`
    <div class="hw-card hw-stat"><div class="hw-k">${t('running')}</div><div class="hw-v">${running}</div></div>
    <div class="hw-card hw-stat"><div class="hw-k">${t('stopped')}</div><div class="hw-v">${all.length - running - problems}</div></div>
    <div class="hw-card hw-stat"><div class="hw-k">${t('problems')}</div><div class="hw-v">${problems}</div></div>`);
  if (!settings.showStopped) all = all.filter((s) => s.state !== 'stopped');
  if (!all.length) return Hostwerk.render('#groups', html`<div class="hw-card hw-empty"><b>${t('empty')}</b>${t('emptyHint')}</div>`);
  const order = (a, b) => (a.state === 'error' ? -1 : 0) - (b.state === 'error' ? -1 : 0) || a.name.localeCompare(b.name);
  const groups = settings.group ? KINDS.map((k) => [k, all.filter((s) => s.kind === k).sort(order)]).filter(([, xs]) => xs.length) : [[null, all.sort(order)]];
  Hostwerk.render('#groups', html`${groups.map(([k, xs]) => html`<section>${k ? html`<h2>${t(`group.${k}`)}</h2>` : ''}<div class="hw-grid">${xs.map(tile)}</div></section>`)}`);
}

document.addEventListener('click', async (e) => {
  const b = e.target.closest('button[data-act]');
  if (!b) return;
  b.disabled = true;
  try {
    const svc = Hostwerk.service(b.dataset.kind, b.dataset.id);
    await (b.dataset.act === 'start' ? svc.start() : svc.restart());
    Hostwerk.toast(t(b.dataset.act === 'start' ? 'starting' : 'restarting'), { kind: 'success' });
  } catch (er) { if (!/declined|abgelehnt/i.test(er.message)) Hostwerk.toast(er.message, { kind: 'error' }); }
  b.disabled = false;
  load();
});

const tick = () => { document.getElementById('clock').textContent = Hostwerk.fmt.time(Date.now()); };
Hostwerk.ready().then(() => {
  tick(); setInterval(tick, 10000);
  load();
  setInterval(load, 15000);
  Hostwerk.on('service', load);
  Hostwerk.on('settings', load);
  Hostwerk.on('lang', load);
});
