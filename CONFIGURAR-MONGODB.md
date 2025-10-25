# 🍃 Configurar MongoDB Atlas (Cloud Gratis)

## ¿Por qué MongoDB Atlas?

- ✅ **100% Gratis** (plan gratuito permanente)
- ✅ **No requiere instalación** local
- ✅ **512 MB de almacenamiento** gratis
- ✅ **Configuración en 5 minutos**
- ✅ **Accesible desde cualquier lugar**

---

## 📝 Paso a Paso

### 1. Crear Cuenta en MongoDB Atlas

1. Ve a: https://www.mongodb.com/cloud/atlas/register
2. Regístrate con tu email o Google
3. Completa el formulario de registro

### 2. Crear un Cluster Gratuito

1. **Selecciona el plan:**
   - Elige **"M0 Sandbox"** (GRATIS)
   - Provider: AWS, Google Cloud o Azure (cualquiera)
   - Región: Elige la más cercana (ej: São Paulo, Virginia)

2. **Nombre del cluster:**
   - Puedes dejarlo como "Cluster0" o cambiarlo a "KlingAI"

3. **Clic en "Create Deployment"**
   - Espera 1-3 minutos mientras se crea

### 3. Configurar Acceso

#### A) Crear Usuario de Base de Datos

1. Te aparecerá un modal "Security Quickstart"
2. **Username:** `klingai_user` (o el que prefieras)
3. **Password:** Genera una contraseña segura
   - ⚠️ **GUARDA ESTA CONTRASEÑA** - la necesitarás después
4. Clic en "Create Database User"

#### B) Configurar IP de Acceso

1. En "Where would you like to connect from?"
2. Selecciona **"My Local Environment"**
3. Clic en **"Add My Current IP Address"**
4. **IMPORTANTE:** Para desarrollo, también agrega:
   - IP Address: `0.0.0.0/0`
   - Description: "Allow all IPs (development only)"
   - ⚠️ Esto permite acceso desde cualquier IP (solo para desarrollo)

5. Clic en "Finish and Close"

### 4. Obtener la URI de Conexión

1. En el dashboard, clic en **"Connect"** en tu cluster
2. Selecciona **"Drivers"**
3. Driver: **Node.js**
4. Version: **6.8 or later**
5. Copia la **Connection String**:

```
mongodb+srv://klingai_user:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

### 5. Configurar en tu Proyecto

1. Abre el archivo `.env` en la carpeta `backend`
2. Reemplaza `<password>` con tu contraseña real
3. Agrega el nombre de la base de datos al final:

```env
# MongoDB Atlas
MONGODB_URI=mongodb+srv://klingai_user:TU_PASSWORD_AQUI@cluster0.xxxxx.mongodb.net/klingai?retryWrites=true&w=majority

# JWT Secret
JWT_SECRET=tu_secreto_jwt_super_seguro_cambiar_en_produccion

# API Keys
HUGGINGFACE_API_KEY=hf_tu_key_aqui
OPENAI_API_KEY=sk-tu_key_aqui
```

**Ejemplo real:**
```env
MONGODB_URI=mongodb+srv://klingai_user:MiPassword123@cluster0.abc123.mongodb.net/klingai?retryWrites=true&w=majority
```

### 6. Probar la Conexión

1. Guarda el archivo `.env`
2. Reinicia el servidor:
```bash
cd backend
npm start
```

3. Deberías ver:
```
✅ MongoDB conectado: cluster0-shard-00-00.xxxxx.mongodb.net
🚀 Servidor corriendo en http://localhost:3000
```

---

## 🔍 Verificar que Funciona

### Ver tus Datos en Atlas

1. Ve a tu cluster en MongoDB Atlas
2. Clic en **"Browse Collections"**
3. Verás las colecciones:
   - `users` - Usuarios registrados
   - `images` - Imágenes generadas

### Probar el Sistema

1. Abre `http://localhost:8080/login.html`
2. Regístrate con un usuario
3. Genera una imagen
4. Ve a MongoDB Atlas → Browse Collections
5. Deberías ver tu usuario e imagen guardados

---

## ❌ Solución de Problemas

### Error: "MongoServerError: bad auth"

**Causa:** Contraseña incorrecta en la URI

**Solución:**
1. Verifica que copiaste bien la contraseña
2. Si tiene caracteres especiales (@, #, %, etc.), codifícalos:
   - `@` → `%40`
   - `#` → `%23`
   - `%` → `%25`

### Error: "MongoNetworkError: connection timeout"

**Causa:** Tu IP no está en la whitelist

**Solución:**
1. Ve a Atlas → Network Access
2. Agrega tu IP actual
3. O agrega `0.0.0.0/0` para permitir todas

### Error: "Cannot connect to MongoDB"

**Causa:** URI mal formada

**Solución:**
1. Verifica que la URI tenga este formato:
```
mongodb+srv://usuario:password@cluster.xxxxx.mongodb.net/nombredb?retryWrites=true&w=majority
```
2. Asegúrate de reemplazar `<password>` con tu contraseña real
3. Agrega el nombre de la base de datos (ej: `/klingai`)

---

## 🎉 ¡Listo!

Ahora tu aplicación usa MongoDB Atlas en la nube. Los datos se guardan permanentemente y puedes acceder desde cualquier lugar.

### Ventajas

- ✅ Datos persistentes (no se borran al reiniciar)
- ✅ Backups automáticos
- ✅ Monitoreo en tiempo real
- ✅ Escalable (puedes upgradear después)

### Próximos Pasos

- Explora el dashboard de Atlas
- Configura alertas de uso
- Revisa las métricas de rendimiento
- Cuando estés listo para producción, cambia las IPs permitidas
