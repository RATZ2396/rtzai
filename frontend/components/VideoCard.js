function createVideoCard(video) {
    const date = new Date(video.createdAt).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });

    // Mapeo de proveedores de IA a nombres amigables
    const aiProviderNames = {
        'huggingface': 'Stable Diffusion XL',
        'openai': 'DALL-E 3',
        'midjourney': 'Midjourney',
        'leonardo': 'Leonardo AI',
        'flux': 'Flux Pro'
    };

    const aiProviderLabel = aiProviderNames[video.aiProvider] || video.aiProvider || 'IA';

    return `
        <div class="video-card">
            <div class="video-wrapper">
                <img src="${video.url}" alt="${video.prompt}">
            </div>
            <div class="video-info">
                <p class="video-prompt">${video.prompt}</p>
                <div class="video-meta">
                    <span>${date}</span>
                    <span>🤖 ${aiProviderLabel} • ${video.quality.toUpperCase()}</span>
                </div>
                <div class="video-actions">
                    <button id="download-${video.id}" class="btn-download">
                        📥 Descargar
                    </button>
                    <button id="delete-${video.id}" class="btn-delete">
                        🗑️ Eliminar
                    </button>
                </div>
            </div>
        </div>
    `;
}
