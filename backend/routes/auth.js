const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');

// POST /api/register - Registrar nuevo usuario
router.post('/register', async (req, res) => {
    try {
        const { email, password, name } = req.body;

        // Validar datos
        if (!email || !password || !name) {
            return res.status(400).json({ 
                error: 'Por favor completa todos los campos' 
            });
        }

        // Verificar si el usuario ya existe
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ 
                error: 'Este email ya está registrado' 
            });
        }

        // Crear nuevo usuario
        const user = new User({
            email,
            password,
            name
        });

        await user.save();

        // Generar token JWT
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET || 'tu_secreto_jwt_super_seguro',
            { expiresIn: '7d' }
        );

        console.log(`✅ Nuevo usuario registrado: ${email}`);

        res.status(201).json({
            message: 'Usuario registrado exitosamente',
            token,
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                credits: user.credits,
                hdUsesRemaining: user.hdUsesRemaining
            }
        });

    } catch (error) {
        console.error('Error en registro:', error);
        res.status(500).json({ 
            error: 'Error al registrar usuario' 
        });
    }
});

// POST /api/login - Iniciar sesión
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validar datos
        if (!email || !password) {
            return res.status(400).json({ 
                error: 'Por favor ingresa email y contraseña' 
            });
        }

        // Buscar usuario
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ 
                error: 'Email o contraseña incorrectos' 
            });
        }

        // Verificar contraseña
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ 
                error: 'Email o contraseña incorrectos' 
            });
        }

        // Actualizar último login
        user.lastLogin = new Date();
        await user.save();

        // Generar token JWT
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET || 'tu_secreto_jwt_super_seguro',
            { expiresIn: '7d' }
        );

        console.log(`✅ Usuario inició sesión: ${email}`);

        res.json({
            message: 'Inicio de sesión exitoso',
            token,
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                credits: user.credits,
                hdUsesRemaining: user.hdUsesRemaining
            }
        });

    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ 
            error: 'Error al iniciar sesión' 
        });
    }
});

// GET /api/user - Obtener datos del usuario autenticado
router.get('/user', auth, async (req, res) => {
    try {
        res.json({
            user: {
                id: req.user._id,
                email: req.user.email,
                name: req.user.name,
                credits: req.user.credits,
                hdUsesRemaining: req.user.hdUsesRemaining,
                createdAt: req.user.createdAt
            }
        });
    } catch (error) {
        console.error('Error obteniendo usuario:', error);
        res.status(500).json({ 
            error: 'Error al obtener datos del usuario' 
        });
    }
});

// POST /api/logout - Cerrar sesión (opcional, el frontend solo elimina el token)
router.post('/logout', auth, async (req, res) => {
    try {
        // En una implementación más compleja, podrías agregar el token a una lista negra
        console.log(`✅ Usuario cerró sesión: ${req.user.email}`);
        
        res.json({ 
            message: 'Sesión cerrada exitosamente' 
        });
    } catch (error) {
        console.error('Error en logout:', error);
        res.status(500).json({ 
            error: 'Error al cerrar sesión' 
        });
    }
});

module.exports = router;
