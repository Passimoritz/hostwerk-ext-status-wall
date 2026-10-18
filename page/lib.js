/* StatusWall – pure logic without DOM, tested in tests/lib.test.js (node --test). */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api; else root.StatusWall = api;
}(typeof self !== 'undefined' ? self : this, () => {
  const KINDS = ['web', 'db', 'minecraft', 'app', 'mail'];
  /** Zähler für die Kopfzeile. */
  function summary(all) {
    const list = all || [];
    const running = list.filter((s) => s.state === 'running').length;
    const problems = list.filter((s) => s.state === 'error').length;
    return { running, problems, stopped: list.length - running - problems, total: list.length };
  }
  /** Gruppen nach Art (oder eine Gruppe); Fehler zuerst, dann Name. showStopped=false blendet Gestoppte aus. */
  function groups(all, { group = true, showStopped = true } = {}) {
    let list = [...(all || [])];
    if (!showStopped) list = list.filter((s) => s.state !== 'stopped');
    const order = (a, b) => (a.state === 'error' ? -1 : 0) - (b.state === 'error' ? -1 : 0) || String(a.name).localeCompare(String(b.name));
    if (!group) return list.length ? [[null, list.sort(order)]] : [];
    return KINDS.map((k) => [k, list.filter((s) => s.kind === k).sort(order)]).filter(([, xs]) => xs.length);
  }
  return { KINDS, summary, groups };
}));
