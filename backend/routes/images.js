const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Image = require('../models/Image');
const User = require('../models/User');

// GET /api/images/history - Obtener historial completo de imágenes del usuario
router.get('/history', auth, async (req, res) => {
    try {
        const { page = 1, limit = 20, sortBy = 'createdAt', order = 'desc' } = req.query;
        
        const skip = (page - 1) * limit;
        const sortOrder = order === 'asc' ? 1 : -1;
        
        const images = await Image.find({ user: req.user._id })
            .sort({ [sortBy]: sortOrder })
            .skip(skip)
            .limit(parseInt(limit))
            .select('-likes.user'); // No enviar lista completa de usuarios que dieron like
        
        const total = await Image.countDocuments({ user: req.user._id });
        
        res.json({
            images,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Error obteniendo historial:', error);
        res.status(500).json({ error: 'Error al obtener el historial' });
    }
});

// GET /api/images/favorites - Obtener imágenes favoritas del usuario
router.get('/favorites', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate({
            path: 'stats.favoriteImages',
            model: 'Image',
            options: { sort: { createdAt: -1 } }
        });
        
        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        
        res.json({ images: user.stats.favoriteImages || [] });
    } catch (error) {
        console.error('Error obteniendo favoritos:', error);
        res.status(500).json({ error: 'Error al obtener favoritos' });
    }
});

// POST /api/images/:id/favorite - Agregar imagen a favoritos
router.post('/:id/favorite', auth, async (req, res) => {
    try {
        const image = await Image.findOne({ _id: req.params.id, user: req.user._id });
        
        if (!image) {
            return res.status(404).json({ error: 'Imagen no encontrada' });
        }
        
        const user = await User.findById(req.user._id);
        user.addFavorite(image._id);
        await user.save();
        
        res.json({ 
            message: 'Imagen agregada a favoritos',
            isFavorite: true
        });
    } catch (error) {
        console.error('Error agregando a favoritos:', error);
        res.status(500).json({ error: 'Error al agregar a favoritos' });
    }
});

// DELETE /api/images/:id/favorite - Remover imagen de favoritos
router.delete('/:id/favorite', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        user.removeFavorite(req.params.id);
        await user.save();
        
        res.json({ 
            message: 'Imagen removida de favoritos',
            isFavorite: false
        });
    } catch (error) {
        console.error('Error removiendo de favoritos:', error);
        res.status(500).json({ error: 'Error al remover de favoritos' });
    }
});

// POST /api/images/:id/like - Dar like a una imagen
router.post('/:id/like', auth, async (req, res) => {
    try {
        const image = await Image.findById(req.params.id);
        
        if (!image) {
            return res.status(404).json({ error: 'Imagen no encontrada' });
        }
        
        image.addLike(req.user._id);
        await image.save();
        
        // Actualizar contador de likes del creador si la imagen es pública
        if (image.isPublic && image.user.toString() !== req.user._id.toString()) {
            await User.findByIdAndUpdate(image.user, {
                $inc: { 'stats.communityLikes': 1 }
            });
        }
        
        res.json({ 
            message: 'Like agregado',
            likesCount: image.likesCount,
            hasLiked: true
        });
    } catch (error) {
        console.error('Error agregando like:', error);
        res.status(500).json({ error: 'Error al agregar like' });
    }
});

// DELETE /api/images/:id/like - Quitar like de una imagen
router.delete('/:id/like', auth, async (req, res) => {
    try {
        const image = await Image.findById(req.params.id);
        
        if (!image) {
            return res.status(404).json({ error: 'Imagen no encontrada' });
        }
        
        const hadLiked = image.hasUserLiked(req.user._id);
        image.removeLike(req.user._id);
        await image.save();
        
        // Actualizar contador de likes del creador si la imagen es pública
        if (image.isPublic && hadLiked && image.user.toString() !== req.user._id.toString()) {
            await User.findByIdAndUpdate(image.user, {
                $inc: { 'stats.communityLikes': -1 }
            });
        }
        
        res.json({ 
            message: 'Like removido',
            likesCount: image.likesCount,
            hasLiked: false
        });
    } catch (error) {
        console.error('Error removiendo like:', error);
        res.status(500).json({ error: 'Error al remover like' });
    }
});

// PATCH /api/images/:id/visibility - Cambiar visibilidad de imagen
router.patch('/:id/visibility', auth, async (req, res) => {
    try {
        const { isPublic } = req.body;
        
        const image = await Image.findOne({ _id: req.params.id, user: req.user._id });
        
        if (!image) {
            return res.status(404).json({ error: 'Imagen no encontrada' });
        }
        
        image.isPublic = isPublic;
        await image.save();
        
        res.json({ 
            message: `Imagen ${isPublic ? 'publicada' : 'privada'} exitosamente`,
            isPublic: image.isPublic
        });
    } catch (error) {
        console.error('Error cambiando visibilidad:', error);
        res.status(500).json({ error: 'Error al cambiar visibilidad' });
    }
});

// POST /api/images/:id/share - Registrar compartido en redes sociales
router.post('/:id/share', auth, async (req, res) => {
    try {
        const { platform } = req.body; // twitter, facebook, reddit, instagram
        
        const image = await Image.findOne({ _id: req.params.id, user: req.user._id });
        
        if (!image) {
            return res.status(404).json({ error: 'Imagen no encontrada' });
        }
        
        if (['twitter', 'facebook', 'reddit', 'instagram'].includes(platform)) {
            image.shares[platform] += 1;
            await image.save();
        }
        
        res.json({ 
            message: 'Compartido registrado',
            shares: image.shares
        });
    } catch (error) {
        console.error('Error registrando compartido:', error);
        res.status(500).json({ error: 'Error al registrar compartido' });
    }
});

module.exports = router;
