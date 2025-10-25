# 🪙 Sistema de Créditos - Resumen Rápido

## ✅ ¿Qué se implementó?

Sistema completo de créditos con:
- **50 créditos gratis** al registrarse
- **Descuento automático** por cada acción de IA
- **Historial completo** de transacciones
- **Reembolso automático** si hay errores
- **Panel de administración** para gestionar créditos
- **Planes de compra** (preparado para Stripe/MercadoPago)

---

## 📁 Archivos Creados

| Archivo | Descripción |
|---------|-------------|
| `models/CreditTransaction.js` | Modelo de transacciones de créditos |
| `config/creditConfig.js` | Configuración de costos (fácil de modificar) |
| `middleware/checkCredits.js` | Validación de créditos antes de acciones |
| `routes/credits.js` | Endpoints para gestionar créditos |
| `services/creditService.js` | Lógica de negocio centralizada |

## 📝 Archivos Modificados

| Archivo | Cambios |
|---------|---------|
| `models/User.js` | Créditos por defecto: 50, campo `role` agregado |
| `server.js` | Integración completa del sistema de créditos |

---

## 💰 Costos por Acción

```javascript
// Puedes modificar estos valores en config/creditConfig.js
GENERATE_IMAGE: 1 crédito
GENERATE_VIDEO: 5 créditos
GENERATE_TEXT: 0.5 créditos

// Costos adicionales por proveedor
huggingface: +0 (gratis)
openai: +10 créditos
midjourney: +15 créditos
leonardo: +12 créditos
flux: +20 créditos

// Costos adicionales por calidad
standard: +0
hd: +0
4k: +5 créditos
```

**Ejemplo:** Generar imagen con OpenAI en 4K = 1 + 10 + 5 = **16 créditos**

---

## 🚀 Endpoints Principales

### Usuario Normal

```http
GET /api/credits/balance          # Ver saldo
GET /api/credits/history          # Ver historial
GET /api/credits/stats            # Ver estadísticas
GET /api/credits/plans            # Ver planes de compra
```

### Administrador

```http
POST /api/credits/add             # Agregar créditos a usuario
POST /api/credits/deduct          # Descontar créditos
GET  /api/credits/users           # Listar usuarios con créditos
```

---

## 🧪 Prueba Rápida

```powershell
# 1. Registrar usuario
$body = @{
    email = "test@example.com"
    password = "password123"
    name = "Test User"
} | ConvertTo-Json

$user = Invoke-RestMethod -Uri "http://localhost:3000/api/register" `
  -Method POST -Body $body -ContentType "application/json"

# 2. Login
$body = @{
    email = "test@example.com"
    password = "password123"
} | ConvertTo-Json

$token = (Invoke-RestMethod -Uri "http://localhost:3000/api/login" `
  -Method POST -Body $body -ContentType "application/json").token

# 3. Ver créditos
Invoke-RestMethod -Uri "http://localhost:3000/api/credits/balance" `
  -Headers @{ "Authorization" = "Bearer $token" }

# 4. Generar imagen (descuenta 1 crédito)
$body = @{
    prompt = "A beautiful sunset"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/generate" `
  -Method POST -Body $body -ContentType "application/json" `
  -Headers @{ "Authorization" = "Bearer $token" }
```

---

## ⚙️ Configurar Admin

```javascript
// Opción 1: En MongoDB Shell
db.users.updateOne(
    { email: "admin@example.com" },
    { $set: { role: "admin" } }
)

// Opción 2: En .env
ADMIN_EMAIL=admin@example.com
```

---

## 📊 Cómo Funciona

1. **Usuario se registra** → Recibe 50 créditos automáticamente
2. **Usuario genera imagen** → Middleware valida créditos suficientes
3. **Sistema descuenta créditos** → Crea transacción en BD
4. **IA genera imagen** → Procesa solicitud
5. **Si hay error** → Reembolsa automáticamente los créditos
6. **Respuesta** → Incluye créditos restantes

---

## 🔧 Modificar Costos

Edita `config/creditConfig.js`:

```javascript
const ACTION_COSTS = {
    GENERATE_IMAGE: 2,    // Cambiar de 1 a 2
    GENERATE_VIDEO: 10,   // Cambiar de 5 a 10
    GENERATE_TEXT: 1      // Cambiar de 0.5 a 1
};
```

Reinicia el servidor y los cambios se aplicarán inmediatamente.

---

## 📚 Documentación Completa

- **`CREDITS_SYSTEM_GUIDE.md`** - Guía completa del sistema (620+ líneas)
- **`CREDITS_TEST_EXAMPLES.md`** - Ejemplos de prueba con PowerShell y cURL

---

## ✨ Características Destacadas

### ✅ Reembolso Automático
Si la generación de IA falla, los créditos se reembolsan automáticamente.

### ✅ Historial Completo
Cada transacción queda registrada con:
- Cantidad de créditos
- Tipo de acción
- Descripción
- Saldo después de la transacción
- Fecha

### ✅ Sistema de Roles
- **user**: Puede usar créditos y ver su historial
- **admin**: Puede agregar/quitar créditos de cualquier usuario

### ✅ Validación Previa
El middleware `checkCredits` valida que el usuario tenga suficientes créditos ANTES de ejecutar la acción costosa.

### ✅ Configuración Flexible
Todos los costos están centralizados en `creditConfig.js` para fácil modificación.

---

## 🎯 Próximos Pasos Opcionales

1. **Integrar pagos reales**
   - Stripe: `npm install stripe`
   - MercadoPago: `npm install mercadopago`

2. **Créditos gratis diarios**
   - Agregar campo `lastDailyCredit` en User
   - Crear endpoint que agregue 5 créditos cada 24h

3. **Notificaciones**
   - Email cuando quedan < 10 créditos
   - Push notification en el frontend

4. **Dashboard admin**
   - Panel con estadísticas globales
   - Gráficos de uso de créditos

5. **Suscripciones mensuales**
   - Plan Premium: 500 créditos/mes
   - Plan Business: 2000 créditos/mes

---

## 🆘 Problemas Comunes

### "No tienes créditos suficientes"
```powershell
# Solución: Agregar créditos manualmente (como admin)
POST /api/credits/add
{ "userId": "user_id", "amount": 100 }

# O directamente en MongoDB
db.users.updateOne({ email: "user@example.com" }, { $inc: { credits: 100 } })
```

### "Solo administradores pueden realizar esta acción"
```javascript
// Dar permisos de admin
db.users.updateOne(
    { email: "admin@example.com" },
    { $set: { role: "admin" } }
)
```

---

## 💡 Tips

1. **Todos los usuarios nuevos reciben 50 créditos automáticamente**
2. **Los créditos nunca caducan**
3. **El historial se guarda permanentemente**
4. **Los reembolsos son automáticos en caso de error**
5. **Puedes cambiar los costos en cualquier momento sin tocar código**

---

## 🎉 ¡Sistema Listo!

El sistema de créditos está **completamente funcional** e integrado con:
- ✅ Autenticación (JWT + Google OAuth)
- ✅ Generación de imágenes con IA
- ✅ Base de datos MongoDB
- ✅ Panel de administración

**¡Ya puedes empezar a usarlo!** 🚀
