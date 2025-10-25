# 🚀 Login con Google - Implementado

## ✅ ¿Qué se implementó?

Tu aplicación ahora soporta **inicio de sesión con Google OAuth 2.0**. Los usuarios pueden:

- ✅ **Iniciar sesión** con su cuenta de Google en 1 clic
- ✅ **Registrarse** automáticamente si es su primera vez
- ✅ **Vincular cuentas** si ya tienen una cuenta con el mismo email
- ✅ **Obtener foto de perfil** automáticamente desde Google
- ✅ **No necesitan contraseña** - Google se encarga de la autenticación

---

## 📦 Archivos Modificados/Creados

### **Backend:**
- ✅ `backend/models/User.js` - Actualizado para soportar OAuth
- ✅ `backend/config/passport.js` - Estrategia de Google OAuth (NUEVO)
- ✅ `backend/routes/googleAuth.js` - Rutas de autenticación con Google (NUEVO)
- ✅ `backend/server.js` - Integración de Passport
- ✅ `backend/.env.example` - Variables de Google OAuth

### **Frontend:**
- ✅ `frontend/login.html` - Botón "Continuar con Google"
- ✅ `frontend/register.html` - Botón "Continuar con Google"
- ✅ `frontend/google-callback.html` - Página de callback (NUEVO)
- ✅ `frontend/auth.css` - Estilos para botón de Google
- ✅ `frontend/auth.js` - Funcionalidad de login con Google

### **Documentación:**
- ✅ `CONFIGURAR-GOOGLE-OAUTH.md` - Guía completa paso a paso
- ✅ `LOGIN-CON-GOOGLE.md` - Este archivo

---

## ⚙️ Configuración Necesaria

### **1. Instalar dependencias**

Las dependencias ya fueron instaladas:
- ✅ `passport` - Middleware de autenticación
- ✅ `passport-google-oauth20` - Estrategia de Google
- ✅ `express-session` - Manejo de sesiones

### **2. Configurar Google Cloud Console**

Sigue la guía completa en: **[CONFIGURAR-GOOGLE-OAUTH.md](./CONFIGURAR-GOOGLE-OAUTH.md)**

Resumen rápido:
1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un proyecto nuevo
3. Configura la pantalla de consentimiento OAuth
4. Crea credenciales OAuth 2.0
5. Copia Client ID y Client Secret

### **3. Configurar variables de entorno**

Edita `backend/.env` y agrega:

```env
# Google OAuth
GOOGLE_CLIENT_ID=tu-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-tu-secreto
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback

# URL del Frontend
FRONTEND_URL=http://localhost:8080
```

### **4. Reiniciar el servidor**

```bash
cd backend
npm start
```

---

## 🎯 Cómo Funciona

### **Flujo de Autenticación:**

1. **Usuario clic en "Continuar con Google"**
   - Redirige a: `http://localhost:3000/api/auth/google`

2. **Google muestra pantalla de login**
   - Usuario selecciona su cuenta
   - Google solicita permisos (email, perfil)

3. **Google redirige de vuelta a tu app**
   - URL: `http://localhost:3000/api/auth/google/callback`
   - Incluye código de autorización

4. **Backend procesa el callback**
   - Intercambia código por datos del usuario
   - Busca usuario existente o crea uno nuevo
   - Genera JWT token

5. **Redirige al frontend**
   - URL: `http://localhost:8080/google-callback.html?token=...`
   - Frontend guarda token y datos del usuario
   - Redirige al dashboard

---

## 🔐 Seguridad

### **Datos almacenados del usuario de Google:**
- `googleId` - ID único de Google (encriptado en BD)
- `email` - Email de la cuenta de Google
- `name` - Nombre completo
- `picture` - URL de la foto de perfil
- `provider` - Tipo de autenticación ("google")

### **Protección:**
- ✅ JWT tokens con expiración de 7 días
- ✅ Sesiones manejadas por `express-session`
- ✅ CORS configurado para tu dominio
- ✅ Credenciales en variables de entorno (nunca en el código)

### **Vinculación de cuentas:**
Si un usuario se registró con email/password y luego usa Google con el mismo email:
- ✅ Se vincula automáticamente la cuenta de Google
- ✅ Puede usar ambos métodos para iniciar sesión
- ✅ Mantiene sus datos y créditos

---

## 🧪 Probar la Funcionalidad

### **1. Iniciar servidores**

