/**
 * 💰 GESTOR DE CRÉDITOS AVANZADO - RTZAI
 * 
 * Script interactivo para gestionar créditos de usuarios
 * 
 * Características:
 * - Agregar/quitar créditos a usuarios específicos
 * - Listar todos los usuarios con sus saldos
 * - Ver historial de transacciones
 * - Operaciones masivas
 * - Interfaz interactiva con menú
 * 
 * Uso:
 * node manage-credits.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const readline = require('readline');
const User = require('./models/User');
const CreditTransaction = require('./models/CreditTransaction');

// Colores para terminal
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    dim: '\x1b[2m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
    bgRed: '\x1b[41m',
    bgGreen: '\x1b[42m',
    bgYellow: '\x1b[43m',
    bgBlue: '\x1b[44m'
};

// Interfaz de readline
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Función para hacer preguntas
function question(query) {
    return new Promise(resolve => rl.question(query, resolve));
}

// Conectar a MongoDB
async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log(`${colors.green}✅ Conectado a MongoDB${colors.reset}`);
    } catch (error) {
        console.error(`${colors.red}❌ Error conectando a MongoDB:${colors.reset}`, error.message);
        process.exit(1);
    }
}

// Mostrar banner
function showBanner() {
    console.clear();
    console.log(`${colors.cyan}${colors.bright}`);
    console.log('╔═══════════════════════════════════════════════════════════════╗');
    console.log('║                                                               ║');
    console.log('║              💰 GESTOR DE CRÉDITOS - RTZAI                   ║');
    console.log('║                                                               ║');
    console.log('╚═══════════════════════════════════════════════════════════════╝');
    console.log(colors.reset);
}

// Mostrar menú principal
function showMenu() {
    console.log(`\n${colors.bright}📋 MENÚ PRINCIPAL${colors.reset}\n`);
    console.log(`${colors.cyan}1.${colors.reset} Listar todos los usuarios`);
    console.log(`${colors.cyan}2.${colors.reset} Agregar créditos a un usuario`);
    console.log(`${colors.cyan}3.${colors.reset} Quitar créditos a un usuario`);
    console.log(`${colors.cyan}4.${colors.reset} Ver historial de un usuario`);
    console.log(`${colors.cyan}5.${colors.reset} Buscar usuario por email`);
    console.log(`${colors.cyan}6.${colors.reset} Agregar créditos a TODOS los usuarios`);
    console.log(`${colors.cyan}7.${colors.reset} Establecer saldo específico`);
    console.log(`${colors.cyan}8.${colors.reset} Estadísticas generales`);
    console.log(`${colors.cyan}9.${colors.reset} Ver top usuarios por créditos`);
    console.log(`${colors.red}0.${colors.reset} Salir\n`);
}

// Listar usuarios
async function listUsers() {
    try {
        const users = await User.find().select('name email credits createdAt').sort({ credits: -1 });
        
        if (users.length === 0) {
            console.log(`\n${colors.yellow}⚠️  No hay usuarios registrados${colors.reset}\n`);
            return;
        }

        console.log(`\n${colors.bright}👥 USUARIOS REGISTRADOS (${users.length})${colors.reset}\n`);
        console.log('━'.repeat(100));
        console.log(
            `${colors.bright}#`.padEnd(5) +
            `Email`.padEnd(35) +
            `Nombre`.padEnd(25) +
            `Créditos`.padEnd(15) +
            `Registrado${colors.reset}`
        );
        console.log('━'.repeat(100));

        users.forEach((user, index) => {
            const creditColor = user.credits > 100 ? colors.green : 
                               user.credits > 20 ? colors.yellow : colors.red;
            
            console.log(
                `${(index + 1).toString().padEnd(5)}` +
                `${user.email.padEnd(35)}` +
                `${user.name.padEnd(25)}` +
                `${creditColor}${user.credits.toString().padEnd(15)}${colors.reset}` +
                `${new Date(user.createdAt).toLocaleDateString()}`
            );
        });
        console.log('━'.repeat(100));

    } catch (error) {
        console.error(`${colors.red}❌ Error:${colors.reset}`, error.message);
    }
}

// Agregar créditos a usuario
async function addCreditsToUser() {
    try {
        const email = await question(`\n${colors.cyan}📧 Email del usuario: ${colors.reset}`);
        const user = await User.findOne({ email });

        if (!user) {
            console.log(`${colors.red}❌ Usuario no encontrado${colors.reset}`);
            return;
        }

        console.log(`\n${colors.green}✅ Usuario encontrado:${colors.reset}`);
        console.log(`   Nombre: ${colors.bright}${user.name}${colors.reset}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Créditos actuales: ${colors.yellow}${user.credits}${colors.reset}`);

        const amount = await question(`\n${colors.cyan}💰 Cantidad a agregar: ${colors.reset}`);
        const amountNum = parseInt(amount);

        if (isNaN(amountNum) || amountNum <= 0) {
            console.log(`${colors.red}❌ Cantidad inválida${colors.reset}`);
            return;
        }

        const reason = await question(`${colors.cyan}📝 Razón (opcional): ${colors.reset}`) || 
                      `Créditos agregados manualmente (${amountNum} créditos)`;

        const confirm = await question(
            `\n${colors.yellow}⚠️  ¿Confirmar agregar ${amountNum} créditos a ${user.email}? (s/n): ${colors.reset}`
        );

        if (confirm.toLowerCase() !== 's') {
            console.log(`${colors.yellow}❌ Operación cancelada${colors.reset}`);
            return;
        }

        // Crear transacción
        const { transaction, newBalance } = await CreditTransaction.createTransaction(
            user._id,
            amountNum,
            'add',
            reason,
            {
                action: 'manual_add',
                addedBy: 'admin-script'
            }
        );

        console.log(`\n${colors.green}${colors.bright}✅ ¡CRÉDITOS AGREGADOS EXITOSAMENTE!${colors.reset}`);
        console.log(`   Saldo anterior: ${user.credits}`);
        console.log(`   Créditos agregados: +${amountNum}`);
        console.log(`   Nuevo saldo: ${colors.green}${colors.bright}${newBalance}${colors.reset}`);
        console.log(`   ID transacción: ${transaction._id}`);

    } catch (error) {
        console.error(`${colors.red}❌ Error:${colors.reset}`, error.message);
    }
}

// Quitar créditos a usuario
async function deductCreditsFromUser() {
    try {
        const email = await question(`\n${colors.cyan}📧 Email del usuario: ${colors.reset}`);
        const user = await User.findOne({ email });

        if (!user) {
            console.log(`${colors.red}❌ Usuario no encontrado${colors.reset}`);
            return;
        }

        console.log(`\n${colors.green}✅ Usuario encontrado:${colors.reset}`);
        console.log(`   Nombre: ${colors.bright}${user.name}${colors.reset}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Créditos actuales: ${colors.yellow}${user.credits}${colors.reset}`);

        const amount = await question(`\n${colors.cyan}💰 Cantidad a quitar: ${colors.reset}`);
        const amountNum = parseInt(amount);

        if (isNaN(amountNum) || amountNum <= 0) {
            console.log(`${colors.red}❌ Cantidad inválida${colors.reset}`);
            return;
        }

        if (user.credits < amountNum) {
            console.log(`${colors.red}❌ El usuario no tiene suficientes créditos${colors.reset}`);
            console.log(`   Disponibles: ${user.credits}`);
            console.log(`   Solicitados: ${amountNum}`);
            return;
        }

        const reason = await question(`${colors.cyan}📝 Razón (opcional): ${colors.reset}`) || 
                      `Créditos descontados manualmente (${amountNum} créditos)`;

        const confirm = await question(
            `\n${colors.yellow}⚠️  ¿Confirmar quitar ${amountNum} créditos a ${user.email}? (s/n): ${colors.reset}`
        );

        if (confirm.toLowerCase() !== 's') {
            console.log(`${colors.yellow}❌ Operación cancelada${colors.reset}`);
            return;
        }

        // Crear transacción
        const { transaction, newBalance } = await CreditTransaction.createTransaction(
            user._id,
            -amountNum,
            'deduct',
            reason,
            {
                action: 'manual_deduct',
                deductedBy: 'admin-script'
            }
        );

        console.log(`\n${colors.green}${colors.bright}✅ ¡CRÉDITOS DESCONTADOS EXITOSAMENTE!${colors.reset}`);
        console.log(`   Saldo anterior: ${user.credits}`);
        console.log(`   Créditos descontados: -${amountNum}`);
        console.log(`   Nuevo saldo: ${colors.yellow}${newBalance}${colors.reset}`);
        console.log(`   ID transacción: ${transaction._id}`);

    } catch (error) {
        console.error(`${colors.red}❌ Error:${colors.reset}`, error.message);
    }
}

// Ver historial de usuario
async function viewUserHistory() {
    try {
        const email = await question(`\n${colors.cyan}📧 Email del usuario: ${colors.reset}`);
        const user = await User.findOne({ email });

        if (!user) {
            console.log(`${colors.red}❌ Usuario no encontrado${colors.reset}`);
            return;
        }

        const { transactions, total } = await CreditTransaction.getUserHistory(user._id, { limit: 20 });

        console.log(`\n${colors.bright}📋 HISTORIAL DE ${user.name} (${user.email})${colors.reset}`);
        console.log(`   Saldo actual: ${colors.yellow}${user.credits} créditos${colors.reset}`);
        console.log(`   Total transacciones: ${total}\n`);
        console.log('━'.repeat(120));
        console.log(
            `${colors.bright}Fecha`.padEnd(20) +
            `Tipo`.padEnd(15) +
            `Cantidad`.padEnd(15) +
            `Saldo`.padEnd(15) +
            `Descripción${colors.reset}`
        );
        console.log('━'.repeat(120));

        transactions.forEach(tx => {
            const typeColor = tx.type === 'add' || tx.type === 'purchase' ? colors.green : colors.red;
            const amountStr = tx.amount > 0 ? `+${tx.amount}` : tx.amount.toString();
            
            console.log(
                `${new Date(tx.createdAt).toLocaleString('es-ES').padEnd(20)}` +
                `${typeColor}${tx.type.padEnd(15)}${colors.reset}` +
                `${typeColor}${amountStr.padEnd(15)}${colors.reset}` +
                `${tx.balanceAfter.toString().padEnd(15)}` +
                `${tx.description.substring(0, 50)}`
            );
        });
        console.log('━'.repeat(120));

    } catch (error) {
        console.error(`${colors.red}❌ Error:${colors.reset}`, error.message);
    }
}

// Buscar usuario
async function searchUser() {
    try {
        const email = await question(`\n${colors.cyan}📧 Email del usuario: ${colors.reset}`);
        const user = await User.findOne({ email });

        if (!user) {
            console.log(`${colors.red}❌ Usuario no encontrado${colors.reset}`);
            return;
        }

        console.log(`\n${colors.green}${colors.bright}✅ USUARIO ENCONTRADO${colors.reset}\n`);
        console.log(`   ID: ${user._id}`);
        console.log(`   Nombre: ${colors.bright}${user.name}${colors.reset}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Créditos: ${colors.yellow}${colors.bright}${user.credits}${colors.reset}`);
        console.log(`   Rol: ${user.role || 'user'}`);
        console.log(`   Registrado: ${new Date(user.createdAt).toLocaleString('es-ES')}`);

    } catch (error) {
        console.error(`${colors.red}❌ Error:${colors.reset}`, error.message);
    }
}

// Agregar créditos a todos
async function addCreditsToAll() {
    try {
        const users = await User.find();
        
        console.log(`\n${colors.yellow}⚠️  Se agregarán créditos a ${users.length} usuarios${colors.reset}`);
        
        const amount = await question(`\n${colors.cyan}💰 Cantidad a agregar a cada uno: ${colors.reset}`);
        const amountNum = parseInt(amount);

        if (isNaN(amountNum) || amountNum <= 0) {
            console.log(`${colors.red}❌ Cantidad inválida${colors.reset}`);
            return;
        }

        const confirm = await question(
            `\n${colors.bgYellow}${colors.bright} ⚠️  CONFIRMAR: Agregar ${amountNum} créditos a ${users.length} usuarios? (s/n): ${colors.reset} `
        );

        if (confirm.toLowerCase() !== 's') {
            console.log(`${colors.yellow}❌ Operación cancelada${colors.reset}`);
            return;
        }

        console.log(`\n${colors.cyan}🔄 Procesando...${colors.reset}\n`);

        let success = 0;
        let failed = 0;

        for (const user of users) {
            try {
                await CreditTransaction.createTransaction(
                    user._id,
                    amountNum,
                    'add',
                    `Créditos masivos (+${amountNum}) - Script admin`,
                    {
                        action: 'bulk_add',
                        addedBy: 'admin-script'
                    }
                );
                console.log(`${colors.green}✅${colors.reset} ${user.email.padEnd(40)} → +${amountNum} créditos`);
                success++;
            } catch (error) {
                console.log(`${colors.red}❌${colors.reset} ${user.email.padEnd(40)} → Error`);
                failed++;
            }
        }

        console.log(`\n${colors.green}${colors.bright}✅ OPERACIÓN COMPLETADA${colors.reset}`);
        console.log(`   Exitosos: ${colors.green}${success}${colors.reset}`);
        console.log(`   Fallidos: ${colors.red}${failed}${colors.reset}`);

    } catch (error) {
        console.error(`${colors.red}❌ Error:${colors.reset}`, error.message);
    }
}

// Establecer saldo específico
async function setSpecificBalance() {
    try {
        const email = await question(`\n${colors.cyan}📧 Email del usuario: ${colors.reset}`);
        const user = await User.findOne({ email });

        if (!user) {
            console.log(`${colors.red}❌ Usuario no encontrado${colors.reset}`);
            return;
        }

        console.log(`\n${colors.green}✅ Usuario encontrado:${colors.reset}`);
        console.log(`   Créditos actuales: ${colors.yellow}${user.credits}${colors.reset}`);

        const newBalance = await question(`\n${colors.cyan}💰 Nuevo saldo: ${colors.reset}`);
        const newBalanceNum = parseInt(newBalance);

        if (isNaN(newBalanceNum) || newBalanceNum < 0) {
            console.log(`${colors.red}❌ Saldo inválido${colors.reset}`);
            return;
        }

        const difference = newBalanceNum - user.credits;
        const operation = difference > 0 ? 'agregar' : 'quitar';
        const absoluteDiff = Math.abs(difference);

        const confirm = await question(
            `\n${colors.yellow}⚠️  Esto ${operation}á ${absoluteDiff} créditos. ¿Confirmar? (s/n): ${colors.reset}`
        );

        if (confirm.toLowerCase() !== 's') {
            console.log(`${colors.yellow}❌ Operación cancelada${colors.reset}`);
            return;
        }

        const { newBalance: finalBalance } = await CreditTransaction.createTransaction(
            user._id,
            difference,
            difference > 0 ? 'add' : 'deduct',
            `Ajuste de saldo: ${user.credits} → ${newBalanceNum}`,
            {
                action: 'balance_adjustment',
                adjustedBy: 'admin-script'
            }
        );

        console.log(`\n${colors.green}${colors.bright}✅ ¡SALDO ACTUALIZADO!${colors.reset}`);
        console.log(`   Saldo anterior: ${user.credits}`);
        console.log(`   Nuevo saldo: ${colors.green}${finalBalance}${colors.reset}`);

    } catch (error) {
        console.error(`${colors.red}❌ Error:${colors.reset}`, error.message);
    }
}

// Estadísticas generales
async function showStats() {
    try {
        const totalUsers = await User.countDocuments();
        const totalCredits = await User.aggregate([
            { $group: { _id: null, total: { $sum: '$credits' } } }
        ]);
        const avgCredits = await User.aggregate([
            { $group: { _id: null, avg: { $avg: '$credits' } } }
        ]);
        const totalTransactions = await CreditTransaction.countDocuments();

        console.log(`\n${colors.bright}📊 ESTADÍSTICAS GENERALES${colors.reset}\n`);
        console.log(`   👥 Total usuarios: ${colors.cyan}${totalUsers}${colors.reset}`);
        console.log(`   💰 Total créditos en sistema: ${colors.yellow}${totalCredits[0]?.total || 0}${colors.reset}`);
        console.log(`   📊 Promedio por usuario: ${colors.green}${Math.round(avgCredits[0]?.avg || 0)}${colors.reset}`);
        console.log(`   📋 Total transacciones: ${colors.magenta}${totalTransactions}${colors.reset}`);

    } catch (error) {
        console.error(`${colors.red}❌ Error:${colors.reset}`, error.message);
    }
}

// Top usuarios
async function showTopUsers() {
    try {
        const top = await User.find().select('name email credits').sort({ credits: -1 }).limit(10);

        console.log(`\n${colors.bright}🏆 TOP 10 USUARIOS POR CRÉDITOS${colors.reset}\n`);
        console.log('━'.repeat(80));
        
        top.forEach((user, index) => {
            const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`;
            const creditColor = index < 3 ? colors.green + colors.bright : colors.yellow;
            
            console.log(
                `${medal.padEnd(5)}` +
                `${user.email.padEnd(40)}` +
                `${creditColor}${user.credits} créditos${colors.reset}`
            );
        });
        console.log('━'.repeat(80));

    } catch (error) {
        console.error(`${colors.red}❌ Error:${colors.reset}`, error.message);
    }
}

// Loop principal
async function main() {
    await connectDB();
    showBanner();

    let running = true;

    while (running) {
        showMenu();
        const option = await question(`${colors.bright}Selecciona una opción: ${colors.reset}`);

        switch (option) {
            case '1':
                await listUsers();
                await question('\nPresiona Enter para continuar...');
                showBanner();
                break;
            case '2':
                await addCreditsToUser();
                await question('\nPresiona Enter para continuar...');
                showBanner();
                break;
            case '3':
                await deductCreditsFromUser();
                await question('\nPresiona Enter para continuar...');
                showBanner();
                break;
            case '4':
                await viewUserHistory();
                await question('\nPresiona Enter para continuar...');
                showBanner();
                break;
            case '5':
                await searchUser();
                await question('\nPresiona Enter para continuar...');
                showBanner();
                break;
            case '6':
                await addCreditsToAll();
                await question('\nPresiona Enter para continuar...');
                showBanner();
                break;
            case '7':
                await setSpecificBalance();
                await question('\nPresiona Enter para continuar...');
                showBanner();
                break;
            case '8':
                await showStats();
                await question('\nPresiona Enter para continuar...');
                showBanner();
                break;
            case '9':
                await showTopUsers();
                await question('\nPresiona Enter para continuar...');
                showBanner();
                break;
            case '0':
                console.log(`\n${colors.green}👋 ¡Hasta luego!${colors.reset}\n`);
                running = false;
                break;
            default:
                console.log(`\n${colors.red}❌ Opción inválida${colors.reset}`);
                await question('\nPresiona Enter para continuar...');
                showBanner();
        }
    }

    rl.close();
    mongoose.connection.close();
}

// Ejecutar
main().catch(error => {
    console.error(`${colors.red}Error fatal:${colors.reset}`, error);
    process.exit(1);
});
