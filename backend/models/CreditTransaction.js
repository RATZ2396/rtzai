const mongoose = require('mongoose');

/**
 * Modelo de transacciones de créditos
 * Registra todos los movimientos de créditos (cargas y consumos)
 * para mantener un historial completo de cada usuario
 */
const creditTransactionSchema = new mongoose.Schema({
    // Usuario asociado a la transacción
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true, // Índice para búsquedas rápidas por usuario
        alias: 'userId' // Mantener compatibilidad con código anterior
    },
    
    // Cantidad de créditos (positivo para añadir, negativo para descontar)
    amount: {
        type: Number,
        required: true
    },
    
    // Tipo de transacción
    type: {
        type: String,
        enum: [
            'add', 'deduct', 'refund', 'bonus', 'initial',
            'GENERATE_IMAGE', 'GENERATE_VIDEO', 
            'PURCHASE', 'ADMIN_ADD', 'ADMIN_DEDUCT',
            'DAILY_REWARD', 'REFERRAL_BONUS', 'REFERRAL_REWARD',
            'LEVEL_BONUS'
        ],
        required: true
    },
    
    // Descripción de la transacción
    description: {
        type: String,
        required: true
    },
    
    // Saldo antes de la transacción
    balanceBefore: {
        type: Number,
        required: true
    },
    
    // Saldo después de la transacción
    balanceAfter: {
        type: Number,
        required: true
    },
    
    // Metadata adicional
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    
    // Acción específica que causó la transacción (si aplica)
    action: {
        type: String,
        enum: ['generate_image', 'generate_video', 'generate_text', 'manual_add', 'purchase', 'registration', 'other'],
        default: 'other'
    },
    
    // Referencia al elemento relacionado (ej: ID de imagen generada)
    relatedTo: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'relatedModel'
    },
    
    // Modelo relacionado
    relatedModel: {
        type: String,
        enum: ['Image', 'Video', 'Purchase']
    },
    
    // Usuario administrador que realizó la acción (para transacciones manuales)
    adminUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    
    // Fecha de la transacción
    createdAt: {
        type: Date,
        default: Date.now,
        index: true
    }
});

// Índice compuesto para búsquedas por usuario y fecha
creditTransactionSchema.index({ userId: 1, createdAt: -1 });

// Índice para búsquedas por tipo de transacción
creditTransactionSchema.index({ type: 1 });

/**
 * Método estático para crear una transacción y actualizar el usuario
 * @param {ObjectId} userId - ID del usuario
 * @param {Number} amount - Cantidad de créditos (positivo o negativo)
 * @param {String} type - Tipo de transacción
 * @param {String} description - Descripción
 * @param {Object} options - Opciones adicionales (action, relatedTo, adminUser)
 */
creditTransactionSchema.statics.createTransaction = async function(userId, amount, type, description, options = {}) {
    const User = mongoose.model('User');
    
    // Obtener usuario actual
    const user = await User.findById(userId);
    if (!user) {
        throw new Error('Usuario no encontrado');
    }
    
    // Calcular nuevo saldo
    const newBalance = user.credits + amount;
    
    // No permitir saldo negativo
    if (newBalance < 0) {
        throw new Error('No tienes créditos suficientes para esta acción');
    }
    
    // Actualizar créditos del usuario
    user.credits = newBalance;
    await user.save();
    
    // Crear registro de transacción
    const transaction = await this.create({
        userId,
        amount,
        type,
        description,
        balanceAfter: newBalance,
        action: options.action || 'other',
        relatedTo: options.relatedTo,
        relatedModel: options.relatedModel,
        adminUser: options.adminUser
    });
    
    return { transaction, newBalance };
};

/**
 * Método estático para obtener el historial de un usuario
 * @param {ObjectId} userId - ID del usuario
 * @param {Object} options - Opciones de paginación
 */
creditTransactionSchema.statics.getUserHistory = async function(userId, options = {}) {
    const { limit = 50, skip = 0 } = options;
    
    const transactions = await this.find({ userId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip)
        .populate('adminUser', 'name email')
        .lean();
    
    const total = await this.countDocuments({ userId });
    
    return { transactions, total };
};

/**
 * Método estático para obtener estadísticas de créditos de un usuario
 * @param {ObjectId} userId - ID del usuario
 */
creditTransactionSchema.statics.getUserStats = async function(userId) {
    const stats = await this.aggregate([
        { $match: { userId: mongoose.Types.ObjectId(userId) } },
        {
            $group: {
                _id: '$type',
                total: { $sum: '$amount' },
                count: { $sum: 1 }
            }
        }
    ]);
    
    const User = mongoose.model('User');
    const user = await User.findById(userId);
    
    return {
        currentBalance: user ? user.credits : 0,
        stats: stats.reduce((acc, stat) => {
            acc[stat._id] = {
                total: stat.total,
                count: stat.count
            };
            return acc;
        }, {})
    };
};

module.exports = mongoose.model('CreditTransaction', creditTransactionSchema);
