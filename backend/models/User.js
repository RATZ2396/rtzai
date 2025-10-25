const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'El email es requerido'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Por favor ingresa un email válido']
    },
    password: {
        type: String,
        required: function() {
            // Solo requerido si no es usuario de OAuth
            return !this.googleId;
        },
        minlength: [6, 'La contraseña debe tener al menos 6 caracteres']
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true // Permite null y mantiene unique
    },
    provider: {
        type: String,
        enum: ['local', 'google', 'discord', 'github'],
        default: 'local'
    },
    discordId: {
        type: String,
        unique: true,
        sparse: true
    },
    githubId: {
        type: String,
        unique: true,
        sparse: true
    },
    picture: {
        type: String // URL de la foto de perfil de Google
    },
    name: {
        type: String,
        required: [true, 'El nombre es requerido'],
        trim: true
    },
    credits: {
        type: Number,
        default: 50 // 50 créditos gratis al registrarse
    },
    hdUsesRemaining: {
        type: Number,
        default: 5 // 5 usos HD gratis
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    // Sistema de niveles
    level: {
        type: Number,
        default: 1
    },
    levelName: {
        type: String,
        enum: ['Básico', 'Artista', 'Pro', 'Maestro', 'Leyenda'],
        default: 'Básico'
    },
    totalImagesGenerated: {
        type: Number,
        default: 0
    },
    // Sistema de referidos
    referralCode: {
        type: String,
        unique: true,
        index: true
    },
    referredBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    referralCount: {
        type: Number,
        default: 0
    },
    referralEarnings: {
        type: Number,
        default: 0
    },
    // Recompensas diarias
    lastDailyReward: {
        type: Date
    },
    dailyStreakDays: {
        type: Number,
        default: 0
    },
    totalDailyRewards: {
        type: Number,
        default: 0
    },
    // Configuraciones de usuario
    preferences: {
        theme: {
            type: String,
            enum: ['dark', 'light'],
            default: 'dark'
        },
        notifications: {
            type: Boolean,
            default: true
        },
        publicProfile: {
            type: Boolean,
            default: false
        }
    },
    // Estadísticas
    stats: {
        totalCreditsSpent: {
            type: Number,
            default: 0
        },
        favoriteImages: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Image'
        }],
        communityLikes: {
            type: Number,
            default: 0
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    lastLogin: {
        type: Date
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Generar código de referido único
userSchema.pre('save', async function(next) {
    if (this.isNew && !this.referralCode) {
        this.referralCode = generateReferralCode();
    }
    next();
});

// Función para generar código de referido
function generateReferralCode() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
        code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return code;
}

// Hash de contraseña antes de guardar
userSchema.pre('save', async function(next) {
    // Solo hashear si la contraseña fue modificada y existe
    if (!this.isModified('password') || !this.password) return next();
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Método para comparar contraseñas
userSchema.methods.comparePassword = async function(candidatePassword) {
    // Si no hay password (usuario de Google), retornar false
    if (!this.password) return false;
    return await bcrypt.compare(candidatePassword, this.password);
};

// Método para obtener usuario sin contraseña
userSchema.methods.toJSON = function() {
    const user = this.toObject();
    delete user.password;
    return user;
};

// Método para calcular nivel basado en imágenes generadas
userSchema.methods.updateLevel = function() {
    const images = this.totalImagesGenerated;
    
    if (images >= 500) {
        this.level = 5;
        this.levelName = 'Leyenda';
    } else if (images >= 200) {
        this.level = 4;
        this.levelName = 'Maestro';
    } else if (images >= 75) {
        this.level = 3;
        this.levelName = 'Pro';
    } else if (images >= 25) {
        this.level = 2;
        this.levelName = 'Artista';
    } else {
        this.level = 1;
        this.levelName = 'Básico';
    }
};

// Método para verificar si puede reclamar recompensa diaria
userSchema.methods.canClaimDailyReward = function() {
    if (!this.lastDailyReward) return true;
    
    const now = new Date();
    const lastReward = new Date(this.lastDailyReward);
    const hoursSinceLastReward = (now - lastReward) / (1000 * 60 * 60);
    
    return hoursSinceLastReward >= 20; // 20 horas para dar margen
};

// Método para agregar imagen a favoritos
userSchema.methods.addFavorite = function(imageId) {
    if (!this.stats.favoriteImages.includes(imageId)) {
        this.stats.favoriteImages.push(imageId);
    }
};

// Método para remover imagen de favoritos
userSchema.methods.removeFavorite = function(imageId) {
    this.stats.favoriteImages = this.stats.favoriteImages.filter(
        id => id.toString() !== imageId.toString()
    );
};

module.exports = mongoose.model('User', userSchema);
