const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.FRONTEND_PORT || 8080;

const mimeTypes = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.mjs': 'application/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2'
};

const server = http.createServer((req, res) => {
    // Parsear URL para remover query strings
    const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
    const pathname = parsedUrl.pathname;
    
    console.log(`📥 Petición: ${pathname}`);
    
    let filePath = path.join(__dirname, pathname === '/' ? 'index.html' : pathname);
    
    const extname = String(path.extname(filePath)).toLowerCase();
    const contentType = mimeTypes[extname] || 'application/octet-stream';

    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                console.log(`❌ 404: ${filePath}`);
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end('<h1>404 - Archivo no encontrado</h1><p>Ruta: ' + req.url + '</p>', 'utf-8');
            } else {
                console.log(`❌ Error: ${error.code}`);
                res.writeHead(500);
                res.end('Error del servidor: ' + error.code + ' ..\n');
            }
        } else {
            console.log(`✅ 200: ${filePath}`);
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

server.listen(PORT, () => {
    console.log(`🌐 Servidor frontend corriendo en http://localhost:${PORT}`);
    console.log(`📂 Sirviendo archivos desde: ${__dirname}`);
});
