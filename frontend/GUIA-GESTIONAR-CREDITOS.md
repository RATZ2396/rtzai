# 💰 GUÍA COMPLETA: GESTIONAR CRÉDITOS - RTZAI

## 🎯 ¿Qué es esto?

He creado un **gestor de créditos avanzado e interactivo** que te permite administrar fácilmente el saldo de créditos de cualquier usuario en tu sistema RTZAI.

---

## 📦 Archivos Creados

1. **`backend/manage-credits.js`** - Script principal con menú interactivo
2. **`GESTIONAR-CREDITOS.bat`** - Lanzador rápido para Windows
3. **`backend/add-test-credits.js`** - Script simple (ya existente)
4. **`GUIA-GESTIONAR-CREDITOS.md`** - Este documento

---

## 🚀 Cómo Usar (3 Formas)

### **Opción 1: Doble Click (MÁS FÁCIL)** ⭐ RECOMENDADO

```
1. Haz doble click en: GESTIONAR-CREDITOS.bat
2. Aparecerá el menú interactivo
3. ¡Listo!
```

### **Opción 2: Desde Terminal**

```bash
cd "g:\Proyectos WEB\Proyecto I\ProyectoKlingAI\backend"
node manage-credits.js
```

### **Opción 3: Script Simple (comando directo)**

```bash
cd backend
node add-test-credits.js usuario@example.com 100
```

---

## 📋 Menú del Gestor Interactivo

Al ejecutar verás este menú:

```
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║              💰 GESTOR DE CRÉDITOS - RTZAI                   ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝

📋 MENÚ PRINCIPAL

1. Listar todos los usuarios
2. Agregar créditos a un usuario
3. Quitar créditos a un usuario
4. Ver historial de un usuario
5. Buscar usuario por email
6. Agregar créditos a TODOS los usuarios
7. Establecer saldo específico
8. Estadísticas generales
9. Ver top usuarios por créditos
0. Salir
```

---

## 💡 Ejemplos de Uso

### **1. Agregar Créditos a un Usuario**

```
Selecciona opción: 2

📧 Email del usuario: usuario@example.com

✅ Usuario encontrado:
   Nombre: Juan Pérez
   Email: usuario@example.com
   Créditos actuales: 50

💰 Cantidad a agregar: 100
📝 Razón (opcional): Bono especial

⚠️  ¿Confirmar agregar 100 créditos a usuario@example.com? (s/n): s

✅ ¡CRÉDITOS AGREGADOS EXITOSAMENTE!
   Saldo anterior: 50
   Créditos agregados: +100
   Nuevo saldo: 150
```

### **2. Ver Lista de Usuarios**

```
Selecciona opción: 1

👥 USUARIOS REGISTRADOS (5)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#    Email                              Nombre                 Créditos       Registrado
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1    usuario1@example.com               Juan Pérez             250            25/10/2025
2    usuario2@example.com               María García           150            24/10/2025
3    usuario3@example.com               Pedro López            75             23/10/2025
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### **3. Ver Historial de un Usuario**

```
Selecciona opción: 4

📧 Email del usuario: usuario@example.com

📋 HISTORIAL DE Juan Pérez (usuario@example.com)
   Saldo actual: 150 créditos
   Total transacciones: 8

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Fecha               Tipo           Cantidad       Saldo          Descripción
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
25/10/2025 10:30   add            +100           150            Bono especial
24/10/2025 15:20   deduct         -1             50             Generación de imagen
23/10/2025 09:15   add            +50            51             Registro inicial
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### **4. Establecer Saldo Específico**

```
Selecciona opción: 7

📧 Email del usuario: usuario@example.com

✅ Usuario encontrado:
   Créditos actuales: 50

💰 Nuevo saldo: 200

⚠️  Esto agregará 150 créditos. ¿Confirmar? (s/n): s

✅ ¡SALDO ACTUALIZADO!
   Saldo anterior: 50
   Nuevo saldo: 200
```

### **5. Agregar Créditos a TODOS** (Masivo)

```
Selecciona opción: 6

⚠️  Se agregarán créditos a 5 usuarios

💰 Cantidad a agregar a cada uno: 50

⚠️  CONFIRMAR: Agregar 50 créditos a 5 usuarios? (s/n): s

🔄 Procesando...

✅ usuario1@example.com                    → +50 créditos
✅ usuario2@example.com                    → +50 créditos
✅ usuario3@example.com                    → +50 créditos
✅ usuario4@example.com                    → +50 créditos
✅ usuario5@example.com                    → +50 créditos

✅ OPERACIÓN COMPLETADA
   Exitosos: 5
   Fallidos: 0
```

### **6. Estadísticas Generales**

```
Selecciona opción: 8

📊 ESTADÍSTICAS GENERALES

   👥 Total usuarios: 5
   💰 Total créditos en sistema: 825
   📊 Promedio por usuario: 165
   📋 Total transacciones: 47
```

### **7. Top 10 Usuarios**

