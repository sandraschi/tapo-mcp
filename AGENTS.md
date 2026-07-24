# tapo-mcp Agent Context

MCP server for TP-Link Tapo cameras and smart plugs.

## Quick Ref

```powershell
uv sync              # install all deps (tapo + pytapo included)
uv run ruff check src/
uv run pytest tests/ -q
just serve           # MCP stdio
just serve-web       # Vite dev on 11103
.\start.ps1          # full stack (backend + frontend)
```

## Ports

| Port | Service |
|------|---------|
| 11102 | Backend (FastAPI + MCP HTTP /mcp) |
| 11103 | Frontend (Vite dev) |

## Key Files

| File | Purpose |
|------|---------|
| `src/tapo_mcp/server.py` | FastMCP server, tool registration |
| `src/tapo_mcp/web_app.py` | FastAPI REST backend |
| `src/tapo_mcp/devices/plug.py` | Tapo smart plug driver (tapo lib) |
| `src/tapo_mcp/devices/camera.py` | Tapo camera driver (pytapo) |
| `src/tapo_mcp/db/timeseries.py` | SQLite time-series for plug energy |
