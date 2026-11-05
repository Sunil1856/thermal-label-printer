@echo off
title ThermalPrint Pro CAD Launcher
cd /d "%~dp0"

echo ======================================================================
echo           ThermalPrint Pro CAD - Studio Launcher
echo ======================================================================
echo.

where node >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [OK] Node.js found. Starting network server on port 3000...
    node server.js
) else (
    echo [INFO] Node.js not detected. Opening directly in browser...
    start index.html
)

pause