```
Selecciona opción: 9

🏆 TOP 10 USUARIOS POR CRÉDITOS

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🥇   usuario1@example.com                     300 créditos
🥈   usuario2@example.com                     250 créditos
🥉   usuario3@example.com                     200 créditos
4.   usuario4@example.com                     50 créditos
5.   usuario5@example.com                     25 créditos
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## ⚡ Casos de Uso Rápidos

### **Dar créditos de bienvenida**
```
Opción 2 → Email → +50 créditos → Razón: "Bienvenida"
```

### **Bono mensual a todos**
```
Opción 6 → +100 créditos → Confirmar
```

### **Establecer saldo exacto**
```
Opción 7 → Email → 500 créditos → Confirmar
```

### **Ver quién usa más créditos**
```
Opción 9 → Ver top usuarios
```

### **Auditar un usuario**
```
Opción 4 → Email → Ver historial completo
```

---

## 🎨 Características del Script

### ✅ **Interfaz Profesional**
- Menú interactivo con colores
- Tablas formateadas
- Confirmaciones de seguridad
- Feedback visual claro

### ✅ **Seguro**
- Confirmación antes de operaciones críticas
- Validación de datos
- Manejo de errores
- No puede dejar saldos negativos

### ✅ **Completo**
- Agregar/quitar créditos
- Ver historial detallado
- Estadísticas globales
- Operaciones masivas
- Búsqueda por email

### ✅ **Registra Todo**
- Cada operación crea una transacción en la BD
- Guarda quién hizo el cambio
- Guarda la razón del cambio
- Mantiene saldo anterior y nuevo

---

## 📝 Comandos Rápidos por Línea de Comando

Si prefieres usar el script simple sin menú:

```bash
# Agregar créditos a un usuario
node backend/add-test-credits.js usuario@example.com 100

# Agregar créditos a TODOS
node backend/add-test-credits.js all 50

# Ver usuarios disponibles
node backend/add-test-credits.js
```

---

## 🔧 Solución de Problemas

### ❌ "Usuario no encontrado"
**Solución:** 
1. Verifica que el email sea correcto
2. Usa la opción 1 para ver todos los usuarios
3. Copia el email exacto

### ❌ "Error conectando a MongoDB"
**Solución:** 
1. Verifica que MongoDB esté corriendo
2. Revisa el archivo `.env` tenga `MONGODB_URI` correcto
3. Asegúrate de estar en la carpeta correcta

### ❌ "No tiene suficientes créditos"
**Solución:** 
1. Usa la opción 7 para establecer un saldo específico
2. O usa la opción 2 para agregar más créditos primero

### ❌ "El script no inicia"
**Solución:** 
1. Verifica que Node.js esté instalado: `node --version`
2. Verifica que estés en la carpeta correcta
3. Ejecuta: `cd backend && npm install` para instalar dependencias

---

## 🎯 Flujo de Trabajo Recomendado

### **Para Nuevos Usuarios:**
```
1. Usuario se registra (recibe 50 créditos automáticamente)
2. Opcional: Agregar bono de bienvenida con opción 2
```

### **Para Promociones:**
```
1. Usar opción 6 para agregar créditos a todos
2. Especificar razón: "Promoción de octubre"
```

### **Para Ajustes Individuales:**
```
1. Buscar usuario con opción 5
2. Ver su historial con opción 4
3. Ajustar saldo con opción 7
```

### **Para Auditoría:**
```
1. Ver estadísticas con opción 8
2. Ver top usuarios con opción 9
3. Revisar historial de usuarios específicos con opción 4
```

---

## 💾 Datos en MongoDB

Cada operación del gestor crea una transacción en la colección `credittransactions`:

```javascript
{
  userId: ObjectId,
  amount: 100,                  // Positivo = agregar, Negativo = quitar
  type: "add",                  // add, deduct, purchase, refund
  description: "Bono especial",
  balanceAfter: 150,            // Saldo después de la operación
  action: "manual_add",
  addedBy: "admin-script",
  createdAt: Date
}
```

Puedes ver estas transacciones en:
- MongoDB Compass
- Opción 4 del gestor (historial por usuario)
- API: `GET /api/credits/history`

---

## 🔐 Seguridad

### **El script es seguro porque:**
✅ Requiere confirmación para operaciones críticas  
✅ Valida todos los datos de entrada  
✅ No permite saldos negativos  
✅ Registra TODO en la base de datos  
✅ Incluye quién hizo el cambio  
✅ Solo admin puede ejecutarlo (acceso al servidor)  

---

## 🚀 Integración con el Sistema

El gestor está **completamente integrado** con RTZAI:

- ✅ Usa los mismos modelos (User, CreditTransaction)
- ✅ Registra transacciones como si fueran del sistema
- ✅ Los cambios se reflejan INMEDIATAMENTE en el frontend
- ✅ Compatible con el historial de la aplicación
- ✅ Las estadísticas se actualizan automáticamente

---

## 📚 Documentación Relacionada

- `backend/CREDITS_README.md` - Resumen del sistema de créditos
- `backend/CREDITS_SYSTEM_GUIDE.md` - Guía técnica completa
- `SISTEMA-REPARADO.md` - Guía del sistema de planes
- `RESUMEN-FINAL-RTZAI.md` - Estado actual del proyecto

---

## ✅ Resumen Rápido

### **Para usar el gestor:**
```bash
# Forma 1 (Más fácil)
GESTIONAR-CREDITOS.bat

# Forma 2 (Terminal)
cd backend
node manage-credits.js
```

### **Operaciones más comunes:**
```
Opción 2 → Agregar créditos a usuario específico
Opción 6 → Agregar créditos a TODOS (promociones)
Opción 7 → Establecer saldo exacto
Opción 4 → Ver historial de usuario
Opción 1 → Ver todos los usuarios
```

---

## 🎉 ¡Listo!

**El gestor de créditos está completo y listo para usar.**

Haz doble click en `GESTIONAR-CREDITOS.bat` y tendrás acceso a todas las funciones para administrar créditos de forma fácil y segura. 💰✨

**¿Necesitas ayuda?** Revisa los ejemplos en esta guía o contacta al desarrollador.
