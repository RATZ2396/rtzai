const { validateCredits, calculateActionCost } = require('../config/creditConfig');

/**
 * Middleware para verificar si el usuario tiene créditos suficientes
 * antes de ejecutar una acción de IA
 * 
 * Uso:
 * app.post('/api/generate', auth, checkCredits('GENERATE_IMAGE'), async (req, res) => { ... });
 * 
 * @param {String} action - Tipo de acción (ej: 'GENERATE_IMAGE')
 * @returns {Function} Middleware function
 */
function checkCredits(action) {
    return async (req, res, next) => {
        try {
            // Verificar que el usuario esté autenticado
            if (!req.user) {
                return res.status(401).json({ 
                    error: 'Usuario no autenticado',
                    code: 'UNAUTHORIZED'
                });
            }

            // Obtener parámetros de la solicitud
            const { aiProvider = 'huggingface', quality = 'standard' } = req.body;
            
            // Validar créditos
            const validation = validateCredits(
                req.user.credits,
                action,
                aiProvider,
                quality
            );

            // Si no tiene suficientes créditos, rechazar
            if (!validation.hasEnough) {
                return res.status(403).json({
                    error: 'No tienes créditos suficientes para esta acción',
                    code: 'INSUFFICIENT_CREDITS',
                    details: {
                        currentCredits: req.user.credits,
                        requiredCredits: validation.cost,
                        missingCredits: validation.missing,
                        action: validation.description
                    }
                });
            }

            // Guardar el costo en la request para usarlo después
            req.creditCost = validation.cost;
            req.creditDescription = validation.description;
            
            // Continuar con la siguiente función
            next();
            
        } catch (error) {
            console.error('Error en middleware checkCredits:', error);
            res.status(500).json({ 
                error: 'Error al verificar créditos',
                code: 'CREDIT_CHECK_ERROR'
            });
        }
    };
}

/**
 * Middleware para verificar créditos con parámetros dinámicos
 * Útil cuando el tipo de acción depende de la petición
 */
function checkDynamicCredits() {
    return async (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({ 
                    error: 'Usuario no autenticado',
                    code: 'UNAUTHORIZED'
                });
            }

            // Obtener parámetros de la solicitud
            const { 
                action, 
                aiProvider = 'huggingface', 
                quality = 'standard' 
            } = req.body;

            if (!action) {
                return res.status(400).json({
                    error: 'Tipo de acción no especificado',
                    code: 'ACTION_REQUIRED'
                });
            }

            // Calcular costo
            const cost = calculateActionCost(action, aiProvider, quality);

            // Verificar si tiene suficientes créditos
            if (req.user.credits < cost) {
                return res.status(403).json({
                    error: 'No tienes créditos suficientes para esta acción',
                    code: 'INSUFFICIENT_CREDITS',
                    details: {
                        currentCredits: req.user.credits,
                        requiredCredits: cost,
                        missingCredits: cost - req.user.credits
                    }
                });
            }

            // Guardar el costo en la request
            req.creditCost = cost;
            
            next();
            
        } catch (error) {
            console.error('Error en middleware checkDynamicCredits:', error);
            res.status(500).json({ 
                error: 'Error al verificar créditos',
                code: 'CREDIT_CHECK_ERROR'
            });
        }
    };
}

/**
 * Middleware solo para administradores
 * Verifica que el usuario tenga rol de admin
 */
function isAdmin(req, res, next) {
    try {
        if (!req.user) {
            return res.status(401).json({ 
                error: 'Usuario no autenticado',
                code: 'UNAUTHORIZED'
            });
        }

        // Verificar si el usuario es admin
        // (Puedes ajustar esto según tu implementación de roles)
        if (req.user.role !== 'admin' && req.user.email !== process.env.ADMIN_EMAIL) {
            return res.status(403).json({ 
                error: 'Acceso denegado. Solo administradores pueden realizar esta acción.',
                code: 'ADMIN_REQUIRED'
            });
        }

        next();
        
    } catch (error) {
        console.error('Error en middleware isAdmin:', error);
        res.status(500).json({ 
            error: 'Error al verificar permisos',
            code: 'PERMISSION_CHECK_ERROR'
        });
    }
}

module.exports = {
    checkCredits,
    checkDynamicCredits,
    isAdmin
};
