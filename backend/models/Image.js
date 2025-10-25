const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    prompt: {
        type: String,
        required: true
    },
    url: {
        type: String,
        required: true
    },
    aiProvider: {
        type: String,
        enum: ['huggingface', 'openai', 'midjourney', 'leonardo', 'flux'],
        default: 'huggingface'
    },
    quality: {
        type: String,
        enum: ['standard', 'hd', '4k'],
        default: 'hd'
    },
    creditsUsed: {
        type: Number,
        default: 1
    },
    // Sistema de comunidad
    isPublic: {
        type: Boolean,
        default: false
    },
    likes: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    likesCount: {
        type: Number,
        default: 0
    },
    views: {
        type: Number,
        default: 0
    },
    isFavorite: {
        type: Boolean,
        default: false
    },
    // Metadata adicional
    tags: [{
        type: String
    }],
    description: {
        type: String,
        maxlength: 500
    },
    // Compartido en redes sociales
    shares: {
        twitter: { type: Number, default: 0 },
        facebook: { type: Number, default: 0 },
        reddit: { type: Number, default: 0 },
        instagram: { type: Number, default: 0 }
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Método para agregar like
imageSchema.methods.addLike = function(userId) {
    const hasLiked = this.likes.some(like => like.user.toString() === userId.toString());
    
    if (!hasLiked) {
        this.likes.push({ user: userId });
        this.likesCount = this.likes.length;
    }
};

// Método para remover like
imageSchema.methods.removeLike = function(userId) {
    this.likes = this.likes.filter(like => like.user.toString() !== userId.toString());
    this.likesCount = this.likes.length;
};

// Método para verificar si un usuario dio like
imageSchema.methods.hasUserLiked = function(userId) {
    return this.likes.some(like => like.user.toString() === userId.toString());
};

// Método para incrementar vistas
imageSchema.methods.incrementViews = function() {
    this.views += 1;
};

// Índices para búsquedas rápidas
imageSchema.index({ user: 1, createdAt: -1 });
imageSchema.index({ isPublic: 1, likesCount: -1 });
imageSchema.index({ isPublic: 1, createdAt: -1 });
imageSchema.index({ tags: 1 });

// Middleware para actualizar updatedAt
imageSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Image', imageSchema);
