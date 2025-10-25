const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Configuración de proveedores de IA
const AI_PROVIDERS = {
    huggingface: {
        name: 'Stable Diffusion XL',
        free: true,
        model: 'stabilityai/stable-diffusion-xl-base-1.0'
    },
    openai: {
        name: 'DALL-E 3',
        free: false,
        creditsRequired: 10
    },
    midjourney: {
        name: 'Midjourney',
        free: false,
        creditsRequired: 15
    },
    leonardo: {
        name: 'Leonardo AI',
        free: false,
        creditsRequired: 12
    },
    flux: {
        name: 'Flux Pro',
        free: false,
        creditsRequired: 20
    }
};

// Configuración de calidades
const QUALITY_CONFIG = {
    standard: {
        name: 'Estándar',
        free: true,
        creditsRequired: 0
    },
    hd: {
        name: 'HD',
        free: true, // Gratis pero limitado a 5 usos
        freeUsesLimit: 5,
        creditsRequired: 0
    },
    '4k': {
        name: '4K Ultra',
        free: false,
        creditsRequired: 5
    }
};

async function generateVideo(prompt, imagePath = null, options = {}) {
    const { aiProvider = 'huggingface', quality = 'hd' } = options;

    console.log('🎨 Generando imagen con prompt:', prompt);
    console.log('⚙️ Proveedor:', aiProvider);
    console.log('⚙️ Calidad:', quality);

    // Verificar que el proveedor existe
    if (!AI_PROVIDERS[aiProvider]) {
        throw new Error(`Proveedor de IA '${aiProvider}' no soportado`);
    }

    const provider = AI_PROVIDERS[aiProvider];
    const qualityConfig = QUALITY_CONFIG[quality] || QUALITY_CONFIG.standard;
    
    console.log(`📡 Usando ${provider.name} ${provider.free ? '(Gratis)' : `(${provider.creditsRequired} créditos)`}`);
    console.log(`🎯 Calidad: ${qualityConfig.name} ${qualityConfig.free ? '(Gratis)' : `(${qualityConfig.creditsRequired} créditos)`}`);

    // Validar calidad 4K
    if (quality === '4k') {
        // TODO: Verificar que el usuario tenga créditos suficientes
        console.log('⚠️ 4K requiere 5 créditos - Sistema de créditos pendiente de implementar');
    }

    // Limpiar API keys de saltos de línea y espacios
    const hfKey = (process.env.HUGGINGFACE_API_KEY || '').replace(/[\r\n\s]/g, '');
    const openaiKey = (process.env.OPENAI_API_KEY || '').replace(/[\r\n\s]/g, '');

    // Enrutar según el proveedor seleccionado
    switch (aiProvider) {
        case 'huggingface':
            if (!hfKey || hfKey.length < 10) {
                throw new Error('API key de HuggingFace no configurada. Por favor configura HUGGINGFACE_API_KEY en el archivo .env');
            }
            return await generateWithHuggingFace(prompt, options, hfKey);

        case 'openai':
            if (!openaiKey || openaiKey.length < 10) {
                throw new Error('API key de OpenAI no configurada. Por favor configura OPENAI_API_KEY en el archivo .env');
            }
            // TODO: Verificar créditos del usuario antes de generar
            return await generateWithOpenAI(prompt, options, openaiKey);

        case 'midjourney':
            // TODO: Implementar integración con Midjourney
            throw new Error('Midjourney estará disponible próximamente. Por favor usa otro proveedor.');

        case 'leonardo':
            // TODO: Implementar integración con Leonardo AI
            throw new Error('Leonardo AI estará disponible próximamente. Por favor usa otro proveedor.');

        case 'flux':
            // TODO: Implementar integración con Flux Pro
            throw new Error('Flux Pro estará disponible próximamente. Por favor usa otro proveedor.');

        default:
            throw new Error(`Proveedor '${aiProvider}' no implementado`);
    }
}

