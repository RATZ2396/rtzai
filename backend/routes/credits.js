const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { isAdmin } = require('../middleware/checkCredits');
const CreditTransaction = require('../models/CreditTransaction');
const User = require('../models/User');
const { CREDIT_PLANS, INITIAL_CREDITS } = require('../config/creditConfig');

/**
 * GET /api/credits/balance
 * Obtener el saldo actual de créditos del usuario autenticado
 */
router.get('/balance', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('credits');
        
        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        res.json({
            credits: user.credits,
            userId: req.user._id
        });
        
    } catch (error) {
        console.error('Error obteniendo saldo:', error);
        res.status(500).json({ error: 'Error al obtener el saldo de créditos' });
    }
});

/**
 * GET /api/credits/history
 * Obtener el historial de transacciones del usuario
 */
router.get('/history', auth, async (req, res) => {
    try {
        const { limit = 50, skip = 0 } = req.query;
        
        const { transactions, total } = await CreditTransaction.getUserHistory(
            req.user._id,
            { limit: parseInt(limit), skip: parseInt(skip) }
        );

        res.json({
            transactions,
            total,
            currentPage: Math.floor(skip / limit) + 1,
            totalPages: Math.ceil(total / limit)
        });
        
    } catch (error) {
        console.error('Error obteniendo historial:', error);
        res.status(500).json({ error: 'Error al obtener el historial de créditos' });
    }
});

/**
 * GET /api/credits/stats
 * Obtener estadísticas de uso de créditos del usuario
 */
router.get('/stats', auth, async (req, res) => {
    try {
        const stats = await CreditTransaction.getUserStats(req.user._id);
        
        res.json(stats);
        
    } catch (error) {
        console.error('Error obteniendo estadísticas:', error);
        res.status(500).json({ error: 'Error al obtener estadísticas de créditos' });
    }
});

/**
 * POST /api/credits/add
 * Agregar créditos a un usuario (solo administradores)
 * 
 * Body:
 * {
 *   "userId": "user_id",
 *   "amount": 50,
 *   "description": "Recarga manual por el admin"
 * }
 */
router.post('/add', auth, isAdmin, async (req, res) => {
    try {
        const { userId, amount, description = 'Créditos agregados por administrador' } = req.body;

        // Validaciones
        if (!userId) {
            return res.status(400).json({ error: 'El userId es requerido' });
        }

        if (!amount || amount <= 0) {
            return res.status(400).json({ error: 'La cantidad debe ser mayor a 0' });
        }

        // Verificar que el usuario existe
        const targetUser = await User.findById(userId);
        if (!targetUser) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        // Crear transacción
        const { transaction, newBalance } = await CreditTransaction.createTransaction(
            userId,
            amount,
            'add',
            description,
            {
                action: 'manual_add',
                adminUser: req.user._id
            }
        );

        console.log(`✅ Admin ${req.user.email} agregó ${amount} créditos a ${targetUser.email}`);

        res.json({
            message: 'Créditos agregados exitosamente',
            transaction: {
                id: transaction._id,
                amount,
                description,
                balanceAfter: newBalance,
                createdAt: transaction.createdAt
            },
            user: {
                id: targetUser._id,
                email: targetUser.email,
                credits: newBalance
            }
        });
        
    } catch (error) {
        console.error('Error agregando créditos:', error);
        res.status(500).json({ 
            error: error.message || 'Error al agregar créditos' 
        });
    }
});

/**
 * POST /api/credits/deduct
 * Descontar créditos de un usuario (solo administradores)
 * 
 * Body:
 * {
 *   "userId": "user_id",
 *   "amount": 10,
 *   "description": "Descuento manual"
 * }
 */
router.post('/deduct', auth, isAdmin, async (req, res) => {
    try {
        const { userId, amount, description = 'Créditos descontados por administrador' } = req.body;

        // Validaciones
        if (!userId) {
            return res.status(400).json({ error: 'El userId es requerido' });
        }

        if (!amount || amount <= 0) {
            return res.status(400).json({ error: 'La cantidad debe ser mayor a 0' });
        }

        // Verificar que el usuario existe
        const targetUser = await User.findById(userId);
        if (!targetUser) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        // Verificar que tiene suficientes créditos
        if (targetUser.credits < amount) {
            return res.status(400).json({ 
                error: 'El usuario no tiene suficientes créditos',
                currentCredits: targetUser.credits,
                requestedAmount: amount
            });
        }

        // Crear transacción (con cantidad negativa)
        const { transaction, newBalance } = await CreditTransaction.createTransaction(
            userId,
            -amount,
            'deduct',
            description,
            {
                action: 'other',
                adminUser: req.user._id
            }
        );

        console.log(`✅ Admin ${req.user.email} descontó ${amount} créditos de ${targetUser.email}`);

        res.json({
            message: 'Créditos descontados exitosamente',
            transaction: {
                id: transaction._id,
                amount: -amount,
                description,
                balanceAfter: newBalance,
                createdAt: transaction.createdAt
            },
            user: {
                id: targetUser._id,
                email: targetUser.email,
                credits: newBalance
            }
        });
        
    } catch (error) {
        console.error('Error descontando créditos:', error);
        res.status(500).json({ 
            error: error.message || 'Error al descontar créditos' 
        });
    }
});

