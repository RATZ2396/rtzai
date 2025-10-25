# 🪙 Sistema de Créditos - Guía Completa

## 📋 Índice
1. [Descripción General](#descripción-general)
2. [Arquitectura](#arquitectura)
3. [Configuración](#configuración)
4. [API Endpoints](#api-endpoints)
5. [Cómo Probar](#cómo-probar)
6. [Integración con IA](#integración-con-ia)
7. [Administración](#administración)
8. [Planes de Pago](#planes-de-pago)

---

## 📖 Descripción General

Sistema completo de créditos que permite:
- ✅ Asignar créditos iniciales al registrarse (50 créditos)
- ✅ Descontar créditos por cada acción de IA
- ✅ Registrar historial de todas las transacciones
- ✅ Administrar créditos de usuarios (solo admins)
- ✅ Reembolsar créditos en caso de errores
- ✅ Sistema de planes de compra (preparado para Stripe/MercadoPago)

### Costos por Acción

| Acción | Costo Base | Proveedor Premium | Calidad 4K |
|--------|------------|-------------------|------------|
| Generar Imagen | 1 crédito | +10-20 créditos | +5 créditos |
| Generar Video | 5 créditos | +10-20 créditos | +5 créditos |
| Generar Texto | 0.5 créditos | Variable | N/A |

**Nota:** Los costos se suman. Por ejemplo, generar una imagen con OpenAI en 4K costaría: 1 + 10 + 5 = **16 créditos**

---

## 🏗️ Arquitectura

### Archivos Creados

```
backend/
├── models/
│   ├── CreditTransaction.js      # Modelo de transacciones
│   └── User.js (actualizado)     # Campo credits: 50 por defecto
│
├── config/
│   └── creditConfig.js           # Configuración de costos
│
├── middleware/
│   └── checkCredits.js           # Validación de créditos
│
├── routes/
│   └── credits.js                # Rutas de gestión de créditos
│
├── services/
│   └── creditService.js          # Lógica de negocio de créditos
│
└── server.js (actualizado)       # Integración del sistema

```

### Flujo de una Transacción

```
1. Usuario hace request → /api/generate
2. Middleware auth → Verifica autenticación
3. Middleware checkCredits → Valida créditos suficientes
4. Controller → Descuenta créditos (crea transacción)
5. AI Service → Genera imagen/video
6. Controller → Guarda resultado y actualiza transacción
7. Response → Devuelve resultado + créditos restantes
```

Si hay error en paso 5-6, se reembolsan automáticamente los créditos.

---

## ⚙️ Configuración

### 1. Modificar Costos (si es necesario)

Edita `config/creditConfig.js`:

```javascript
const ACTION_COSTS = {
    GENERATE_IMAGE: 1,      // Cambiar aquí
    GENERATE_VIDEO: 5,      // Cambiar aquí
    GENERATE_TEXT: 0.5      // Cambiar aquí
};

const PROVIDER_COSTS = {
    huggingface: 0,         // Gratis
    openai: 10,             // Premium
    midjourney: 15          // Premium
};
```

### 2. Configurar Admin

En tu archivo `.env`, agrega:

```env
ADMIN_EMAIL=tu-email@admin.com
```

O actualiza un usuario existente en MongoDB:

```javascript
db.users.updateOne(
    { email: "tu-email@admin.com" },
    { $set: { role: "admin" } }
)
```

---

## 🌐 API Endpoints

### Endpoints Públicos (requieren autenticación)

#### 1. Obtener Saldo Actual
```http
GET /api/credits/balance
Authorization: Bearer <token>
```

**Respuesta:**
```json
{
  "credits": 50,
  "userId": "user_id"
}
```

#### 2. Ver Historial de Transacciones
```http
GET /api/credits/history?limit=50&skip=0
Authorization: Bearer <token>
```

**Respuesta:**
```json
{
  "transactions": [
    {
      "_id": "trans_id",
      "amount": -1,
      "type": "deduct",
      "description": "Generación de imagen con huggingface (hd)",
      "balanceAfter": 49,
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "total": 10,
  "currentPage": 1,
  "totalPages": 1
}
```

#### 3. Ver Estadísticas
```http
GET /api/credits/stats
Authorization: Bearer <token>
```

**Respuesta:**
```json
{
  "currentBalance": 49,
  "stats": {
    "deduct": { "total": -5, "count": 5 },
    "add": { "total": 50, "count": 1 },
    "initial": { "total": 50, "count": 1 }
  }
}
```

#### 4. Ver Planes de Compra
```http
GET /api/credits/plans
```

**Respuesta:**
```json
{
  "plans": [
    {
      "id": "starter",
      "name": "Plan Starter",
      "credits": 100,
      "price": 5,
      "currency": "USD"
    }
  ]
}
```

### Endpoints de Admin (requieren role: 'admin')

#### 5. Agregar Créditos a Usuario
```http
POST /api/credits/add
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "userId": "user_id",
  "amount": 100,
  "description": "Recarga promocional"
}
```

#### 6. Descontar Créditos de Usuario
```http
POST /api/credits/deduct
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "userId": "user_id",
  "amount": 10,
  "description": "Ajuste manual"
}
```

#### 7. Listar Usuarios con Créditos
```http
GET /api/credits/users
Authorization: Bearer <admin_token>
```

---

## 🧪 Cómo Probar

### Paso 1: Iniciar el Servidor

```bash
cd backend
npm install
npm start
```

### Paso 2: Registrar un Usuario

```bash
# Usando curl (Windows PowerShell)
$body = @{
    email = "test@example.com"
    password = "password123"
    name = "Test User"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/register" `
  -Method POST `
  -Body $body `
  -ContentType "application/json"
```

**Respuesta esperada:**
```json
{
  "message": "Usuario registrado exitosamente",
  "user": {
    "email": "test@example.com",
    "name": "Test User",
    "credits": 50
  }
}
```

### Paso 3: Login

```bash
$body = @{
    email = "test@example.com"
    password = "password123"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:3000/api/login" `
  -Method POST `
  -Body $body `
  -ContentType "application/json"

$token = $response.token
```

### Paso 4: Ver Saldo

```bash
Invoke-RestMethod -Uri "http://localhost:3000/api/credits/balance" `
  -Method GET `
  -Headers @{ "Authorization" = "Bearer $token" }
```

### Paso 5: Generar Imagen (descontará créditos)

```bash
$body = @{
    prompt = "A beautiful sunset"
    aiProvider = "huggingface"
    quality = "hd"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/generate" `
  -Method POST `
  -Body $body `
  -ContentType "application/json" `
  -Headers @{ "Authorization" = "Bearer $token" }
```

**Respuesta esperada:**
```json
{
  "url": "http://localhost:3000/uploads/generated-123.png",
  "creditsUsed": 1,
  "creditsRemaining": 49
}
```

### Paso 6: Ver Historial

```bash
Invoke-RestMethod -Uri "http://localhost:3000/api/credits/history" `
  -Method GET `
  -Headers @{ "Authorization" = "Bearer $token" }
```

---

## 🤖 Integración con IA

### Ejemplo: Generar Imagen

El sistema ya está integrado en `/api/generate`. Internamente:

1. **Middleware `checkCredits('GENERATE_IMAGE')`** verifica créditos
2. **`deductCreditsForAction()`** descuenta créditos y crea transacción
3. **`generateVideo()`** genera la imagen
4. Si hay error, **`refundCredits()`** reembolsa automáticamente

### Agregar Nueva Acción de IA

#### 1. Agregar costo en `config/creditConfig.js`:

```javascript
const ACTION_COSTS = {
    // ... existentes
    UPSCALE_IMAGE: 2,  // Nueva acción
};
```

#### 2. Crear endpoint en `server.js`:

```javascript
app.post('/api/upscale', auth, checkCredits('UPSCALE_IMAGE'), async (req, res) => {
    let transaction = null;
    
    try {
        const { imageId } = req.body;
        
        // Descontar créditos
        const creditResult = await deductCreditsForAction(
            req.user._id,
            'UPSCALE_IMAGE',
            'huggingface',
            'standard'
        );
        transaction = creditResult.transaction;
        
        // Tu lógica de mejora de imagen aquí
        const result = await upscaleImage(imageId);
        
        res.json({
            success: true,
            result,
            creditsRemaining: creditResult.newBalance
        });
        
    } catch (error) {
        // Reembolsar si hay error
        if (transaction) {
            await refundCredits(
                req.user._id,
                Math.abs(transaction.amount),
                'Error al mejorar imagen',
                transaction._id
            );
        }
        res.status(500).json({ error: error.message });
    }
});
```

---

## 👨‍💼 Administración

### Ver Todos los Usuarios y sus Créditos

```javascript
// MongoDB Shell
db.users.find({}, { email: 1, credits: 1, createdAt: 1 })
    .sort({ credits: -1 })
    .limit(20)
```

### Agregar Créditos Manualmente

**Opción 1: Via API** (recomendado)
```bash
# Primero haz login como admin
# Luego usa el endpoint /api/credits/add
```

**Opción 2: Via MongoDB**
```javascript
db.users.updateOne(
    { email: "user@example.com" },
    { $inc: { credits: 100 } }
)

// Crear transacción manualmente
db.credittransactions.insertOne({
    userId: ObjectId("user_id"),
    amount: 100,
    type: "add",
    description: "Recarga manual desde MongoDB",
    balanceAfter: 150,
    action: "manual_add",
    createdAt: new Date()
})
```

### Ver Estadísticas Globales

```javascript
// Total de créditos en el sistema
db.users.aggregate([
    { $group: { _id: null, totalCredits: { $sum: "$credits" } } }
])

// Usuarios con más créditos
db.users.find().sort({ credits: -1 }).limit(10)

// Transacciones del último mes
db.credittransactions.find({
    createdAt: { $gte: new Date(new Date().setDate(new Date().getDate() - 30)) }
}).count()
```

---

## 💳 Planes de Pago

### Configuración Actual

Los planes están definidos en `config/creditConfig.js`:

```javascript
const CREDIT_PLANS = [
    {
        id: 'starter',
        name: 'Plan Starter',
        credits: 100,
        price: 5,
        currency: 'USD'
    },
    {
        id: 'basic',
        name: 'Plan Basic',
        credits: 250,
        price: 10,
        currency: 'USD',
        popular: true
    }
    // ... más planes
];
```

### Integración con Stripe (Próximamente)

```javascript
// En routes/credits.js - endpoint /purchase
// 1. Crear sesión de Stripe Checkout
const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [{
        price_data: {
            currency: 'usd',
            product_data: {
                name: plan.name,
            },
            unit_amount: plan.price * 100,
        },
        quantity: 1,
    }],
    mode: 'payment',
    success_url: 'http://localhost:8080/success',
    cancel_url: 'http://localhost:8080/cancel',
});

// 2. Webhook para confirmar pago y agregar créditos
app.post('/webhook/stripe', async (req, res) => {
    const event = req.body;
    
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        // Agregar créditos al usuario
        await CreditTransaction.createTransaction(
            userId,
            plan.credits,
            'add',
            `Compra de ${plan.name}`,
            { action: 'purchase' }
        );
    }
});
```

---

## 🔧 Troubleshooting

### Error: "No tienes créditos suficientes"

**Solución 1:** Agregar créditos como admin
```bash
POST /api/credits/add
{
  "userId": "user_id",
  "amount": 50
}
```

**Solución 2:** Modificar directamente en MongoDB
```javascript
db.users.updateOne(
    { email: "user@example.com" },
    { $set: { credits: 50 } }
)
```

### Error: "Usuario no es administrador"

```javascript
// Dar permisos de admin
db.users.updateOne(
    { email: "admin@example.com" },
    { $set: { role: "admin" } }
)
```

### Los créditos no se descuentan

Verifica:
1. ¿El middleware `checkCredits` está en la ruta?
2. ¿Se está llamando a `deductCreditsForAction()`?
3. Revisa los logs del servidor

---

## 📊 Monitoreo

### Ver últimas transacciones

```bash
GET /api/credits/history
```

### Ver estadísticas de uso

```bash
GET /api/credits/stats
```

### Logs importantes

```bash
# En el servidor verás:
💳 Descuento: 1 créditos | Saldo restante: 49
✅ Imagen generada. Créditos restantes: 49
♻️ Créditos reembolsados por error
```

---

## 🚀 Próximos Pasos

- [ ] Integrar Stripe para pagos reales
- [ ] Sistema de suscripciones mensuales
- [ ] Créditos gratis diarios para usuarios activos
- [ ] Programa de referidos (ganar créditos)
- [ ] Dashboard de admin con estadísticas
- [ ] Notificaciones cuando quedan pocos créditos

---

## 📝 Notas Adicionales

- Todos los usuarios nuevos reciben **50 créditos** al registrarse
- Los créditos **nunca caducan**
- Los reembolsos son **automáticos** en caso de error
- El historial de transacciones se guarda **permanentemente**
- Los admins pueden **modificar créditos** sin límites

---

## 🆘 Soporte

Para problemas o dudas:
1. Revisa los logs del servidor (`console.log`)
2. Verifica la base de datos MongoDB
3. Prueba los endpoints con Postman o curl
4. Revisa esta documentación

**¡Sistema de créditos completamente funcional y listo para usar! 🎉**
