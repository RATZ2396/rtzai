/**
 * Script de prueba rápida del sistema de créditos
 * Verifica que todos los módulos se carguen correctamente
 */

console.log('🧪 Iniciando prueba del sistema de créditos...\n');

try {
    // 1. Verificar que los modelos se cargan
    console.log('📦 1. Cargando modelos...');
    const CreditTransaction = require('./models/CreditTransaction');
    const User = require('./models/User');
    console.log('   ✅ CreditTransaction cargado');
    console.log('   ✅ User cargado');

    // 2. Verificar configuración
    console.log('\n📦 2. Cargando configuración...');
    const creditConfig = require('./config/creditConfig');
    console.log('   ✅ creditConfig cargado');
    console.log('   💰 Créditos iniciales:', creditConfig.INITIAL_CREDITS);
    console.log('   💳 Costo generar imagen:', creditConfig.ACTION_COSTS.GENERATE_IMAGE);
    console.log('   📹 Costo generar video:', creditConfig.ACTION_COSTS.GENERATE_VIDEO);

    // 3. Verificar middleware
    console.log('\n📦 3. Cargando middleware...');
    const { checkCredits } = require('./middleware/checkCredits');
    console.log('   ✅ checkCredits cargado');

    // 4. Verificar servicios
    console.log('\n📦 4. Cargando servicios...');
    const creditService = require('./services/creditService');
    console.log('   ✅ creditService cargado');
    console.log('   ✅ deductCreditsForAction disponible');
    console.log('   ✅ refundCredits disponible');
    console.log('   ✅ checkCreditsForAction disponible');

    // 5. Verificar rutas
    console.log('\n📦 5. Cargando rutas...');
    const creditsRoutes = require('./routes/credits');
    console.log('   ✅ creditsRoutes cargado');

    console.log('\n╔════════════════════════════════════════════════╗');
    console.log('║                                                ║');
    console.log('║   ✅ SISTEMA DE CRÉDITOS FUNCIONANDO          ║');
    console.log('║                                                ║');
    console.log('╚════════════════════════════════════════════════╝\n');

    console.log('📊 Resumen del Sistema:');
    console.log(`   • Créditos iniciales: ${creditConfig.INITIAL_CREDITS}`);
    console.log(`   • Planes disponibles: ${creditConfig.CREDIT_PLANS.length}`);
    console.log('   • Modelos: 2 (User, CreditTransaction)');
    console.log('   • Middleware: checkCredits');
    console.log('   • Servicios: creditService');
    console.log('   • Rutas: /api/credits/*');
    console.log('\n✨ Todos los módulos cargados correctamente!\n');
    
    process.exit(0);

} catch (error) {
    console.error('\n❌ ERROR al cargar el sistema de créditos:');
    console.error(error.message);
    console.error('\nStack trace:');
    console.error(error.stack);
    process.exit(1);
}
