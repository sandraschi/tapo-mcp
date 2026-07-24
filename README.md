# Tapo MCP

MCP server for TP-Link Tapo cameras and smart plugs.

**Features:**
- Tapo smart plugs (P110/P115): power on/off, energy monitoring, 24h time-series
- Tapo cameras (C100/C200/C210/etc.): snapshot, PTZ, privacy mode, LED, stream URL
- SQLite time-series for plug energy data
- React webapp with recharts energy trends

## Quick Start

```powershell
git clone https://github.com/sandraschi/tapo-mcp
cd tapo-mcp
cp .env.example .env
.\start.ps1
```

Backend on `http://127.0.0.1:11102`, frontend on `http://127.0.0.1:11103`.

## Configuration

Set in `.env` or via the webapp Settings page:

| Variable | For | Description |
|----------|-----|-------------|
| `TAPO_CLOUD_EMAIL` | Plugs | Tapo cloud account email |
| `TAPO_CLOUD_PASSWORD` | Plugs | Tapo cloud account password |
| `TAPO_CAMERA_HOST` | Cameras | Camera IP address |
| `TAPO_CAMERA_USERNAME` | Cameras | Camera username (default: admin) |
| `TAPO_CAMERA_PASSWORD` | Cameras | Camera password |

## Usage

```python
# List smart plugs
tapo_plug(operation="list")

# Toggle a plug
tapo_plug(operation="toggle", device_id="xxxx", state=True)

# Get camera snapshot (returns base64 JPEG)
tapo_camera(operation="snapshot", camera_id="tapo_192_168_1_100")

# PTZ move
tapo_camera(operation="ptz", camera_id="tapo_192_168_1_100", direction="right")
```

## Ports

| Port | Service |
|------|---------|
| 11102 | Backend (FastAPI + MCP HTTP) |
| 11103 | Frontend (Vite dev) |

## Stack

- **Backend**: Python 3.12+, FastMCP 3.4+, FastAPI, pytapo, tapo
- **Frontend**: React 19, Vite 7, TailwindCSS 3, recharts
- **Storage**: SQLite (plug energy time-series)

## Dependencies

Drivers are core deps — `tapo` and `pytapo` are installed by default on `uv sync`.

## MCP Client Config

```json
{
  "mcpServers": {
    "tapo-mcp": {
      "command": "uv",
      "args": ["--directory", "D:/Dev/repos/tapo-mcp", "run", "tapo-mcp"]
    }
  }
}
```

## Webapp Pages

- **Dashboard**: Camera/plug counts, backend status
- **Cameras**: Snapshot grid, PTZ controls, privacy/LED toggles
- **Plugs**: Power on/off, current power, daily energy, voltage
- **Trends**: recharts AreaChart per plug (12h/24h/72h/168h)
- **Settings**: Tapo cloud credentials
