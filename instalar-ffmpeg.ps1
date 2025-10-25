# Script para instalar FFmpeg en Windows
Write-Host "🚀 Iniciando instalación de FFmpeg..." -ForegroundColor Cyan

# Crear directorio para FFmpeg
$ffmpegDir = "$env:USERPROFILE\ffmpeg"
if (-not (Test-Path $ffmpegDir)) {
    New-Item -ItemType Directory -Path $ffmpegDir | Out-Null
    Write-Host "📂 Directorio creado: $ffmpegDir" -ForegroundColor Green
}

# Descargar FFmpeg
$ffmpegZip = "$ffmpegDir\ffmpeg.zip"
$ffmpegUrl = "https://www.gyan.dev/ffmpeg/builds/ffmpeg-release-essentials.zip"

Write-Host "⬇️  Descargando FFmpeg..." -ForegroundColor Yellow
Invoke-WebRequest -Uri $ffmpegUrl -OutFile $ffmpegZip

# Extraer archivos
Write-Host "📦 Extrayendo archivos..." -ForegroundColor Yellow
Expand-Archive -Path $ffmpegZip -DestinationPath $ffmpegDir -Force

# Obtener la carpeta extraída
$extractedFolder = Get-ChildItem -Path $ffmpegDir -Directory | Where-Object { $_.Name -like "ffmpeg-*-essentials_build" } | Select-Object -First 1

if ($extractedFolder) {
    # Mover archivos al directorio principal
    $ffmpegPath = Join-Path $extractedFolder.FullName "bin"
    
    # Agregar al PATH del sistema
    $currentPath = [Environment]::GetEnvironmentVariable('Path', 'User')
    if ($currentPath -notlike "*$ffmpegPath*") {
        [Environment]::SetEnvironmentVariable('Path', "$currentPath;$ffmpegPath", 'User')
        $env:Path += ";$ffmpegPath"
        Write-Host "✅ FFmpeg agregado al PATH del usuario" -ForegroundColor Green
    }
    
    # Verificar instalación
    try {
        $version = & "$ffmpegPath\ffmpeg.exe" -version | Select-Object -First 1
        Write-Host "✅ FFmpeg instalado correctamente" -ForegroundColor Green
        Write-Host "   $version" -ForegroundColor Gray
        
        # Instalar dependencias de Node.js
        Write-Host "📦 Instalando dependencias de Node.js..." -ForegroundColor Cyan
        Set-Location "$PSScriptRoot\backend"
        npm install fluent-ffmpeg
        
        Write-Host "`n✨ ¡Todo listo! Reinicia tu terminal para aplicar los cambios.`n" -ForegroundColor Green
        Write-Host "Luego, inicia el servidor con: cd backend && node server.js" -ForegroundColor Cyan
    }
    catch {
        Write-Host "❌ Error al verificar la instalación de FFmpeg" -ForegroundColor Red
    }
}
else {
    Write-Host "❌ No se pudo encontrar la carpeta de FFmpeg extraída" -ForegroundColor Red
}

# Limpiar archivo ZIP
Remove-Item -Path $ffmpegZip -Force -ErrorAction SilentlyContinue
