# 🔐 Sistema de Usuarios - Kling AI

## 📋 Resumen de Cambios

Se ha implementado un **sistema completo de autenticación con JWT** para el proyecto Kling AI. Ahora cada usuario debe crear una cuenta para usar la aplicación.

## ✨ Características Implementadas

### 🔑 Autenticación
- ✅ **Registro de usuarios** con email y contraseña
- ✅ **Inicio de sesión** con JWT (tokens válidos por 7 días)
- ✅ **Cierre de sesión**
- ✅ **Protección de rutas** - redirige a login si no hay sesión activa
- ✅ **Verificación automática** de tokens en cada request

### 💳 Sistema de Créditos
- ✅ **5 créditos gratis** al registrarse
- ✅ **1 crédito por imagen** generada
- ✅ **Verificación automática** antes de generar
- ✅ **Actualización en tiempo real** del balance

### 🖼️ Imágenes Privadas
- ✅ Cada usuario **solo ve sus propias imágenes**
- ✅ **Filtrado automático** por usuario en el backend
- ✅ **Imposible** acceder a imágenes de otros usuarios

## 🗂️ Estructura de Archivos

```
ProyectoKlingAI/
├── backend/
│   ├── config/
│   │   └── database.js          # Configuración de MongoDB
│   ├── middleware/
│   │   └── auth.js               # Middleware de autenticación JWT
│   ├── models/
│   │   ├── User.js               # Modelo de usuario
│   │   └── Image.js              # Modelo de imagen
│   ├── routes/
│   │   └── auth.js               # Rutas de autenticación
│   ├── .env.example              # Variables de entorno
│   ├── package.json              # Dependencias actualizadas
│   └── server.js                 # Servidor con autenticación
│
└── frontend/
    ├── login.html                # Página de inicio de sesión
    ├── register.html             # Página de registro
    ├── auth.css                  # Estilos para autenticación
    ├── auth.js                   # Lógica de login/registro
    ├── script.js                 # Actualizado con autenticación
    └── index.html                # Actualizado con panel de usuario
```

## 🚀 Instalación

### 1. Instalar MongoDB

**Windows:**
```bash
# Descargar e instalar desde: https://www.mongodb.com/try/download/community
# O usar MongoDB Atlas (cloud): https://www.mongodb.com/cloud/atlas
```

**Verificar instalación:**
```bash
mongod --version
```

### 2. Instalar Dependencias del Backend

```bash
cd backend
npm install
```

**Nuevas dependencias agregadas:**
- `bcrypt` - Para hashear contraseñas
- `jsonwebtoken` - Para generar y verificar tokens JWT
- `mongoose` - Para conectar con MongoDB

### 3. Configurar Variables de Entorno

Copia `.env.example` a `.env` y configura:

```env
# Puerto del servidor
PORT=3000

# MongoDB (local o Atlas)
MONGODB_URI=mongodb://localhost:27017/klingai

# JWT Secret (¡CAMBIAR EN PRODUCCIÓN!)
JWT_SECRET=tu_secreto_jwt_super_seguro_cambiar_en_produccion

# API Keys de IA
HUGGINGFACE_API_KEY=hf_tu_api_key_aqui
OPENAI_API_KEY=sk-tu_api_key_aqui
```

### 4. Iniciar MongoDB (si es local)

```bash
# Windows
mongod

# O como servicio
net start MongoDB
```

### 5. Iniciar el Servidor

```bash
cd backend
npm start

# O en modo desarrollo
npm run dev
```

### 6. Abrir el Frontend

Abre `frontend/index.html` en tu navegador o usa Live Server.

## 📡 Endpoints de API

### Autenticación

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/api/register` | Registrar nuevo usuario | No |
| POST | `/api/login` | Iniciar sesión | No |
| GET | `/api/user` | Obtener datos del usuario | Sí |
| POST | `/api/logout` | Cerrar sesión | Sí |

### Imágenes

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/api/generate` | Generar imagen | Sí |
| GET | `/api/images` | Obtener imágenes del usuario | Sí |
| DELETE | `/api/images/:id` | Eliminar imagen | Sí |

## 🔐 Flujo de Autenticación

