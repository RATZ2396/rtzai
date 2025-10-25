// Validación de variables de entorno requeridas

const requiredEnvVars = [
    'MONGODB_URI',
    'JWT_SECRET',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET'
];

const optionalEnvVars = {
    'FRONTEND_URL': 'http://localhost:8080',
    'GOOGLE_CALLBACK_URL': 'http://localhost:3000/api/auth/google/callback',
    'PORT': '3000',
    'HUGGINGFACE_API_KEY': null,
    'OPENAI_API_KEY': null
};

function validateEnv() {
    const missing = [];
    
    // Verificar variables requeridas
    for (const varName of requiredEnvVars) {
        if (!process.env[varName] || process.env[varName].trim() === '') {
            missing.push(varName);
        }
    }
    
    if (missing.length > 0) {
        console.error('\n❌ ERROR: Variables de entorno faltantes o vacías:\n');
        missing.forEach(v => console.error(`   ✗ ${v}`));
        console.error('\n💡 Solución:');
        console.error('   1. Copia .env.example a .env');
        console.error('   2. Completa todas las variables requeridas');
        console.error('   3. Reinicia el servidor\n');
        process.exit(1);
    }
    
    // Configurar valores por defecto para variables opcionales
    for (const [varName, defaultValue] of Object.entries(optionalEnvVars)) {
        if (!process.env[varName] && defaultValue) {
            process.env[varName] = defaultValue;
            console.log(`⚠️  ${varName} no configurado. Usando: ${defaultValue}`);
        }
    }
    
    // Validar formato de MongoDB URI
    if (!process.env.MONGODB_URI.startsWith('mongodb')) {
        console.error('\n❌ ERROR: MONGODB_URI debe comenzar con "mongodb://" o "mongodb+srv://"\n');
        process.exit(1);
    }
    
    // Validar Google Client ID
    if (!process.env.GOOGLE_CLIENT_ID.endsWith('.apps.googleusercontent.com')) {
        console.warn('\n⚠️  ADVERTENCIA: GOOGLE_CLIENT_ID no parece válido');
        console.warn('   Debe terminar en .apps.googleusercontent.com\n');
    }
    
    console.log('✅ Variables de entorno validadas correctamente\n');
}

module.exports = validateEnv;
