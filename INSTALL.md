# Installing tapo-mcp

## Prerequisites

| Tool | Purpose | Install |
|------|---------|---------|
| Claude Desktop | Required host | [download](https://claude.ai/download) |
| Git | Clone repo | `winget install Git.Git` |
| Python + uv | Run server | `winget install astral-sh.uv` |

## Option A — Manual Setup (Recommended)

```powershell
git clone https://github.com/sandraschi/tapo-mcp
cd tapo-mcp
uv sync
```

## Option B — Claude Desktop Config

Add to `%APPDATA%\Claude\claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "tapo-mcp": {
      "command": "uv",
      "args": ["--directory", "C:\\path\\to\\tapo-mcp", "run", "tapo-mcp"],
      "env": { "PYTHONUNBUFFERED": "1" }
    }
  }
}
```

Restart Claude Desktop.

## Configuration

Copy `.env.example` to `.env` and fill in your credentials:

| Variable | For | Description |
|----------|-----|-------------|
| `TAPO_CLOUD_EMAIL` | Plugs | Tapo cloud account email |
| `TAPO_CLOUD_PASSWORD` | Plugs | Tapo cloud account password |
| `TAPO_CAMERA_HOST` | Cameras | Camera IP address |
| `TAPO_CAMERA_USERNAME` | Cameras | Camera username (default: admin) |
| `TAPO_CAMERA_PASSWORD` | Cameras | Camera password |

## Verify Installation

Open Claude Desktop and type:

> "List my Tapo smart plugs"

You should see a response with discovered plug devices.
