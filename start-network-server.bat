@echo off
title ThermalPrint Pro CAD - Network Server
cd /d "%~dp0"

echo ======================================================================
echo             ThermalPrint Pro CAD - Network Server
echo ======================================================================
echo.
echo [INFO] Starting Local Network Server on 0.0.0.0:3000 ...
echo [INFO] Detect your local network IP below:
echo.

node server.js

pause
