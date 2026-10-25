# Changelog

## 2.0.0

- The former extension "Uptime wall" lives here now (SDK 3.8 `replaces`): new tabs "Reachability" (every uptime check with availability, response time and history) and "Public status page"; Hostwerk installs this version for everyone who had the uptime wall and removes it. Go live has one tab less; the tab there now shows the whole page with its sub tabs. / Die frühere Erweiterung „Uptime-Wand“ steckt jetzt hier (SDK 3.8 `replaces`): neue Reiter „Erreichbarkeit“ (alle Prüfungen mit Verfügbarkeit, Antwortzeit und Verlauf) und „Öffentliche Statusseite“; Hostwerk installiert diese Fassung für alle mit der Uptime-Wand und entfernt sie. Der Livebetrieb hat einen Reiter weniger; der Reiter dort zeigt jetzt die ganze Seite mit Unterreitern.
- Kiosk wall: optionally also the uptime checks (setting "kioskUptime" – only name, state and availability). Tile: one line about reachability (setting "tileUptime"). Shortcut Ctrl+Alt+U opens "Reachability". / Kiosk-Wand: auf Wunsch auch die Erreichbarkeits-Prüfungen (Einstellung „kioskUptime“ – nur Name, Zustand und Verfügbarkeit). Kachel: eine Zeile Erreichbarkeit (Einstellung „tileUptime“). Strg+Alt+U öffnet „Erreichbarkeit“.

## 1.6.0

- Hostwerk’s animations (SDK 3.6): the numbers at the top count to their new value, the tiles rise one after another the first time, and services that are starting or stopping pulse gently. Everything stops with “Reduce animations”; older Hostwerk versions show it as before. / Hostwerks Animationen (SDK 3.6): Die Zahlen oben zählen zum neuen Wert, die Kacheln erscheinen beim ersten Mal nacheinander, startende und stoppende Dienste pulsieren sanft. Alles ruht bei „Animationen reduzieren“; ältere Hostwerk-Versionen zeigen es wie bisher.

## 1.5.2

- New animated icon and banner in the common Hostwerk style (isometric block). / Neues animiertes Symbol und Banner im gemeinsamen Hostwerk-Stil (isometrischer Block).

## 1.5.1

- Progress reads “Lädt …” in German like everywhere in Hostwerk. / Fortschritt heißt auf Deutsch „Lädt …“ wie überall in Hostwerk.

## 1.5.0

- Lives where it belongs: Go live → Operate → Status wall and the dashboard tile – no own sidebar entry any more (Hostwerk 3.0+); the full page stays under Extensions → Open and can be pinned in the sidebar settings. / Steckt jetzt dort, wo sie hingehört: Livebetrieb → Betrieb → Status-Wand und Übersichtskachel – kein eigener Seitenleisten-Eintrag mehr (Hostwerk 3.0+); die ganze Seite bleibt unter Erweiterungen → Öffnen und lässt sich in den Seitenleisten-Einstellungen anheften.

## 1.4.0

- Kiosk wall without sign-in: own address `/v/status-wall/` (permission `share:view`) for a second screen or a tablet – without Hostwerk around it, read only (no buttons), with a full screen button, light/dark and three sizes (`?theme=light`, `?size=compact|wall`, `?stopped=0`, `?group=0`, `?lang=de`). Off until you switch on “Share the kiosk wall without sign-in”; it shows names and state, no ports, paths or addresses. / Kiosk-Wand ohne Anmeldung: eigene Adresse `/v/status-wall/` (Recht `share:view`) für den zweiten Bildschirm oder das Tablet – ohne Hostwerk drumherum, nur lesend (ohne Knöpfe), mit Vollbild-Knopf, hell/dunkel und drei Größen. Aus, bis du „Kiosk-Wand ohne Anmeldung freigeben“ einschaltest; sie zeigt Namen und Zustand, keine Ports, Pfade oder Adressen.
- Game servers can be started, stopped and restarted right on the wall (Hostwerk asks first, SDK 2.10 `control:services`); “Open” still leads to their page. / Spiele-Server lassen sich direkt auf der Wand starten, stoppen und neu starten (Hostwerk fragt vorher); „Öffnen“ führt weiter zu ihrer Seite.
- Needs Hostwerk 3.0 (SDK 3.0). / Braucht Hostwerk 3.0 (SDK 3.0).

## 1.3.0

- Game servers appear (own group, "Open" leads to their page); the mail catcher has a fixed id. / Spiele-Server erscheinen.
- "Stop" next to "Restart" (Hostwerk asks first). / „Stoppen“ dazu.
- "Starting"/"stopping" count as "changing", no longer as stopped; error state with "Try again" for page and tile. / „Startet“ zählt nicht mehr als gestoppt, Fehlerzustand.
- Reachability from the uptime checks next to the process state; small CPU/memory history per tile. / Erreichbarkeit und Mini-Verlauf.
- Refresh pauses while the page is hidden; sizes from the design scale; area "Monitoring" in the sidebar, shortcut Ctrl+Alt+W; other extensions may add tabs. / Nachladen pausiert, Design-Skala, Seitenleiste, Kürzel.
- New permissions `read:system` and `read:live`. / Neue Rechte.

## 1.2.1

- Stopped services marked with a dashed border instead of transparency – text keeps its contrast. / Gestoppte Dienste mit gestricheltem Rand statt Durchsichtigkeit – der Text bleibt kontrastreich.

## 1.2.0

- New animated icon and a banner for Hostwerk's new extension page, category “monitoring”. / Neues bewegtes Symbol und ein Banner für die neue Erweiterungsseite, Kategorie „monitoring“.

## 1.1.0

- Looks exactly like Hostwerk's own pages: uses Hostwerk's design classes (card, btn, badge …) from the SDK 2.2 design kit; Hostwerk draws the page header. / Sieht aus wie Hostwerks eigene Seiten: Hostwerks Design-Klassen aus dem Baukasten (SDK 2.2), Kopf zeichnet Hostwerk.

## 1.0.1

- Logik in page/lib.js mit Tests (node --test); Einstellung „Nach Art gruppieren“ gilt jetzt auch, wenn sie nie geändert wurde. / Logic in page/lib.js with tests; “Group by kind” now also applies when never changed.

## 1.0.0

- First release for Hostwerk SDK 2: page, dashboard tile, settings, German and English.
- Erste Version für das Hostwerk-SDK 2: Seite, Übersichts-Kachel, Einstellungen, Deutsch und Englisch.
