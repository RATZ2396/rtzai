const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const session = require('express-session');
require('dotenv').config();

// Validar variables de entorno críticas antes de continuar
const validateEnv = require('./config/validateEnv');
validateEnv();

const connectDB = require('./config/database');
const passport = require('./config/passport');
const { generateVideo } = require('./utils/aiService');
const authRoutes = require('./routes/auth');
const googleAuthRoutes = require('./routes/googleAuth');
const creditsRoutes = require('./routes/credits');
const imagesRoutes = require('./routes/images');
const communityRoutes = require('./routes/community');
const userRoutes = require('./routes/user');
const auth = require('./middleware/auth');
const { checkCredits } = require('./middleware/checkCredits');
const { deductCreditsForAction, refundCredits } = require('./services/creditService');
const User = require('./models/User');
const Image = require('./models/Image');
const CreditTransaction = require('./models/CreditTransaction');

const app = express();
const PORT = process.env.PORT || 3000;

// Conectar a MongoDB
connectDB();

// Log del sistema de créditos
console.log('\n💰 ════════════════════════════════════════════════════════');
console.log('💰 SISTEMA DE CRÉDITOS CARGADO');
console.log('💰 ════════════════════════════════════════════════════════');
console.log('💰 ✅ Modelo CreditTransaction cargado');
console.log('💰 ✅ Rutas de créditos: /api/credits/*');
console.log('💰 ✅ Middleware checkCredits activo');
console.log('💰 ✅ Créditos iniciales: 50 por usuario');
console.log('💰 ✅ Costo generar imagen: 1 crédito');
console.log('💰 ✅ Costo generar video: 5 créditos');
console.log('💰 ════════════════════════════════════════════════════════\n');

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:8080',
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configurar sesiones (necesario para Passport)
app.use(session({
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // Cambiar a true en producción con HTTPS
}));

// Inicializar Passport
app.use(passport.initialize());
app.use(passport.session());

// Configurar almacenamiento de archivos
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, 'uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Solo se permiten imágenes'));
        }
    }
});

// Servir archivos estáticos
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rutas de autenticación
app.use('/api', authRoutes);
app.use('/api/auth', googleAuthRoutes);

// Rutas de créditos
app.use('/api/credits', creditsRoutes);

// Rutas de imágenes
app.use('/api/images', imagesRoutes);

// Rutas de comunidad
app.use('/api/community', communityRoutes);

// Rutas de usuario
app.use('/api/user', userRoutes);

// Rutas

// POST /api/generate - Generar imagen con IA (requiere autenticación)
app.post('/api/generate', auth, checkCredits('GENERATE_IMAGE'), upload.single('image'), async (req, res) => {
    let transaction = null;
    
    try {
        const { prompt, aiProvider = 'huggingface', quality = 'hd' } = req.body;
        const user = req.user;
        
        if (!prompt || prompt.trim() === '') {
            return res.status(400).json({ error: 'El prompt es requerido' });
        }

        console.log(`🎨 Usuario ${user.email} generando imagen con ${aiProvider}`);
        console.log('Prompt:', prompt);
        console.log(`💳 Costo: ${req.creditCost} créditos`);
        
        let imagePath = null;
        if (req.file) {
            imagePath = req.file.path;
        }

        // Descontar créditos ANTES de generar (con sistema de transacciones)
        const creditResult = await deductCreditsForAction(
            user._id,
            'GENERATE_IMAGE',
            aiProvider,
            quality
        );
        transaction = creditResult.transaction;
        
        // Llamar al servicio de IA
        const imageData = await generateVideo(prompt, imagePath, { aiProvider, quality });
        
        // Guardar imagen en la base de datos
        const newImage = new Image({
            user: user._id,
            prompt,
            url: imageData.url,
            aiProvider,
            quality,
            creditsUsed: creditResult.cost
        });
        
        await newImage.save();
        
        // Actualizar estadísticas del usuario
        user.totalImagesGenerated += 1;
        user.stats.totalCreditsSpent += creditResult.cost;
        user.updateLevel(); // Actualizar nivel basado en imágenes generadas
        await user.save();
        
        // Actualizar la transacción con la referencia a la imagen
        transaction.relatedTo = newImage._id;
        transaction.relatedModel = 'Image';
        await transaction.save();
        
        console.log(`✅ Imagen generada. Créditos restantes: ${creditResult.newBalance}`);
        
        res.json({
            id: newImage._id,
            prompt: newImage.prompt,
            url: newImage.url,
            aiProvider: newImage.aiProvider,
            quality: newImage.quality,
            createdAt: newImage.createdAt,
            creditsUsed: creditResult.cost,
            creditsRemaining: creditResult.newBalance
        });
        
    } catch (error) {
        console.error('Error al generar imagen:', error);
        
        // Si hubo un error después de descontar créditos, reembolsar
        if (transaction) {
            try {
                await refundCredits(
                    req.user._id,
                    Math.abs(transaction.amount),
                    'Error al generar imagen',
                    transaction._id
                );
                console.log('♻️ Créditos reembolsados por error');
            } catch (refundError) {
                console.error('Error al reembolsar créditos:', refundError);
            }
        }
        
        res.status(500).json({ 
            error: error.message || 'Error al generar la imagen'
        });
    }
});

// GET /api/images - Obtener imágenes del usuario autenticado
app.get('/api/images', auth, async (req, res) => {
    try {
        const images = await Image.find({ user: req.user._id })
            .sort({ createdAt: -1 })
            .limit(50);
        
        res.json(images);
    } catch (error) {
        console.error('Error obteniendo imágenes:', error);
        res.status(500).json({ 
            error: 'Error al obtener las imágenes' 
        });
    }
});

// DELETE /api/images/:id - Eliminar imagen del usuario
app.delete('/api/images/:id', auth, async (req, res) => {
    try {
        const image = await Image.findOne({ 
            _id: req.params.id, 
            user: req.user._id 
        });
        
        if (!image) {
            return res.status(404).json({ error: 'Imagen no encontrada' });
        }
        
        await image.deleteOne();
        res.json({ message: 'Imagen eliminada exitosamente' });
    } catch (error) {
        console.error('Error eliminando imagen:', error);
        res.status(500).json({ 
            error: 'Error al eliminar la imagen' 
        });
    }
});

// Manejo de errores
app.use((err, req, res, next) => {
    console.error('Error:', err);
    
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'El archivo es demasiado grande (máx 10MB)' });
        }
        return res.status(400).json({ error: err.message });
    }
    
    res.status(500).json({ 
        error: err.message || 'Error interno del servidor'
    });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    console.log('📹 Generador de videos con IA listo');
});
