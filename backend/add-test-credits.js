/**
 * Script para agregar créditos de prueba a un usuario
 * 
 * Uso:
 * node add-test-credits.js <email> <cantidad>
 * 
 * Ejemplo:
 * node add-test-credits.js usuario@example.com 100
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const CreditTransaction = require('./models/CreditTransaction');

// Conectar a MongoDB
async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('✅ Conectado a MongoDB');
    } catch (error) {
        console.error('❌ Error conectando a MongoDB:', error);
        process.exit(1);
    }
}

// Agregar créditos a un usuario
async function addTestCredits(email, amount) {
    try {
        // Buscar usuario por email
        const user = await User.findOne({ email });
        
        if (!user) {
            console.error(`❌ Usuario con email "${email}" no encontrado`);
            console.log('\n💡 Usuarios disponibles:');
            const users = await User.find().select('email name credits');
            users.forEach(u => {
                console.log(`   - ${u.email} (${u.name}) - ${u.credits} créditos`);
            });
            return false;
        }

        // Crear transacción
        const { transaction, newBalance } = await CreditTransaction.createTransaction(
            user._id,
            amount,
            'add',
            `Créditos de prueba agregados manualmente (${amount} créditos)`,
            {
                action: 'test_credits',
                addedBy: 'script'
            }
        );

        console.log('\n✅ Créditos agregados exitosamente:');
        console.log(`   Usuario: ${user.email} (${user.name})`);
        console.log(`   Créditos anteriores: ${user.credits}`);
        console.log(`   Créditos agregados: +${amount}`);
        console.log(`   Nuevo saldo: ${newBalance}`);
        console.log(`   Transacción ID: ${transaction._id}`);
        
        return true;
        
    } catch (error) {
        console.error('❌ Error agregando créditos:', error.message);
        return false;
    }
}

// Función para agregar créditos a todos los usuarios
async function addCreditsToAll(amount) {
    try {
        const users = await User.find();
        
        console.log(`\n🔄 Agregando ${amount} créditos a ${users.length} usuarios...\n`);
        
        for (const user of users) {
            const { newBalance } = await CreditTransaction.createTransaction(
                user._id,
                amount,
                'add',
                `Créditos de prueba masivos (${amount} créditos)`,
                {
                    action: 'test_credits',
                    addedBy: 'script-bulk'
                }
            );
            
            console.log(`✅ ${user.email}: ${user.credits} → ${newBalance} créditos`);
        }
        
        console.log(`\n✅ Créditos agregados a todos los usuarios`);
        return true;
        
    } catch (error) {
        console.error('❌ Error agregando créditos masivos:', error.message);
        return false;
    }
}

// Main
async function main() {
    await connectDB();
    
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
        console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║     SCRIPT DE CRÉDITOS DE PRUEBA - RTZAI                 ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝

Uso:
  node add-test-credits.js <email> <cantidad>
  node add-test-credits.js all <cantidad>

Ejemplos:
  node add-test-credits.js usuario@example.com 100
  node add-test-credits.js all 50

Comandos especiales:
  all - Agregar créditos a TODOS los usuarios
        `);
        
        // Listar usuarios
        console.log('📋 Usuarios en la base de datos:\n');
        const users = await User.find().select('email name credits').limit(10);
        users.forEach(u => {
            console.log(`   • ${u.email} (${u.name}) - ${u.credits} créditos`);
        });
        
        if (users.length === 0) {
            console.log('   (No hay usuarios registrados)');
        }
        
        mongoose.connection.close();
        return;
    }
    
    const emailOrCommand = args[0];
    const amount = parseInt(args[1]) || 100;
    
    if (isNaN(amount) || amount <= 0) {
        console.error('❌ La cantidad debe ser un número positivo');
        mongoose.connection.close();
        return;
    }
    
    let success = false;
    
    if (emailOrCommand === 'all') {
        success = await addCreditsToAll(amount);
    } else {
        success = await addTestCredits(emailOrCommand, amount);
    }
    
    mongoose.connection.close();
    process.exit(success ? 0 : 1);
}

main();
