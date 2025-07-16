@echo off
REM === Script para iniciar Backend y Frontend de HARDWAY ===

REM Cambia a la carpeta del backend y ejecuta en nueva ventana
start "Backend" cmd /k "cd /d "%~dp0backend" && npm install && node index.js"

REM Cambia a la carpeta del frontend y ejecuta en nueva ventana
start "Frontend" cmd /k "cd /d "%~dp0" && npm install && npm run dev"

echo Backend y Frontend iniciados en ventanas separadas.
pause
