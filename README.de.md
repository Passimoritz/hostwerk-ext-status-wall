![Status-Wand](banner.svg)

# Status-Wand

[English](README.md) · **Deutsch**

Alle Dienste groß und farbig auf einen Blick – ideal für einen zweiten Bildschirm oder das Tablet an der Wand. Ein Klick startet, stoppt oder startet neu (Hostwerk fragt vorher).

![Ansicht](docs/status-wall-de-dark.png)

## Funktionen

- Jeder Webserver, jede Datenbank, Minecraft- und Spiele-Server, App und der Mail-Fänger als Kachel (Spiele-Server öffnen ihre eigene Seite)
- Laufen / im Wechsel / gestoppt / Probleme oben, Probleme zuerst – „startet“ zählt nicht mehr als gestoppt
- Starten, stoppen und neu starten mit Rückfrage
- Erreichbarkeit aus der Uptime-Prüfung neben dem Prozesszustand („läuft, aber nicht erreichbar“)
- Mini-Verlauf von CPU und Arbeitsspeicher je Kachel (mit Textalternative)
- Deutlicher Fehlerzustand mit „Erneut versuchen“; nachgeladen wird nur, solange die Seite sichtbar ist
- Eigener Bereich „Überwachung“ in der Seitenleiste, Kürzel Strg+Alt+W
- Gruppen, gestoppte ausblenden, drei Kachelgrößen (auch „Wand“)
- Kachel mit Ring für die Übersicht: wie viele Dienste laufen
- Deutsch und Englisch, hell und dunkel

## Installieren

In Hostwerk (ab 2.9): **Apps → Erweiterungen → Marktplatz → Status-Wand → Installieren** (Abzeichen *Offiziell*).
Oder von Hand: `status-wall-1.0.0.zip` aus dem [neuesten Release](../../releases/latest) laden → *Apps → Erweiterungen → Datei*.

## Rechte

- `read:services` – Dienste sehen
- `control:services` – starten/stoppen/neu starten, **Hostwerk fragt jedes Mal**
- `read:system` – Auslastung je Dienst für den Mini-Verlauf
- `read:live` – Ergebnisse der Erreichbarkeits-Prüfung

Läuft in Hostwerk abgeschottet – kein Zugriff auf Anmeldungen, Einstellungen oder Dateien.

## Selbst bauen

Dieses Repository ist auch ein Beispiel für das [Hostwerk-Erweiterungs-SDK](https://github.com/Passimoritz/hostwerk-public/blob/main/sdk/README.de.md): Design-Baukasten, Übersetzungen, Einstellungen, Speicher, Ereignisse, Prüfung und Releases.

Lizenz: MIT
