# 🚀 Inicio Rápido - MongoDB Atlas

## ⏱️ 5 Minutos para Configurar

### Paso 1: Crear Cuenta (2 min)

1. **Abre:** https://www.mongodb.com/cloud/atlas/register
2. **Regístrate** con Google o email
3. **Completa** el formulario

### Paso 2: Crear Cluster Gratis (1 min)

1. **Selecciona:** Plan M0 (GRATIS)
2. **Provider:** AWS
3. **Región:** São Paulo o Virginia
4. **Clic:** "Create Deployment"

### Paso 3: Crear Usuario (1 min)

1. **Username:** `klingai`
2. **Password:** Genera una (ej: `KlingAI2024!`)
3. **⚠️ COPIA LA CONTRASEÑA** - la necesitarás
4. **Clic:** "Create Database User"

### Paso 4: Permitir Acceso (30 seg)

1. **Clic:** "Add My Current IP Address"
2. **Clic:** "Add Entry" con IP `0.0.0.0/0` (para desarrollo)
3. **Clic:** "Finish and Close"

### Paso 5: Obtener URI (30 seg)

1. **Clic:** "Connect" en tu cluster
2. **Selecciona:** "Drivers"
3. **Copia** la URI que se ve así:
```
mongodb+srv://klingai:<password>@cluster0.xxxxx.mongodb.net/
```

### Paso 6: Configurar en tu Proyecto (1 min)

1. **Abre:** `backend/.env`
2. **Pega** la URI y modifícala:

```env
MONGODB_URI=mongodb+srv://klingai:TU_PASSWORD_AQUI@cluster0.xxxxx.mongodb.net/klingai?retryWrites=true&w=majority
```

**Ejemplo real:**
```env
MONGODB_URI=mongodb+srv://klingai:KlingAI2024!@cluster0.abc123.mongodb.net/klingai?retryWrites=true&w=majority
```

3. **Guarda** el archivo

### Paso 7: Probar (30 seg)

```bash
cd backend
npm start
```

**Deberías ver:**
```
✅ MongoDB conectado: cluster0-shard-00-00.xxxxx.mongodb.net
🚀 Servidor corriendo en http://localhost:3000
```

---

## ✅ ¡Listo!

Tu aplicación ahora usa MongoDB en la nube. Los datos se guardan permanentemente.

### Verificar que Funciona

1. Abre `http://localhost:8080/login.html`
2. Regístrate con un usuario
3. Ve a MongoDB Atlas → "Browse Collections"
4. Verás tu usuario en la colección `users`

---

## 🆘 ¿Problemas?

### "bad auth"
- Verifica que copiaste bien la contraseña
- Si tiene `@` o `#`, cámbialo por `%40` o `%23`

### "connection timeout"
- Agrega `0.0.0.0/0` en Network Access

### "Cannot connect"
- Verifica que agregaste `/klingai` al final de la URI
- Verifica que reemplazaste `<password>` con tu contraseña real

---

## 📚 Más Información

Lee `CONFIGURAR-MONGODB.md` para guía completa con capturas de pantalla.
