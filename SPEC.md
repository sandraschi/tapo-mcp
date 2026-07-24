# tapo-mcp — Specification

**Status**: Draft · **Author**: Sandra · **Date**: 2026-07-24

## Goal

Single-brand MCP server for TP-Link Tapo devices: **cameras** (PTZ, streaming, snapshots, ONVIF) + **smart plugs** (energy monitoring, toggling). Follows the same pattern as netatmo-weather-mcp, nest-protect-mcp, and ring-mcp.

## Why Not devices-mcp?

`devices-mcp` is a catch-all monolith (Tapo cams, Tapo plugs, Ring, Netatmo, Nest, webcams, microscopes, Petcube, ONVIF, USB cameras, etc. — 80+ files). By extracting Tapo, we get:

- Single responsibility: one brand, one config surface, one auth flow
- Simpler dependency tree (pytapo + tapo library, not the full devices-mcp stack)
- Dedicated webapp with recharts for energy time-series
- Tauri NSIS installer focused on camera notifications + plug energy dashboard
- Clear upgrade path as Tapo adds new device types

## Scope

### In scope

| Device type | Library | Capabilities |
|-------------|---------|-------------|
| **Tapo cameras** (C100, C200, C210, C310, etc.) | `pytapo` | PTZ control, snapshot, streaming, ONVIF wrapper, motion detection events, speakerphone, privacy mode, LED control |
| **Tapo smart plugs** (P110, P115) | `tapo` (Python lib) | Power on/off, current power (W), daily/monthly energy (kWh), voltage (V), current (A), 24h history via SQLite |

### Not in scope

- Other TP-Link products (Kasa/TP-Link routers, Deco mesh, etc.) — Kasa is a different ecosystem
- Non-Tapo cameras (Ring, ONVIF, USB, webcam, etc.) — stay in devices-mcp
- Non-Tapo sensors (temperature/humidity outside of what the camera reports)

## API Surface

### Cameras

```
GET    /api/cameras                        — List cameras + status
GET    /api/cameras/{id}                   — Camera details
GET    /api/cameras/{id}/snapshot          — JPEG snapshot
GET    /api/cameras/{id}/stream            — RTSP/HLS stream URL
POST   /api/cameras/{id}/ptz              — PTZ move (up/down/left/right/preset)
POST   /api/cameras/{id}/privacy_mode     — Toggle privacy mode
POST   /api/cameras/{id}/led              — Toggle LED
GET    /api/cameras/{id}/motion_events    — Recent motion events
```

### Smart Plugs

```
GET    /api/plugs                          — List plugs + current power
GET    /api/plugs/{id}                     — Plug details
POST   /api/plugs/{id}/toggle             — Power on/off
GET    /api/plugs/{id}/history?hours=24   — Power time-series (SQLite)
```

### MCP Tools (portmanteau)

```
tapo_camera(operation: list|status|snapshot|ptz|privacy_mode|led)
tapo_plug(operation: list|status|toggle|energy_history)
```

### Health

```
GET    /api/health                        — Backend status
GET    /api/v1/diagnostics                — Tool list + system info (CUA gate)
```

## Storage

SQLite for plug energy time-series (`data/timeseries.db`):

```sql
CREATE TABLE energy_timeseries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    device_id TEXT NOT NULL,
    timestamp INTEGER NOT NULL,
    power_w REAL,
    voltage_v REAL,
    current_a REAL,
    daily_energy_kwh REAL,
    monthly_energy_kwh REAL,
    power_state INTEGER,
    UNIQUE(device_id, timestamp)
);
```

Camera state is ephemeral (re-queried from the camera on each request). No local camera database.

## Architecture

```
MCP Client → FastMCP Server → pytapo / tapo library → Tapo cloud API / LAN
                 │
            FastAPI (web_app.py)
                 │
        ┌────────┴────────┐
     SQLite (plugs)   Vite React SPA
                          ├── Dashboard (KPI cards + camera thumbnails)
                          ├── Cameras (grid view, PTZ controls, snapshots)
                          ├── Plugs (power on/off, energy charts via recharts)
                          ├── Trends (LineChart: power over 24h/7d/30d)
                          └── Settings (Tapo cloud credentials)
```

## Stack

| Layer | Choice |
|-------|--------|
| MCP framework | FastMCP 3.4+ |
| Camera lib | `pytapo` |
| Plug lib | `tapo` (Python) |
| REST API | FastAPI |
| Frontend | React 19 + Vite + TailwindCSS + recharts |
| Desktop | Tauri 2.0 + NSIS (embedded PyInstaller backend) |
| Storage | SQLite (plug energy only) |
| Lint | ruff (Python), biome (frontend) |

## Ports

| Port | Service |
|------|---------|
| 11102 | Backend (FastAPI + MCP HTTP /mcp) |
| 11103 | Frontend (Vite dev) |

## Desktop / NSIS

- Tauri 2.0 wrapper with system tray icon
- Camera notifications (motion events → Windows toast)
- Embedded PyInstaller backend (`bundle.resources`, not `externalBin`)
- CUA-NSIS smoke test suite (7 phases)
- `build.ps1`: frontend → PyInstaller → tauri build

## Webapp Pages

| Page | Route | Content |
|------|-------|---------|
| Dashboard | `/` | Camera count, plug count, total power, latest snapshot thumbnails |
| Cameras | `/cameras` | Grid of camera cards with PTZ controls, snapshot preview, privacy/led toggles |
| Plugs | `/plugs` | Plug cards with on/off toggle, current power, daily energy |
| Trends | `/trends` | recharts AreaChart per plug (24h/7d/30d), station selector pills (from netatmo pattern) |
| Settings | `/settings` | Tapo cloud credentials, device discovery, about |

## Implementation Phases

| Phase | Scope |
|-------|-------|
| **1 — Scaffold** | `uv init`, FastMCP skeleton, FastAPI web_app.py, SQLite schema, MCP tools skeleton |
| **2 — Plugs** | `tapo` library integration, plug CRUD + toggle, energy history polling, SQLite storage, `/api/plugs/*` endpoints |
| **3 — Cameras** | `pytapo` integration, snapshot, PTZ, privacy mode, streaming URL, `/api/cameras/*` endpoints |
| **4 — Webapp** | React SPA with dashboard, cameras page, plugs page, trends (recharts), settings |
| **5 — Desktop** | Tauri scaffold, PyInstaller spec, NSIS build.ps1, CUA smoke test |
| **6 — Docs** | llms.txt, llms-full.txt, glama.json, README, CHANGELOG, PRD, MCD project page |

## Dependencies (pyproject.toml)

```toml
dependencies = [
    "fastmcp>=3.4.4,<4",
    "fastapi>=0.115.0",
    "uvicorn[standard]>=0.32.0",
    "pytapo>=3.1.0",
    "tapo>=2.0.0",
    "httpx>=0.27.0",
    "pydantic>=2.0.0",
    "python-dotenv>=1.0.0",
    "structlog>=23.1.0",
    "tenacity>=8.2.0",
    "prefab-ui>=0.14.0",
    "Pillow>=10.0.0",
]
```

## Non-Goals

- Migrating existing devices-mcp data — tapo-mcp starts fresh
- Support for Kasa/TP-Link routers or Deco mesh
- HomeKit / Google Home / Alexa bridge (pure MCP)
- Cloud recording or 24/7 NVR — snapshot + event-based only
