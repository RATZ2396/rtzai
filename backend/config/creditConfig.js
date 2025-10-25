/**
 * Configuración centralizada de costos de créditos
 * 
 * Este archivo define cuántos créditos cuesta cada acción en la plataforma.
 * Puedes modificar estos valores fácilmente sin tocar el código principal.
 */

// Costos por tipo de acción
const ACTION_COSTS = {
    // Generación de imágenes
    GENERATE_IMAGE: 1,
    
    // Generación de videos
    GENERATE_VIDEO: 5,
    
    // Generación de texto/prompts con IA
    GENERATE_TEXT: 0.5,
    
    // Mejorar calidad de imagen
    UPSCALE_IMAGE: 2,
    
    // Variaciones de imagen
    IMAGE_VARIATION: 1.5
};

// Costos adicionales según el proveedor de IA
const PROVIDER_COSTS = {
    huggingface: 0,        // Gratis (usando modelo base)
    openai: 10,            // DALL-E 3 cuesta más
    midjourney: 15,        // Premium
    leonardo: 12,          // Premium
    flux: 20               // Premium alto
};

// Costos adicionales según la calidad
const QUALITY_COSTS = {
    standard: 0,           // Sin costo adicional
    hd: 0,                 // Sin costo adicional (pero limitado)
    '4k': 5                // Calidad premium
};

// Créditos iniciales al registrarse
const INITIAL_CREDITS = 50;

// Créditos gratis por día (para usuarios activos)
const DAILY_FREE_CREDITS = 5;

// Límite de créditos gratuitos que puede acumular un usuario
const MAX_FREE_CREDITS = 100;

// Planes de compra de créditos (para futuro uso con pagos)
const CREDIT_PLANS = [
    {
        id: 'starter',
        name: 'Plan Starter',
        credits: 100,
        price: 5,
        currency: 'USD',
        description: 'Perfecto para comenzar',
        popular: false
    },
    {
        id: 'basic',
        name: 'Plan Basic',
        credits: 250,
        price: 10,
        currency: 'USD',
        description: 'Para usuarios regulares',
        popular: true,
        savings: '20%'
    },
    {
        id: 'pro',
        name: 'Plan Pro',
        credits: 500,
        price: 18,
        currency: 'USD',
        description: 'Para usuarios avanzados',
        popular: false,
        savings: '28%'
    },
    {
        id: 'premium',
        name: 'Plan Premium',
        credits: 1000,
        price: 30,
        currency: 'USD',
        description: 'Máximo valor',
        popular: false,
        savings: '40%'
    }
];

/**
 * Calcula el costo total de una acción considerando todos los factores
 * @param {String} action - Tipo de acción (ej: 'GENERATE_IMAGE')
 * @param {String} provider - Proveedor de IA (opcional)
 * @param {String} quality - Calidad (opcional)
 * @returns {Number} Costo total en créditos
 */
function calculateActionCost(action, provider = 'huggingface', quality = 'standard') {
    let cost = ACTION_COSTS[action] || 0;
    
    // Agregar costo del proveedor si aplica
    if (provider && PROVIDER_COSTS[provider] !== undefined) {
        cost += PROVIDER_COSTS[provider];
    }
    
    // Agregar costo de calidad si aplica
    if (quality && QUALITY_COSTS[quality] !== undefined) {
        cost += QUALITY_COSTS[quality];
    }
    
    return cost;
}

/**
 * Obtiene la descripción de una acción
 * @param {String} action - Tipo de acción
 * @param {String} provider - Proveedor de IA
 * @param {String} quality - Calidad
 * @returns {String} Descripción legible
 */
function getActionDescription(action, provider = 'huggingface', quality = 'standard') {
    const cost = calculateActionCost(action, provider, quality);
    
    const descriptions = {
        GENERATE_IMAGE: `Generación de imagen con ${provider} (${quality})`,
        GENERATE_VIDEO: `Generación de video con ${provider} (${quality})`,
        GENERATE_TEXT: 'Generación de texto con IA',
        UPSCALE_IMAGE: 'Mejora de calidad de imagen',
        IMAGE_VARIATION: 'Generación de variación de imagen'
    };
    
    return descriptions[action] || 'Acción con IA';
}

/**
 * Valida si un usuario tiene créditos suficientes para una acción
 * @param {Number} userCredits - Créditos actuales del usuario
 * @param {String} action - Tipo de acción
 * @param {String} provider - Proveedor de IA
 * @param {String} quality - Calidad
 * @returns {Object} { hasEnough, cost, missing }
 */
function validateCredits(userCredits, action, provider = 'huggingface', quality = 'standard') {
    const cost = calculateActionCost(action, provider, quality);
    const hasEnough = userCredits >= cost;
    const missing = hasEnough ? 0 : cost - userCredits;
    
    return {
        hasEnough,
        cost,
        missing,
        description: getActionDescription(action, provider, quality)
    };
}

module.exports = {
    ACTION_COSTS,
    PROVIDER_COSTS,
    QUALITY_COSTS,
    INITIAL_CREDITS,
    DAILY_FREE_CREDITS,
    MAX_FREE_CREDITS,
    CREDIT_PLANS,
    calculateActionCost,
    getActionDescription,
    validateCredits
};
