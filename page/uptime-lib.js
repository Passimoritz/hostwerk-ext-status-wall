// Status-Wand, Teil „Erreichbarkeit“ (bis 1.5 Erweiterung „Uptime-Wand“) – Logik ohne Seite (auch in Node testbar)
(function (root) {
  /** Zustand: oben, unten, noch nicht geprüft. */
  const state = (c) => (c.ok === true ? 'up' : c.ok === false ? 'down' : 'pending');
  /** Verlauf als Punkte für eine kleine Linie (Antwortzeit, Ausfälle = 0). Breite × Höhe in Pixeln. */
  function spark(history, w = 120, h = 28) {
    const pts = (history || []).slice(-48);
    if (pts.length < 2) return '';
    const max = Math.max(...pts.map((p) => p[2] || 0), 1);
    return pts.map((p, i) => `${Math.round((i / (pts.length - 1)) * w)},${Math.round(h - (p[1] ? ((p[2] || 0) / max) * (h - 2) + 1 : 0))}`).join(' ');
  }
  /** Ausfälle im Verlauf (Blöcke aufeinanderfolgender Fehlschläge). */
  function outages(history) { let n = 0; let prev = 1; for (const p of history || []) { if (!p[1] && prev) n++; prev = p[1]; } return n; }
  /** Gesamtbild: alle oben? */
  function overall(checks) { const list = checks || []; const down = list.filter((c) => state(c) === 'down').length; return { total: list.length, down, up: list.filter((c) => state(c) === 'up').length, level: down ? 'err' : list.length ? 'ok' : 'none' }; }
  /** Textalternative zur Verlaufslinie: Verfügbarkeit, Ø-Antwortzeit, Ausfälle (Formatierer kommen von der Seite). */
  function describe(c, f) {
    const parts = [`${f.uptime}: ${f.pct(c.uptime24)}`];
    if (c.avgMs != null) parts.push(f.avg(c.avgMs));
    const n = outages(c.history);
    if (n) parts.push(f.outages(n));
    return parts.join(' · ');
  }
  const api = { state, spark, outages, overall, describe };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.Uptime = api;
})(typeof window !== 'undefined' ? window : globalThis);
