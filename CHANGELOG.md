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
