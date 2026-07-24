set windows-shell := ["pwsh.exe", "-NoLogo", "-Command"]

default:
    @just --list

lint:
    uv run ruff check src/
    Set-Location web_sota; npx tsc --noEmit

fix:
    uv run ruff check src/ --fix
    uv run ruff format src/

serve:
    uv run python -m tapo_mcp.server --http --port 11102

serve-web:
    Set-Location web_sota; Start-Process npx -ArgumentList "vite --port 11103"

test:
    uv run pytest tests/ -q