### 1. Registro
```javascript
POST /api/register
{
  "name": "Juan Pérez",
  "email": "juan@example.com",
  "password": "123456"
}

// Respuesta
{
  "message": "Usuario registrado exitosamente",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "juan@example.com",
    "name": "Juan Pérez",
    "credits": 5,
    "hdUsesRemaining": 5
  }
}
```

### 2. Login
```javascript
POST /api/login
{
  "email": "juan@example.com",
  "password": "123456"
}

// Respuesta (igual que registro)
```

### 3. Usar Token en Requests
```javascript
// El frontend automáticamente agrega el token
fetch('/api/generate', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  },
  body: formData
})
```

## 💾 Modelos de Base de Datos

### User
```javascript
{
  _id: ObjectId,
  email: String (único, requerido),
  password: String (hasheado, requerido),
  name: String (requerido),
  credits: Number (default: 5),
  hdUsesRemaining: Number (default: 5),
  createdAt: Date,
  lastLogin: Date
}
```

### Image
```javascript
{
  _id: ObjectId,
  user: ObjectId (ref: 'User'),
  prompt: String,
  url: String,
  aiProvider: String,
  quality: String,
  creditsUsed: Number (default: 1),
  createdAt: Date
}
```

## 🎨 Frontend

### Páginas

1. **login.html** - Inicio de sesión
2. **register.html** - Registro de usuarios
3. **index.html** - Dashboard (requiere autenticación)

### Flujo de Usuario

```
1. Usuario abre index.html
   ↓
2. script.js verifica si hay token
   ↓
3a. NO HAY TOKEN → Redirige a login.html
3b. HAY TOKEN → Carga el dashboard
   ↓
4. Usuario genera imágenes
   ↓
5. Cada generación descuenta 1 crédito
   ↓
6. Usuario puede cerrar sesión
```

### LocalStorage

El frontend guarda:
```javascript
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "juan@example.com",
    "name": "Juan Pérez",
    "credits": 5
  }
}
```

## 🔒 Seguridad

### Implementado
- ✅ Contraseñas hasheadas con bcrypt (10 rounds)
- ✅ Tokens JWT con expiración (7 días)
- ✅ Validación de email y contraseña
- ✅ Middleware de autenticación en rutas protegidas
- ✅ Filtrado de contraseñas en respuestas
- ✅ Verificación de propiedad de imágenes

### Recomendaciones para Producción
- 🔐 Usar HTTPS
- 🔐 Cambiar JWT_SECRET a algo más seguro
- 🔐 Agregar rate limiting
- 🔐 Implementar refresh tokens
- 🔐 Agregar recuperación de contraseña
- 🔐 Implementar 2FA (opcional)
- 🔐 Usar MongoDB Atlas con autenticación

## 🐛 Troubleshooting

### Error: "Cannot connect to MongoDB"
```bash
# Verificar que MongoDB esté corriendo
mongod --version

# Iniciar MongoDB
mongod

# O verificar la URI en .env
MONGODB_URI=mongodb://localhost:27017/klingai
```

### Error: "Token inválido"
```javascript
// Limpiar localStorage y volver a iniciar sesión
localStorage.clear();
window.location.href = 'login.html';
```

### Error: "No tienes créditos suficientes"
```javascript
// Los usuarios nuevos reciben 5 créditos gratis
// Para agregar más créditos manualmente (desarrollo):
db.users.updateOne(
  { email: "tu@email.com" },
  { $set: { credits: 100 } }
)
```

## 📝 Próximas Mejoras

- [ ] Recuperación de contraseña por email
- [ ] Cambiar contraseña desde el perfil
- [ ] Sistema de compra de créditos
- [ ] Panel de administración
- [ ] Estadísticas de uso
- [ ] Compartir imágenes públicamente
- [ ] Historial de generaciones

## 🎉 ¡Listo!

Tu sistema de usuarios está completamente funcional. Los usuarios ahora deben:

1. **Registrarse** para crear una cuenta (reciben 5 créditos gratis)
2. **Iniciar sesión** para acceder al generador
3. **Generar imágenes** (1 crédito por imagen)
4. **Ver solo sus propias imágenes**
5. **Cerrar sesión** cuando terminen

¡Disfruta tu generador de imágenes con IA con sistema de usuarios completo! 🚀
