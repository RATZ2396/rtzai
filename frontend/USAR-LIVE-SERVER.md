# 🚀 Opción más simple: Live Server

Si tienes VS Code, esta es la forma MÁS FÁCIL:

## Paso 1: Instalar Live Server
1. Abre VS Code
2. Ve a Extensiones (Ctrl+Shift+X)
3. Busca "Live Server"
4. Instala la extensión de Ritwick Dey

## Paso 2: Iniciar Backend
Abre una terminal en VS Code y ejecuta:
```bash
cd backend
npm install
node server.js
```

## Paso 3: Iniciar Frontend con Live Server
1. Click derecho en `frontend/index.html`
2. Selecciona "Open with Live Server"
3. Se abrirá automáticamente en `http://127.0.0.1:5500`

¡Listo! Ahora funciona sin problemas de CORS.

---

## Alternativa: Usar Python (si no tienes Node en frontend)

Terminal 1 (Backend):
```bash
cd backend
npm install
node server.js
```

Terminal 2 (Frontend):
```bash
cd frontend
python -m http.server 8080
```

Abre: `http://localhost:8080`
