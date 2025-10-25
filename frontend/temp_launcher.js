const { spawn } = require('child_process'); 
const path = require('path'); 
 
console.log('\n  ════════════════════════════════════════════════════════════'); 
console.log('  ║              SERVIDORES INICIADOS                        ║'); 
console.log('  ════════════════════════════════════════════════════════════\n'); 
 
const backend = spawn('node', ['server.js'], { 
  cwd: path.join(__dirname, 'backend'), 
  shell: true 
}); 
 
const frontend = spawn('node', ['server.js'], { 
  cwd: path.join(__dirname, 'frontend'), 
  shell: true 
}); 
 
backend.stdout.on('data', (data) => { 
  process.stdout.write('  [BACKEND]  ' + data); 
}); 
 
backend.stderr.on('data', (data) => { 
  process.stderr.write('  [BACKEND]  ' + data); 
}); 
 
frontend.stdout.on('data', (data) => { 
  process.stdout.write('  [FRONTEND] ' + data); 
}); 
 
frontend.stderr.on('data', (data) => { 
  process.stderr.write('  [FRONTEND] ' + data); 
}); 
 
setTimeout(() => { 
  console.log('\n  ════════════════════════════════════════════════════════════'); 
  console.log('  ║                                                          ║'); 
  console.log('  ║    ✓ Backend:  http://localhost:3000                    ║'); 
  console.log('  ║    ✓ Frontend: http://localhost:8080                    ║'); 
  console.log('  ║                                                          ║'); 
  console.log('  ╠══════════════════════════════════════════════════════════╣'); 
  console.log('  ║  💰 SISTEMA DE CREDITOS                                  ║'); 
  console.log('  ║    • Usuarios nuevos: 50 creditos gratis                ║'); 
  console.log('  ║    • Generar imagen: 1 credito                          ║'); 
  console.log('  ║    • Generar video: 5 creditos                          ║'); 
  console.log('  ║                                                          ║'); 
  console.log('  ║  📚 Documentacion:                                       ║'); 
  console.log('  ║    • backend/CREDITS_README.md                          ║'); 
  console.log('  ║    • backend/CREDITS_SYSTEM_GUIDE.md                    ║'); 
  console.log('  ║                                                          ║'); 
  console.log('  ║    Abriendo navegador...                                ║'); 
  console.log('  ║                                                          ║'); 
  console.log('  ╠══════════════════════════════════════════════════════════╣'); 
  console.log('  ║    Presiona Ctrl+C para detener los servidores          ║'); 
  console.log('  ════════════════════════════════════════════════════════════\n'); 
  require('child_process').exec('start http://localhost:8080'); 
}, 2000); 
 
process.on('SIGINT', () => { 
  console.log('\n\n  Deteniendo servidores...'); 
  backend.kill(); 
  frontend.kill(); 
  process.exit(); 
}); 
