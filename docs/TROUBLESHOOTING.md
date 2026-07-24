# Troubleshooting

## Server doesn't appear in Claude Desktop

**Cause**: Config JSON is malformed or path is wrong
**Fix**: Validate at jsonlint.com, check that the directory path in `args` is absolute

## "command not found: uv"

**Cause**: uv not installed or not in PATH
**Fix**: `winget install astral-sh.uv` then restart terminal

## No plugs discovered

**Cause**: Tapo cloud credentials missing or wrong
**Fix**: Set `TAPO_CLOUD_EMAIL` and `TAPO_CLOUD_PASSWORD` in `.env` or `claude_desktop_config.json`

## Camera snapshot fails

**Cause**: Camera credentials wrong or camera unreachable
**Fix**: Verify `TAPO_CAMERA_HOST` is reachable (`ping`), check username/password in camera web UI

## Backend won't start — port in use

**Cause**: Another process on port 11102
**Fix**: `Get-NetTCPConnection -LocalPort 11102 | Stop-Process -Id $_.OwningProcess`
