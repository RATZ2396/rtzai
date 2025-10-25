const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
    try {
        // Obtener token del header
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({ 
                error: 'No hay token de autenticación. Por favor inicia sesión.' 
            });
        }

        // Verificar token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'tu_secreto_jwt_super_seguro');

        // Buscar usuario
        const user = await User.findById(decoded.userId);

        if (!user) {
            return res.status(401).json({ 
                error: 'Usuario no encontrado. Token inválido.' 
            });
        }

        // Agregar usuario a la request
        req.user = user;
        req.token = token;

        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: 'Token inválido' });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token expirado. Por favor inicia sesión nuevamente.' });
        }
        res.status(401).json({ error: 'Error de autenticación' });
    }
};

module.exports = auth;
