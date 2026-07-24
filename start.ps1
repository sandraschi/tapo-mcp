param([switch]$Headless, [switch]$BackendOnly, [switch]$NoBrowser)
$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSCommandPath
$BackendPort = 11102
$FrontendPort = 11103

# Kill zombies
Get-NetTCPConnection -LocalPort $BackendPort -ErrorAction SilentlyContinue |
    ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }
Get-NetTCPConnection -LocalPort $FrontendPort -ErrorAction SilentlyContinue |
    ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }

# Start backend
$BackendJob = Start-Job -Name "backend" -ScriptBlock {
    param($Root, $Port)
    Set-Location $Root
    uv run uvicorn tapo_mcp.web_app:app --host 127.0.0.1 --port $Port --log-level info
} -ArgumentList $Root, $BackendPort

# Poll health
for ($i = 0; $i -lt 60; $i++) {
    try {
        $r = Invoke-WebRequest -Uri "http://127.0.0.1:$BackendPort/api/health" -TimeoutSec 2 -UseBasicParsing -ErrorAction SilentlyContinue
        if ($r.StatusCode -eq 200) { Write-Host "Backend ready on port $BackendPort" -ForegroundColor Green; break }
    } catch {}
    Start-Sleep 1
}

if ($BackendOnly) { Write-Host "Backend only mode. Frontend not started."; return }

# Start frontend
$WebRoot = Join-Path $Root "web_sota"
$null = Start-Process -NoNewWindow -FilePath "npx" -ArgumentList "vite --port $FrontendPort --host" -WorkingDirectory $WebRoot

if (-not $NoBrowser) {
    Start-Sleep 3
    Start-Process "http://127.0.0.1:$FrontendPort"
}

# Keep-alive
while ($true) {
    if ($BackendJob.State -in @("Completed", "Failed")) {
        Receive-Job $BackendJob
        break
    }
    Start-Sleep 2
}
