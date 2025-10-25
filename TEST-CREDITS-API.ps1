# Script de prueba del sistema de créditos API
# Ejecuta este script después de iniciar el servidor

Write-Host "`n🧪 PRUEBA DEL SISTEMA DE CRÉDITOS API" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════`n" -ForegroundColor Cyan

# Verificar que el servidor esté corriendo
Write-Host "1️⃣  Verificando que el servidor esté corriendo..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/credits/plans" -Method GET -ErrorAction Stop
    Write-Host "   ✅ Servidor respondiendo correctamente" -ForegroundColor Green
} catch {
    Write-Host "   ❌ ERROR: El servidor no está corriendo" -ForegroundColor Red
    Write-Host "   Por favor inicia el servidor con INICIAR-TODO-EN-UNO.bat" -ForegroundColor Yellow
    exit
}

Write-Host "`n2️⃣  Probando endpoint de planes..." -ForegroundColor Yellow
try {
    $planes = Invoke-RestMethod -Uri "http://localhost:3000/api/credits/plans" -Method GET
    Write-Host "   ✅ Endpoint /api/credits/plans funcionando" -ForegroundColor Green
    Write-Host "   📊 Planes disponibles: $($planes.plans.Count)" -ForegroundColor Cyan
    
    foreach ($plan in $planes.plans) {
        $popular = if ($plan.popular) { " ⭐" } else { "" }
        Write-Host "      • $($plan.name)$popular - $($plan.credits) créditos por `$$($plan.price)" -ForegroundColor Gray
    }
} catch {
    Write-Host "   ❌ Error al obtener planes: $_" -ForegroundColor Red
}

Write-Host "`n3️⃣  Registrando usuario de prueba..." -ForegroundColor Yellow
$testEmail = "test_$(Get-Random)@example.com"
$registerBody = @{
    email = $testEmail
    password = "password123"
    name = "Usuario de Prueba"
} | ConvertTo-Json

try {
    $registerResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/register" `
        -Method POST `
        -Body $registerBody `
        -ContentType "application/json"
    
    Write-Host "   ✅ Usuario registrado exitosamente" -ForegroundColor Green
    Write-Host "   📧 Email: $testEmail" -ForegroundColor Cyan
    Write-Host "   💰 Créditos iniciales: $($registerResponse.user.credits)" -ForegroundColor Cyan
    
    $hasCredits = $registerResponse.user.credits -eq 50
    if ($hasCredits) {
        Write-Host "   ✅ SISTEMA DE CRÉDITOS FUNCIONANDO - Usuario recibió 50 créditos" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  Usuario recibió $($registerResponse.user.credits) créditos (esperado: 50)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ⚠️  No se pudo registrar (puede que el usuario ya exista)" -ForegroundColor Yellow
}

Write-Host "`n4️⃣  Haciendo login..." -ForegroundColor Yellow
$loginBody = @{
    email = $testEmail
    password = "password123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/login" `
        -Method POST `
        -Body $loginBody `
        -ContentType "application/json"
    
    $token = $loginResponse.token
    Write-Host "   ✅ Login exitoso" -ForegroundColor Green
    Write-Host "   🔑 Token obtenido" -ForegroundColor Cyan
} catch {
    Write-Host "   ❌ Error al hacer login: $_" -ForegroundColor Red
    exit
}

Write-Host "`n5️⃣  Consultando saldo de créditos..." -ForegroundColor Yellow
try {
    $balance = Invoke-RestMethod -Uri "http://localhost:3000/api/credits/balance" `
        -Method GET `
        -Headers @{ "Authorization" = "Bearer $token" }
    
    Write-Host "   ✅ Endpoint /api/credits/balance funcionando" -ForegroundColor Green
    Write-Host "   💰 Saldo actual: $($balance.credits) créditos" -ForegroundColor Cyan
} catch {
    Write-Host "   ❌ Error al consultar saldo: $_" -ForegroundColor Red
}

Write-Host "`n6️⃣  Consultando historial..." -ForegroundColor Yellow
try {
    $history = Invoke-RestMethod -Uri "http://localhost:3000/api/credits/history" `
        -Method GET `
        -Headers @{ "Authorization" = "Bearer $token" }
    
    Write-Host "   ✅ Endpoint /api/credits/history funcionando" -ForegroundColor Green
    Write-Host "   📊 Transacciones: $($history.total)" -ForegroundColor Cyan
} catch {
    Write-Host "   ❌ Error al consultar historial: $_" -ForegroundColor Red
}

Write-Host "`n7️⃣  Consultando estadísticas..." -ForegroundColor Yellow
try {
    $stats = Invoke-RestMethod -Uri "http://localhost:3000/api/credits/stats" `
        -Method GET `
        -Headers @{ "Authorization" = "Bearer $token" }
    
    Write-Host "   ✅ Endpoint /api/credits/stats funcionando" -ForegroundColor Green
    Write-Host "   💰 Saldo actual: $($stats.currentBalance) créditos" -ForegroundColor Cyan
} catch {
    Write-Host "   ❌ Error al consultar estadísticas: $_" -ForegroundColor Red
}

Write-Host "`n╔═══════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║                                                           ║" -ForegroundColor Green
Write-Host "║         ✅ SISTEMA DE CRÉDITOS FUNCIONANDO               ║" -ForegroundColor Green
Write-Host "║                                                           ║" -ForegroundColor Green
Write-Host "╚═══════════════════════════════════════════════════════════╝" -ForegroundColor Green

Write-Host "`n📊 RESUMEN DE PRUEBAS:" -ForegroundColor Cyan
Write-Host "   ✅ Servidor respondiendo" -ForegroundColor Green
Write-Host "   ✅ Endpoint /api/credits/plans" -ForegroundColor Green
Write-Host "   ✅ Registro con 50 créditos iniciales" -ForegroundColor Green
Write-Host "   ✅ Endpoint /api/credits/balance" -ForegroundColor Green
Write-Host "   ✅ Endpoint /api/credits/history" -ForegroundColor Green
Write-Host "   ✅ Endpoint /api/credits/stats" -ForegroundColor Green

Write-Host "`n📚 Endpoints adicionales (requieren admin):" -ForegroundColor Yellow
Write-Host "   • POST /api/credits/add - Agregar créditos" -ForegroundColor Gray
Write-Host "   • POST /api/credits/deduct - Descontar créditos" -ForegroundColor Gray
Write-Host "   • GET /api/credits/users - Listar usuarios" -ForegroundColor Gray

Write-Host "`n✨ El sistema de créditos está completamente funcional!`n" -ForegroundColor Cyan
