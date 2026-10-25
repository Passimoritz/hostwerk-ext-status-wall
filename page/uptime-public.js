// Status-Wand, Reiter „Öffentliche Statusseite“ (bis 1.5 Uptime-Wand) – öffentliche Statusseite einrichten (Kern: /live/statuspage). Besucher sehen nur Namen, Zustand,
// Verfügbarkeit und Verlauf – keine Adressen (außer gewollt), keine Fehlermeldungen. Jede Änderung bestätigt der Nutzer.
(function () {
  const { html, raw } = Hostwerk;
  const t = (k, v) => Hostwerk.t(`up.${k}`, v); // eigene Texte (up.…) neben denen der Status-Wand
  const $ = (id) => document.getElementById(`up-${id}`);
  const declined = (e) => /Abgelehnt|Declined/.test(e.message);
  const fail = (e) => { if (!declined(e)) Hostwerk.toast(e.message, { kind: 'error' }); };
  let s = null;
  async function load() {
    try { s = await Hostwerk.get('/live/statuspage'); } catch (e) { Hostwerk.render('#pub', html`<div class="card"><div class="empty"><h3>${t('pubUnavailable')}</h3><p>${e.message}</p></div></div>`); return; }
    render();
  }
  const save = async (b, msg) => { try { s = await Hostwerk.put('/live/statuspage', b); if (msg) Hostwerk.toast(msg, { kind: 'success' }); } catch (e) { fail(e); } render(); };
  function render() {
    const picked = (id) => !s.checks.length || s.checks.includes(id);
    const link = (u) => html`<div class="row-tight up-link"><code class="grow ellipsis" title="${u}">${u}</code><button class="btn xs ghost" data-copy="${u}">${t('copy')}</button><button class="btn xs ghost" data-open="${u}">${t('open')}</button></div>`;
    Hostwerk.render('#pub', html`
      <div class="grid grid-2">
        <div class="stack">
          <div class="card card-pad stack">
            <div class="setting-row"><div class="txt"><b>${t('pubTitle')}</b><span>${t('pubHint')}</span></div><label class="switch"><input type="checkbox" id="up-on" ${s.on ? raw('checked') : ''} aria-label="${t('pubTitle')}"><span class="track"></span><span class="thumb"></span></label></div>
            ${s.on && s.links ? html`<div class="stack" style="gap:6px">
              <div class="label">${t('linkLocal')}</div>${link(s.links.local)}
              ${s.links.public.length ? html`<div class="label">${t('linkPublic')}</div>${s.links.public.map(link)}` : html`<div class="callout"><div class="callout-body small">${t('noRemote')}</div></div>`}
              <div class="row"><span class="tiny muted grow">${t('rotateHint')}</span><button class="btn xs ghost" id="up-rotate">${t('rotate')}</button></div></div>` : ''}
          </div>
          <div class="card card-pad stack">
            <label class="stack" style="gap:4px"><span class="label">${t('pageTitle')}</span><input class="input" id="up-title" value="${s.title}" placeholder="${t('pageTitlePh')}" maxlength="80"></label>
            <label class="stack" style="gap:4px"><span class="label">${t('intro')}</span><textarea class="input" id="up-intro" rows="2" maxlength="300" placeholder="${t('introPh')}">${s.intro}</textarea></label>
            <div class="setting-row"><div class="txt"><b>${t('showUrls')}</b><span>${t('showUrlsHint')}</span></div><label class="switch"><input type="checkbox" id="up-urls" ${s.showUrls ? raw('checked') : ''} aria-label="${t('showUrls')}"><span class="track"></span><span class="thumb"></span></label></div>
            <div class="row"><span class="grow"></span><button class="btn sm primary" id="up-savetxt">${t('save')}</button></div>
          </div>
        </div>
        <div class="stack">
          <div class="card card-pad stack">
            <h3 style="margin:0">${t('whichChecks')}</h3><p class="small muted" style="margin:0">${t('whichChecksHint')}</p>
            ${s.available.length ? s.available.map((c) => html`<div class="row up-check"><input type="checkbox" data-check="${c.id}" ${picked(c.id) ? raw('checked') : ''} aria-label="${c.name}"><span class="grow ellipsis small" title="${c.url}">${c.name}</span><input class="input sm" data-name="${c.id}" value="${s.names[c.id] || ''}" placeholder="${t('displayName')}" aria-label="${t('displayName')}: ${c.name}" maxlength="80" style="max-width:200px"></div>`) : html`<p class="muted small">${t('emptyText')}</p>`}
            ${s.available.length ? html`<div class="row"><span class="grow"></span><button class="btn sm" id="up-savechecks">${t('save')}</button></div>` : ''}
          </div>
          <div class="card card-pad stack">
            <h3 style="margin:0">${t('siteTitle')}</h3><p class="small muted" style="margin:0">${t('siteHint')}</p>
            <div class="row"><code class="grow ellipsis small">${s.siteDir || t('noFolder')}</code><button class="btn sm ghost" id="up-pick">${t('pickFolder')}</button>${s.siteDir ? html`<button class="btn sm ghost" id="up-nosite">${t('remove')}</button>` : ''}</div>
            ${s.siteDir ? html`<div class="row"><span class="tiny ${s.siteError ? 'c-err' : 'muted'} grow">${s.siteError ? s.siteError : s.siteWritten ? t('written', { when: Hostwerk.fmt.time(s.siteWritten) }) : t('notWritten')}</span><button class="btn sm" id="up-publish" ${s.on ? '' : raw('disabled')}>${t('writeNow')}</button></div>` : ''}
          </div>
        </div>
      </div>`);
    $('on').onchange = (e) => save({ on: e.target.checked }, e.target.checked ? t('nowOn') : t('nowOff'));
    $('savetxt').onclick = () => save({ title: $('title').value, intro: $('intro').value, showUrls: $('urls').checked }, t('saved'));
    if ($('savechecks')) $('savechecks').onclick = () => {
      const boxes = [...document.querySelectorAll('[data-check]')];
      const on = boxes.filter((b) => b.checked).map((b) => b.dataset.check);
      if (!on.length) { Hostwerk.toast(t('pickOne'), { kind: 'warn' }); return; }
      const names = Object.fromEntries([...document.querySelectorAll('[data-name]')].map((i) => [i.dataset.name, i.value]));
      save({ checks: on.length === boxes.length ? [] : on, names }, t('saved'));
    };
    if ($('rotate')) $('rotate').onclick = async () => { try { s = await Hostwerk.post('/live/statuspage/rotate', {}); Hostwerk.toast(t('rotated'), { kind: 'success' }); render(); } catch (e) { fail(e); } };
    $('pick').onclick = async () => { try { const d = await Hostwerk.pickFolder(t('pickFolder')); if (d) save({ siteDir: d }, t('saved')); } catch (e) { fail(e); } };
    if ($('nosite')) $('nosite').onclick = () => save({ siteDir: '' }, t('saved'));
    if ($('publish')) $('publish').onclick = async () => { try { const r = await Hostwerk.post('/live/statuspage/publish', {}); if (r.error) Hostwerk.toast(r.error, { kind: 'error' }); else Hostwerk.toast(t('writtenToast'), { kind: 'success' }); load(); } catch (e) { fail(e); } };
    for (const b of document.querySelectorAll('[data-copy]')) b.onclick = () => Hostwerk.copy(b.dataset.copy).then(() => Hostwerk.toast(t('copied'), { kind: 'success' })).catch(fail);
    for (const b of document.querySelectorAll('[data-open]')) b.onclick = () => Hostwerk.openUrl(b.dataset.open).catch(fail);
  }
  // Reiter der ganzen Seite: Dienste (wall) · Erreichbarkeit (uptime) · Öffentliche Statusseite (public)
  const TABS = ['wall', 'uptime', 'public'];
  const show = (tab) => {
    const cur = TABS.includes(tab) ? tab : 'wall';
    for (const el of document.querySelectorAll('[data-tab]')) el.hidden = el.dataset.tab !== cur;
    if (cur === 'public') load();
    if (cur === 'uptime' && window.UptimeWall) window.UptimeWall.show();
  };
  // Tastenkürzel „Erreichbarkeit öffnen“ (Aktion uptime)
  const act = (x) => { if (x && x.id === 'uptime') { Hostwerk.setTab('uptime').catch(() => {}); show('uptime'); } };
  Hostwerk.ready().then((info) => { show(info.tab || 'wall'); act(info.action); Hostwerk.on('tab', show); Hostwerk.on('action', act); Hostwerk.on('lang', () => { if (s) render(); }); });
})();
