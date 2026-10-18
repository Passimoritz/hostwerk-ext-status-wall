# Status Wall

**English** · [Deutsch](README.de.md)

All services big and colourful at a glance – ideal for a second screen or a tablet on the wall. One click starts or restarts a service (Hostwerk asks first).

| Dark | Light |
|---|---|
| ![dark](docs/status-wall-en-dark.png) | ![light](docs/status-wall-en-light.png) |

## Features

- Every web server, database, Minecraft server, app and the mail catcher as a tile
- Running / stopped / problems at the top, problems first
- Start and restart with confirmation
- Grouping, hide stopped services, three tile sizes (incl. “wall”)
- Dashboard tile with a ring: how many services run
- German and English, light and dark mode

## Install

In Hostwerk (2.9 or newer): **Apps → Extensions → Marketplace → Status Wall → Install** (badge *Official*).
Or manually: download `status-wall-1.0.0.zip` from the [latest release](../../releases/latest) → *Apps → Extensions → File*.

## Permissions

- `read:services` – see services
- `control:services` – start/restart, **Hostwerk asks every time**

Runs sandboxed in Hostwerk – no access to logins, settings or files.

## Build your own

This repository is also an example for the [Hostwerk extension SDK](https://github.com/Passimoritz/hostwerk-public/blob/main/sdk/README.md): design kit, translations, settings, storage, events, check and releases.

License: MIT
