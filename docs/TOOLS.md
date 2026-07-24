# Tool Reference

## tapo_plug

Smart plug management.

| Operation | Parameters | Description |
|-----------|------------|-------------|
| `list` | — | Discover all plugs on the Tapo cloud account |
| `status` | `device_id` | Current power, voltage, current, daily energy |
| `toggle` | `device_id`, `state` | Power on (`true`) or off (`false`) |
| `energy_history` | `device_id`, `hours` | Power time-series data (default 24h) |

## tapo_camera

Camera management.

| Operation | Parameters | Description |
|-----------|------------|-------------|
| `list` | — | List all registered cameras |
| `status` | `camera_id` | Camera connection status and info |
| `snapshot` | `camera_id` | JPEG snapshot (base64-encoded) |
| `ptz` | `camera_id`, `direction` | Move PTZ: `up`, `down`, `left`, `right` |
| `privacy_mode` | `camera_id`, `enabled` | Enable/disable privacy mode |
| `led` | `camera_id`, `enabled` | Enable/disable LED |
| `stream` | `camera_id` | RTSP/HLS stream URL |

## tapo_register_camera

Register a camera by address.

| Parameter | Description |
|-----------|-------------|
| `host` | Camera IP or hostname |
| `username` | Camera username (default: `admin`) |
| `password` | Camera password |
| `name` | Optional friendly name |
