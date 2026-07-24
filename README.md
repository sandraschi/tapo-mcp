# tapo-mcp

MCP server for TP-Link Tapo cameras and smart plugs. Control PTZ, take snapshots, toggle privacy mode, and monitor plug energy — all through MCP tools and a React dashboard.

[![FastMCP](https://img.shields.io/badge/FastMCP-3.4-7c5cfc?style=flat-square)](https://github.com/jlowin/fastmcp)
[![Python](https://img.shields.io/badge/python-3.12+-blue?style=flat-square&logo=python)](https://python.org)
[![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)](LICENSE)

## Preview

| Dashboard | Camera controls | Energy trends |
|-----------|----------------|---------------|
| KPI cards for backend, cameras, plugs | Snapshot preview, PTZ, privacy/LED toggles | recharts AreaChart per plug (12h-168h) |

## Features

- **Camera control**: Snapshot, PTZ (up/down/left/right), privacy mode, LED, stream URL
- **Smart plug monitoring**: Power on/off, current power (W), daily energy (kWh), voltage
- **Energy time-series**: SQLite-backed history with recharts AreaChart (12h/24h/72h/168h)
- **REST API**: Full `/api/plugs/*` and `/api/cameras/*` endpoints
- **Dark-theme webapp**: React + Vite + TailwindCSS dashboard

## Quick Install

```powershell
git clone https://github.com/sandraschi/tapo-mcp
cd tapo-mcp
uv sync
.\start.ps1
```

Then open `http://127.0.0.1:11103`.

## What You Can Do

```
"List my Tapo smart plugs and show current power"
"Take a snapshot from the kitchen camera"
"Turn on the living room plug"
"Show energy usage for the server plug over the last 24 hours"
```

## Documentation

| Doc | Contents |
|-----|----------|
| [Installation](INSTALL.md) | All install methods, prerequisites |
| [Configuration](docs/CONFIGURATION.md) | Env vars, config options |
| [Tool Reference](docs/TOOLS.md) | All available MCP tools |
| [Development](docs/DEVELOPMENT.md) | Contributing, local setup |
| [Troubleshooting](docs/TROUBLESHOOTING.md) | Common issues |

## Requirements

- Python 3.12+
- Tapo cloud account (for smart plugs) or local camera credentials
- TP-Link Tapo camera (C100/C200/C210/etc.) or smart plug (P110/P115)

## License

MIT
