const CreditTransaction = require('../models/CreditTransaction');
const User = require('../models/User');
const { calculateActionCost, getActionDescription } = require('../config/creditConfig');

/**
 * Servicio centralizado para gestión de créditos
 * Facilita el descuento de créditos en las acciones de IA
 */

/**
 * Descontar créditos por una acción de IA
 * @param {ObjectId} userId - ID del usuario
 * @param {String} action - Tipo de acción (ej: 'GENERATE_IMAGE')
 * @param {String} provider - Proveedor de IA
 * @param {String} quality - Calidad
 * @param {Object} relatedData - Datos relacionados (opcional)
 * @returns {Object} { success, newBalance, transaction }
 */
async function deductCreditsForAction(userId, action, provider, quality, relatedData = {}) {
    try {
        // Calcular costo
        const cost = calculateActionCost(action, provider, quality);
        const description = getActionDescription(action, provider, quality);

        // Verificar que el usuario tiene suficientes créditos
        const user = await User.findById(userId);
        if (!user) {
            throw new Error('Usuario no encontrado');
        }

        if (user.credits < cost) {
            throw new Error(`No tienes créditos suficientes. Necesitas ${cost} créditos pero solo tienes ${user.credits}`);
        }

        // Crear transacción de descuento
        const { transaction, newBalance } = await CreditTransaction.createTransaction(
            userId,
            -cost,
            'deduct',
            description,
            {
                action: mapActionToTransactionAction(action),
                relatedTo: relatedData.relatedTo,
                relatedModel: relatedData.relatedModel
            }
        );

        console.log(`💳 Descuento: ${cost} créditos | Saldo restante: ${newBalance}`);

        return {
            success: true,
            cost,
            newBalance,
            transaction
        };

    } catch (error) {
        console.error('Error descontando créditos:', error);
        throw error;
    }
}

/**
 * Reembolsar créditos por una acción fallida
 * @param {ObjectId} userId - ID del usuario
 * @param {Number} amount - Cantidad a reembolsar
 * @param {String} reason - Razón del reembolso
 * @param {ObjectId} relatedTransactionId - ID de la transacción original
 */
async function refundCredits(userId, amount, reason, relatedTransactionId = null) {
    try {
        const { transaction, newBalance } = await CreditTransaction.createTransaction(
            userId,
            amount,
            'refund',
            `Reembolso: ${reason}`,
            {
                action: 'other',
                relatedTo: relatedTransactionId
            }
        );

        console.log(`💰 Reembolso: ${amount} créditos | Nuevo saldo: ${newBalance}`);

        return {
            success: true,
            amount,
            newBalance,
            transaction
        };

    } catch (error) {
        console.error('Error reembolsando créditos:', error);
        throw error;
    }
}

/**
 * Agregar créditos de bono (sin intervención del admin)
 * @param {ObjectId} userId - ID del usuario
 * @param {Number} amount - Cantidad de créditos
 * @param {String} reason - Razón del bono
 */
async function addBonusCredits(userId, amount, reason) {
    try {
        const { transaction, newBalance } = await CreditTransaction.createTransaction(
            userId,
            amount,
            'bonus',
            reason,
            {
                action: 'other'
            }
        );

        console.log(`🎁 Bono: ${amount} créditos agregados | Nuevo saldo: ${newBalance}`);

        return {
            success: true,
            amount,
            newBalance,
            transaction
        };

    } catch (error) {
        console.error('Error agregando bono:', error);
        throw error;
    }
}

/**
 * Verificar si el usuario tiene suficientes créditos para una acción
 * @param {ObjectId} userId - ID del usuario
 * @param {String} action - Tipo de acción
 * @param {String} provider - Proveedor de IA
 * @param {String} quality - Calidad
 * @returns {Object} { hasEnough, cost, currentCredits, missing }
 */
async function checkCreditsForAction(userId, action, provider, quality) {
    try {
        const user = await User.findById(userId);
        if (!user) {
            throw new Error('Usuario no encontrado');
        }

        const cost = calculateActionCost(action, provider, quality);
        const hasEnough = user.credits >= cost;
        const missing = hasEnough ? 0 : cost - user.credits;

        return {
            hasEnough,
            cost,
            currentCredits: user.credits,
            missing
        };

    } catch (error) {
        console.error('Error verificando créditos:', error);
        throw error;
    }
}

/**
 * Mapea el tipo de acción a la acción de transacción
 * @param {String} action - Tipo de acción
 * @returns {String} Acción de transacción
 */
function mapActionToTransactionAction(action) {
    const mapping = {
        'GENERATE_IMAGE': 'generate_image',
        'GENERATE_VIDEO': 'generate_video',
        'GENERATE_TEXT': 'generate_text',
        'UPSCALE_IMAGE': 'generate_image',
        'IMAGE_VARIATION': 'generate_image'
    };

    return mapping[action] || 'other';
}

module.exports = {
    deductCreditsForAction,
    refundCredits,
    addBonusCredits,
    checkCreditsForAction
};
