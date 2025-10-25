# 🔐 Configurar Google OAuth

Esta guía te ayudará a configurar el inicio de sesión con Google en tu aplicación.

## ⏱️ Tiempo estimado: 10 minutos

---

## 📋 Paso a Paso

### **1. Acceder a Google Cloud Console** (1 min)

1. Ve a: [Google Cloud Console](https://console.cloud.google.com/)
2. Inicia sesión con tu cuenta de Google
3. Acepta los términos de servicio si es necesario

---

### **2. Crear un Proyecto Nuevo** (2 min)

1. **Clic en el selector de proyectos** (arriba a la izquierda, junto al logo de Google Cloud)
2. **Clic en "Nuevo Proyecto"**
3. **Nombre del proyecto:** `KlingAI` (o el que prefieras)
4. **Ubicación:** Deja "Sin organización"
5. **Clic en "Crear"**
6. **Espera** unos segundos mientras se crea
7. **Selecciona el proyecto** en el selector de proyectos

---

### **3. Habilitar la API de Google+** (2 min)

1. En el menú lateral, ve a: **"APIs y servicios" → "Biblioteca"**
2. Busca: **"Google+ API"**
3. **Clic en "Google+ API"**
4. **Clic en "Habilitar"**
5. Espera a que se habilite

**Nota:** Si no encuentras Google+ API, puedes omitir este paso. Usaremos People API que viene incluida.

---

### **4. Configurar la Pantalla de Consentimiento** (3 min)

1. Ve a: **"APIs y servicios" → "Pantalla de consentimiento de OAuth"**
2. **Tipo de usuario:** Selecciona **"Externo"**
3. **Clic en "Crear"**

#### **Información de la aplicación:**
- **Nombre de la aplicación:** `Kling AI - Generador de Imágenes`
- **Correo electrónico de asistencia:** Tu email
- **Logotipo de la aplicación:** (opcional, puedes omitirlo)
- **Dominios autorizados:** Deja vacío por ahora

#### **Información de contacto del desarrollador:**
- **Correo electrónico:** Tu email

4. **Clic en "Guardar y continuar"**

#### **Ámbitos:**
5. **Clic en "Agregar o quitar ámbitos"**
6. **Selecciona:**
   - `email`
   - `profile`
   - `openid`
7. **Clic en "Actualizar"**
8. **Clic en "Guardar y continuar"**

#### **Usuarios de prueba:**
9. **Clic en "Agregar usuarios"**
10. **Agrega tu email** (para poder probar)
11. **Clic en "Agregar"**
12. **Clic en "Guardar y continuar"**
13. **Clic en "Volver al panel"**

---

### **5. Crear Credenciales OAuth** (2 min)

1. Ve a: **"APIs y servicios" → "Credenciales"**
2. **Clic en "Crear credenciales"** (arriba)
3. Selecciona: **"ID de cliente de OAuth"**

#### **Configuración:**
- **Tipo de aplicación:** Selecciona **"Aplicación web"**
- **Nombre:** `Kling AI Web Client`

#### **Orígenes de JavaScript autorizados:**
4. **Clic en "Agregar URI"**
5. Agrega: `http://localhost:8080`
6. **Clic en "Agregar URI"** nuevamente
7. Agrega: `http://localhost:3000`

#### **URI de redireccionamiento autorizados:**
8. **Clic en "Agregar URI"**
9. Agrega: `http://localhost:3000/api/auth/google/callback`

10. **Clic en "Crear"**

---

### **6. Copiar las Credenciales** (1 min)

Verás un modal con tus credenciales:

1. **Copia el "ID de cliente"** (termina en `.apps.googleusercontent.com`)
2. **Copia el "Secreto del cliente"** (cadena aleatoria)

**⚠️ GUARDA ESTAS CREDENCIALES** - Las necesitarás en el siguiente paso.

Si cierras el modal, puedes volver a verlas:
- Ve a **"Credenciales"**
- Clic en el nombre de tu cliente OAuth
- Verás el ID y el secreto

---

### **7. Configurar en tu Proyecto** (1 min)

1. **Abre** el archivo `backend/.env`
2. **Agrega** las credenciales:

```env
# Google OAuth
GOOGLE_CLIENT_ID=123456789-abcdefg.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-tu_secreto_aqui
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback

# URL del Frontend
FRONTEND_URL=http://localhost:8080
```

3. **Reemplaza** con tus credenciales reales
4. **Guarda** el archivo

---

### **8. Reiniciar el Servidor** (30 seg)

```bash
cd backend
npm start
```

Deberías ver:
```
✅ MongoDB conectado
🚀 Servidor corriendo en http://localhost:3000
```

---

## ✅ Probar el Login con Google

1. **Abre:** `http://localhost:8080/login.html`
2. **Clic en:** "Continuar con Google"
3. **Selecciona** tu cuenta de Google
4. **Acepta** los permisos
5. Serás redirigido al dashboard con tu sesión iniciada

---

## 🔒 Seguridad y Producción

### **Para desarrollo local:**
- ✅ Usa `http://localhost` (está bien)
- ✅ Los usuarios de prueba pueden acceder

### **Para producción (cuando despliegues):**

1. **Actualizar URIs autorizadas:**
   - Agrega tu dominio real: `https://tuapp.com`
   - Agrega callback: `https://tuapp.com/api/auth/google/callback`

2. **Publicar la app:**
   - Ve a **"Pantalla de consentimiento de OAuth"**
   - **Clic en "Publicar aplicación"**
   - Envía para verificación de Google (si es necesario)

3. **Actualizar .env:**
   ```env
   GOOGLE_CALLBACK_URL=https://tuapp.com/api/auth/google/callback
   FRONTEND_URL=https://tuapp.com
   ```

---

## ❌ Solución de Problemas

### **Error: "redirect_uri_mismatch"**

**Causa:** La URI de redirección no está autorizada.

**Solución:**
1. Ve a Google Cloud Console → Credenciales
2. Edita tu cliente OAuth
3. Verifica que `http://localhost:3000/api/auth/google/callback` esté en **"URI de redireccionamiento autorizados"**
4. Guarda y espera 1 minuto

### **Error: "Access blocked: This app's request is invalid"**

**Causa:** No configuraste la pantalla de consentimiento correctamente.

**Solución:**
1. Ve a **"Pantalla de consentimiento de OAuth"**
2. Verifica que hayas completado todos los pasos
3. Agrega tu email en **"Usuarios de prueba"**

### **Error: "invalid_client"**

**Causa:** Client ID o Client Secret incorrectos.

**Solución:**
1. Verifica que copiaste correctamente las credenciales
2. No debe haber espacios al inicio o final
3. El Client ID debe terminar en `.apps.googleusercontent.com`

### **El botón no hace nada**

**Causa:** El servidor backend no está corriendo.

**Solución:**
```bash
cd backend
npm start
```

---

## 📚 Recursos Adicionales

- [Documentación oficial de Google OAuth](https://developers.google.com/identity/protocols/oauth2)
- [Passport Google OAuth 2.0 Strategy](http://www.passportjs.org/packages/passport-google-oauth20/)
- [Mejores prácticas de OAuth 2.0](https://oauth.net/2/)

---

## 🎉 ¡Listo!

Ahora tus usuarios pueden:
- ✅ Iniciar sesión con Google en 1 clic
- ✅ No necesitan crear contraseña
- ✅ Vinculación automática si ya tienen cuenta con el mismo email
- ✅ Foto de perfil de Google automáticamente

**Próximos pasos opcionales:**
- Agregar login con Facebook, GitHub, Twitter
- Implementar autenticación de dos factores
- Agregar recuperación de contraseña por email
