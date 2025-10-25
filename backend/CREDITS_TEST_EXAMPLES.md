# 🧪 Ejemplos de Prueba del Sistema de Créditos

## PowerShell (Windows)

### 1. Registrar Usuario Nuevo
```powershell
$body = @{
    email = "usuario@test.com"
    password = "password123"
    name = "Usuario Test"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:3000/api/register" `
  -Method POST `
  -Body $body `
  -ContentType "application/json"

Write-Host "✅ Usuario creado con $($response.user.credits) créditos"
```

### 2. Login y Guardar Token
```powershell
$body = @{
    email = "usuario@test.com"
    password = "password123"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:3000/api/login" `
  -Method POST `
  -Body $body `
  -ContentType "application/json"

$token = $response.token
Write-Host "✅ Token guardado: $($token.Substring(0,20))..."
```

### 3. Ver Saldo de Créditos
```powershell
$response = Invoke-RestMethod -Uri "http://localhost:3000/api/credits/balance" `
  -Method GET `
  -Headers @{ "Authorization" = "Bearer $token" }

Write-Host "💰 Créditos disponibles: $($response.credits)"
```

### 4. Generar Imagen (descuenta 1 crédito)
```powershell
$body = @{
    prompt = "A beautiful sunset over the ocean"
    aiProvider = "huggingface"
    quality = "hd"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:3000/api/generate" `
  -Method POST `
  -Body $body `
  -ContentType "application/json" `
  -Headers @{ "Authorization" = "Bearer $token" }

Write-Host "🎨 Imagen generada: $($response.url)"
Write-Host "💳 Créditos usados: $($response.creditsUsed)"
Write-Host "💰 Créditos restantes: $($response.creditsRemaining)"
```

### 5. Ver Historial de Transacciones
```powershell
$response = Invoke-RestMethod -Uri "http://localhost:3000/api/credits/history" `
  -Method GET `
  -Headers @{ "Authorization" = "Bearer $token" }

Write-Host "📊 Total de transacciones: $($response.total)"
$response.transactions | ForEach-Object {
    Write-Host "  - $($_.description): $($_.amount) créditos | Saldo: $($_.balanceAfter)"
}
```

### 6. Ver Estadísticas
```powershell
$response = Invoke-RestMethod -Uri "http://localhost:3000/api/credits/stats" `
  -Method GET `
  -Headers @{ "Authorization" = "Bearer $token" }

Write-Host "📈 Saldo actual: $($response.currentBalance)"
Write-Host "📊 Estadísticas:"
$response.stats.PSObject.Properties | ForEach-Object {
    Write-Host "  - $($_.Name): $($_.Value.total) créditos ($($_.Value.count) transacciones)"
}
```

### 7. Ver Planes de Compra
```powershell
$response = Invoke-RestMethod -Uri "http://localhost:3000/api/credits/plans" `
  -Method GET

Write-Host "💎 Planes disponibles:"
$response.plans | ForEach-Object {
    Write-Host "  - $($_.name): $($_.credits) créditos por `$$($_.price)"
}
```

### 8. Crear Admin (modificar directamente en MongoDB)
```javascript
// Ejecutar en MongoDB Shell o Compass
db.users.updateOne(
    { email: "admin@test.com" },
    { $set: { role: "admin" } }
)
```

### 9. Agregar Créditos como Admin
```powershell
# Primero obtén el userId del usuario al que quieres agregar créditos
$targetUserId = "USER_ID_AQUI"

$body = @{
    userId = $targetUserId
    amount = 100
    description = "Recarga promocional"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:3000/api/credits/add" `
  -Method POST `
  -Body $body `
  -ContentType "application/json" `
  -Headers @{ "Authorization" = "Bearer $adminToken" }

Write-Host "✅ $($response.message)"
Write-Host "💰 Nuevo saldo: $($response.user.credits)"
```

### 10. Listar Usuarios (solo admin)
```powershell
$response = Invoke-RestMethod -Uri "http://localhost:3000/api/credits/users" `
  -Method GET `
  -Headers @{ "Authorization" = "Bearer $adminToken" }

Write-Host "👥 Total de usuarios: $($response.total)"
$response.users | ForEach-Object {
    Write-Host "  - $($_.email): $($_.credits) créditos"
}
```

---

## cURL (Linux/Mac/Git Bash)

### 1. Registrar Usuario
```bash
curl -X POST http://localhost:3000/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario@test.com",
    "password": "password123",
    "name": "Usuario Test"
  }'
```

### 2. Login
```bash
TOKEN=$(curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario@test.com",
    "password": "password123"
  }' | jq -r '.token')

echo "Token: $TOKEN"
```

### 3. Ver Saldo
```bash
curl -X GET http://localhost:3000/api/credits/balance \
  -H "Authorization: Bearer $TOKEN"
```

### 4. Generar Imagen
```bash
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "prompt": "A beautiful sunset over the ocean",
    "aiProvider": "huggingface",
    "quality": "hd"
  }'
```

### 5. Ver Historial
```bash
curl -X GET http://localhost:3000/api/credits/history \
  -H "Authorization: Bearer $TOKEN"
```

---

## Postman Collection

### Crear Colección
1. Abrir Postman
2. Crear nueva colección: "Credits System API"
3. Agregar variable `baseUrl`: `http://localhost:3000`
4. Agregar variable `token`: (se llenará después del login)

### Requests a Agregar

#### 1. Register User
- **Method:** POST
- **URL:** `{{baseUrl}}/api/register`
- **Body (raw JSON):**
```json
{
  "email": "test@example.com",
  "password": "password123",
  "name": "Test User"
}
```

#### 2. Login
- **Method:** POST
- **URL:** `{{baseUrl}}/api/login`
- **Body (raw JSON):**
```json
{
  "email": "test@example.com",
  "password": "password123"
}
```
- **Tests (para guardar token automáticamente):**
```javascript
pm.collectionVariables.set("token", pm.response.json().token);
```

#### 3. Get Balance
- **Method:** GET
- **URL:** `{{baseUrl}}/api/credits/balance`
- **Headers:** `Authorization: Bearer {{token}}`

#### 4. Generate Image
- **Method:** POST
- **URL:** `{{baseUrl}}/api/generate`
- **Headers:** `Authorization: Bearer {{token}}`
- **Body (raw JSON):**
```json
{
  "prompt": "A beautiful landscape",
  "aiProvider": "huggingface",
  "quality": "hd"
}
```

#### 5. Get History
- **Method:** GET
- **URL:** `{{baseUrl}}/api/credits/history?limit=10`
- **Headers:** `Authorization: Bearer {{token}}`

#### 6. Get Stats
- **Method:** GET
- **URL:** `{{baseUrl}}/api/credits/stats`
- **Headers:** `Authorization: Bearer {{token}}`

#### 7. Get Plans
- **Method:** GET
- **URL:** `{{baseUrl}}/api/credits/plans`

#### 8. Add Credits (Admin)
- **Method:** POST
- **URL:** `{{baseUrl}}/api/credits/add`
- **Headers:** `Authorization: Bearer {{adminToken}}`
- **Body (raw JSON):**
```json
{
  "userId": "USER_ID_HERE",
  "amount": 100,
  "description": "Promotional credits"
}
```

---

## Script de Prueba Completo (PowerShell)

```powershell
# Script completo para probar todo el sistema

Write-Host "🚀 Iniciando pruebas del sistema de créditos..." -ForegroundColor Cyan

# 1. Registrar usuario
Write-Host "`n📝 1. Registrando nuevo usuario..." -ForegroundColor Yellow
$registerBody = @{
    email = "test_$(Get-Random)@example.com"
    password = "password123"
    name = "Usuario de Prueba"
} | ConvertTo-Json

try {
    $registerResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/register" `
      -Method POST `
      -Body $registerBody `
      -ContentType "application/json"
    
    Write-Host "✅ Usuario creado: $($registerResponse.user.email)" -ForegroundColor Green
    Write-Host "💰 Créditos iniciales: $($registerResponse.user.credits)" -ForegroundColor Green
    
    $email = $registerResponse.user.email
} catch {
    Write-Host "❌ Error al registrar: $_" -ForegroundColor Red
    exit
}

# 2. Login
Write-Host "`n🔐 2. Haciendo login..." -ForegroundColor Yellow
$loginBody = @{
    email = $email
    password = "password123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/login" `
      -Method POST `
      -Body $loginBody `
      -ContentType "application/json"
    
    $token = $loginResponse.token
    Write-Host "✅ Login exitoso" -ForegroundColor Green
} catch {
    Write-Host "❌ Error al hacer login: $_" -ForegroundColor Red
    exit
}

# 3. Ver saldo inicial
Write-Host "`n💰 3. Consultando saldo..." -ForegroundColor Yellow
try {
    $balanceResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/credits/balance" `
      -Method GET `
      -Headers @{ "Authorization" = "Bearer $token" }
    
    Write-Host "✅ Saldo actual: $($balanceResponse.credits) créditos" -ForegroundColor Green
} catch {
    Write-Host "❌ Error al consultar saldo: $_" -ForegroundColor Red
}

# 4. Generar imagen
Write-Host "`n🎨 4. Generando imagen (costo: 1 crédito)..." -ForegroundColor Yellow
$generateBody = @{
    prompt = "A beautiful sunset over the ocean with palm trees"
    aiProvider = "huggingface"
    quality = "hd"
} | ConvertTo-Json

try {
    $generateResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/generate" `
      -Method POST `
      -Body $generateBody `
      -ContentType "application/json" `
      -Headers @{ "Authorization" = "Bearer $token" }
    
    Write-Host "✅ Imagen generada exitosamente" -ForegroundColor Green
    Write-Host "📸 URL: $($generateResponse.url)" -ForegroundColor Cyan
    Write-Host "💳 Créditos usados: $($generateResponse.creditsUsed)" -ForegroundColor Cyan
    Write-Host "💰 Créditos restantes: $($generateResponse.creditsRemaining)" -ForegroundColor Green
} catch {
    Write-Host "❌ Error al generar imagen: $_" -ForegroundColor Red
}

# 5. Ver historial
Write-Host "`n📊 5. Consultando historial de transacciones..." -ForegroundColor Yellow
try {
    $historyResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/credits/history" `
      -Method GET `
      -Headers @{ "Authorization" = "Bearer $token" }
    
    Write-Host "✅ Total de transacciones: $($historyResponse.total)" -ForegroundColor Green
    
    foreach ($transaction in $historyResponse.transactions) {
        $color = if ($transaction.amount -gt 0) { "Green" } else { "Red" }
        Write-Host "  • $($transaction.description)" -ForegroundColor $color
        Write-Host "    Monto: $($transaction.amount) | Saldo final: $($transaction.balanceAfter)" -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ Error al consultar historial: $_" -ForegroundColor Red
}

# 6. Ver estadísticas
Write-Host "`n📈 6. Consultando estadísticas..." -ForegroundColor Yellow
try {
    $statsResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/credits/stats" `
      -Method GET `
      -Headers @{ "Authorization" = "Bearer $token" }
    
    Write-Host "✅ Saldo actual: $($statsResponse.currentBalance) créditos" -ForegroundColor Green
    Write-Host "📊 Estadísticas por tipo:" -ForegroundColor Cyan
    
    foreach ($stat in $statsResponse.stats.PSObject.Properties) {
        Write-Host "  • $($stat.Name): $($stat.Value.total) créditos ($($stat.Value.count) transacciones)" -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ Error al consultar estadísticas: $_" -ForegroundColor Red
}

# 7. Ver planes
Write-Host "`n💎 7. Consultando planes de compra..." -ForegroundColor Yellow
try {
    $plansResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/credits/plans" `
      -Method GET
    
    Write-Host "✅ Planes disponibles:" -ForegroundColor Green
    
    foreach ($plan in $plansResponse.plans) {
        $popular = if ($plan.popular) { " ⭐ POPULAR" } else { "" }
        Write-Host "  • $($plan.name)$popular" -ForegroundColor Cyan
        Write-Host "    $($plan.credits) créditos por `$$($plan.price) USD" -ForegroundColor Gray
        if ($plan.savings) {
            Write-Host "    Ahorro: $($plan.savings)" -ForegroundColor Green
        }
    }
} catch {
    Write-Host "❌ Error al consultar planes: $_" -ForegroundColor Red
}

Write-Host "`n✅ Pruebas completadas exitosamente!" -ForegroundColor Green
Write-Host "📧 Usuario de prueba: $email" -ForegroundColor Cyan
```

---

## Validaciones a Realizar

### ✅ Checklist de Pruebas

- [ ] Usuario nuevo recibe 50 créditos al registrarse
- [ ] Login con Google también asigna 50 créditos
- [ ] Generar imagen descuenta 1 crédito
- [ ] No se puede generar si no hay créditos suficientes
- [ ] El historial muestra todas las transacciones
- [ ] Las estadísticas son correctas
- [ ] Admin puede agregar créditos
- [ ] Admin puede descontar créditos
- [ ] Admin puede ver lista de usuarios
- [ ] Reembolso automático funciona en caso de error
- [ ] Los costos varían según proveedor y calidad
- [ ] Los planes se muestran correctamente

---

## Casos de Prueba Específicos

### Caso 1: Usuario sin créditos
```powershell
# Consumir todos los créditos
1..50 | ForEach-Object {
    Invoke-RestMethod -Uri "http://localhost:3000/api/generate" `
      -Method POST `
      -Body (@{ prompt = "Test $_" } | ConvertTo-Json) `
      -ContentType "application/json" `
      -Headers @{ "Authorization" = "Bearer $token" }
}

# Intentar generar con 0 créditos (debe fallar)
try {
    Invoke-RestMethod -Uri "http://localhost:3000/api/generate" `
      -Method POST `
      -Body (@{ prompt = "Test" } | ConvertTo-Json) `
      -ContentType "application/json" `
      -Headers @{ "Authorization" = "Bearer $token" }
} catch {
    Write-Host "✅ Correctamente bloqueado: $_" -ForegroundColor Green
}
```

### Caso 2: Diferentes proveedores y calidades
```powershell
# HuggingFace + HD = 1 crédito
Invoke-RestMethod -Uri "http://localhost:3000/api/generate" `
  -Method POST `
  -Body (@{ 
      prompt = "Test"
      aiProvider = "huggingface"
      quality = "hd"
  } | ConvertTo-Json) `
  -ContentType "application/json" `
  -Headers @{ "Authorization" = "Bearer $token" }

# OpenAI + 4K = 1 + 10 + 5 = 16 créditos
Invoke-RestMethod -Uri "http://localhost:3000/api/generate" `
  -Method POST `
  -Body (@{ 
      prompt = "Test"
      aiProvider = "openai"
      quality = "4k"
  } | ConvertTo-Json) `
  -ContentType "application/json" `
  -Headers @{ "Authorization" = "Bearer $token" }
```

---

## Troubleshooting de Pruebas

### Error: "Cannot connect to server"
```powershell
# Verificar que el servidor está corriendo
Test-NetConnection -ComputerName localhost -Port 3000
```

### Error: "Token expired"
```powershell
# Hacer login nuevamente
$loginBody = @{
    email = "test@example.com"
    password = "password123"
} | ConvertTo-Json

$token = (Invoke-RestMethod -Uri "http://localhost:3000/api/login" `
  -Method POST `
  -Body $loginBody `
  -ContentType "application/json").token
```

### Error: "User not found"
```powershell
# Verificar que el usuario existe en MongoDB
# MongoDB Shell:
db.users.findOne({ email: "test@example.com" })
```

---

¡Sistema de créditos listo para probar! 🎉
