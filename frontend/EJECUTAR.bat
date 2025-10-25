@echo off
title RTZAI - Ejecutar Proyecto
color 0A
cls

echo.
echo  ╔════════════════════════════════════════════════════════════╗
echo  ║                                                            ║
echo  ║          RTZAI - GENERADOR DE IMÁGENES CON IA              ║
echo  ║              Sistema de Creditos Integrado                ║
echo  ║                                                            ║
echo  ╚════════════════════════════════════════════════════════════╝
echo.

REM Verificar Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    color 0C
    echo  [X] ERROR: Node.js no esta instalado
    echo.
    echo  Descarga Node.js desde: https://nodejs.org
    pause
    exit
)

echo  [✓] Node.js detectado
echo.
echo  ════════════════════════════════════════════════════════════
echo.
echo  💰 Sistema de Creditos v1.0 ACTIVO
echo     • 50 creditos gratis al registrarse
echo     • Validacion automatica antes de acciones
echo     • Historial completo de transacciones
echo     • Reembolso automatico en caso de error
echo.
echo  ════════════════════════════════════════════════════════════
echo.

REM Instalar dependencias
cd backend
if not exist "node_modules" (
    echo  [1/2] Instalando dependencias...
    echo.
    call npm install --silent
    echo.
    echo  [✓] Dependencias instaladas
) else (
    echo  [1/2] Dependencias OK
)

echo.
echo  [2/2] Iniciando servidores en paralelo...
echo.

REM Crear script temporal para ejecutar ambos servidores
cd ..
echo const { spawn } = require('child_process'); > temp_launcher.js
echo const path = require('path'); >> temp_launcher.js
echo. >> temp_launcher.js
echo console.log('\n  ════════════════════════════════════════════════════════════'); >> temp_launcher.js
echo console.log('  ║              SERVIDORES INICIADOS                        ║'); >> temp_launcher.js
echo console.log('  ════════════════════════════════════════════════════════════\n'); >> temp_launcher.js
echo. >> temp_launcher.js
echo const backend = spawn('node', ['server.js'], { >> temp_launcher.js
echo   cwd: path.join(__dirname, 'backend'), >> temp_launcher.js
echo   shell: true >> temp_launcher.js
echo }); >> temp_launcher.js
echo. >> temp_launcher.js
echo const frontend = spawn('node', ['server.js'], { >> temp_launcher.js
echo   cwd: path.join(__dirname, 'frontend'), >> temp_launcher.js
echo   shell: true >> temp_launcher.js
echo }); >> temp_launcher.js
echo. >> temp_launcher.js
echo backend.stdout.on('data', (data) =^> { >> temp_launcher.js
echo   process.stdout.write('  [BACKEND]  ' + data); >> temp_launcher.js
echo }); >> temp_launcher.js
echo. >> temp_launcher.js
echo backend.stderr.on('data', (data) =^> { >> temp_launcher.js
echo   process.stderr.write('  [BACKEND]  ' + data); >> temp_launcher.js
echo }); >> temp_launcher.js
echo. >> temp_launcher.js
echo frontend.stdout.on('data', (data) =^> { >> temp_launcher.js
echo   process.stdout.write('  [FRONTEND] ' + data); >> temp_launcher.js
echo }); >> temp_launcher.js
echo. >> temp_launcher.js
echo frontend.stderr.on('data', (data) =^> { >> temp_launcher.js
echo   process.stderr.write('  [FRONTEND] ' + data); >> temp_launcher.js
echo }); >> temp_launcher.js
echo. >> temp_launcher.js
echo setTimeout(() =^> { >> temp_launcher.js
echo   console.log('\n  ════════════════════════════════════════════════════════════'); >> temp_launcher.js
echo   console.log('  ║                                                          ║'); >> temp_launcher.js
echo   console.log('  ║    ✓ Backend:  http://localhost:3000                    ║'); >> temp_launcher.js
echo   console.log('  ║    ✓ Frontend: http://localhost:8080                    ║'); >> temp_launcher.js
echo   console.log('  ║                                                          ║'); >> temp_launcher.js
echo   console.log('  ╠══════════════════════════════════════════════════════════╣'); >> temp_launcher.js
echo   console.log('  ║  💰 SISTEMA DE CREDITOS                                  ║'); >> temp_launcher.js
echo   console.log('  ║    • Usuarios nuevos: 50 creditos gratis                ║'); >> temp_launcher.js
echo   console.log('  ║    • Generar imagen: 1 credito                          ║'); >> temp_launcher.js
echo   console.log('  ║    • Generar video: 5 creditos                          ║'); >> temp_launcher.js
echo   console.log('  ║                                                          ║'); >> temp_launcher.js
echo   console.log('  ║  📚 Documentacion:                                       ║'); >> temp_launcher.js
echo   console.log('  ║    • backend/CREDITS_README.md                          ║'); >> temp_launcher.js
echo   console.log('  ║    • backend/CREDITS_SYSTEM_GUIDE.md                    ║'); >> temp_launcher.js
echo   console.log('  ║                                                          ║'); >> temp_launcher.js
echo   console.log('  ║    Abriendo navegador...                                ║'); >> temp_launcher.js
echo   console.log('  ║                                                          ║'); >> temp_launcher.js
echo   console.log('  ╠══════════════════════════════════════════════════════════╣'); >> temp_launcher.js
echo   console.log('  ║    Presiona Ctrl+C para detener los servidores          ║'); >> temp_launcher.js
echo   console.log('  ════════════════════════════════════════════════════════════\n'); >> temp_launcher.js
echo   require('child_process').exec('start http://localhost:8080'); >> temp_launcher.js
echo }, 2000); >> temp_launcher.js
echo. >> temp_launcher.js
echo process.on('SIGINT', () =^> { >> temp_launcher.js
echo   console.log('\n\n  Deteniendo servidores...'); >> temp_launcher.js
echo   backend.kill(); >> temp_launcher.js
echo   frontend.kill(); >> temp_launcher.js
echo   process.exit(); >> temp_launcher.js
echo }); >> temp_launcher.js

cls
echo.
echo  ╔════════════════════════════════════════════════════════════╗
echo  ║                                                            ║
echo  ║              INICIANDO SERVIDORES...                      ║
echo  ║                                                            ║
echo  ╚════════════════════════════════════════════════════════════╝
echo.

node temp_launcher.js

REM Limpiar archivo temporal
del temp_launcher.js >nul 2>nul

cls
echo.
echo  ╔════════════════════════════════════════════════════════════╗
echo  ║                                                            ║
echo  ║              SERVIDORES DETENIDOS                         ║
echo  ║                                                            ║
echo  ╚════════════════════════════════════════════════════════════╝
echo.
echo  📚 SISTEMA DE CREDITOS - Endpoints Disponibles:
echo.
echo  GET  /api/credits/balance     Ver saldo de creditos
echo  GET  /api/credits/history     Ver historial de transacciones
echo  GET  /api/credits/stats       Ver estadisticas de uso
echo  GET  /api/credits/plans       Ver planes de compra
echo  POST /api/credits/add         Agregar creditos (admin)
echo  POST /api/credits/deduct      Descontar creditos (admin)
echo  GET  /api/credits/users       Listar usuarios (admin)
echo.
echo  📖 Documentacion completa en:
echo     • backend\CREDITS_README.md
echo     • backend\CREDITS_SYSTEM_GUIDE.md
echo     • backend\CREDITS_TEST_EXAMPLES.md
echo.
pause
