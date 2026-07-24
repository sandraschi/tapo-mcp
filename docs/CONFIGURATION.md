# Configuration

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `TAPO_CLOUD_EMAIL` | — | Tapo cloud account email (required for plugs) |
| `TAPO_CLOUD_PASSWORD` | — | Tapo cloud account password (required for plugs) |
| `TAPO_CAMERA_HOST` | — | Camera IP address (required for cameras) |
| `TAPO_CAMERA_USERNAME` | `admin` | Camera web login username |
| `TAPO_CAMERA_PASSWORD` | — | Camera web login password (required for cameras) |
| `MCP_PORT` | `11102` | HTTP server port |
| `LOG_LEVEL` | `INFO` | Logging level |

## Setting Variables

In `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "tapo-mcp": {
      "command": "uv",
      "args": ["--directory", "C:\\path\\to\\tapo-mcp", "run", "tapo-mcp"],
      "env": {
        "TAPO_CLOUD_EMAIL": "your-email",
        "TAPO_CLOUD_PASSWORD": "your-password",
        "TAPO_CAMERA_HOST": "192.168.1.100",
        "TAPO_CAMERA_PASSWORD": "camera-password"
      }
    }
  }
}
```
