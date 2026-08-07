param(
    [switch]$Headless,
    [switch]$BackendOnly,
    [switch]$FrontendOnly,
    [switch]$NoBrowser
)
$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSCommandPath
$BackendPort = 11102
$FrontendPort = 11103

# -- Require-Command: auto-install missing tools via winget --
function Require-Command($Name, $WingetId) {
    if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
        Write-Host "Installing $Name via winget..." -ForegroundColor Yellow
        winget install --id $WingetId -e --accept-source-agreements --accept-package-agreements 2>$null
        $env:PATH = [System.Environment]::GetEnvironmentVariable("PATH","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("PATH","User")
        if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
            Write-Host "Failed to install $Name. Install manually." -ForegroundColor Red
            exit 1
        }
    }
}

Require-Command "uv" "astral-sh.uv"
Require-Command "bun" "Oven-sh.Bun"
Require-Command "node" "OpenJS.NodeJS"

# -- Kill port zombies --
Get-NetTCPConnection -LocalPort $BackendPort -ErrorAction SilentlyContinue |
    ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }
Get-NetTCPConnection -LocalPort $FrontendPort -ErrorAction SilentlyContinue |
    ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }

Write-Host "=== tapo-mcp ===" -ForegroundColor Cyan

# -- Backend --
$BackendJob = Start-Job -Name "backend" -ScriptBlock {
    param($Root, $Port)
    Set-Location $Root
    uv run uvicorn tapo_mcp.web_app:app --host 127.0.0.1 --port $Port --log-level info
} -ArgumentList $Root, $BackendPort

# Health poll
Write-Host "Waiting for backend on port $BackendPort..." -ForegroundColor Yellow
$ok = $false
for ($i = 0; $i -lt 60; $i++) {
    try {
        $r = Invoke-WebRequest -Uri "http://127.0.0.1:$BackendPort/api/health" -TimeoutSec 2 -UseBasicParsing -ErrorAction SilentlyContinue
        if ($r.StatusCode -eq 200) { $ok = $true; break }
    } catch {}
    Start-Sleep 1
}
if (-not $ok) {
    Write-Host "Backend failed to start within 60s" -ForegroundColor Red
    exit 1
}
Write-Host "Backend ready on port $BackendPort" -ForegroundColor Green

if ($BackendOnly) { Write-Host "Backend only mode."; Wait-Job $BackendJob; return }

# -- Frontend --
$WebRoot = Join-Path $Root "web_sota"
if (Test-Path (Join-Path $WebRoot "node_modules")) {
    Write-Host "node_modules exists, skipping install" -ForegroundColor Gray
} else {
    Write-Host "Installing frontend deps..." -ForegroundColor Yellow
    Push-Location $WebRoot
    bun install
    Pop-Location
}

$null = Start-Process -NoNewWindow -FilePath "C:\Users\sandr\.bun\bin\bun.exe" -ArgumentList "run --bun vite --port $FrontendPort --host" -WorkingDirectory $WebRoot

if (-not $NoBrowser) {
    Start-Sleep 3
    Start-Process "http://127.0.0.1:$FrontendPort"
}

Write-Host "Frontend: http://127.0.0.1:$FrontendPort" -ForegroundColor Green
Wait-Job $BackendJob