// Generar imagen con HuggingFace (Stable Diffusion XL)
async function generateWithHuggingFace(prompt, options, apiKey) {
    const API_URL = 'https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0';
    
    try {
        console.log('📡 Enviando petición a HuggingFace...');
        console.log('🔑 Usando key:', `${apiKey.substring(0, 10)}...`);
        
        const response = await axios.post(
            API_URL,
            { inputs: prompt },
            {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Accept': 'image/png'
                },
                responseType: 'arraybuffer',
                timeout: 60000
            }
        );

        console.log('✅ Respuesta recibida de HuggingFace');
        console.log('📊 Status:', response.status);
        console.log('📦 Tamaño de datos:', response.data.length, 'bytes');

        const buffer = Buffer.from(response.data);
        const filename = `generated-${Date.now()}.png`;
        const uploadsDir = path.join(__dirname, '..', 'uploads');
        const filepath = path.join(uploadsDir, filename);
        
        // Asegurar que el directorio existe
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
        }
        
        fs.writeFileSync(filepath, buffer);
        console.log('💾 Imagen guardada en:', filepath);

        return {
            url: `http://localhost:3000/uploads/${filename}`,
            type: 'image'
        };
    } catch (error) {
        console.error('❌ ERROR DETALLADO DE HUGGINGFACE:');
        console.error('Status:', error.response?.status);
        console.error('Status Text:', error.response?.statusText);
        console.error('Headers:', error.response?.headers);
        
        if (error.response?.data) {
            // Convertir buffer a string si es necesario
            let errorData = error.response.data;
            if (Buffer.isBuffer(errorData)) {
                errorData = errorData.toString('utf-8');
            }
            console.error('Mensaje de error:', errorData);
        }
        
        console.error('Mensaje original:', error.message);
        
        // Mensaje amigable para el usuario según el tipo de error
        let userMessage = 'Error al generar la imagen. Por favor intenta nuevamente.';
        
        if (error.response?.status === 401 || error.response?.status === 403) {
            userMessage = 'Error de autenticación con el servicio de IA. Por favor contacta al administrador.';
        } else if (error.response?.status === 503 || error.response?.status === 500) {
            userMessage = 'El servicio de IA está temporalmente no disponible. Por favor intenta en unos minutos.';
        } else if (error.response?.status === 429) {
            userMessage = 'Demasiadas solicitudes. Por favor espera un momento antes de intentar nuevamente.';
        } else if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
            userMessage = 'La generación está tomando demasiado tiempo. Por favor intenta nuevamente.';
        } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
            userMessage = 'No se pudo conectar con el servicio de IA. Verifica tu conexión a internet.';
        }
        
        throw new Error(userMessage);
    }
}

// Generar imagen con OpenAI (DALL-E 3)
async function generateWithOpenAI(prompt, options, apiKey) {
    try {
        // Determinar tamaño según calidad
        let size = '1024x1024';
        if (options.quality === '4k') {
            size = '1792x1024'; // Tamaño más grande disponible en DALL-E 3
        }

        const response = await axios.post(
            'https://api.openai.com/v1/images/generations',
            {
                model: 'dall-e-3',
                prompt: prompt,
                n: 1,
                size: size,
                quality: options.quality === 'standard' ? 'standard' : 'hd'
            },
            {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                timeout: 60000
            }
        );

        console.log('✅ Imagen generada con OpenAI DALL-E 3');
        
        // TODO: Descontar créditos del usuario aquí
        console.log('💳 Se deberían descontar 10 créditos (implementar sistema de créditos)');
        
        return {
            url: response.data.data[0].url,
            type: 'image'
        };
    } catch (error) {
        console.error('❌ Error detallado de OpenAI:');
        console.error('Status:', error.response?.status);
        console.error('Mensaje:', error.response?.data?.error?.message || error.message);
        console.error('Detalles:', JSON.stringify(error.response?.data, null, 2));
        throw new Error(error.response?.data?.error?.message || 'Error al generar imagen con OpenAI');
    }
}

module.exports = { generateVideo, AI_PROVIDERS, QUALITY_CONFIG };
