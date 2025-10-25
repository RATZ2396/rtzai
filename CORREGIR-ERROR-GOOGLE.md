# 🔧 Corregir Error de Google OAuth (redirect_uri_mismatch)

## ❌ Error Actual
```
Error 400: redirect_uri_mismatch
No puedes iniciar sesión porque generador de imagenes ha enviado una solicitud no válida.
```

## 🎯 Causa del Problema
Las URIs de redirección configuradas en tu código **NO COINCIDEN** con las que tienes autorizadas en Google Cloud Console.

---

## ✅ Solución: Configurar URIs en Google Cloud Console

### **Paso 1: Acceder a Google Cloud Console**

1. Ve a: https://console.cloud.google.com/
2. Inicia sesión con tu cuenta
3. **Selecciona tu proyecto**: "generador de imagenes"

---

### **Paso 2: Ir a Credenciales**

1. En el menú lateral (☰), busca: **"APIs y servicios"** → **"Credenciales"**
2. En la sección **"IDs de cliente de OAuth 2.0"**, busca tu credencial:
   - Debería estar algo como: `Cliente web 1` o el nombre que le hayas dado
3. **Clic en el ícono del lápiz** (✏️) para editar

---

### **Paso 3: Configurar Orígenes de JavaScript Autorizados**

En la sección **"Orígenes de JavaScript autorizados"**, debes tener **EXACTAMENTE** estas dos URIs:

```
http://localhost:8080
http://localhost:3000
```

**⚠️ IMPORTANTE:**
- Con `http://` (no `https://`)
- Sin espacios antes o después
- Sin `/` al final
- Exactamente `localhost` (no `127.0.0.1`)

**Captura de cómo debe verse:**
```
Orígenes de JavaScript autorizados
1. http://localhost:8080
2. http://localhost:3000
```

**Si falta alguna:**
1. Clic en **"+ Agregar URI"**
2. Pega la URI exacta
3. Clic fuera del campo para que se guarde

---

### **Paso 4: Configurar URIs de Redireccionamiento Autorizadas**

En la sección **"URIs de redireccionamiento autorizados"**, debes tener **EXACTAMENTE** esta URI:

```
http://localhost:3000/api/auth/google/callback
```

**⚠️ CRÍTICO - VERIFICA CADA CARÁCTER:**
- ✅ `http://localhost:3000/api/auth/google/callback`
- ❌ `http://localhost:3000/api/auth/google` (falta `/callback`)
- ❌ `http://localhost:8080/api/auth/google/callback` (puerto incorrecto)
- ❌ `https://localhost:3000/api/auth/google/callback` (debe ser `http://`)

**Captura de cómo debe verse:**
```
URIs de redireccionamiento autorizados
1. http://localhost:3000/api/auth/google/callback
```

**Si no está:**
1. Clic en **"+ Agregar URI"**
2. Pega EXACTAMENTE: `http://localhost:3000/api/auth/google/callback`
3. Verifica que no haya espacios

---

### **Paso 5: Guardar Cambios**

1. **Scroll hasta abajo**
2. **Clic en "GUARDAR"** (botón azul)
3. **Espera 1-2 minutos** para que Google propague los cambios

⏰ **¡Importante!** Los cambios pueden tardar hasta 2 minutos en aplicarse.

---

## 🧪 Verificar la Configuración

### **Tu configuración final debe verse así:**

```
✅ IDs de cliente de OAuth 2.0

Cliente: Cliente web 1 (o tu nombre)
ID de cliente: 1086301241461-6c9p9i82hm31k7bhqaf9hon4h6fdmdjn.apps.googleusercontent.com

Orígenes de JavaScript autorizados:
  • http://localhost:8080
  • http://localhost:3000

URIs de redireccionamiento autorizados:
  • http://localhost:3000/api/auth/google/callback
```

---

## 📝 Verificar tu archivo .env

Abre `backend/.env` y asegúrate de tener:

```env
# Google OAuth
GOOGLE_CLIENT_ID=1086301241461-6c9p9i82hm31k7bhqaf9hon4h6fdmdjn.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback

# URL del Frontend
FRONTEND_URL=http://localhost:8080
```

