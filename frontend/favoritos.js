// Cargar favoritos
document.addEventListener('DOMContentLoaded', async () => {
    if (!checkAuth()) return;
    
    document.getElementById('navbar-container').innerHTML = createNavbar();
    document.getElementById('footer-container').innerHTML = createFooter();
    
    await loadFavorites();
});

async function loadFavorites() {
    try {
        const response = await fetch(`${API_URL}/api/images/favorites`, {
            headers: getAuthHeaders()
        });
        
        if (!response.ok) throw new Error('Error al cargar favoritos');
        
        const data = await response.json();
        const favorites = data.images || [];
        
        document.getElementById('loading').style.display = 'none';
        
        if (favorites.length === 0) {
            document.getElementById('no-favorites').style.display = 'block';
            document.getElementById('favorites-gallery').style.display = 'none';
            return;
        }
        
        document.getElementById('no-favorites').style.display = 'none';
        document.getElementById('favorites-gallery').style.display = 'grid';
        
        displayFavorites(favorites);
    } catch (error) {
        console.error('Error cargando favoritos:', error);
        document.getElementById('loading').style.display = 'none';
        showToast('Error al cargar favoritos', 'error');
    }
}

function displayFavorites(favorites) {
    const gallery = document.getElementById('favorites-gallery');
    gallery.innerHTML = '';
    
    favorites.forEach(image => {
        const card = createFavoriteCard(image);
        gallery.appendChild(card);
    });
}

function createFavoriteCard(image) {
    const card = document.createElement('div');
    card.className = 'image-card';
    
    card.innerHTML = `
        <div class="video-wrapper">
            <img src="${image.url}" alt="${image.prompt}" loading="lazy">
        </div>
        <div class="video-info">
            <p class="video-prompt">${image.prompt}</p>
            <div class="video-meta">
                <span>🤖 ${getProviderName(image.aiProvider)}</span>
                <span>📐 ${image.quality.toUpperCase()}</span>
            </div>
            <div class="video-meta">
                <span>📅 ${formatDate(image.createdAt)}</span>
                <span>👁️ ${image.views || 0} vistas</span>
            </div>
            <div class="action-buttons">
                <button class="btn-icon btn-favorite active" 
                        onclick="removeFavorite('${image._id}')" 
                        title="Quitar de favoritos">
                    ❤️
                </button>
                <button class="btn-download" onclick="downloadImage('${image.url}', '${image.prompt}')">
                    ⬇️ Descargar
                </button>
            </div>
        </div>
    `;
    
    return card;
}

async function removeFavorite(imageId) {
    try {
        const response = await fetch(`${API_URL}/api/images/${imageId}/favorite`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        
        if (!response.ok) throw new Error('Error al quitar favorito');
        
        await refreshUserData();
        await loadFavorites();
        
        showToast('Quitado de favoritos', 'success');
    } catch (error) {
        console.error('Error:', error);
        showToast('Error al quitar favorito', 'error');
    }
}

function getProviderName(provider) {
    const names = {
        'huggingface': 'SD XL',
        'openai': 'DALL-E 3',
        'midjourney': 'Midjourney',
        'leonardo': 'Leonardo AI',
        'flux': 'Flux Pro'
    };
    return names[provider] || provider;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
        day: 'numeric', 
        month: 'short', 
        year: 'numeric' 
    });
}

function downloadImage(url, prompt) {
    const link = document.createElement('a');
    link.href = url;
    link.download = `rtzai-${prompt.substring(0, 30).replace(/[^a-z0-9]/gi, '-')}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}
