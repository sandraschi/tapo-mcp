@echo off
cd /d "%~dp0"

set "PATH=%PATH%;%LOCALAPPDATA%\Microsoft\WindowsApps"
set "PATH=%PATH%;%USERPROFILE%\.bun\bin"

powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0start.ps1" %*
echo Exit code: %ERRORLEVEL%
if %ERRORLEVEL% NEQ 0 pause