**⚠️ Verifica que:**
- ✅ No haya espacios extra
- ✅ Las líneas no estén comentadas con `#`
- ✅ El `GOOGLE_CALLBACK_URL` coincida EXACTAMENTE con lo que pusiste en Google Cloud Console

---

## 🚀 Reiniciar el Servidor

Después de hacer los cambios:

1. **Detén el servidor** (Ctrl+C)
2. **Espera 1-2 minutos** (para que Google propague los cambios)
3. **Reinicia el servidor:**
   ```bash
   cd backend
   npm start
   ```

---

## 🧪 Probar el Login con Google

1. Abre: `http://localhost:8080/login.html`
2. Clic en **"Continuar con Google"**
3. Selecciona tu cuenta de Google
4. Acepta los permisos

### **Resultado Esperado:**
✅ Serás redirigido a `http://localhost:8080/google-callback.html`  
✅ Verás el spinner "Autenticando con Google..."  
✅ Serás redirigido al dashboard en `http://localhost:8080/index.html`

### **Si Sigue Fallando:**

#### **Revisar errores comunes:**

1. **Error 400: redirect_uri_mismatch**
   - ❌ La URI en Google Cloud Console está mal escrita
   - ✅ Copia y pega EXACTAMENTE: `http://localhost:3000/api/auth/google/callback`

2. **Error: "Access blocked: This app's request is invalid"**
   - ❌ No agregaste tu email en "Usuarios de prueba"
   - ✅ Ve a "Pantalla de consentimiento" → "Usuarios de prueba" → Agrega tu email

3. **Redirige pero no hace login**
   - ❌ El `JWT_SECRET` no está configurado
   - ✅ Verifica que esté en tu `.env`

---

## 📸 Screenshots de Referencia

### **Cómo debe verse en Google Cloud Console:**

```
┌─────────────────────────────────────────────────┐
│ Editar ID de cliente de OAuth                  │
├─────────────────────────────────────────────────┤
│                                                 │
│ Tipo de aplicación: Aplicación web             │
│                                                 │
│ Nombre: Cliente web 1                          │
│                                                 │
│ ┌─────────────────────────────────────────┐   │
│ │ Orígenes de JavaScript autorizados      │   │
│ │                                          │   │
│ │ 1. http://localhost:8080                │   │
│ │ 2. http://localhost:3000                │   │
│ │                                          │   │
│ │ [+ Agregar URI]                          │   │
│ └─────────────────────────────────────────┘   │
│                                                 │
│ ┌─────────────────────────────────────────┐   │
│ │ URIs de redireccionamiento autorizados  │   │
│ │                                          │   │
│ │ 1. http://localhost:3000/api/auth/      │   │
│ │    google/callback                       │   │
│ │                                          │   │
│ │ [+ Agregar URI]                          │   │
│ └─────────────────────────────────────────┘   │
│                                                 │
│                    [GUARDAR]  [CANCELAR]       │
└─────────────────────────────────────────────────┘
```

---

## ✅ Checklist Final

Antes de probar, verifica:

- [ ] En Google Cloud Console:
  - [ ] `http://localhost:8080` está en "Orígenes autorizados"
  - [ ] `http://localhost:3000` está en "Orígenes autorizados"
  - [ ] `http://localhost:3000/api/auth/google/callback` está en "URIs de redireccionamiento"
  - [ ] Guardé los cambios
  - [ ] Esperé 1-2 minutos

- [ ] En mi `.env`:
  - [ ] `GOOGLE_CLIENT_ID` está configurado
  - [ ] `GOOGLE_CLIENT_SECRET` está configurado
  - [ ] `GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback`
  - [ ] `FRONTEND_URL=http://localhost:8080`
  - [ ] `JWT_SECRET` está configurado

- [ ] Servidor reiniciado después de los cambios

---

## 🆘 Si Nada Funciona

Captura pantalla de:
1. Tu configuración en Google Cloud Console (Credenciales)
2. El error completo que ves en el navegador
3. Los logs del servidor backend

Y pide ayuda mostrando las capturas.

---

## 🎉 ¡Listo!

Una vez que configures todo correctamente, el login con Google funcionará perfectamente. 🚀
