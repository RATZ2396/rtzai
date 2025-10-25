const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Image = require('../models/Image');
const User = require('../models/User');

// GET /api/community/explore - Obtener imágenes públicas de la comunidad
router.get('/explore', async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 20, 
            sortBy = 'createdAt', // createdAt, likesCount, views
            timeframe = 'all' // all, today, week, month
        } = req.query;
        
        const skip = (page - 1) * limit;
        
        // Filtro de tiempo
        let dateFilter = {};
        if (timeframe !== 'all') {
            const now = new Date();
            switch(timeframe) {
                case 'today':
                    dateFilter.createdAt = { $gte: new Date(now.setHours(0,0,0,0)) };
                    break;
                case 'week':
                    dateFilter.createdAt = { $gte: new Date(now.setDate(now.getDate() - 7)) };
                    break;
                case 'month':
                    dateFilter.createdAt = { $gte: new Date(now.setMonth(now.getMonth() - 1)) };
                    break;
            }
        }
        
        const sortOptions = {};
        if (sortBy === 'trending') {
            // Trending: combina likes recientes y vistas
            sortOptions.likesCount = -1;
            sortOptions.views = -1;
        } else {
            sortOptions[sortBy] = -1;
        }
        
        const images = await Image.find({ isPublic: true, ...dateFilter })
            .sort(sortOptions)
            .skip(skip)
            .limit(parseInt(limit))
            .populate('user', 'name picture level levelName')
            .select('-likes.user');
        
        const total = await Image.countDocuments({ isPublic: true, ...dateFilter });
        
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
        console.error('Error obteniendo comunidad:', error);
        res.status(500).json({ error: 'Error al obtener imágenes de la comunidad' });
    }
});

// GET /api/community/trending - Obtener imágenes en tendencia
router.get('/trending', async (req, res) => {
    try {
        const { limit = 10 } = req.query;
        
        // Imágenes de las últimas 48 horas con más likes
        const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
        
        const images = await Image.find({
            isPublic: true,
            createdAt: { $gte: twoDaysAgo }
        })
            .sort({ likesCount: -1, views: -1 })
            .limit(parseInt(limit))
            .populate('user', 'name picture level levelName')
            .select('-likes.user');
        
        res.json({ images });
    } catch (error) {
        console.error('Error obteniendo trending:', error);
        res.status(500).json({ error: 'Error al obtener imágenes en tendencia' });
    }
});

// GET /api/community/top-creators - Obtener mejores creadores
router.get('/top-creators', async (req, res) => {
    try {
        const { limit = 10, timeframe = 'all' } = req.query;
        
        const topCreators = await User.find({
            'preferences.publicProfile': true
        })
            .sort({ 
                'stats.communityLikes': -1,
                totalImagesGenerated: -1
            })
            .limit(parseInt(limit))
            .select('name picture level levelName stats.communityLikes totalImagesGenerated');
        
        res.json({ creators: topCreators });
    } catch (error) {
        console.error('Error obteniendo top creators:', error);
        res.status(500).json({ error: 'Error al obtener mejores creadores' });
    }
});

// GET /api/community/user/:userId - Obtener perfil público de usuario
router.get('/user/:userId', async (req, res) => {
    try {
        const user = await User.findById(req.params.userId)
            .select('name picture level levelName stats.communityLikes totalImagesGenerated createdAt preferences.publicProfile');
        
        if (!user || !user.preferences.publicProfile) {
            return res.status(404).json({ error: 'Perfil no encontrado o no público' });
        }
        
        // Obtener imágenes públicas del usuario
        const images = await Image.find({
            user: req.params.userId,
            isPublic: true
        })
            .sort({ createdAt: -1 })
            .limit(20)
            .select('-likes.user');
        
        res.json({
            user,
            images
        });
    } catch (error) {
        console.error('Error obteniendo perfil público:', error);
        res.status(500).json({ error: 'Error al obtener perfil público' });
    }
});

// GET /api/community/image/:id - Obtener imagen pública con detalles
router.get('/image/:id', async (req, res) => {
    try {
        const image = await Image.findById(req.params.id)
            .populate('user', 'name picture level levelName');
        
        if (!image || !image.isPublic) {
            return res.status(404).json({ error: 'Imagen no encontrada' });
        }
        
        // Incrementar vistas
        image.incrementViews();
        await image.save();
        
        res.json({ image });
    } catch (error) {
        console.error('Error obteniendo imagen:', error);
        res.status(500).json({ error: 'Error al obtener imagen' });
    }
});

module.exports = router;
