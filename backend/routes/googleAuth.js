const express = require('express');
const router = express.Router();
const passport = require('../config/passport');
const jwt = require('jsonwebtoken');

// Iniciar autenticación con Google
router.get('/google', 
    passport.authenticate('google', { 
        scope: ['profile', 'email'],
        session: false
    })
);

// Callback de Google
router.get('/google/callback', 
    passport.authenticate('google', { 
        session: false,
        failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:8080'}/login.html?error=google_auth_failed`
    }),
    (req, res) => {
        try {
            // Generar JWT token
            const token = jwt.sign(
                { userId: req.user._id },
                process.env.JWT_SECRET,
                { expiresIn: '7d' }
            );

            // Redirigir al frontend con el token
            const frontendURL = process.env.FRONTEND_URL || 'http://localhost:8080';
            res.redirect(`${frontendURL}/google-callback.html?token=${token}`);
        } catch (error) {
            console.error('Error generando token:', error);
            res.redirect('/login.html?error=token_generation_failed');
        }
    }
);

module.exports = router;
