const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3000/api/auth/google/callback'
},
async (accessToken, refreshToken, profile, done) => {
    try {
        // Buscar si ya existe un usuario con este googleId
        let user = await User.findOne({ googleId: profile.id });

        if (user) {
            // Usuario existente - actualizar última conexión
            user.lastLogin = new Date();
            await user.save();
            return done(null, user);
        }

        // Verificar si existe un usuario con el mismo email
        user = await User.findOne({ email: profile.emails[0].value });

        if (user) {
            // Vincular cuenta de Google con cuenta existente
            user.googleId = profile.id;
            user.provider = 'google';
            user.picture = profile.photos[0]?.value;
            user.lastLogin = new Date();
            await user.save();
            return done(null, user);
        }

        // Crear nuevo usuario
        user = await User.create({
            googleId: profile.id,
            email: profile.emails[0].value,
            name: profile.displayName,
            picture: profile.photos[0]?.value,
            provider: 'google',
            credits: 5, // 5 créditos gratis al registrarse
            lastLogin: new Date()
        });

        done(null, user);
    } catch (error) {
        console.error('Error en autenticación con Google:', error);
        done(error, null);
    }
}));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

module.exports = passport;