/**
 * GET /api/credits/plans
 * Obtener los planes de compra de créditos disponibles
 */
router.get('/plans', async (req, res) => {
    try {
        res.json({
            plans: CREDIT_PLANS,
            currency: 'USD'
        });
    } catch (error) {
        console.error('Error obteniendo planes:', error);
        res.status(500).json({ error: 'Error al obtener planes de créditos' });
    }
});

/**
 * POST /api/credits/purchase
 * Procesar una compra de créditos (MODO PRUEBA - preparado para Stripe/MercadoPago)
 * 
 * Body:
 * {
 *   "planId": "basic",
 *   "credits": 250,
 *   "amount": 10
 * }
 */
router.post('/purchase', auth, async (req, res) => {
    try {
        const { planId, credits, amount } = req.body;

        if (!planId) {
            return res.status(400).json({ error: 'El planId es requerido' });
        }

        // Buscar el plan
        const plan = CREDIT_PLANS.find(p => p.id === planId);
        if (!plan) {
            return res.status(404).json({ error: 'Plan no encontrado' });
        }

        // MODO PRUEBA: Agregar créditos automáticamente
        // TODO: En producción, esto debería hacerse después de confirmar el pago con Stripe/MercadoPago
        
        const creditsToAdd = credits || plan.credits;
        const description = `Compra de plan ${plan.name} (${creditsToAdd} créditos) - MODO PRUEBA`;
        
        // Crear transacción y agregar créditos
        const { transaction, newBalance } = await CreditTransaction.createTransaction(
            req.user._id,
            creditsToAdd,
            'purchase',
            description,
            {
                action: 'purchase_credits',
                planId: planId,
                planName: plan.name,
                amount: amount || plan.price
            }
        );

        console.log(`💳 Usuario ${req.user.email} compró plan ${plan.name} (+${creditsToAdd} créditos)`);

        res.json({
            success: true,
            message: `Plan ${plan.name} activado exitosamente (MODO PRUEBA)`,
            plan: {
                id: plan.id,
                name: plan.name,
                credits: creditsToAdd
            },
            transaction: {
                id: transaction._id,
                amount: creditsToAdd,
                description,
                createdAt: transaction.createdAt
            },
            newBalance: newBalance,
            note: 'Modo prueba: Los créditos se agregaron automáticamente. En producción se procesará el pago real.'
        });
        
    } catch (error) {
        console.error('Error procesando compra:', error);
        res.status(500).json({ error: 'Error al procesar la compra' });
    }
});

/**
 * GET /api/credits/users (solo admin)
 * Listar todos los usuarios con sus créditos
 */
router.get('/users', auth, isAdmin, async (req, res) => {
    try {
        const users = await User.find()
            .select('name email credits createdAt lastLogin')
            .sort({ credits: -1 })
            .limit(100);

        res.json({
            users,
            total: users.length
        });
        
    } catch (error) {
        console.error('Error listando usuarios:', error);
        res.status(500).json({ error: 'Error al listar usuarios' });
    }
});

/**
 * POST /api/credits/refund
 * Reembolsar créditos por una acción fallida
 * 
 * Body:
 * {
 *   "transactionId": "transaction_id"
 * }
 */
router.post('/refund', auth, async (req, res) => {
    try {
        const { transactionId } = req.body;

        if (!transactionId) {
            return res.status(400).json({ error: 'El transactionId es requerido' });
        }

        // Buscar la transacción
        const originalTransaction = await CreditTransaction.findById(transactionId);
        
        if (!originalTransaction) {
            return res.status(404).json({ error: 'Transacción no encontrada' });
        }

        // Verificar que la transacción pertenece al usuario
        if (originalTransaction.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'No tienes permiso para reembolsar esta transacción' });
        }

        // Verificar que sea una transacción de descuento
        if (originalTransaction.type !== 'deduct' || originalTransaction.amount >= 0) {
            return res.status(400).json({ error: 'Solo se pueden reembolsar transacciones de descuento' });
        }

        // Crear transacción de reembolso
        const { transaction, newBalance } = await CreditTransaction.createTransaction(
            req.user._id,
            Math.abs(originalTransaction.amount),
            'refund',
            `Reembolso de: ${originalTransaction.description}`,
            {
                action: 'other',
                relatedTo: originalTransaction._id
            }
        );

        res.json({
            message: 'Reembolso procesado exitosamente',
            refund: {
                amount: Math.abs(originalTransaction.amount),
                balanceAfter: newBalance
            }
        });
        
    } catch (error) {
        console.error('Error procesando reembolso:', error);
        res.status(500).json({ 
            error: error.message || 'Error al procesar el reembolso' 
        });
    }
});

module.exports = router;
