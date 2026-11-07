@echo off
title ThermalPrint Pro CAD - Desktop & Server Launcher
cd /d "%~dp0"

echo ======================================================================
echo        ThermalPrint Pro CAD - Studio Launcher (Cross-Platform)
echo ======================================================================
echo.

where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js not detected on your system.
    echo Please install Node.js from https://nodejs.org
    echo Opening fallback static browser view...
    start index.html
    pause
    exit /b 1
)

echo [OK] Node.js detected:
node -v

if exist "node_modules\electron" (
    echo [OK] Electron Desktop App engine detected.
    echo Starting ThermalPrint CAD Desktop App...
    call npm.cmd run app
) else (
    echo Starting ThermalPrint CAD Server on port 3000...
    node server.js
)

pause
