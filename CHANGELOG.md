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