Terminal 1 - Backend:
```bash
cd backend
npm start
```

Terminal 2 - Frontend:
```bash
cd frontend
npx http-server -p 8080
```

### **2. Probar login con Google**

1. Abre: `http://localhost:8080/login.html`
2. Clic en "Continuar con Google"
3. Selecciona tu cuenta de Google
4. Acepta los permisos
5. Deberías ser redirigido al dashboard

### **3. Verificar en MongoDB**

Ve a MongoDB Atlas → Browse Collections → `users`:
- Verás tu usuario con `googleId`
- Campo `provider: "google"`
- URL de foto en `picture`

---

## 📊 Diferencias entre usuarios locales y de Google

### **Usuario Local (email/password):**
```javascript
{
  email: "usuario@ejemplo.com",
  password: "$2b$10$hasheado...",
  name: "Usuario",
  provider: "local",
  googleId: null,
  picture: null,
  credits: 5
}
```

### **Usuario de Google:**
```javascript
{
  email: "usuario@gmail.com",
  password: null,
  name: "Usuario Gmail",
  provider: "google",
  googleId: "1234567890",
  picture: "https://lh3.googleusercontent.com/...",
  credits: 5
}
```

### **Usuario Vinculado:**
```javascript
{
  email: "usuario@ejemplo.com",
  password: "$2b$10$hasheado...",
  name: "Usuario",
  provider: "google", // Último método usado
  googleId: "1234567890",
  picture: "https://lh3.googleusercontent.com/...",
  credits: 5
}
```

---

## ❌ Solución de Problemas Comunes

### **1. "redirect_uri_mismatch"**
**Problema:** URI de redirección no autorizada

**Solución:**
- Ve a Google Cloud Console → Credenciales
- Verifica que `http://localhost:3000/api/auth/google/callback` esté en la lista
- Guarda y espera 1 minuto

### **2. "Access blocked"**
**Problema:** App no publicada o usuario no en lista de prueba

**Solución:**
- Ve a Pantalla de Consentimiento → Usuarios de prueba
- Agrega tu email
- O publica la aplicación

### **3. "Error al autenticar"**
**Problema:** Credenciales incorrectas en .env

**Solución:**
- Verifica `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET`
- No debe haber espacios extra
- Reinicia el servidor después de cambiar

### **4. Botón no funciona**
**Problema:** JavaScript no cargado correctamente

**Solución:**
- Abre la consola del navegador (F12)
- Verifica que no haya errores
- Verifica que `auth.js` esté cargado

---

## 🚀 Próximos Pasos Opcionales

### **Mejoras de UI:**
- [ ] Mostrar foto de perfil del usuario en el navbar
- [ ] Indicar método de login usado (badge "Google" o "Email")
- [ ] Permitir desvincular cuenta de Google

### **Más proveedores OAuth:**
- [ ] Login con Facebook
- [ ] Login con GitHub
- [ ] Login con Twitter/X
- [ ] Login con Microsoft

### **Funcionalidades adicionales:**
- [ ] Vincular múltiples cuentas sociales
- [ ] Recuperación de contraseña por email
- [ ] Autenticación de dos factores (2FA)
- [ ] Login con código QR

---

## 📚 Recursos

- **Guía de configuración:** [CONFIGURAR-GOOGLE-OAUTH.md](./CONFIGURAR-GOOGLE-OAUTH.md)
- **Google Cloud Console:** https://console.cloud.google.com/
- **Passport.js:** http://www.passportjs.org/
- **Google OAuth 2.0:** https://developers.google.com/identity/protocols/oauth2

---

## ✅ Checklist de Implementación

- [x] Dependencias instaladas
- [x] Modelo User actualizado
- [x] Estrategia Passport configurada
- [x] Rutas de autenticación creadas
- [x] Frontend actualizado con botones
- [x] Página de callback creada
- [x] CSS y estilos agregados
- [x] Documentación completa
- [ ] **Configurar credenciales de Google** ← ¡Hazlo ahora!
- [ ] **Probar el login con Google**

---

## 🎉 ¡Todo Listo!

Una vez que configures las credenciales de Google, tu aplicación tendrá:
- ✅ Login tradicional con email/password
- ✅ Login rápido con Google OAuth
- ✅ Vinculación automática de cuentas
- ✅ Experiencia de usuario mejorada

**¡Disfruta tu nueva funcionalidad de autenticación!** 🚀
