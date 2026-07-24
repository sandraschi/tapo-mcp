# Development Setup

## Tools Required

```powershell
winget install astral-sh.uv
winget install Git.Git
winget install Casey.Just

uv --version
git --version
just --version
```

## Setup

```powershell
git clone https://github.com/sandraschi/tapo-mcp
cd tapo-mcp
uv sync --extra dev
```

## Common Tasks

```powershell
just lint      # ruff + tsc
just test      # pytest
just fix       # ruff check --fix + format
just serve     # MCP stdio
just serve-web # Vite dev on 11103
.\start.ps1    # full stack
```
