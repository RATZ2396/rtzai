@echo off
title Verificar Sistema de Creditos
color 0E
cls

echo.
echo  ╔════════════════════════════════════════════════════════════╗
echo  ║                                                            ║
echo  ║        VERIFICACION SISTEMA DE CREDITOS                   ║
echo  ║                                                            ║
echo  ╚════════════════════════════════════════════════════════════╝
echo.
echo  Ejecutando prueba de carga de modulos...
echo.

cd backend
node test-credits-system.js

if %ERRORLEVEL% EQU 0 (
    color 0A
    echo.
    echo  ════════════════════════════════════════════════════════════
    echo.
    echo  ✅ TODOS LOS MODULOS CARGADOS CORRECTAMENTE
    echo.
    echo  El sistema de creditos esta funcionando.
    echo  Ahora puedes ejecutar EJECUTAR.bat con confianza.
    echo.
    echo  ════════════════════════════════════════════════════════════
) else (
    color 0C
    echo.
    echo  ════════════════════════════════════════════════════════════
    echo.
    echo  ❌ ERROR AL CARGAR MODULOS
    echo.
    echo  Revisa el error de arriba para mas informacion.
    echo.
    echo  ════════════════════════════════════════════════════════════
)

echo.
cd ..
pause
