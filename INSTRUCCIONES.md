# 🚀 INSTRUCCIONES DE USO

## Paso 1: Instalar dependencias del backend

Abre una terminal en la carpeta del proyecto y ejecuta:

```bash
cd backend
npm install
```

## Paso 2: Iniciar el servidor

Desde la carpeta `backend`, ejecuta:

```bash
node server.js
```

Deberías ver:
```
🚀 Servidor corriendo en http://localhost:3000
📹 Generador de videos con IA listo
```

## Paso 3: Abrir el frontend

Opción A - Abrir directamente:
- Abre `frontend/index.html` en tu navegador

Opción B - Usar Live Server (recomendado):
- Instala la extensión "Live Server" en VS Code
- Click derecho en `frontend/index.html` → "Open with Live Server"

## Paso 4: Probar la aplicación

1. Escribe una descripción en el campo de texto
2. Click en "Generar Video"
3. El video aparecerá en la galería

## ⚠️ Solución de problemas

### Error: "Failed to fetch"
- Verifica que el servidor backend esté corriendo en http://localhost:3000
- Revisa la consola del navegador (F12) para ver errores

### Error: "Cannot find module"
- Ejecuta `npm install` en la carpeta `backend`

### El botón no responde
- Abre la consola del navegador (F12)
- Verifica que no haya errores de CORS
- Asegúrate de que el servidor esté corriendo

## 🔑 Usar APIs reales (opcional)

Edita `backend/.env` y agrega tus API keys:

```
HUGGINGFACE_API_KEY=tu_key_aqui
OPENAI_API_KEY=tu_key_aqui
```

Sin API keys, la app usa videos de demostración.
