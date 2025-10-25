@echo off
title RTZAI - Gestor de Créditos
color 0B
cls

echo.
echo  ╔═══════════════════════════════════════════════════════════════╗
echo  ║                                                               ║
echo  ║              💰 GESTOR DE CRÉDITOS - RTZAI                   ║
echo  ║                                                               ║
echo  ╚═══════════════════════════════════════════════════════════════╝
echo.

REM Verificar Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    color 0C
    echo  [X] ERROR: Node.js no esta instalado
    echo.
    pause
    exit
)

echo  [✓] Node.js detectado
echo.
echo  Iniciando gestor interactivo...
echo.

cd backend
node manage-credits.js

cd ..
pause
